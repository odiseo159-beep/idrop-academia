import { getTranslations } from "next-intl/server";
import { V2Loader } from "@/components/v2/v2-loader";

/**
 * Route-transition loading state for everything under [locale].
 *
 * Next.js shows this whenever a server component down the tree suspends —
 * which in practice means the first paint of a route change before the
 * server render arrives. Background matches ink-0 so the masthead doesn't
 * appear to flash a different color during the swap.
 *
 * Locale is read from the headers via `getTranslations()` so the aria-label
 * stays in the right language even though no params are received here.
 */
export default async function LocaleLoading() {
  let label = "Cargando...";
  try {
    const t = await getTranslations("common");
    label = t("loading");
  } catch {
    // Locale context not available — keep the Spanish fallback (default locale).
  }

  return (
    <div className="v2-loader-screen">
      <V2Loader ariaLabel={label} />
    </div>
  );
}
