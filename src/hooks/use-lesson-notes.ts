"use client";

import { useCallback, useEffect, useState } from "react";
import type { LessonNote } from "@/lib/types";

const KEY_PREFIX = "idrop-notes:";

function storageKey(moduleSlug: string, lessonSlug: string) {
  return `${KEY_PREFIX}${moduleSlug}/${lessonSlug}`;
}

function read(moduleSlug: string, lessonSlug: string): LessonNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(moduleSlug, lessonSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LessonNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(moduleSlug: string, lessonSlug: string, notes: LessonNote[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(moduleSlug, lessonSlug),
      JSON.stringify(notes)
    );
  } catch {
    // ignore quota
  }
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface UseLessonNotesArgs {
  moduleSlug: string;
  lessonSlug: string;
}

/**
 * useLessonNotes — per-lesson timestamped notes. localStorage only.
 *
 * Decision: notes are NEVER synced onchain. Private + storage cost would dwarf
 * any educational value. Each note carries a video timestamp the user typed
 * while watching, so the right-rail can deep-link back into the player.
 */
export function useLessonNotes({ moduleSlug, lessonSlug }: UseLessonNotesArgs) {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setNotes(read(moduleSlug, lessonSlug));
    setHydrated(true);
  }, [moduleSlug, lessonSlug]);

  const addNote = useCallback(
    (videoTimeSec: number, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setNotes((prev) => {
        const next: LessonNote[] = [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            time: formatTime(videoTimeSec),
            text: trimmed,
            createdAt: Date.now(),
          },
        ];
        write(moduleSlug, lessonSlug, next);
        return next;
      });
    },
    [moduleSlug, lessonSlug]
  );

  const removeNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== id);
        write(moduleSlug, lessonSlug, next);
        return next;
      });
    },
    [moduleSlug, lessonSlug]
  );

  return { notes, hydrated, addNote, removeNote };
}
