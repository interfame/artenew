import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status && status !== "todos" ? { status } : {};
  const invoices = await db.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;
  try {
    const body = await req.json();
    const items = body.items || [];
    const subtotal = items.reduce(
      (s: number, it: { price: number; qty: number }) => s + Number(it.price) * Number(it.qty),
      0
    );
    const ivaRate = body.type === "A" ? 0.21 : 0.21;
    const iva = Math.round(subtotal * ivaRate * 100) / 100;
    const total = Math.round((subtotal + iva) * 100) / 100;

    // Generate next invoice number
    const lastInvoice = await db.invoice.findFirst({
      orderBy: { number: "desc" },
    });
    let nextNumber = 1;
    if (lastInvoice) {
      const parts = lastInvoice.number.split("-");
      nextNumber = parseInt(parts[1]) + 1;
    }
    const number = `0001-${String(nextNumber).padStart(8, "0")}`;

    const invoice = await db.invoice.create({
      data: {
        number,
        type: body.type || "B",
        clientId: body.clientId || null,
        leadId: body.leadId || null,
        clientName: body.clientName,
        items: JSON.stringify(items),
        subtotal,
        iva,
        total,
        status: body.status || "pendiente",
        paymentMethod: body.paymentMethod || null,
        notes: body.notes || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        paidAt: body.status === "pagada" ? new Date() : null,
      },
    });
    return NextResponse.json({ invoice });
  } catch {
    return NextResponse.json({ error: "Error al crear factura" }, { status: 400 });
  }
}
