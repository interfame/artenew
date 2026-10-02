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
    for (const key of ["name", "category", "brand", "unit", "sku"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.cost !== undefined) data.cost = Number(body.cost);
    if (body.stock !== undefined) data.stock = parseInt(body.stock);
    if (body.minStock !== undefined) data.minStock = parseInt(body.minStock);
    if (body.active !== undefined) data.active = body.active;
    const product = await db.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 400 });
  }
}
