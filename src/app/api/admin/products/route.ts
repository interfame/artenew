import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [{ name: { contains: q } }, { sku: { contains: q } }, { brand: { contains: q } }];
  }
  if (category && category !== "todas") where.category = category;
  const products = await db.product.findMany({ where, orderBy: { name: "asc" } });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    const product = await db.product.create({
      data: {
        sku: body.sku || `SKU-${Date.now()}`,
        name: body.name,
        category: body.category || "General",
        brand: body.brand || null,
        unit: body.unit || "unidad",
        price: Number(body.price) || 0,
        cost: Number(body.cost) || 0,
        stock: parseInt(body.stock) || 0,
        minStock: parseInt(body.minStock) || 0,
      },
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Error al crear producto (SKU duplicado?)" }, { status: 400 });
  }
}
