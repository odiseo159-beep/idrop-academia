import { Suspense } from "react";
import { getTweet } from "react-tweet/api";
import {
  EmbeddedTweet,
  TweetNotFound,
  TweetSkeleton,
  type TweetProps,
} from "react-tweet";
import { ExternalLink } from "lucide-react";
import { CURATED_TWEETS } from "@/lib/curated-tweets";

interface V2CuratedTweetsProps {
  className?: string;
}

export function V2CuratedTweets({ className }: V2CuratedTweetsProps) {
  return (
    <div
      data-theme="dark"
      className={"v2-tweet-grid " + (className ?? "")}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      {CURATED_TWEETS.map((t, i) => (
        <Suspense key={t.id + i} fallback={<IdropTweetSkeleton />}>
          <IdropTweet id={t.id} />
        </Suspense>
      ))}
    </div>
  );
}

async function IdropTweet({ id }: { id: string }) {
  let tweet: Awaited<ReturnType<typeof getTweet>> | null = null;
  try {
    tweet = await getTweet(id);
  } catch {
    tweet = null;
  }
  if (!tweet) return <IdropTweetEmpty id={id} />;

  const components: TweetProps["components"] = {};

  return (
    <div className="v2-tweet-shell">
      <EmbeddedTweet tweet={tweet} components={components} />
    </div>
  );
}

function IdropTweetSkeleton() {
  return (
    <div className="v2-tweet-shell" data-theme="dark">
      <TweetSkeleton />
    </div>
  );
}

function IdropTweetEmpty({ id }: { id: string }) {
  return (
    <div className="v2-tweet-shell" data-theme="dark">
      <TweetNotFound />
      <a
        href={`https://x.com/i/web/status/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="v2-mono v2-mc"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 8,
          color: "var(--color-bnb)",
          padding: "0 12px 12px",
          fontSize: 10,
        }}
      >
        Open on X <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
