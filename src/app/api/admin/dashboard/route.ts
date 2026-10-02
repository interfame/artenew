import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/require-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isAuthError(auth)) return auth;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [leads, clients, products, invoices, campaigns, posts, conversations, activities, emailLogs] =
    await Promise.all([
      db.lead.findMany({ orderBy: { createdAt: "desc" } }),
      db.client.findMany(),
      db.product.findMany(),
      db.invoice.findMany({ orderBy: { createdAt: "desc" } }),
      db.campaign.findMany(),
      db.socialPost.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      db.conversation.findMany({ orderBy: { lastMessageAt: "desc" }, include: { messages: true } }),
      db.activity.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
      db.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
    ]);

  const invoicesThisMonth = invoices.filter((i) => new Date(i.createdAt) >= startOfMonth);
  const paidInvoices = invoices.filter((i) => i.status === "pagada");
  const pendingInvoices = invoices.filter((i) => i.status === "pendiente");

  const facturadoMes = invoicesThisMonth.reduce((sum, i) => sum + i.total, 0);
  const facturadoTotal = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const porCobrar = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

  // Leads by status
  const leadsByStatus = {
    nuevo: leads.filter((l) => l.status === "nuevo").length,
    contactado: leads.filter((l) => l.status === "contactado").length,
    presupuesto: leads.filter((l) => l.status === "presupuesto").length,
    negociacion: leads.filter((l) => l.status === "negociacion").length,
    ganado: leads.filter((l) => l.status === "ganado").length,
    perdido: leads.filter((l) => l.status === "perdido").length,
  };

  // Leads by source
  const leadsBySource: Record<string, number> = {};
  for (const l of leads) {
    leadsBySource[l.source] = (leadsBySource[l.source] || 0) + 1;
  }

  // Revenue last 6 months
  const revenueByMonth: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const total = invoices
      .filter((inv) => {
        const created = new Date(inv.createdAt);
        return created >= d && created < next && inv.status !== "anulada";
      })
      .reduce((sum, inv) => sum + inv.total, 0);
    revenueByMonth.push({
      month: d.toLocaleDateString("es-AR", { month: "short" }),
      total,
    });
  }

  // Low stock products
  const lowStock = products.filter((p) => p.stock <= p.minStock);

  // Campaign stats
  const activeCampaigns = campaigns.filter((c) => c.status === "activa");
  const campaignSpend = activeCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const campaignBudget = activeCampaigns.reduce((sum, c) => sum + c.budget, 0);

  // Automation stats
  const botMessages = conversations.reduce(
    (sum, c) => sum + c.messages.filter((m) => m.aiGenerated).length,
    0
  );
  const scheduledPosts = posts.filter((p) => p.status === "programado").length;
  const unreadWhatsapp = conversations.reduce((sum, c) => sum + c.unread, 0);

  return NextResponse.json({
    kpis: {
      leadsNuevos: leadsByStatus.nuevo,
      totalLeads: leads.length,
      totalClientes: clients.length,
      facturadoMes,
      facturadoTotal,
      porCobrar,
      obrasGanadas: leadsByStatus.ganado,
      campaniasActivas: activeCampaigns.length,
      gastoPublicitario: campaignSpend,
      presupuestoPublicitario: campaignBudget,
      productosBajoStock: lowStock.length,
      conversacionesBot: conversations.filter((c) => c.status === "bot").length,
      mensajesBot: botMessages,
      postsProgramados: scheduledPosts,
      emailsEnviados: emailLogs.length,
      whatsappSinLeer: unreadWhatsapp,
    },
    leadsByStatus,
    leadsBySource,
    revenueByMonth,
    lowStock: lowStock.slice(0, 5).map((p) => ({
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      sku: p.sku,
    })),
    recentLeads: leads.slice(0, 6).map((l) => ({
      id: l.id,
      name: l.name,
      interest: l.interest,
      status: l.status,
      source: l.source,
      createdAt: l.createdAt,
    })),
    activities,
    posts: posts.slice(0, 5),
    upcomingInvoices: pendingInvoices.slice(0, 5).map((i) => ({
      id: i.id,
      number: i.number,
      clientName: i.clientName,
      total: i.total,
      dueDate: i.dueDate,
      status: i.status,
    })),
  });
}
