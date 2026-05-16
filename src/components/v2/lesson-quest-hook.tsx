"use client";

import { useTranslations } from "next-intl";

interface LessonQuestHookProps {
  /** Once the lesson is completed today, the quest auto-fills. */
  completedToday: boolean;
  streakDays: number;
  /** Hours remaining until midnight, for the active-quest copy. */
  hoursRemaining: number;
  minutesRemaining: number;
  /** XP bonus from the quest. */
  bonusXp: number;
}

/**
 * LessonQuestHook — yellow-tinted quest-of-the-day card living in the sidebar.
 *
 * Two states:
 *   - Active  → "Completar esta misma lección hoy · +50 XP bonus · 15 h 14 m"
 *   - Claimed → "✓ Quest del día reclamada · racha 04 días"
 */
export function LessonQuestHook({
  completedToday,
  streakDays,
  hoursRemaining,
  minutesRemaining,
  bonusXp,
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
          <div className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
            +{bonusXp} XP bonus · {t("streakNow")}{" "}
            <span style={{ color: "var(--color-bnb)" }} className="v2-tnum">
              {String(streakDays).padStart(2, "0")} {t("days")}
            </span>
          </div>
        </>
      ) : (
        <>
          <div
            className="v2-serif"
            style={{
              fontSize: 16,
              lineHeight: 1.25,
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
          <div className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
            +{bonusXp} XP bonus ·{" "}
            <span className="v2-tnum">
              {hoursRemaining} h {String(minutesRemaining).padStart(2, "0")} m
            </span>{" "}
            {t("remaining")}
          </div>
        </>
      )}
    </div>
  );
}
