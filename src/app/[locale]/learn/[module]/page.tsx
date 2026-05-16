import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { V2Masthead } from "@/components/v2/v2-masthead";
import { V2Ticker } from "@/components/v2/v2-ticker";
import { V2ModuleOverview } from "@/components/v2/v2-module-overview";
import { getAllModuleSlugs, getAllModules, getModule } from "@/lib/modules";
import type { Locale } from "@/lib/types";

interface PageProps {
  params: Promise<{ module: string; locale: Locale }>;
}

export async function generateStaticParams() {
  const slugs = await getAllModuleSlugs();
  return slugs.map((module) => ({ module }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { module: slug, locale } = await params;
  try {
    const mod = await getModule(slug, locale);
    return {
      title: `${mod.title} — IDROP`,
      description: mod.description,
    };
  } catch {
    return { title: "Module not found — IDROP" };
  }
}

/**
 * Module overview page — "El Sumario" v2 design.
 *
 * Composition:
 *   - V2Masthead (sticky)
 *   - V2ModuleOverview client island (hero + stats + temario + 3-col footer)
 *     · derives one of 4 states from useLessonProgress + wagmi useAccount
 *     · A.1 empty · A.2 in-progress · A.3 almost-done · A.4 blocked-no-wallet
 *   - V2Ticker (footer)
 */
export default async function ModulePage({ params }: PageProps) {
  const { module: slug, locale } = await params;
  setRequestLocale(locale);
  // We hold the translations loader here just so the locale is bound to the
  // server request; the actual strings are resolved client-side by the island.
  await getTranslations({ locale, namespace: "v2.module" });

  let mod;
  try {
    mod = await getModule(slug, locale);
  } catch {
    notFound();
  }

  const allModules = await getAllModules(locale);

  return (
    <div
      style={{
        background: "var(--color-ink-0)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <V2Masthead />
      <V2ModuleOverview
        locale={locale}
        module={mod}
        allModules={allModules}
      />
      <V2Ticker locale={locale} />
    </div>
  );
}
