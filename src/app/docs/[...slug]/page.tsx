import { notFound } from "next/navigation";
import { getObject } from "@/lib/storage";
import { getConfig, getSidebar } from "@/lib/config";
import { extractHeadings, extractTitle } from "@/lib/markdown";
import { getDocNavigation, getBreadcrumbs } from "@/lib/navigation";
import { cacheGet, cacheSet } from "@/lib/cache";
import { Sidebar } from "@/components/public/Sidebar";
import { Header } from "@/components/public/Header";
import { TableOfContents } from "@/components/public/TableOfContents";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { MarkdownRenderer } from "@/components/public/MarkdownRenderer";
import { DocNavigation } from "@/components/public/DocNavigation";
import { ShareButton } from "@/components/public/ShareButton";
import { Footer } from "@/components/public/Footer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");
  const content = await getDocContent(path);
  const config = await getConfig();

  if (!content) return { title: config.metadata.title };

  const title = extractTitle(content);
  return {
    title: title ? `${title} — ${config.metadata.title}` : config.metadata.title,
    description: config.metadata.description,
  };
}

async function getDocContent(path: string): Promise<string | null> {
  const cacheKey = `doc:${path}`;
  const cached = cacheGet<string>(cacheKey);
  if (cached) return cached;

  const content = await getObject(`docs/${path}.md`);
  if (content) {
    cacheSet(cacheKey, content);
  }
  return content;
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const path = slug.join("/");

  const [content, config, sidebar] = await Promise.all([
    getDocContent(path),
    getConfig(),
    getSidebar(),
  ]);

  if (!content) {
    notFound();
  }

  const headings = extractHeadings(content);
  const title = extractTitle(content);
  const navigation = getDocNavigation(sidebar.items, path);
  const breadcrumbs = getBreadcrumbs(sidebar.items, path);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar items={sidebar.items} config={config} />
      <Header />

      <div className="flex-1 lg:pl-sidebar">
        <div className="flex max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
          <main className="flex-1 min-w-0 max-w-content">
            <div className="flex items-center justify-between mb-2">
              <Breadcrumbs items={breadcrumbs} />
              <ShareButton
                title={title}
                url={`${baseUrl}/docs/${path}`}
              />
            </div>

            <MarkdownRenderer content={content} />

            <DocNavigation navigation={navigation} />
          </main>

          <TableOfContents headings={headings} />
        </div>

        <Footer config={config} />
      </div>
    </div>
  );
}
