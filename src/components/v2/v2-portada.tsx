import { getTranslations } from "next-intl/server";
import { getNews } from "@/lib/news";
import { timeAgo } from "@/lib/news-types";
import { V2HandleTweets } from "./v2-handle-tweets";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";

interface V2PortadaProps {
  locale: Locale;
}

export async function V2Portada({ locale }: V2PortadaProps) {
  const t = await getTranslations({ locale, namespace: "v2.portada" });
  const items = await getNews(14);

  const [feature, ...rest] = items;
  const threeUp = rest.slice(0, 3);
  const sixUp = rest.slice(3, 9); // second row: 6 more cards (2 rows of 3)
  const moreCount = Math.max(0, items.length - (1 + 3 + sixUp.length));

  return (
    <section
      id="portada"
      style={{
        maxWidth: 1600,
        margin: "0 auto",
        padding: "32px 56px 96px",
      }}
    >
      <div className="v2-hairline" style={{ height: 1 }} />

      {/* Section labels — side-by-side over their respective columns */}
      <div
        className="v2-portada-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 640px",
          gap: 48,
          marginTop: 18,
        }}
      >
        <div data-rise>
          <V2SectionLabel
            num="01"
            label={t("titlePortada")}
            hint={t("hintPortada")}
          />
        </div>
        <div id="envivo" data-rise data-rise-delay="80">
          <V2SectionLabel
            num="02"
            label={t("titleEnVivo")}
            hint={t("hintEnVivo")}
            live
          />
        </div>
      </div>

      <div
        className="v2-portada-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 640px",
          gap: 48,
          marginTop: 28,
        }}
      >
        {/* LEFT — Titulares */}
        <div>
          {feature && (
            <article
              data-rise
              data-rise-delay="0"
              style={{
                display: "grid",
                gridTemplateColumns: "1.05fr 1fr",
                gap: 28,
              }}
              className="v2-feature-row"
            >
              <a
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                className="v2-img-zoom"
                style={{ display: "block", overflow: "hidden" }}
              >
                {feature.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={feature.imageUrl}
                    alt=""
                    width={720}
                    height={450}
                    loading="eager"
                    decoding="async"
                    className="v2-feature-img"
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 10",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    className="v2-placeholder"
                    data-label="feature · 16:10"
                    style={{ width: "100%", aspectRatio: "16 / 10" }}
                  />
                )}
              </a>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    className="v2-mono v2-mc"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "var(--color-t-3)",
                    }}
                  >
                    <span>
                      <span style={{ color: feature.sourceColor }}>●</span>
                      &nbsp; {feature.source} · {t("featureTag")}
                    </span>
                    <span>{timeAgo(feature.publishedAt, locale)}</span>
                  </div>
                  <h3
                    className="v2-serif"
                    style={{
                      fontSize: 32,
                      lineHeight: 1.08,
                      fontWeight: 500,
                      margin: "14px 0 12px",
                      letterSpacing: "-0.015em",
                      color: "var(--color-t-0)",
                      textWrap: "balance",
                    }}
                  >
                    <a
                      href={feature.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit" }}
                    >
                      {feature.title}
                    </a>
                  </h3>
                  <p
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.55,
                      margin: 0,
                      color: "var(--color-t-1)",
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
                <a
                  href={feature.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v2-mono v2-mc v2-arrow-shift"
                  style={{
                    marginTop: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--color-bnb)",
                  }}
                >
                  {t("readArticle")} <span className="v2-arrow">→</span>
                </a>
              </div>
            </article>
          )}

          <div
            className="v2-hairline-1"
            style={{ height: 1, marginTop: 36, marginBottom: 28 }}
          />

          {/* Secondary 3-up */}
          <div
            className="v2-three-up"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 28,
            }}
          >
            {threeUp.map((item, i) => (
              <V2NewsCard
                key={item.id}
                item={item}
                locale={locale}
                delay={60 + i * 80}
              />
            ))}
          </div>

          {sixUp.length > 0 && (
            <>
              <div
                className="v2-hairline-1"
                style={{ height: 1, marginTop: 28, marginBottom: 24 }}
              />
              {/* Compact list — 6 more headlines, dense rows */}
              <div
                className="v2-six-up"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0 28px",
                }}
              >
                {sixUp.map((item, i) => (
                  <V2NewsRow
                    key={item.id}
                    item={item}
                    locale={locale}
                    delay={40 + i * 50}
                    isLastTwo={i >= sixUp.length - 2}
                  />
                ))}
              </div>
            </>
          )}

          <div
            className="v2-hairline-1"
            style={{ height: 1, marginTop: 28, marginBottom: 16 }}
          />
          <div
            className="v2-mono v2-mc"
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--color-t-3)",
            }}
          >
            <span>{t("moreHeadlines", { count: moreCount })}</span>
            <a
              href={`/${locale}/news`}
              style={{ color: "var(--color-bnb)", cursor: "pointer" }}
            >
              {t("seeAll")} →
            </a>
          </div>
        </div>

        {/* RIGHT — Twitter sidebar (2-col grid, capped heights) */}
        <aside
          data-rise
          data-rise-delay="120"
          style={{
            borderLeft: "1px solid var(--color-line-1)",
            paddingLeft: 28,
          }}
          className="v2-portada-aside"
        >
          <V2HandleTweets perHandle={1} />
          <div
            className="v2-hairline-1"
            style={{ height: 1, marginTop: 24, marginBottom: 16 }}
          />
          <Link
            href="/news"
            className="v2-mono v2-mc v2-arrow-shift"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--color-bnb)",
              cursor: "pointer",
            }}
          >
            {t("seeFeed")} <span className="v2-arrow">→</span>
          </Link>
        </aside>
      </div>

      <style>
        {`
          /* Tweets in 2-column grid inside the sidebar */
          .v2-tweet-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          @media (max-width: 1280px) {
            .v2-portada-row {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
            .v2-portada-aside {
              border-left: none !important;
              padding-left: 0 !important;
              border-top: 1px solid var(--color-line-1);
              padding-top: 28px;
            }
            .v2-feature-row {
              grid-template-columns: 1fr !important;
            }
            .v2-three-up {
              grid-template-columns: 1fr 1fr !important;
              gap: 20px !important;
            }
            /* When sidebar collapses to full width, fan tweets across */
            .v2-tweet-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 760px) {
            .v2-three-up {
              grid-template-columns: 1fr !important;
            }
            .v2-tweet-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 480px) {
            .v2-tweet-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </section>
  );
}

function V2SectionLabel({
  num,
  label,
  hint,
  live,
}: {
  num: string;
  label: string;
  hint: string;
  live?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
      <div
        className="v2-mono"
        style={{ fontSize: 12, color: "var(--color-bnb)", letterSpacing: "0.14em" }}
      >
        § {num}
      </div>
      <div>
        <div
          className="v2-serif"
          style={{
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            lineHeight: 1.05,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "var(--color-t-0)",
          }}
        >
          {label}
          {live && (
            <span
              className="v2-mono v2-mc"
              style={{
                color: "var(--color-bnb)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--color-bnb)",
                  boxShadow: "0 0 0 4px rgba(240,185,11,0.18)",
                }}
              />
              en vivo
            </span>
          )}
        </div>
        <div
          className="v2-mono v2-mc"
          style={{ marginTop: 6, color: "var(--color-t-3)" }}
        >
          {hint}
        </div>
      </div>
    </div>
  );
}

function V2NewsCard({
  item,
  locale,
  delay,
}: {
  item: Awaited<ReturnType<typeof getNews>>[number];
  locale: Locale;
  delay: number;
}) {
  return (
    <a
      data-rise
      data-rise-delay={delay}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="v2-img-zoom v2-card-hover"
      style={{
        display: "block",
        padding: 0,
        border: "1px solid var(--color-line-1)",
        overflow: "hidden",
      }}
    >
      {item.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={item.imageUrl}
          alt=""
          width={400}
          height={250}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            aspectRatio: "16 / 10",
            objectFit: "cover",
            marginBottom: 12,
            display: "block",
          }}
        />
      ) : (
        <div
          className="v2-placeholder"
          data-label={item.source.toLowerCase()}
          style={{
            width: "100%",
            aspectRatio: "16 / 10",
            marginBottom: 12,
          }}
        />
      )}
      <div style={{ padding: "0 12px 12px" }}>
        <div
          className="v2-mono v2-mc"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            color: "var(--color-t-3)",
          }}
        >
          <span style={{ color: item.sourceColor }}>{item.source}</span>
          <span>{timeAgo(item.publishedAt, locale)}</span>
        </div>
        <div
          className="v2-serif"
          style={{
            fontSize: 17,
            lineHeight: 1.2,
            letterSpacing: "-0.005em",
            fontWeight: 500,
            color: "var(--color-t-0)",
          }}
        >
          {item.title}
        </div>
      </div>
    </a>
  );
}

function V2NewsRow({
  item,
  locale,
  delay,
  isLastTwo,
}: {
  item: Awaited<ReturnType<typeof getNews>>[number];
  locale: Locale;
  delay: number;
  isLastTwo: boolean;
}) {
  return (
    <a
      data-rise
      data-rise-delay={delay}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="v2-card-hover"
      style={{
        display: "grid",
        gridTemplateColumns: "84px 1fr",
        gap: 14,
        padding: "16px 0",
        borderBottom: isLastTwo
          ? "none"
          : "1px solid var(--color-line-1)",
        alignItems: "start",
      }}
    >
      {item.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={item.imageUrl}
          alt=""
          width={84}
          height={56}
          loading="lazy"
          decoding="async"
          style={{
            width: 84,
            height: 56,
            objectFit: "cover",
            display: "block",
            border: "1px solid var(--color-line-1)",
          }}
        />
      ) : (
        <div
          className="v2-placeholder"
          data-label={item.source.slice(0, 4).toLowerCase()}
          style={{ width: 84, height: 56 }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <div
          className="v2-mono v2-mc"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
            color: "var(--color-t-3)",
            fontSize: 9.5,
          }}
        >
          <span style={{ color: item.sourceColor }}>{item.source}</span>
          <span>{timeAgo(item.publishedAt, locale)}</span>
        </div>
        <div
          className="v2-serif"
          style={{
            fontSize: 14.5,
            lineHeight: 1.25,
            letterSpacing: "-0.003em",
            fontWeight: 500,
            color: "var(--color-t-0)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </div>
      </div>
    </a>
  );
}
