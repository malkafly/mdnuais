import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DocNavigation as DocNav } from "@/types";
import { t } from "@/lib/i18n";

interface DocNavigationProps {
  navigation: DocNav;
}

export function DocNavigation({ navigation }: DocNavigationProps) {
  const { prev, next } = navigation;

  if (!prev && !next) return null;

  return (
    <div className="flex items-center justify-between mt-12 pt-6 border-t border-[var(--color-border)]">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="flex items-center gap-2 text-sm text-[var(--color-content-muted)] hover:text-[var(--color-primary)] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <div>
            <div className="text-xs uppercase tracking-wider">{t("nav.previous")}</div>
            <div className="font-medium text-[var(--color-content)] group-hover:text-[var(--color-primary)]">
              {prev.title}
            </div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="flex items-center gap-2 text-sm text-[var(--color-content-muted)] hover:text-[var(--color-primary)] transition-colors text-right group"
        >
          <div>
            <div className="text-xs uppercase tracking-wider">{t("nav.next")}</div>
            <div className="font-medium text-[var(--color-content)] group-hover:text-[var(--color-primary)]">
              {next.title}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
