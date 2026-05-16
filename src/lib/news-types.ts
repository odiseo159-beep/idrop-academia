export interface NewsItem {
  id: string;
  title: string;
  url: string;
  description: string;
  publishedAt: number;
  source: string;
  sourceColor: string;
  imageUrl?: string;
  category?: string;
}

export function timeAgo(ts: number, locale: "en" | "es" = "en"): string {
  const seconds = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const dict = {
    en: { now: "just now", min: "min ago", hr: "h ago", day: "d ago" },
    es: { now: "ahora", min: "min", hr: "h", day: "d" },
  } as const;
  const d = dict[locale];

  if (seconds < 60) return d.now;
  if (minutes < 60) return `${minutes} ${d.min}`;
  if (hours < 24) return `${hours} ${d.hr}`;
  return `${days} ${d.day}`;
}
