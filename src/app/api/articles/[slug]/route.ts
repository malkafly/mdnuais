import { NextRequest, NextResponse } from "next/server";
import {
  getArticleMeta,
  getArticleContent,
  saveArticleMeta,
  saveArticleContent,
  deleteArticle,
} from "@/lib/articles";
import { isAuthenticated } from "@/lib/auth";
import { ArticleMeta } from "@/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const [meta, content] = await Promise.all([
    getArticleMeta(slug),
    getArticleContent(slug),
  ]);

  if (!content && !meta) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ content: content || "", meta });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json();
  const { content, meta } = body as { content?: string; meta?: ArticleMeta };

  if (content !== undefined) {
    await saveArticleContent(slug, content);
  }
  if (meta) {
    await saveArticleMeta(slug, meta);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  await deleteArticle(slug);
  return NextResponse.json({ success: true });
}
