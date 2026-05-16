import "server-only";
import { XMLParser } from "fast-xml-parser";
import type { NewsItem } from "./news-types";

export type { NewsItem } from "./news-types";
export { timeAgo } from "./news-types";

interface RssSource {
  name: string;
  url: string;
  color: string;
}

const SOURCES: RssSource[] = [
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    color: "#FFB400",
  },
  {
    name: "Decrypt",
    url: "https://decrypt.co/feed",
    color: "#FF3D6F",
  },
  {
    name: "The Block",
    url: "https://www.theblock.co/rss.xml",
    color: "#9747FF",
  },
  {
    name: "BeInCrypto",
    url: "https://beincrypto.com/feed/",
    color: "#38BDF8",
  },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  removeNSPrefix: true,
  parseTagValue: false,
});

interface RssItem {
  title?: string | { __cdata?: string };
  link?: string;
  description?: string | { __cdata?: string };
  pubDate?: string;
  enclosure?: { "@_url"?: string };
  thumbnail?: { "@_url"?: string };
  content?: string | { __cdata?: string };
  category?: string | string[];
  guid?: string | { "#text"?: string };
}

function unwrap(v: string | { __cdata?: string } | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.__cdata ?? "";
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  hellip: "…",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  mdash: "—",
  ndash: "–",
  copy: "©",
  reg: "®",
  trade: "™",
  iexcl: "¡",
  iquest: "¿",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) =>
      String.fromCodePoint(parseInt(dec, 10))
    )
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m)
    .replace(/&amp;/g, "&");
}

function stripHtml(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(item: RssItem): string | undefined {
  if (item.enclosure?.["@_url"]) return item.enclosure["@_url"];
  if (item.thumbnail?.["@_url"]) return item.thumbnail["@_url"];
  const content = unwrap(item.content) || unwrap(item.description);
  const m = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (m) return m[1];
  return undefined;
}

function pickCategory(item: RssItem): string | undefined {
  if (Array.isArray(item.category)) return item.category[0];
  return item.category as string | undefined;
}

async function fetchSource(source: RssSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0 IDROP-NewsBot/1.0" },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel ?? parsed?.feed;
    if (!channel) return [];
    const rawItems: RssItem[] = Array.isArray(channel.item)
      ? channel.item
      : channel.item
        ? [channel.item]
        : Array.isArray(channel.entry)
          ? channel.entry
          : channel.entry
            ? [channel.entry]
            : [];

    return rawItems.slice(0, 12).map((item, i) => {
      const title = stripHtml(unwrap(item.title));
      const description = stripHtml(unwrap(item.description) || unwrap(item.content)).slice(0, 280);
      const link =
        typeof item.link === "string"
          ? item.link
          : (item.link as unknown as { "@_href"?: string })?.["@_href"] ?? "";
      const guid =
        typeof item.guid === "string" ? item.guid : item.guid?.["#text"] ?? `${source.name}-${i}`;
      return {
        id: guid,
        title,
        url: link,
        description,
        publishedAt: item.pubDate ? Date.parse(item.pubDate) : Date.now(),
        source: source.name,
        sourceColor: source.color,
        imageUrl: extractImage(item),
        category: pickCategory(item),
      } satisfies NewsItem;
    });
  } catch {
    return [];
  }
}

export async function getNews(limit = 24): Promise<NewsItem[]> {
  const settled = await Promise.allSettled(SOURCES.map(fetchSource));
  const all = settled
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((item) => item.title && item.url);

  // Dedupe by url
  const seen = new Set<string>();
  const unique = all.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });

  unique.sort((a, b) => b.publishedAt - a.publishedAt);
  return unique.slice(0, limit);
}
