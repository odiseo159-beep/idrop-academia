import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { NewsCard } from "@/components/news/news-card";
import { Badge } from "@/components/ui/badge";
import { getNews } from "@/lib/news";
import type { Locale } from "@/lib/types";

interface TopHeadlinesProps {
  locale: Locale;
}

export async function TopHeadlines({ locale }: TopHeadlinesProps) {
  const t = await getTranslations({ locale, namespace: "landingNews" });
  const items = await getNews(8);

  if (items.length === 0) {
    return (
      <section
        className="border border-dashed border-border bg-surface/40 p-10 text-center"
        style={{ borderRadius: "2px" }}
        aria-live="polite"
      >
        <Newspaper aria-hidden className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {t("empty")}
        </p>
      </section>
    );
  }

  const [hero, ...rest] = items;
  const indexed = rest.slice(0, 5);

  return (
    <section>
      {/* Editorial section header */}
      <header className="border-b border-border-strong pb-3">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              § 01
            </span>
            <h2 className="font-editorial text-[1.5rem] font-medium leading-none tracking-tight text-foreground md:text-[1.75rem]">
              {t("title")}
            </h2>
          </div>
          <Link
            href="/news"
            className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-primary"
          >
            {t("seeAll")}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mt-6 grid gap-x-8 gap-y-6 lg:grid-cols-12">
        {/* Hero — 7 cols */}
        <div className="lg:col-span-7">
          <NewsCard item={hero} variant="hero" />
        </div>

        {/* Indexed list — 5 cols */}
        <div className="lg:col-span-5">
          <div className="mb-2 flex items-baseline justify-between text-[0.6rem]">
            <span className="font-mono uppercase tracking-[0.22em] text-muted-foreground">
              {t("indexLabel")}
            </span>
            <span className="font-mono uppercase tracking-[0.22em] text-muted-foreground">
              {indexed.length} / {items.length}
            </span>
          </div>
          <div className="border-b border-border">
            {indexed.map((item, i) => (
              <NewsCard
                key={item.id}
                item={item}
                variant="indexed"
                index={i}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between sm:hidden">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-primary"
        >
          {t("seeAll")}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}

export function TopHeadlinesFallback() {
  return (
    <div className="border border-border bg-surface p-8" style={{ borderRadius: "2px" }}>
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded bg-surface-elevated animate-pulse" />
        <div className="h-5 w-40 rounded bg-surface-elevated animate-pulse" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[7fr_5fr]">
        <div className="aspect-[21/9] bg-surface-elevated animate-pulse" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-elevated animate-pulse" />
          ))}
        </div>
      </div>
      <Badge variant="default" className="mt-5">
        loading
      </Badge>
    </div>
  );
}
