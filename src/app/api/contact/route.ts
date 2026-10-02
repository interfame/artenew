import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatComplete, ARTEDUR_CONTEXT, parseEmailContent } from "@/lib/ai";

// Public contact form: creates lead + activity + auto AI-drafted email reply
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, message, interest } = body;
    if (!name || !message) {
      return NextResponse.json({ error: "Nombre y mensaje requeridos" }, { status: 400 });
    }

    // Create lead
    const lead = await db.lead.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        source: "web",
        status: "nuevo",
        interest: interest || null,
        notes: message,
        activities: {
          create: {
            type: "sistema",
            content: `Consulta web: ${message.slice(0, 200)}`,
          },
        },
      },
    });

    // AI-drafted auto-reply email (logged for the CRM team to send/approve)
    let aiReply = null;
    if (email) {
      try {
        const content = await chatComplete(
          ARTEDUR_CONTEXT,
          `Un cliente llamado ${name} envió esta consulta desde el formulario web:
"${message}"
${interest ? `Servicio de interés: ${interest}` : ""}

Redactá un email de respuesta inmediata que:
1. Agradezca la consulta
2. Dé una primera orientación sobre el servicio consultado (si menciona un servicio concreto)
3. Invite a coordinar visita técnica sin cargo o enviar detalles por WhatsApp al 11-6691-9404

Formato EXACTO:
ASUNTO: [máximo 60 caracteres]
CUERPO: [máximo 150 palabras, español argentino, firmado "Equipo ArteDur"]`,
          []
        );
        const { subject, body: emailBody } = parseEmailContent(content);
        aiReply = { subject, body: emailBody };
        await db.emailLog.create({
          data: {
            to: email,
            subject,
            body: emailBody,
            leadId: lead.id,
            aiGenerated: true,
            status: "enviado",
          },
        });
      } catch (e) {
        console.error("AI email failed:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      aiReply,
      message: "¡Gracias! Te contactaremos a la brevedad.",
    });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json({ error: "Error al enviar la consulta" }, { status: 500 });
  }
}
