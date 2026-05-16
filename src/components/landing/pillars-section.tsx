"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, Trophy, Network } from "lucide-react";
import { PlasmaShape } from "@/components/fx/plasma-shape";

export function PillarsSection() {
  const t = useTranslations("landing");

  const PILLARS = [
    {
      num: "001",
      title: t("pillar1Title"),
      icon: BookOpen,
      bullets: [
        t("pillar1Bullet1"),
        t("pillar1Bullet2"),
        t("pillar1Bullet3"),
      ],
      label: t("pillar1Label"),
      shape: "torus" as const,
    },
    {
      num: "002",
      title: t("pillar2Title"),
      icon: Trophy,
      bullets: [
        t("pillar2Bullet1"),
        t("pillar2Bullet2"),
        t("pillar2Bullet3"),
      ],
      label: t("pillar2Label"),
      shape: "wave" as const,
    },
    {
      num: "003",
      title: t("pillar3Title"),
      icon: Network,
      bullets: [
        t("pillar3Bullet1"),
        t("pillar3Bullet2"),
        t("pillar3Bullet3"),
      ],
      label: t("pillar3Label"),
      shape: "blob" as const,
    },
  ];

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {t("pillarsEyebrow")}
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
            {t("pillarsTitleLine1")}
            <br />
            <span className="text-gradient">{t("pillarsTitleLine2")}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            {t("pillarsDescription")}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-surface p-7"
              >
                <div className="pointer-events-none absolute -top-8 -right-8 opacity-30">
                  <PlasmaShape variant={p.shape} size={170} />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">/{p.num}</span>
                    <span className="font-mono uppercase tracking-widest text-muted-foreground">
                      {p.label}
                    </span>
                  </div>

                  <div className="mt-12 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/0 border border-border">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-semibold leading-tight">
                    {p.title}
                  </h3>

                  <ul className="mt-5 space-y-3">
                    {p.bullets.map((b) => (
                      <li
                        key={b}
                        className="relative pl-5 text-sm text-muted-foreground leading-relaxed"
                      >
                        <span className="absolute left-0 top-2 h-1 w-1 rounded-full bg-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
