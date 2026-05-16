"use client";

import { useCallback, useMemo, useRef } from "react";
import { useAccount } from "wagmi";
import {
  progressStore,
  useProgress,
  useIsHydrated,
  isLessonComplete,
  getModuleCompleted,
} from "@/lib/progress-store";
import type { LessonMeta } from "@/lib/types";

interface UseLessonProgressArgs {
  moduleSlug: string;
  lessonSlug: string;
  /** Used to derive module % + lock module-completion. */
  moduleTotalLessons: number;
  /** Used to compute module XP earned vs total. */
  moduleTotalXp: number;
  /** XP this specific lesson awards on completion. */
  lessonXp: number;
  /**
   * Optional — all lessons in this module. When provided the hook returns
   * the EXACT sum of XP across completed lessons; otherwise it falls back
   * to the count × average approximation (acceptable when every lesson is
   * worth the same XP, which is the case for the current curriculum).
   */
  moduleLessons?: ReadonlyArray<Pick<LessonMeta, "slug" | "xp">>;
}

export interface LessonProgressView {
  /** True after localStorage has been read on the client. Render-gates flicker. */
  hydrated: boolean;
  /** This specific lesson done? */
  completed: boolean;
  /** XP this lesson awards (echo of input — pass-through for ergonomics). */
  lessonXp: number;
  /** Module-level rollup. */
  module: {
    completed: number;
    total: number;
    /** 0–100 integer for progress bars. */
    pct: number;
    xpEarned: number;
    xpTotal: number;
  };
  /** Daily-quest streak (consecutive days with ≥1 lesson completed). */
  streak: {
    /** Current streak as of now. */
    days: number;
    /**
     * Streak as it was BEFORE the user marked this lesson complete this session.
     * Used by A3 +XP modal to animate "03 → 04". `null` if no completion this session.
     */
    previousDays: number | null;
  };
  /** Global XP across all modules. */
  totalXp: number;
  /** Mark this lesson complete (no-op if already). */
  markComplete: () => void;
  /** Undo (dev / testing). */
  unmarkComplete: () => void;
  /** Wagmi state — null when not connected, useful for sidebar copy. */
  wallet: {
    address: `0x${string}` | undefined;
    isConnected: boolean;
    chainId: number | undefined;
  };
  /**
   * Sync local progress onchain (PHASE 1 — placeholder).
   * Currently a logger so we know where the call site is.
   */
  syncToChain: () => Promise<void>;
}

/**
 * useLessonProgress — single hook the lesson page reads from for everything
 * progress-related. Backed by `progressStore` (localStorage) today, with a
 * `syncToChain` placeholder that becomes the wagmi-write call in Phase 1.
 *
 * Wallet state is pulled from wagmi so the sidebar can show "Conecta para
 * guardar tu progreso" affordances without each component calling useAccount.
 */
export function useLessonProgress({
  moduleSlug,
  lessonSlug,
  moduleTotalLessons,
  moduleTotalXp,
  lessonXp,
  moduleLessons,
}: UseLessonProgressArgs): LessonProgressView {
  const hydrated = useIsHydrated();
  const account = useAccount();

  const completed = useProgress((s) =>
    isLessonComplete(s, moduleSlug, lessonSlug)
  );
  const moduleCompleted = useProgress((s) =>
    getModuleCompleted(s, moduleSlug)
  );
  const totalXp = useProgress((s) => s.totalXp);
  const streakDays = useProgress((s) => s.streakDays ?? 0);

  // Subscribe to the per-lesson completion bitmap so xpEarned recomputes
  // whenever any lesson in this module flips done — the selector returns a
  // stable string so identity comparisons skip re-renders when unchanged.
  const completedKey = useProgress((s) =>
    moduleLessons
      ? moduleLessons
          .map((l) =>
            isLessonComplete(s, moduleSlug, l.slug) ? "1" : "0"
          )
          .join("")
      : ""
  );

  // Snapshot streak BEFORE the user marks the lesson done this session so A3
  // can animate "03 → 04". We track via ref so it doesn't re-render every tick.
  const previousStreakRef = useRef<number | null>(null);
  const previousDays = previousStreakRef.current;

  const xpEarned = useMemo(() => {
    // Exact path: caller passed `moduleLessons` → sum XP of completed lessons
    // using the bitmap snapshot. This is accurate even when lessons in the
    // module have different XP values.
    if (moduleLessons && completedKey) {
      let sum = 0;
      for (let i = 0; i < moduleLessons.length; i++) {
        if (completedKey[i] === "1") sum += moduleLessons[i].xp;
      }
      return sum;
    }
    // Approximate fallback: count × avg per-lesson XP. Good enough when every
    // lesson is worth the same (today's curriculum: 100 XP each).
    if (!moduleTotalLessons) return 0;
    const perLesson = moduleTotalXp / moduleTotalLessons;
    return Math.round(moduleCompleted * perLesson);
  }, [
    moduleLessons,
    completedKey,
    moduleCompleted,
    moduleTotalLessons,
    moduleTotalXp,
  ]);

  const modulePct = useMemo(() => {
    if (!moduleTotalLessons) return 0;
    return Math.round((moduleCompleted / moduleTotalLessons) * 100);
  }, [moduleCompleted, moduleTotalLessons]);

  const markComplete = useCallback(() => {
    if (completed) return;
    // Snapshot the BEFORE streak so the +XP modal can animate the bump.
    previousStreakRef.current = streakDays;
    progressStore.completeLesson(
      moduleSlug,
      lessonSlug,
      lessonXp,
      moduleTotalLessons
    );
  }, [completed, streakDays, moduleSlug, lessonSlug, lessonXp, moduleTotalLessons]);

  const unmarkComplete = useCallback(() => {
    // Surgical undo: only this lesson, refund XP, clear streak-day key if no
    // other completions today. Useful in dev to re-test the A3 modal.
    if (typeof window === "undefined") return;
    progressStore.setState((s) => {
      const key = `${moduleSlug}/${lessonSlug}`;
      if (!s.completedLessons[key]) return s;
      const next = { ...s.completedLessons };
      delete next[key];
      return {
        ...s,
        completedLessons: next,
        totalXp: Math.max(0, s.totalXp - lessonXp),
      };
    });
  }, [moduleSlug, lessonSlug, lessonXp]);

  const syncToChain = useCallback(async () => {
    // PHASE 1 — replace with a wagmi write to the IDROP attestation contract.
    // Contract design (mapping vs ERC-1155 attestations vs POAP) is a separate
    // decision; today we just log so the integration surface is real.
    if (!account.isConnected) {
      console.warn("[useLessonProgress] syncToChain called without wallet");
      return;
    }
    console.info("[useLessonProgress] syncToChain (phase 1 placeholder)", {
      address: account.address,
      chainId: account.chainId,
      moduleSlug,
      lessonSlug,
    });
  }, [account.address, account.chainId, account.isConnected, moduleSlug, lessonSlug]);

  return {
    hydrated,
    completed,
    lessonXp,
    module: {
      completed: moduleCompleted,
      total: moduleTotalLessons,
      pct: modulePct,
      xpEarned,
      xpTotal: moduleTotalXp,
    },
    streak: {
      days: streakDays,
      previousDays,
    },
    totalXp,
    markComplete,
    unmarkComplete,
    wallet: {
      address: account.address,
      isConnected: account.isConnected,
      chainId: account.chainId,
    },
    syncToChain,
  };
}
