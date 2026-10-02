import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const posts = await db.socialPost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    const post = await db.socialPost.create({
      data: {
        platform: body.platform || "facebook",
        content: body.content,
        hashtags: body.hashtags || null,
        imageUrl: body.imageUrl || null,
        status: body.status || "borrador",
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        aiGenerated: body.aiGenerated || false,
      },
    });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Error al crear post" }, { status: 400 });
  }
}
