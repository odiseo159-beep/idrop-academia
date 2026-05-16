"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TwitterAccount {
  handle: string;
  label?: string;
}

export const CRYPTO_ACCOUNTS: TwitterAccount[] = [
  { handle: "WatcherGuru", label: "Watcher.Guru" },
  { handle: "Cointelegraph", label: "Cointelegraph" },
  { handle: "BNBCHAIN", label: "BNB Chain" },
  { handle: "PancakeSwap", label: "PancakeSwap" },
  { handle: "DegenerateNews", label: "Degenerate News" },
];

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement | null) => void;
      };
    };
  }
}

interface TwitterFeedProps {
  accounts?: TwitterAccount[];
  className?: string;
  tweetsPerAccount?: number;
  minHeightPerAccount?: number;
}

export function TwitterFeed({
  accounts = CRYPTO_ACCOUNTS,
  className,
  tweetsPerAccount = 3,
  minHeightPerAccount = 360,
}: TwitterFeedProps) {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !window.twttr?.widgets) return;
    window.twttr.widgets.load(containerRef.current);
  }, [scriptReady, accounts]);

  return (
    <>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onReady={() => {
          setScriptReady(true);
          window.twttr?.widgets.load(containerRef.current);
        }}
      />
      <div ref={containerRef} className={cn("space-y-4", className)}>
        {accounts.map((acct) => (
          <TweetCard
            key={acct.handle}
            account={acct}
            locale={locale}
            tweetLimit={tweetsPerAccount}
            minHeight={minHeightPerAccount}
          />
        ))}
      </div>
    </>
  );
}

function TweetCard({
  account,
  locale,
  tweetLimit,
  minHeight,
}: {
  account: TwitterAccount;
  locale: string;
  tweetLimit: number;
  minHeight: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-elevated px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 text-xs font-bold text-foreground">
            {account.handle.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">
              {account.label ?? account.handle}
            </div>
            <div className="text-[0.7rem] text-muted-foreground truncate">
              @{account.handle}
            </div>
          </div>
        </div>
        <a
          href={`https://x.com/${account.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          aria-label={`Open @${account.handle} on X`}
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div
        className="relative"
        style={{ minHeight, background: "#000" }}
      >
        <TimelineSkeleton minHeight={minHeight} />
        <a
          className="twitter-timeline relative z-10 block"
          data-theme="dark"
          data-chrome="noheader nofooter noborders"
          data-tweet-limit={tweetLimit}
          data-dnt="true"
          data-lang={locale === "es" ? "es" : "en"}
          href={`https://twitter.com/${account.handle}?ref_src=twsrc%5Etfw`}
        >
          <span className="sr-only">Tweets by @{account.handle}</span>
        </a>
      </div>
    </div>
  );
}

function TimelineSkeleton({ minHeight }: { minHeight: number }) {
  const rows = Math.max(2, Math.floor(minHeight / 110));
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex flex-col gap-3 p-4 pointer-events-none"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface-elevated p-3 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-border" />
            <div className="flex-1 space-y-1">
              <div className="h-2 w-24 rounded bg-border" />
              <div className="h-1.5 w-16 rounded bg-border/70" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-full rounded bg-border/80" />
            <div className="h-2 w-[88%] rounded bg-border/70" />
            <div className="h-2 w-[60%] rounded bg-border/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
