"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { ModuleCard } from "./module-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Module, Difficulty } from "@/lib/types";

interface CatalogFiltersProps {
  modules: Module[];
}

export function CatalogFilters({ modules }: CatalogFiltersProps) {
  const t = useTranslations("catalog");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<"all" | "available" | "coming-soon">("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const DIFFICULTIES: { value: Difficulty | "all"; label: string }[] = [
    { value: "all", label: t("allLevels") },
    { value: "beginner", label: t("beginner") },
    { value: "intermediate", label: t("intermediate") },
    { value: "advanced", label: t("advanced") },
  ];

  const STATUS_FILTERS = [
    { value: "all" as const, label: t("filterAll") },
    { value: "available" as const, label: t("filterAvailable") },
    { value: "coming-soon" as const, label: t("filterComingSoon") },
  ];

  const categories = useMemo(() => {
    const set = new Set(modules.map((m) => m.category));
    return Array.from(set);
  }, [modules]);

  const filtered = useMemo(() => {
    return modules.filter((m) => {
      if (difficulty !== "all" && m.difficulty !== difficulty) return false;
      if (status !== "all" && m.status !== status) return false;
      if (activeCategory && m.category !== activeCategory) return false;
      if (query) {
        const q = query.toLowerCase();
        const haystack = `${m.title} ${m.description} ${m.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [modules, query, difficulty, status, activeCategory]);

  return (
    <>
      <div className="mt-12 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-surface pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  difficulty === d.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  status === s.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="ml-auto text-xs text-muted-foreground">
            {t("modulesOf", { shown: filtered.length, total: modules.length })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t("categoryAll")}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c === activeCategory ? null : c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeCategory === c
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m, i) => (
          <ModuleCard key={m.slug} module={m} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-20 rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <Badge variant="outline">{t("noMatches")}</Badge>
          <p className="mt-4 text-muted-foreground">
            {t("noMatchesHint")}
          </p>
        </div>
      )}
    </>
  );
}
