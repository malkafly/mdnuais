export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getConfig } from "@/lib/config";
import { getCategories, getCategoryBySlug } from "@/lib/categories";
import { listArticlesByCategory } from "@/lib/articles";
import { Navbar } from "@/components/public/Navbar";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ArticleList } from "@/components/public/ArticleList";
import { Footer } from "@/components/public/Footer";
import { sanitizeSvg } from "@/lib/sanitize-svg";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [config, categoriesData] = await Promise.all([
    getConfig(),
    getCategories(),
  ]);
  const category = getCategoryBySlug(categoriesData.categories, slug);
  if (!category) return { title: config.metadata.title };
  return {
    title: `${category.title} — ${config.metadata.title}`,
    description: category.description || config.metadata.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const [config, categoriesData] = await Promise.all([
    getConfig(),
    getCategories(),
  ]);

  const category = getCategoryBySlug(categoriesData.categories, slug);
  if (!category) notFound();

  const articles = await listArticlesByCategory(category.id, "published");

  const breadcrumbItems = [
    { title: "Home", url: "/" },
    { title: category.title },
  ];

  const cleanIcon = category.icon
    ? sanitizeSvg(category.icon)
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar config={config} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-4 mt-4 mb-8">
          {cleanIcon && (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 [&_svg]:w-7 [&_svg]:h-7"
              style={{ backgroundColor: category.iconBgColor || "#EEF2FF", color: "#000" }}
              dangerouslySetInnerHTML={{ __html: cleanIcon }}
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{category.title}</h1>
            {category.description && (
              <p className="text-[var(--color-content-muted)] mt-1">{category.description}</p>
            )}
          </div>
        </div>

        <ArticleList articles={articles} />
      </main>
      <Footer config={config} />
    </div>
  );
}
