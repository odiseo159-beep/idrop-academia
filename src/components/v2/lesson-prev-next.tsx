import { getTranslations } from "next-intl/server";
import { Link as I18nLink } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";

interface PrevNextLessonRef {
  slug: string;
  title: string;
  order: number;
  durationMin: number;
  xp: number;
}

interface LessonPrevNextProps {
  locale: Locale;
  moduleSlug: string;
  prev?: PrevNextLessonRef | null;
  next?: PrevNextLessonRef | null;
  /** When true, the "next" tile gets the brighter celebrating border + label. */
  celebrating: boolean;
}

/**
 * LessonPrevNext — pair of cards at the bottom of the article column.
 *
 *   [ ← Anterior · Inicio del módulo ]  [ SIGUIENTE · L.02 · Validadores y BSC → ]
 *
 * When `celebrating=true` (right after completion), the right tile reads
 * "▸ CONTINUAR · L.02" with the bright border + serif italic title + xp.
 */
export async function LessonPrevNext({
  locale,
  moduleSlug,
  prev,
  next,
  celebrating,
}: LessonPrevNextProps) {
  const t = await getTranslations({ locale, namespace: "v2.lesson" });

  return (
    <div
      style={{
        marginTop: 26,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
    >
      {prev ? (
        <I18nLink
          href={`/learn/${moduleSlug}/${prev.slug}`}
          className="v2-card-hover"
          style={{
            border: "1px solid var(--color-line-2)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            color: "var(--color-t-2)",
            textDecoration: "none",
          }}
        >
          <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
            ← {t("prev")}
          </span>
          <span style={{ flex: 1 }} />
          <span
            className="v2-serif"
            style={{
              fontSize: 14,
              color: "var(--color-t-1)",
              fontStyle: "italic",
            }}
          >
            {prev.title}
          </span>
        </I18nLink>
      ) : (
        <div
          style={{
            border: "1px solid var(--color-line-1)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            color: "var(--color-t-4)",
          }}
        >
          <span className="v2-mono v2-mc" style={{ color: "var(--color-t-4)" }}>
            ← {t("prev")}
          </span>
          <span style={{ flex: 1 }} />
          <span
            className="v2-serif"
            style={{
              fontSize: 14,
              color: "var(--color-t-4)",
              fontStyle: "italic",
            }}
          >
            {t("moduleStart")}
          </span>
        </div>
      )}

      {next ? (
        <I18nLink
          href={`/learn/${moduleSlug}/${next.slug}`}
          className="v2-card-hover v2-arrow-shift"
          style={{
            border: `1px solid ${celebrating ? "var(--color-bnb)" : "var(--color-bnb-line)"}`,
            padding: celebrating ? "16px 20px" : "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: celebrating
              ? "rgba(240,185,11,0.10)"
              : "rgba(240,185,11,0.06)",
            textDecoration: "none",
          }}
        >
          <span style={{ flex: 1 }}>
            <div
              className="v2-mono v2-mc"
              style={{ color: "var(--color-bnb)" }}
            >
              {celebrating
                ? `▸ ${t("continue")} · L.${String(next.order).padStart(2, "0")}`
                : `${t("next")} · L.${String(next.order).padStart(2, "0")}`}
            </div>
            <div
              className="v2-serif"
              style={{
                fontSize: celebrating ? 18 : 16,
                marginTop: 4,
                color: "var(--color-t-0)",
                fontStyle: celebrating ? "italic" : "normal",
              }}
            >
              {next.title}
            </div>
            {celebrating && (
              <div
                className="v2-mono v2-mc"
                style={{ marginTop: 4, color: "var(--color-t-3)" }}
              >
                {next.durationMin} min ·{" "}
                <span style={{ color: "var(--color-bnb)" }}>+{next.xp} XP</span>{" "}
                · {t("unlocked")}
              </div>
            )}
          </span>
          <span
            className="v2-arrow v2-mono"
            style={{
              color: "var(--color-bnb)",
              fontSize: celebrating ? 22 : 18,
            }}
          >
            →
          </span>
        </I18nLink>
      ) : (
        <div
          style={{
            border: "1px solid var(--color-line-2)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
          }}
        >
          <span style={{ flex: 1 }}>
            <div
              className="v2-mono v2-mc"
              style={{ color: "var(--color-bnb)" }}
            >
              ✓ {t("moduleComplete")}
            </div>
            <div
              className="v2-serif"
              style={{
                fontSize: 16,
                marginTop: 4,
                color: "var(--color-t-1)",
                fontStyle: "italic",
              }}
            >
              {t("backToAcademia")}
            </div>
          </span>
          <I18nLink
            href="/learn"
            className="v2-arrow v2-mono"
            style={{
              color: "var(--color-bnb)",
              fontSize: 18,
              textDecoration: "none",
            }}
          >
            →
          </I18nLink>
        </div>
      )}
    </div>
  );
}
