"use client";

import { useEffect, useState } from "react";
import { api, formatARS, formatDate } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Megaphone, Loader2, Sparkles, Play, Pause, Square } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  channel: string;
  objective: string;
  status: string;
  budget: number;
  spent: number;
  headline: string | null;
  body: string | null;
  cta: string | null;
  audience: string | null;
  startDate: string | null;
  endDate: string | null;
  results: string;
}

const CHANNEL_ICONS: Record<string, string> = { facebook: "📘", instagram: "📸", google: "🔍", whatsapp: "💬" };
const STATUS_STYLES: Record<string, string> = {
  activa: "border-green-400/50 bg-green-400/10 text-green-300",
  borrador: "border-gray-400/50 bg-gray-400/10 text-gray-300",
  pausada: "border-orange-400/50 bg-orange-400/10 text-orange-300",
  finalizada: "border-red-400/50 bg-red-400/10 text-red-300",
};

const emptyForm = { name: "", channel: "facebook", objective: "leads", budget: "", audience: "", topic: "" };

export default function Campaigns() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function load() {
    const data = await api<{ campaigns: Campaign[] }>("/api/admin/campaigns");
    setCampaigns(data.campaigns);
  }

  useEffect(() => {
    load().catch(() => toast({ title: "Error al cargar campañas", variant: "destructive" }));
  }, []);

  async function generateCopy() {
    if (!form.topic.trim()) {
      toast({ title: "Contale a la IA qué querés promocionar", description: "Completá el campo 'Servicio o promoción'", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const ai = await api<{ headline: string; body: string; cta: string }>("/api/admin/ai", {
        method: "POST",
        body: { action: "generate-campaign", channel: form.channel, objective: form.objective, topic: form.topic, audience: form.audience },
      });
      setForm((f) => ({ ...f, ...ai }));
      toast({ title: "✨ Copy generada con IA", description: "Revisá el titular y el cuerpo antes de lanzar" });
    } catch {
      toast({ title: "Error al generar con IA", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function createCampaign() {
    if (!form.name.trim()) {
      toast({ title: "Poné un nombre a la campaña", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/campaigns", {
        method: "POST",
        body: { ...form, budget: Number(form.budget) || 0, status: form.headline ? "activa" : "borrador", startDate: new Date().toISOString() },
      });
      toast({ title: form.headline ? "🚀 Campaña creada y activada" : "Campaña creada como borrador" });
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch {
      toast({ title: "Error al crear campaña", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(c: Campaign, status: string) {
    try {
      await api(`/api/admin/campaigns/${c.id}`, { method: "PUT", body: { status } });
      toast({ title: `Campaña ${status}` });
      load();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function deleteCampaign(id: string) {
    try {
      await api(`/api/admin/campaigns/${id}`, { method: "DELETE" });
      toast({ title: "Campaña eliminada" });
      load();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Campañas Publicitarias</h1>
          <p className="text-sm text-muted-foreground">Creá campañas con copy generada por IA y seguí su rendimiento</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
          <Plus className="mr-1 h-4 w-4" /> Nueva Campaña
        </Button>
      </div>

      {!campaigns ? (
        <div className="grid gap-4 lg:grid-cols-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : campaigns.length === 0 ? (
        <div className="border border-dashed border-[#2b2b2b] p-12 text-center text-muted-foreground">
          No hay campañas todavía. Creá la primera con ayuda de la IA.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((c) => {
            const results = JSON.parse(c.results || "{}") as { impressions?: number; clicks?: number; leads?: number; cpl?: number };
            const pct = c.budget ? Math.min((c.spent / c.budget) * 100, 100) : 0;
            return (
              <div key={c.id} className="border border-[#2b2b2b] bg-[#141414] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CHANNEL_ICONS[c.channel] || "📣"}</span>
                    <div>
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{c.channel} · objetivo: {c.objective}</p>
                    </div>
                  </div>
                  <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[c.status] || ""}`}>{c.status}</span>
                </div>

                {c.headline && (
                  <div className="mt-3 rounded-md border border-[#2b2b2b] bg-[#0a0a0a] p-3">
                    <p className="text-sm font-bold text-[#f5d000]">{c.headline}</p>
                    <p className="mt-1 text-xs text-[#ededed]/70">{c.body}</p>
                    <p className="mt-2 inline-block rounded bg-[#1877f2]/20 px-2 py-0.5 text-[10px] font-bold text-[#1877f2]">{c.cta}</p>
                  </div>
                )}

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Gasto diario</span>
                    <span className="text-white">{formatARS(c.spent)} / {formatARS(c.budget)}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded bg-[#0a0a0a] py-2">
                    <p className="text-xs font-bold text-white">{results.impressions ? (results.impressions / 1000).toFixed(1) + "k" : "—"}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Impresiones</p>
                  </div>
                  <div className="rounded bg-[#0a0a0a] py-2">
                    <p className="text-xs font-bold text-white">{results.clicks || "—"}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Clics</p>
                  </div>
                  <div className="rounded bg-[#0a0a0a] py-2">
                    <p className="text-xs font-bold text-[#f5d000]">{results.leads || "—"}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">Leads</p>
                  </div>
                  <div className="rounded bg-[#0a0a0a] py-2">
                    <p className="text-xs font-bold text-white">{results.cpl ? formatARS(results.cpl) : "—"}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">CPL</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#2b2b2b] pt-3">
                  {c.status === "borrador" && (
                    <Button size="sm" onClick={() => changeStatus(c, "activa")} className="bg-green-500 text-black hover:bg-green-400">
                      <Play className="mr-1 h-3.5 w-3.5" /> Activar
                    </Button>
                  )}
                  {c.status === "activa" && (
                    <Button size="sm" variant="outline" onClick={() => changeStatus(c, "pausada")} className="border-[#2b2b2b]">
                      <Pause className="mr-1 h-3.5 w-3.5" /> Pausar
                    </Button>
                  )}
                  {c.status === "pausada" && (
                    <Button size="sm" onClick={() => changeStatus(c, "activa")} className="bg-green-500 text-black hover:bg-green-400">
                      <Play className="mr-1 h-3.5 w-3.5" /> Reanudar
                    </Button>
                  )}
                  {(c.status === "activa" || c.status === "pausada") && (
                    <Button size="sm" variant="outline" onClick={() => changeStatus(c, "finalizada")} className="border-[#2b2b2b]">
                      <Square className="mr-1 h-3.5 w-3.5" /> Finalizar
                    </Button>
                  )}
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {c.startDate ? `Desde ${formatDate(c.startDate)}` : "Sin fecha"}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => deleteCampaign(c.id)} title="Eliminar">
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto border-[#2b2b2b] bg-[#141414] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-2xl">
              <Megaphone className="h-6 w-6 text-[#f5d000]" /> Nueva Campaña
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nombre de campaña *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Cielorrasos Primavera 2026" className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Canal</Label>
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                <SelectTrigger className="border-[#2b2b2b] bg-[#0a0a0a]"><SelectValue /></SelectTrigger>
                <SelectContent className="border-[#2b2b2b] bg-[#1e1e1e]">
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Objetivo</Label>
              <Select value={form.objective} onValueChange={(v) => setForm({ ...form, objective: v })}>
                <SelectTrigger className="border-[#2b2b2b] bg-[#0a0a0a]"><SelectValue /></SelectTrigger>
                <SelectContent className="border-[#2b2b2b] bg-[#1e1e1e]">
                  <SelectItem value="leads">Generación de leads</SelectItem>
                  <SelectItem value="ventas">Ventas</SelectItem>
                  <SelectItem value="trafico">Tráfico web</SelectItem>
                  <SelectItem value="notoriedad">Notoriedad de marca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Presupuesto total ($)</Label>
              <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Público objetivo</Label>
              <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="Ej: CABA, 30-55 años" className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Servicio o promoción (para la IA) *</Label>
              <div className="flex gap-2">
                <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Ej: 20% OFF en placas Durlock durante junio" className="border-[#2b2b2b] bg-[#0a0a0a]" />
                <Button onClick={generateCopy} disabled={generating} className="shrink-0 border border-[#f5d000] bg-transparent text-[#f5d000] hover:bg-[#f5d000] hover:text-black">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">✨ Genera titular, cuerpo y CTA con IA optimizada para ArteDur</p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Titular (máx 40 car.)</Label>
              <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Cuerpo del anuncio</Label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={2} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>CTA</Label>
              <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} placeholder="Pedir presupuesto" className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createCampaign} disabled={saving} className="w-full bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Crear Campaña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
