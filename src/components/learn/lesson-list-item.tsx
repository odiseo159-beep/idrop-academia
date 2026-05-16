"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, Clock, Lock, Play, Sparkles } from "lucide-react";
import { useProgress, useIsHydrated, isLessonComplete } from "@/lib/progress-store";
import { cn } from "@/lib/utils";
import type { LessonMeta } from "@/lib/types";

interface LessonListItemProps {
  lesson: LessonMeta;
  index: number;
  prevCompleted: boolean;
  locked?: boolean;
}

export function LessonListItem({
  lesson,
  index,
  prevCompleted,
  locked = false,
}: LessonListItemProps) {
  const t = useTranslations("common");
  const hydrated = useIsHydrated();
  const isComplete = useProgress((s) =>
    isLessonComplete(s, lesson.moduleSlug, lesson.slug)
  );

  const showLock = locked && hydrated && !prevCompleted && !isComplete && index > 0;
  const href = `/learn/${lesson.moduleSlug}/${lesson.slug}`;
  const className = cn(
    "group relative flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all",
    !showLock && "hover:border-border-strong hover:bg-surface-elevated",
    showLock && "opacity-60 cursor-not-allowed"
  );

  const inner = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-elevated text-sm font-mono">
        {hydrated && isComplete ? (
          <Check className="h-4 w-4 text-success" />
        ) : showLock ? (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <span className="text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">
            {lesson.title}
          </h4>
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
          {lesson.description}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {lesson.duration} {t("min")}
        </span>
        <span className="flex items-center gap-1 text-primary">
          <Sparkles className="h-3 w-3" />
          {lesson.xp} XP
        </span>
      </div>

      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover:border-primary group-hover:text-primary">
        {showLock ? <Lock className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </div>
    </>
  );

  if (showLock) {
    return (
      <div className={className} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
