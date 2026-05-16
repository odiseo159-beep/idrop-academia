"use client";

import { useTranslations } from "next-intl";
import type { VideoChapter } from "@/lib/types";

interface LessonChapterStripProps {
  chapters: VideoChapter[];
}

/**
 * LessonChapterStrip — five-column row under the video, one cell per chapter.
 * Used only when `videoChapters` is present in MDX frontmatter; otherwise the
 * lesson page omits it entirely.
 *
 * Client component so it can ship inside LessonExperience without a server-prop
 * dance. Pure render — no state today; later we'll sync with video time.
 */
export function LessonChapterStrip({ chapters }: LessonChapterStripProps) {
  const t = useTranslations("v2.lesson");
  if (!chapters?.length) return null;

  const total = chapters.length;

  return (
    <div
      style={{
        marginTop: 14,
        border: "1px solid var(--color-line-1)",
        background: "rgba(7,8,13,0.4)",
        padding: "12px 14px",
      }}
    >
      <div
        className="v2-mono v2-mc"
        style={{
          color: "var(--color-t-3)",
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          {t("chapters")} · {total}
        </span>
        <span>{t("chaptersSync")}</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${total}, 1fr)`,
          gap: 0,
        }}
      >
        {chapters.map((c, i) => (
          <div
            key={i}
            style={{
              paddingRight: 14,
              marginRight: 14,
              borderRight:
                i < total - 1 ? "1px solid var(--color-line-1)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              className="v2-mono v2-mc v2-tnum"
              style={{
                color: i === 0 ? "var(--color-bnb)" : "var(--color-t-3)",
              }}
            >
              {c.time}
            </div>
            <div
              className="v2-serif"
              style={{
                fontSize: 13.5,
                lineHeight: 1.25,
                letterSpacing: "-0.005em",
                color: "var(--color-t-0)",
              }}
            >
              {c.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
