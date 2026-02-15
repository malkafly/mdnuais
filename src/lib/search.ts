import { SearchEntry } from "@/types";
import { listPublishedArticles, getArticleContent } from "./articles";
import { getCategories } from "./categories";
import { extractHeadings, extractTitle, stripMarkdown } from "./markdown";
import { getObject, putObject } from "./storage";
import { cacheGet, cacheSet } from "./cache";

const SEARCH_INDEX_KEY = "search-index";
const SEARCH_INDEX_R2_PATH = "search-index.json";

export async function getSearchIndex(): Promise<SearchEntry[]> {
  const cached = cacheGet<SearchEntry[]>(SEARCH_INDEX_KEY);
  if (cached) return cached;

  const raw = await getObject(SEARCH_INDEX_R2_PATH);
  if (raw) {
    try {
      const entries = JSON.parse(raw) as SearchEntry[];
      cacheSet(SEARCH_INDEX_KEY, entries);
      return entries;
    } catch {
      /* malformed index, rebuild */
    }
  }

  return rebuildSearchIndex();
}

export async function rebuildSearchIndex(): Promise<SearchEntry[]> {
  const [articles, categoriesData] = await Promise.all([
    listPublishedArticles(),
    getCategories(),
  ]);

  const allCategories = categoriesData.categories;
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  const contentResults = await Promise.all(
    articles.map(async (article) => ({
      article,
      content: await getArticleContent(article.slug),
    }))
  );

  const entries: SearchEntry[] = [];

  for (const { article, content } of contentResults) {
    if (!content) continue;

    const headings = extractHeadings(content);
    const title = extractTitle(content) || article.title;

    let breadcrumb = article.title;
    if (article.category) {
      const cat = categoryMap.get(article.category);
      if (cat) {
        if (cat.parentId) {
          const parent = categoryMap.get(cat.parentId);
          breadcrumb = parent
            ? `${parent.title} > ${cat.title} > ${article.title}`
            : `${cat.title} > ${article.title}`;
        } else {
          breadcrumb = `${cat.title} > ${article.title}`;
        }
      }
    }

    entries.push({
      title,
      slug: article.slug,
      content: stripMarkdown(content).substring(0, 500),
      headings: headings.map((h) => h.text),
      breadcrumb,
    });
  }

  await putObject(
    SEARCH_INDEX_R2_PATH,
    JSON.stringify(entries),
    "application/json"
  );

  cacheSet(SEARCH_INDEX_KEY, entries);
  return entries;
}

// Backward-compatible alias
export const buildSearchIndex = getSearchIndex;
