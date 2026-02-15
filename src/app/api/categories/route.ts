import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategories } from "@/lib/categories";
import { listAllArticles } from "@/lib/articles";
import { isAuthenticated } from "@/lib/auth";
import { CategoriesData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [categoriesData, articles] = await Promise.all([
    getCategories(),
    listAllArticles(),
  ]);

  const enriched = categoriesData.categories.map((cat) => ({
    ...cat,
    articleCount: articles.filter(
      (a) => a.category === cat.id && a.status === "published"
    ).length,
  }));

  return NextResponse.json({ categories: enriched });
}

export async function PUT(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CategoriesData;
  await saveCategories(body);
  return NextResponse.json({ success: true });
}
