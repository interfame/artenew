import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const [templates, logs] = await Promise.all([
    db.emailTemplate.findMany({ orderBy: { createdAt: "asc" } }),
    db.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return NextResponse.json({ templates, logs });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    // Send email (simulated) and log it
    if (body.action === "send") {
      const log = await db.emailLog.create({
        data: {
          to: body.to,
          subject: body.subject,
          body: body.body,
          leadId: body.leadId || null,
          campaignId: body.campaignId || null,
          aiGenerated: body.aiGenerated || false,
          status: "enviado",
        },
      });
      if (body.leadId && body.activity) {
        await db.activity.create({
          data: { type: "email", content: body.activity, leadId: body.leadId },
        });
      }
      return NextResponse.json({ log, message: `Email enviado a ${body.to}` });
    }
    // Create template
    const template = await db.emailTemplate.create({
      data: {
        name: body.name,
        subject: body.subject,
        body: body.body,
        category: body.category || "general",
      },
    });
    return NextResponse.json({ template });
  } catch {
    return NextResponse.json({ error: "Error al procesar email" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  try {
    await db.emailTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar plantilla" }, { status: 400 });
  }
}
