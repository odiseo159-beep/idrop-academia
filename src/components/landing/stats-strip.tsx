"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function StatsStrip() {
  const t = useTranslations("landing");

  const STATS = [
    { value: "6", label: t("statsModules") },
    { value: "20+", label: t("statsLessons") },
    { value: "100%", label: t("statsFree") },
    { value: "24/7", label: t("statsSelfPaced") },
  ];

  return (
    <section className="relative border-y border-border bg-surface/50 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-surface px-6 py-8 text-center md:px-8 md:py-10"
          >
            <div className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {s.value}
            </div>
            <div className="mt-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
