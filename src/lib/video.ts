/**
 * Tiny video URL detection + normalization.
 *
 * The lesson frontmatter accepts one `videoUrl` string. We sniff its kind so
 * the LessonVideoPlayer can pick the right renderer (YouTube iframe, Vimeo
 * iframe, HTML5 <video>, or editorial placeholder).
 */

export type VideoKind = "youtube" | "vimeo" | "mp4" | "unknown";

export interface DetectedVideo {
  kind: VideoKind;
  /** Normalized URL ready to drop into an iframe src or <video src>. */
  src: string | null;
  /** Convenience: 16:9 aspect ratio is what every renderer uses today. */
  aspect: "16:9";
}

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];
const VIMEO_HOSTS = ["vimeo.com", "www.vimeo.com", "player.vimeo.com"];
const DIRECT_EXT = /\.(mp4|webm|mov)(\?.*)?$/i;

export function detectVideo(url: string | undefined | null): DetectedVideo {
  if (!url) return { kind: "unknown", src: null, aspect: "16:9" };

  const trimmed = url.trim();
  if (!trimmed) return { kind: "unknown", src: null, aspect: "16:9" };

  // Relative path → assume self-hosted file
  if (trimmed.startsWith("/")) {
    return {
      kind: DIRECT_EXT.test(trimmed) ? "mp4" : "unknown",
      src: trimmed,
      aspect: "16:9",
    };
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { kind: "unknown", src: null, aspect: "16:9" };
  }

  const host = parsed.host.toLowerCase();

  if (YOUTUBE_HOSTS.includes(host)) {
    const id = extractYouTubeId(parsed);
    if (!id) return { kind: "unknown", src: null, aspect: "16:9" };
    const src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&color=white`;
    return { kind: "youtube", src, aspect: "16:9" };
  }

  if (VIMEO_HOSTS.includes(host)) {
    const id = extractVimeoId(parsed);
    if (!id) return { kind: "unknown", src: null, aspect: "16:9" };
    return {
      kind: "vimeo",
      src: `https://player.vimeo.com/video/${id}?color=F0B90B&title=0&byline=0&portrait=0`,
      aspect: "16:9",
    };
  }

  if (DIRECT_EXT.test(parsed.pathname)) {
    return { kind: "mp4", src: trimmed, aspect: "16:9" };
  }

  return { kind: "unknown", src: trimmed, aspect: "16:9" };
}

function extractYouTubeId(u: URL): string | null {
  // youtube.com/embed/XXX
  const embed = u.pathname.match(/\/embed\/([^/?#]+)/);
  if (embed) return embed[1];
  // youtu.be/XXX
  if (u.host.endsWith("youtu.be")) {
    return u.pathname.replace(/^\//, "") || null;
  }
  // youtube.com/watch?v=XXX
  const v = u.searchParams.get("v");
  if (v) return v;
  // youtube.com/shorts/XXX
  const shorts = u.pathname.match(/\/shorts\/([^/?#]+)/);
  if (shorts) return shorts[1];
  return null;
}

function extractVimeoId(u: URL): string | null {
  // player.vimeo.com/video/XXX
  const player = u.pathname.match(/\/video\/(\d+)/);
  if (player) return player[1];
  // vimeo.com/XXX
  const direct = u.pathname.match(/^\/(\d+)/);
  if (direct) return direct[1];
  return null;
}

/**
 * Format seconds as mm:ss (or h:mm:ss if ≥1h).
 */
export function formatDuration(sec: number | undefined | null): string {
  if (sec == null || !isFinite(sec) || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Parse "mm:ss" or "h:mm:ss" into seconds. Returns 0 on invalid input.
 */
export function parseTimeToSec(time: string | undefined | null): number {
  if (!time) return 0;
  const parts = time.split(":").map((p) => Number(p));
  if (parts.some((p) => isNaN(p))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return Number(time) || 0;
}
