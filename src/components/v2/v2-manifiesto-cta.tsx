"use client";

import { Link } from "@/i18n/navigation";

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 12;
  window.scrollTo({ top, behavior: "smooth" });
}

interface Props {
  ctaPrimary: string;
  ctaSecondary: string;
}

export function V2ManifiestoCta({ ctaPrimary, ctaSecondary }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        marginTop: 28,
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={() => smoothScrollTo("academia")}
        className="v2-mono v2-cta-primary v2-arrow-shift"
        style={{
          padding: "14px 18px",
          background: "var(--color-bnb)",
          color: "#15110a",
          border: "none",
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {ctaPrimary} <span className="v2-arrow">→</span>
      </button>
      <Link
        href="/learn"
        className="v2-mono v2-cta-ghost"
        style={{
          padding: "14px 16px",
          background: "transparent",
          color: "var(--color-t-0)",
          border: "1px solid var(--color-line-3)",
          fontSize: 12.5,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        {ctaSecondary}
      </Link>
    </div>
  );
}
