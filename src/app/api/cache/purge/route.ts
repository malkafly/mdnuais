import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { cacheInvalidateAll } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function POST() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  cacheInvalidateAll();
  return NextResponse.json({ success: true });
}
