import { NextRequest, NextResponse } from "next/server";
import { getObjectBuffer } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  const filePath = `assets/images/${path.join("/")}`;

  const result = await getObjectBuffer(filePath);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
