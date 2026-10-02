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
    for (const key of ["name", "channel", "objective", "status", "headline", "body", "cta", "audience"]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.budget !== undefined) data.budget = Number(body.budget);
    if (body.spent !== undefined) data.spent = Number(body.spent);
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    if (body.results) data.results = JSON.stringify(body.results);
    const campaign = await db.campaign.update({ where: { id }, data });
    return NextResponse.json({ campaign });
  } catch {
    return NextResponse.json({ error: "Error al actualizar campaña" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    await db.campaign.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar campaña" }, { status: 400 });
  }
}
