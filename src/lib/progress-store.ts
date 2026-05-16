"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { UserProgress } from "./types";

const STORAGE_KEY = "idrop-progress";

const initial: UserProgress = {
  completedLessons: {},
  totalXp: 0,
  modulesStarted: [],
  modulesCompleted: [],
  streakDays: 0,
};

function toDayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diffDays(fromKey: string, toKey: string): number {
  const a = new Date(`${fromKey}T00:00:00`).getTime();
  const b = new Date(`${toKey}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

type Listener = () => void;

class ProgressStore {
  private state: UserProgress = initial;
  private listeners = new Set<Listener>();
  private hydrated = false;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): UserProgress => this.state;

  getServerSnapshot = (): UserProgress => initial;

  setState(updater: (s: UserProgress) => UserProgress) {
    this.state = updater(this.state);
    this.persist();
    this.listeners.forEach((l) => l());
  }

  hydrate() {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProgress;
        this.state = { ...initial, ...parsed };
        this.listeners.forEach((l) => l());
      }
    } catch {
      // ignore
    }
  }

  isHydrated() {
    return this.hydrated;
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore quota
    }
  }

  completeLesson(
    moduleSlug: string,
    lessonSlug: string,
    xp: number,
    moduleTotalLessons: number
  ) {
    this.setState((state) => {
      const key = `${moduleSlug}/${lessonSlug}`;
      if (state.completedLessons[key]) return state;

      const now = Date.now();
      const today = toDayKey(now);
      const completedLessons = { ...state.completedLessons, [key]: now };
      const modulesStarted = state.modulesStarted.includes(moduleSlug)
        ? state.modulesStarted
        : [...state.modulesStarted, moduleSlug];

      const moduleCompletedCount = Object.keys(completedLessons).filter((k) =>
        k.startsWith(`${moduleSlug}/`)
      ).length;

      const modulesCompleted =
        moduleCompletedCount >= moduleTotalLessons &&
        !state.modulesCompleted.includes(moduleSlug)
          ? [...state.modulesCompleted, moduleSlug]
          : state.modulesCompleted;

      // Streak: continue if today === lastStreakDay (no change),
      // increment if today is exactly +1 day, else reset to 1.
      let streakDays = state.streakDays ?? 0;
      const lastStreakDay = state.lastStreakDay;
      if (!lastStreakDay) {
        streakDays = 1;
      } else if (lastStreakDay === today) {
        // same day, streak unchanged
      } else {
        const gap = diffDays(lastStreakDay, today);
        streakDays = gap === 1 ? streakDays + 1 : 1;
      }

      return {
        completedLessons,
        totalXp: state.totalXp + xp,
        modulesStarted,
        modulesCompleted,
        lastActivity: now,
        streakDays,
        lastStreakDay: today,
      };
    });
  }

  reset() {
    this.setState(() => ({ ...initial }));
  }
}

export const progressStore = new ProgressStore();

export function useProgress<T>(selector: (s: UserProgress) => T): T {
  return useSyncExternalStore(
    progressStore.subscribe,
    () => selector(progressStore.getSnapshot()),
    () => selector(progressStore.getServerSnapshot())
  );
}

export function useIsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    progressStore.hydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

export function isLessonComplete(
  state: UserProgress,
  moduleSlug: string,
  lessonSlug: string
): boolean {
  return Boolean(state.completedLessons[`${moduleSlug}/${lessonSlug}`]);
}

export function getModuleCompleted(
  state: UserProgress,
  moduleSlug: string
): number {
  return Object.keys(state.completedLessons).filter((k) =>
    k.startsWith(`${moduleSlug}/`)
  ).length;
}
