"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";

interface LessonShareModalProps {
  open: boolean;
  onClose: () => void;
  /** Module + lesson labels for the card and composer copy. */
  moduleCode: string;
  lessonCode: string;
  moduleName: string;
  lessonTitle: string;
  lessonTitleAccent?: string;
  /** XP earned for this lesson (drives the big "+100"). */
  lessonXp: number;
  streakDays: number;
  modulePct: number;
  /** Where the prefilled tweet sends users. */
  lessonUrl: string;
  /** Default account handle for visibility radio. */
  userHandle?: string;
}

const HASHTAG_OPTIONS = ["#BNBChain", "#OnchainEd", "#PoSA", "#IDROP", "#cryptoES"];

/**
 * LessonShareModal — A4. Editorial share dialog with two columns:
 *
 *   LEFT  · 460×240 PNG preview (XP + title + streak + module % strip)
 *   RIGHT · prefilled textarea composer + hashtag chips + visibility radio
 *
 * Bottom row: Copy link / Download PNG (placeholder) / Publish in X (opens
 * twitter.com/intent/tweet with the composed text).
 */
export function LessonShareModal({
  open,
  onClose,
  moduleCode,
  lessonCode,
  moduleName,
  lessonTitle,
  lessonTitleAccent,
  lessonXp,
  streakDays,
  modulePct,
  lessonUrl,
  userHandle = "tu_handle",
}: LessonShareModalProps) {
  const t = useTranslations("v2.lesson.share");
  const [text, setText] = useState(() =>
    t("defaultPost", {
      title: lessonTitleAccent
        ? `${lessonTitle}, ${lessonTitleAccent}?`
        : lessonTitle,
      xp: lessonXp,
      streak: String(streakDays).padStart(2, "0"),
      pct: modulePct,
      moduleCode,
      url: lessonUrl,
    })
  );
  const [visibility, setVisibility] = useState<"public" | "followers">(
    "public"
  );
  const [copied, setCopied] = useState(false);

  const charCount = text.length;

  const tweetIntentUrl = useMemo(() => {
    const u = new URL("https://twitter.com/intent/tweet");
    u.searchParams.set("text", text);
    return u.toString();
  }, [text]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(lessonUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  function publish() {
    window.open(tweetIntentUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7,8,13,0.84)",
            backdropFilter: "blur(2px)",
            zIndex: 70,
          }}
        />
        <Dialog.Content
          aria-describedby={undefined}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 71,
            width: 880,
            maxWidth: "calc(100vw - 48px)",
            padding: "28px 32px 28px",
            background: "var(--color-ink-1)",
            border: "1px solid var(--color-line-2)",
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)",
            outline: "none",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingBottom: 18,
              borderBottom: "1px solid var(--color-line-1)",
            }}
          >
            <div
              className="v2-mono v2-mc"
              style={{ color: "var(--color-bnb)" }}
            >
              ↗ {t("title")}
            </div>
            <span
              style={{ width: 1, height: 14, background: "var(--color-line-2)" }}
            />
            <div style={{ flex: 1 }}>
              <Dialog.Title asChild>
                <div
                  className="v2-serif"
                  style={{
                    fontSize: 22,
                    letterSpacing: "-0.012em",
                    fontWeight: 500,
                    color: "var(--color-t-0)",
                  }}
                >
                  {t.rich("subtitle", {
                    italic: (chunks) => (
                      <span style={{ fontStyle: "italic" }}>{chunks}</span>
                    ),
                    module: () => moduleName,
                  })}
                </div>
              </Dialog.Title>
              <div
                className="v2-mono v2-mc"
                style={{ marginTop: 4, color: "var(--color-t-3)" }}
              >
                {t("subtitleNote")}
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t("close")}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: "transparent",
                  border: "1px solid var(--color-line-2)",
                  color: "var(--color-t-2)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "460px 1fr",
              columnGap: 24,
              marginTop: 22,
            }}
          >
            {/* LEFT — share card preview */}
            <div>
              <div
                className="v2-mono v2-mc"
                style={{
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--color-t-3)",
                }}
              >
                <span>{t("previewLabel")}</span>
                <span>{t("previewVariant")}</span>
              </div>
              <ShareCard
                moduleCode={moduleCode}
                lessonCode={lessonCode}
                lessonTitle={lessonTitle}
                lessonTitleAccent={lessonTitleAccent}
                xp={lessonXp}
                streakDays={streakDays}
                modulePct={modulePct}
                moduleName={moduleName}
              />
              <div
                className="v2-mono v2-mc"
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--color-t-3)",
                }}
              >
                <span>PNG · 84 KB</span>
                <span style={{ color: "var(--color-bnb)" }}>{t("downloadImage")}</span>
              </div>
            </div>

            {/* RIGHT — composer */}
            <div>
              <div
                className="v2-mono v2-mc"
                style={{ marginBottom: 8, color: "var(--color-t-3)" }}
              >
                {t("postLabel")}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={280}
                rows={6}
                aria-label={t("postLabel")}
                style={{
                  width: "100%",
                  border: "1px solid var(--color-line-2)",
                  background: "var(--color-ink-0)",
                  padding: "14px 16px",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "var(--color-t-0)",
                  minHeight: 140,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <div
                className="v2-mono v2-mc"
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--color-t-3)",
                }}
              >
                <span className="v2-tnum">
                  {charCount} / 280 · {t("readyForX")}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setText(
                      t("defaultPost", {
                        title: lessonTitleAccent
                          ? `${lessonTitle}, ${lessonTitleAccent}?`
                          : lessonTitle,
                        xp: lessonXp,
                        streak: String(streakDays).padStart(2, "0"),
                        pct: modulePct,
                        moduleCode,
                        url: lessonUrl,
                      })
                    )
                  }
                  className="v2-mono v2-mc"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-bnb)",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  {t("reset")} ↻
                </button>
              </div>

              <div
                className="v2-mono v2-mc"
                style={{
                  marginTop: 18,
                  marginBottom: 8,
                  color: "var(--color-t-3)",
                }}
              >
                {t("hashtags")}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {HASHTAG_OPTIONS.map((h) => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => {
                      if (text.includes(h)) return;
                      setText((t) => `${t.trimEnd()} ${h}`);
                    }}
                    className="v2-mono"
                    style={{
                      fontSize: 10.5,
                      padding: "5px 9px",
                      border: "1px solid var(--color-line-2)",
                      background: text.includes(h)
                        ? "rgba(240,185,11,0.06)"
                        : "transparent",
                      color: text.includes(h)
                        ? "var(--color-bnb)"
                        : "var(--color-t-1)",
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>

              <div
                className="v2-mono v2-mc"
                style={{
                  marginTop: 22,
                  marginBottom: 8,
                  color: "var(--color-t-3)",
                }}
              >
                {t("visibility")}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <RadioChip
                  active={visibility === "public"}
                  onClick={() => setVisibility("public")}
                  label={t("visibilityPublic")}
                  sub={t("visibilityPublicSub")}
                />
                <RadioChip
                  active={visibility === "followers"}
                  onClick={() => setVisibility("followers")}
                  label={t("visibilityFollowers")}
                  sub={t("visibilityFollowersSub", { handle: userHandle })}
                />
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid var(--color-line-1)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              className="v2-mono v2-mc"
              style={{ color: "var(--color-t-3)" }}
            >
              {t.rich("shareAs", {
                handle: () => (
                  <span style={{ color: "var(--color-bnb)" }}>@{userHandle}</span>
                ),
              })}
            </span>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              onClick={copyLink}
              className="v2-mono v2-mc"
              style={{
                padding: "11px 16px",
                background: "transparent",
                color: "var(--color-t-1)",
                border: "1px solid var(--color-line-3)",
                cursor: "pointer",
                letterSpacing: "0.14em",
                fontFamily: "inherit",
              }}
            >
              ⎘ {copied ? t("copied") : t("copyLink")}
            </button>
            <button
              type="button"
              onClick={publish}
              className="v2-mono v2-mc"
              style={{
                padding: "11px 20px",
                background: "var(--color-bnb)",
                color: "#15110a",
                border: "none",
                fontWeight: 600,
                letterSpacing: "0.14em",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t("publish")} ↗
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─── ShareCard (the editorial 460×240 preview) ─── */
function ShareCard({
  moduleCode,
  lessonCode,
  lessonTitle,
  lessonTitleAccent,
  xp,
  streakDays,
  modulePct,
  moduleName,
}: {
  moduleCode: string;
  lessonCode: string;
  lessonTitle: string;
  lessonTitleAccent?: string;
  xp: number;
  streakDays: number;
  modulePct: number;
  moduleName: string;
}) {
  return (
    <div
      style={{
        width: 460,
        height: 240,
        position: "relative",
        overflow: "hidden",
        background: "var(--color-ink-0)",
        border: "1px solid var(--color-line-2)",
      }}
    >
      {/* glow blob */}
      <div
        className="v2-glow-edge"
        style={{
          width: 280,
          height: 280,
          right: -60,
          top: -100,
          background:
            "radial-gradient(circle, rgba(240,185,11,0.22), transparent 60%)",
        }}
      />
      {/* dotted grid */}
      <div
        className="v2-dotted-grid"
        style={{ position: "absolute", inset: 0, opacity: 0.4 }}
      />
      {/* wire sphere watermark */}
      <svg
        viewBox="0 0 120 120"
        width="120"
        height="120"
        style={{ position: "absolute", top: 12, right: 12, opacity: 0.35 }}
      >
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="rgba(241,242,246,0.5)"
        />
        <ellipse
          cx="60"
          cy="60"
          rx="50"
          ry="18"
          fill="none"
          stroke="rgba(241,242,246,0.4)"
        />
        <ellipse
          cx="60"
          cy="60"
          rx="50"
          ry="34"
          fill="none"
          stroke="rgba(241,242,246,0.3)"
        />
        <line x1="10" y1="60" x2="110" y2="60" stroke="rgba(241,242,246,0.3)" />
        <line x1="60" y1="10" x2="60" y2="110" stroke="rgba(241,242,246,0.3)" />
      </svg>

      {/* TL — brand mark */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 18,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            background: "var(--color-bnb)",
            transform: "rotate(45deg)",
            borderRadius: 1,
          }}
        />
        <span
          className="v2-mono"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          IDROP
        </span>
        <span
          className="v2-mono v2-mc"
          style={{ marginLeft: 2, color: "var(--color-t-3)" }}
        >
          · Academia
        </span>
      </div>

      {/* TR — lesson code */}
      <div
        className="v2-mono v2-mc"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          color: "var(--color-t-3)",
          textAlign: "right",
        }}
      >
        {moduleCode} · {lessonCode}
      </div>

      {/* center — XP + title */}
      <div style={{ position: "absolute", left: 18, top: 56, right: 18 }}>
        <div
          className="v2-serif v2-tnum"
          style={{
            fontSize: 64,
            lineHeight: 0.86,
            fontStyle: "italic",
            fontWeight: 300,
            letterSpacing: "-0.035em",
            color: "var(--color-bnb)",
          }}
        >
          +{xp}{" "}
          <span
            className="v2-mono"
            style={{
              fontSize: 16,
              color: "var(--color-bnb)",
              letterSpacing: "0.14em",
              fontStyle: "normal",
              verticalAlign: "top",
            }}
          >
            XP
          </span>
        </div>
        <div
          className="v2-serif"
          style={{
            fontSize: 22,
            lineHeight: 1.08,
            letterSpacing: "-0.014em",
            color: "var(--color-t-0)",
            marginTop: 10,
            fontWeight: 500,
            maxWidth: 320,
          }}
        >
          {lessonTitle}
          {lessonTitleAccent && (
            <>
              ,{" "}
              <span style={{ fontStyle: "italic" }}>{lessonTitleAccent}?</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 14,
        }}
      >
        <div
          style={{
            height: 1,
            background: "var(--color-line-2)",
            marginBottom: 9,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
            RACHA
          </span>
          <span
            className="v2-serif v2-tnum"
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--color-bnb)",
            }}
          >
            {String(streakDays).padStart(2, "0")}
          </span>
          <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
            DÍAS
          </span>
          <span
            style={{ width: 1, height: 12, background: "var(--color-line-2)" }}
          />
          <span className="v2-mono v2-mc" style={{ color: "var(--color-t-3)" }}>
            {moduleName.toUpperCase()}
          </span>
          <span
            className="v2-serif v2-tnum"
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: "var(--color-bnb)",
            }}
          >
            {modulePct}%
          </span>
          <span style={{ flex: 1 }} />
          <span
            className="v2-mono v2-mc"
            style={{ color: "var(--color-t-2)" }}
          >
            academia.idrop.so
          </span>
        </div>
      </div>
    </div>
  );
}

function RadioChip({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        border: `1px solid ${active ? "var(--color-bnb)" : "var(--color-line-2)"}`,
        background: active ? "rgba(240,185,11,0.06)" : "transparent",
        padding: "10px 12px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            border: `1px solid ${active ? "var(--color-bnb)" : "var(--color-t-3)"}`,
            background: active
              ? "radial-gradient(circle, var(--color-bnb) 0 40%, transparent 50%)"
              : "transparent",
          }}
        />
        <span
          className="v2-mono v2-mc"
          style={{ color: active ? "var(--color-bnb)" : "var(--color-t-1)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="v2-mono v2-mc"
        style={{
          marginTop: 4,
          fontSize: 9.5,
          color: "var(--color-t-3)",
        }}
      >
        {sub}
      </div>
    </button>
  );
}
