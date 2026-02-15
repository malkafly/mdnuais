import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BreadcrumbItem } from "@/types";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-[var(--color-content-muted)] mb-4">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {item.slug ? (
            <Link
              href={`/docs/${item.slug}`}
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className="text-[var(--color-content)]">{item.title}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
