/**
 * Curriculum ordering for the Academia BNB. Beginner → advanced.
 *
 * Slug-to-position is used to compute the "M.0N" code shown in the lesson
 * masthead, breadcrumb, share card, etc. Modules not listed here go at the
 * end in their original (alphabetical) order with codes starting after.
 */
export const MODULE_ORDER: string[] = [
  "fundamentos-bnb",
  "wallets-seguridad",
  "defi-bnb",
  "tokens-bep20",
  "nfts-bep721",
  "memecoins-launchpads",
];

/** "M.01", "M.02", … "M.06". Slug not in MODULE_ORDER → returns "M.??". */
export function moduleCodeFor(slug: string): string {
  const i = MODULE_ORDER.indexOf(slug);
  if (i === -1) return "M.??";
  return `M.${String(i + 1).padStart(2, "0")}`;
}

/** Sort an array of modules into the canonical curriculum order. */
export function orderBySlug<T extends { slug: string }>(items: T[]): T[] {
  const indexOf = (slug: string) => {
    const i = MODULE_ORDER.indexOf(slug);
    return i === -1 ? MODULE_ORDER.length : i;
  };
  return [...items].sort((a, b) => indexOf(a.slug) - indexOf(b.slug));
}
