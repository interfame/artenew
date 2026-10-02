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
    if (body.status) {
      data.status = body.status;
      data.paidAt = body.status === "pagada" ? new Date() : null;
    }
    if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.dueDate) data.dueDate = new Date(body.dueDate);
    const invoice = await db.invoice.update({ where: { id }, data });
    return NextResponse.json({ invoice });
  } catch {
    return NextResponse.json({ error: "Error al actualizar factura" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    await db.invoice.update({ where: { id }, data: { status: "anulada" } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al anular factura" }, { status: 400 });
  }
}
