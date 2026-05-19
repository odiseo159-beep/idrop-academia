"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import { Insignia } from "@/components/v2/insignia";

interface LessonXpMomentProps {
  open: boolean;
  onClose: () => void;
  /** Module slug — drives the Insignia visual (numeral + tone). */
  moduleSlug: string;
  /** Lesson XP (legacy prop, no longer rendered as a number). Kept for callsite compatibility. */
  totalXp: number;
  /** Per-source breakdown (Video, Lectura, Quiz) — now shown as checklist rather than XP rows. */
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
 * LessonXpMoment — celebration shown right after a lesson is marked complete (A3).
 *
 * Insignia paradigm: the centerpiece is the module's editorial seal in
 * "locked" state for non-final lessons (with "N lessons to your insignia"
 * subhead), or "earned" state for the final lesson of a module (with
 * "Insignia unlocked." headline).
 *
 * Built on Radix Dialog for focus-trap + Esc + scroll-lock. Sparse confetti
 * still floats against the scrim — the moment matters, even without numbers.
 */
export function LessonXpMoment({
  open,
  onClose,
  moduleSlug,
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

          {/* Heading — switches between "Lesson completed" and "Insignia unlocked" */}
          {(() => {
            const isFinal = moduleCompletedLessons >= moduleTotalLessons && moduleTotalLessons > 0;
            const remaining = Math.max(0, moduleTotalLessons - moduleCompletedLessons);
            return (
              <>
                <div
                  className="v2-serif"
                  style={{
                    fontSize: isFinal ? 28 : 22,
                    fontStyle: "italic",
                    color: isFinal ? "var(--color-bnb)" : "var(--color-t-0)",
                    marginTop: 22,
                    textAlign: "center",
                    fontWeight: 400,
                    letterSpacing: "-0.018em",
                  }}
                >
                  {isFinal ? t("headlineInsignia") : t("headline")}
                </div>

                {/* Insignia centerpiece — locked while progressing, earned on the final lesson */}
                <div
                  style={{
                    marginTop: 28,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Insignia
                    moduleSlug={moduleSlug}
                    state={isFinal ? "earned" : "locked"}
                    size="xl"
                  />
                </div>

                {/* Subhead — context for the centerpiece */}
                <div
                  className="v2-mono v2-mc"
                  style={{
                    marginTop: 24,
                    textAlign: "center",
                    color: isFinal ? "var(--color-bnb)" : "var(--color-t-3)",
                  }}
                >
                  {isFinal
                    ? t("subheadEarned")
                    : t("subheadProgress", { count: remaining })}
                </div>
              </>
            );
          })()}

          {/* Progress checklist (was XP breakdown — now just shows what was done) */}
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
                color: "var(--color-t-3)",
              }}
            >
              {t("breakdown")}
            </div>
            {breakdown.map((row, i) => (
              <BreakdownRow key={i} label={row.label} />
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
}: {
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 14,
          height: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-bnb)",
        }}
      >
        ✓
      </span>
      <span style={{ fontSize: 13, color: "var(--color-t-1)", flex: 1 }}>
        {label}
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
  // Softened: keep the celebratory bump animation (strikethrough "03→04")
  // but drop the 7-dot pressure row — the moment isn't a scoreboard.
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
