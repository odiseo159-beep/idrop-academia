"use client";

import { useTranslations } from "next-intl";
import { Link as I18nLink } from "@/i18n/navigation";
import { useLessonProgress } from "@/hooks/use-lesson-progress";

interface LessonBreadcrumbProps {
  moduleSlug: string;
  moduleCode: string;          // "M.01"
  moduleTitle: string;          // "Fundamentos de BNB Chain"
  lessonCode: string;           // "L.01"
  lessonTitle: string;          // "Consenso PoSA y arquitectura"
  /** Pass-through to useLessonProgress so the % bar reflects the module state. */
  lessonSlug: string;
  moduleTotalLessons: number;
  moduleTotalXp: number;
  lessonXp: number;
  /** Index (1-based) of the current lesson — feeds the "1 / 4" suffix. */
  lessonOrder: number;
}

/**
 * LessonBreadcrumb — the slim path row above the title band.
 *
 *   Academia / M.01 · Fundamentos / L.01 · Consenso PoSA … Tu progreso ▓▓░░ 25% · 1/4
 */
export function LessonBreadcrumb({
  moduleSlug,
  moduleCode,
  moduleTitle,
  lessonCode,
  lessonTitle,
  lessonSlug,
  moduleTotalLessons,
  moduleTotalXp,
  lessonXp,
  lessonOrder,
}: LessonBreadcrumbProps) {
  const t = useTranslations("v2.lesson");
  const progress = useLessonProgress({
    moduleSlug,
    lessonSlug,
    moduleTotalLessons,
    moduleTotalXp,
    lessonXp,
  });

  return (
    <div
      style={{
        paddingLeft: 56,
        paddingRight: 56,
        paddingTop: 14,
        paddingBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/*
        "Academia" climbs ONE level up — which from a lesson means the module
        overview, not the landing. Bypass the /learn redirect entirely so the
        Next router doesn't accumulate `#academia` fragments en route.
      */}
      <I18nLink
        href={`/learn/${moduleSlug}`}
        className="v2-mono v2-mc"
        style={{ color: "var(--color-t-3)" }}
      >
        {t("breadcrumbAcademia")}
      </I18nLink>
      <span className="v2-mono v2-mc" style={{ color: "var(--color-t-4)" }}>
        /
      </span>
      <I18nLink
        href={`/learn/${moduleSlug}`}
        className="v2-mono v2-mc"
        style={{ color: "var(--color-bnb)" }}
      >
        {moduleCode} · {moduleTitle}
      </I18nLink>
      <span className="v2-mono v2-mc" style={{ color: "var(--color-t-4)" }}>
        /
      </span>
      <span className="v2-mono v2-mc" style={{ color: "var(--color-t-1)" }}>
        {lessonCode} · {lessonTitle}
      </span>
      <span style={{ flex: 1 }} />
      <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
        {t("yourProgress")}
      </span>
      <span
        style={{
          width: 200,
          height: 2,
          background: "var(--color-line-2)",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: `${progress.module.pct}%`,
            background: "var(--color-bnb)",
            transition: "width 0.4s ease",
          }}
        />
      </span>
      <span
        className="v2-mono v2-mc v2-tnum"
        style={{ color: "var(--color-bnb)" }}
      >
        {progress.module.pct}% · {lessonOrder} / {moduleTotalLessons}
      </span>
    </div>
  );
}
