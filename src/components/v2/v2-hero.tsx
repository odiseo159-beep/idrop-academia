import { getTranslations } from "next-intl/server";
import { V2HeroActions } from "./v2-hero-actions";
import { WireSphere } from "./wire-sphere";
import type { Locale } from "@/lib/types";

interface V2HeroProps {
  locale: Locale;
  moduleCount: number;
  lessonCount: number;
}

export async function V2Hero({
  locale,
  moduleCount,
  lessonCount,
}: V2HeroProps) {
  const t = await getTranslations({ locale, namespace: "v2.hero" });

  return (
    <section
      id="top"
      style={{
        maxWidth: 1600,
        margin: "0 auto",
        padding: "56px 64px 48px",
        position: "relative",
      }}
      className="v2-hero-grid"
    >
      <div
        className="v2-glow-edge"
        style={{
          width: 520,
          height: 520,
          right: -120,
          top: -120,
          background:
            "radial-gradient(circle, rgba(204,86,224,0.10), transparent 60%)",
          opacity: 0.7,
        }}
        aria-hidden
      />

      <div className="v2-hero-left">
        <div
          className="v2-mono v2-mc v2-hero-rise v2-hero-rise-1"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 18,
            color: "var(--color-t-3)",
          }}
        >
          <span className="v2-tick pulse" />
          <span>{t("liveLabel")}</span>
          <span style={{ color: "var(--color-t-4)" }}>/</span>
          <span>{t("dailyLabel")}</span>
          <span style={{ color: "var(--color-t-4)" }}>/</span>
          <span>{t("audienceLabel")}</span>
        </div>

        <h1
          className="v2-serif v2-hero-rise v2-hero-rise-2"
          style={{
            fontSize: "clamp(48px, 7vw, 96px)",
            lineHeight: 0.94,
            letterSpacing: "-0.025em",
            margin: 0,
            fontWeight: 400,
            color: "var(--color-t-0)",
            textWrap: "balance",
          }}
        >
          {t("titleLine1")}
          <span style={{ color: "var(--color-bnb)" }}>,</span>
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 300 }}>
            {t("titleLine2")}
          </span>
        </h1>

        <p
          className="v2-hero-rise v2-hero-rise-3"
          style={{
            marginTop: 26,
            maxWidth: 580,
            fontSize: 17.5,
            color: "var(--color-t-1)",
            lineHeight: 1.55,
          }}
        >
          {t.rich("kicker", {
            italic: (chunks) => (
              <span className="v2-serif" style={{ fontStyle: "italic" }}>
                {chunks}
              </span>
            ),
          })}
        </p>

        <V2HeroActions
          ctaLearn={t("ctaLearn")}
          ctaToday={t("ctaToday")}
          freeLabel={t("freeLabel")}
        />
      </div>

      {/* Right "edition card" */}
      <div
        className="v2-hero-rise v2-hero-rise-5 v2-hero-right"
        style={{
          position: "relative",
          borderLeft: "1px solid var(--color-line-1)",
          paddingLeft: 40,
        }}
      >
        <div
          className="v2-mono v2-mc"
          style={{ marginBottom: 18, color: "var(--color-t-3)" }}
        >
          {t("editionFicha")}
        </div>
        <div
          style={{ position: "absolute", right: -10, top: -20, opacity: 0.6 }}
        >
          <WireSphere
            size={210}
            stroke="rgba(255,255,255,0.22)"
            spin
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: 28,
            columnGap: 0,
            marginTop: 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          <V2Stat label={t("statModules")} value={String(moduleCount).padStart(2, "0")} unit={t("statModulesUnit")} />
          <V2Stat label={t("statLessons")} value={`${lessonCount}+`} unit={t("statLessonsUnit")} />
          <V2Stat label={t("statLanguages")} value="ES/EN" unit={t("statLanguagesUnit")} />
          <V2Stat label={t("statCost")} value="$0.00" unit={t("statCostUnit")} />
        </div>
        <div
          className="v2-hairline-1"
          style={{ height: 1, marginTop: 32 }}
        />
        <div
          className="v2-mono v2-mc"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 14,
            color: "var(--color-t-3)",
          }}
        >
          <span>BNB</span>
          <span>opBNB</span>
          <span>ETH</span>
          <span>SOL</span>
          <span>· · ·</span>
        </div>
      </div>

      <style>
        {`
          .v2-hero-grid {
            display: grid;
            grid-template-columns: 1fr 520px;
            gap: 72px;
          }
          @media (max-width: 1100px) {
            .v2-hero-grid {
              grid-template-columns: 1fr;
              gap: 40px;
            }
            .v2-hero-right {
              border-left: none !important;
              padding-left: 0 !important;
              border-top: 1px solid var(--color-line-1);
              padding-top: 32px;
            }
          }
        `}
      </style>
    </section>
  );
}

function V2Stat({
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
        style={{ marginBottom: 6, color: "var(--color-t-3)" }}
      >
        {label}
      </div>
      <div
        className="v2-serif"
        style={{
          fontSize: 38,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--color-t-0)",
        }}
      >
        {value}
      </div>
      <div
        className="v2-mono"
        style={{
          fontSize: 11,
          color: "var(--color-t-2)",
          marginTop: 7,
          letterSpacing: "0.04em",
        }}
      >
        {unit}
      </div>
    </div>
  );
}
