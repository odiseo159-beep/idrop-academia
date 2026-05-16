"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TwitterFeed, type TwitterAccount } from "@/components/news/twitter-feed";
import { LiveDot } from "./live-time";

const LANDING_ACCOUNTS: TwitterAccount[] = [
  { handle: "WatcherGuru", label: "Watcher.Guru" },
  { handle: "BNBCHAIN", label: "BNB Chain" },
  { handle: "Cointelegraph", label: "Cointelegraph" },
];

export function TwitterSidebar() {
  const t = useTranslations("landingTwitter");

  return (
    <aside
      className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1"
      style={{ overscrollBehavior: "contain" }}
    >
      <header className="border-b border-border-strong pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-3 min-w-0">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground shrink-0">
              § 03
            </span>
            <h3 className="font-editorial text-[1.15rem] font-medium leading-none tracking-tight text-foreground truncate">
              {t("title")}
            </h3>
          </div>
          <Link
            href="/news"
            className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
            aria-label={t("seeAll")}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[0.65rem]">
          <LiveDot />
          <span className="font-mono uppercase tracking-[0.22em] text-success">
            {t("liveLabel")}
          </span>
          <span className="text-border-strong">/</span>
          <span className="text-muted-foreground truncate">
            {t("subtitle")}
          </span>
        </div>
      </header>

      <TwitterFeed
        accounts={LANDING_ACCOUNTS}
        tweetsPerAccount={3}
        minHeightPerAccount={340}
      />
    </aside>
  );
}
