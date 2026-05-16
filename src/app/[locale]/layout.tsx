import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Script from "next/script";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Fraunces,
  Newsreader,
  IBM_Plex_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { SiteChrome } from "@/components/layout/site-chrome";
import { ProgressHydrator } from "@/components/providers/progress-hydrator";
import { Web3Providers } from "@/components/providers/web3-providers";
import { InitialSplash } from "@/components/v2/v2-initial-splash";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});

// v2 design fonts (Claude Design handoff)
const newsreader = Newsreader({
  variable: "--font-news-serif",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: ["BNB", "BSC", "Web3", "blockchain learning", "DeFi", "BEP-20", "education"],
    authors: [{ name: "IDROP" }],
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${fraunces.variable} ${newsreader.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      // The pre-hydration FOUC-kill script in <head> below mutates this
      // element's className (adds `idrop-splash-seen` for returning users)
      // BEFORE React hydrates. Without this flag React would log a hydration
      // mismatch error because server-rendered className doesn't include the
      // class that the script just added. This is the canonical pattern used
      // by next-themes, theme-ui, etc.
      suppressHydrationWarning
    >
      <head>
        {/*
          Pre-hydration script (FOUC prevention pattern used by theme toggles).
          Runs synchronously BEFORE the body paints, reads the
          "idrop-splash-seen" localStorage flag, and adds a class on <html>
          when set. Paired with a css rule (`.idrop-splash-seen .v2-splash-fade
          { display: none }`) the splash never renders for returning users —
          no SSR-visible flash before React unmounts it.

          Uses `next/script` with `beforeInteractive` because React 19 warns
          on raw `<script>` JSX even with dangerouslySetInnerHTML, and Next's
          wrapper is the supported way to inject pre-hydration code. The
          `id` is required for inline strategy="beforeInteractive" scripts.
        */}
        <Script
          id="idrop-splash-fouc-guard"
          strategy="beforeInteractive"
        >
          {`try{if(localStorage.getItem("idrop-splash-seen")==="1"){document.documentElement.classList.add("idrop-splash-seen")}}catch(e){}`}
        </Script>
      </head>
      <body className="relative min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <Web3Providers>
            <ProgressHydrator />
            <SiteChrome>{children}</SiteChrome>
            {/*
              First-visit splash: SSR-rendered visible, then client dismisses
              after MAX(3s, window.load + fonts.ready). Sits at the end of
              the tree so its z-index:9999 overlays everything (including
              Radix Portals from A3/A4 modals). One-shot per device —
              localStorage flag skips it on every subsequent visit. The
              pre-hydration script above (in <head>) hides it via css before
              React even owns the DOM, so returning users see zero flash.
            */}
            <InitialSplash />
          </Web3Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
