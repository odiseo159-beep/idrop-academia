import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { QUEST_OF_DAY_PATH } from "@/lib/quest-of-day";
import type { Locale, Module } from "@/lib/types";

interface V2AcademiaProps {
  locale: Locale;
  modules: Module[];
}

/** Tone for the module's giant numeral — bnb yellow at start, ember at end. */
function toneForIndex(index: number, total: number): "bnb" | "ember" | "neutral" {
  if (index === 0) return "bnb";
  if (index === total - 1) return "ember";
  return "neutral";
}

/** Editorial eyebrow per module slug (one-line poetic kicker). */
const EYEBROW_KEYS: Record<string, string> = {
  "fundamentos-bnb": "eyebrowStart",
  "wallets-seguridad": "eyebrowWallets",
  "defi-bnb": "eyebrowDefi",
  "tokens-bep20": "eyebrowTokens",
  "nfts-bep721": "eyebrowNfts",
  "memecoins-launchpads": "eyebrowMemecoins",
};

/**
 * Editorial running order for the Academia — beginner → advanced.
 * Modules with slugs not listed go at the end in their original order.
 */
const MODULE_ORDER: string[] = [
  "fundamentos-bnb",
  "wallets-seguridad",
  "defi-bnb",
  "tokens-bep20",
  "nfts-bep721",
  "memecoins-launchpads",
];

function orderModules(modules: Module[]): Module[] {
  const indexOf = (slug: string) => {
    const i = MODULE_ORDER.indexOf(slug);
    return i === -1 ? MODULE_ORDER.length : i;
  };
  return [...modules].sort((a, b) => indexOf(a.slug) - indexOf(b.slug));
}

export async function V2Academia({ locale, modules }: V2AcademiaProps) {
  const t = await getTranslations({ locale, namespace: "v2.academia" });
  const orderedModules = orderModules(modules);

  const totalLessons = orderedModules.reduce((s, m) => s + m.totalLessons, 0);
  const totalXp = orderedModules.reduce((s, m) => s + m.totalXp, 0);

  return (
    <section
      id="academia"
      style={{
        background: "var(--color-ink-0)",
        borderTop: "1px solid var(--color-line-1)",
        borderBottom: "1px solid var(--color-line-1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="v2-glow-edge"
        style={{
          width: 700,
          height: 700,
          left: -240,
          top: -200,
          background:
            "radial-gradient(circle, rgba(240,185,11,0.10), transparent 60%)",
          opacity: 0.6,
        }}
        aria-hidden
      />
      <div
        className="v2-glow-edge"
        style={{
          width: 700,
          height: 700,
          right: -240,
          bottom: -260,
          background:
            "radial-gradient(circle, rgba(204,86,224,0.08), transparent 60%)",
          opacity: 0.6,
        }}
        aria-hidden
      />

      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "72px 56px 72px",
          position: "relative",
        }}
      >
        {/* Section eyebrow */}
        <div
          data-rise
          className="v2-mono v2-mc"
          style={{ color: "var(--color-bnb)", letterSpacing: "0.18em" }}
        >
          § 02 · {t("title").toUpperCase()}{" "}
          <span style={{ color: "var(--color-t-3)" }}>
            / {t("hint").toUpperCase()}
          </span>
        </div>

        {/* Top row: title + stats */}
        <div
          className="v2-academia-top"
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 56,
            alignItems: "end",
          }}
        >
          <div data-rise>
            <h2
              className="v2-serif"
              style={{
                fontSize: "clamp(40px, 5vw, 64px)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                margin: 0,
                fontWeight: 400,
                color: "var(--color-t-0)",
              }}
            >
              {t("heroLine1")}
              <br />
              <span style={{ fontStyle: "italic", fontWeight: 300 }}>
                {t("heroLine2")}
                <span style={{ color: "var(--color-bnb)" }}>.</span>
              </span>
            </h2>
            <p
              style={{
                marginTop: 18,
                maxWidth: 620,
                fontSize: 15,
                lineHeight: 1.55,
                color: "var(--color-t-1)",
              }}
            >
              {t("heroBlurb")}
            </p>
          </div>

          <div
            data-rise
            data-rise-delay="80"
            className="v2-academia-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, auto)",
              gap: 64,
              paddingLeft: 24,
            }}
          >
            <V2BigStat
              label={t("statModules")}
              value={String(modules.length).padStart(2, "0")}
              unit={t("statModulesUnit")}
            />
            <V2BigStat
              label={t("statLessons")}
              value={String(totalLessons)}
              unit={t("statLessonsUnit")}
            />
            <V2BigStat
              label={t("statXp")}
              value={totalXp.toLocaleString("en-US")}
              unit={t("statXpUnit")}
            />
          </div>
        </div>

        {/* Difficulty journey rail */}
        <div
          data-rise
          data-rise-delay="120"
          className="v2-academia-rail"
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            className="v2-mono v2-mc"
            style={{
              color: "var(--color-bnb)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--color-bnb)",
                boxShadow: "0 0 0 4px rgba(240,185,11,0.18)",
              }}
            />
            {t("railStart")}
          </div>

          <div
            style={{
              flex: 1,
              height: 1,
              backgroundImage:
                "linear-gradient(to right, var(--color-line-2) 50%, transparent 50%)",
              backgroundSize: "12px 1px",
              backgroundRepeat: "repeat-x",
            }}
          />

          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)", flexShrink: 0 }}
          >
            {t("railProgression")}
          </div>

          <div
            style={{
              flex: 1,
              height: 1,
              backgroundImage:
                "linear-gradient(to right, var(--color-line-2) 50%, transparent 50%)",
              backgroundSize: "12px 1px",
              backgroundRepeat: "repeat-x",
            }}
          />

          <div
            className="v2-mono v2-mc"
            style={{
              color: "var(--color-ember)",
              flexShrink: 0,
            }}
          >
            {t("railEnd")}
          </div>
        </div>

        {/* The six module cards */}
        <div
          className="v2-academia-grid"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: `repeat(${orderedModules.length}, minmax(0, 1fr))`,
            gap: 16,
          }}
        >
          {orderedModules.map((m, i) => (
            <V2ModuleCard
              key={m.slug}
              module={m}
              index={i}
              total={orderedModules.length}
              eyebrow={t(
                EYEBROW_KEYS[m.slug] ?? "eyebrowDefault"
              )}
              labels={{
                temario: t("temario"),
                moreLesson: (n: number) => t("moreLessons", { count: n }),
                lessonsShort: t("lessonsShort"),
                minShort: t("minShort"),
                start: t("start"),
                open: t("open"),
                beginner: t("levelBeginner"),
                intermediate: t("levelIntermediate"),
                advanced: t("levelAdvanced"),
              }}
            />
          ))}
        </div>

        {/* Quest diaria — bottom strip */}
        <div
          data-rise
          data-rise-delay="160"
          className="v2-quest-strip"
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "auto 1fr auto auto",
            gap: 28,
            alignItems: "center",
            padding: "20px 28px",
            border: "1px solid var(--color-line-2)",
            background: "var(--color-ink-1)",
          }}
        >
          <span
            className="v2-mono v2-mc"
            style={{ color: "var(--color-bnb)", flexShrink: 0 }}
          >
            {t("questLabel")}
          </span>
          <div>
            <div
              className="v2-serif"
              style={{
                fontSize: 20,
                color: "var(--color-t-0)",
                letterSpacing: "-0.01em",
              }}
            >
              {t.rich("questText", {
                italic: (chunks) => (
                  <span style={{ fontStyle: "italic" }}>{chunks}</span>
                ),
              })}
            </div>
            <div
              className="v2-mono v2-mc"
              style={{ marginTop: 6, color: "var(--color-t-3)" }}
            >
              {t("questMeta")}
            </div>
          </div>
          <div
            className="v2-mono v2-mc"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              color: "var(--color-t-3)",
            }}
          >
            <span>{t("streak")}</span>
            <span
              className="v2-serif v2-tnum"
              style={{
                fontSize: 28,
                color: "var(--color-t-0)",
                fontWeight: 400,
              }}
            >
              03
            </span>
            <span>{t("streakUnit")}</span>
          </div>
          <Link
            href={QUEST_OF_DAY_PATH}
            className="v2-mono v2-cta-ghost v2-arrow-shift"
            style={{
              border: "1px solid var(--color-bnb)",
              color: "var(--color-bnb)",
              background: "transparent",
              padding: "10px 18px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontSize: 11,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span className="v2-arrow">▸</span> {t("questCta")}
          </Link>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 1400px) {
            .v2-academia-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 1100px) {
            .v2-academia-top {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
              align-items: start !important;
            }
            .v2-academia-stats {
              padding-left: 0 !important;
            }
            .v2-academia-rail {
              flex-wrap: wrap !important;
            }
          }
          @media (max-width: 880px) {
            .v2-academia-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
            .v2-academia-stats {
              gap: 32px !important;
            }
            .v2-quest-strip {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
          }
          @media (max-width: 560px) {
            .v2-academia-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </section>
  );
}

/* ───────── Big stat ─────────── */

function V2BigStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div>
      <div
        className="v2-mono v2-mc"
        style={{ color: "var(--color-t-3)", marginBottom: 8 }}
      >
        {label}
      </div>
      <div
        className="v2-serif v2-tnum"
        style={{
          fontSize: 44,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--color-t-0)",
          fontWeight: 400,
        }}
      >
        {value}
      </div>
      <div
        className="v2-mono"
        style={{
          marginTop: 8,
          fontSize: 10.5,
          letterSpacing: "0.08em",
          color: "var(--color-t-2)",
        }}
      >
        {unit}
      </div>
    </div>
  );
}

/* ───────── Module card ─────────── */

function V2ModuleCard({
  module: m,
  index,
  total,
  eyebrow,
  labels,
}: {
  module: Module;
  index: number;
  total: number;
  eyebrow: string;
  labels: {
    temario: string;
    moreLesson: (n: number) => string;
    lessonsShort: string;
    minShort: string;
    start: string;
    open: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  };
}) {
  const tone = toneForIndex(index, total);
  const numeralColor =
    tone === "bnb"
      ? "var(--color-bnb)"
      : tone === "ember"
        ? "var(--color-ember)"
        : "var(--color-t-0)";
  const isAvailable = m.status === "available";
  const code = String(index + 1).padStart(2, "0");

  const previewLessons = m.lessons.slice(0, 3);
  const extraLessons = Math.max(0, m.lessons.length - previewLessons.length);

  const levelLabel =
    m.difficulty === "beginner"
      ? labels.beginner
      : m.difficulty === "intermediate"
        ? labels.intermediate
        : labels.advanced;

  const levelDotColor =
    tone === "bnb"
      ? "var(--color-bnb)"
      : tone === "ember"
        ? "var(--color-ember)"
        : "var(--color-t-3)";

  return (
    <Link
      data-rise
      data-rise-delay={index * 60}
      href={isAvailable ? `/learn/${m.slug}` : "/learn"}
      className="v2-card-hover"
      style={{
        border: "1px solid var(--color-line-2)",
        background: "var(--color-ink-1)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        opacity: isAvailable ? 1 : 0.7,
      }}
    >
      {/* M.0X · CATEGORY */}
      <div
        className="v2-mono v2-mc"
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "var(--color-t-3)",
        }}
      >
        <span>M.{code}</span>
        <span>{m.category.toUpperCase()}</span>
      </div>

      {/* Big numeral */}
      <div
        className="v2-serif v2-tnum"
        style={{
          fontSize: 72,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: numeralColor,
          marginTop: 22,
          fontWeight: 400,
        }}
      >
        {code}
      </div>

      {/* Eyebrow phrase */}
      <div
        className="v2-mono v2-mc"
        style={{
          marginTop: 24,
          color: "var(--color-t-2)",
        }}
      >
        {eyebrow}
      </div>

      {/* Title */}
      <h3
        className="v2-serif"
        style={{
          fontSize: 22,
          lineHeight: 1.15,
          letterSpacing: "-0.012em",
          margin: "10px 0 12px",
          fontWeight: 500,
          color: "var(--color-t-0)",
        }}
      >
        {m.title}
      </h3>

      {/* Blurb */}
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          color: "var(--color-t-1)",
          lineHeight: 1.55,
        }}
      >
        {m.tagline}
      </p>

      {/* Temario */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: "1px solid var(--color-line-1)",
        }}
      >
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 12 }}
        >
          {labels.temario}
        </div>
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {previewLessons.map((lesson, i) => (
            <li
              key={lesson.slug}
              style={{
                display: "grid",
                gridTemplateColumns: "22px 1fr",
                gap: 10,
                fontSize: 12.5,
                color: "var(--color-t-1)",
                lineHeight: 1.4,
              }}
            >
              <span
                className="v2-mono v2-tnum"
                style={{
                  color: "var(--color-t-3)",
                  fontSize: 11,
                  paddingTop: 1,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {lesson.title}
              </span>
            </li>
          ))}
        </ol>
        {extraLessons > 0 && (
          <div
            className="v2-mono"
            style={{
              marginTop: 10,
              fontSize: 11,
              color: "var(--color-t-3)",
              letterSpacing: "0.04em",
            }}
          >
            {labels.moreLesson(extraLessons)}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: "1px solid var(--color-line-1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)" }}
        >
          {m.totalLessons} {labels.lessonsShort} · {m.durationMinutes}{" "}
          {labels.minShort}
        </span>
        <span
          className="v2-mono v2-mc"
          style={{ color: numeralColor }}
        >
          +{m.totalXp} XP
        </span>
      </div>

      {/* CTA row */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          className="v2-mono v2-mc"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-t-3)",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: 999,
              background: levelDotColor,
            }}
          />
          {levelLabel.toUpperCase()}
        </span>
        <span
          className="v2-mono v2-mc v2-arrow-shift"
          style={{
            color: numeralColor,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {index === 0 ? labels.start : labels.open}{" "}
          <span className="v2-arrow">→</span>
        </span>
      </div>
    </Link>
  );
}
