import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ModuleCard } from "@/components/learn/module-card";
import type { Locale, Module } from "@/lib/types";

interface CoursesSectionProps {
  modules: Module[];
  locale: Locale;
}

export async function CoursesSection({ modules, locale }: CoursesSectionProps) {
  const t = await getTranslations({ locale, namespace: "landingCourses" });

  return (
    <section>
      <header className="border-b border-border-strong pb-3">
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
              § 02
            </span>
            <h2 className="font-editorial text-[1.5rem] font-medium leading-none tracking-tight text-foreground md:text-[1.75rem]">
              {t("title")}
            </h2>
          </div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-primary"
          >
            {t("seeAll")}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((m, i) => (
          <ModuleCard key={m.slug} module={m} index={i} />
        ))}
      </div>
    </section>
  );
}
