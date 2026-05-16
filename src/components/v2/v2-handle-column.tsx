"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CuratedHandle {
  handle: string;
  label?: string;
}

/**
 * IDROP — curated Twitter/X handles for the landing.
 * Edit this list to change which accounts show their latest tweets.
 */
export const CURATED_HANDLES: CuratedHandle[] = [
  { handle: "cz_binance", label: "CZ" },
  { handle: "BNBChainLatAm", label: "BNB Chain LatAm" },
  { handle: "BNBCHAIN", label: "BNB Chain" },
  { handle: "flapdotsh", label: "flap.sh" },
  { handle: "fourdotmemezh", label: "four.meme" },
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

interface Props {
  handles?: CuratedHandle[];
  /** Tweets shown per account inside the iframe */
  tweetsPerAccount?: number;
  /** Iframe reserved height (Twitter may render shorter) */
  iframeHeight?: number;
  className?: string;
}

export function V2HandleColumn({
  handles = CURATED_HANDLES,
  tweetsPerAccount = 2,
  iframeHeight = 420,
  className,
}: Props) {
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (window.twttr?.widgets) {
      window.twttr.widgets.load(containerRef.current);
    }
  }, [handles]);

  return (
    <>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onReady={() => {
          window.twttr?.widgets.load(containerRef.current);
        }}
      />
      <div
        ref={containerRef}
        className={cn("v2-handle-grid", className)}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {handles.map((account) => (
          <HandleCard
            key={account.handle}
            account={account}
            locale={locale}
            tweetLimit={tweetsPerAccount}
            iframeHeight={iframeHeight}
            hydrated={hydrated}
          />
        ))}
      </div>
    </>
  );
}

function HandleCard({
  account,
  locale,
  tweetLimit,
  iframeHeight,
  hydrated,
}: {
  account: CuratedHandle;
  locale: string;
  tweetLimit: number;
  iframeHeight: number;
  hydrated: boolean;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--color-line-2)",
        background: "var(--color-ink-2)",
        overflow: "hidden",
      }}
    >
      {/* Account header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "10px 12px",
          borderBottom: "1px solid var(--color-line-1)",
          background: "var(--color-ink-3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--color-bnb) 0%, var(--color-accent-orange) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#15110a",
            }}
          >
            {account.handle.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              className="v2-mono"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-t-0)",
                lineHeight: 1.1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {account.label ?? account.handle}
            </div>
            <div
              className="v2-mono"
              style={{
                fontSize: 10,
                color: "var(--color-t-3)",
                marginTop: 2,
              }}
            >
              @{account.handle}
            </div>
          </div>
        </div>
        <a
          href={`https://x.com/${account.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open @${account.handle} on X`}
          style={{
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--color-line-2)",
            color: "var(--color-t-2)",
            flexShrink: 0,
            transition: "color .2s, border-color .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-bnb)";
            e.currentTarget.style.borderColor = "var(--color-bnb-line)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-t-2)";
            e.currentTarget.style.borderColor = "var(--color-line-2)";
          }}
        >
          <ExternalLink size={11} />
        </a>
      </div>

      {/* Tweet iframe area */}
      <div
        style={{
          position: "relative",
          height: iframeHeight,
          background: "var(--color-ink-1)",
        }}
      >
        {!hydrated && <HandleSkeleton />}
        <a
          className="twitter-timeline"
          data-theme="dark"
          data-chrome="noheader nofooter noborders"
          data-tweet-limit={tweetLimit}
          data-dnt="true"
          data-lang={locale === "es" ? "es" : "en"}
          data-height={iframeHeight}
          href={`https://twitter.com/${account.handle}?ref_src=twsrc%5Etfw`}
          style={{
            color: "var(--color-t-3)",
            fontSize: 11,
            fontFamily: "var(--font-plex-mono)",
          }}
        >
          <span style={{ padding: 16, display: "inline-block" }}>
            Cargando tweets de @{account.handle}…
          </span>
        </a>
      </div>
    </div>
  );
}

function HandleSkeleton() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 14,
      }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            border: "1px solid var(--color-line-2)",
            background: "var(--color-ink-2)",
            padding: 12,
            opacity: 0.5,
          }}
          className="animate-pulse"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--color-line-2)",
              }}
            />
            <div
              style={{
                height: 8,
                width: 80,
                background: "var(--color-line-2)",
              }}
            />
          </div>
          <div
            style={{
              height: 6,
              background: "var(--color-line-2)",
              marginBottom: 6,
            }}
          />
          <div
            style={{
              height: 6,
              background: "var(--color-line-2)",
              width: "80%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
