/**
 * SiteChrome — renders the fixed background gradients shared across every
 * route, then drops the page tree on top. Every real page (landing, /profile,
 * /learn/[module], /learn/[module]/[lesson]) now renders its own V2Masthead +
 * V2Ticker, and the redirect routes (/learn, /discover, /news) do meta-refresh
 * without needing chrome, so we no longer need the old SiteHeader/SiteFooter
 * conditional logic that lived here.
 *
 * Kept as a tiny server component (no `"use client"`) so it doesn't add to
 * the client bundle — the background is just styled divs.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 stars-bg opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(139,92,246,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_80%_30%,rgba(255,61,240,0.08),transparent)]" />
      </div>
      <main className="flex-1">{children}</main>
    </>
  );
}
