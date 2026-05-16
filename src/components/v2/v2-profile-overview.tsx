"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link as I18nLink } from "@/i18n/navigation";
import {
  useProgress,
  useIsHydrated,
  progressStore,
} from "@/lib/progress-store";
import { QUEST_OF_DAY_PATH } from "@/lib/quest-of-day";
import { moduleCodeFor } from "@/lib/module-order";
import type { Module } from "@/lib/types";

interface V2ProfileOverviewProps {
  modules: Module[];
}

const LEVELS = [
  { key: "spectator" as const, min: 0, max: 99 },
  { key: "initiate" as const, min: 100, max: 299 },
  { key: "apprentice" as const, min: 300, max: 699 },
  { key: "adept" as const, min: 700, max: 1299 },
  { key: "master" as const, min: 1300, max: 2199 },
  { key: "sage" as const, min: 2200, max: Infinity },
];

function getLevel(xp: number) {
  const idx = LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  const safeIdx = idx === -1 ? 0 : idx;
  const current = LEVELS[safeIdx];
  const next = LEVELS[safeIdx + 1];
  const span = next ? next.min - current.min : 1;
  const into = xp - current.min;
  const percent = next ? Math.min(100, Math.round((into / span) * 100)) : 100;
  return {
    key: current.key,
    level: safeIdx + 1,
    nextKey: next?.key,
    percent,
    toNext: next ? next.min - xp : 0,
  };
}

function formatRelative(ts: number, t: ReturnType<typeof useTranslations>): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return t("agoNow");
  if (diffSec < 3600) return t("agoMins", { n: Math.floor(diffSec / 60) });
  if (diffSec < 86_400) return t("agoHours", { n: Math.floor(diffSec / 3600) });
  return t("agoDays", { n: Math.floor(diffSec / 86_400) });
}

/**
 * V2ProfileOverview — editorial dark profile in the v2 system.
 *
 * Two top-level shapes:
 *   - Wallet NOT connected: hero pitch + big ConnectButton + faint preview of
 *     local progress that will sync onchain on first connect.
 *   - Wallet connected: full hero (level + XP serif italic), four-stat row
 *     (XP / Lecciones / Módulos / Racha), in-progress module cards, recent
 *     activity feed, danger-zone reset footer.
 *
 * Everything still reads from `progressStore` (localStorage) today; Phase 1
 * will swap the read to a wagmi contract call without touching this view.
 */
export function V2ProfileOverview({ modules }: V2ProfileOverviewProps) {
  const t = useTranslations("v2.profile");
  const hydrated = useIsHydrated();
  const account = useAccount();
  const balance = useBalance({
    address: account.address,
    query: { enabled: !!account.address },
  });

  const totalXp = useProgress((s) => s.totalXp);
  const lessonsCount = useProgress(
    (s) => Object.keys(s.completedLessons).length
  );
  const startedCount = useProgress((s) => s.modulesStarted.length);
  const completedCount = useProgress((s) => s.modulesCompleted.length);
  const streakDays = useProgress((s) => s.streakDays ?? 0);
  const lastActivity = useProgress((s) => s.lastActivity ?? 0);

  const startedKey = useProgress((s) => s.modulesStarted.join(","));
  const completedKey = useProgress((s) => s.modulesCompleted.join(","));
  const recentKey = useProgress((s) =>
    Object.entries(s.completedLessons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, v]) => `${k}:${v}`)
      .join("|")
  );

  const xp = hydrated ? totalXp : 0;
  const level = getLevel(xp);

  const startedSlugs = startedKey ? startedKey.split(",") : [];
  const completedSlugs = completedKey ? completedKey.split(",") : [];

  const inProgressModules = useMemo(
    () =>
      hydrated
        ? modules.filter(
            (m) =>
              startedSlugs.includes(m.slug) &&
              !completedSlugs.includes(m.slug)
          )
        : [],
    [hydrated, modules, startedSlugs, completedSlugs]
  );

  const moduleCompletedSnapshot = useProgress((s) =>
    inProgressModules
      .map((m) => {
        const done = Object.keys(s.completedLessons).filter((k) =>
          k.startsWith(`${m.slug}/`)
        ).length;
        return `${m.slug}:${done}`;
      })
      .join("|")
  );
  const completedByModule = useMemo(() => {
    return Object.fromEntries(
      moduleCompletedSnapshot
        .split("|")
        .filter(Boolean)
        .map((e) => {
          const [slug, n] = e.split(":");
          return [slug, Number(n)];
        })
    ) as Record<string, number>;
  }, [moduleCompletedSnapshot]);

  const recent = useMemo(() => {
    if (!hydrated || !recentKey) return [];
    return recentKey.split("|").map((entry) => {
      const [key, tsStr] = entry.split(":");
      const ts = Number(tsStr);
      const [moduleSlug, lessonSlug] = key.split("/");
      const mod = modules.find((m) => m.slug === moduleSlug);
      const lesson = mod?.lessons.find((l) => l.slug === lessonSlug);
      return { moduleSlug, lessonSlug, ts, mod, lesson };
    });
  }, [hydrated, recentKey, modules]);

  const [confirmReset, setConfirmReset] = useState(false);
  function handleReset() {
    if (confirmReset) {
      progressStore.reset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  }

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", padding: "32px 56px 96px" }}>
      {/* TITLE BAND */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 32,
          alignItems: "end",
          paddingBottom: 24,
          borderBottom: "1px solid var(--color-line-1)",
        }}
      >
        <div>
          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-bnb)" }}
          >
            M.YO · {t("kicker")}
          </div>
          <h1
            className="v2-serif"
            style={{
              fontSize: 60,
              lineHeight: 0.98,
              letterSpacing: "-0.028em",
              margin: "14px 0 0",
              fontWeight: 400,
            }}
          >
            {t.rich("title", {
              italic: (chunks) => (
                <span style={{ fontStyle: "italic", color: "var(--color-t-1)" }}>
                  {chunks}
                </span>
              ),
            })}
            <span style={{ color: "var(--color-bnb)" }}>.</span>
          </h1>
          <p
            style={{
              color: "var(--color-t-1)",
              fontSize: 14,
              marginTop: 14,
              maxWidth: 720,
              lineHeight: 1.55,
            }}
          >
            {t("blurb")}
          </p>
        </div>

        <WalletCard
          account={account}
          balance={balance.data}
          tShared={t}
        />
      </div>

      {/* BIG STAT ROW */}
      <div
        style={{
          marginTop: 36,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          paddingBottom: 32,
          borderBottom: "1px solid var(--color-line-1)",
        }}
      >
        <BigStat
          label={t("statXp")}
          value={String(xp)}
          unit={t("statXpUnit")}
          accent="bnb"
        />
        <BigStat
          label={t("statLessons")}
          value={String(lessonsCount).padStart(2, "0")}
          unit={t("statLessonsUnit")}
        />
        <BigStat
          label={t("statModules")}
          value={
            startedCount > 0
              ? `${completedCount}/${startedCount}`
              : "00/00"
          }
          unit={t("statModulesUnit")}
        />
        <StreakStat
          days={streakDays}
          label={t("statStreak")}
          unit={t("statStreakUnit")}
        />
      </div>

      {/* LEVEL + PROGRESS */}
      <div style={{ marginTop: 28, paddingBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)" }}
          >
            {t("levelLabel")}
          </span>
          <span
            className="v2-serif v2-tnum"
            style={{
              fontSize: 28,
              fontStyle: "italic",
              color: "var(--color-bnb)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            {String(level.level).padStart(2, "0")}
          </span>
          <span
            className="v2-serif"
            style={{
              fontSize: 22,
              color: "var(--color-t-0)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {t(`levels.${level.key}`)}
          </span>
          <span style={{ flex: 1 }} />
          {level.nextKey && (
            <span
              className="v2-mono v2-mc"
              style={{ color: "var(--color-t-3)" }}
            >
              {t("toNext", {
                xp: level.toNext,
                next: t(`levels.${level.nextKey}`),
              })}
            </span>
          )}
        </div>
        <div
          style={{
            marginTop: 14,
            height: 3,
            background: "var(--color-line-1)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${level.percent}%`,
              background: "var(--color-bnb)",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* TWO COL: in-progress + recent activity */}
      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "1080px 1fr",
          columnGap: 28,
          alignItems: "start",
        }}
      >
        {/* LEFT — modules in progress */}
        <div>
          <h2
            className="v2-serif"
            style={{
              fontSize: 28,
              lineHeight: 1.1,
              letterSpacing: "-0.018em",
              margin: "0 0 18px",
              fontWeight: 500,
              color: "var(--color-t-0)",
            }}
          >
            {t("inProgressTitle")}
          </h2>
          {inProgressModules.length === 0 ? (
            <EmptyCurrent
              text={hydrated ? t("inProgressEmpty") : t("inProgressLoading")}
              cta={t("startQuest")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {inProgressModules.map((m, i) => {
                const done = completedByModule[m.slug] ?? 0;
                const pct = Math.round((done / m.totalLessons) * 100);
                const code = moduleCodeFor(m.slug);
                return (
                  <I18nLink
                    key={m.slug}
                    href={`/learn/${m.slug}`}
                    className="v2-card-hover v2-arrow-shift"
                    style={{
                      border: "1px solid var(--color-line-2)",
                      background: "var(--color-ink-1)",
                      padding: "18px 22px",
                      display: "grid",
                      gridTemplateColumns: "64px 1fr auto",
                      gap: 20,
                      alignItems: "center",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <span
                      className="v2-serif v2-tnum"
                      style={{
                        fontSize: 48,
                        lineHeight: 1,
                        color: i === 0 ? "var(--color-bnb)" : "var(--color-t-1)",
                        fontWeight: 400,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="v2-mono v2-mc"
                        style={{ color: "var(--color-t-3)", marginBottom: 4 }}
                      >
                        {code} · {m.category.toUpperCase()}
                      </div>
                      <div
                        className="v2-serif"
                        style={{
                          fontSize: 18,
                          color: "var(--color-t-0)",
                          fontWeight: 500,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {m.title}
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          height: 2,
                          background: "var(--color-line-1)",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: `${pct}%`,
                            background: "var(--color-bnb)",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <div
                        className="v2-mono v2-mc"
                        style={{
                          marginTop: 6,
                          color: "var(--color-t-3)",
                        }}
                      >
                        {done} / {m.totalLessons} {t("lessShort")} ·{" "}
                        <span
                          className="v2-tnum"
                          style={{ color: "var(--color-bnb)" }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <span
                      className="v2-arrow v2-mono"
                      style={{ color: "var(--color-bnb)", fontSize: 20 }}
                    >
                      →
                    </span>
                  </I18nLink>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — recent activity */}
        <div>
          <h2
            className="v2-serif"
            style={{
              fontSize: 22,
              lineHeight: 1.1,
              letterSpacing: "-0.014em",
              margin: "0 0 18px",
              fontWeight: 500,
              color: "var(--color-t-0)",
            }}
          >
            {t("recentTitle")}
          </h2>
          {recent.length === 0 ? (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--color-t-3)",
                lineHeight: 1.55,
              }}
            >
              {t("recentEmpty")}
            </p>
          ) : (
            <div
              style={{
                border: "1px solid var(--color-line-1)",
                background: "rgba(7,8,13,0.55)",
              }}
            >
              {recent.map(({ moduleSlug, lessonSlug, ts, mod, lesson }, i) => (
                <I18nLink
                  key={`${moduleSlug}/${lessonSlug}`}
                  href={`/learn/${moduleSlug}/${lessonSlug}`}
                  style={{
                    padding: "12px 16px",
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    borderTop:
                      i === 0 ? "none" : "1px solid var(--color-line-1)",
                  }}
                >
                  <div
                    className="v2-mono v2-mc"
                    style={{
                      color: "var(--color-bnb)",
                      marginBottom: 4,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {moduleCodeFor(moduleSlug)} · L.
                      {String(lesson?.order ?? 0).padStart(2, "0")}
                    </span>
                    <span className="v2-tnum" style={{ color: "var(--color-bnb)" }}>
                      +{lesson?.xp ?? 0} XP
                    </span>
                  </div>
                  <div
                    className="v2-serif"
                    style={{
                      fontSize: 14,
                      color: "var(--color-t-0)",
                      lineHeight: 1.3,
                    }}
                  >
                    {lesson?.title ?? lessonSlug}
                  </div>
                  <div
                    className="v2-mono v2-mc"
                    style={{
                      marginTop: 4,
                      color: "var(--color-t-3)",
                    }}
                  >
                    {mod?.title ?? moduleSlug} · {formatRelative(ts, t)}
                  </div>
                </I18nLink>
              ))}
            </div>
          )}

          {hydrated && lastActivity > 0 && (
            <div
              className="v2-mono v2-mc"
              style={{
                marginTop: 14,
                color: "var(--color-t-3)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span className="v2-tick" />
              {t("lastActivity", { when: formatRelative(lastActivity, t) })}
            </div>
          )}
        </div>
      </div>

      {/* DANGER ZONE — reset */}
      {hydrated && (lessonsCount > 0 || startedCount > 0) && (
        <div
          style={{
            marginTop: 48,
            paddingTop: 18,
            borderTop: "1px solid var(--color-line-1)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)" }}
          >
            {t("dangerZone")}
          </span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={handleReset}
            className="v2-mono v2-mc"
            style={{
              padding: "8px 14px",
              background: "transparent",
              color: confirmReset
                ? "var(--color-ember)"
                : "var(--color-t-2)",
              border: `1px solid ${confirmReset ? "var(--color-ember)" : "var(--color-line-3)"}`,
              cursor: "pointer",
              letterSpacing: "0.14em",
              fontFamily: "inherit",
            }}
          >
            {confirmReset ? t("resetConfirm") : t("resetProgress")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Wallet card (top-right of title band) ─── */
function WalletCard({
  account,
  balance,
  tShared,
}: {
  account: ReturnType<typeof useAccount>;
  balance: { formatted: string; symbol: string } | undefined;
  tShared: ReturnType<typeof useTranslations>;
}) {
  const connected = !!account.address && account.isConnected;

  return (
    <div
      style={{
        borderLeft: "1px solid var(--color-line-1)",
        paddingLeft: 24,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        className="v2-mono v2-mc"
        style={{
          color: connected ? "var(--color-bnb)" : "var(--color-t-3)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: connected ? "var(--color-bnb)" : "var(--color-t-4)",
            boxShadow: connected
              ? "0 0 0 4px rgba(240,185,11,0.18)"
              : "none",
          }}
        />
        {connected ? tShared("walletConnected") : tShared("walletNotConnected")}
      </div>

      {connected ? (
        <>
          <div
            className="v2-mono v2-tnum"
            style={{
              fontSize: 14,
              color: "var(--color-t-0)",
              letterSpacing: "-0.005em",
            }}
          >
            {account.address!.slice(0, 6)}…{account.address!.slice(-4)}
          </div>
          <div
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-3)" }}
          >
            {account.chain?.name ?? "—"}
            {balance && (
              <>
                {" · "}
                <span
                  className="v2-tnum"
                  style={{ color: "var(--color-t-1)" }}
                >
                  {Number(balance.formatted).toFixed(4)} {balance.symbol}
                </span>
              </>
            )}
          </div>
          <div style={{ marginTop: 4 }}>
            <ConnectButton showBalance={false} chainStatus="none" />
          </div>
        </>
      ) : (
        <>
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              color: "var(--color-t-2)",
              lineHeight: 1.5,
            }}
          >
            {tShared("walletHint")}
          </p>
          <div style={{ marginTop: 4 }}>
            <ConnectButton />
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Stat blocks ─── */
function BigStat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: "bnb";
}) {
  return (
    <div>
      <div
        className="v2-mono v2-mc"
        style={{ color: "var(--color-t-3)", marginBottom: 10 }}
      >
        {label}
      </div>
      <div
        className="v2-serif v2-tnum"
        style={{
          fontSize: 56,
          lineHeight: 1,
          letterSpacing: "-0.025em",
          color:
            accent === "bnb"
              ? "var(--color-bnb)"
              : "var(--color-t-0)",
          fontWeight: 400,
          fontStyle: accent === "bnb" ? "italic" : "normal",
        }}
      >
        {value}
      </div>
      <div
        className="v2-mono v2-mc"
        style={{ marginTop: 10, color: "var(--color-t-2)" }}
      >
        {unit}
      </div>
    </div>
  );
}

function StreakStat({
  days,
  label,
  unit,
}: {
  days: number;
  label: string;
  unit: string;
}) {
  const visualDays = Array.from({ length: 7 }).map((_, i) => i < days);
  return (
    <div>
      <div
        className="v2-mono v2-mc"
        style={{ color: "var(--color-t-3)", marginBottom: 10 }}
      >
        {label}
      </div>
      <div
        className="v2-serif v2-tnum"
        style={{
          fontSize: 56,
          lineHeight: 1,
          letterSpacing: "-0.025em",
          color: "var(--color-t-0)",
          fontWeight: 400,
          fontStyle: "italic",
        }}
      >
        {String(days).padStart(2, "0")}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
        {visualDays.map((on, i) => (
          <span
            key={i}
            style={{
              width: 12,
              height: 12,
              border: "1px solid var(--color-line-2)",
              background: on ? "var(--color-bnb)" : "transparent",
              display: "inline-block",
            }}
          />
        ))}
      </div>
      <div
        className="v2-mono v2-mc"
        style={{ marginTop: 8, color: "var(--color-t-2)" }}
      >
        {unit}
      </div>
    </div>
  );
}

/* ─── Empty in-progress slot ─── */
function EmptyCurrent({ text, cta }: { text: string; cta: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--color-line-2)",
        padding: "22px 26px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <span
        className="v2-serif"
        style={{
          fontSize: 16,
          color: "var(--color-t-1)",
          fontStyle: "italic",
          flex: 1,
        }}
      >
        {text}
      </span>
      <I18nLink
        href={QUEST_OF_DAY_PATH}
        className="v2-mono v2-mc"
        style={{
          padding: "10px 16px",
          background: "var(--color-bnb)",
          color: "#15110a",
          border: "none",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        ▸ {cta}
      </I18nLink>
    </div>
  );
}
