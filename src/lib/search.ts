import { SearchEntry, SidebarItem } from "@/types";
import { getObject } from "./storage";
import { getSidebar } from "./config";
import { extractHeadings, extractTitle, stripMarkdown } from "./markdown";
import { cacheGet, cacheSet } from "./cache";

const SEARCH_INDEX_KEY = "search-index";

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const cached = cacheGet<SearchEntry[]>(SEARCH_INDEX_KEY);
  if (cached) return cached;

  const sidebar = await getSidebar();
  const entries: SearchEntry[] = [];

  await collectEntries(sidebar.items, entries, []);

  cacheSet(SEARCH_INDEX_KEY, entries);
  return entries;
}

async function collectEntries(
  items: SidebarItem[],
  entries: SearchEntry[],
  breadcrumbPath: string[]
): Promise<void> {
  for (const item of items) {
    if (item.external) continue;

    if (item.children && item.children.length > 0) {
      await collectEntries(item.children, entries, [...breadcrumbPath, item.title]);
    } else {
      const content = await getObject(`docs/${item.slug}.md`);
      if (content) {
        const headings = extractHeadings(content);
        const title = extractTitle(content) || item.title;
        entries.push({
          title,
          slug: item.slug,
          content: stripMarkdown(content).substring(0, 500),
          headings: headings.map((h) => h.text),
          breadcrumb: [...breadcrumbPath, item.title].join(" > "),
        });
      }
    }
  }
}
