import { redirect } from "next/navigation";
import type { Locale } from "@/lib/types";

/**
 * /[locale]/news → /[locale]#portada
 *
 * The old News page paired a full feed with a Twitter sidebar. §01 Portada on
 * the landing already surfaces 10 headlines + 5 curated tweets — the same
 * editorial slice. When we want an archive view it'll be a new v2 route, not
 * the old gradient-blob page.
 */
export default async function NewsRedirect({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}#portada`);
}
