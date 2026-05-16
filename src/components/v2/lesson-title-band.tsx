import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/types";

interface LessonTitleBandProps {
  locale: Locale;
  moduleCode: string;           // "M.01"
  lessonOrderLabel: string;     // "LECCIÓN 01 · DE CUATRO" (already-formatted)
  title: string;
  /** Optional accent half of the title rendered italic + bnb period. */
  titleAccent?: string;
  description: string;
  videoDurationLabel: string;   // "12:34" or "—"
  readingMinutes: number;
  quizXp: number;
  totalXp: number;
  completed: boolean;
}

/**
 * LessonTitleBand — the editorial title row above the video.
 *
 *   M.01 · LECCIÓN 01 · DE CUATRO              Video    12:34  ✓ visto
 *   ¿Qué es BNB Chain, *en realidad?*          Lectura  8 min ✓ leída
 *   Doce minutos para entender la arquitectura  Quiz     30 s · +25 XP
 *                                               +100 XP al completar lección
 */
export async function LessonTitleBand({
  locale,
  moduleCode,
  lessonOrderLabel,
  title,
  titleAccent,
  description,
  videoDurationLabel,
  readingMinutes,
  quizXp,
  totalXp,
  completed,
}: LessonTitleBandProps) {
  const t = await getTranslations({ locale, namespace: "v2.lesson" });

  return (
    <div style={{ paddingLeft: 56, paddingRight: 56, paddingTop: 18, paddingBottom: 22 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 32,
          alignItems: "end",
        }}
      >
        <div>
          <div
            className="v2-mono v2-mc"
            style={{
              color: "var(--color-bnb)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>
              {moduleCode} · {lessonOrderLabel}
            </span>
            {completed && (
              <>
                <span style={{ color: "var(--color-t-4)" }}>/</span>
                <span style={{ color: "var(--color-bnb)" }}>
                  ✓ {t("completed")}
                </span>
              </>
            )}
          </div>
          <h1
            className="v2-serif"
            style={{
              fontSize: 60,
              lineHeight: 0.98,
              letterSpacing: "-0.028em",
              margin: "14px 0 0",
              fontWeight: 400,
              paddingBottom: 4,
            }}
          >
            {title}
            {titleAccent && (
              <>
                ,&nbsp;
                <span
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: "var(--color-t-1)",
                  }}
                >
                  {titleAccent}
                  <span style={{ color: "var(--color-bnb)" }}>?</span>
                </span>
              </>
            )}
          </h1>
          <p
            style={{
              color: "var(--color-t-1)",
              fontSize: 14,
              marginTop: 14,
              maxWidth: 720,
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        </div>
        <div
          className="v2-mono v2-mc"
          style={{
            textAlign: "right",
            borderLeft: "1px solid var(--color-line-1)",
            paddingLeft: 24,
            lineHeight: 1.8,
            color: "var(--color-t-3)",
          }}
        >
          <div>
            {t("meta.video")}&nbsp;&nbsp;&nbsp;
            <span className="v2-tnum">{videoDurationLabel}</span>
            {completed && (
              <>
                {" · "}
                <span style={{ color: "var(--color-bnb)" }}>
                  ✓ {t("meta.videoSeen")}
                </span>
              </>
            )}
          </div>
          <div>
            {t("meta.reading")}&nbsp;&nbsp;&nbsp;{readingMinutes}{" "}
            {t("meta.min")}
            {completed && (
              <>
                {" · "}
                <span style={{ color: "var(--color-bnb)" }}>
                  ✓ {t("meta.readingDone")}
                </span>
              </>
            )}
          </div>
          <div>
            {t("meta.quiz")}&nbsp;&nbsp;&nbsp;30 s ·{" "}
            <span style={{ color: "var(--color-bnb)" }}>+{quizXp} XP</span>
            {completed && (
              <>
                {" · "}
                <span style={{ color: "var(--color-bnb)" }}>
                  ✓ {t("meta.firstTry")}
                </span>
              </>
            )}
          </div>
          <div style={{ marginTop: 6, color: "var(--color-bnb)" }}>
            {completed
              ? t("meta.xpEarnedNow", { xp: totalXp })
              : t("meta.xpOnComplete", { xp: totalXp })}
          </div>
        </div>
      </div>
    </div>
  );
}
