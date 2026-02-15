export const revalidate = 3600;

import { notFound } from "next/navigation";
import { getConfig } from "@/lib/config";
import { getCategories, getCategoryById } from "@/lib/categories";
import {
  getArticleMeta,
  getArticleContent,
  listArticlesByCategory,
  getArticleNavigation,
} from "@/lib/articles";
import { getManifest } from "@/lib/manifest";
import { extractHeadings, extractTitle } from "@/lib/markdown";
import { Navbar } from "@/components/public/Navbar";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { MarkdownRenderer } from "@/components/public/MarkdownRenderer";
import { TableOfContents } from "@/components/public/TableOfContents";
import { DocNavigation } from "@/components/public/DocNavigation";
import { ShareButton } from "@/components/public/ShareButton";
import { Footer } from "@/components/public/Footer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getManifest();
  return articles
    .filter((a) => a.status === "published")
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [meta, content, config] = await Promise.all([
    getArticleMeta(slug),
    getArticleContent(slug),
    getConfig(),
  ]);

  const title = meta?.title || (content ? extractTitle(content) : "") || config.metadata.title;
  return {
    title: `${title} — ${config.metadata.title}`,
    description: config.metadata.description,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const [meta, content, config, categoriesData] = await Promise.all([
    getArticleMeta(slug),
    getArticleContent(slug),
    getConfig(),
    getCategories(),
  ]);

  if (!content) notFound();

  const allCategories = categoriesData.categories;
  const category = meta?.category
    ? getCategoryById(allCategories, meta.category)
    : null;

  // Resolve parent if category is a subcategory
  const parentCategory = category?.parentId
    ? getCategoryById(allCategories, category.parentId)
    : null;

  const breadcrumbItems: { title: string; url?: string }[] = [{ title: "Home", url: "/" }];
  if (parentCategory && category) {
    breadcrumbItems.push({
      title: parentCategory.title,
      url: `/categories/${parentCategory.slug}`,
    });
    breadcrumbItems.push({
      title: category.title,
      url: `/categories/${parentCategory.slug}/${category.slug}`,
    });
  } else if (category) {
    breadcrumbItems.push({
      title: category.title,
      url: `/categories/${category.slug}`,
    });
  }
  breadcrumbItems.push({
    title: meta?.title || extractTitle(content) || slug,
  });

  let navigation = { prev: null as { title: string; slug: string } | null, next: null as { title: string; slug: string } | null };
  if (meta?.category) {
    const siblings = await listArticlesByCategory(meta.category, "published");
    const nav = getArticleNavigation(siblings, slug);
    navigation = {
      prev: nav.prev ? { title: nav.prev.title, slug: nav.prev.slug } : null,
      next: nav.next ? { title: nav.next.title, slug: nav.next.slug } : null,
    };
  }

  const headings = extractHeadings(content);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar config={config} />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        <main className="flex-1 min-w-0 max-w-content">
          <div className="flex items-center justify-between mb-4">
            <Breadcrumbs items={breadcrumbItems} />
            <ShareButton
              title={meta?.title || extractTitle(content) || ""}
              url={`${baseUrl}/articles/${slug}`}
            />
          </div>

          <MarkdownRenderer content={content} />

          <DocNavigation navigation={navigation} />
        </main>

        <TableOfContents headings={headings} />
      </div>
      <Footer config={config} />
    </div>
  );
}
