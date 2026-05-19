"use client";

import { useTranslations } from "next-intl";
import { Link as I18nLink } from "@/i18n/navigation";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useProgress, isLessonComplete } from "@/lib/progress-store";
import { Insignia } from "@/components/v2/insignia";
import type { LessonMeta } from "@/lib/types";

interface LessonModuleRailProps {
  moduleSlug: string;
  moduleCode: string;
  moduleCategory: string;
  moduleTitle: string;
  moduleTotalLessons: number;
  moduleTotalMin: number;
  moduleTotalXp: number;
  /** All lessons in the module, in order. */
  lessons: LessonMeta[];
  /** The currently viewed lesson — gets the "current" treatment. */
  currentSlug: string;
  /** Pass-through for the XP card. */
  lessonXp: number;
}

/**
 * LessonModuleRail — the chunky sidebar card showing the module + its lessons.
 *
 * Per-lesson row state derives from `progressStore`:
 *   - done    → 20px filled bnb circle with a check
 *   - current → italic-serif number, bnb left-border, soft fill
 *   - pending → faint-serif number, no border
 *
 * The XP card at the bottom shows accumulated XP for the module and a thin
 * bnb bar at the very bottom edge.
 */
export function LessonModuleRail({
  moduleSlug,
  moduleCode,
  moduleCategory,
  moduleTitle,
  moduleTotalLessons,
  moduleTotalMin,
  moduleTotalXp,
  lessons,
  currentSlug,
  lessonXp,
}: LessonModuleRailProps) {
  const t = useTranslations("v2.lesson");
  const progress = useLessonProgress({
    moduleSlug,
    lessonSlug: currentSlug,
    moduleTotalLessons,
    moduleTotalXp,
    lessonXp,
    // Pass the lessons array so the hook sums real per-lesson XP instead
    // of using the count × average approximation.
    moduleLessons: lessons,
  });

  return (
    <div
      style={{
        border: "1px solid var(--color-line-1)",
        background: "rgba(7,8,13,0.55)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid var(--color-line-1)",
        }}
      >
        <div className="v2-mono v2-mc" style={{ color: "var(--color-bnb)" }}>
          {moduleCode} · {moduleCategory}
        </div>
        <I18nLink
          href={`/learn/${moduleSlug}`}
          style={{ textDecoration: "none" }}
        >
          <h4
            className="v2-serif"
            style={{
              fontSize: 20,
              lineHeight: 1.12,
              letterSpacing: "-0.012em",
              margin: "6px 0 0",
              fontWeight: 500,
              color: "var(--color-t-0)",
            }}
          >
            {moduleTitle}
          </h4>
        </I18nLink>
        <div
          className="v2-mono v2-mc"
          style={{ marginTop: 8, color: "var(--color-t-3)" }}
        >
          {moduleTotalLessons} {t("lessShort")} · {moduleTotalMin} {t("meta.min")}
        </div>
      </div>

      {/* Lessons */}
      <div style={{ padding: "12px 0" }}>
        <div
          className="v2-mono v2-mc"
          style={{ padding: "0 18px 8px", color: "var(--color-t-3)" }}
        >
          {t("syllabus")}
        </div>
        {lessons.map((l) => (
          <LessonRow
            key={l.slug}
            lesson={l}
            moduleSlug={moduleSlug}
            isCurrent={l.slug === currentSlug}
          />
        ))}
      </div>

      {/* Insignia preview — replaces the old XP card. Locked while the module
          is in progress; switches to "earned" once every lesson is complete. */}
      <div
        style={{
          padding: "14px 18px",
          borderTop: "1px solid var(--color-line-1)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Insignia
          moduleSlug={moduleSlug}
          size="md"
          state={
            progress.hydrated && progress.module.completed >= moduleTotalLessons
              ? "earned"
              : "locked"
          }
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)" }}
          >
            {t("insigniaPreviewLabel")}
          </div>
          <div
            className="v2-serif"
            style={{
              fontSize: 14,
              color: "var(--color-t-1)",
              marginTop: 4,
            }}
          >
            <span style={{ fontStyle: "italic" }} className="v2-tnum">
              {progress.hydrated ? progress.module.completed : 0}
            </span>{" "}
            <span
              className="v2-mono v2-mc v2-tnum"
              style={{ color: "var(--color-t-3)" }}
            >
              / {moduleTotalLessons} {t("lessShort")}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar — by lesson count instead of XP */}
      <div
        style={{
          height: 3,
          background: "var(--color-line-1)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${(progress.hydrated ? progress.module.pct : 0)}%`,
            background: "var(--color-bnb)",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

interface LessonRowProps {
  lesson: LessonMeta;
  moduleSlug: string;
  isCurrent: boolean;
}

function LessonRow({ lesson, moduleSlug, isCurrent }: LessonRowProps) {
  const t = useTranslations("v2.lesson");
  const isDone = useProgress((s) =>
    isLessonComplete(s, moduleSlug, lesson.slug)
  );

  const numLabel = String(lesson.order).padStart(2, "0");

  return (
    <I18nLink
      href={`/learn/${moduleSlug}/${lesson.slug}`}
      style={{
        textDecoration: "none",
        display: "block",
      }}
    >
      <div
        style={{
          padding: "10px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          borderLeft: isCurrent
            ? "2px solid var(--color-bnb)"
            : isDone
              ? "2px solid rgba(240,185,11,0.4)"
              : "2px solid transparent",
          background: isCurrent ? "rgba(240,185,11,0.05)" : "transparent",
        }}
      >
        {isDone ? (
          <span
            style={{
              minWidth: 26,
              lineHeight: 1,
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                background: "var(--color-bnb)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#15110a",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2 6 4.5 8.5 9 3" />
              </svg>
            </span>
          </span>
        ) : (
          <span
            className="v2-serif v2-tnum"
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: isCurrent ? "var(--color-bnb)" : "var(--color-t-3)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              minWidth: 26,
              lineHeight: 1.1,
              marginTop: 2,
            }}
          >
            {numLabel}
          </span>
        )}
        <div style={{ flex: 1 }}>
          <div
            className="v2-serif"
            style={{
              fontSize: 14,
              lineHeight: 1.25,
              color: isCurrent
                ? "var(--color-t-0)"
                : isDone
                  ? "var(--color-t-1)"
                  : "var(--color-t-1)",
            }}
          >
            {lesson.title}
          </div>
          <div
            className="v2-mono v2-mc"
            style={{
              marginTop: 3,
              display: "flex",
              gap: 8,
              color: "var(--color-t-3)",
            }}
          >
            <span className="v2-tnum">
              {lesson.duration} {t("meta.min")}
            </span>
            {isCurrent && (
              <>
                <span>·</span>
                <span style={{ color: "var(--color-bnb)" }}>
                  {t("nowViewing")}
                </span>
              </>
            )}
            {isDone && (
              <>
                <span>·</span>
                <span style={{ color: "var(--color-bnb)" }}>
                  {t("earned")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </I18nLink>
  );
}
