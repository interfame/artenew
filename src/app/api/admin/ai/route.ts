import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";
import { chatComplete, ARTEDUR_CONTEXT, parseEmailContent } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "generate-post") {
      const prompt = `Generá un post de Facebook para ARTE DUR sobre: ${body.topic}.
Requisitos:
- Español argentino, tono cercano y profesional, usá "vos"
- Entre 50 y 120 palabras
- Incluí 2-4 emojis relevantes
- Terminá con un llamado a la acción (presupuesto gratis, WhatsApp 11-6691-9404)
- Separá el contenido del post con una línea que diga exactamente "HASHTAGS:" seguido de 4-6 hashtags relevantes sin espacios (ej: #Durlock #ConstrucciónEnSeco)

Respondé SOLO con el contenido, sin explicaciones.`;
      const content = await chatComplete(ARTEDUR_CONTEXT, prompt);
      const [post, hashtags] = content.split("HASHTAGS:");
      return NextResponse.json({
        content: (post || content).trim(),
        hashtags: (hashtags || "").trim(),
      });
    }

    if (action === "generate-campaign") {
      const prompt = `Creá la copy para una campaña publicitaria de ARTE DUR.
Datos: objetivo=${body.objective}, canal=${body.channel}, servicio/promoción=${body.topic}, público=${body.audience || "CABA y GBA"}.
Formato de respuesta EXACTO (sin explicaciones adicionales):
TITULAR: [máximo 40 caracteres, impactante, puede incluir 1 emoji]
CUERPO: [máximo 125 caracteres, beneficio principal + urgencia]
CTA: [llamada a la acción en máximo 25 caracteres]`;
      const content = await chatComplete(ARTEDUR_CONTEXT, prompt);
      const headline = content.match(/TITULAR:\s*(.+)/)?.[1]?.trim() || "";
      const bodyText = content.match(/CUERPO:\s*(.+)/)?.[1]?.trim() || "";
      const cta = content.match(/CTA:\s*(.+)/)?.[1]?.trim() || "Consultar ahora";
      return NextResponse.json({ headline, body: bodyText, cta });
    }

    if (action === "generate-email") {
      const prompt = `Redactá un email profesional para ARTE DUR.
Contexto: ${body.context}
Destinatario: ${body.recipient || "cliente potencial"}
Tipo: ${body.emailType || "seguimiento"}

Formato de respuesta EXACTO (sin explicaciones):
ASUNTO: [asunto atractivo de máximo 60 caracteres]
CUERPO: [email de máximo 200 palabras, en español argentino, saludo con nombre si se conoce, cuerpo claro con beneficios, cierre con firma "Equipo ArteDur"]`;
      const content = await chatComplete(ARTEDUR_CONTEXT, prompt);
      const { subject, body: emailBody } = parseEmailContent(content);
      return NextResponse.json({ subject, body: emailBody });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json(
      { error: "Error al generar contenido con IA. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
