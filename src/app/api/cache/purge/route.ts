import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { cacheInvalidateAll } from "@/lib/cache";
import { rebuildManifest } from "@/lib/manifest";
import { rebuildSearchIndex } from "@/lib/search";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  cacheInvalidateAll();
  await rebuildManifest();
  await rebuildSearchIndex();
  revalidatePath("/", "layout");

  return NextResponse.json({ success: true });
}
