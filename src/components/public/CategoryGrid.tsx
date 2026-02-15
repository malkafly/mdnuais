import Link from "next/link";
import { CategoryWithCount } from "@/types";
import DOMPurify from "isomorphic-dompurify";

interface CategoryGridProps {
  categories: CategoryWithCount[];
}

function SafeSvgIcon({ svg, className }: { svg: string; className?: string }) {
  const clean = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="group block p-6 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          {cat.icon && (
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 [&_svg]:w-6 [&_svg]:h-6"
              style={{ backgroundColor: cat.iconBgColor || "#EEF2FF", color: "#000" }}
            >
              <SafeSvgIcon svg={cat.icon} />
            </div>
          )}
          <h3 className="font-semibold text-base mb-1 group-hover:text-[var(--color-primary)] transition-colors">
            {cat.title}
          </h3>
          {cat.description && (
            <p className="text-sm text-[var(--color-content-muted)] mb-3 line-clamp-2">
              {cat.description}
            </p>
          )}
          <span className="text-xs text-[var(--color-content-muted)]">
            {cat.articleCount} {cat.articleCount === 1 ? "artigo" : "artigos"}
          </span>
        </Link>
      ))}
    </div>
  );
}
