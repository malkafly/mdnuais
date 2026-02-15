import { CategoriesData, Category } from "@/types";
import { getObject, putObject } from "./storage";
import { cacheGet, cacheSet, cacheInvalidate } from "./cache";

const CATEGORIES_KEY = "categories";

const defaultCategories: CategoriesData = { categories: [] };

export async function getCategories(): Promise<CategoriesData> {
  const cached = cacheGet<CategoriesData>(CATEGORIES_KEY);
  if (cached) return cached;

  const raw = await getObject("categories.json");
  if (!raw) {
    cacheSet(CATEGORIES_KEY, defaultCategories);
    return defaultCategories;
  }

  const data = JSON.parse(raw) as CategoriesData;
  cacheSet(CATEGORIES_KEY, data);
  return data;
}

export async function saveCategories(data: CategoriesData): Promise<void> {
  await putObject("categories.json", JSON.stringify(data, null, 2), "application/json");
  cacheInvalidate(CATEGORIES_KEY);
}

export function getCategoryBySlug(
  categories: Category[],
  slug: string
): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(
  categories: Category[],
  id: string
): Category | undefined {
  return categories.find((c) => c.id === id);
}
