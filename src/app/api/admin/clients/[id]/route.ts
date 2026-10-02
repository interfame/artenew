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
    for (const key of ["name", "phone", "email", "address", "cuit", "type", "notes"]) {
      if (body[key] !== undefined) data[key] = body[key] === "" ? null : body[key];
    }
    const client = await db.client.update({ where: { id }, data });
    return NextResponse.json({ client });
  } catch {
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    await db.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar cliente" }, { status: 400 });
  }
}
