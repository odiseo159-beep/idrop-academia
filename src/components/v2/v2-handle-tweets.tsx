import { getTweet } from "react-tweet/api";
import { EmbeddedTweet } from "react-tweet";
import { ExternalLink } from "lucide-react";
import {
  CURATED_HANDLES,
  getLatestTweetsForHandles,
  type HandleSpec,
} from "@/lib/twitter-handles";

interface Props {
  handles?: HandleSpec[];
  /** How many tweets to render per handle */
  perHandle?: number;
  className?: string;
}

/**
 * Auto-fetches the latest tweet IDs per curated handle via Twitter's
 * public syndication endpoint (server-side, with in-memory caching) and
 * renders each tweet natively through react-tweet.
 *
 * All work happens server-side before render — no Suspense, no
 * client-side fetching.
 */
export async function V2HandleTweets({
  handles = CURATED_HANDLES,
  perHandle = 1,
  className,
}: Props) {
  const records = await getLatestTweetsForHandles(handles, perHandle);

  // Resolve each tweet ID into actual tweet data (still server-side).
  const cards = await Promise.all(
    records.map(async (r) => {
      if (r.tweetIds.length === 0) {
        return { kind: "empty" as const, handle: r.handle, label: r.label };
      }
      const tweets = await Promise.all(
        r.tweetIds.map(async (id) => {
          try {
            return await getTweet(id);
          } catch {
            return null;
          }
        })
      );
      const resolved = tweets.filter(
        (t): t is NonNullable<typeof t> => t !== null
      );
      if (resolved.length === 0) {
        return { kind: "empty" as const, handle: r.handle, label: r.label };
      }
      return {
        kind: "tweets" as const,
        handle: r.handle,
        label: r.label,
        tweets: resolved,
      };
    })
  );

  return (
    <div
      data-theme="dark"
      className={"v2-tweet-grid " + (className ?? "")}
      style={{
        display: "grid",
        gap: 16,
        alignItems: "start",
      }}
    >
      {cards.flatMap((c, ci) =>
        c.kind === "tweets"
          ? c.tweets.map((tweet, ti) => (
              <div
                key={`${c.handle}-${tweet.id_str}-${ti}`}
                className="v2-tweet-shell v2-tweet-capped"
              >
                <div
                  className="v2-tweet-shell-inner"
                  style={{ pointerEvents: "none" }}
                >
                  <EmbeddedTweet tweet={tweet} />
                </div>
                <div className="v2-tweet-fade" aria-hidden />
                {/* Overlay link covers the whole card; inner anchors are
                    disabled via pointer-events:none above so there's no
                    nested <a> in the DOM. */}
                <a
                  href={`https://x.com/${c.handle}/status/${tweet.id_str}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open tweet by @${c.handle} on X`}
                  className="v2-tweet-overlay-link"
                />
              </div>
            ))
          : [
              <HandleEmpty
                key={`${c.handle}-empty-${ci}`}
                handle={c.handle}
                label={c.label}
              />,
            ]
      )}
    </div>
  );
}

function HandleEmpty({ handle, label }: { handle: string; label?: string }) {
  return (
    <div
      className="v2-tweet-shell"
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: 380,
        justifyContent: "center",
      }}
    >
      <div
        className="v2-mono"
        style={{
          fontSize: 10,
          color: "var(--color-t-3)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        Sin actividad reciente
      </div>
      <div
        style={{
          fontSize: 15,
          color: "var(--color-t-0)",
          fontWeight: 500,
        }}
      >
        {label ?? `@${handle}`}
      </div>
      <a
        href={`https://x.com/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="v2-mono v2-arrow-shift"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--color-bnb)",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        Abrir @{handle}{" "}
        <ExternalLink size={11} className="v2-arrow" aria-hidden />
      </a>
    </div>
  );
}
