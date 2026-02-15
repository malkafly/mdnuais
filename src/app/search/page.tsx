import Link from "next/link";
import { FileText } from "lucide-react";
import { buildSearchIndex } from "@/lib/search";
import { getConfig, getSidebar } from "@/lib/config";
import { Sidebar } from "@/components/public/Sidebar";
import { Header } from "@/components/public/Header";
import { t } from "@/lib/i18n";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const [config, sidebar] = await Promise.all([getConfig(), getSidebar()]);
  const index = await buildSearchIndex();

  const results = q
    ? index.filter(
        (entry) =>
          entry.title.toLowerCase().includes(q.toLowerCase()) ||
          entry.content.toLowerCase().includes(q.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar items={sidebar.items} config={config} />
      <Header />

      <div className="flex-1 lg:pl-sidebar">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">
            {t("search.title")}: &quot;{q}&quot;
          </h1>

          {results.length === 0 ? (
            <p className="text-[var(--color-content-muted)]">
              {t("search.noResults")} &quot;{q}&quot;
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Link
                  key={result.slug}
                  href={`/docs/${result.slug}`}
                  className="block p-4 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-[var(--color-content-muted)]" />
                    <span className="font-medium">{result.title}</span>
                  </div>
                  <p className="text-sm text-[var(--color-content-muted)] line-clamp-2">
                    {result.content.substring(0, 200)}
                  </p>
                  <p className="text-xs text-[var(--color-content-muted)] mt-1">
                    {result.breadcrumb}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
