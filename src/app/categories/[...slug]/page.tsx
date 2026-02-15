export const revalidate = 3600;

import { notFound } from "next/navigation";
import { getConfig } from "@/lib/config";
import {
  getCategories,
  getCategoryBySlug,
  getSubcategories,
} from "@/lib/categories";
import { listArticlesByCategory } from "@/lib/articles";
import { Navbar } from "@/components/public/Navbar";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { ArticleList } from "@/components/public/ArticleList";
import { CategoryGrid } from "@/components/public/CategoryGrid";
import { Footer } from "@/components/public/Footer";
import { sanitizeSvg } from "@/lib/sanitize-svg";
import type { Metadata } from "next";
import type { Category } from "@/types";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const { categories } = await getCategories();
  const params: { slug: string[] }[] = [];

  const topLevel = categories.filter((c) => !c.parentId);
  for (const cat of topLevel) {
    params.push({ slug: [cat.slug] });
    const subs = categories.filter((c) => c.parentId === cat.id);
    for (const sub of subs) {
      params.push({ slug: [cat.slug, sub.slug] });
    }
  }

  return params;
}

function resolveCategory(
  categories: Category[],
  slugSegments: string[]
): { category: Category; parent?: Category } | null {
  if (slugSegments.length === 1) {
    const cat = getCategoryBySlug(
      categories.filter((c) => !c.parentId),
      slugSegments[0]
    );
    return cat ? { category: cat } : null;
  }

  if (slugSegments.length === 2) {
    const parent = getCategoryBySlug(
      categories.filter((c) => !c.parentId),
      slugSegments[0]
    );
    if (!parent) return null;

    const sub = categories.find(
      (c) => c.slug === slugSegments[1] && c.parentId === parent.id
    );
    return sub ? { category: sub, parent } : null;
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [config, categoriesData] = await Promise.all([
    getConfig(),
    getCategories(),
  ]);

  const resolved = resolveCategory(categoriesData.categories, slug);
  if (!resolved) return { title: config.metadata.title };

  const { category, parent } = resolved;
  const titleParts = parent
    ? `${parent.title} — ${category.title}`
    : category.title;

  return {
    title: `${titleParts} — ${config.metadata.title}`,
    description: category.description || config.metadata.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug.length > 2) notFound();

  const [config, categoriesData] = await Promise.all([
    getConfig(),
    getCategories(),
  ]);

  const allCategories = categoriesData.categories;
  const resolved = resolveCategory(allCategories, slug);
  if (!resolved) notFound();

  const { category, parent } = resolved;

  const articles = await listArticlesByCategory(category.id, "published");

  // Build breadcrumbs
  const breadcrumbItems: { title: string; url?: string }[] = [
    { title: "Home", url: "/" },
  ];
  if (parent) {
    breadcrumbItems.push({
      title: parent.title,
      url: `/categories/${parent.slug}`,
    });
  }
  breadcrumbItems.push({ title: category.title });

  const cleanIcon = category.icon ? sanitizeSvg(category.icon) : "";

  // Get subcategories if this is a top-level category
  const subcategories = !parent
    ? getSubcategories(allCategories, category.id)
    : [];

  // Build subcategory cards with article count
  const subcategoriesWithCount = subcategories.map((sub) => ({
    ...sub,
    articleCount: 0, // Will be populated below
  }));

  // Count articles per subcategory
  if (subcategories.length > 0) {
    const allArticlesInTree = await Promise.all(
      subcategories.map((sub) => listArticlesByCategory(sub.id, "published"))
    );
    subcategories.forEach((sub, i) => {
      const match = subcategoriesWithCount.find((s) => s.id === sub.id);
      if (match) match.articleCount = allArticlesInTree[i].length;
    });
  }

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

        {subcategoriesWithCount.length > 0 && (
          <div className="mb-8">
            <CategoryGrid
              categories={subcategoriesWithCount}
              parentSlug={category.slug}
            />
          </div>
        )}

        {articles.length > 0 && (
          <ArticleList articles={articles} />
        )}
      </main>
      <Footer config={config} />
    </div>
  );
}
