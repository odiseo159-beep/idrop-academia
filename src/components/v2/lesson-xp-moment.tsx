"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";

interface LessonXpMomentProps {
  open: boolean;
  onClose: () => void;
  /** Total XP earned for this lesson (sum of breakdown). */
  totalXp: number;
  /** Per-source breakdown (Video, Lectura, Quiz). */
  breakdown: { label: string; value: number; bonus?: boolean }[];
  /** Module label "M.01" and lesson label "L.01" for the kicker line. */
  moduleCode: string;
  lessonCode: string;
  /** Time the user took to complete (formatted, e.g. "14 m 22 s"). */
  completedInLabel: string;
  /** Module name + progress. */
  moduleName: string;
  modulePct: number;
  moduleCompletedLessons: number;
  moduleTotalLessons: number;
  /** Streak state for the right column. */
  streakDays: number;
  /** Streak BEFORE this completion — drives the strikethrough "03". */
  previousStreakDays: number | null;
  /** Called when user clicks "Compartir en X" — opens the share modal. */
  onShare: () => void;
  /** Called when user clicks "Continuar L.02 →". */
  onContinue: () => void;
  /** Auto-close after N seconds (default 8). 0 disables. */
  autoCloseSec?: number;
}

/**
 * LessonXpMoment — the editorial "+100 XP" celebration shown right after the
 * user marks a lesson complete (A3). Built on Radix Dialog for focus-trap +
 * Esc + scroll-lock. Sparse confetti dots float against the scrim.
 */
export function LessonXpMoment({
  open,
  onClose,
  totalXp,
  breakdown,
  moduleCode,
  lessonCode,
  completedInLabel,
  moduleName,
  modulePct,
  moduleCompletedLessons,
  moduleTotalLessons,
  streakDays,
  previousStreakDays,
  onShare,
  onContinue,
  autoCloseSec = 8,
}: LessonXpMomentProps) {
  const t = useTranslations("v2.lesson.xpMoment");
  const [secsLeft, setSecsLeft] = useState(autoCloseSec);

  useEffect(() => {
    if (!open || !autoCloseSec) return;
    setSecsLeft(autoCloseSec);
    const interval = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, autoCloseSec, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7,8,13,0.82)",
            backdropFilter: "blur(2px)",
            zIndex: 60,
          }}
        />
        <Dialog.Content
          aria-describedby={undefined}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 61,
            width: 680,
            maxWidth: "calc(100vw - 48px)",
            padding: "36px 44px 32px",
            background: "var(--color-ink-1)",
            border: "1px solid var(--color-bnb-line)",
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(240,185,11,0.06)",
            outline: "none",
          }}
        >
          <Dialog.Title className="sr-only">{t("a11yTitle")}</Dialog.Title>

          {/* Soft yellow glow above the modal */}
          <div
            className="v2-glow-edge"
            style={{
              width: 360,
              height: 360,
              left: "50%",
              top: -120,
              transform: "translateX(-50%)",
              background:
                "radial-gradient(circle, rgba(240,185,11,0.30), transparent 60%)",
              opacity: 0.7,
            }}
          />

          {/* Confetti */}
          <ConfettiField />

          {/* Top kicker */}
          <div
            className="v2-mono v2-mc"
            style={{
              color: "var(--color-bnb)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "center",
            }}
          >
            <span className="v2-tick pulse" />
            <span>
              {moduleCode} · {lessonCode}
              {completedInLabel ? (
                <>
                  {" "}
                  · {t("completedIn")}{" "}
                  <span className="v2-tnum">{completedInLabel}</span>
                </>
              ) : null}
            </span>
          </div>

          {/* Heading */}
          <div
            className="v2-serif"
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--color-t-2)",
              marginTop: 22,
              textAlign: "center",
              fontWeight: 400,
            }}
          >
            {t("headline")}
          </div>

          {/* BIG XP counter */}
          <div
            style={{
              marginTop: 8,
              textAlign: "center",
              position: "relative",
            }}
          >
            <div
              className="v2-serif v2-tnum"
              style={{
                fontSize: 168,
                lineHeight: 0.86,
                fontStyle: "italic",
                fontWeight: 300,
                letterSpacing: "-0.045em",
                color: "var(--color-bnb)",
              }}
            >
              <span
                style={{
                  color: "var(--color-t-2)",
                  fontSize: 88,
                  marginRight: 8,
                  verticalAlign: "top",
                }}
              >
                +
              </span>
              {totalXp}
            </div>
            <div
              className="v2-mono v2-mc"
              style={{
                color: "var(--color-bnb)",
                marginTop: 4,
                letterSpacing: "0.22em",
              }}
            >
              XP &nbsp;·&nbsp; {t("earnedUpper")}
            </div>
          </div>

          {/* Breakdown */}
          <div
            style={{
              marginTop: 22,
              padding: "12px 16px",
              background: "rgba(7,8,13,0.6)",
              border: "1px solid var(--color-line-1)",
            }}
          >
            <div
              className="v2-mono v2-mc"
              style={{
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                color: "var(--color-t-3)",
              }}
            >
              <span>{t("breakdown")}</span>
              <span style={{ color: "var(--color-bnb)" }}>+{totalXp} {t("total")}</span>
            </div>
            {breakdown.map((row, i) => (
              <BreakdownRow
                key={i}
                label={row.label}
                value={`+${row.value}`}
                bonus={row.bonus}
              />
            ))}
          </div>

          {/* Streak + module progress */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              marginTop: 18,
            }}
          >
            <StreakBlock
              streakDays={streakDays}
              previousStreakDays={previousStreakDays}
              label={t("streak")}
              daysLabel={t("days")}
            />

            <ModuleProgressBlock
              moduleCode={moduleCode}
              moduleName={moduleName}
              modulePct={modulePct}
              moduleCompletedLessons={moduleCompletedLessons}
              moduleTotalLessons={moduleTotalLessons}
              lessonsLabel={t("lessonsOf", {
                done: moduleCompletedLessons,
                total: moduleTotalLessons,
              })}
            />
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
            <button
              type="button"
              onClick={onShare}
              className="v2-mono v2-mc"
              style={{
                flex: 1,
                padding: "14px 18px",
                background: "var(--color-bnb)",
                color: "#15110a",
                border: "none",
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ↗ {t("share")}
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="v2-mono v2-mc v2-arrow-shift"
              style={{
                flex: 1,
                padding: "14px 18px",
                background: "transparent",
                color: "var(--color-t-0)",
                border: "1px solid var(--color-line-3)",
                fontSize: 11.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "inherit",
              }}
            >
              {t("continueNext")} <span className="v2-arrow">→</span>
            </button>
          </div>

          {autoCloseSec > 0 && (
            <div
              className="v2-mono v2-mc"
              style={{
                marginTop: 14,
                textAlign: "center",
                color: "var(--color-t-3)",
              }}
            >
              {t("autoClose", { secs: secsLeft })}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ────────────────────────────────────────────── */

function BreakdownRow({
  label,
  value,
  bonus,
}: {
  label: string;
  value: string;
  bonus?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <span style={{ fontSize: 13, color: "var(--color-t-1)", flex: 1 }}>
        {label}
      </span>
      {bonus && (
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
          BONUS
        </span>
      )}
      <span
        className="v2-serif v2-tnum"
        style={{
          fontSize: 18,
          fontStyle: "italic",
          color: "var(--color-bnb)",
          fontWeight: 400,
          letterSpacing: "-0.015em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function StreakBlock({
  streakDays,
  previousStreakDays,
  label,
  daysLabel,
}: {
  streakDays: number;
  previousStreakDays: number | null;
  label: string;
  daysLabel: string;
}) {
  // 7-day visual: filled = streakDays clamped to 7, last-filled gets the ring
  const visualDays = Array.from({ length: 7 }).map((_, i) => i < streakDays);
  const newIndex = Math.min(streakDays - 1, 6);

  return (
    <div>
      <div
        className="v2-mono v2-mc"
        style={{ marginBottom: 8, color: "var(--color-t-3)" }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          className="v2-serif v2-tnum"
          style={{
            fontSize: 44,
            fontStyle: "italic",
            color: "var(--color-bnb)",
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.025em",
          }}
        >
          {String(streakDays).padStart(2, "0")}
        </span>
        {previousStreakDays != null && previousStreakDays !== streakDays && (
          <span
            className="v2-serif v2-tnum"
            style={{
              fontSize: 18,
              color: "var(--color-t-3)",
              fontStyle: "italic",
              textDecoration: "line-through",
              textDecorationColor: "var(--color-t-4)",
            }}
          >
            {String(previousStreakDays).padStart(2, "0")}
          </span>
        )}
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
          {daysLabel}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
        {visualDays.map((on, i) => (
          <span
            key={i}
            style={{
              width: 14,
              height: 14,
              border: "1px solid var(--color-line-2)",
              background: on ? "var(--color-bnb)" : "transparent",
              display: "inline-block",
              boxShadow:
                i === newIndex ? "0 0 0 2px rgba(240,185,11,0.25)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleProgressBlock({
  moduleCode,
  moduleName,
  modulePct,
  lessonsLabel,
}: {
  moduleCode: string;
  moduleName: string;
  modulePct: number;
  moduleCompletedLessons: number;
  moduleTotalLessons: number;
  lessonsLabel: string;
}) {
  return (
    <div>
      <div
        className="v2-mono v2-mc"
        style={{ marginBottom: 8, color: "var(--color-t-3)" }}
      >
        {moduleCode} {moduleName.toUpperCase()}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          className="v2-serif v2-tnum"
          style={{
            fontSize: 44,
            fontStyle: "italic",
            color: "var(--color-bnb)",
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.025em",
          }}
        >
          {modulePct}%
        </span>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
          {lessonsLabel}
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: "var(--color-line-1)",
          marginTop: 10,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${modulePct}%`,
            background: "var(--color-bnb)",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function ConfettiField() {
  const dots = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => {
      const seed = (i * 37) % 100;
      const top = ((seed * 13) % 92) + 4;
      const left = ((seed * 7) % 96) + 2;
      const size = 2 + (i % 3);
      const color = i % 4 === 0 ? "var(--color-bnb)" : "rgba(241,242,246,0.18)";
      return { top, left, size, color };
    });
  }, []);
  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${d.top}%`,
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            borderRadius: 999,
            background: d.color,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
