"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { cn } from "@/lib/utils";

interface SiteChromeProps {
  children: React.ReactNode;
}

/**
 * Wraps the page tree and decides whether to render the global SiteHeader
 * and SiteFooter. The landing route (`/[locale]`) renders its own immersive
 * masthead/footer (v2 design), so we skip them there.
 */
export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  // Landing root looks like "/es" or "/en" — exactly the locale segment.
  const isLanding = /^\/[a-z]{2}\/?$/.test(pathname);
  // Every /learn/* route (module overview + lesson interior) renders its own
  // V2 masthead/footer. /learn (index) is a redirect, so it never reaches here.
  const isLearn = /^\/[a-z]{2}\/learn\//.test(pathname);
  // Profile renders its own V2 chrome too.
  const isProfile = /^\/[a-z]{2}\/profile\/?$/.test(pathname);
  const immersive = isLanding || isLearn || isProfile;

  // Always render the fixed background so all routes share the same vibe.
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 stars-bg opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(139,92,246,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_80%_30%,rgba(255,61,240,0.08),transparent)]" />
      </div>

      {!immersive && <SiteHeader />}
      <main className={cn("flex-1", !immersive && "pt-16")}>{children}</main>
      {!immersive && <SiteFooter />}
    </>
  );
}
