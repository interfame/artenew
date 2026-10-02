"use client";

import { useEffect, useState } from "react";
import { getToken, setToken, clearToken, api } from "@/lib/api-client";
import AdminLogin from "@/components/admin/login";
import Dashboard from "@/components/admin/dashboard";
import LeadsCRM from "@/components/admin/leads";
import Invoices from "@/components/admin/invoices";
import Campaigns from "@/components/admin/campaigns";
import Marketing from "@/components/admin/marketing";
import Emails from "@/components/admin/emails";
import WhatsappInbox from "@/components/admin/whatsapp-inbox";
import Products from "@/components/admin/products";
import {
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  Bot,
  Mail,
  MessageCircle,
  Package,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "crm", label: "CRM · Leads", icon: Users },
  { id: "facturacion", label: "Facturación", icon: FileText },
  { id: "campanias", label: "Campañas", icon: Megaphone },
  { id: "marketing", label: "Bot de Marketing", icon: Bot },
  { id: "whatsapp", label: "WhatsApp Bot", icon: MessageCircle },
  { id: "emails", label: "Emails", icon: Mail },
  { id: "materiales", label: "Materiales", icon: Package },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const token = getToken();
        if (!token) {
          setChecking(false);
          return;
        }
        await api("/api/auth/me");
        setAuthed(true);
        setUserName("José");
      } catch {
        clearToken();
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  function handleLogin(token: string, user: { name: string }) {
    setToken(token);
    setUserName(user.name);
    setAuthed(true);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearToken();
    setAuthed(false);
    setTab("dashboard");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2b2b2b] border-t-[#f5d000]" />
          <p className="text-sm text-muted-foreground">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#2b2b2b] bg-[#141414] lg:flex">
        <div className="flex h-16 items-center border-b border-[#2b2b2b] px-5">
          <p className="font-display text-3xl text-white">
            ARTE<span className="text-[#f5d000]">DUR</span>
          </p>
          <span className="ml-2 rounded bg-[#f5d000] px-1.5 py-0.5 text-[9px] font-bold text-black">CRM</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  tab === item.id
                    ? "bg-[#f5d000] text-black"
                    : "text-[#ededed]/70 hover:bg-[#1e1e1e] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-[#2b2b2b] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5d000] font-bold text-black">
              J
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{userName || "Admin"}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Topbar - mobile */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#2b2b2b] bg-[#141414] px-4 lg:hidden">
        <p className="font-display text-2xl text-white">
          ARTE<span className="text-[#f5d000]">DUR</span> <span className="text-sm text-[#f5d000]">CRM</span>
        </p>
        <button aria-label="Menú" onClick={() => setMenuOpen(!menuOpen)} className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2b2b2b] text-white">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setMenuOpen(false)}>
          <aside className="h-full w-72 border-r border-[#2b2b2b] bg-[#141414] p-3 pt-16" onClick={(e) => e.stopPropagation()}>
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setMenuOpen(false);
                  }}
                  className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium ${
                    tab === item.id ? "bg-[#f5d000] text-black" : "text-[#ededed]/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            <button onClick={handleLogout} className="mt-4 flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm text-red-400">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 pt-14 lg:ml-64 lg:pt-0">
        {tab === "dashboard" && <Dashboard onNavigate={setTab} />}
        {tab === "crm" && <LeadsCRM />}
        {tab === "facturacion" && <Invoices />}
        {tab === "campanias" && <Campaigns />}
        {tab === "marketing" && <Marketing />}
        {tab === "whatsapp" && <WhatsappInbox />}
        {tab === "emails" && <Emails />}
        {tab === "materiales" && <Products />}
      </main>
    </div>
  );
}
