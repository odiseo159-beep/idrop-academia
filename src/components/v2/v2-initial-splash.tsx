"use client";

import { useEffect, useRef, useState } from "react";
import { V2Loader } from "@/components/v2/v2-loader";

/** One full cycle of the loader's box-drop animation. Matches `--v2-loader-duration`. */
const MIN_DURATION_MS = 3000;
/** Fade-out transition length — keep in sync with `.v2-splash-fade`. */
const FADE_MS = 450;
/** Hard ceiling so we never trap the user behind a stalled font/asset fetch. */
const HARD_CEILING_MS = 8000;
/**
 * localStorage key. Persists across tabs + sessions + browser restarts, so
 * each user sees the splash exactly once per device. Reset by clearing site
 * data or running `localStorage.removeItem("idrop-splash-seen")`.
 *
 * The same key is read by an inline `<script>` in `[locale]/layout.tsx` that
 * adds `html.idrop-splash-seen` BEFORE hydration, so returning users never
 * see the splash flash at all (the css rule sets `display: none`).
 */
const STORAGE_KEY = "idrop-splash-seen";

interface InitialSplashProps {
  /** Accessible label for the loader region. Default: Spanish. */
  ariaLabel?: string;
}

/**
 * InitialSplash — first-visit-ever splash overlay (one-shot per device).
 *
 * Mounts visible by default (SSR-safe). On the client effect:
 *   1. Bails immediately if `localStorage["idrop-splash-seen"]` is set.
 *      Returning users normally never hit this branch because the inline
 *      script in the layout hides the splash with css before hydration,
 *      but this keeps the state machine consistent.
 *   2. Otherwise waits for `MAX(3000ms, document.fonts.ready + window.load)`
 *      so the loader gets a full animation cycle AND the page behind is
 *      fully painted (no FOUC when we fade out).
 *   3. Hard ceiling of 8s — never trap users behind a stalled asset.
 *   4. Fades to opacity:0 over 450ms, then unmounts and persists the flag.
 *
 * Sits at the layout level with `z-index: 9999` so it overlays everything,
 * including the Radix Dialog Portals from A3/A4 modals.
 */
export function InitialSplash({ ariaLabel = "Cargando IDROP…" }: InitialSplashProps) {
  const [mounted, setMounted] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    // If they've ever seen the splash, never show it again. The inline
    // pre-hydration script already hid it via css; this is a belt-and-
    // braces unmount so React's tree matches what's painted.
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        setMounted(false);
        return;
      }
    } catch {
      // localStorage can throw in private-mode Safari etc. — fall through
      // and show the splash. Better to occasionally re-show than to crash.
    }

    const mountedAt = Date.now();

    function dismiss() {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      setFadingOut(true);
      window.setTimeout(() => {
        setMounted(false);
        try {
          localStorage.setItem(STORAGE_KEY, "1");
        } catch {
          // ignore
        }
      }, FADE_MS);
    }

    // The condition for dismissal: the page is loaded AND minimum duration elapsed.
    let loadFired = document.readyState === "complete";
    let fontsReady = false;

    function attemptDismiss() {
      if (!loadFired || !fontsReady) return;
      const elapsed = Date.now() - mountedAt;
      const remaining = Math.max(0, MIN_DURATION_MS - elapsed);
      window.setTimeout(dismiss, remaining);
    }

    // window.load — all subresources fetched (images, stylesheets, etc.)
    if (loadFired) {
      // already complete at mount
    } else {
      window.addEventListener(
        "load",
        () => {
          loadFired = true;
          attemptDismiss();
        },
        { once: true }
      );
    }

    // document.fonts.ready — Newsreader / Plex Sans / JetBrains Mono swapped in
    if (typeof document.fonts?.ready?.then === "function") {
      document.fonts.ready
        .then(() => {
          fontsReady = true;
          attemptDismiss();
        })
        .catch(() => {
          fontsReady = true;
          attemptDismiss();
        });
    } else {
      fontsReady = true;
    }

    attemptDismiss();

    // Safety net: even if load/fonts never fire (offline asset, blocked CDN),
    // tear the splash down after a hard ceiling so the user isn't stuck.
    const ceilingId = window.setTimeout(dismiss, HARD_CEILING_MS);

    return () => {
      window.clearTimeout(ceilingId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`v2-loader-screen v2-splash-fade${fadingOut ? " v2-splash-fade--out" : ""}`}
      style={{ zIndex: 9999 }}
      aria-hidden={fadingOut ? "true" : undefined}
    >
      <V2Loader ariaLabel={ariaLabel} />
    </div>
  );
}
