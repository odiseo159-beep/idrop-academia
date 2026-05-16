"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function switchTo(next: Locale) {
    if (next === locale) {
      setOpen(false);
      return;
    }
    // @ts-expect-error - next-intl router accepts dynamic params
    router.replace({ pathname, params }, { locale: next });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-elevated",
          compact ? "h-9 px-2.5 text-xs" : "h-9 px-3 text-xs"
        )}
        aria-label="Switch language"
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="font-mono uppercase">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-2xl backdrop-blur-xl z-[60]">
          {routing.locales.map((l) => (
            <button
              key={l}
              onClick={() => switchTo(l)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-xs transition-colors",
                locale === l
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-surface hover:text-foreground"
              )}
            >
              <span>{l === "en" ? "English" : "Español"}</span>
              <span className="font-mono uppercase opacity-60">{l}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
