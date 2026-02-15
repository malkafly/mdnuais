import { NextRequest, NextResponse } from "next/server";
import { getObject, putObject, deleteObject } from "@/lib/storage";
import { isAuthenticated } from "@/lib/auth";
import { cacheGet, cacheSet, cacheInvalidate, cacheInvalidatePrefix } from "@/lib/cache";
import { getSidebar, saveSidebar } from "@/lib/config";

interface RouteParams {
  params: Promise<{ slug: string[] }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const path = slug.join("/");
  const cacheKey = `doc:${path}`;

  const cached = cacheGet<string>(cacheKey);
  if (cached) {
    return NextResponse.json({ content: cached, slug: path });
  }

  const content = await getObject(`docs/${path}.md`);
  if (!content) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  cacheSet(cacheKey, content);
  return NextResponse.json({ content, slug: path });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const path = slug.join("/");
  const body = await request.json();
  const { content, title } = body as { content: string; title: string };

  await putObject(`docs/${path}.md`, content, "text/markdown");
  cacheInvalidate(`doc:${path}`);
  cacheInvalidatePrefix("search-index");

  if (title) {
    const sidebar = await getSidebar();
    updateTitleInSidebar(sidebar.items, path, title);
    await saveSidebar(sidebar);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const path = slug.join("/");

  await deleteObject(`docs/${path}.md`);
  cacheInvalidate(`doc:${path}`);
  cacheInvalidatePrefix("search-index");

  const sidebar = await getSidebar();
  removeFromSidebar(sidebar.items, path);
  await saveSidebar(sidebar);

  return NextResponse.json({ success: true });
}

function updateTitleInSidebar(items: { title: string; slug: string; children?: { title: string; slug: string }[] }[], slug: string, title: string): void {
  for (const item of items) {
    if (item.slug === slug) {
      item.title = title;
      return;
    }
    if (item.children) {
      updateTitleInSidebar(item.children, slug, title);
    }
  }
}

function removeFromSidebar(items: { slug: string; children?: { slug: string }[] }[], slug: string): void {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].slug === slug) {
      items.splice(i, 1);
      return;
    }
    if (items[i].children) {
      removeFromSidebar(items[i].children!, slug);
    }
  }
}
