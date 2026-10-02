import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";
import type { TokenPayload } from "@/lib/auth";

export function requireAuth(req: NextRequest): TokenPayload | NextResponse {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return payload;
}

export function isAuthError(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
