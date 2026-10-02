import ZAI from "z-ai-web-dev-sdk";

export const ARTEDUR_CONTEXT = `Eres el asistente de IA de ARTE DUR, una empresa argentina con más de 25 años de experiencia en construcción en seco en Buenos Aires (CABA y GBA).

DATOS DE LA EMPRESA:
- Nombre: ARTE DUR
- Servicios: Construcción en seco (Durlock y Knauf), tabiques, cielorraso desmontable, cielorraso de yeso, cielorraso PVC, revestimientos, pisos (cerámicos, porcelanato, vinílicos, flotantes, madera, microcemento), pintura interior/exterior, reformas, venta mayorista y minorista de materiales.
- Direcciones: Av. Castañares 2123 (CABA) y Av. Rivadavia 10514 (CABA)
- Email: artedur@yahoo.com.ar
- Teléfonos: 11-6691-9404, 15-6255-2131, 15-2252-5222
- Horarios: Lunes a Viernes 8:00-17:00, Sábados 8:00-13:00
- Instagram: @artedur.ar | Facebook: artedur
- Web: artedur.com
- Stats: +25 años de experiencia, +500 obras realizadas, 100% garantía

PRECIOS ORIENTATIVOS (ARS, pueden variar):
- Cielorraso desmontable: desde $26.000/m2 instalado
- Cielorraso de yeso: desde $28.000/m2
- Tabique Durlock simple: desde $32.000/m2
- Tabique Durlock doble placa con aislación: desde $38.000/m2
- Cielorraso PVC: desde $24.000/m2
- Piso vinílico SPC colocado: desde $30.000/m2
- Pintura: desde $8.500/m2 según superficie
- Placa Durlock STD 9.5mm: $12.500 c/u
- Presupuestos sin cargo, visita técnica sin cargo en CABA y GBA.

TONO: argentino, cercano y profesional. Usá "vos". Emojis moderados. Respuestas breves y útiles que inviten a la acción (pedir presupuesto, coordinar visita).`;

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function chatComplete(
  systemPrompt: string,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<string> {
  const zai = await getZAI();
  const messages: { role: "assistant" | "user"; content: string }[] = [
    { role: "assistant", content: systemPrompt },
    ...history.slice(-10).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: "disabled" },
  });
  return completion.choices[0]?.message?.content || "";
}

/** Robustly extract ASUNTO (subject) and CUERPO (body) from AI email output */
export function parseEmailContent(content: string): { subject: string; body: string } {
  const subjectMatch =
    content.match(/ASUNTO:\s*(.+)/i)?.[1]?.trim() ||
    content.match(/Subject:\s*(.+)/i)?.[1]?.trim() ||
    "Consulta de ArteDur";
  let body = "";
  const cuerpoMatch = content.match(/CUERPO:\s*([\s\S]+)/i);
  if (cuerpoMatch) {
    body = cuerpoMatch[1];
  } else {
    // Fallback: take everything, strip subject lines
    body = content;
  }
  body = body
    .split("\n")
    .filter((line) => !/^\s*ASUNTO:\s*/i.test(line) && !/^\s*Subject:\s*/i.test(line))
    .join("\n")
    .trim();
  return { subject: subjectMatch, body };
}
