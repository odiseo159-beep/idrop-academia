"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, Clock, BookOpen } from "lucide-react";
import {
  useProgress,
  useIsHydrated,
  getModuleCompleted,
  isLessonComplete,
} from "@/lib/progress-store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { LessonMeta } from "@/lib/types";

interface LessonSidebarProps {
  moduleSlug: string;
  moduleTitle: string;
  lessons: LessonMeta[];
  currentSlug: string;
}

export function LessonSidebar({
  moduleSlug,
  moduleTitle,
  lessons,
  currentSlug,
}: LessonSidebarProps) {
  const t = useTranslations("common");
  const tProfile = useTranslations("profile");
  const hydrated = useIsHydrated();
  const completedCount = useProgress((s) => getModuleCompleted(s, moduleSlug));
  const checksKey = useProgress((s) =>
    lessons.map((l) => (isLessonComplete(s, moduleSlug, l.slug) ? "1" : "0")).join("")
  );

  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);
  const percent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <aside className="sticky top-24">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <Link
          href={`/learn/${moduleSlug}`}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {t("back")}
        </Link>
        <h3 className="mt-2 font-display text-lg font-semibold leading-tight">
          {moduleTitle}
        </h3>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {lessons.length} {t("lessons")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalDuration} {t("min")}
          </span>
        </div>

        {hydrated && completedCount > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{tProfile("inProgressTitle")}</span>
              <span className="font-medium text-foreground">
                {completedCount}/{lessons.length}
              </span>
            </div>
            <Progress value={percent} className="h-1.5" />
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        {lessons.map((lesson, i) => {
          const isCurrent = lesson.slug === currentSlug;
          const done = hydrated && checksKey[i] === "1";
          return (
            <Link
              key={lesson.slug}
              href={`/learn/${moduleSlug}/${lesson.slug}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
                isCurrent
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent hover:border-border hover:bg-surface text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-mono",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : done
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : String(i + 1).padStart(2, "0")}
              </div>
              <span className="text-sm font-medium leading-tight line-clamp-2 flex-1">
                {lesson.title}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
