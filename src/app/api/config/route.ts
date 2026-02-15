import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/config";
import { isAuthenticated } from "@/lib/auth";
import { cacheInvalidateAll } from "@/lib/cache";
import { SiteConfig } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SiteConfig;
  await saveConfig(body);
  cacheInvalidateAll();
  return NextResponse.json({ success: true });
}
