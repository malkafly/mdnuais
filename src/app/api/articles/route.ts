import { NextRequest, NextResponse } from "next/server";
import { listAllArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  let articles = await listAllArticles();

  if (category) {
    articles = articles.filter((a) => a.category === category);
  }
  if (status) {
    articles = articles.filter((a) => a.status === status);
  }

  return NextResponse.json(articles, {
    headers: { "Cache-Control": "no-store" },
  });
}
