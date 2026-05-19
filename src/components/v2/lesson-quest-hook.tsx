"use client";

import { useTranslations } from "next-intl";

interface LessonQuestHookProps {
  /** Once the lesson is completed today, the card switches to claimed state. */
  completedToday: boolean;
  streakDays: number;
  /** Hours remaining until midnight (no longer surfaced, kept for prop compat). */
  hoursRemaining: number;
  minutesRemaining: number;
  /** Legacy prop, no longer surfaced. Kept for callsite compatibility. */
  bonusXp: number;
}

/**
 * LessonQuestHook — yellow-tinted today's-lesson card living in the sidebar.
 *
 * Two states:
 *   - Active  → "Tu lección sugerida para hoy" (no timer, no XP bonus pressure)
 *   - Claimed → "✓ Hecha por hoy · 04 días estudiando"
 */
export function LessonQuestHook({
  completedToday,
  streakDays,
}: LessonQuestHookProps) {
  const t = useTranslations("v2.lesson.quest");

  return (
    <div
      style={{
        border: "1px solid var(--color-bnb-line)",
        background: "rgba(240,185,11,0.04)",
        padding: "14px 18px",
      }}
    >
      <div
        className="v2-mono v2-mc"
        style={{
          color: "var(--color-bnb)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span className="v2-tick pulse" />
        {t("title")}
      </div>
      {completedToday ? (
        <>
          <div
            className="v2-serif"
            style={{
              fontSize: 16,
              lineHeight: 1.25,
              margin: "8px 0 4px",
              color: "var(--color-t-0)",
            }}
          >
            <span style={{ color: "var(--color-bnb)" }}>✓</span>{" "}
            {t("claimed")}
          </div>
          {streakDays > 0 && (
            <div className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
              <span style={{ color: "var(--color-bnb)" }} className="v2-tnum">
                {String(streakDays).padStart(2, "0")}
              </span>{" "}
              {t("streakNow")}
            </div>
          )}
        </>
      ) : (
        <div
          className="v2-serif"
          style={{
            fontSize: 16,
            lineHeight: 1.3,
            margin: "8px 0 2px",
            color: "var(--color-t-0)",
          }}
        >
          {t.rich("active", {
            italic: (chunks) => (
              <span style={{ fontStyle: "italic" }}>{chunks}</span>
            ),
          })}
        </div>
      )}
    </div>
  );
}
