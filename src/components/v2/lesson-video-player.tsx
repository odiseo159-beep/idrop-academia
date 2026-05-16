"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { VideoChapter } from "@/lib/types";
import {
  detectVideo,
  formatDuration,
  parseTimeToSec,
  type DetectedVideo,
} from "@/lib/video";

interface LessonVideoPlayerProps {
  /** Display width in px; height is computed 16:9. */
  width: number;
  /** Frontmatter `videoUrl` — may be undefined (placeholder shown). */
  videoUrl?: string;
  /** Duration in seconds — used for scrubber + chapter ticks. */
  videoDurationSec?: number;
  /** Chapter markers for the tick row beneath the scrubber. */
  videoChapters?: VideoChapter[];
  /** Lesson order code shown in TL corner ("L.01", "L.02"…). */
  lessonCode: string;
  /** Lesson title shown center when video is in placeholder/play state. */
  lessonTitle: string;
  /** Have they completed the lesson? Triggers the "Volver a ver" treatment. */
  completed: boolean;
  /** Notified whenever the user opens a chapter or hits play (analytics hook). */
  onChapterJump?: (timeSec: number) => void;
}

/**
 * LessonVideoPlayer — the cinema-style 16:9 frame that opens every lesson.
 *
 * Behaviour by `videoUrl` kind:
 *   - YouTube/Vimeo: iframe embed appears AFTER the user clicks Play (so the
 *     editorial overlay reads first, no autoplay surprises)
 *   - mp4/webm: native <video> element with same overlay
 *   - missing/unknown: pure editorial placeholder with "Video próximamente"
 *
 * The chapter ticks under the scrubber are positional only — chapters are
 * clickable in the strip below; for YouTube we use #t= to deep-link, for mp4
 * we set currentTime directly.
 */
export function LessonVideoPlayer({
  width,
  videoUrl,
  videoDurationSec,
  videoChapters,
  lessonCode,
  lessonTitle,
  completed,
  onChapterJump,
}: LessonVideoPlayerProps) {
  const detected = useMemo<DetectedVideo>(() => detectVideo(videoUrl), [videoUrl]);
  const height = Math.round(width * (9 / 16));

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [embedReady, setEmbedReady] = useState(false);

  const durationSec = useMemo(() => {
    if (videoDurationSec) return videoDurationSec;
    if (videoRef.current?.duration && isFinite(videoRef.current.duration)) {
      return videoRef.current.duration;
    }
    return 0;
  }, [videoDurationSec]);

  const durationLabel = formatDuration(durationSec);
  const currentLabel = formatDuration(playing ? currentSec : 0);
  const progressPct = completed
    ? 100
    : durationSec > 0
      ? Math.min(100, (currentSec / durationSec) * 100)
      : 0;

  // Compute chapter tick positions (as % of duration). Skip if no duration.
  const ticks = useMemo(() => {
    if (!videoChapters?.length || !durationSec) return [] as number[];
    return videoChapters
      .map((c) => (parseTimeToSec(c.time) / durationSec) * 100)
      .filter((p) => p > 0 && p < 100);
  }, [videoChapters, durationSec]);

  // mp4 only — wire time updates
  useEffect(() => {
    if (detected.kind !== "mp4") return;
    const el = videoRef.current;
    if (!el) return;
    const onTime = () => setCurrentSec(el.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [detected.kind]);

  function handlePlay() {
    if (detected.kind === "youtube" || detected.kind === "vimeo") {
      // Mount the iframe; its own play controls take over from there.
      setEmbedReady(true);
      setPlaying(true);
      onChapterJump?.(0);
      return;
    }
    if (detected.kind === "mp4") {
      videoRef.current?.play().catch(() => {});
      onChapterJump?.(0);
      return;
    }
    // Unknown / placeholder — no-op
  }

  // Shell wrapper used by every variant.
  const shell = (children: React.ReactNode) => (
    <div
      style={{
        width,
        height,
        border: "1px solid var(--color-line-2)",
        background: "var(--color-ink-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );

  // ── Variant 1: iframe mounted after Play ──
  if (embedReady && detected.src && (detected.kind === "youtube" || detected.kind === "vimeo")) {
    return shell(
      <iframe
        src={`${detected.src}${detected.src.includes("?") ? "&" : "?"}autoplay=1`}
        title={lessonTitle}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
      />
    );
  }

  // ── Variant 2: native <video> mounted from the start, controls overlaid ──
  if (detected.kind === "mp4" && detected.src) {
    return shell(
      <>
        <video
          ref={videoRef}
          src={detected.src}
          controls
          preload="metadata"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "var(--color-ink-0)",
          }}
        />
        {/* Editorial overlay only shown until first play */}
        {!playing && (
          <OverlayChrome
            width={width}
            lessonCode={lessonCode}
            lessonTitle={lessonTitle}
            currentLabel={currentLabel}
            durationLabel={durationLabel}
            completed={completed}
            onPlay={handlePlay}
            ticks={ticks}
            progressPct={progressPct}
            placeholder={false}
          />
        )}
      </>
    );
  }

  // ── Variant 3: editorial placeholder + future-video CTA ──
  return shell(
    <OverlayChrome
      width={width}
      lessonCode={lessonCode}
      lessonTitle={lessonTitle}
      currentLabel={currentLabel}
      durationLabel={durationLabel}
      completed={completed}
      onPlay={handlePlay}
      ticks={ticks}
      progressPct={progressPct}
      placeholder={detected.kind === "unknown"}
    />
  );
}

/* ─────────────────────────────────────────────────────────── */

interface OverlayChromeProps {
  width: number;
  lessonCode: string;
  lessonTitle: string;
  currentLabel: string;
  durationLabel: string;
  completed: boolean;
  onPlay: () => void;
  ticks: number[];
  progressPct: number;
  /** When true, the play button reads "Video próximamente" + disabled. */
  placeholder: boolean;
}

function OverlayChrome({
  width,
  lessonCode,
  lessonTitle,
  currentLabel,
  durationLabel,
  completed,
  onPlay,
  ticks,
  progressPct,
  placeholder,
}: OverlayChromeProps) {
  return (
    <>
      {/* Stripe placeholder bg — only when no real video sits behind */}
      {placeholder && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 6px, transparent 6px 14px)",
          }}
        />
      )}

      {/* Cinema radial scrim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 45%, rgba(0,0,0,0.0), rgba(0,0,0,0.55) 80%)",
          pointerEvents: "none",
        }}
      />

      {/* TL — lesson code */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: completed ? "var(--color-t-1)" : "var(--color-bnb)",
            boxShadow: completed ? "none" : "0 0 0 4px rgba(240,185,11,0.18)",
          }}
        />
        <span
          className="v2-mono v2-mc"
          style={{ color: completed ? "var(--color-t-1)" : "var(--color-bnb)" }}
        >
          {completed
            ? `COMPLETADO · ${durationLabel} / ${durationLabel}`
            : `${lessonCode} · ${currentLabel} / ${durationLabel}`}
        </span>
      </div>

      {/* TR — meta chips */}
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-2)" }}>
          CC · ES
        </span>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-2)" }}>
          1080p
        </span>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-2)" }}>
          ⤢
        </span>
      </div>

      {/* Center — play button + title */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          pointerEvents: "none",
        }}
      >
        {completed ? (
          <>
            <button
              type="button"
              onClick={onPlay}
              aria-label="Volver a ver"
              style={{
                pointerEvents: "auto",
                width: 84,
                height: 84,
                borderRadius: 999,
                background: "transparent",
                border: "2px solid var(--color-bnb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-bnb)",
                cursor: "pointer",
                boxShadow: "0 0 0 8px rgba(240,185,11,0.10)",
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 34 34"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 8 A 12 12 0 1 1 5 22" />
                <polyline points="5 4 5 8 9 8" />
              </svg>
            </button>
            <div style={{ textAlign: "center" }}>
              <div
                className="v2-mono v2-mc"
                style={{ color: "var(--color-bnb)", marginBottom: 6 }}
              >
                ● LECCIÓN COMPLETADA
              </div>
              <div
                className="v2-serif"
                style={{
                  fontSize: 22,
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "-0.012em",
                  color: "var(--color-t-0)",
                }}
              >
                Volver a ver
              </div>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onPlay}
              disabled={placeholder}
              aria-label={placeholder ? "Video próximamente" : "Reproducir lección"}
              style={{
                pointerEvents: "auto",
                width: 84,
                height: 84,
                borderRadius: 999,
                background: placeholder
                  ? "rgba(240,185,11,0.18)"
                  : "rgba(240,185,11,0.95)",
                border: placeholder ? "1px dashed var(--color-bnb)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: placeholder ? "var(--color-bnb)" : "#15110a",
                cursor: placeholder ? "not-allowed" : "pointer",
                boxShadow: placeholder
                  ? "none"
                  : "0 0 0 12px rgba(240,185,11,0.10)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
                <path d="M9 6.5L22 14L9 21.5V6.5Z" />
              </svg>
            </button>
            <div style={{ textAlign: "center", maxWidth: width - 80 }}>
              <div
                className="v2-mono v2-mc"
                style={{ color: "var(--color-t-2)", marginBottom: 6 }}
              >
                {placeholder
                  ? "VIDEO · PRÓXIMAMENTE"
                  : `VIDEO · ${durationLabel}`}
              </div>
              <div
                className="v2-serif"
                style={{
                  fontSize: 22,
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "-0.012em",
                  color: "var(--color-t-0)",
                }}
              >
                {lessonTitle}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom scrubber */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          display: "flex",
          alignItems: "center",
          gap: 14,
          pointerEvents: "none",
        }}
      >
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-1)" }}>
          {completed ? durationLabel : currentLabel}
        </span>
        <span
          style={{
            flex: 1,
            height: 2,
            background: "rgba(255,255,255,0.15)",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              width: `${progressPct}%`,
              background: "var(--color-bnb)",
            }}
          />
          {ticks.map((pct, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                top: -2,
                left: `${pct}%`,
                width: 1,
                height: 6,
                background: "var(--color-t-2)",
              }}
            />
          ))}
        </span>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-1)" }}>
          {durationLabel}
        </span>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-2)" }}>
          ⏵ 1x
        </span>
        <span className="v2-mono v2-mc" style={{ color: "var(--color-t-2)" }}>
          ⚙
        </span>
      </div>
    </>
  );
}
