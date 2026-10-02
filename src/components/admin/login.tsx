"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

export default function AdminLogin({ onSuccess }: { onSuccess: (token: string, user: { name: string }) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de login");
      onSuccess(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5d000]">
            <ShieldCheck className="h-8 w-8 text-black" />
          </div>
          <p className="font-display text-5xl text-white">
            ARTE<span className="text-[#f5d000]">DUR</span>
          </p>
          <p className="mt-1 text-xs font-bold tracking-[0.3em] text-[#f5d000] uppercase">Panel de Gestión CRM</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-[#2b2b2b] bg-[#141414] p-6 shadow-2xl sm:p-8"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#ededed]">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="border-[#2b2b2b] bg-[#0a0a0a] pl-10 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#ededed]">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-[#2b2b2b] bg-[#0a0a0a] pl-10 text-white"
              />
            </div>
          </div>
          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-[#f5d000] py-6 text-base font-bold text-black hover:bg-[#d4b200]">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Iniciar sesión
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-[#666]">
          Área restringida · Solo personal autorizado de ArteDur
        </p>
      </div>
    </div>
  );
}
