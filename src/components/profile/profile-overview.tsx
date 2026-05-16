"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Trophy,
  Sparkles,
  TrendingUp,
  Zap,
  Calendar,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgress, useIsHydrated, progressStore } from "@/lib/progress-store";
import { GradientBlob } from "@/components/fx/gradient-blob";
import { WireframeSphere } from "@/components/fx/wireframe-sphere";
import type { Module } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProfileOverviewProps {
  modules: Module[];
}

const LEVELS = [
  { key: "spectator" as const, min: 0, max: 99 },
  { key: "initiate" as const, min: 100, max: 299 },
  { key: "apprentice" as const, min: 300, max: 699 },
  { key: "adept" as const, min: 700, max: 1299 },
  { key: "master" as const, min: 1300, max: 2199 },
  { key: "sage" as const, min: 2200, max: Infinity },
];

function getLevel(xp: number) {
  const idx = LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  const safeIdx = idx === -1 ? 0 : idx;
  const current = LEVELS[safeIdx];
  const next = LEVELS[safeIdx + 1];
  const span = next ? next.min - current.min : 1;
  const into = xp - current.min;
  const percent = next ? Math.min(100, Math.round((into / span) * 100)) : 100;
  return {
    key: current.key,
    level: safeIdx + 1,
    nextKey: next?.key,
    percent,
    toNext: next ? next.min - xp : 0,
  };
}

export function ProfileOverview({ modules }: ProfileOverviewProps) {
  const t = useTranslations("profile");
  const [confirmReset, setConfirmReset] = useState(false);

  const hydrated = useIsHydrated();
  const totalXp = useProgress((s) => s.totalXp);
  const lessonsCount = useProgress((s) => Object.keys(s.completedLessons).length);
  const startedCount = useProgress((s) => s.modulesStarted.length);
  const completedCount = useProgress((s) => s.modulesCompleted.length);
  const lastActivity = useProgress((s) => s.lastActivity ?? 0);

  const startedKey = useProgress((s) => s.modulesStarted.join(","));
  const completedKey = useProgress((s) => s.modulesCompleted.join(","));
  const recentKey = useProgress((s) =>
    Object.entries(s.completedLessons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${k}:${v}`)
      .join("|")
  );

  const xp = hydrated ? totalXp : 0;
  const level = getLevel(xp);

  const startedSlugs = startedKey ? startedKey.split(",") : [];
  const completedSlugs = completedKey ? completedKey.split(",") : [];

  const inProgressModules = hydrated
    ? modules.filter(
        (m) => startedSlugs.includes(m.slug) && !completedSlugs.includes(m.slug)
      )
    : [];

  const recent = hydrated && recentKey
    ? recentKey.split("|").map((entry) => {
        const [key, tsStr] = entry.split(":");
        const ts = Number(tsStr);
        const [moduleSlug, lessonSlug] = key.split("/");
        const mod = modules.find((m) => m.slug === moduleSlug);
        const lesson = mod?.lessons.find((l) => l.slug === lessonSlug);
        return { moduleSlug, lessonSlug, ts, mod, lesson };
      })
    : [];

  const moduleCompletedSnapshot = useProgress((s) =>
    inProgressModules
      .map(
        (m) =>
          `${m.slug}:${
            Object.keys(s.completedLessons).filter((k) => k.startsWith(`${m.slug}/`)).length
          }`
      )
      .join("|")
  );
  const completedByModule = Object.fromEntries(
    moduleCompletedSnapshot
      .split("|")
      .filter(Boolean)
      .map((e) => {
        const [slug, n] = e.split(":");
        return [slug, Number(n)];
      })
  ) as Record<string, number>;

  function handleReset() {
    if (confirmReset) {
      progressStore.reset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  }

  return (
    <div className="relative">
      <GradientBlob
        variant="purple-orange"
        size="lg"
        className="-top-20 -right-32 opacity-30"
      />

      <div className="mx-auto max-w-6xl px-4 md:px-6 pt-12 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 md:p-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-12 -right-12 hidden md:block opacity-25"
          >
            <WireframeSphere size={300} meridians={12} parallels={8} spin />
          </div>

          <div className="relative">
            <Badge variant="gradient">
              <Sparkles className="h-3 w-3" />
              {t("levelLabel", { level: level.level, name: t(`levels.${level.key}`) })}
            </Badge>

            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] md:text-5xl">
              {t("title1")} <span className="text-gradient-bnb">{t("title2")}</span> {t("title3")}
            </h1>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-display text-6xl font-bold text-foreground md:text-7xl">
                {xp}
              </span>
              <span className="text-lg text-muted-foreground">{t("xpEarned")}</span>
            </div>

            {level.nextKey && (
              <div className="mt-6 max-w-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t("nextLevel")} <span className="text-foreground font-medium">{t(`levels.${level.nextKey}`)}</span>
                  </span>
                  <span className="text-muted-foreground">{t("toGo", { xp: level.toNext })}</span>
                </div>
                <Progress value={level.percent} className="mt-2" />
              </div>
            )}
          </div>
        </motion.div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Zap className="h-4 w-4" />}
            value={lessonsCount}
            label={t("statLessons")}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            value={startedCount}
            label={t("statStarted")}
          />
          <StatCard
            icon={<Trophy className="h-4 w-4" />}
            value={completedCount}
            label={t("statCompleted")}
            highlight
          />
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">{t("inProgressTitle")}</h2>
          {inProgressModules.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
              <p className="text-muted-foreground">
                {hydrated ? t("inProgressEmpty") : t("inProgressLoading")}
              </p>
              <Button asChild variant="primary" size="md" className="mt-5">
                <Link href="/learn">
                  {t("browseModules")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {inProgressModules.map((m) => {
                const moduleCompletedLessons = completedByModule[m.slug] ?? 0;
                const percent = Math.round(
                  (moduleCompletedLessons / m.totalLessons) * 100
                );
                return (
                  <Link
                    key={m.slug}
                    href={`/learn/${m.slug}`}
                    className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-border-strong hover:bg-surface-elevated"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="primary">{m.category}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold">
                      {m.title}
                    </h3>
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t("lessonsLabel", { n: m.totalLessons })}
                        </span>
                        <span className="text-primary font-medium">{percent}%</span>
                      </div>
                      <Progress value={percent} className="h-1.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">{t("recentTitle")}</h2>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("recentEmpty")}
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {recent.map(({ moduleSlug, lessonSlug, ts, mod, lesson }) => (
                <Link
                  key={`${moduleSlug}/${lessonSlug}`}
                  href={`/learn/${moduleSlug}/${lessonSlug}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-elevated"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {lesson?.title ?? lessonSlug}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mod?.title ?? moduleSlug} · {formatDate(ts)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    +{lesson?.xp ?? 0} XP
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {hydrated && lastActivity > 0 && (
          <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {t("lastActivity")} {formatDate(lastActivity)}
          </div>
        )}

        {hydrated && (lessonsCount > 0 || startedCount > 0) && (
          <div className="mt-8 border-t border-border pt-6">
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs",
                confirmReset && "text-danger hover:text-danger"
              )}
            >
              <RotateCcw className="h-3 w-3" />
              {confirmReset ? t("resetConfirm") : t("resetProgress")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border",
          highlight
            ? "bg-gradient-to-br from-primary/30 to-primary/5 text-primary"
            : "bg-surface-elevated text-foreground"
        )}
      >
        {icon}
      </div>
      <div className="mt-4 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
