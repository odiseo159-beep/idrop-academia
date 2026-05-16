"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { LessonVideoPlayer } from "@/components/v2/lesson-video-player";
import { LessonChapterStrip } from "@/components/v2/lesson-chapter-strip";
import { LessonQuizCard } from "@/components/v2/lesson-quiz-card";
import { LessonModuleRail } from "@/components/v2/lesson-module-rail";
import { LessonActions } from "@/components/v2/lesson-actions";
import { LessonNotesBlock } from "@/components/v2/lesson-notes-block";
import { LessonQuestHook } from "@/components/v2/lesson-quest-hook";
import { LessonXpMoment } from "@/components/v2/lesson-xp-moment";
import { LessonShareModal } from "@/components/v2/lesson-share-modal";
import type { LessonMeta, QuizQuestion, VideoChapter } from "@/lib/types";

interface LessonExperienceProps {
  moduleSlug: string;
  moduleCode: string;
  moduleCategory: string;
  moduleTitle: string;
  moduleTotalLessons: number;
  moduleTotalMin: number;
  moduleTotalXp: number;
  /** All lessons in order, for the right-rail. */
  moduleLessons: LessonMeta[];

  lessonSlug: string;
  lessonCode: string;        // "L.01"
  lessonTitle: string;
  lessonTitleAccent?: string;
  lessonXp: number;
  videoUrl?: string;
  videoDurationSec?: number;
  videoDurationLabel: string; // "12:34"
  videoChapters?: VideoChapter[];
  quiz?: QuizQuestion[];

  /** Next lesson, for "Continuar L.02 →" CTA in A3. */
  nextLesson?: { slug: string; title: string; order: number; durationMin: number; xp: number } | null;
  /** Site origin so the share URL is absolute. */
  lessonUrl: string;

  /** Body MDX rendered server-side, passed through. */
  body: ReactNode;
  /** Prev/next nav pre-rendered server-side, passed through. */
  prevNext: ReactNode;

  /** Quiz XP carved out of the lesson XP for the breakdown row. */
  quizXp: number;
}

const VIDEO_WIDTH = 1080;

/**
 * LessonExperience — the single client-island that owns A1 → A2 → A3 → A4.
 *
 * State machine:
 *   A1 (default)        — video idle, quiz unanswered
 *     ↓ user passes quiz
 *   completion triggers → markComplete() → A3 opens after 250 ms grace
 *     ↓ user clicks Share
 *   A4 opens, A3 stays in DOM but covered (z-index)
 *     ↓ user closes A4
 *   back to A2 view (lesson is now in completed state forever)
 */
export function LessonExperience({
  moduleSlug,
  moduleCode,
  moduleCategory,
  moduleTitle,
  moduleTotalLessons,
  moduleTotalMin,
  moduleTotalXp,
  moduleLessons,
  lessonSlug,
  lessonCode,
  lessonTitle,
  lessonTitleAccent,
  lessonXp,
  videoUrl,
  videoDurationSec,
  videoDurationLabel,
  videoChapters,
  quiz,
  nextLesson,
  lessonUrl,
  body,
  prevNext,
  quizXp,
}: LessonExperienceProps) {
  const t = useTranslations("v2.lesson");
  const router = useRouter();

  const progress = useLessonProgress({
    moduleSlug,
    lessonSlug,
    moduleTotalLessons,
    moduleTotalXp,
    lessonXp,
  });

  const [xpOpen, setXpOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Edge-trigger the +XP modal exactly once when completion flips false→true.
  // Initial value mirrors the hydrated state so a returning user (already done)
  // never re-sees the celebration. Setting the flag before scheduling the
  // timer prevents the effect from re-firing on subsequent renders.
  const [completionLatched, setCompletionLatched] = useState(progress.completed);

  // Track how long the user actually took: timestamp when the lesson page
  // first mounts → snapshot when completion flips → A3 shows "Completada en X".
  const mountedAtRef = useRef<number>(Date.now());
  const [completedInLabel, setCompletedInLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!completionLatched && progress.completed) {
      setCompletionLatched(true);
      const elapsedSec = Math.max(
        1,
        Math.round((Date.now() - mountedAtRef.current) / 1000)
      );
      const m = Math.floor(elapsedSec / 60);
      const s = elapsedSec % 60;
      setCompletedInLabel(m > 0 ? `${m} m ${s} s` : `${s} s`);
      const tm = setTimeout(() => setXpOpen(true), 350);
      return () => clearTimeout(tm);
    }
    return undefined;
  }, [progress.completed, completionLatched]);

  const onQuizCorrect = useCallback(() => {
    progress.markComplete();
  }, [progress]);

  const breakdown = useMemo(
    () => [
      { label: t("xpMoment.breakdownVideo"), value: Math.round(lessonXp * 0.5) },
      { label: t("xpMoment.breakdownReading"), value: lessonXp - Math.round(lessonXp * 0.5) - quizXp },
      { label: t("xpMoment.breakdownQuiz"), value: quizXp, bonus: true },
    ],
    [lessonXp, quizXp, t]
  );

  function continueToNext() {
    setXpOpen(false);
    if (nextLesson) {
      router.push(`/learn/${moduleSlug}/${nextLesson.slug}`);
    }
  }

  function nowDayInfo() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msLeft = tomorrow.getTime() - now.getTime();
    const h = Math.floor(msLeft / 3_600_000);
    const m = Math.floor((msLeft % 3_600_000) / 60_000);
    return { h, m };
  }
  const { h: questHours, m: questMinutes } = nowDayInfo();

  return (
    <>
      {/* MAIN GRID — main column 1080px / sidebar 1fr */}
      <div
        style={{
          paddingLeft: 56,
          paddingRight: 56,
          display: "grid",
          gridTemplateColumns: `${VIDEO_WIDTH}px 1fr`,
          columnGap: 28,
          alignItems: "start",
          paddingBottom: 60,
        }}
      >
        {/* LEFT — main column */}
        <div>
          <LessonVideoPlayer
            width={VIDEO_WIDTH}
            videoUrl={videoUrl}
            videoDurationSec={videoDurationSec}
            videoChapters={videoChapters}
            lessonCode={lessonCode}
            lessonTitle={lessonTitle}
            completed={progress.completed}
          />

          {videoChapters && videoChapters.length > 0 && (
            <LessonChapterStrip chapters={videoChapters} />
          )}

          {/* Article (MDX) — rendered server-side, dropped in as-is */}
          <article className="v2-prose" style={{ marginTop: 28, maxWidth: VIDEO_WIDTH }}>
            {body}
          </article>

          {/* Quiz */}
          {quiz && quiz.length > 0 && (
            <LessonQuizCard
              quiz={quiz}
              bonusXp={quizXp}
              storageKey={`${moduleSlug}/${lessonSlug}`}
              onCorrect={onQuizCorrect}
              preAnswered={progress.completed}
            />
          )}

          {/* Prev/next */}
          {prevNext}
        </div>

        {/* RIGHT — sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <LessonModuleRail
            moduleSlug={moduleSlug}
            moduleCode={moduleCode}
            moduleCategory={moduleCategory}
            moduleTitle={moduleTitle}
            moduleTotalLessons={moduleTotalLessons}
            moduleTotalMin={moduleTotalMin}
            moduleTotalXp={moduleTotalXp}
            lessons={moduleLessons}
            currentSlug={lessonSlug}
            lessonXp={lessonXp}
          />

          <LessonActions
            moduleSlug={moduleSlug}
            lessonSlug={lessonSlug}
            bookmarked={progress.completed}
            onShare={() => setShareOpen(true)}
          />

          <LessonNotesBlock
            moduleSlug={moduleSlug}
            lessonSlug={lessonSlug}
          />

          <LessonQuestHook
            completedToday={progress.completed}
            streakDays={progress.streak.days || (progress.completed ? 1 : 0)}
            hoursRemaining={questHours}
            minutesRemaining={questMinutes}
            bonusXp={50}
          />

          {/* Wallet hint when not connected — soft prompt for opt-in onchain */}
          {!progress.wallet.isConnected && progress.hydrated && (
            <div
              style={{
                border: "1px dashed var(--color-line-2)",
                background: "transparent",
                padding: "12px 16px",
              }}
            >
              <div
                className="v2-mono v2-mc"
                style={{ color: "var(--color-t-3)", marginBottom: 6 }}
              >
                {t("walletHintTitle")}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: "var(--color-t-2)",
                }}
              >
                {t("walletHintBody")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* A3 — +XP moment */}
      <LessonXpMoment
        open={xpOpen}
        onClose={() => setXpOpen(false)}
        totalXp={lessonXp}
        breakdown={breakdown}
        moduleCode={moduleCode}
        lessonCode={lessonCode}
        completedInLabel={completedInLabel ?? ""}
        moduleName={moduleTitle}
        modulePct={progress.module.pct}
        moduleCompletedLessons={progress.module.completed}
        moduleTotalLessons={moduleTotalLessons}
        streakDays={progress.streak.days || 1}
        previousStreakDays={progress.streak.previousDays}
        onShare={() => {
          // Close A3 before A4 opens — no modal pileup, no auto-close racing
          // the share flow from underneath.
          setXpOpen(false);
          setShareOpen(true);
        }}
        onContinue={continueToNext}
      />

      {/* A4 — share modal */}
      <LessonShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        moduleCode={moduleCode}
        lessonCode={lessonCode}
        moduleName={moduleTitle}
        lessonTitle={lessonTitle}
        lessonTitleAccent={lessonTitleAccent}
        lessonXp={lessonXp}
        streakDays={progress.streak.days || 1}
        modulePct={progress.module.pct}
        lessonUrl={lessonUrl}
      />
    </>
  );
}
