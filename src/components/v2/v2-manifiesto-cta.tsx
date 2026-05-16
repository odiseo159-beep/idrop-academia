"use client";

interface Props {
  ctaPrimary: string;
  ctaSecondary: string;
}

/**
 * Both CTAs land on the §02 Academia section of the same landing — the
 * difference is rhetorical (start vs. browse). Plain `<a href="#academia">`
 * does in-page anchor navigation: scroll position changes, URL bar updates
 * to `…/es#academia`, and there's no client-router redirect chain (which
 * was previously sending users through `/learn` → meta-refresh → /#academia
 * with a visible delay).
 *
 * Smooth scrolling is driven by `html { scroll-behavior: smooth }` in
 * globals.css so the browser does it natively.
 */
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
      <a
        href="#academia"
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
          textDecoration: "none",
        }}
      >
        {ctaPrimary} <span className="v2-arrow">→</span>
      </a>
      <a
        href="#academia"
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
      </a>
    </div>
  );
}
