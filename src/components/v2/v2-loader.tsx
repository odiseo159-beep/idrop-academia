/**
 * V2Loader — falling-cubes 3D loader, adapted from Uiverse.io/Admin12121.
 *
 * Palette: BNB yellow (#F0B90B → #FFD341) on the ink-0 page background.
 * The mask rectangles match `--color-ink-0` so the cubes appear to fall
 * into the page surface rather than into a light bar.
 *
 * Styling lives in `globals.css` under the `.v2-loader` namespace — keyframes
 * are prefixed `v2-loader-*` to avoid collisions with existing animations.
 *
 * Markup is the canonical 8-box + ground structure the CSS expects. Pure JSX,
 * no client state, safe to render from a Server Component (e.g. loading.tsx).
 */
export function V2Loader({
  ariaLabel = "Cargando…",
}: {
  /** Accessible label announced by screen readers while the loader is on-screen. */
  ariaLabel?: string;
}) {
  return (
    <div
      className="v2-loader"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {/* 8 falling cubes — each `.v2-loader-box-N` has its own arc keyframe */}
      <div className="v2-loader-box v2-loader-box-0"><div /></div>
      <div className="v2-loader-box v2-loader-box-1"><div /></div>
      <div className="v2-loader-box v2-loader-box-2"><div /></div>
      <div className="v2-loader-box v2-loader-box-3"><div /></div>
      <div className="v2-loader-box v2-loader-box-4"><div /></div>
      <div className="v2-loader-box v2-loader-box-5"><div /></div>
      <div className="v2-loader-box v2-loader-box-6"><div /></div>
      <div className="v2-loader-box v2-loader-box-7"><div /></div>

      {/* The ground plane that flashes in at ~75% of the cycle */}
      <div className="v2-loader-ground"><div /></div>

      {/* Screen-reader-only fallback text */}
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {ariaLabel}
      </span>
    </div>
  );
}
