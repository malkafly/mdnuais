import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-[var(--color-content-muted)]">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const href = item.url || (item.slug ? `/categories/${item.slug}` : undefined);

        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5" />}
            {!isLast && href ? (
              <Link
                href={href}
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                {item.title}
              </Link>
            ) : (
              <span className={isLast ? "text-[var(--color-content)]" : ""}>
                {item.title}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
