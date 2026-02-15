import { NextResponse } from "next/server";
import { getSidebar } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const sidebar = await getSidebar();
  return NextResponse.json(sidebar);
}
