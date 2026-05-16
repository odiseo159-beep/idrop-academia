import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/learn/module-card";
import type { Module } from "@/lib/types";

interface FeaturedModulesProps {
  modules: Module[];
}

export function FeaturedModules({ modules }: FeaturedModulesProps) {
  const t = useTranslations("landing");

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {t("featuredEyebrow")}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
              {t("featuredTitlePart1")}{" "}
              <span className="text-gradient-bnb">BNB</span>{" "}
              {t("featuredTitlePart2")}
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              {t("featuredDescription")}
            </p>
          </div>

          <Button asChild variant="outline" size="md">
            <Link href="/learn">
              {t("featuredViewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <ModuleCard key={m.slug} module={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
