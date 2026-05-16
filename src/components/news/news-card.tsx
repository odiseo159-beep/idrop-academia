"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { ArrowUpRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo, type NewsItem } from "@/lib/news-types";

interface NewsCardProps {
  item: NewsItem;
  variant?: "hero" | "default" | "compact" | "indexed";
  index?: number;
}

export function NewsCard({ item, variant = "default", index = 0 }: NewsCardProps) {
  const locale = useLocale() as "en" | "es";

  if (variant === "hero") {
    return (
      <motion.a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="group relative block overflow-hidden border border-border bg-surface transition-colors hover:border-border-strong"
        style={{ borderRadius: "2px" }}
      >
        {/* colored source bar — left edge */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 transition-all duration-300 group-hover:w-1.5"
          style={{ backgroundColor: item.sourceColor }}
        />

        {item.imageUrl && (
          <div className="aspect-[21/9] overflow-hidden bg-surface-elevated relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              width="1280"
              height="549"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
              onError={(e) => ((e.currentTarget.style.display = "none"))}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-surface/20 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span
                className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em]"
                style={{ color: item.sourceColor }}
              >
                {item.source}
              </span>
              <span className="h-px w-6 bg-foreground/40" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground/80 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {timeAgo(item.publishedAt, locale)}
              </span>
            </div>
          </div>
        )}

        <div className="px-5 py-6 md:px-7 md:py-7">
          {!item.imageUrl && <SourceLine item={item} locale={locale} />}

          <h2 className="font-editorial text-[1.7rem] font-medium leading-[1.05] tracking-tight md:text-[2.25rem] lg:text-[2.6rem] text-foreground transition-colors group-hover:text-primary">
            {item.title}
          </h2>

          {item.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3 md:text-[0.95rem] md:line-clamp-3">
              {item.description}
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 text-[0.7rem]">
            <span className="font-mono uppercase tracking-[0.22em] text-primary">
              {locale === "es" ? "Leer artículo" : "Read article"}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </motion.a>
    );
  }

  if (variant === "indexed") {
    const indexNum = String(index + 1).padStart(2, "0");
    return (
      <motion.a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex gap-4 border-t border-border bg-transparent py-4 transition-colors hover:bg-surface/40"
      >
        <div className="shrink-0 pt-0.5">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            № {indexNum}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[0.65rem]">
            <span
              className="font-mono font-bold uppercase tracking-[0.22em]"
              style={{ color: item.sourceColor }}
            >
              {item.source}
            </span>
            <span className="h-px w-3 bg-border-strong" />
            <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {timeAgo(item.publishedAt, locale)}
            </span>
          </div>
          <h4 className="mt-1.5 font-editorial text-[1.05rem] font-medium leading-[1.2] tracking-tight text-foreground transition-colors line-clamp-3 group-hover:text-primary">
            {item.title}
          </h4>
        </div>

        <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </motion.a>
    );
  }

  if (variant === "compact") {
    return (
      <motion.a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: index * 0.04 }}
        className="group flex gap-3 border border-border bg-surface p-3 transition-all hover:border-border-strong hover:bg-surface-elevated"
        style={{ borderRadius: "2px" }}
      >
        {item.imageUrl && (
          <div className="h-16 w-16 shrink-0 overflow-hidden bg-surface-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              width="64"
              height="64"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              onError={(e) => ((e.currentTarget.style.display = "none"))}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <SourceLine item={item} locale={locale} small />
          <h4 className="mt-1 font-editorial text-sm font-medium leading-tight tracking-tight line-clamp-2 transition-colors group-hover:text-primary">
            {item.title}
          </h4>
        </div>
      </motion.a>
    );
  }

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex h-full flex-col overflow-hidden border border-border bg-surface transition-all hover:border-border-strong"
      style={{ borderRadius: "2px" }}
    >
      <div
        aria-hidden
        className="h-0.5 w-full"
        style={{ backgroundColor: item.sourceColor }}
      />
      {item.imageUrl && (
        <div className="aspect-[16/9] overflow-hidden bg-surface-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            width="640"
            height="360"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
            onError={(e) => ((e.currentTarget.style.display = "none"))}
          />
        </div>
      )}
      <div className={cn("flex flex-1 flex-col p-5", !item.imageUrl && "pt-6")}>
        <SourceLine item={item} locale={locale} />
        <h3 className="mt-2.5 font-editorial text-[1.2rem] font-medium leading-snug tracking-tight line-clamp-3 transition-colors group-hover:text-primary">
          {item.title}
        </h3>
        {item.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
            {item.description}
          </p>
        )}
      </div>
    </motion.a>
  );
}

function SourceLine({
  item,
  locale,
  small = false,
}: {
  item: NewsItem;
  locale: "en" | "es";
  small?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[0.65rem]">
      <span
        className="font-mono font-bold uppercase tracking-[0.22em]"
        style={{ color: item.sourceColor }}
      >
        {item.source}
      </span>
      <span className="h-px w-4 bg-border-strong" />
      <span
        className={cn(
          "flex items-center gap-1 font-mono uppercase tracking-[0.18em] text-muted-foreground",
          small && "text-[0.6rem]"
        )}
      >
        <Clock className="h-2.5 w-2.5" />
        {timeAgo(item.publishedAt, locale)}
      </span>
    </div>
  );
}
