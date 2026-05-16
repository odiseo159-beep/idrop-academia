"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GradientBlob } from "@/components/fx/gradient-blob";
import { WireframeSphere } from "@/components/fx/wireframe-sphere";

export function CtaSection() {
  const t = useTranslations("landing");

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface px-8 py-16 text-center md:px-16 md:py-24"
        >
          <GradientBlob
            variant="purple-orange"
            size="lg"
            className="-top-32 -left-20 opacity-40"
          />
          <GradientBlob
            variant="pink-purple"
            size="md"
            className="-bottom-16 -right-10 opacity-40"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 opacity-30 lg:block"
          >
            <WireframeSphere size={320} meridians={10} parallels={7} />
          </div>

          <div className="relative max-w-2xl text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {t("ctaEyebrow")}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
              {t("ctaTitleLine1")}
              <br />
              {t("ctaTitleLine2")}
            </h2>
            <p className="mt-5 text-muted-foreground">
              {t("ctaDescription")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="primary">
                <Link href="/learn/fundamentos-bnb">
                  {t("ctaPrimaryBtn")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass">
                <Link href="/learn">{t("ctaSecondaryBtn")}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
