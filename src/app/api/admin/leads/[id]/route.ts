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
    for (const key of ["name", "phone", "email", "source", "status", "interest", "notes", "campaignId"]) {
      if (body[key] !== undefined) data[key] = body[key] === "" ? null : body[key];
    }
    if (body.budget !== undefined) data.budget = body.budget ? Number(body.budget) : null;

    const lead = await db.lead.update({ where: { id }, data });

    if (body.activity) {
      await db.activity.create({
        data: { type: body.activityType || "nota", content: body.activity, leadId: id },
      });
    }
    if (body.status) {
      await db.activity.create({
        data: {
          type: "sistema",
          content: `Estado cambiado a: ${body.status}`,
          leadId: id,
        },
      });
    }
    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ error: "Error al actualizar lead" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    await db.activity.deleteMany({ where: { leadId: id } });
    await db.lead.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar lead" }, { status: 400 });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // Convert lead to client
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    const client = await db.client.create({
      data: {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        notes: `Convertido desde CRM. Interés: ${lead.interest || "general"}`,
      },
    });
    await db.lead.update({ where: { id }, data: { status: "ganado" } });
    await db.activity.create({
      data: { type: "sistema", content: "Lead convertido a cliente", leadId: id },
    });
    return NextResponse.json({ client });
  } catch {
    return NextResponse.json({ error: "Error al convertir lead" }, { status: 400 });
  }
}
