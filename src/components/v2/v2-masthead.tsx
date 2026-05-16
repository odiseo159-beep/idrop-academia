"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link as I18nLink, useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { LiveTime } from "@/components/landing/live-time";
import { QUEST_OF_DAY_PATH } from "@/lib/quest-of-day";

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 12;
  window.scrollTo({ top, behavior: "smooth" });
}

const SECTION_IDS = ["top", "portada", "envivo", "academia"];

export function V2Masthead() {
  const t = useTranslations("v2.masthead");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [active, setActive] = useState("top");

  // pathname here is locale-stripped by next-intl ("/", "/learn/...", "/profile").
  // The nav anchors only resolve on the landing root; from anywhere else we
  // navigate to the landing-with-anchor instead of dead-clicking.
  const isLanding = pathname === "/" || pathname === "";

  useEffect(() => {
    if (!isLanding) return;
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isLanding]);

  const navItem = (id: string, label: string) => (
    <a
      key={id}
      href={isLanding ? `#${id}` : `/${locale}#${id}`}
      onClick={(e) => {
        if (!isLanding) return; // let the browser navigate cross-route
        e.preventDefault();
        smoothScrollTo(id);
      }}
      className={`v2-nav-link v2-mono ${isLanding && active === id ? "active" : ""}`}
      style={{
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color:
          isLanding && active === id
            ? "var(--color-t-0)"
            : "var(--color-t-1)",
      }}
    >
      {label}
    </a>
  );

  function switchLocale(next: Locale) {
    if (next === locale) return;
    // @ts-expect-error next-intl router accepts dynamic params
    router.replace({ pathname, params }, { locale: next });
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(7,8,13,0.86)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-line-1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          maxWidth: 1600,
          margin: "0 auto",
          padding: "18px 32px 16px",
        }}
      >
        <a
          href={`/${locale}`}
          onClick={(e) => {
            if (!isLanding) return; // cross-route nav handled by browser
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              background: "var(--color-bnb)",
              transform: "rotate(45deg)",
              borderRadius: 2,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <div
              className="v2-mono"
              style={{
                fontSize: 22,
                letterSpacing: "-0.02em",
                fontWeight: 600,
                color: "var(--color-t-0)",
              }}
            >
              IDROP
            </div>
            <div
              className="v2-mono v2-mc"
              style={{ marginTop: 4, color: "var(--color-t-2)", fontSize: 9.5 }}
            >
              {t("brandKicker")}
            </div>
          </div>
        </a>

        <div
          className="v2-mono v2-mc"
          style={{
            marginLeft: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "var(--color-t-3)",
          }}
        >
          <span className="v2-tick pulse" />
          <span>
            {t("editionLabel")}{" "}
            <LiveTime className="v2-tnum" showSeconds={false} />
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <nav
          style={{ display: "flex", gap: 28 }}
          aria-label="In-page sections"
        >
          {navItem("portada", t("navPortada"))}
          {navItem("envivo", t("navEnVivo"))}
          {navItem("academia", t("navAcademia"))}
          {/* Eager prefetch on the most likely first-click destination so the
              lesson page is warm in cache before the user hovers. */}
          <I18nLink
            href={QUEST_OF_DAY_PATH}
            prefetch
            className="v2-nav-link v2-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-t-1)",
            }}
          >
            {t("navDiscover")}
          </I18nLink>
        </nav>

        <div
          className="v2-mono v2-mc"
          style={{
            display: "flex",
            gap: 6,
            color: "var(--color-t-3)",
          }}
        >
          {routing.locales.map((l, i) => (
            <span key={l} style={{ display: "inline-flex", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => switchLocale(l)}
                aria-label={`Switch language to ${l.toUpperCase()}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: l === locale ? "var(--color-t-0)" : "inherit",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  letterSpacing: "inherit",
                  textTransform: "inherit",
                }}
              >
                {l.toUpperCase()}
              </button>
              {i < routing.locales.length - 1 && (
                <span style={{ margin: "0 4px" }}>·</span>
              )}
            </span>
          ))}
        </div>

        <I18nLink
          href="/profile"
          className="v2-mono v2-mc"
          style={{
            padding: "9px 14px",
            background: "transparent",
            color: "var(--color-t-1)",
            border: "1px solid var(--color-line-3)",
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          {t("login")}
        </I18nLink>

        <I18nLink
          href={QUEST_OF_DAY_PATH}
          prefetch
          className="v2-mono v2-cta-primary"
          style={{
            padding: "9px 14px",
            background: "var(--color-bnb)",
            color: "#15110a",
            border: "none",
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {t("ctaEnter")} <span>→</span>
        </I18nLink>
      </div>
      <div
        style={{
          height: 2,
          background: "var(--color-bnb)",
          opacity: 0.85,
          maxWidth: 1312,
          margin: "0 auto",
        }}
      />
    </header>
  );
}
