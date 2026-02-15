import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCategories, saveCategories, getSubcategoryIds } from "@/lib/categories";
import { listAllArticles } from "@/lib/articles";
import { isAuthenticated } from "@/lib/auth";
import { cacheInvalidateAll } from "@/lib/cache";
import { CategoriesData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [categoriesData, articles] = await Promise.all([
    getCategories(),
    listAllArticles(),
  ]);

  const allCategories = categoriesData.categories;
  const publishedArticles = articles.filter((a) => a.status === "published");

  const enriched = allCategories.map((cat) => {
    // For top-level categories, count articles in self + all subcategories
    const relevantIds = !cat.parentId
      ? [cat.id, ...getSubcategoryIds(allCategories, cat.id)]
      : [cat.id];

    return {
      ...cat,
      articleCount: publishedArticles.filter((a) =>
        a.category && relevantIds.includes(a.category)
      ).length,
    };
  });

  return NextResponse.json(enriched, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CategoriesData;
  await saveCategories(body);
  cacheInvalidateAll();
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
