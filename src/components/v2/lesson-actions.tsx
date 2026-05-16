"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

interface LessonActionsProps {
  /** Used to build the share URL. */
  moduleSlug: string;
  lessonSlug: string;
  /** Whether the lesson was already marked. Drives "Marcar" copy. */
  bookmarked: boolean;
  /** Opens the share modal (A4). */
  onShare: () => void;
}

/**
 * LessonActions — 2x2 grid of quick actions in the sidebar:
 *
 *   Marcar          | Compartir
 *   Transcript      | Reportar
 *
 * Transcript + Reportar are placeholders for now (no UI yet — they nofx).
 */
export function LessonActions({
  moduleSlug,
  lessonSlug,
  bookmarked,
  onShare,
}: LessonActionsProps) {
  const t = useTranslations("v2.lesson.actions");
  const [marked, setMarked] = useState(bookmarked);

  const handleMark = useCallback(() => {
    // Local bookmark only — not the same as "completed". Stored under a
    // separate key so users can pin lessons without claiming XP.
    if (typeof window === "undefined") return;
    const key = `idrop-bookmarks:${moduleSlug}/${lessonSlug}`;
    if (marked) {
      window.localStorage.removeItem(key);
      setMarked(false);
    } else {
      window.localStorage.setItem(key, String(Date.now()));
      setMarked(true);
    }
  }, [moduleSlug, lessonSlug, marked]);

  const actions = [
    {
      icon: marked ? "☑" : "☐",
      label: t("mark"),
      note: marked ? t("markSaved") : t("markNotYet"),
      onClick: handleMark,
      highlighted: marked,
    },
    {
      icon: "↗",
      label: t("share"),
      note: t("shareNote", { lesson: lessonSlug }),
      onClick: onShare,
      highlighted: false,
    },
    {
      icon: "⤓",
      label: t("transcript"),
      note: t("transcriptNote"),
      onClick: () => {},
      highlighted: false,
    },
    {
      icon: "⚑",
      label: t("report"),
      note: t("reportNote"),
      onClick: () => {},
      highlighted: false,
    },
  ];

  return (
    <div
      style={{
        border: "1px solid var(--color-line-1)",
        background: "rgba(7,8,13,0.55)",
      }}
    >
      <div
        className="v2-mono v2-mc"
        style={{
          padding: "12px 18px 8px",
          display: "flex",
          justifyContent: "space-between",
          color: "var(--color-t-3)",
        }}
      >
        <span>{t("title")}</span>
        <span style={{ color: "var(--color-t-4)" }}>{actions.length}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {actions.map((a, i) => (
          <button
            type="button"
            key={i}
            onClick={a.onClick}
            style={{
              background: "transparent",
              border: "none",
              borderTop: "1px solid var(--color-line-1)",
              borderRight:
                i % 2 === 0 ? "1px solid var(--color-line-1)" : "none",
              padding: "12px 14px",
              textAlign: "left",
              cursor: "pointer",
              color: "var(--color-t-1)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "inherit",
            }}
          >
            <span
              className="v2-mono"
              style={{
                fontSize: 16,
                color: a.highlighted
                  ? "var(--color-bnb)"
                  : "var(--color-t-2)",
                width: 18,
              }}
            >
              {a.icon}
            </span>
            <div style={{ flex: 1 }}>
              <div
                className="v2-mono v2-mc"
                style={{ color: "var(--color-t-1)" }}
              >
                {a.label}
              </div>
              <div
                className="v2-mono v2-mc"
                style={{
                  marginTop: 2,
                  fontSize: 9.5,
                  color: "var(--color-t-3)",
                }}
              >
                {a.note}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
