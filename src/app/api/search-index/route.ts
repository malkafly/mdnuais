import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search";

export async function GET() {
  const index = await buildSearchIndex();
  return NextResponse.json(index);
}
