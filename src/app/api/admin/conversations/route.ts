import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    return NextResponse.json({ conversation });
  }
  const conversations = await db.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    // New manual conversation
    if (body.action === "create") {
      const conversation = await db.conversation.create({
        data: {
          contactName: body.contactName,
          phone: body.phone,
          status: "abierta",
        },
      });
      return NextResponse.json({ conversation });
    }
    // Agent sends message
    const conversationId = body.conversationId;
    const message = await db.message.create({
      data: {
        conversationId,
        role: "agent",
        content: body.content,
        aiGenerated: false,
      },
    });
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), unread: 0 },
    });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.status) data.status = body.status;
    if (body.markRead) data.unread = 0;
    const conversation = await db.conversation.update({ where: { id }, data });
    return NextResponse.json({ conversation });
  } catch {
    return NextResponse.json({ error: "Error al actualizar conversación" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  try {
    await db.message.deleteMany({ where: { conversationId: id } });
    await db.conversation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar conversación" }, { status: 400 });
  }
}
