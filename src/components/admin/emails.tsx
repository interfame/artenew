"use client";

import { useEffect, useState } from "react";
import { api, formatDateTime } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Mail, Loader2, Sparkles, Send, Trash2, Bot, Copy } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}
interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: string;
  aiGenerated: boolean;
  createdAt: string;
}

export default function Emails() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [logs, setLogs] = useState<EmailLog[] | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [compose, setCompose] = useState({ to: "", subject: "", body: "" });
  const [aiContext, setAiContext] = useState("");
  const [newTemplate, setNewTemplate] = useState({ name: "", subject: "", body: "", category: "general" });

  async function load() {
    const data = await api<{ templates: Template[]; logs: EmailLog[] }>("/api/admin/emails");
    setTemplates(data.templates);
    setLogs(data.logs);
  }

  useEffect(() => {
    load().catch(() => toast({ title: "Error al cargar emails", variant: "destructive" }));
  }, []);

  async function generateEmail() {
    if (!aiContext.trim()) {
      toast({ title: "Describí el contexto del email para la IA", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const ai = await api<{ subject: string; body: string }>("/api/admin/ai", {
        method: "POST",
        body: { action: "generate-email", context: aiContext, emailType: "comercial" },
      });
      setCompose((c) => ({ ...c, subject: ai.subject, body: ai.body }));
      toast({ title: "✨ Email generado con IA" });
    } catch {
      toast({ title: "Error al generar email", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function sendEmail() {
    if (!compose.to.trim() || !compose.subject.trim()) {
      toast({ title: "Destinatario y asunto obligatorios", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await api("/api/admin/emails", { method: "POST", body: { action: "send", ...compose, aiGenerated: true } });
      toast({ title: "📧 Email enviado", description: compose.to });
      setComposeOpen(false);
      setCompose({ to: "", subject: "", body: "" });
      setAiContext("");
      load();
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  async function createTemplate() {
    if (!newTemplate.name.trim()) {
      toast({ title: "Nombre de plantilla requerido", variant: "destructive" });
      return;
    }
    try {
      await api("/api/admin/emails", { method: "POST", body: newTemplate });
      toast({ title: "Plantilla creada" });
      setTemplateOpen(false);
      setNewTemplate({ name: "", subject: "", body: "", category: "general" });
      load();
    } catch {
      toast({ title: "Error al crear plantilla", variant: "destructive" });
    }
  }

  async function deleteTemplate(id: string) {
    try {
      await api(`/api/admin/emails?id=${id}`, { method: "DELETE" });
      toast({ title: "Plantilla eliminada" });
      load();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  function applyTemplate(t: Template) {
    setCompose({ to: "", subject: t.subject, body: t.body });
    setComposeOpen(true);
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Emails Automáticos</h1>
          <p className="text-sm text-muted-foreground">Plantillas, composición con IA y registro de envíos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTemplateOpen(true)} className="border-[#2b2b2b]">
            <Plus className="mr-1 h-4 w-4" /> Plantilla
          </Button>
          <Button onClick={() => setComposeOpen(true)} className="bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
            <Mail className="mr-1 h-4 w-4" /> Redactar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="enviados" className="w-full">
        <TabsList className="bg-[#141414] border border-[#2b2b2b]">
          <TabsTrigger value="enviados" className="data-[state=active]:bg-[#f5d000] data-[state=active]:text-black">Enviados</TabsTrigger>
          <TabsTrigger value="plantillas" className="data-[state=active]:bg-[#f5d000] data-[state=active]:text-black">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="enviados" className="mt-4">
          {!logs ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="custom-scrollbar max-h-[65vh] space-y-2 overflow-y-auto pr-1">
              {logs.map((l) => (
                <div key={l.id} className="border border-[#2b2b2b] bg-[#141414] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {l.aiGenerated && <Bot className="h-4 w-4 text-[#25D366]" />}
                      <Mail className="h-4 w-4 text-[#f5d000]" />
                      <div>
                        <p className="text-sm font-semibold text-white">{l.subject}</p>
                        <p className="text-xs text-muted-foreground">Para: {l.to}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {l.aiGenerated && <span className="rounded bg-[#f5d000]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#f5d000]">✨ IA</span>}
                      <span className="text-[10px] text-muted-foreground">{formatDateTime(l.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs text-[#ededed]/60">{l.body}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plantillas" className="mt-4">
          {!templates ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {templates.map((t) => (
                <div key={t.id} className="border border-[#2b2b2b] bg-[#141414] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded bg-[#f5d000]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#f5d000]">{t.category}</span>
                      <p className="mt-1.5 font-semibold text-white">{t.name}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteTemplate(t.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground"><strong className="text-[#ededed]/80">Asunto:</strong> {t.subject}</p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-[#ededed]/50">{t.body}</p>
                  <Button size="sm" variant="outline" onClick={() => applyTemplate(t)} className="mt-3 w-full border-[#2b2b2b]">
                    <Copy className="mr-1 h-3.5 w-3.5" /> Usar plantilla
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Compose dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto border-[#2b2b2b] bg-[#141414] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Redactar Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>🤖 Contexto para la IA (opcional)</Label>
              <div className="flex gap-2">
                <Input value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="Ej: recordar presupuesto de cielorraso enviado hace 3 días" className="border-[#2b2b2b] bg-[#0a0a0a]" />
                <Button onClick={generateEmail} disabled={generating} className="shrink-0 border border-[#f5d000] bg-transparent text-[#f5d000] hover:bg-[#f5d000] hover:text-black">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Para</Label>
              <Input value={compose.to} onChange={(e) => setCompose({ ...compose, to: e.target.value })} placeholder="cliente@email.com" className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Asunto</Label>
              <Input value={compose.subject} onChange={(e) => setCompose({ ...compose, subject: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Mensaje</Label>
              <Textarea value={compose.body} onChange={(e) => setCompose({ ...compose, body: e.target.value })} rows={8} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={sendEmail} disabled={sending} className="w-full bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Enviar Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="border-[#2b2b2b] bg-[#141414] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Nueva Plantilla</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Input value={newTemplate.category} onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })} placeholder="presupuesto, seguimiento, promocion..." className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Asunto</Label>
              <Input value={newTemplate.subject} onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Cuerpo (usá {"{nombre}"} y {"{interes}"} para personalizar)</Label>
              <Textarea value={newTemplate.body} onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })} rows={6} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createTemplate} className="w-full bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">Crear Plantilla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
