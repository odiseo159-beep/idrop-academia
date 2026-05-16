"use client";

import { useTranslations } from "next-intl";
import { useProgress, useIsHydrated, getModuleCompleted } from "@/lib/progress-store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ModuleProgressBarProps {
  moduleSlug: string;
  totalLessons: number;
  accentColor?: string;
  className?: string;
  showLabel?: boolean;
}

export function ModuleProgressBar({
  moduleSlug,
  totalLessons,
  accentColor,
  className,
  showLabel = true,
}: ModuleProgressBarProps) {
  const t = useTranslations("profile");
  const hydrated = useIsHydrated();
  const completed = useProgress((s) => getModuleCompleted(s, moduleSlug));
  const percent = totalLessons === 0 ? 0 : Math.round((completed / totalLessons) * 100);

  if (!hydrated || completed === 0) return null;

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("inProgressTitle")}</span>
          <span className={cn("font-medium", accentColor ?? "text-foreground")}>
            {completed}/{totalLessons} · {percent}%
          </span>
        </div>
      )}
      <Progress value={percent} className="h-1.5" />
    </div>
  );
}
