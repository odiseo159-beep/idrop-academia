import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { V2Masthead } from "@/components/v2/v2-masthead";
import { V2Ticker } from "@/components/v2/v2-ticker";
import { V2Calendar } from "@/components/v2/v2-calendar";
import { getCalendarData } from "@/lib/calendar";
import type { Locale } from "@/lib/types";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("calendarTitle"),
    description: t("calendarDescription"),
  };
}

export default async function CalendarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = getCalendarData();

  return (
    <div
      style={{
        background: "var(--color-ink-0)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <V2Masthead />
      <V2Calendar
        events={data.events}
        lastUpdated={data.lastUpdated}
        locale={locale}
      />
      <V2Ticker locale={locale} />
    </div>
  );
}
