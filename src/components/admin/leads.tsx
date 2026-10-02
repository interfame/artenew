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
import { Plus, Search, Trash2, Phone, Mail, StickyNote, UserCheck, Loader2, RefreshCw } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}
interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  status: string;
  interest: string | null;
  notes: string | null;
  budget: number | null;
  createdAt: string;
  activities: Activity[];
}

const STATUSES = ["nuevo", "contactado", "presupuesto", "negociacion", "ganado", "perdido"];
const SOURCES = ["web", "whatsapp", "facebook", "instagram", "telefono", "referido", "manual"];

const STATUS_STYLES: Record<string, string> = {
  nuevo: "border-[#f5d000]/50 bg-[#f5d000]/10 text-[#f5d000]",
  contactado: "border-gray-400/50 bg-gray-400/10 text-gray-300",
  presupuesto: "border-purple-400/50 bg-purple-400/10 text-purple-300",
  negociacion: "border-orange-400/50 bg-orange-400/10 text-orange-300",
  ganado: "border-green-400/50 bg-green-400/10 text-green-300",
  perdido: "border-red-400/50 bg-red-400/10 text-red-300",
};

const emptyForm = { name: "", phone: "", email: "", source: "manual", interest: "", notes: "", budget: "" };

export default function LeadsCRM() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Lead | null>(null);
  const [noteText, setNoteText] = useState("");

  async function load() {
    setLeads(null);
    const params = new URLSearchParams();
    if (statusFilter !== "todos") params.set("status", statusFilter);
    if (query.trim()) params.set("q", query.trim());
    try {
      const data = await api<{ leads: Lead[] }>(`/api/admin/leads?${params}`);
      setLeads(data.leads);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los leads", variant: "destructive" });
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function createLead() {
    if (!form.name.trim()) {
      toast({ title: "El nombre es obligatorio", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/leads", { method: "POST", body: { ...form, budget: form.budget ? Number(form.budget) : null } });
      toast({ title: "Lead creado ✅" });
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(lead: Lead, status: string) {
    try {
      await api(`/api/admin/leads/${lead.id}`, { method: "PUT", body: { status } });
      toast({ title: `Estado actualizado: ${status}` });
      load();
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    }
  }

  async function deleteLead(id: string) {
    try {
      await api(`/api/admin/leads/${id}`, { method: "DELETE" });
      toast({ title: "Lead eliminado" });
      setDetail(null);
      load();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  }

  async function convertLead(lead: Lead) {
    try {
      await api(`/api/admin/leads/${lead.id}`, { method: "POST" });
      toast({ title: "🎉 Lead convertido a cliente" });
      setDetail(null);
      load();
    } catch {
      toast({ title: "Error al convertir", variant: "destructive" });
    }
  }

  async function sendFollowUp(lead: Lead) {
    try {
      toast({ title: "🤖 Generando email con IA...", description: "Creando seguimiento personalizado" });
      const ai = await api<{ subject: string; body: string }>("/api/admin/ai", {
        method: "POST",
        body: {
          action: "generate-email",
          emailType: "seguimiento post-presupuesto",
          recipient: lead.name,
          context: `Cliente interesado en: ${lead.interest || "servicios de construcción en seco"}. Notas: ${lead.notes || "sin notas"}. Estado actual: ${lead.status}.`,
        },
      });
      await api("/api/admin/emails", {
        method: "POST",
        body: {
          action: "send",
          to: lead.email || "sin-email@artedur.com",
          subject: ai.subject,
          body: ai.body,
          leadId: lead.id,
          aiGenerated: true,
          activity: `Email de seguimiento con IA enviado a ${lead.name}`,
        },
      });
      toast({ title: "📧 Email enviado", description: ai.subject });
      load();
    } catch {
      toast({ title: "Error al enviar email", variant: "destructive" });
    }
  }

  async function addNote() {
    if (!detail || !noteText.trim()) return;
    try {
      await api(`/api/admin/leads/${detail.id}`, { method: "PUT", body: { activity: noteText, activityType: "nota" } });
      setNoteText("");
      toast({ title: "Nota agregada" });
      load();
      const updated = await api<{ lead: Lead }>(`/api/admin/leads?q=${encodeURIComponent(detail.name)}`);
      const found = updated.leads.find((l) => l.id === detail.id);
      if (found) setDetail(found);
    } catch {
      toast({ title: "Error al agregar nota", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">CRM · Leads</h1>
          <p className="text-sm text-muted-foreground">Gestioná tus consultas y el pipeline de ventas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} className="border-[#2b2b2b]">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
            <Plus className="mr-1 h-4 w-4" /> Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Buscar por nombre, teléfono, email..."
            className="border-[#2b2b2b] bg-[#141414] pl-10 text-white"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["todos", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`border px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                statusFilter === s
                  ? "border-[#f5d000] bg-[#f5d000] text-black"
                  : "border-[#2b2b2b] bg-[#141414] text-[#ededed]/70 hover:border-[#f5d000]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {!leads ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="border border-dashed border-[#2b2b2b] p-12 text-center text-muted-foreground">
          No hay leads con estos filtros.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((l) => (
            <div key={l.id} className="cursor-pointer border border-[#2b2b2b] bg-[#141414] p-4 transition-colors hover:border-[#f5d000]" onClick={() => setDetail(l)}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.phone || l.email || "Sin contacto"}</p>
                </div>
                <span className={`shrink-0 border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[l.status] || ""}`}>
                  {l.status}
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-sm text-[#ededed]/70">{l.interest || "Consulta general"}</p>
              <div className="mt-3 flex items-center justify-between border-t border-[#2b2b2b] pt-2.5 text-[11px] text-muted-foreground">
                <span className="capitalize">origen: {l.source}</span>
                <span>{formatDate(l.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-[#2b2b2b] bg-[#141414] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Nuevo Lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Origen</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger className="border-[#2b2b2b] bg-[#0a0a0a]"><SelectValue /></SelectTrigger>
                <SelectContent className="border-[#2b2b2b] bg-[#1e1e1e]">
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Interés</Label>
              <Input value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} placeholder="Ej: Tabiques Durlock" className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Presupuesto estimado ($)</Label>
              <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createLead} disabled={saving} className="w-full bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Crear Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="custom-scrollbar max-h-[85vh] overflow-y-auto border-[#2b2b2b] bg-[#141414] text-white sm:max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-3xl">{detail.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-[#ededed]/80"><Phone className="h-4 w-4 text-[#f5d000]" /> {detail.phone || "—"}</p>
                  <p className="flex items-center gap-2 break-all text-[#ededed]/80"><Mail className="h-4 w-4 text-[#f5d000]" /> {detail.email || "—"}</p>
                  <p className="text-[#ededed]/80"><strong className="text-[#f5d000]">Interés:</strong> {detail.interest || "—"}</p>
                  {detail.budget && <p className="text-[#ededed]/80"><strong className="text-[#f5d000]">Presupuesto est.:</strong> {formatARS(detail.budget)}</p>}
                  <p className="text-[#ededed]/60"><strong>Origen:</strong> <span className="capitalize">{detail.source}</span> · <strong>Alta:</strong> {formatDate(detail.createdAt)}</p>
                  {detail.notes && <p className="rounded-md border border-[#2b2b2b] bg-[#0a0a0a] p-3 text-[#ededed]/70">{detail.notes}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cambiar estado</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => changeStatus(detail, s)}
                        className={`border px-2.5 py-1 text-[11px] font-bold capitalize transition-colors ${
                          detail.status === s ? STATUS_STYLES[s] : "border-[#2b2b2b] bg-[#0a0a0a] text-[#ededed]/60 hover:border-[#f5d000]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Label className="flex items-center gap-1.5"><StickyNote className="h-3.5 w-3.5" /> Agregar nota / actividad</Label>
                    <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Llamé al cliente, quiere visita el viernes..." className="mt-1.5 border-[#2b2b2b] bg-[#0a0a0a]" />
                    <Button onClick={addNote} size="sm" variant="outline" className="mt-2 w-full border-[#2b2b2b]">Guardar nota</Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2">Historial de actividades</Label>
                <div className="custom-scrollbar max-h-40 space-y-2 overflow-y-auto rounded-md border border-[#2b2b2b] bg-[#0a0a0a] p-3">
                  {detail.activities.length === 0 && <p className="text-sm text-muted-foreground">Sin actividades registradas.</p>}
                  {[...detail.activities].reverse().map((a) => (
                    <div key={a.id} className="flex gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5d000]" />
                      <div>
                        <p className="text-[#ededed]/80">{a.content}</p>
                        <p className="text-[10px] text-muted-foreground">{a.type} · {formatDate(a.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[#2b2b2b] pt-4">
                <Button onClick={() => convertLead(detail)} className="flex-1 bg-green-500 font-bold text-black hover:bg-green-400">
                  <UserCheck className="mr-1 h-4 w-4" /> Convertir a Cliente
                </Button>
                <Button onClick={() => sendFollowUp(detail)} className="flex-1 border border-[#f5d000] bg-transparent font-bold text-[#f5d000] hover:bg-[#f5d000] hover:text-black">
                  🤖 Enviar seguimiento IA
                </Button>
                <Button onClick={() => deleteLead(detail.id)} variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
