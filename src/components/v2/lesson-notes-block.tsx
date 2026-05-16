"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLessonNotes } from "@/hooks/use-lesson-notes";

interface LessonNotesBlockProps {
  moduleSlug: string;
  lessonSlug: string;
}

/**
 * LessonNotesBlock — sidebar block for the user's timestamped notes.
 * Two states (driven by data):
 *
 *   Empty  — explanatory copy + "+ Añadir nota" button (opens the inline form)
 *   Filled — list of notes (time + text), each in a hairline-separated row
 *
 * The video timestamp is "current video time" — for the placeholder/iframe
 * tier (no event hook into YT iframe yet) we use the time the user typed.
 */
export function LessonNotesBlock({ moduleSlug, lessonSlug }: LessonNotesBlockProps) {
  const t = useTranslations("v2.lesson.notes");
  const { notes, hydrated, addNote, removeNote } = useLessonNotes({
    moduleSlug,
    lessonSlug,
  });
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftTime, setDraftTime] = useState("0:00");

  if (!hydrated) {
    // Skeleton: just the shell — no content jitter on hydration
    return (
      <div
        style={{
          border: "1px solid var(--color-line-1)",
          background: "rgba(7,8,13,0.55)",
          padding: "14px 18px",
          minHeight: 100,
        }}
      />
    );
  }

  const isEmpty = notes.length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    // parseTimeToSec is dynamic; we just store the user-typed string verbatim
    // in the hook so we don't depend on it here.
    const parts = draftTime.split(":").map((p) => Number(p));
    const sec = parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
    addNote(sec, draft);
    setDraft("");
    setComposing(false);
  }

  if (isEmpty) {
    return (
      <div
        style={{
          border: "1px solid var(--color-line-1)",
          background: "rgba(7,8,13,0.55)",
          padding: "14px 18px",
        }}
      >
        <div
          className="v2-mono v2-mc"
          style={{
            color: "var(--color-t-2)",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span>{t("title")}</span>
          <span style={{ color: "var(--color-t-3)" }}>{t("empty")}</span>
        </div>
        {composing ? (
          <NoteForm
            draft={draft}
            setDraft={setDraft}
            draftTime={draftTime}
            setDraftTime={setDraftTime}
            onSubmit={handleSubmit}
            onCancel={() => setComposing(false)}
            t={t}
          />
        ) : (
          <>
            <p
              style={{
                margin: 0,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: "var(--color-t-3)",
              }}
            >
              {t("description")}
            </p>
            <button
              type="button"
              onClick={() => setComposing(true)}
              className="v2-mono v2-mc"
              style={{
                marginTop: 12,
                padding: "8px 12px",
                background: "transparent",
                color: "var(--color-t-1)",
                border: "1px solid var(--color-line-3)",
                cursor: "pointer",
                letterSpacing: "0.14em",
              }}
            >
              + {t("addNote")}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--color-line-1)",
        background: "rgba(7,8,13,0.55)",
      }}
    >
      <div
        className="v2-mono v2-mc"
        style={{
          color: "var(--color-bnb)",
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 18px 10px",
        }}
      >
        <span>{t("title")}</span>
        <span className="v2-tnum" style={{ color: "var(--color-t-3)" }}>
          {notes.length} · {t("synced")}
        </span>
      </div>
      {notes.map((n) => (
        <div
          key={n.id}
          style={{
            padding: "10px 18px 12px",
            borderTop: "1px solid var(--color-line-1)",
            position: "relative",
          }}
        >
          <div
            className="v2-mono v2-mc v2-tnum"
            style={{ color: "var(--color-bnb)", marginBottom: 4 }}
          >
            {n.time}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              lineHeight: 1.5,
              color: "var(--color-t-1)",
            }}
          >
            {n.text}
          </p>
          <button
            type="button"
            onClick={() => removeNote(n.id)}
            aria-label={t("removeAria")}
            className="v2-mono v2-mc"
            style={{
              position: "absolute",
              top: 8,
              right: 12,
              background: "transparent",
              border: "none",
              color: "var(--color-t-4)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>
      ))}
      {composing ? (
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid var(--color-line-1)",
          }}
        >
          <NoteForm
            draft={draft}
            setDraft={setDraft}
            draftTime={draftTime}
            setDraftTime={setDraftTime}
            onSubmit={handleSubmit}
            onCancel={() => setComposing(false)}
            t={t}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="v2-mono v2-mc"
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "transparent",
            color: "var(--color-t-1)",
            border: "none",
            borderTop: "1px solid var(--color-line-1)",
            cursor: "pointer",
            textAlign: "left",
            letterSpacing: "0.14em",
            fontFamily: "inherit",
          }}
        >
          + {t("addNote")}
        </button>
      )}
    </div>
  );
}

interface NoteFormProps {
  draft: string;
  setDraft: (v: string) => void;
  draftTime: string;
  setDraftTime: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  t: ReturnType<typeof useTranslations>;
}

function NoteForm({
  draft,
  setDraft,
  draftTime,
  setDraftTime,
  onSubmit,
  onCancel,
  t,
}: NoteFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          aria-label={t("timeLabel")}
          value={draftTime}
          onChange={(e) => setDraftTime(e.target.value)}
          placeholder="mm:ss"
          className="v2-mono v2-mc v2-tnum"
          style={{
            width: 70,
            padding: "6px 8px",
            background: "var(--color-ink-0)",
            border: "1px solid var(--color-line-2)",
            color: "var(--color-bnb)",
            letterSpacing: "0.1em",
            fontFamily: "inherit",
          }}
        />
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
          {t("timeHint")}
        </span>
      </div>
      <textarea
        aria-label={t("textLabel")}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={t("placeholder")}
        rows={3}
        style={{
          background: "var(--color-ink-0)",
          border: "1px solid var(--color-line-2)",
          color: "var(--color-t-0)",
          padding: "8px 10px",
          fontSize: 13,
          lineHeight: 1.4,
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="submit"
          className="v2-mono v2-mc"
          disabled={!draft.trim()}
          style={{
            padding: "8px 12px",
            background: draft.trim() ? "var(--color-bnb)" : "rgba(240,185,11,0.18)",
            color: draft.trim() ? "#15110a" : "var(--color-t-3)",
            border: "none",
            cursor: draft.trim() ? "pointer" : "not-allowed",
            letterSpacing: "0.14em",
          }}
        >
          {t("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="v2-mono v2-mc"
          style={{
            padding: "8px 12px",
            background: "transparent",
            color: "var(--color-t-2)",
            border: "1px solid var(--color-line-2)",
            cursor: "pointer",
            letterSpacing: "0.14em",
          }}
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
