/**
 * IDROP — Auto-fetch latest tweets per curated handle
 *
 * How this works:
 *   1. We hit Twitter's public syndication TIMELINE endpoint for each handle.
 *   2. We extract recent tweet IDs from the HTML response.
 *   3. We hand those IDs to react-tweet, which renders them natively.
 *
 * Twitter rate-limits the timeline endpoint aggressively (429 after a few
 * requests per IP per hour). To stay under the limit we:
 *   - Keep an in-memory cache PER NODE PROCESS, fresh for 1 hour, stale-OK
 *     forever (so once we have IDs they stay until we successfully refresh).
 *   - Dedupe in-flight requests for the same handle.
 *   - Fetch handles sequentially with a small delay (not parallel hammering).
 *   - Fall back to SEED_IDS if we've never had a successful fetch.
 *
 * In production (Vercel), each cold instance fetches once and serves cached
 * results for the lifetime of that instance. With ISR/revalidate also active
 * on the page itself, real-world request volume to Twitter is minimal.
 */

import "server-only";

export interface HandleSpec {
  handle: string;
  label?: string;
}

export const CURATED_HANDLES: HandleSpec[] = [
  { handle: "cz_binance", label: "CZ" },
  { handle: "MetaMask", label: "MetaMask" },
  { handle: "BNBCHAIN", label: "BNB Chain" },
  { handle: "flapdotsh", label: "flap.sh" },
  { handle: "fourdotmemezh", label: "four.meme" },
];

/**
 * Ultimate fallback tweet IDs per handle — used if we have never managed
 * to fetch a fresh timeline (cold start + rate-limited). Update these
 * occasionally with real IDs from each account so the page never goes blank.
 */
const SEED_IDS: Record<string, string[]> = {
  cz_binance: [
    "2050391023034216808",
    "1614148296788041734",
    "1554445653929066496",
  ],
  MetaMask: [
    "2027022499683410167",
    "2055350847241134341",
    "2055350845353710054",
  ],
  BNBCHAIN: [
    "2055359850775994849",
    "2055218188451794969",
    "2055211675674898544",
  ],
  flapdotsh: [
    "2054794852404207896",
    "2055176935043649635",
    "2054865621675094238",
  ],
  fourdotmemezh: [
    "2054558926574870764",
    "1980227190668296346",
    "1983443702455644474",
  ],
};

const FRESH_MS = 60 * 60 * 1000;            // 1 hour
const SEQUENTIAL_DELAY_MS = 600;            // pause between handle fetches

interface CacheEntry {
  ids: string[];
  fetchedAt: number;
}

// Cache MUST survive HMR rebuilds in dev (which reset module-level state).
// `globalThis` is the same object across module reloads in the same Node
// process, so attaching the Map there keeps successful fetch results across
// rebuilds — critical to avoid re-hitting Twitter's rate limit.
type GlobalWithIdropCache = typeof globalThis & {
  __idropTimelineCache?: Map<string, CacheEntry>;
  __idropTimelineInFlight?: Map<string, Promise<string[]>>;
};
const _g = globalThis as GlobalWithIdropCache;
const cache: Map<string, CacheEntry> = (_g.__idropTimelineCache ??= new Map());
const inFlight: Map<string, Promise<string[]>> = (_g.__idropTimelineInFlight ??=
  new Map());

interface TimelineEntry {
  type?: string;
  entry_id?: string;
  content?: {
    tweet?: {
      id_str?: string;
      user?: { screen_name?: string };
      core?: { user?: { screen_name?: string } };
    };
  };
}

interface NextData {
  props?: {
    pageProps?: {
      latest_tweet_id?: string;
      timeline?: {
        entries?: TimelineEntry[];
      };
    };
  };
}

function extractTweetIdsFromHtml(html: string, handle: string): string[] {
  // Parse the __NEXT_DATA__ blob — Twitter's syndication uses a Next.js
  // page so all the data we need is embedded as JSON.
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return [];

  let data: NextData;
  try {
    data = JSON.parse(match[1]) as NextData;
  } catch {
    return [];
  }

  const entries = data.props?.pageProps?.timeline?.entries ?? [];
  const wantHandle = handle.toLowerCase();
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (entry.type !== "tweet") continue;
    const id = entry.entry_id?.replace(/^tweet-/, "");
    if (!id) continue;
    if (seen.has(id)) continue;

    // Only keep tweets actually AUTHORED by the requested handle
    // (drops retweets, replies-from-others, and quoted-tweet authors).
    const author = (
      entry.content?.tweet?.user?.screen_name ??
      entry.content?.tweet?.core?.user?.screen_name ??
      ""
    ).toLowerCase();
    if (author && author !== wantHandle) continue;

    seen.add(id);
    ids.push(id);
  }

  // Final safety net: if we got nothing, fall back to `latest_tweet_id`
  // (the page's canonical "most recent tweet" pointer).
  if (ids.length === 0 && data.props?.pageProps?.latest_tweet_id) {
    ids.push(data.props.pageProps.latest_tweet_id);
  }

  return ids;
}

async function fetchTimelineIds(handle: string): Promise<string[]> {
  const url = new URL(
    `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(handle)}`
  );
  url.searchParams.set("dnt", "true");
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", "8");
  url.searchParams.set("showReplies", "false");

  try {
    // We deliberately bypass Next's fetch cache here — caching a 429
    // response would lock us out for an hour. Instead, we cache parsed
    // SUCCESSES in our own globalThis-backed map (see above).
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (res.status !== 200) {
      // Common: 429 (rate-limited), 404 (handle deleted/wrong)
      return [];
    }
    const html = await res.text();
    return extractTweetIdsFromHtml(html, handle);
  } catch {
    return [];
  }
}

/**
 * Get latest tweet IDs for a single handle, honoring cache and dedupe.
 * Returns up to `limit` tweet IDs, newest-first.
 */
async function getLatestIdsForHandle(
  handle: string,
  limit: number
): Promise<string[]> {
  const now = Date.now();
  const cached = cache.get(handle);

  // Fresh hit — return cached
  if (cached && now - cached.fetchedAt < FRESH_MS && cached.ids.length > 0) {
    return cached.ids.slice(0, limit);
  }

  // De-dupe in-flight
  const existing = inFlight.get(handle);
  if (existing) {
    const ids = await existing;
    return ids.slice(0, limit);
  }

  const p = (async () => {
    const fresh = await fetchTimelineIds(handle);
    if (fresh.length > 0) {
      cache.set(handle, { ids: fresh, fetchedAt: now });
      return fresh;
    }
    // Fetch failed or empty → stale cache if available
    if (cached && cached.ids.length > 0) return cached.ids;
    // Final fallback → seed
    const seed = SEED_IDS[handle] ?? [];
    if (seed.length > 0) {
      cache.set(handle, { ids: seed, fetchedAt: now });
    }
    return seed;
  })().finally(() => {
    inFlight.delete(handle);
  });

  inFlight.set(handle, p);
  const ids = await p;
  return ids.slice(0, limit);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch latest tweet IDs for many handles. Sequential with a small delay
 * to avoid spiking Twitter's rate limit. Cached handles return instantly.
 */
export async function getLatestTweetsForHandles(
  handles: HandleSpec[],
  perHandle = 1
): Promise<Array<HandleSpec & { tweetIds: string[] }>> {
  const out: Array<HandleSpec & { tweetIds: string[] }> = [];

  for (const spec of handles) {
    const cachedFresh =
      cache.has(spec.handle) &&
      Date.now() - (cache.get(spec.handle)?.fetchedAt ?? 0) < FRESH_MS;

    const tweetIds = await getLatestIdsForHandle(spec.handle, perHandle);
    out.push({ ...spec, tweetIds });

    // Only delay if we actually had to fetch (not when serving cache)
    if (!cachedFresh) {
      await sleep(SEQUENTIAL_DELAY_MS);
    }
  }

  return out;
}
