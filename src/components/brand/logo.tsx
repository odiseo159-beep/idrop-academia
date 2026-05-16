import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  href?: string | null;
}

export function Logo({ className, showWordmark = true, href = "/" }: LogoProps) {
  const t = useTranslations("footer");
  const inner = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative">
        <svg
          width="34"
          height="34"
          viewBox="0 0 40 40"
          className="drop-shadow-[0_0_18px_rgba(240,185,11,0.45)]"
        >
          <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0b90b" />
              <stop offset="50%" stopColor="#fbd038" />
              <stop offset="100%" stopColor="#ff8a3d" />
            </linearGradient>
          </defs>
          <rect
            x="3"
            y="3"
            width="34"
            height="34"
            rx="9"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <path
            d="M20 10 L26.5 14 L26.5 26 L20 30 L13.5 26 L13.5 14 Z"
            fill="url(#logo-grad)"
            opacity="0.95"
          />
          <path
            d="M20 10 L20 30 M13.5 14 L26.5 26 M13.5 26 L26.5 14"
            stroke="rgba(7,8,13,0.35)"
            strokeWidth="0.7"
          />
          <circle cx="20" cy="20" r="2.5" fill="#07080d" />
        </svg>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[1.05rem] font-bold tracking-tight">
            IDROP
          </span>
          <span className="text-[0.55rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {t("wordmark")}
          </span>
        </div>
      )}
    </div>
  );

  if (href === null) return inner;
  return <Link href={href} className="group">{inner}</Link>;
}
