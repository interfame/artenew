import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const where = q
    ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] }
    : {};
  const clients = await db.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { invoices: { orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    const client = await db.client.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        cuit: body.cuit || null,
        type: body.type || "particular",
        notes: body.notes || null,
      },
    });
    return NextResponse.json({ client });
  } catch {
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 400 });
  }
}
