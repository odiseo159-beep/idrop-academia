"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { QuizQuestion } from "@/lib/types";

interface LessonQuizCardProps {
  quiz: QuizQuestion[];
  /** XP awarded on first-try correct answer. */
  bonusXp: number;
  /** Stable id for the form-state local storage key. */
  storageKey: string;
  /** Fired when the user gets the answer right for the first time. */
  onCorrect?: () => void;
  /** True if the lesson was already marked complete in a previous session. */
  preAnswered?: boolean;
}

interface QuizState {
  /** index of chosen option in `quiz[0].options`, or null. */
  pickedIndex: number | null;
  /** has the user submitted? */
  submitted: boolean;
  /** correct on first try? */
  firstTry: boolean;
}

const INITIAL: QuizState = { pickedIndex: null, submitted: false, firstTry: false };

/**
 * LessonQuizCard — single-question quiz with three visual states.
 *
 *   1. Unanswered — letter chips A/B/C/D, "Enviar respuesta" button greyed
 *      until a choice is made.
 *   2. Wrong      — selected option borders rojo, message "Intenta otra vez"
 *      + the correct one stays hidden until 2nd attempt; max 3 attempts.
 *   3. Correct    — chosen + correct option highlighted bnb, "↳ POR QUÉ"
 *      explanation appears, "+25 XP GANADOS" big serif italic on the right.
 *
 * Currently scopes to the first question only — the curriculum lessons all
 * carry one quiz question. Multi-question lessons would need a stepper here.
 */
export function LessonQuizCard({
  quiz,
  bonusXp,
  storageKey,
  onCorrect,
  preAnswered,
}: LessonQuizCardProps) {
  const t = useTranslations("v2.lesson.quiz");
  const q = quiz[0];

  const correctIndex = useMemo(
    () => q?.options.findIndex((o) => o.correct) ?? -1,
    [q]
  );

  const [state, setState] = useState<QuizState>(() => {
    if (preAnswered && correctIndex >= 0) {
      return { pickedIndex: correctIndex, submitted: true, firstTry: true };
    }
    return INITIAL;
  });

  if (!q || correctIndex < 0) {
    return null;
  }

  const isAnswered = state.submitted && state.pickedIndex === correctIndex;
  const isWrong = state.submitted && state.pickedIndex !== correctIndex;

  function submit() {
    if (state.pickedIndex == null) return;
    const correct = state.pickedIndex === correctIndex;
    const firstTry = correct && !state.submitted;
    setState({ pickedIndex: state.pickedIndex, submitted: true, firstTry });
    if (correct) {
      onCorrect?.();
      // persist the answered-status for next paint cycle
      try {
        window.localStorage.setItem(`${storageKey}:quiz`, "answered-correct");
      } catch {}
    }
  }

  function tryAgain() {
    setState(INITIAL);
  }

  return (
    <div
      style={{
        marginTop: 28,
        border: "1px solid var(--color-bnb-line)",
        background: isAnswered
          ? "rgba(240,185,11,0.07)"
          : "rgba(240,185,11,0.04)",
        padding: "22px 26px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <span
          className="v2-mono v2-mc"
          style={{ color: "var(--color-bnb)" }}
        >
          {isAnswered ? `✓ ${t("completed")}` : t("title")}
        </span>
        <span style={{ width: 1, height: 14, background: "var(--color-line-2)" }} />
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
          {isAnswered
            ? t("metaAnswered", { xp: bonusXp })
            : t("metaUnanswered", { xp: bonusXp })}
        </span>
        <span style={{ flex: 1 }} />
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
          {isAnswered ? t("firstTry") : t("attempts")}
        </span>
      </div>

      <h3
        className="v2-serif"
        style={{
          fontSize: 22,
          lineHeight: 1.2,
          letterSpacing: "-0.014em",
          margin: "0 0 16px",
          fontWeight: 500,
        }}
      >
        {q.question}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {q.options.map((o, i) => {
          const letter = String.fromCharCode(65 + i);
          const isCorrect = state.submitted && i === correctIndex;
          const isPickedWrong = state.submitted && i === state.pickedIndex && !o.correct;
          const dimmed = state.submitted && !isCorrect && !isPickedWrong;
          const selected = !state.submitted && state.pickedIndex === i;

          return (
            <button
              type="button"
              key={i}
              disabled={state.submitted && isAnswered}
              onClick={() => {
                if (state.submitted && isAnswered) return;
                if (state.submitted && isWrong) {
                  setState({ pickedIndex: i, submitted: false, firstTry: false });
                  return;
                }
                setState((s) => ({ ...s, pickedIndex: i }));
              }}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                background: isCorrect
                  ? "rgba(240,185,11,0.10)"
                  : isPickedWrong
                    ? "rgba(220,90,60,0.10)"
                    : selected
                      ? "rgba(240,185,11,0.06)"
                      : "transparent",
                border: `1px solid ${
                  isCorrect
                    ? "var(--color-bnb)"
                    : isPickedWrong
                      ? "var(--color-ember)"
                      : selected
                        ? "var(--color-bnb-line)"
                        : "var(--color-line-2)"
                }`,
                color: dimmed
                  ? "var(--color-t-3)"
                  : "var(--color-t-1)",
                cursor:
                  state.submitted && isAnswered ? "default" : "pointer",
                display: "flex",
                gap: 12,
                alignItems: "baseline",
                position: "relative",
              }}
            >
              <span
                className="v2-serif"
                style={{
                  fontSize: 18,
                  fontStyle: "italic",
                  color: isCorrect
                    ? "var(--color-bnb)"
                    : isPickedWrong
                      ? "var(--color-ember)"
                      : dimmed
                        ? "var(--color-t-4)"
                        : "var(--color-bnb)",
                  minWidth: 18,
                }}
              >
                {letter}
              </span>
              <span style={{ fontSize: 13.5, lineHeight: 1.45, flex: 1 }}>
                {o.text}
              </span>
              {isCorrect && (
                <span
                  className="v2-mono v2-mc"
                  style={{ color: "var(--color-bnb)", flexShrink: 0 }}
                >
                  ✓ {t("correct")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Submit / try-again / explanation */}
      {!state.submitted && (
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={submit}
            disabled={state.pickedIndex == null}
            className="v2-mono v2-mc"
            style={{
              padding: "12px 20px",
              background:
                state.pickedIndex == null
                  ? "rgba(240,185,11,0.18)"
                  : "var(--color-bnb)",
              color: state.pickedIndex == null ? "var(--color-t-3)" : "#15110a",
              border: "none",
              cursor: state.pickedIndex == null ? "not-allowed" : "pointer",
              letterSpacing: "0.14em",
            }}
          >
            {t("submit")}
          </button>
          <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
            {t("submitHint")}
          </span>
        </div>
      )}

      {isWrong && (
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={tryAgain}
            className="v2-mono v2-mc"
            style={{
              padding: "12px 20px",
              background: "transparent",
              color: "var(--color-ember)",
              border: "1px solid var(--color-ember)",
              cursor: "pointer",
              letterSpacing: "0.14em",
            }}
          >
            ↻ {t("tryAgain")}
          </button>
          <span className="v2-mono v2-mc" style={{ color: "var(--color-t-2)" }}>
            {t("wrongHint")}
          </span>
        </div>
      )}

      {isAnswered && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid var(--color-bnb-line)",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            columnGap: 24,
            alignItems: "start",
          }}
        >
          <div>
            <div
              className="v2-mono v2-mc"
              style={{ color: "var(--color-bnb)", marginBottom: 8 }}
            >
              ↳ {t("why")}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                lineHeight: 1.55,
                color: "var(--color-t-1)",
              }}
            >
              {q.explanation ?? t("noExplanation")}
            </p>
          </div>
          {/* Soft "Correcta" stamp replaces the old big +25 XP centerpiece. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            <span
              className="v2-serif"
              style={{
                fontSize: 22,
                fontStyle: "italic",
                color: "var(--color-bnb)",
                fontWeight: 400,
                lineHeight: 1,
              }}
            >
              ✓
            </span>
            <span
              className="v2-mono v2-mc"
              style={{ color: "var(--color-bnb)" }}
            >
              {t("earned")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
