import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    for (const key of ["platform", "content", "hashtags", "imageUrl", "status"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
    if (body.status === "publicado") data.publishedAt = new Date();
    const post = await db.socialPost.update({ where: { id }, data });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Error al actualizar post" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    await db.socialPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar post" }, { status: 400 });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Publish post now (simulated bot posting to Facebook)
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    const post = await db.socialPost.update({
      where: { id },
      data: { status: "publicado", publishedAt: new Date() },
    });
    return NextResponse.json({ post, message: "Post publicado en Facebook" });
  } catch {
    return NextResponse.json({ error: "Error al publicar post" }, { status: 400 });
  }
}
