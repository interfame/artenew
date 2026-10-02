"use client";

import { useEffect, useState } from "react";
import { api, formatARS, formatDate } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, FileText, CheckCircle2, Printer, Loader2, X } from "lucide-react";

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}
interface Invoice {
  id: string;
  number: string;
  type: string;
  clientId: string | null;
  clientName: string;
  items: string;
  subtotal: number;
  iva: number;
  total: number;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  paidAt: string | null;
}
interface Client {
  id: string;
  name: string;
}
interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
}

const STATUS_STYLES: Record<string, string> = {
  pagada: "border-green-400/50 bg-green-400/10 text-green-300",
  pendiente: "border-[#f5d000]/50 bg-[#f5d000]/10 text-[#f5d000]",
  anulada: "border-red-400/50 bg-red-400/10 text-red-300",
};

export default function Invoices() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("todos");
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState("B");
  const [clientId, setClientId] = useState<string>("");
  const [manualName, setManualName] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", qty: 1, price: 0 }]);

  async function load() {
    const data = await api<{ invoices: Invoice[] }>(`/api/admin/invoices?status=${filter}`);
    setInvoices(data.invoices);
  }

  useEffect(() => {
    load().catch(() => toast({ title: "Error al cargar facturas", variant: "destructive" }));
  }, [filter]);

  useEffect(() => {
    api<{ clients: Client[] }>("/api/admin/clients").then((d) => setClients(d.clients)).catch(() => {});
    api<{ products: Product[] }>("/api/admin/products").then((d) => setProducts(d.products)).catch(() => {});
  }, []);

  const subtotal = items.reduce((s, it) => s + Number(it.qty) * Number(it.price), 0);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  function addItem() {
    setItems([...items, { description: "", qty: 1, price: 0 }]);
  }
  function updateItem(idx: number, field: keyof InvoiceItem, value: string) {
    const next = [...items];
    if (field === "qty" || field === "price") next[idx][field] = Number(value) || 0;
    else next[idx][field] = value;
    setItems(next);
  }
  function addProduct(idx: number, sku: string) {
    const p = products.find((x) => x.sku === sku);
    if (!p) return;
    const next = [...items];
    next[idx] = { description: p.name, qty: 1, price: p.price };
    setItems(next);
  }

  async function createInvoice() {
    const clientName = clientId ? clients.find((c) => c.id === clientId)?.name : manualName;
    if (!clientName?.trim()) {
      toast({ title: "Indicá el cliente", variant: "destructive" });
      return;
    }
    if (items.some((i) => !i.description.trim())) {
      toast({ title: "Hay items sin descripción", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/invoices", { method: "POST", body: { type, clientId: clientId || null, clientName, items } });
      toast({ title: "Factura creada ✅" });
      setCreateOpen(false);
      setItems([{ description: "", qty: 1, price: 0 }]);
      setManualName("");
      setClientId("");
      load();
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(inv: Invoice) {
    try {
      await api(`/api/admin/invoices/${inv.id}`, { method: "PUT", body: { status: "pagada", paymentMethod: "transferencia" } });
      toast({ title: "💰 Factura marcada como pagada" });
      setDetail(null);
      load();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function cancelInvoice(inv: Invoice) {
    try {
      await api(`/api/admin/invoices/${inv.id}`, { method: "DELETE" });
      toast({ title: "Factura anulada" });
      setDetail(null);
      load();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  function printInvoice(inv: Invoice) {
    const parsedItems: InvoiceItem[] = JSON.parse(inv.items);
    const rows = parsedItems
      .map(
        (it) =>
          `<tr><td>${it.description}</td><td style="text-align:center">${it.qty}</td><td style="text-align:right">${formatARS(it.price)}</td><td style="text-align:right">${formatARS(it.qty * it.price)}</td></tr>`
      )
      .join("");
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Factura ${inv.number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        h1 { color: #0a0a0a; letter-spacing: 2px; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #f5d000; padding-bottom: 16px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; }
        th { background: #f5d000; text-align: left; }
        .totals { margin-top: 16px; text-align: right; }
        .totals p { margin: 4px 0; }
        .total-final { font-size: 18px; font-weight: bold; background: #f5d000; display: inline-block; padding: 8px 16px; }
      </style></head><body>
      <div class="header">
        <div><h1>ARTE<span style="color:#d4b200">DUR</span></h1><p>Construcción en seco · CABA</p><p>Av. Castañares 2123 / Rivadavia 10514</p><p>CUIT 30-71234567-8</p></div>
        <div style="text-align:right"><h2>Factura ${inv.type}</h2><p>N° ${inv.number}</p><p>Fecha: ${formatDate(inv.createdAt)}</p><p>Estado: ${inv.status.toUpperCase()}</p></div>
      </div>
      <p><strong>Cliente:</strong> ${inv.clientName}</p>
      <table><thead><tr><th>Descripción</th><th style="text-align:center">Cant.</th><th style="text-align:right">P. Unit.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="totals">
        <p>Subtotal: ${formatARS(inv.subtotal)}</p>
        <p>IVA (21%): ${formatARS(inv.iva)}</p>
        <p class="total-final">TOTAL: ${formatARS(inv.total)}</p>
      </div>
      <script>window.onload = function(){ window.print(); }</script>
      </body></html>`);
    w.document.close();
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Facturación</h1>
          <p className="text-sm text-muted-foreground">Emití y controlá facturas A/B con IVA</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
          <Plus className="mr-1 h-4 w-4" /> Nueva Factura
        </Button>
      </div>

      <div className="flex gap-1.5">
        {["todos", "pendiente", "pagada", "anulada"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`border px-3 py-1.5 text-xs font-bold capitalize ${
              filter === s ? "border-[#f5d000] bg-[#f5d000] text-black" : "border-[#2b2b2b] bg-[#141414] text-[#ededed]/70"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {!invoices ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="overflow-hidden border border-[#2b2b2b]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[#2b2b2b] bg-[#1e1e1e] text-left text-xs tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-3">N° Factura</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="cursor-pointer border-b border-[#2b2b2b] bg-[#141414] transition-colors hover:bg-[#1a1a1a]" onClick={() => setDetail(inv)}>
                    <td className="px-4 py-3 font-mono text-xs text-[#f5d000]">{inv.number}</td>
                    <td className="px-4 py-3 font-medium text-white">{inv.clientName}</td>
                    <td className="px-4 py-3">{inv.type}</td>
                    <td className="px-4 py-3 text-right font-bold text-white">{formatARS(inv.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[inv.status] || ""}`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); printInvoice(inv); }} title="Imprimir">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto border-[#2b2b2b] bg-[#141414] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Nueva Factura</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="border-[#2b2b2b] bg-[#0a0a0a]"><SelectValue /></SelectTrigger>
                <SelectContent className="border-[#2b2b2b] bg-[#1e1e1e]">
                  <SelectItem value="A">A - Responsable Inscripto</SelectItem>
                  <SelectItem value="B">B - Consumidor Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cliente registrado</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="border-[#2b2b2b] bg-[#0a0a0a]"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent className="border-[#2b2b2b] bg-[#1e1e1e]">
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>…o nombre manual</Label>
              <Input value={manualName} onChange={(e) => setManualName(e.target.value)} disabled={!!clientId} placeholder="Consumidor final" className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button size="sm" variant="outline" onClick={addItem} className="border-[#2b2b2b]">+ Item</Button>
            </div>
            {items.map((it, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-12">
                <div className="sm:col-span-6">
                  {idx === 0 ? (
                    <Input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Descripción" className="border-[#2b2b2b] bg-[#0a0a0a]" />
                  ) : (
                    <Input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Descripción" className="border-[#2b2b2b] bg-[#0a0a0a]" />
                  )}
                </div>
                <div className="sm:col-span-3">
                  <Select onValueChange={(sku) => addProduct(idx, sku)}>
                    <SelectTrigger className="border-[#2b2b2b] bg-[#0a0a0a] text-xs"><SelectValue placeholder="Desde materiales" /></SelectTrigger>
                    <SelectContent className="custom-scrollbar max-h-64 border-[#2b2b2b] bg-[#1e1e1e]">
                      {products.map((p) => (
                        <SelectItem key={p.sku} value={p.sku}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-1">
                  <Input type="number" min={1} value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} className="border-[#2b2b2b] bg-[#0a0a0a]" />
                </div>
                <div className="sm:col-span-1">
                  <Input type="number" min={0} value={it.price} onChange={(e) => updateItem(idx, "price", e.target.value)} className="border-[#2b2b2b] bg-[#0a0a0a]" />
                </div>
                <div className="sm:col-span-1">
                  <Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, i) => i !== idx))} disabled={items.length === 1}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-[#2b2b2b] bg-[#0a0a0a] p-4 text-right text-sm">
            <p className="text-muted-foreground">Subtotal: <span className="text-white">{formatARS(subtotal)}</span></p>
            <p className="text-muted-foreground">IVA 21%: <span className="text-white">{formatARS(iva)}</span></p>
            <p className="mt-1 font-display text-2xl text-[#f5d000]">Total: {formatARS(total)}</p>
          </div>

          <DialogFooter>
            <Button onClick={createInvoice} disabled={saving} className="w-full bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Emitir Factura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="border-[#2b2b2b] bg-[#141414] text-white sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-display text-2xl">
                  <FileText className="h-6 w-6 text-[#f5d000]" /> Factura {detail.type} {detail.number}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-1 text-sm">
                <p><strong className="text-[#f5d000]">Cliente:</strong> {detail.clientName}</p>
                <p><strong className="text-[#f5d000]">Fecha:</strong> {formatDate(detail.createdAt)}</p>
                <p><strong className="text-[#f5d000]">Estado:</strong> {detail.status}</p>
                {detail.paymentMethod && <p><strong className="text-[#f5d000]">Pago:</strong> {detail.paymentMethod}</p>}
              </div>
              <div className="rounded-md border border-[#2b2b2b] bg-[#0a0a0a] p-3 text-sm">
                {(JSON.parse(detail.items) as InvoiceItem[]).map((it, i) => (
                  <div key={i} className="flex justify-between border-b border-[#1e1e1e] py-1.5 last:border-0">
                    <span className="text-[#ededed]/80">{it.qty} × {it.description}</span>
                    <span className="text-white">{formatARS(it.qty * it.price)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-[#2b2b2b] pt-2 text-muted-foreground">
                  <span>Subtotal</span><span>{formatARS(detail.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA 21%</span><span>{formatARS(detail.iva)}</span>
                </div>
                <div className="mt-1 flex justify-between font-display text-xl text-[#f5d000]">
                  <span>TOTAL</span><span>{formatARS(detail.total)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => printInvoice(detail)} variant="outline" className="flex-1 border-[#2b2b2b]">
                  <Printer className="mr-1 h-4 w-4" /> Imprimir
                </Button>
                {detail.status === "pendiente" && (
                  <Button onClick={() => markPaid(detail)} className="flex-1 bg-green-500 font-bold text-black hover:bg-green-400">
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Marcar pagada
                  </Button>
                )}
                {detail.status !== "anulada" && (
                  <Button onClick={() => cancelInvoice(detail)} variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
