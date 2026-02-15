import { SearchEntry } from "@/types";
import { listPublishedArticles, getArticleContent } from "./articles";
import { getCategories } from "./categories";
import { extractHeadings, extractTitle, stripMarkdown } from "./markdown";
import { cacheGet, cacheSet } from "./cache";

const SEARCH_INDEX_KEY = "search-index";

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const cached = cacheGet<SearchEntry[]>(SEARCH_INDEX_KEY);
  if (cached) return cached;

  const [articles, categoriesData] = await Promise.all([
    listPublishedArticles(),
    getCategories(),
  ]);

  const categoryMap = new Map(
    categoriesData.categories.map((c) => [c.id, c.title])
  );

  const entries: SearchEntry[] = [];

  for (const article of articles) {
    const content = await getArticleContent(article.slug);
    if (!content) continue;

    const headings = extractHeadings(content);
    const title = extractTitle(content) || article.title;
    const categoryTitle = article.category
      ? categoryMap.get(article.category) || ""
      : "";
    const breadcrumb = categoryTitle
      ? `${categoryTitle} > ${article.title}`
      : article.title;

    entries.push({
      title,
      slug: article.slug,
      content: stripMarkdown(content).substring(0, 500),
      headings: headings.map((h) => h.text),
      breadcrumb,
    });
  }

  cacheSet(SEARCH_INDEX_KEY, entries);
  return entries;
}
