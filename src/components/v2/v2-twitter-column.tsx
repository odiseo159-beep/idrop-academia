"use client";

import { TwitterFeed, type TwitterAccount } from "@/components/news/twitter-feed";
import { Link } from "@/i18n/navigation";

const V2_ACCOUNTS: TwitterAccount[] = [
  { handle: "WatcherGuru", label: "Watcher.Guru" },
  { handle: "BNBCHAIN", label: "BNB Chain" },
  { handle: "Cointelegraph", label: "Cointelegraph" },
  { handle: "cz_binance", label: "CZ" },
];

interface Props {
  locale: string;
  seeAllLabel: string;
}

export function V2TwitterColumn({ seeAllLabel }: Props) {
  return (
    <div>
      <TwitterFeed
        accounts={V2_ACCOUNTS}
        tweetsPerAccount={2}
        minHeightPerAccount={320}
      />
      <Link
        href="/news"
        className="v2-mono v2-mc v2-arrow-shift"
        style={{
          marginTop: 24,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "var(--color-bnb)",
          cursor: "pointer",
        }}
      >
        {seeAllLabel} <span className="v2-arrow">→</span>
      </Link>
    </div>
  );
}
