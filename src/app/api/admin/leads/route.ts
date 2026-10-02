import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const where: Record<string, unknown> = {};
  if (status && status !== "todos") where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
      { interest: { contains: q } },
    ];
  }
  const leads = await db.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { activities: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    const lead = await db.lead.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        source: body.source || "manual",
        status: body.status || "nuevo",
        interest: body.interest || null,
        notes: body.notes || null,
        campaignId: body.campaignId || null,
        budget: body.budget || null,
        activities: {
          create: {
            type: "sistema",
            content: "Lead creado manualmente desde el CRM",
          },
        },
      },
    });
    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json({ error: "Error al crear lead" }, { status: 400 });
  }
}
