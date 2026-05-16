import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";

interface Props {
  locale: Locale;
}

export async function V2Ticker({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "v2.footer" });

  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-line-1)",
        paddingTop: 24,
        paddingBottom: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "0 64px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 12,
              height: 12,
              background: "var(--color-bnb)",
              transform: "rotate(45deg)",
              borderRadius: 2,
            }}
          />
          <div
            className="v2-mono"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-t-0)",
            }}
          >
            IDROP
          </div>
          <div
            className="v2-mono v2-mc"
            style={{ marginLeft: 8, color: "var(--color-t-3)" }}
          >
            {t("brandKicker")}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 16 }} />
        <div
          className="v2-mono v2-mc"
          style={{
            display: "flex",
            gap: 16,
            color: "var(--color-t-2)",
            flexWrap: "wrap",
          }}
        >
          <span>
            {t("block")}{" "}
            <span className="v2-tnum" style={{ color: "var(--color-t-0)" }}>
              48,712,841
            </span>
          </span>
          <span>
            GAS{" "}
            <span className="v2-tnum" style={{ color: "var(--color-t-0)" }}>
              0.11 GWEI
            </span>
          </span>
          <span>
            <span style={{ color: "var(--color-bnb)" }}>●</span> BNB{" "}
            <span className="v2-tnum" style={{ color: "var(--color-t-0)" }}>
              $612.04
            </span>
          </span>
          <span>
            ETH{" "}
            <span className="v2-tnum" style={{ color: "var(--color-t-0)" }}>
              $3,118
            </span>
          </span>
          <span>
            SOL{" "}
            <span className="v2-tnum" style={{ color: "var(--color-t-0)" }}>
              $184.20
            </span>
          </span>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          marginTop: 14,
          padding: "0 64px",
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)" }}
        >
          {t("copyright")}
        </div>
        <div style={{ flex: 1, minWidth: 16 }} />
        <div
          className="v2-mono v2-mc"
          style={{
            display: "flex",
            gap: 18,
            color: "var(--color-t-3)",
          }}
        >
          <Link href="/learn" style={{ color: "inherit" }}>
            {t("privacy")}
          </Link>
          <Link href="/learn" style={{ color: "inherit" }}>
            {t("terms")}
          </Link>
          <Link href="/learn" style={{ color: "inherit" }}>
            {t("contact")}
          </Link>
          <a
            href="https://cointelegraph.com/rss"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit" }}
          >
            RSS
          </a>
        </div>
      </div>
    </footer>
  );
}
