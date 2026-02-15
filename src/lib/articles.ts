import { ArticleMeta, ArticleStatus } from "@/types";
import { getObject, putObject, deleteObject } from "./storage";
import { cacheGet, cacheSet, cacheInvalidate, cacheInvalidatePrefix } from "./cache";
import { getManifest, updateManifestEntry, removeManifestEntry } from "./manifest";

export async function getArticleMeta(slug: string): Promise<ArticleMeta | null> {
  const cacheKey = `article-meta:${slug}`;
  const cached = cacheGet<ArticleMeta>(cacheKey);
  if (cached) return cached;

  const raw = await getObject(`docs/${slug}.json`);
  if (!raw) return null;

  const meta = JSON.parse(raw) as ArticleMeta;
  cacheSet(cacheKey, meta);
  return meta;
}

export async function saveArticleMeta(slug: string, meta: ArticleMeta): Promise<void> {
  await putObject(`docs/${slug}.json`, JSON.stringify(meta, null, 2), "application/json");
  await updateManifestEntry(slug, meta);
  cacheInvalidate(`article-meta:${slug}`);
  cacheInvalidatePrefix("articles-list");
}

export async function getArticleContent(slug: string): Promise<string | null> {
  const cacheKey = `article-content:${slug}`;
  const cached = cacheGet<string>(cacheKey);
  if (cached) return cached;

  const content = await getObject(`docs/${slug}.md`);
  if (content) cacheSet(cacheKey, content);
  return content;
}

export async function saveArticleContent(slug: string, content: string): Promise<void> {
  await putObject(`docs/${slug}.md`, content, "text/markdown");
  cacheInvalidate(`article-content:${slug}`);
  cacheInvalidatePrefix("search-index");
}

export async function deleteArticle(slug: string): Promise<void> {
  await Promise.all([
    deleteObject(`docs/${slug}.md`),
    deleteObject(`docs/${slug}.json`),
  ]);
  await removeManifestEntry(slug);
  cacheInvalidate(`article-meta:${slug}`);
  cacheInvalidate(`article-content:${slug}`);
  cacheInvalidatePrefix("articles-list");
  cacheInvalidatePrefix("search-index");
}

export async function listAllArticles(): Promise<ArticleMeta[]> {
  const cacheKey = "articles-list:all";
  const cached = cacheGet<ArticleMeta[]>(cacheKey);
  if (cached) return cached;

  const articles = await getManifest();
  cacheSet(cacheKey, articles);
  return articles;
}

export async function listArticlesByCategory(
  categoryId: string,
  status?: ArticleStatus
): Promise<ArticleMeta[]> {
  const all = await listAllArticles();
  return all.filter(
    (a) =>
      a.category === categoryId && (status ? a.status === status : true)
  );
}

export async function listPublishedArticles(): Promise<ArticleMeta[]> {
  const all = await listAllArticles();
  return all.filter((a) => a.status === "published");
}

export function getArticleNavigation(
  articles: ArticleMeta[],
  currentSlug: string
): { prev: ArticleMeta | null; next: ArticleMeta | null } {
  const sorted = [...articles].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((a) => a.slug === currentSlug);
  return {
    prev: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}
