import Link from "next/link";
import { FileText } from "lucide-react";
import { ArticleMeta } from "@/types";

interface ArticleListProps {
  articles: ArticleMeta[];
  showCategory?: boolean;
  categoryMap?: Map<string, string>;
}

export function ArticleList({ articles, showCategory, categoryMap }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-[var(--color-content-muted)] py-8">
        Nenhum artigo encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={`/articles/${article.slug}`}
          className="flex items-start gap-3 p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors group"
        >
          <FileText className="w-5 h-5 mt-0.5 text-[var(--color-content-muted)] flex-shrink-0 group-hover:text-[var(--color-primary)]" />
          <div className="min-w-0">
            <h3 className="font-medium text-sm group-hover:text-[var(--color-primary)] transition-colors">
              {article.title}
            </h3>
            {showCategory && article.category && categoryMap && (
              <span className="text-xs text-[var(--color-content-muted)]">
                {categoryMap.get(article.category) || ""}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
