"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LiveTime, LiveDot } from "./live-time";

export function CompactHero() {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden border-b border-border-strong">
      {/* Atmospheric layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 ed-grid-dot opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-primary/[0.04] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-accent-purple/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-accent-pink/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Top bar — masthead spine */}
        <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[0.65rem] md:text-[0.7rem]">
          <div className="flex items-center gap-2.5 min-w-0">
            <LiveDot />
            <span className="font-mono uppercase tracking-[0.22em] text-success">
              {t("liveLabel")}
            </span>
            <span className="hidden sm:inline text-border-strong">/</span>
            <LiveTime className="hidden sm:inline text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.22em]">
              {t("editionLabel")} 001
            </span>
            <span className="hidden md:inline text-border-strong">/</span>
            <span className="hidden md:inline font-mono uppercase tracking-[0.18em]">
              {t("issueLabel")}
            </span>
          </div>
        </div>

        {/* Main masthead */}
        <div className="grid grid-cols-12 gap-4 md:gap-8 py-8 md:py-12">
          {/* Left: editorial brand block */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
                ⌐ N°{" "}
                <span className="text-foreground">001</span>
              </span>
              <span className="hidden sm:block h-px w-12 bg-border-strong" />
              <span className="hidden sm:inline font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
                {t("departmentLabel")}
              </span>
            </div>

            <h1
              className="mt-4 font-editorial text-[2.5rem] font-medium leading-[0.92] tracking-tight md:text-[4rem] lg:text-[5.25rem] animate-reveal"
              style={{ animationDelay: "120ms" }}
            >
              {t("mastheadLine1")}
              <span className="font-editorial-italic font-light text-muted-foreground">
                ,
              </span>
              <br />
              <span className="font-editorial-italic font-light text-primary">
                {t("mastheadLine2")}
              </span>
            </h1>

            <p
              className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base animate-drop"
              style={{ animationDelay: "320ms" }}
            >
              {t("mastheadKicker")}
            </p>

            <div
              className="mt-7 flex flex-wrap items-center gap-3 animate-drop"
              style={{ animationDelay: "440ms" }}
            >
              <Button asChild variant="primary" size="md">
                <Link href="/learn">
                  {t("ctaPrimary")}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="md">
                <Link href="/news">
                  <Newspaper className="h-4 w-4" />
                  {t("ctaNews")}
                </Link>
              </Button>
              <span className="ml-2 hidden lg:flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                <span className="h-px w-8 bg-border-strong" />
                <span className="font-mono uppercase tracking-[0.22em]">
                  {t("freeAccessLabel")}
                </span>
              </span>
            </div>
          </div>

          {/* Right: data column — feels like a print sidebar */}
          <aside
            className="col-span-12 md:col-span-5 lg:col-span-4 animate-drop"
            style={{ animationDelay: "560ms" }}
          >
            <div className="relative h-full">
              <div className="absolute -top-2 left-0 right-0 rule-tick" />
              <div className="grid grid-cols-2 gap-px bg-border pt-2">
                <DataCell
                  label={t("statsModules")}
                  value="06"
                  accent="text-primary"
                />
                <DataCell
                  label={t("statsLessons")}
                  value="25+"
                  accent="text-accent-cyan"
                />
                <DataCell
                  label={t("statsLanguages")}
                  value="ES / EN"
                  accent="text-accent-purple"
                  small
                />
                <DataCell
                  label={t("statsCost")}
                  value="$0.00"
                  accent="text-accent-pink"
                  small
                />
              </div>

              {/* Roadmap rail */}
              <div className="mt-4 flex items-center justify-between gap-2 text-[0.65rem]">
                <RoadmapDot label="BNB" status="live" />
                <RoadmapLine />
                <RoadmapDot label="opBNB" status="next" />
                <RoadmapLine />
                <RoadmapDot label="ETH" status="q3" />
                <RoadmapLine />
                <RoadmapDot label="SOL" status="q4" />
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom rule + scan line */}
        <div className="relative h-px overflow-hidden border-t border-border">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan" />
        </div>
      </div>
    </section>
  );
}

function DataCell({
  label,
  value,
  accent,
  small = false,
}: {
  label: string;
  value: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <div className="bg-background/40 px-3 py-3 md:px-4 md:py-4">
      <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1.5 font-editorial leading-none ${accent} ${
          small ? "text-lg md:text-xl" : "text-3xl md:text-[2.25rem]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function RoadmapDot({
  label,
  status,
}: {
  label: string;
  status: "live" | "next" | "q3" | "q4";
}) {
  const isLive = status === "live";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-2 w-2 rounded-full ${
          isLive
            ? "bg-success animate-ticker"
            : status === "next"
              ? "bg-warning/70"
              : "bg-muted-foreground/40"
        }`}
      />
      <span
        className={`font-mono uppercase tracking-[0.18em] ${
          isLive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function RoadmapLine() {
  return <div className="h-px flex-1 bg-border" />;
}
