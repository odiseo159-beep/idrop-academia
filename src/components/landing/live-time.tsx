"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface LiveTimeProps {
  className?: string;
  showSeconds?: boolean;
}

const ES_DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const ES_MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const EN_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const EN_MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function formatLive(d: Date, locale: string, showSeconds: boolean): string {
  const days = locale === "es" ? ES_DAYS : EN_DAYS;
  const months = locale === "es" ? ES_MONTHS : EN_MONTHS;
  const day = days[d.getUTCDay()];
  const dnum = d.getUTCDate();
  const mon = months[d.getUTCMonth()];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  const time = showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  return `${day} ${String(dnum).padStart(2, "0")} ${mon} · ${time} UTC`;
}

export function LiveTime({ className, showSeconds = true }: LiveTimeProps) {
  const locale = useLocale();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), showSeconds ? 1000 : 60_000);
    return () => window.clearInterval(id);
  }, [showSeconds]);

  return (
    <span
      className={cn("font-mono tabular-nums uppercase tracking-[0.18em]", className)}
      suppressHydrationWarning
    >
      {now ? formatLive(now, locale, showSeconds) : "— — — — — — —"}
    </span>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-2 w-2 shrink-0 items-center justify-center",
        className
      )}
      aria-label="Live indicator"
    >
      <span
        aria-hidden
        className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping motion-reduce:hidden"
      />
      <span
        aria-hidden
        className="relative inline-flex h-2 w-2 rounded-full bg-success"
      />
    </span>
  );
}
