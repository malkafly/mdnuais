export const dynamic = "force-dynamic";

import { getConfig } from "@/lib/config";
import { getCategories } from "@/lib/categories";
import { listPublishedArticles } from "@/lib/articles";
import { Navbar } from "@/components/public/Navbar";
import { Hero } from "@/components/public/Hero";
import { CategoryGrid } from "@/components/public/CategoryGrid";
import { Footer } from "@/components/public/Footer";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return {
    title: config.metadata.title,
    description: config.metadata.description,
  };
}

export default async function Home() {
  const [config, categoriesData, articles] = await Promise.all([
    getConfig(),
    getCategories(),
    listPublishedArticles(),
  ]);

  const allCategories = categoriesData.categories;
  const topLevel = allCategories.filter((c) => !c.parentId);

  const categoriesWithCount = topLevel
    .sort((a, b) => a.order - b.order)
    .map((cat) => {
      const subIds = allCategories
        .filter((c) => c.parentId === cat.id)
        .map((c) => c.id);
      const relevantIds = [cat.id, ...subIds];
      return {
        ...cat,
        articleCount: articles.filter(
          (a) => a.category && relevantIds.includes(a.category)
        ).length,
      };
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar config={config} />
      <Hero config={config} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <CategoryGrid categories={categoriesWithCount} />
      </main>
      <Footer config={config} />
    </div>
  );
}
