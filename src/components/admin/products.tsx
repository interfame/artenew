"use client";

import { useEffect, useState } from "react";
import { api, formatARS } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Trash2, Package, AlertTriangle, Loader2, Pencil } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string | null;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
}

const emptyForm = { sku: "", name: "", category: "Placas", brand: "", unit: "unidad", price: "", cost: "", stock: "", minStock: "10" };

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [categories, setCategories] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "todas") params.set("category", category);
    const data = await api<{ products: Product[] }>(`/api/admin/products?${params}`);
    setProducts(data.products);
    const all = await api<{ products: Product[] }>("/api/admin/products");
    setCategories([...new Set(all.products.map((p) => p.category))]);
  }

  useEffect(() => {
    load().catch(() => toast({ title: "Error al cargar productos", variant: "destructive" }));
  }, [category]);

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      sku: p.sku,
      name: p.name,
      category: p.category,
      brand: p.brand || "",
      unit: p.unit,
      price: String(p.price),
      cost: String(p.cost),
      stock: String(p.stock),
      minStock: String(p.minStock),
    });
    setCreateOpen(true);
  }

  async function saveProduct() {
    if (!form.name.trim() || !form.sku.trim()) {
      toast({ title: "SKU y nombre obligatorios", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        await api(`/api/admin/products/${editProduct.id}`, { method: "PUT", body: form });
        toast({ title: "Producto actualizado" });
      } else {
        await api("/api/admin/products", { method: "POST", body: form });
        toast({ title: "Producto creado" });
      }
      setCreateOpen(false);
      setForm(emptyForm);
      setEditProduct(null);
      load();
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    try {
      await api(`/api/admin/products/${id}`, { method: "DELETE" });
      toast({ title: "Producto eliminado" });
      load();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  }

  const lowStockCount = products?.filter((p) => p.stock <= p.minStock).length || 0;

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-white">Materiales</h1>
          <p className="text-sm text-muted-foreground">Catálogo, precios y stock · {lowStockCount > 0 && <span className="text-orange-400">⚠ {lowStockCount} con stock bajo</span>}</p>
        </div>
        <Button onClick={() => { setEditProduct(null); setForm(emptyForm); setCreateOpen(true); }} className="bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
          <Plus className="mr-1 h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Buscar producto o SKU..." className="border-[#2b2b2b] bg-[#141414] pl-10 text-white" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["todas", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`border px-3 py-1.5 text-xs font-bold capitalize ${category === c ? "border-[#f5d000] bg-[#f5d000] text-black" : "border-[#2b2b2b] bg-[#141414] text-[#ededed]/70"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {!products ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <div className="overflow-hidden border border-[#2b2b2b]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-[#2b2b2b] bg-[#1e1e1e] text-left text-xs tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Precio</th>
                  <th className="px-4 py-3 text-right">Costo</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={`border-b border-[#2b2b2b] transition-colors hover:bg-[#1a1a1a] ${p.stock <= p.minStock ? "bg-orange-400/5" : "bg-[#141414]"}`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-[#f5d000]">{p.sku}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-white">{p.name}</p>
                      {p.brand && <p className="text-[10px] text-muted-foreground">{p.brand}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-white">{formatARS(p.price)}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{formatARS(p.cost)}</td>
                    <td className="px-4 py-2.5 text-center">
                      {p.stock <= p.minStock ? (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-400/15 px-2 py-0.5 text-xs font-bold text-orange-400">
                          <AlertTriangle className="h-3 w-3" /> {p.stock}
                        </span>
                      ) : (
                        <span className="text-white">{p.stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)} title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteProduct(p.id)} title="Eliminar">
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-[#2b2b2b] bg-[#141414] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-2xl">
              <Package className="h-6 w-6 text-[#f5d000]" /> {editProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>SKU *</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Precio venta ($)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Costo ($)</Label>
              <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
            <div className="space-y-1.5">
              <Label>Stock mínimo</Label>
              <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="border-[#2b2b2b] bg-[#0a0a0a]" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveProduct} disabled={saving} className="w-full bg-[#f5d000] font-bold text-black hover:bg-[#d4b200]">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
