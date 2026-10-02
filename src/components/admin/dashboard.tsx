"use client";

import { useEffect, useState } from "react";
import { api, formatARS, formatDate } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  DollarSign,
  Megaphone,
  Bot,
  Mail,
  Package,
  MessageSquare,
  AlertTriangle,
  Activity,
} from "lucide-react";

interface DashboardData {
  kpis: {
    leadsNuevos: number;
    totalLeads: number;
    totalClientes: number;
    facturadoMes: number;
    facturadoTotal: number;
    porCobrar: number;
    obrasGanadas: number;
    campaniasActivas: number;
    gastoPublicitario: number;
    presupuestoPublicitario: number;
    productosBajoStock: number;
    conversacionesBot: number;
    mensajesBot: number;
    postsProgramados: number;
    emailsEnviados: number;
    whatsappSinLeer: number;
  };
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  revenueByMonth: { month: string; total: number }[];
  lowStock: { name: string; stock: number; minStock: number; sku: string }[];
  recentLeads: { id: string; name: string; interest: string | null; status: string; source: string; createdAt: string }[];
  activities: { id: string; type: string; content: string; createdAt: string }[];
  posts: { id: string; content: string; status: string; platform: string; aiGenerated: boolean }[];
  upcomingInvoices: { id: string; number: string; clientName: string; total: number; status: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  nuevo: "bg-[#f5d000] text-black",
  contactado: "bg-[#a3a3a3] text-black",
  presupuesto: "bg-purple-400 text-black",
  negociacion: "bg-orange-400 text-black",
  ganado: "bg-green-400 text-black",
  perdido: "bg-red-400 text-white",
};

const SOURCE_LABELS: Record<string, string> = {
  web: "Formulario Web",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  telefono: "Teléfono",
  referido: "Referido",
  manual: "Manual",
};

export default function Dashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api<DashboardData>("/api/admin/dashboard").then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { kpis } = data;
  const maxRevenue = Math.max(...data.revenueByMonth.map((r) => r.total), 1);
  const pubProgress = kpis.presupuestoPublicitario
    ? (kpis.gastoPublicitario / kpis.presupuestoPublicitario) * 100
    : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-display text-4xl text-white">Panel de Control</h1>
        <p className="text-sm text-muted-foreground">Resumen general de ArteDur · {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <DollarSign className="h-5 w-5 text-[#f5d000]" />
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Mes actual</span>
          </div>
          <p className="mt-3 font-display text-3xl text-white">{formatARS(kpis.facturadoMes)}</p>
          <p className="text-xs text-muted-foreground">Facturación del mes</p>
        </div>
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <Users className="h-5 w-5 text-[#f5d000]" />
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">CRM</span>
          </div>
          <p className="mt-3 font-display text-3xl text-white">{kpis.leadsNuevos}</p>
          <p className="text-xs text-muted-foreground">Leads nuevos de {kpis.totalLeads} totales</p>
        </div>
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-[#f5d000]" />
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Obras</span>
          </div>
          <p className="mt-3 font-display text-3xl text-white">{kpis.obrasGanadas}</p>
          <p className="text-xs text-muted-foreground">{kpis.totalClientes} clientes activos</p>
        </div>
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <div className="flex items-center justify-between">
            <DollarSign className="h-5 w-5 text-red-400" />
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Cobranza</span>
          </div>
          <p className="mt-3 font-display text-3xl text-white">{formatARS(kpis.porCobrar)}</p>
          <p className="text-xs text-muted-foreground">Pendiente de cobro</p>
        </div>
      </div>

      {/* Automatizaciones */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button onClick={() => onNavigate("whatsapp")} className="border border-[#25D366]/30 bg-[#25D366]/5 p-5 text-left transition-colors hover:bg-[#25D366]/10">
          <div className="flex items-center justify-between">
            <Bot className="h-5 w-5 text-[#25D366]" />
            {kpis.whatsappSinLeer > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#25D366] px-1 text-[10px] font-bold text-white">
                {kpis.whatsappSinLeer}
              </span>
            )}
          </div>
          <p className="mt-3 font-display text-2xl text-white">{kpis.conversacionesBot} chats</p>
          <p className="text-xs text-muted-foreground">{kpis.mensajesBot} respuestas automáticas del bot</p>
        </button>
        <button onClick={() => onNavigate("marketing")} className="border border-[#2b2b2b] bg-[#141414] p-5 text-left transition-colors hover:border-[#f5d000]">
          <div className="flex items-center justify-between">
            <Activity className="h-5 w-5 text-[#f5d000]" />
          </div>
          <p className="mt-3 font-display text-2xl text-white">{kpis.postsProgramados}</p>
          <p className="text-xs text-muted-foreground">Posts programados en redes</p>
        </button>
        <button onClick={() => onNavigate("emails")} className="border border-[#2b2b2b] bg-[#141414] p-5 text-left transition-colors hover:border-[#f5d000]">
          <div className="flex items-center justify-between">
            <Mail className="h-5 w-5 text-[#f5d000]" />
          </div>
          <p className="mt-3 font-display text-2xl text-white">{kpis.emailsEnviados}</p>
          <p className="text-xs text-muted-foreground">Emails automáticos enviados</p>
        </button>
        <button onClick={() => onNavigate("campanias")} className="border border-[#2b2b2b] bg-[#141414] p-5 text-left transition-colors hover:border-[#f5d000]">
          <div className="flex items-center justify-between">
            <Megaphone className="h-5 w-5 text-[#f5d000]" />
          </div>
          <p className="mt-3 font-display text-2xl text-white">{kpis.campaniasActivas} activas</p>
          <p className="text-xs text-muted-foreground">{formatARS(kpis.gastoPublicitario)} invertido</p>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline */}
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <h3 className="mb-4 font-display text-2xl text-white">Pipeline de Ventas</h3>
          <div className="space-y-3">
            {Object.entries(data.leadsByStatus).map(([status, count]) => {
              const pct = data.totalLeads ? (count / data.totalLeads) * 100 : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 capitalize">
                      <span className={`h-2.5 w-2.5 rounded-sm ${STATUS_COLORS[status] || "bg-gray-500"}`} />
                      <span className="capitalize text-[#ededed]/80">{status}</span>
                    </span>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <h3 className="mb-4 font-display text-2xl text-white">Facturación 6 meses</h3>
          <div className="flex h-40 items-end gap-2">
            {data.revenueByMonth.map((r) => (
              <div key={r.month} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-[#d4b200] to-[#f5d000] transition-all"
                  style={{ height: `${Math.max((r.total / maxRevenue) * 130, 4)}px` }}
                  title={formatARS(r.total)}
                />
                <span className="text-[10px] text-muted-foreground capitalize">{r.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[#2b2b2b] pt-3 text-xs">
            <span className="text-muted-foreground">Total facturado (pagado)</span>
            <span className="font-bold text-[#f5d000]">{formatARS(kpis.facturadoTotal)}</span>
          </div>
        </div>

        {/* Publicidad */}
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <h3 className="mb-4 font-display text-2xl text-white">Publicidad</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Gasto / Presupuesto</span>
                <span className="font-bold text-white">
                  {formatARS(kpis.gastoPublicitario)} / {formatARS(kpis.presupuestoPublicitario)}
                </span>
              </div>
              <Progress value={pubProgress} className="h-2" />
            </div>
            <div>
              <p className="mb-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">Leads por origen</p>
              <div className="space-y-1.5">
                {Object.entries(data.leadsBySource)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, count]) => (
                    <div key={src} className="flex items-center justify-between text-xs">
                      <span className="text-[#ededed]/70">{SOURCE_LABELS[src] || src}</span>
                      <span className="font-bold text-[#f5d000]">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent leads */}
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-2xl text-white">Leads Recientes</h3>
            <button onClick={() => onNavigate("crm")} className="text-xs font-bold text-[#f5d000] hover:underline">
              Ver todos →
            </button>
          </div>
          <div className="space-y-2.5">
            {data.recentLeads.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 border border-[#2b2b2b] bg-[#0a0a0a] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{l.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {l.interest || "Consulta general"} · {SOURCE_LABELS[l.source] || l.source}
                  </p>
                </div>
                <span className={`shrink-0 px-2 py-1 text-[10px] font-bold uppercase ${STATUS_COLORS[l.status] || "bg-gray-500"}`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="border border-[#2b2b2b] bg-[#141414] p-5">
          <h3 className="mb-4 font-display text-2xl text-white">Actividad Reciente</h3>
          <div className="custom-scrollbar max-h-72 space-y-3 overflow-y-auto pr-2">
            {data.activities.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e]">
                  {a.type === "sistema" ? <Bot className="h-3.5 w-3.5 text-[#f5d000]" /> : a.type === "email" ? <Mail className="h-3.5 w-3.5 text-[#f5d000]" /> : <MessageSquare className="h-3.5 w-3.5 text-[#f5d000]" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#ededed]/85">{a.content}</p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(a.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {data.lowStock.length > 0 && (
        <div className="border border-orange-400/30 bg-orange-400/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="font-display text-xl text-orange-400">Stock bajo: {kpis.productosBajoStock} productos</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.lowStock.map((p) => (
              <span key={p.sku} className="flex items-center gap-2 border border-orange-400/30 bg-[#141414] px-3 py-1.5 text-xs text-[#ededed]/80">
                <Package className="h-3.5 w-3.5 text-orange-400" />
                {p.name}: <strong className="text-white">{p.stock}</strong> (min {p.minStock})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
