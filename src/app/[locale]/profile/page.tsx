import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { V2Masthead } from "@/components/v2/v2-masthead";
import { V2Ticker } from "@/components/v2/v2-ticker";
import { V2ProfileOverview } from "@/components/v2/v2-profile-overview";
import { getAllModules } from "@/lib/modules";
import type { Locale } from "@/lib/types";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("profileTitle"),
    description: t("profileDescription"),
  };
}

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const modules = await getAllModules(locale);

  return (
    <div
      style={{
        background: "var(--color-ink-0)",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <V2Masthead />
      <V2ProfileOverview modules={modules} />
      <V2Ticker locale={locale} />
    </div>
  );
}
