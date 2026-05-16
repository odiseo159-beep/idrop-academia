import { redirect } from "next/navigation";
import type { Locale } from "@/lib/types";

/**
 * /[locale]/discover → /[locale]#academia
 *
 * The old Discover page surfaced "quests" that were really just module cards.
 * The v2 Academia covers the same idea editorially. We collapse the route to
 * an anchor on the landing.
 */
export default async function DiscoverRedirect({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}#academia`);
}
