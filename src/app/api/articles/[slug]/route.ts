import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getArticleMeta,
  getArticleContent,
  saveArticleMeta,
  saveArticleContent,
  deleteArticle,
} from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import { isAuthenticated } from "@/lib/auth";
import { cacheInvalidateAll } from "@/lib/cache";
import { rebuildSearchIndex } from "@/lib/search";
import { ArticleMeta } from "@/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function revalidateArticlePages(slug: string, meta: ArticleMeta | null) {
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/");

  if (meta?.category) {
    const categoriesData = await getCategories();
    const cat = categoriesData.categories.find((c) => c.id === meta.category);
    if (cat) {
      if (cat.parentId) {
        const parent = categoriesData.categories.find((c) => c.id === cat.parentId);
        if (parent) {
          revalidatePath(`/categories/${parent.slug}/${cat.slug}`);
          revalidatePath(`/categories/${parent.slug}`);
        }
      } else {
        revalidatePath(`/categories/${cat.slug}`);
      }
    }
  }
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

  return NextResponse.json({ content: content || "", meta }, {
    headers: { "Cache-Control": "no-store" },
  });
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

  cacheInvalidateAll();
  await revalidateArticlePages(slug, meta ?? null);
  rebuildSearchIndex().catch(console.error);

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const meta = await getArticleMeta(slug);
  await deleteArticle(slug);
  cacheInvalidateAll();
  await revalidateArticlePages(slug, meta);
  rebuildSearchIndex().catch(console.error);

  return NextResponse.json({ success: true });
}
