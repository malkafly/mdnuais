import { NextRequest, NextResponse } from "next/server";
import { validateToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { token } = (await request.json()) as { token: string };

  if (!validateToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await setAuthCookie();
  return NextResponse.json({ success: true });
}
