"use client";

import { useEffect, useState, useRef } from "react";
import { api, formatDateTime } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Loader2, MessageCircle, RefreshCw, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
  aiGenerated: boolean;
  createdAt: string;
}
interface Conversation {
  id: string;
  contactName: string;
  phone: string;
  status: string;
  unread: number;
  lastMessageAt: string;
  messages: Message[];
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  bot: { label: "🤖 Bot", className: "border-[#25D366]/50 bg-[#25D366]/10 text-[#25D366]" },
  abierta: { label: "Sin atender", className: "border-[#f5d000]/50 bg-[#f5d000]/10 text-[#f5d000]" },
  atendida: { label: "Atendida", className: "border-gray-400/50 bg-gray-400/10 text-gray-300" },
  cerrada: { label: "Cerrada", className: "border-red-400/50 bg-red-400/10 text-red-300" },
};

export default function WhatsappInbox() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [aiReplying, setAiReplying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadList() {
    const data = await api<{ conversations: Conversation[] }>("/api/admin/conversations");
    setConversations(data.conversations);
    return data.conversations;
  }

  useEffect(() => {
    loadList().catch(() => toast({ title: "Error al cargar conversaciones", variant: "destructive" }));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function openConversation(conv: Conversation) {
    setSelected(conv);
    const data = await api<{ conversation: { messages: Message[] } }>(`/api/admin/conversations?id=${conv.id}`);
    setMessages(data.conversation.messages);
    await api(`/api/admin/conversations/${conv.id}`, { method: "PUT", body: { markRead: true } });
    loadList();
  }

  async function sendAgentMessage() {
    if (!input.trim() || !selected) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      const res = await api<{ message: Message }>("/api/admin/conversations", {
        method: "POST",
        body: { conversationId: selected.id, content },
      });
      setMessages((m) => [...m, res.message]);
      await api(`/api/admin/conversations/${selected.id}`, { method: "PUT", body: { status: "atendida" } });
      loadList();
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  async function generateAIReply() {
    if (!selected || aiReplying) return;
    setAiReplying(true);
    try {
      // Simulate the incoming message flow: send last customer message to AI bot endpoint
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
      const prompt = lastUserMsg?.content || "Hola, quiero información sobre sus servicios";
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: selected.phone,
          contactName: selected.contactName,
          message: prompt,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((m) => [
          ...m,
          { id: `tmp-${Date.now()}`, role: "bot", content: data.reply, aiGenerated: true, createdAt: new Date().toISOString() },
        ]);
        toast({ title: "🤖 Respuesta generada", description: "Revisala antes de que llegue al cliente" });
      }
      loadList();
    } catch {
      toast({ title: "Error al generar respuesta IA", variant: "destructive" });
    } finally {
      setAiReplying(false);
    }
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">WhatsApp · Bot de Contacto</h1>
          <p className="text-sm text-muted-foreground">El bot responde automáticamente. Tomá el control cuando quieras.</p>
        </div>
        <Button variant="outline" size="icon" onClick={loadList} className="border-[#2b2b2b]">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Conversation list */}
        <div className="border border-[#2b2b2b] bg-[#141414]">
          <div className="border-b border-[#2b2b2b] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <MessageCircle className="h-4 w-4 text-[#25D366]" /> Conversaciones
              <span className="ml-auto text-[10px] font-bold text-[#25D366]">● BOT ACTIVO</span>
            </p>
          </div>
          <div className="custom-scrollbar max-h-[60vh] overflow-y-auto">
            {!conversations ? (
              <div className="space-y-2 p-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : conversations.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Sin conversaciones aún. Los mensajes de clientes aparecerán acá.</p>
            ) : (
              conversations.map((c) => {
                const last = c.messages[0];
                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c)}
                    className={`w-full border-b border-[#2b2b2b] p-3.5 text-left transition-colors hover:bg-[#1a1a1a] ${
                      selected?.id === c.id ? "bg-[#1a1a1a]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">{c.contactName}</p>
                      {c.unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#25D366] px-1 text-[10px] font-bold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{last?.content || "Sin mensajes"}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className={`border px-1.5 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLES[c.status]?.className || ""}`}>
                        {STATUS_STYLES[c.status]?.label || c.status}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{formatDateTime(c.lastMessageAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex min-h-[60vh] flex-col border border-[#2b2b2b] bg-[#141414]">
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageCircle className="h-12 w-12 opacity-30" />
              <p className="text-sm">Seleccioná una conversación para ver el chat</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]/20">
                    <User className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{selected.contactName}</p>
                    <p className="text-xs text-muted-foreground">{selected.phone}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={generateAIReply}
                  disabled={aiReplying}
                  className="border border-[#f5d000] bg-transparent text-[#f5d000] hover:bg-[#f5d000] hover:text-black"
                >
                  {aiReplying ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
                  Respuesta IA
                </Button>
              </div>

              <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-[#0b141a] p-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                    <div className="max-w-[75%]">
                      <div
                        className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "rounded-bl-sm bg-[#1f2c33] text-[#e9edef]"
                            : m.role === "bot"
                              ? "rounded-br-sm border border-[#25D366]/30 bg-[#005c4b]/60 text-white"
                              : "rounded-br-sm bg-[#005c4b] text-white"
                        }`}
                      >
                        {m.content}
                      </div>
                      <p className={`mt-1 flex items-center gap-1 text-[9px] ${m.role === "user" ? "" : "justify-end"} text-muted-foreground`}>
                        {m.aiGenerated && <Bot className="h-3 w-3 text-[#25D366]" />}
                        {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {aiReplying && (
                  <div className="flex justify-end">
                    <div className="flex items-center gap-2 rounded-xl rounded-br-sm bg-[#005c4b]/40 px-4 py-2.5 text-xs text-[#25D366]">
                      <Bot className="h-4 w-4 animate-pulse" /> El bot está escribiendo...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-[#2b2b2b] bg-[#1e1e1e] p-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendAgentMessage()}
                  placeholder="Respondé como agente de ArteDur..."
                  className="border-[#2b2b2b] bg-[#0a0a0a] text-white"
                />
                <Button onClick={sendAgentMessage} disabled={sending} size="icon" className="h-10 w-10 shrink-0 bg-[#25D366] text-white hover:bg-[#20bd5a]">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
