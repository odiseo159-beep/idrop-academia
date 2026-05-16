import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="relative mt-32 border-t border-border">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent-purple/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("learnHeading")}
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/learn" className="text-foreground/80 hover:text-foreground transition-colors">
                  {t("learnAllModules")}
                </Link>
              </li>
              <li>
                <Link href="/learn/fundamentos-bnb" className="text-foreground/80 hover:text-foreground transition-colors">
                  {t("learnFundamentals")}
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-foreground/80 hover:text-foreground transition-colors">
                  {t("learnDiscover")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("accountHeading")}
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/profile" className="text-foreground/80 hover:text-foreground transition-colors">
                  {t("accountProfile")}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-foreground/80 hover:text-foreground transition-colors">
                  {t("accountProgress")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("roadmapHeading")}
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-foreground/80">{t("roadmapBnbLive")}</li>
              <li className="text-muted-foreground">{t("roadmapOpBnb")}</li>
              <li className="text-muted-foreground">{t("roadmapEth")}</li>
              <li className="text-muted-foreground">{t("roadmapSol")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} IDROP. {t("rights")}
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              {t("privacy")}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t("terms")}
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              {t("contact")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
