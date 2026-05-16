"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GradientBlob } from "@/components/fx/gradient-blob";
import { GridFloor } from "@/components/fx/grid-floor";
import { WireframeSphere } from "@/components/fx/wireframe-sphere";
import { PlasmaShape } from "@/components/fx/plasma-shape";

export function HeroSection() {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden">
      <GridFloor />

      <GradientBlob
        variant="purple-orange"
        size="xl"
        className="-top-20 -right-40 opacity-50"
      />
      <GradientBlob
        variant="cyan-purple"
        size="lg"
        className="top-40 -left-32 opacity-40"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center px-4 pt-12 pb-32 md:px-6 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass mb-8 flex items-center gap-2 rounded-full border-grad px-4 py-1.5 text-xs font-medium">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-foreground/90">{t("heroBadge")}</span>
          </div>
        </motion.div>

        <div className="relative w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <WireframeSphere
              size={580}
              meridians={16}
              parallels={11}
              color="rgba(255,255,255,0.28)"
            />
          </div>

          <div className="relative text-center">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-[3.25rem] font-bold leading-[0.95] tracking-tight md:text-[5.5rem] lg:text-[6.5rem]"
            >
              {t("heroTitleLine1")}
              <br />
              <span className="text-gradient">{t("heroTitleLine2")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mx-auto mt-8 max-w-xl text-base text-muted-foreground md:text-lg"
            >
              {t("heroDescription")}
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" variant="primary">
            <Link href="/learn">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/discover">
              <Compass className="h-4 w-4" />
              {t("ctaSecondary")}
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span>{t("chainBnbLive")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            <span>{t("chainOpBnbSoon")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            <span>{t("chainEthQ3")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            <span>{t("chainSolQ4")}</span>
          </div>
        </motion.div>
      </div>

      <PlasmaShape
        variant="torus"
        size={220}
        className="absolute -bottom-10 -right-16 hidden lg:block"
      />
      <PlasmaShape
        variant="ring"
        size={160}
        className="absolute top-32 -left-8 hidden xl:block"
      />
    </section>
  );
}
