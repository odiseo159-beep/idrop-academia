import { redirect } from "next/navigation";
import type { Locale } from "@/lib/types";

/**
 * /[locale]/learn → /[locale]#academia
 *
 * The old "catalog" view duplicated the v2 Academia section on the landing.
 * We collapsed it: the landing is the canonical entry. /learn/[module] and
 * /learn/[module]/[lesson] are unaffected — only this index redirects.
 */
export default async function LearnIndexRedirect({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}#academia`);
}
