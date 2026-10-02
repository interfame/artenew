import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatComplete, ARTEDUR_CONTEXT } from "@/lib/ai";

// Public endpoint: simulated WhatsApp webhook.
// Receives incoming message, stores it, generates AI bot reply, stores it too.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, contactName, message } = body;
    if (!phone || !message) {
      return NextResponse.json({ error: "phone y message requeridos" }, { status: 400 });
    }

    // Find or create conversation
    let conversation = await db.conversation.findFirst({
      where: { phone },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          phone,
          contactName: contactName || phone,
          status: "bot",
          messages: { create: { role: "user", content: message, aiGenerated: false } },
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    } else {
      await db.message.create({
        data: { conversationId: conversation.id, role: "user", content: message, aiGenerated: false },
      });
      await db.conversation.update({
        where: { id: conversation.id },
        data: { unread: { increment: 1 }, lastMessageAt: new Date() },
      });
    }

    // Generate AI reply with history
    const history = conversation.messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));
    let reply = "";
    try {
      reply = await chatComplete(
        `${ARTEDUR_CONTEXT}\n\nEstás respondiendo por WhatsApp como el bot de ventas de ArteDur. El cliente se llama ${contactName || "amigo/a"}. Respondé en máximo 3 oraciones, cordial y útil. Si la consulta requiere un precio exacto o visita, ofrecé coordinar. Nunca inventes precios que no estén en la lista.`,
        message,
        history
      );
    } catch {
      reply =
        "¡Hola! Gracias por escribir a ArteDur 🏗️ Un asesor te va a responder a la brevedad en horario comercial (Lun-Vie 8-17, Sáb 8-13). Para presupuesto gratis dejános el detalle de tu consulta.";
    }

    await db.message.create({
      data: { conversationId: conversation.id, role: "bot", content: reply, aiGenerated: true },
    });
    await db.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ reply, conversationId: conversation.id });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Error procesando mensaje" }, { status: 500 });
  }
}
