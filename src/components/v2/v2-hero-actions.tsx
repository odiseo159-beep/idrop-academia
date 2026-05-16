"use client";

import { Link } from "@/i18n/navigation";

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 12;
  window.scrollTo({ top, behavior: "smooth" });
}

interface V2HeroActionsProps {
  ctaLearn: string;
  ctaToday: string;
  freeLabel: string;
}

export function V2HeroActions({
  ctaLearn,
  ctaToday,
  freeLabel,
}: V2HeroActionsProps) {
  return (
    <div
      className="v2-hero-rise v2-hero-rise-4"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginTop: 32,
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={() => smoothScrollTo("academia")}
        className="v2-mono v2-cta-primary v2-arrow-shift"
        style={{
          padding: "14px 20px",
          background: "var(--color-bnb)",
          color: "#15110a",
          border: "none",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
        }}
      >
        {ctaLearn} <span className="v2-arrow">→</span>
      </button>
      <button
        type="button"
        onClick={() => smoothScrollTo("portada")}
        className="v2-mono v2-cta-ghost v2-arrow-shift"
        style={{
          padding: "14px 16px",
          background: "transparent",
          color: "var(--color-t-0)",
          border: "1px solid var(--color-line-3)",
          fontSize: 13,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        {ctaToday}
      </button>
      <Link
        href="/learn"
        className="v2-mono v2-mc"
        style={{
          marginLeft: 4,
          color: "var(--color-t-3)",
          textDecoration: "none",
        }}
      >
        {freeLabel}
      </Link>
    </div>
  );
}
