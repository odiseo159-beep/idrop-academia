"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";

interface LessonQuizProps {
  quiz: QuizQuestion[];
  onPassed?: () => void;
}

export function LessonQuiz({ quiz, onPassed }: LessonQuizProps) {
  const t = useTranslations("quiz");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = quiz[current];
  const isLast = current === quiz.length - 1;
  const passingScore = Math.ceil(quiz.length * 0.66);

  function handleConfirm() {
    if (selected === null) return;
    const correct = q.options[selected].correct;
    if (correct) setCorrectCount((c) => c + 1);
    setRevealed(true);
  }

  function handleNext() {
    if (isLast) {
      setFinished(true);
      if (correctCount >= passingScore) onPassed?.();
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  function handleRetry() {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
  }

  const didPass = correctCount >= passingScore;

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-surface p-8 text-center"
      >
        <div className={cn(
          "inline-flex h-14 w-14 items-center justify-center rounded-full",
          didPass ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
        )}>
          {didPass ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold">
          {didPass ? t("passed") : t("almostThere")}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {t("scoreLine", { correct: correctCount, total: quiz.length })}
          {!didPass && ` ${t("needToPass", { n: passingScore })}`}
        </p>

        {didPass ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
            <Sparkles className="h-4 w-4" />
            {t("claimXpHint")}
          </div>
        ) : (
          <Button onClick={handleRetry} variant="primary" size="md" className="mt-6">
            <RotateCcw className="h-4 w-4" />
            {t("retry")}
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
      <div className="flex items-center justify-between">
        <Badge variant="primary">
          <Sparkles className="h-3 w-3" />
          {t("label")}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {current + 1} / {quiz.length}
        </span>
      </div>

      <div className="mt-6">
        <h3 className="font-display text-xl font-semibold leading-snug md:text-2xl">
          {q.question}
        </h3>
      </div>

      <div className="mt-6 space-y-2.5">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = revealed && opt.correct;
          const showWrong = revealed && isSelected && !opt.correct;

          return (
            <button
              key={i}
              onClick={() => !revealed && setSelected(i)}
              disabled={revealed}
              className={cn(
                "group relative w-full overflow-hidden rounded-xl border bg-surface-elevated p-4 text-left transition-all",
                !revealed && "hover:border-border-strong",
                isSelected && !revealed && "border-primary bg-primary/5",
                showCorrect && "border-success bg-success/10",
                showWrong && "border-danger bg-danger/10",
                !isSelected && !showCorrect && "border-border",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-mono",
                    isSelected && !revealed && "border-primary bg-primary text-primary-foreground",
                    showCorrect && "border-success bg-success text-background",
                    showWrong && "border-danger bg-danger text-background",
                    !isSelected && !showCorrect && "border-border text-muted-foreground"
                  )}
                >
                  {revealed ? (
                    showCorrect ? <Check className="h-3.5 w-3.5" /> : showWrong ? <X className="h-3.5 w-3.5" /> : String.fromCharCode(65 + i)
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </div>
                <span className={cn(
                  "text-sm",
                  showCorrect ? "text-success font-medium" : showWrong ? "text-danger" : "text-foreground"
                )}>
                  {opt.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {revealed && q.explanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("why")}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {q.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-end">
        {!revealed ? (
          <Button onClick={handleConfirm} disabled={selected === null} variant="primary" size="md">
            {t("checkAnswer")}
          </Button>
        ) : (
          <Button onClick={handleNext} variant="primary" size="md">
            {isLast ? t("seeResults") : t("nextQuestion")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
