import { setRequestLocale } from "next-intl/server";
import { V2Masthead } from "@/components/v2/v2-masthead";
import { V2Hero } from "@/components/v2/v2-hero";
import { V2Portada } from "@/components/v2/v2-portada";
import { V2Academia } from "@/components/v2/v2-academia";
import { V2Manifiesto } from "@/components/v2/v2-manifiesto";
import { V2Ticker } from "@/components/v2/v2-ticker";
import { RevealOnScroll } from "@/components/v2/reveal-on-scroll";
import { getAllModules } from "@/lib/modules";
import type { Locale } from "@/lib/types";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export const revalidate = 600;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const modules = await getAllModules(locale);

  const totalLessons = modules.reduce((sum, m) => sum + m.totalLessons, 0);

  return (
    <div
      className="v2-sans"
      style={{
        background: "var(--color-ink-0)",
        color: "var(--color-t-0)",
        minWidth: 320,
      }}
    >
      <V2Masthead />
      <RevealOnScroll>
        <V2Hero
          locale={locale}
          moduleCount={modules.length}
          lessonCount={totalLessons}
        />
        <V2Portada locale={locale} />
        <V2Academia locale={locale} modules={modules} />
        <V2Manifiesto locale={locale} />
      </RevealOnScroll>
      <V2Ticker locale={locale} />
    </div>
  );
}
