"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useAccount } from "wagmi";
import { Link as I18nLink } from "@/i18n/navigation";
import {
  useIsHydrated,
  useProgress,
  isLessonComplete,
  getModuleCompleted,
} from "@/lib/progress-store";
import { moduleCodeFor, orderBySlug, MODULE_ORDER } from "@/lib/module-order";
import { Insignia } from "@/components/v2/insignia";
import type { LessonMeta, Locale, Module } from "@/lib/types";

interface V2ModuleOverviewProps {
  locale: Locale;
  module: Module;
  /** All modules (used to resolve `suggestedNext`). */
  allModules: Module[];
}

type ModuleState = "empty" | "in-progress" | "almost-done" | "blocked-no-wallet";

/**
 * V2ModuleOverview — the "Sumario" page for a single module, with 4 states:
 *
 *   A.1 empty            — pct === 0
 *   A.2 in-progress      — 0 < pct < 75
 *   A.3 almost-done      — pct ≥ 75
 *   A.4 blocked-no-wallet — pct > 0 AND wallet not connected
 *
 * Composition (top-to-bottom):
 *   - Breadcrumb (Volver a la Academia / Academia / M.0X · Module)
 *   - Hero: left big-numeral + serif H1 + drop-cap description
 *           right state-aware progress card with bnb CTA
 *   - Stats strip: 4 lecciones · 45 min · +400 XP · Beginner · Prerrequisitos
 *   - "El temario." expandable lesson list (current/next auto-expanded)
 *   - 3-col footer: Lo que vas a aprender · Conceptos clave · Después de M.0X
 */
export function V2ModuleOverview({ locale, module: mod, allModules }: V2ModuleOverviewProps) {
  const t = useTranslations("v2.module");
  const tLesson = useTranslations("v2.lesson");
  const hydrated = useIsHydrated();
  const account = useAccount();

  const completed = useProgress((s) => getModuleCompleted(s, mod.slug));
  const completedKey = useProgress((s) =>
    mod.lessons.map((l) => (isLessonComplete(s, mod.slug, l.slug) ? "1" : "0")).join("")
  );
  const streak = useProgress((s) => s.streakDays ?? 0);

  const completedFlags = useMemo(
    () => completedKey.split("").map((c) => c === "1"),
    [completedKey]
  );

  // Current lesson = first not-completed in order. If all done, last lesson.
  const currentIndex = useMemo(() => {
    const idx = completedFlags.findIndex((c) => !c);
    return idx === -1 ? mod.lessons.length - 1 : idx;
  }, [completedFlags, mod.lessons.length]);

  const pct = mod.lessons.length
    ? Math.round((completed / mod.lessons.length) * 100)
    : 0;
  const xpEarned = completed * Math.round(mod.totalXp / Math.max(1, mod.lessons.length));

  // Derive state
  const state: ModuleState = useMemo(() => {
    if (!hydrated) return "empty";
    if (pct === 0) return "empty";
    if (!account.isConnected) return "blocked-no-wallet";
    if (pct >= 75) return "almost-done";
    return "in-progress";
  }, [hydrated, pct, account.isConnected]);

  const moduleCode = moduleCodeFor(mod.slug);
  const moduleNumber = String(MODULE_ORDER.indexOf(mod.slug) + 1).padStart(2, "0");

  // Suggested-next module (uses MODULE_ORDER as fallback)
  const suggestedNext = useMemo(() => {
    const explicitSlug = mod.suggestedNext;
    if (explicitSlug) {
      const next = allModules.find((m) => m.slug === explicitSlug);
      if (next) return next;
    }
    const sorted = orderBySlug(allModules);
    const i = sorted.findIndex((m) => m.slug === mod.slug);
    return i >= 0 && i < sorted.length - 1 ? sorted[i + 1] : null;
  }, [mod, allModules]);

  // Editorial labels per difficulty/locale
  const levelLabel =
    mod.difficulty === "beginner"
      ? t("levelBeginner")
      : mod.difficulty === "intermediate"
        ? t("levelIntermediate")
        : t("levelAdvanced");

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 56px 96px" }}>
      {/* BREADCRUMB
        "Volver a la Academia" climbs back to the landing's §02 Academia
        section. We use a plain anchor (not next-intl Link) because the Next
        router + next-intl prefetch chain has been observed to duplicate the
        `#academia` fragment on redirect-target navigations. A hard anchor
        navigates cleanly and honors the fragment without router shenanigans.
      */}
      <div
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <a
          href={`/${locale}#academia`}
          className="v2-mono v2-mc"
          style={{
            color: "var(--color-t-1)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← {t("backToAcademia")}
        </a>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-4)" }}>
          /
        </span>
        <a
          href={`/${locale}#academia`}
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-2)", textDecoration: "none" }}
        >
          {t("academia")}
        </a>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-4)" }}>
          /
        </span>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-bnb)" }}>
          {moduleCode} · {mod.title}
        </span>
        <span style={{ flex: 1 }} />
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
          {t("issueLabel")}
        </span>
      </div>

      <div
        style={{
          height: 1,
          background: "var(--color-line-1)",
          margin: "0 0 24px",
        }}
      />

      {/* HERO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 460px",
          gap: 48,
          alignItems: "start",
          paddingBottom: 32,
        }}
      >
        <HeroLeft
          mod={mod}
          moduleCode={moduleCode}
          moduleNumber={moduleNumber}
          levelLabel={levelLabel}
          t={t}
        />
        <ProgressCard
          state={state}
          pct={pct}
          completed={completed}
          totalLessons={mod.lessons.length}
          totalMin={mod.durationMinutes}
          xpEarned={xpEarned}
          totalXp={mod.totalXp}
          streak={streak}
          currentLesson={mod.lessons[currentIndex]}
          firstLesson={mod.lessons[0]}
          lastLesson={mod.lessons[mod.lessons.length - 1]}
          moduleSlug={mod.slug}
          completedFlags={completedFlags}
          t={t}
        />
      </div>

      <div
        style={{ height: 1, background: "var(--color-line-1)", margin: "0 0 24px" }}
      />

      {/* STATS STRIP */}
      <StatsStrip
        totalLessons={mod.lessons.length}
        totalMin={mod.durationMinutes}
        totalXp={mod.totalXp}
        levelLabel={levelLabel}
        prerequisites={mod.prerequisites ?? []}
        t={t}
      />

      <div
        style={{ height: 1, background: "var(--color-line-1)", margin: "32px 0 24px" }}
      />

      {/* EL TEMARIO */}
      <TemarioHeader
        totalLessons={mod.lessons.length}
        totalMin={mod.durationMinutes}
        totalXp={mod.totalXp}
        t={t}
      />
      <Temario
        moduleSlug={mod.slug}
        lessons={mod.lessons}
        completedFlags={completedFlags}
        currentIndex={currentIndex}
        t={t}
        tLesson={tLesson}
      />

      <div
        style={{ height: 1, background: "var(--color-line-1)", margin: "48px 0 28px" }}
      />

      {/* 3-COL FOOTER */}
      <FooterThreeCol
        outcomes={mod.learningOutcomes ?? []}
        concepts={mod.keyConcepts ?? []}
        moduleCode={moduleCode}
        suggestedNext={suggestedNext}
        state={state}
        t={t}
      />
    </div>
  );
}

/* ────────────── HERO ────────────── */

function HeroLeft({
  mod,
  moduleCode,
  moduleNumber,
  levelLabel,
  t,
}: {
  mod: Module;
  moduleCode: string;
  moduleNumber: string;
  levelLabel: string;
  t: ReturnType<typeof useTranslations>;
}) {
  // Split the title at the first comma if present so we can italicize the
  // second half — matching the design "Fundamentos, / de BNB Chain."
  const titleParts = mod.title.split(/,\s*/);
  const titlePrefix = titleParts[0];
  const titleSuffix = titleParts.slice(1).join(", ");

  return (
    <div>
      {/* Eyebrow */}
      <div
        className="v2-mono v2-mc"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--color-bnb)",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "var(--color-bnb)",
            boxShadow: "0 0 0 4px rgba(240,185,11,0.18)",
            display: "inline-block",
          }}
        />
        <span>§ {t("moduleOne")} · {t("introCourseLabel")}</span>
        <span style={{ color: "var(--color-t-4)" }}>/</span>
        <span style={{ color: "var(--color-t-3)" }}>
          {levelLabel.toUpperCase()} · {mod.category.toUpperCase()}
        </span>
      </div>

      {/* Big numeral + mini meta column + title */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* Giant serif italic number */}
        <div
          className="v2-serif v2-tnum"
          style={{
            fontSize: 200,
            lineHeight: 0.85,
            letterSpacing: "-0.05em",
            color: "var(--color-bnb)",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          {moduleNumber}
        </div>

        {/* Mini meta column (CÓDIGO / NIVEL / SERIE) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            paddingTop: 10,
            minWidth: 110,
          }}
        >
          <MetaRow label={t("codeLabel")} value={moduleCode} valueClass="v2-serif" />
          <MetaRow
            label={t("levelLabel")}
            value={levelLabel}
            valueClass="v2-serif"
          />
          <MetaRow
            label={t("seriesLabel")}
            value={t("seriesValue")}
            valueClass="v2-serif"
          />
        </div>

        {/* Title + subtitle + description */}
        <div>
          <h1
            className="v2-serif"
            style={{
              fontSize: 60,
              lineHeight: 0.98,
              letterSpacing: "-0.028em",
              margin: 0,
              fontWeight: 400,
              color: "var(--color-t-0)",
            }}
          >
            {titlePrefix}
            {titleSuffix && (
              <>
                <span style={{ color: "var(--color-bnb)" }}>,</span>
                <br />
                <span
                  style={{
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: "var(--color-t-1)",
                  }}
                >
                  {titleSuffix}
                  <span style={{ color: "var(--color-bnb)" }}>.</span>
                </span>
              </>
            )}
          </h1>

          {mod.hookLine && (
            <div
              className="v2-mono v2-mc"
              style={{
                marginTop: 18,
                color: "var(--color-bnb)",
                letterSpacing: "0.16em",
              }}
            >
              {mod.hookLine.toUpperCase()}
            </div>
          )}

          <div
            style={{
              height: 1,
              background: "var(--color-bnb-line)",
              marginTop: 18,
              marginBottom: 18,
              maxWidth: 600,
            }}
          />

          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--color-t-0)",
              maxWidth: 620,
            }}
          >
            <span
              className="v2-serif"
              style={{
                float: "left",
                fontSize: 64,
                lineHeight: 0.82,
                fontWeight: 500,
                marginRight: 10,
                marginTop: 2,
                color: "var(--color-bnb)",
              }}
            >
              {mod.description.charAt(0)}
            </span>
            {mod.description.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div
        className="v2-mono v2-mc"
        style={{ color: "var(--color-t-3)", fontSize: 9.5, marginBottom: 2 }}
      >
        {label}
      </div>
      <div
        className={valueClass}
        style={{
          fontSize: 17,
          fontStyle: "italic",
          color: "var(--color-t-1)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ────────────── PROGRESS CARD ────────────── */

interface ProgressCardProps {
  state: ModuleState;
  pct: number;
  completed: number;
  totalLessons: number;
  /** Real total minutes for the module — shown in the empty-state subtitle. */
  totalMin: number;
  xpEarned: number;
  totalXp: number;
  streak: number;
  currentLesson: LessonMeta | undefined;
  firstLesson: LessonMeta | undefined;
  lastLesson: LessonMeta | undefined;
  moduleSlug: string;
  completedFlags: boolean[];
  t: ReturnType<typeof useTranslations>;
}

function ProgressCard(props: ProgressCardProps) {
  const { state } = props;
  const isBlocked = state === "blocked-no-wallet";
  const borderColor = isBlocked
    ? "var(--color-bnb)"
    : state === "empty"
      ? "var(--color-line-2)"
      : "var(--color-bnb-line)";

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        background: isBlocked
          ? "rgba(240,185,11,0.03)"
          : state === "empty"
            ? "rgba(7,8,13,0.55)"
            : "rgba(240,185,11,0.04)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <ProgressCardHeader {...props} />
      <ProgressCardBigStat {...props} />
      <ProgressCardLessonRail {...props} />
      <ProgressCardXpStreakRow {...props} />
      <ProgressCardCta {...props} />
    </div>
  );
}

function ProgressCardHeader({ state, completed, totalLessons, t }: ProgressCardProps) {
  const labelKey: Record<ModuleState, string> = {
    empty: "stateEmpty",
    "in-progress": "stateInProgress",
    "almost-done": "stateAlmostDone",
    "blocked-no-wallet": "stateBlocked",
  };
  const dotColor =
    state === "blocked-no-wallet"
      ? "var(--color-bnb)"
      : state === "empty"
        ? "var(--color-t-3)"
        : "var(--color-bnb)";

  return (
    <div
      className="v2-mono v2-mc"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        color:
          state === "empty" ? "var(--color-t-2)" : "var(--color-bnb)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: dotColor,
          display: "inline-block",
        }}
      />
      <span>
        {state === "blocked-no-wallet" && "🔒 "}
        {t(labelKey[state])}
      </span>
      {state === "almost-done" && (
        <>
          <span style={{ flex: 1 }} />
          <span style={{ color: "var(--color-bnb)" }}>
            {completed} {t("ofShort")} {totalLessons} ✓
          </span>
        </>
      )}
    </div>
  );
}

function ProgressCardBigStat({
  state,
  pct,
  completed,
  totalLessons,
  totalMin,
  t,
  currentLesson,
}: ProgressCardProps) {
  const subtitle =
    state === "blocked-no-wallet"
      ? t("subtitleBlocked", { done: completed, total: totalLessons })
      : state === "empty"
        ? t("subtitleEmpty", { total: totalLessons, minutes: totalMin })
        : pct === 100
          ? t("subtitleAllDone", { total: totalLessons })
          : t("subtitleInProgress", {
              done: completed,
              total: totalLessons,
              code: currentLesson
                ? `L.${String(currentLesson.order).padStart(2, "0")}`
                : "L.01",
            });

  const subtitleHead =
    state === "blocked-no-wallet"
      ? t("subtitleBlockedHead")
      : pct === 100
        ? t("subtitleAllDoneHead")
        : t("subtitleDefaultHead");

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
      <div
        className="v2-serif v2-tnum"
        style={{
          fontSize: 76,
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          color: "var(--color-bnb)",
          fontStyle: "italic",
          fontWeight: 400,
        }}
      >
        {pct}
        <span style={{ fontSize: 32, fontStyle: "normal" }}>%</span>
      </div>
      <div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 4 }}
        >
          {subtitleHead}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "var(--color-t-1)",
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function ProgressCardLessonRail({
  totalLessons,
  completedFlags,
}: ProgressCardProps) {
  // First non-completed slot is the "current" lesson highlight. If every
  // lesson is done (-1), nothing gets the bnb-yellow treatment.
  const firstPendingIndex = completedFlags.findIndex((f) => !f);

  return (
    <div>
      <div
        style={{
          height: 2,
          background: "var(--color-line-1)",
          position: "relative",
          marginBottom: 8,
        }}
      >
        {Array.from({ length: totalLessons }).map((_, i) => {
          const left = (i / totalLessons) * 100;
          const width = (1 / totalLessons) * 100;
          const isDone = completedFlags[i];
          return (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: 0,
                bottom: 0,
                width: `${width}%`,
                background: isDone ? "var(--color-bnb)" : "transparent",
                borderRight:
                  i < totalLessons - 1
                    ? "1px solid var(--color-ink-1)"
                    : "none",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${totalLessons}, 1fr)`,
          gap: 0,
        }}
      >
        {Array.from({ length: totalLessons }).map((_, i) => {
          const order = i + 1;
          const isCurrent = i === firstPendingIndex;
          return (
            <span
              key={i}
              className="v2-mono v2-mc v2-tnum"
              style={{
                color: isCurrent
                  ? "var(--color-bnb)"
                  : completedFlags[i]
                    ? "var(--color-t-2)"
                    : "var(--color-t-3)",
                fontSize: 9.5,
              }}
            >
              L.{String(order).padStart(2, "0")}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ProgressCardXpStreakRow({
  state,
  completed,
  totalLessons,
  moduleSlug,
  streak,
  t,
}: ProgressCardProps) {
  const isFullyDone = completed >= totalLessons && totalLessons > 0;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18,
        paddingTop: 14,
        borderTop: "1px solid var(--color-line-1)",
      }}
    >
      <div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 6 }}
        >
          {state === "blocked-no-wallet"
            ? t("insigniaLocalLabel")
            : t("insigniaModuleLabel")}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Insignia
            moduleSlug={moduleSlug}
            size="sm"
            state={isFullyDone ? "earned" : "locked"}
          />
          <span
            className="v2-serif v2-tnum"
            style={{
              fontSize: 22,
              fontStyle: "italic",
              color: "var(--color-bnb)",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            {completed}
          </span>
          <span
            className="v2-mono v2-mc v2-tnum"
            style={{ color: "var(--color-t-3)" }}
          >
            / {totalLessons} {t("statLessonsUnit")}
          </span>
        </div>
      </div>
      <div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 4 }}
        >
          {streak > 0 ? t("streakLabel") : t("streakStart")}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span
            className="v2-serif v2-tnum"
            style={{
              fontSize: 28,
              fontStyle: "italic",
              color: "var(--color-bnb)",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            {String(streak).padStart(2, "0")}
          </span>
          <span
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)" }}
          >
            {t("daysShort")}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgressCardCta({
  state,
  moduleSlug,
  currentLesson,
  firstLesson,
  lastLesson,
  t,
}: ProgressCardProps) {
  if (state === "blocked-no-wallet") {
    return (
      <I18nLink
        href="/profile"
        className="v2-arrow-shift"
        style={{
          background: "var(--color-bnb)",
          color: "#15110a",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          textDecoration: "none",
        }}
      >
        <span style={{ flex: 1 }}>
          <div
            className="v2-mono v2-mc"
            style={{ fontWeight: 700, letterSpacing: "0.14em" }}
          >
            ◆ {t("ctaConnectWallet")}
          </div>
          <div
            className="v2-mono v2-mc"
            style={{ marginTop: 4, color: "rgba(21,17,10,0.7)" }}
          >
            {t("ctaConnectWalletSub")}
          </div>
        </span>
        <span className="v2-arrow v2-mono" style={{ fontSize: 18 }}>
          →
        </span>
      </I18nLink>
    );
  }

  const isEmpty = state === "empty";
  const isAlmost = state === "almost-done";
  const target = isEmpty ? firstLesson : currentLesson;
  const ctaLabel = isAlmost
    ? t("ctaFinishModule")
    : isEmpty
      ? t("ctaStartFirst")
      : t("ctaContinueLesson");
  const targetCode = target
    ? `L.${String(target.order).padStart(2, "0")}`
    : "L.01";

  // If everything is done already, target last lesson as a "review" link.
  const linkTarget = target ?? lastLesson ?? firstLesson;
  if (!linkTarget) return null;

  return (
    <I18nLink
      href={`/learn/${moduleSlug}/${linkTarget.slug}`}
      className="v2-arrow-shift"
      style={{
        background: "var(--color-bnb)",
        color: "#15110a",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        textDecoration: "none",
      }}
    >
      <span style={{ flex: 1 }}>
        <div
          className="v2-mono v2-mc"
          style={{ fontWeight: 700, letterSpacing: "0.14em" }}
        >
          ▸ {ctaLabel}
        </div>
        <div
          className="v2-mono v2-mc"
          style={{
            marginTop: 4,
            color: "rgba(21,17,10,0.78)",
            display: "flex",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>{targetCode}</span>
          <span>·</span>
          <span style={{ fontStyle: "italic" }}>{linkTarget.title}</span>
        </div>
      </span>
      <span className="v2-arrow v2-mono" style={{ fontSize: 18 }}>
        →
      </span>
    </I18nLink>
  );
}

/* ────────────── STATS STRIP ────────────── */

function StatsStrip({
  totalLessons,
  totalMin,
  totalXp,
  levelLabel,
  prerequisites,
  t,
}: {
  totalLessons: number;
  totalMin: number;
  totalXp: number;
  levelLabel: string;
  prerequisites: string[];
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "1fr auto 1fr auto 1fr auto 1fr auto 1fr",
        alignItems: "baseline",
        gap: 24,
      }}
    >
      <StatColumn
        label={t("statLessons")}
        value={String(totalLessons)}
        unit={t("statLessonsUnit")}
      />
      <Sep />
      <StatColumn
        label={t("statTimeTotal")}
        value={String(totalMin)}
        unit={t("statTimeUnit")}
      />
      <Sep />
      <StatColumn
        label={t("statInsignia")}
        value="I"
        unit={t("statInsigniaUnit")}
      />
      <Sep />
      <StatColumn
        label={t("statLevel")}
        value={levelLabel}
        unit={t("statLevelUnit")}
      />
      <Sep />
      <div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 6 }}
        >
          {t("statPrereqs")}
        </div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-0)", letterSpacing: "0.12em" }}
        >
          {prerequisites.length
            ? prerequisites.map((s) => moduleCodeFor(s)).join(" · ")
            : t("statPrereqsNone")}
        </div>
      </div>
    </div>
  );
}

function Sep() {
  return (
    <span
      style={{
        width: 1,
        height: 32,
        background: "var(--color-line-1)",
        alignSelf: "center",
      }}
    />
  );
}

function StatColumn({
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
        style={{ color: "var(--color-t-3)", marginBottom: 6 }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          className="v2-serif v2-tnum"
          style={{
            fontSize: 28,
            color: "var(--color-t-0)",
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          {value}
        </span>
        <span
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-2)" }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

/* ────────────── TEMARIO HEADER + LIST ────────────── */

function TemarioHeader({
  totalLessons,
  totalMin,
  totalXp,
  t,
}: {
  totalLessons: number;
  totalMin: number;
  totalXp: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 18,
        marginBottom: 18,
      }}
    >
      <h2
        className="v2-serif"
        style={{
          fontSize: 44,
          lineHeight: 1,
          letterSpacing: "-0.022em",
          margin: 0,
          fontWeight: 400,
          color: "var(--color-t-0)",
          fontStyle: "italic",
        }}
      >
        {t("temarioTitle")}
        <span style={{ color: "var(--color-bnb)" }}>.</span>
      </h2>
      <span
        className="v2-mono v2-mc"
        style={{ color: "var(--color-t-3)" }}
      >
        L.01 — L.{String(totalLessons).padStart(2, "0")} ·{" "}
        {t("temarioMeta", { total: totalLessons, min: totalMin })}
      </span>
      <span style={{ flex: 1 }} />
      <span
        className="v2-mono v2-mc"
        style={{ color: "var(--color-t-3)" }}
      >
        {t("clickToExpand")}
      </span>
    </div>
  );
}

interface TemarioProps {
  moduleSlug: string;
  lessons: LessonMeta[];
  completedFlags: boolean[];
  currentIndex: number;
  t: ReturnType<typeof useTranslations>;
  tLesson: ReturnType<typeof useTranslations>;
}

function Temario({
  moduleSlug,
  lessons,
  completedFlags,
  currentIndex,
  t,
  tLesson,
}: TemarioProps) {
  // Auto-open the current lesson row by default; user can toggle others.
  const [openIndex, setOpenIndex] = useState<number | null>(currentIndex);

  return (
    <div>
      {lessons.map((lesson, i) => (
        <TemarioRow
          key={lesson.slug}
          moduleSlug={moduleSlug}
          lesson={lesson}
          isCompleted={completedFlags[i]}
          isCurrent={i === currentIndex}
          isExpanded={openIndex === i}
          isFirst={i === 0}
          onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
          t={t}
          tLesson={tLesson}
        />
      ))}
    </div>
  );
}

interface TemarioRowProps {
  moduleSlug: string;
  lesson: LessonMeta;
  isCompleted: boolean;
  isCurrent: boolean;
  isExpanded: boolean;
  isFirst: boolean;
  onToggle: () => void;
  t: ReturnType<typeof useTranslations>;
  tLesson: ReturnType<typeof useTranslations>;
}

function TemarioRow({
  moduleSlug,
  lesson,
  isCompleted,
  isCurrent,
  isExpanded,
  isFirst,
  onToggle,
  t,
  tLesson,
}: TemarioRowProps) {
  const order = String(lesson.order).padStart(2, "0");

  let statusLabel: string;
  let statusColor: string;
  if (isCompleted) {
    statusLabel = `✓ ${t("statusDone")} · ${t("statusDoneAgo")}`;
    statusColor = "var(--color-bnb)";
  } else if (isCurrent && !isFirst) {
    // No real video-time tracking yet — keep the label honest. When we wire
    // up the player's progress persistence we can show "X:YY / N:00" again.
    statusLabel = `● ${t("statusViewing")}`;
    statusColor = "var(--color-bnb)";
  } else if (isCurrent && isFirst) {
    statusLabel = t("statusStartHere");
    statusColor = "var(--color-bnb)";
  } else {
    statusLabel = t("statusPending");
    statusColor = "var(--color-t-3)";
  }

  return (
    <div
      style={{
        borderTop: "1px solid var(--color-line-1)",
        background: isExpanded
          ? "rgba(240,185,11,0.04)"
          : "transparent",
        borderLeft: isExpanded
          ? "2px solid var(--color-bnb)"
          : "2px solid transparent",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "32px 64px 1fr auto auto 24px",
          gap: 18,
          alignItems: "center",
          padding: "18px 20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Bullet / check */}
        <span
          style={{
            width: 24,
            height: 24,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isCompleted ? (
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                background: "var(--color-bnb)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#15110a",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="2 6 4.5 8.5 9 3" />
              </svg>
            </span>
          ) : (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: isCurrent
                  ? "var(--color-bnb)"
                  : "var(--color-t-4)",
                display: "inline-block",
              }}
            />
          )}
        </span>

        {/* Big numeral */}
        <span
          className="v2-serif v2-tnum"
          style={{
            fontSize: 48,
            lineHeight: 1,
            color:
              isCompleted || isCurrent
                ? "var(--color-bnb)"
                : "var(--color-t-3)",
            fontStyle: "italic",
            fontWeight: 400,
            letterSpacing: "-0.03em",
          }}
        >
          {order}
        </span>

        {/* Title + meta */}
        <div>
          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)", marginBottom: 4 }}
          >
            L.{order}
            {lesson.videoMin ? (
              <>
                {" · "}
                <span className="v2-tnum">{lesson.videoMin}</span> {t("minVideo")}
              </>
            ) : null}
          </div>
          <h3
            className="v2-serif"
            style={{
              fontSize: 22,
              lineHeight: 1.15,
              letterSpacing: "-0.012em",
              margin: 0,
              fontWeight: 500,
              color: "var(--color-t-0)",
            }}
          >
            {lesson.title}
          </h3>
        </div>

        {/* Status */}
        <span
          className="v2-mono v2-mc"
          style={{ color: statusColor, whiteSpace: "nowrap" }}
        >
          {statusLabel}
        </span>

        {/* Duration only (XP removed for less-aggressive UI) */}
        <span
          className="v2-mono v2-mc"
          style={{
            color: "var(--color-t-2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          <span className="v2-tnum">{lesson.duration} {t("minShort")}</span>
        </span>

        {/* Chevron */}
        <span
          className="v2-mono"
          style={{
            color: "var(--color-t-3)",
            fontSize: 14,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▾
        </span>
      </button>

      {isExpanded && (
        <ExpandedRowDetail
          moduleSlug={moduleSlug}
          lesson={lesson}
          isCurrent={isCurrent}
          isCompleted={isCompleted}
          isFirst={isFirst}
          t={t}
          tLesson={tLesson}
        />
      )}
    </div>
  );
}

function ExpandedRowDetail({
  moduleSlug,
  lesson,
  isCurrent,
  isCompleted,
  isFirst,
  t,
}: {
  moduleSlug: string;
  lesson: LessonMeta;
  isCurrent: boolean;
  isCompleted: boolean;
  isFirst: boolean;
  t: ReturnType<typeof useTranslations>;
  tLesson: ReturnType<typeof useTranslations>;
}) {
  const tagline = lesson.tagline ?? lesson.description;
  const bullets = lesson.bullets ?? [];
  const videoMin = lesson.videoMin ?? Math.max(1, Math.floor(lesson.duration * 0.7));
  const readingMin = lesson.readingMin ?? Math.max(1, lesson.duration - videoMin);

  const ctaLabel = isCompleted
    ? t("ctaReview")
    : isCurrent
      ? t("ctaContinue")
      : isFirst
        ? t("ctaStart")
        : t("ctaOpen");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 32,
        padding: "0 20px 22px 114px",
      }}
    >
      {/* § DE QUÉ TRATA */}
      <div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 10 }}
        >
          § {t("aboutLabel")}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "var(--color-t-1)",
          }}
        >
          {tagline}
        </p>
      </div>

      {/* § CUBRE */}
      {bullets.length > 0 ? (
        <div>
          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)", marginBottom: 10 }}
          >
            § {t("coversLabel")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bullets.slice(0, 3).map((b, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "26px 1fr",
                  gap: 10,
                  alignItems: "baseline",
                }}
              >
                <span
                  className="v2-mono v2-mc"
                  style={{
                    color: "var(--color-bnb)",
                    letterSpacing: "0.04em",
                  }}
                >
                  §{i + 1}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "var(--color-t-1)",
                  }}
                >
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div />
      )}

      {/* § TOMAR LA LECCIÓN */}
      <div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 10 }}
        >
          § {t("takeLessonLabel")}
        </div>
        <div
          className="v2-mono v2-mc"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            color: "var(--color-t-1)",
          }}
        >
          <div>
            {t("metaVideo")} · <span className="v2-tnum">{videoMin}</span> {t("minShort")}
          </div>
          <div>
            {t("metaReading")} · <span className="v2-tnum">{readingMin}</span> {t("minShort")}
          </div>
          <div>
            {t("metaQuiz")}
          </div>
        </div>
        <I18nLink
          href={`/learn/${moduleSlug}/${lesson.slug}`}
          className="v2-arrow-shift"
          style={{
            marginTop: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "var(--color-bnb)",
            color: "#15110a",
            padding: "10px 16px",
            textDecoration: "none",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 600,
            fontSize: 11,
            fontFamily: "var(--font-plex-mono)",
          }}
        >
          {ctaLabel}
          <span className="v2-arrow">→</span>
        </I18nLink>
      </div>
    </div>
  );
}

/* ────────────── 3-COL FOOTER ────────────── */

function FooterThreeCol({
  outcomes,
  concepts,
  moduleCode,
  suggestedNext,
  state,
  t,
}: {
  outcomes: string[];
  concepts: string[];
  moduleCode: string;
  suggestedNext: Module | null;
  state: ModuleState;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 1fr",
        gap: 36,
        alignItems: "start",
      }}
    >
      {/* § LO QUE VAS A APRENDER */}
      <div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 18 }}
        >
          § {t("outcomesLabel")}
        </div>
        {outcomes.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--color-t-3)",
            }}
          >
            {t("outcomesEmpty")}
          </p>
        ) : (
          <ol
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {outcomes.map((outcome, i) => (
              <li
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: 14,
                  alignItems: "baseline",
                }}
              >
                <span
                  className="v2-serif v2-tnum"
                  style={{
                    fontSize: 18,
                    color: "var(--color-bnb)",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: "var(--color-t-1)",
                  }}
                >
                  {outcome}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* § CONCEPTOS CLAVE */}
      <div>
        <div
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)", marginBottom: 18 }}
        >
          § {t("conceptsLabel")}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--color-t-2)",
          }}
        >
          {t("conceptsBlurb")}
        </p>
        {concepts.length > 0 && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {concepts.map((c) => (
              <span
                key={c}
                className="v2-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.04em",
                  padding: "6px 10px",
                  border: "1px solid var(--color-line-2)",
                  color: "var(--color-t-1)",
                  background: "transparent",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* DESPUÉS DE M.XX */}
      {suggestedNext && (
        <SuggestedNextCard
          moduleCode={moduleCode}
          next={suggestedNext}
          state={state}
          t={t}
        />
      )}
    </div>
  );
}

function SuggestedNextCard({
  moduleCode,
  next,
  state,
  t,
}: {
  moduleCode: string;
  next: Module;
  state: ModuleState;
  t: ReturnType<typeof useTranslations>;
}) {
  const nextCode = moduleCodeFor(next.slug);
  const nextNumber = nextCode.replace("M.", "");
  const isUnlockSoon = state === "almost-done";

  return (
    <div
      style={{
        border: "1px solid var(--color-line-2)",
        padding: "16px 18px",
        background: "rgba(7,8,13,0.55)",
      }}
    >
      <div
        className="v2-mono v2-mc"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--color-t-3)",
          marginBottom: 14,
        }}
      >
        <span>
          {t("afterLabel", { code: moduleCode })}
        </span>
        <span style={{ color: isUnlockSoon ? "var(--color-bnb)" : "var(--color-t-3)" }}>
          {isUnlockSoon ? `◆ ${t("unlockSoon")}` : t("suggested")}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 16,
          alignItems: "start",
          marginBottom: 14,
        }}
      >
        <span
          className="v2-serif v2-tnum"
          style={{
            fontSize: 48,
            lineHeight: 0.9,
            color: "var(--color-t-1)",
            fontStyle: "italic",
            fontWeight: 400,
            letterSpacing: "-0.03em",
          }}
        >
          {nextNumber}
        </span>
        <div>
          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)", marginBottom: 4 }}
          >
            {nextCode} · {next.category.toUpperCase()}
          </div>
          <h4
            className="v2-serif"
            style={{
              fontSize: 20,
              lineHeight: 1.15,
              letterSpacing: "-0.012em",
              margin: 0,
              color: "var(--color-t-0)",
              fontWeight: 500,
            }}
          >
            {next.title}
          </h4>
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.55,
          color: "var(--color-t-2)",
        }}
      >
        {next.tagline}
      </p>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <span
          className="v2-mono v2-mc"
          style={{ color: "var(--color-t-3)" }}
        >
          <span className="v2-tnum">{next.totalLessons}</span> {t("lessShort")} ·{" "}
          <span className="v2-tnum">{next.durationMinutes}</span>{" "}
          {t("minShort")}
        </span>
        <Insignia moduleSlug={next.slug} state="locked" size="sm" />
      </div>

      <I18nLink
        href={`/learn/${next.slug}`}
        className="v2-arrow-shift"
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          background: "transparent",
          color: "var(--color-bnb)",
          padding: "10px 14px",
          border: "1px solid var(--color-bnb)",
          textDecoration: "none",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 600,
          fontSize: 10.5,
          fontFamily: "var(--font-plex-mono)",
        }}
      >
        {t("previewCta")}
        <span className="v2-arrow">→</span>
      </I18nLink>
    </div>
  );
}
