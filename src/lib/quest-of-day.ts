/**
 * Single source of truth for "today's recommended lesson" — the destination
 * of every "start learning" affordance on the landing page:
 *
 *   - Masthead CTA "Entrar →"
 *   - Masthead nav "Descubre"
 *   - §02 Academia "▸ Aceptar quest"
 *
 * Today it's hardcoded to M.01 · L.01 to match the editorial copy
 * "Lección de Fundamentos · hoy" in the Academia quest strip. Tomorrow this
 * can rotate by date / pull from a curation file / read from an API without
 * touching any call site.
 */

export const QUEST_MODULE_SLUG = "fundamentos-bnb";
export const QUEST_LESSON_SLUG = "que-es-bnb";

/**
 * Locale-aware path for the daily quest. Pass through to next-intl's <Link>
 * (which prepends the locale segment automatically), or wrap with the locale
 * manually for server-side `redirect()` calls.
 */
export const QUEST_OF_DAY_PATH = `/learn/${QUEST_MODULE_SLUG}/${QUEST_LESSON_SLUG}` as const;
