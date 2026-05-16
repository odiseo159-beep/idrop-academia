"use client";

import { LessonListItem } from "./lesson-list-item";
import { useProgress, useIsHydrated, isLessonComplete } from "@/lib/progress-store";
import type { LessonMeta } from "@/lib/types";

interface LessonListProps {
  lessons: LessonMeta[];
  enforceOrder?: boolean;
}

export function LessonList({ lessons, enforceOrder = false }: LessonListProps) {
  const hydrated = useIsHydrated();
  const checks = useProgress((s) =>
    lessons.map((l) => isLessonComplete(s, l.moduleSlug, l.slug)).join(",")
  );

  return (
    <div className="space-y-2">
      {lessons.map((lesson, i) => {
        const completedArr = checks.split(",").map((v) => v === "true");
        const prevCompleted = i > 0 ? completedArr[i - 1] : true;
        return (
          <LessonListItem
            key={lesson.slug}
            lesson={lesson}
            index={i}
            prevCompleted={hydrated ? prevCompleted : true}
            locked={enforceOrder}
          />
        );
      })}
    </div>
  );
}
