import { NextRequest, NextResponse } from "next/server";
import { saveSidebar } from "@/lib/config";
import { isAuthenticated } from "@/lib/auth";
import { SidebarData } from "@/types";

export async function PUT(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SidebarData;
  await saveSidebar(body);
  return NextResponse.json({ success: true });
}
