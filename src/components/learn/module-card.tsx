"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Shield,
  TrendingUp,
  Coins,
  Image as ImageIcon,
  Flame,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Module } from "@/lib/types";
import { ModuleProgressBar } from "./module-progress-bar";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  shield: Shield,
  "trending-up": TrendingUp,
  coins: Coins,
  image: ImageIcon,
  flame: Flame,
};

const ACCENTS = {
  primary: {
    glow: "hover:shadow-[0_0_60px_-15px_rgba(240,185,11,0.5)]",
    text: "text-primary",
    iconBg: "bg-gradient-to-br from-primary/30 to-primary/5",
    border: "hover:border-primary/40",
    grad: "from-primary/20 via-orange-400/10 to-transparent",
  },
  pink: {
    glow: "hover:shadow-[0_0_60px_-15px_rgba(255,61,240,0.45)]",
    text: "text-accent-pink",
    iconBg: "bg-gradient-to-br from-accent-pink/30 to-accent-pink/5",
    border: "hover:border-accent-pink/40",
    grad: "from-accent-pink/20 via-fuchsia-500/10 to-transparent",
  },
  purple: {
    glow: "hover:shadow-[0_0_60px_-15px_rgba(139,92,246,0.5)]",
    text: "text-accent-purple",
    iconBg: "bg-gradient-to-br from-accent-purple/30 to-accent-purple/5",
    border: "hover:border-accent-purple/40",
    grad: "from-accent-purple/20 via-violet-500/10 to-transparent",
  },
  orange: {
    glow: "hover:shadow-[0_0_60px_-15px_rgba(255,138,61,0.5)]",
    text: "text-accent-orange",
    iconBg: "bg-gradient-to-br from-accent-orange/30 to-accent-orange/5",
    border: "hover:border-accent-orange/40",
    grad: "from-accent-orange/20 via-amber-500/10 to-transparent",
  },
  cyan: {
    glow: "hover:shadow-[0_0_60px_-15px_rgba(56,189,248,0.45)]",
    text: "text-accent-cyan",
    iconBg: "bg-gradient-to-br from-accent-cyan/30 to-accent-cyan/5",
    border: "hover:border-accent-cyan/40",
    grad: "from-accent-cyan/20 via-sky-500/10 to-transparent",
  },
} as const;

interface ModuleCardProps {
  module: Module;
  index?: number;
}

export function ModuleCard({ module, index = 0 }: ModuleCardProps) {
  const t = useTranslations("common");
  const Icon = ICONS[module.icon] ?? Compass;
  const accent = ACCENTS[module.accent];
  const isAvailable = module.status === "available";

  const containerClass = cn(
    "group relative block overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300",
    isAvailable
      ? cn("hover:bg-surface-elevated hover:-translate-y-1", accent.border, accent.glow)
      : "opacity-70 cursor-not-allowed"
  );

  const inner = (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br",
          accent.grad
        )}
      />

      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl border border-border",
            accent.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", accent.text)} />
        </div>

        <div className="flex items-center gap-2">
          {!isAvailable && (
            <Badge variant="outline" className="gap-1.5">
              <Lock className="h-3 w-3" />
              {t("comingSoon")}
            </Badge>
          )}
          <Badge variant="outline" className="capitalize">
            {module.difficulty}
          </Badge>
        </div>
      </div>

      <div className="relative mt-6">
        <p className={cn("text-xs font-semibold uppercase tracking-[0.18em] mb-2", accent.text)}>
          {module.category}
        </p>
        <h3 className="font-display text-xl font-semibold leading-tight">
          {module.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {module.tagline}
        </p>
      </div>

      <div className="relative mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="font-semibold text-foreground">{module.totalLessons}</span>
          {t("lessons")}
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="flex items-center gap-1">
          <span className="font-semibold text-foreground">{module.durationMinutes}</span>
          {t("min")}
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span className="flex items-center gap-1">
          <span className={cn("font-semibold", accent.text)}>+{module.totalXp}</span>
          XP
        </span>
      </div>

      {isAvailable && (
        <ModuleProgressBar
          moduleSlug={module.slug}
          totalLessons={module.totalLessons}
          accentColor={accent.text}
          className="mt-5"
        />
      )}

      <div className="relative mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex flex-wrap gap-1.5">
          {module.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="default" className="text-[0.65rem]">
              {tag}
            </Badge>
          ))}
        </div>
        {isAvailable ? (
          <span className={cn("flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1", accent.text)}>
            {t("start")}
            <ArrowRight className="h-4 w-4" />
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{t("soon")}</span>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.21, 1.02, 0.73, 1] }}
    >
      {isAvailable ? (
        <Link href={`/learn/${module.slug}`} className={containerClass}>
          {inner}
        </Link>
      ) : (
        <div className={containerClass} aria-disabled>
          {inner}
        </div>
      )}
    </motion.div>
  );
}
