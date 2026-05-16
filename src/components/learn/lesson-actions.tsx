"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Sparkles, Trophy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LessonQuiz } from "./lesson-quiz";
import {
  useProgress,
  useIsHydrated,
  isLessonComplete,
  progressStore,
} from "@/lib/progress-store";
import type { LessonMeta, QuizQuestion } from "@/lib/types";

interface LessonActionsProps {
  meta: LessonMeta;
  quiz?: QuizQuestion[];
  totalLessons: number;
  prev: LessonMeta | null;
  next: LessonMeta | null;
  moduleSlug: string;
  moduleTitle: string;
}

export function LessonActions({
  meta,
  quiz,
  totalLessons,
  prev,
  next,
  moduleSlug,
  moduleTitle,
}: LessonActionsProps) {
  const t = useTranslations("lesson");
  const tCommon = useTranslations("common");
  const [quizPassed, setQuizPassed] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const hydrated = useIsHydrated();
  const isComplete = useProgress((s) =>
    isLessonComplete(s, moduleSlug, meta.slug)
  );

  function handleComplete() {
    progressStore.completeLesson(moduleSlug, meta.slug, meta.xp, totalLessons);
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 3500);
  }

  const canComplete = !quiz || quiz.length === 0 || quizPassed || isComplete;
  const alreadyDone = hydrated && isComplete;

  return (
    <div className="mt-12 space-y-8">
      {quiz && quiz.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("checkUnderstanding")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <LessonQuiz quiz={quiz} onPassed={() => setQuizPassed(true)} />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("completePrompt")}
            </p>
            <p className="mt-1.5 text-sm text-foreground">
              {alreadyDone ? (
                <>
                  <Check className="inline h-3.5 w-3.5 text-success mr-1" />
                  {t("earnedXp")} <span className="text-primary font-semibold">+{meta.xp} XP</span>
                </>
              ) : (
                <>
                  {t("markCompleteHint")}{" "}
                  <span className="text-primary font-semibold">+{meta.xp} XP</span>
                </>
              )}
            </p>
          </div>
          <Button
            onClick={handleComplete}
            disabled={!canComplete || alreadyDone}
            variant={alreadyDone ? "outline" : "primary"}
            size="md"
          >
            {alreadyDone ? (
              <>
                <Check className="h-4 w-4" />
                {t("completed")}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t("markComplete")}
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success"
            >
              <Trophy className="h-4 w-4" />
              <span>{t("xpEarned", { xp: meta.xp })}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
        {prev ? (
          <Button asChild variant="ghost" size="md" className="sm:flex-1 justify-start">
            <Link href={`/learn/${moduleSlug}/${prev.slug}`}>
              <ArrowLeft className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">{tCommon("previous")}</span>
                <span className="text-sm font-medium truncate max-w-[16rem]">{prev.title}</span>
              </div>
            </Link>
          </Button>
        ) : (
          <Button asChild variant="ghost" size="md" className="sm:flex-1 justify-start">
            <Link href={`/learn/${moduleSlug}`}>
              <ArrowLeft className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="text-xs text-muted-foreground">{tCommon("back")}</span>
                <span className="text-sm font-medium truncate max-w-[16rem]">{moduleTitle}</span>
              </div>
            </Link>
          </Button>
        )}

        {next ? (
          <Button asChild variant="primary" size="md" className="sm:flex-1 justify-end">
            <Link href={`/learn/${moduleSlug}/${next.slug}`}>
              <div className="flex flex-col items-end">
                <span className="text-xs opacity-80">{tCommon("next")}</span>
                <span className="text-sm font-medium truncate max-w-[16rem]">{next.title}</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="primary" size="md" className="sm:flex-1 justify-end">
            <Link href={`/learn/${moduleSlug}`}>
              <div className="flex flex-col items-end">
                <span className="text-xs opacity-80">{tCommon("finish")}</span>
                <span className="text-sm font-medium">{t("moduleOverview")}</span>
              </div>
              <Trophy className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
