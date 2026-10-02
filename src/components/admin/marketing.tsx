"use client";

import { useEffect, useState } from "react";
import { api, formatDateTime } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Send, Loader2, Sparkles, CalendarClock, ThumbsUp, MessageSquare, Bot, Facebook } from "lucide-react";

interface Post {
  id: string;
  platform: string;
  content: string;
  hashtags: string | null;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  aiGenerated: boolean;
  likes: number;
  comments: number;
}

const STATUS_STYLES: Record<string, string> = {
  publicado: "border-green-400/50 bg-green-400/10 text-green-300",
  programado: "border-[#f5d000]/50 bg-[#f5d000]/10 text-[#f5d000]",
  borrador: "border-gray-400/50 bg-gray-400/10 text-gray-300",
};

const TOPIC_IDEAS = [
  "Oferta de placas Durlock con descuento por cantidad",
  "Antes y después de un cielorraso desmontable en oficina",
  "Beneficios de la construcción en seco vs húmeda",
  "Nueva línea de pisos vinílicos SPC disponible",
  "Consejo experto: cómo elegir el cielorraso correcto",
];

export default function Marketing() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [form, setForm] = useState({ content: "", hashtags: "", platform: "facebook", scheduledAt: "", topic: "" });

  async function load() {
    const data = await api<{ posts: Post[] }>("/api/admin/posts");
    setPosts(data.posts);
  }

  useEffect(() => {
    load().catch(() => toast({ title: "Error al cargar posts", variant: "destructive" }));
  }, []);

  async function generatePost() {
    const topic = form.topic || TOPIC_IDEAS[Math.floor(Math.random() * TOPIC_IDEAS.length)];
    setGenerating(true);
    try {
      const ai = await api<{ content: string; hashtags: string }>("/api/admin/ai", {
        method: "POST",
        body: { action: "generate-post", topic },
      });
      setForm((f) => ({ ...f, content: ai.content, hashtags: ai.hashtags }));
      toast({ title: "✨ Post generado con IA", description: "Podés editarlo antes de programarlo" });
    } catch {
      toast({ title: "Error al generar post con IA", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function createPost(status: string) {
    if (!form.content.trim()) {
      toast({ title: "El contenido es obligatorio", variant: "destructive" });
      return;
    }
    try {
      await api("/api/admin/posts", {
        method: "POST",
        body: {
          content: form.content,
          hashtags: form.hashtags || null,
          platform: form.platform,
          status,
          scheduledAt: status === "programado" ? form.scheduledAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString() : null,
          aiGenerated: true,
        },
      });
      toast({
        title: status === "publicado" ? "🚀 Post publicado" : status === "programado" ? "⏰ Post programado" : "Borrador guardado",
        description: status === "publicado" ? "El bot lo publicó en la página de Facebook" : undefined,
      });
      setCreateOpen(false);
      setForm({ content: "", hashtags: "", platform: "facebook", scheduledAt: "", topic: "" });
      load();
    } catch {
      toast({ title: "Error al crear post", variant: "destructive" });
    }
  }

  async function publishNow(post: Post) {
    setPublishing(post.id);
    try {
      await api(`/api/admin/posts/${post.id}`, { method: "POST" });
      toast({ title: "🚀 Publicado en Facebook", description: "El bot completó la publicación" });
      load();
    } catch {
      toast({ title: "Error al publicar", variant: "destructive" });
    } finally {
      setPublishing(null);
    }
  }

  async function deletePost(id: string) {
    try {
      await api(`/api/admin/posts/${id}`, { method: "DELETE" });
      toast({ title: "Post eliminado" });
      load();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Bot de Marketing</h1>
          <p className="text-sm text-muted-foreground">Generá posts con IA y programá publicaciones para Facebook e Instagram</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
          <Plus className="mr-1 h-4 w-4" /> Crear Post con IA
        </Button>
      </div>

      {/* Bot status banner */}
      <div className="flex flex-wrap items-center gap-3 border border-[#25D366]/30 bg-[#25D366]/5 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/20">
          <Bot className="h-5 w-5 text-[#25D366]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Bot de publicaciones · Conectado a Facebook Page &quot;artedur&quot; 📘</p>
          <p className="text-xs text-muted-foreground">Publicación automática de posts programados · Respuestas automáticas en comentarios</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold text-[#25D366]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#25D366]" /> ACTIVO
        </span>
      </div>

      {!posts ? (
        <div className="grid gap-4 lg:grid-cols-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {posts.map((p) => (
            <div key={p.id} className="border border-[#2b2b2b] bg-[#141414]">
              <div className="flex items-center justify-between border-b border-[#2b2b2b] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-[#1877f2]" />
                  <span className="text-sm font-semibold text-white">ArteDur · {p.platform === "instagram" ? "Instagram" : "Facebook"}</span>
                  {p.aiGenerated && <span className="rounded bg-[#f5d000]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#f5d000]">✨ IA</span>}
                </div>
                <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[p.status] || ""}`}>{p.status}</span>
              </div>
              <div className="p-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#ededed]/85">{p.content}</p>
                {p.hashtags && <p className="mt-2 text-xs text-[#1877f2]">{p.hashtags}</p>}
                {p.status === "publicado" && (
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {p.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {p.comments}</span>
                    <span className="ml-auto">{p.publishedAt ? `Publicado ${formatDateTime(p.publishedAt)}` : ""}</span>
                  </div>
                )}
                {p.status === "programado" && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-[#f5d000]">
                    <CalendarClock className="h-3.5 w-3.5" /> Programado: {p.scheduledAt ? formatDateTime(p.scheduledAt) : "—"}
                  </p>
                )}
                <div className="mt-3 flex gap-2 border-t border-[#2b2b2b] pt-3">
                  {(p.status === "borrador" || p.status === "programado") && (
                    <Button size="sm" onClick={() => publishNow(p)} disabled={publishing === p.id} className="bg-[#1877f2] text-white hover:bg-[#1465cc]">
                      {publishing === p.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}
                      {p.status === "programado" ? "Publicar ahora" : "Publicar"}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deletePost(p.id)} className="ml-auto text-red-400 hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto border-[#2b2b2b] bg-[#141414] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-2xl">
              <Sparkles className="h-6 w-6 text-[#f5d000]" /> Crear Post con IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tema o idea del post</Label>
              <div className="flex gap-2">
                <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Ej: oferta de cielorrasos este mes" className="border-[#2b2b2b] bg-[#0a0a0a]" />
                <Button onClick={generatePost} disabled={generating} className="shrink-0 border border-[#f5d000] bg-transparent text-[#f5d000] hover:bg-[#f5d000] hover:text-black">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TOPIC_IDEAS.slice(0, 3).map((idea) => (
                  <button key={idea} onClick={() => setForm((f) => ({ ...f, topic: idea }))} className="rounded-full border border-[#2b2b2b] px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-[#f5d000] hover:text-[#f5d000]">
                    {idea.slice(0, 38)}...
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contenido del post</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} placeholder="El contenido aparecerá acá cuando la IA lo genere..." className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Hashtags</Label>
                <Input value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
              </div>
              <div className="space-y-1.5">
                <Label>Plataforma</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger className="border-[#2b2b2b] bg-[#0a0a0a]"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-[#2b2b2b] bg-[#1e1e1e]">
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Programar para (opcional)</Label>
                <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
              </div>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-3 gap-2">
            <Button onClick={() => createPost("borrador")} variant="outline" className="border-[#2b2b2b]">Borrador</Button>
            <Button onClick={() => createPost("programado")} variant="outline" className="border-[#f5d000] text-[#f5d000] hover:bg-[#f5d000] hover:text-black">
              <CalendarClock className="mr-1 h-4 w-4" /> Programar
            </Button>
            <Button onClick={() => createPost("publicado")} className="bg-[#1877f2] text-white hover:bg-[#1465cc]">
              <Send className="mr-1 h-4 w-4" /> Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
