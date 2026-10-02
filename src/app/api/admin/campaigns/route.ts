import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const campaigns = await db.campaign.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    const campaign = await db.campaign.create({
      data: {
        name: body.name,
        channel: body.channel || "facebook",
        objective: body.objective || "leads",
        status: body.status || "borrador",
        budget: Number(body.budget) || 0,
        headline: body.headline || null,
        body: body.body || null,
        cta: body.cta || null,
        audience: body.audience || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        results: JSON.stringify(body.results || {}),
      },
    });
    return NextResponse.json({ campaign });
  } catch {
    return NextResponse.json({ error: "Error al crear campaña" }, { status: 400 });
  }
}
