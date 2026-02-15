import { NextResponse } from "next/server";
import { getSearchIndex } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET() {
  const index = await getSearchIndex();
  return NextResponse.json(index, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
