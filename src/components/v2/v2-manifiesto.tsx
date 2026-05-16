import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { V2ManifiestoCta } from "./v2-manifiesto-cta";
import type { Locale } from "@/lib/types";

interface V2ManifiestoProps {
  locale: Locale;
}

export async function V2Manifiesto({ locale }: V2ManifiestoProps) {
  const t = await getTranslations({ locale, namespace: "v2.manifiesto" });

  const pillars = [
    {
      num: "001",
      head: t("pillar1Head"),
      points: [t("pillar1P1"), t("pillar1P2"), t("pillar1P3")],
    },
    {
      num: "002",
      head: t("pillar2Head"),
      points: [t("pillar2P1"), t("pillar2P2"), t("pillar2P3")],
    },
    {
      num: "003",
      head: t("pillar3Head"),
      points: [t("pillar3P1"), t("pillar3P2"), t("pillar3P3")],
    },
  ];

  return (
    <section
      style={{
        maxWidth: 1600,
        margin: "0 auto",
        padding: "96px 64px",
        position: "relative",
      }}
    >
      <div className="v2-hairline" style={{ height: 1 }} />
      <div
        className="v2-manifiesto-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          marginTop: 56,
        }}
      >
        <div data-rise>
          <div
            className="v2-mono v2-mc"
            style={{ marginBottom: 18, color: "var(--color-t-3)" }}
          >
            § 03 · {t("eyebrow")}
          </div>
          <h2
            className="v2-serif"
            style={{
              fontSize: 64,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: 0,
              fontWeight: 400,
              color: "var(--color-t-0)",
              textWrap: "balance",
            }}
          >
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
            <br />
            <span style={{ fontStyle: "italic", fontWeight: 300 }}>
              {t("titleLine3")}
              <span style={{ color: "var(--color-bnb)" }}>.</span>
            </span>
          </h2>
          <p
            style={{
              marginTop: 24,
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 520,
              color: "var(--color-t-1)",
            }}
          >
            {t("body")}
          </p>
          <V2ManifiestoCta
            ctaPrimary={t("ctaPrimary")}
            ctaSecondary={t("ctaSecondary")}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {pillars.map((p, i) => (
            <div key={p.num}>
              <div data-rise data-rise-delay={80 + i * 80}>
                <V2Pillar num={p.num} head={p.head} points={p.points} />
              </div>
              {i < pillars.length - 1 && (
                <div
                  className="v2-hairline-1"
                  style={{ height: 1, margin: "24px 0" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @media (max-width: 1100px) {
            .v2-manifiesto-grid {
              grid-template-columns: 1fr !important;
              gap: 48px !important;
            }
          }
        `}
      </style>
    </section>
  );
}

function V2Pillar({
  num,
  head,
  points,
}: {
  num: string;
  head: string;
  points: string[];
}) {
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 18 }}
    >
      <div className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
        /{num}
      </div>
      <div>
        <div
          className="v2-serif"
          style={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "var(--color-t-0)",
          }}
        >
          {head}
        </div>
        <ul
          style={{
            margin: "12px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {points.map((p, i) => (
            <li
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "14px 1fr",
                gap: 12,
                fontSize: 13.5,
                color: "var(--color-t-1)",
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  marginTop: 7,
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: "var(--color-bnb)",
                  display: "inline-block",
                }}
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
