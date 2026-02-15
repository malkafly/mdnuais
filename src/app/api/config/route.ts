import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getConfig, saveConfig } from "@/lib/config";
import { isAuthenticated } from "@/lib/auth";
import { cacheInvalidateAll } from "@/lib/cache";
import { SiteConfig } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SiteConfig;
  await saveConfig(body);
  cacheInvalidateAll();
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
