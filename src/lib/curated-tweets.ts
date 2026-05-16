/**
 * IDROP — Curated tweets list
 *
 * react-tweet renders a SPECIFIC tweet by ID (not auto-latest from account).
 * To curate which tweets show on the landing:
 *
 *   1. Open the tweet on x.com (e.g. https://x.com/cz_binance/status/1820017183557935488)
 *   2. Copy the last number in the URL — that's the tweet ID
 *   3. Add it to CURATED_TWEETS below as a string
 *
 * The order in this array is the order they appear in the grid.
 * If a tweet is deleted or the ID is wrong, react-tweet renders a discreet
 * "not found" card with a fallback link to open the URL on X.
 *
 * Tweets are fetched server-side at request time and cached by Next.js.
 * Refresh the curation periodically to keep the page fresh.
 *
 * RECOMMENDED: 4 tweets (2x2 grid), max 6 (2x3 grid).
 */

export interface CuratedTweet {
  id: string;
  /** Optional editorial note — never shown to the user */
  note?: string;
}

export const CURATED_TWEETS: CuratedTweet[] = [
  {
    id: "20",
    note: "Jack Dorsey's first tweet — evergreen demo, replace when ready",
  },
  {
    id: "1751083454841593893",
    note: "Vitalik on Ethereum scaling — placeholder, replace with your pick",
  },
  {
    id: "1742835240970801450",
    note: "CZ on building — placeholder, replace with your pick",
  },
  {
    id: "1733410859960537242",
    note: "BNB Chain announcement — placeholder, replace with your pick",
  },
];
