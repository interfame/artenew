"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  X,
  Send,
  Loader2,
  Hammer,
  ArrowRight,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

/* ---------------- WhatsApp Bot Widget (botón flotante como artedur.com) ---------------- */
interface ChatMsg {
  role: "user" | "bot";
  content: string;
}

function WhatsappWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "bot",
      content:
        "¡Hola! 👋 Soy el asistente virtual de ARTEDUR. ¿En qué te puedo ayudar? Puedo darte info de servicios, precios orientativos y coordinar tu presupuesto gratis 🏗️",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "web-visitante", message: text, name: "Visitante web" }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "bot", content: data.reply || "Gracias por tu consulta, te contactamos a la brevedad." }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", content: "Perdón, tuvimos un problema. Escribinos directo al 11-6691-9404 📱" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botón flotante estilo artedur.com: verde WhatsApp con anillo pulsante */}
      <button
        aria-label="Chat WhatsApp"
        onClick={() => setOpen(!open)}
        className="fixed bottom-7 right-7 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_18px_rgba(37,211,102,0.35)] transition-transform hover:scale-110"
      >
        {!open && <span className="absolute inset-[-4px] animate-ping rounded-full border-2 border-[#25D366]/45" />}
        {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-7 w-7 text-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-7 z-50 flex h-[480px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-xl border border-[#2b2b2b] bg-[#0a0a0a] shadow-2xl">
          <div className="flex items-center gap-3 bg-[#141414] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] font-display text-lg text-black">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-white">ARTEDUR · WhatsApp</p>
              <p className="flex items-center gap-1.5 text-xs text-[#25D366]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" /> En línea · responde al instante
              </p>
            </div>
          </div>
          <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-[#0f0f0f] p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[#25D366] text-white"
                      : "rounded-bl-sm border border-[#2b2b2b] bg-[#1e1e1e] text-[#ededed]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg rounded-bl-sm border border-[#2b2b2b] bg-[#1e1e1e] px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#f5d000]" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#f5d000]" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#f5d000]" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-[#2b2b2b] bg-[#1e1e1e] p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribí tu consulta..."
              className="border-[#2b2b2b] bg-[#0f0f0f] text-white placeholder:text-[#666]"
            />
            <Button onClick={sendMessage} disabled={loading} size="icon" className="h-10 w-10 shrink-0 bg-[#25D366] text-white hover:bg-[#20bd5a]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- Navbar ---------------- */
const NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Construcción en Seco", href: "#seco" },
  { label: "Pisos", href: "#pisos" },
  { label: "Pintura", href: "#pintura" },
  { label: "Materiales", href: "#materiales" },
  { label: "Trabajos", href: "#trabajos" },
  { label: "Contacto", href: "#contacto" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0a]/95 shadow-lg backdrop-blur-md" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#inicio" className="leading-none">
          <span className="font-display text-2xl tracking-wide text-white">
            ARTE<span className="text-[#f5d000]">DUR</span>
          </span>
          <span className="block text-[9px] font-semibold tracking-[0.35em] text-[#f5d000]">DURLOCK</span>
        </a>
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#ededed]/80 transition-colors hover:text-[#f5d000]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#contacto"
            className="hidden bg-[#f5d000] px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 sm:block"
          >
            Presupuesto
          </a>
          <button
            aria-label="Menú"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#2b2b2b] text-white lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Hammer className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="border-t border-[#2b2b2b] bg-[#0a0a0a] px-4 py-4 lg:hidden">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2.5 text-sm font-medium text-[#ededed]/80 hover:text-[#f5d000]"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={() => setMenuOpen(false)}
            className="mt-2 block bg-[#f5d000] px-5 py-2.5 text-center text-sm font-bold text-black"
          >
            Presupuesto
          </a>
        </nav>
      )}
    </header>
  );
}

/* ---------------- Hero (textos exactos de artedur.com) ---------------- */
const STATS = [
  { value: "+25", label: "Años de experiencia" },
  { value: "+500", label: "Obras realizadas" },
  { value: "100%", label: "Garantía de calidad" },
];

function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[92vh] items-center overflow-hidden pt-[72px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/hero-bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <div className="animate-fade-up mb-5 inline-flex items-center gap-2 border border-[#f5d000]/40 bg-[#f5d000]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#f5d000] uppercase">
            <MapPin className="h-3.5 w-3.5" /> Buenos Aires · CABA &amp; GBA
          </div>
          <h1 className="animate-fade-up font-display text-6xl leading-[0.95] text-white sm:text-7xl md:text-8xl" style={{ animationDelay: "0.1s" }}>
            Tu hogar,
            <br />
            <span className="text-[#f5d000]">nuestra obra.</span>
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-[#ededed]/80" style={{ animationDelay: "0.2s" }}>
            Especialistas en <strong className="text-white">construcción en seco</strong>, Durlock, cielorrasos,
            tabiques, pintura y reformas. Más de 25 años transformando espacios en Buenos Aires.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap gap-4" style={{ animationDelay: "0.3s" }}>
            <a
              href="#contacto"
              className="group flex items-center gap-2 bg-[#f5d000] px-7 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#d4b200]"
            >
              Solicitar presupuesto
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#trabajos"
              className="flex items-center gap-2 border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-[#f5d000] hover:text-[#f5d000]"
            >
              Ver trabajos realizados
            </a>
          </div>
          <div className="animate-fade-up mt-12 grid max-w-lg grid-cols-3 gap-6" style={{ animationDelay: "0.4s" }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl text-[#f5d000] sm:text-5xl">{s.value}</p>
                <p className="mt-1 text-xs text-[#ededed]/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <a href="#seco" aria-label="Scroll" className="text-xs tracking-[0.3em] text-white/50">
          <ChevronDown className="mx-auto h-7 w-7 animate-bounce" />
          SCROLL
        </a>
      </div>
    </section>
  );
}

/* ---------------- Marquee (items exactos) ---------------- */
const MARQUEE_ITEMS = [
  "Durlock & Knauf certificados",
  "Cielorrasos desmontables y PVC",
  "Pintura interior y exterior",
  "Reformas y construcción húmeda",
  "Venta de materiales",
  "Presupuesto sin cargo",
];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-[#2b2b2b] bg-[#f5d000] py-3">
      <div className="animate-marquee flex w-max items-center gap-8">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap text-sm font-bold tracking-wide text-black uppercase">
            {item} <Hammer className="h-4 w-4" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Section header ---------------- */
function SectionHeader({ tag, title, accent, subtitle, center = true }: { tag: string; title: string; accent?: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto mb-12 max-w-3xl text-center" : "mb-10 max-w-3xl"}>
      <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#f5d000] uppercase">{tag}</p>
      <h2 className="font-display text-4xl leading-[0.95] text-white sm:text-5xl md:text-6xl">
        {title} {accent && <span className="text-[#f5d000]">{accent}</span>}
      </h2>
      <div className={`mt-5 h-[3px] w-11 bg-[#f5d000] ${center ? "mx-auto" : ""}`} />
      {subtitle && <p className="mt-6 leading-relaxed text-[#ededed]/60">{subtitle}</p>}
    </div>
  );
}

/* ---------------- Construcción en Seco (textos exactos artedur.com) ---------------- */
const DRY_SERVICES = [
  {
    num: "01",
    title: "Tabiques Durlock",
    desc: "Instalación de tabiques con placas Durlock y Knauf. Dividí ambientes, mejorá la acústica y la aislación térmica sin obra pesada ni suciedad.",
    tags: "Durlock · Knauf · Tabiques",
  },
  {
    num: "02",
    title: "Cielorraso Desmontable",
    desc: "Instalamos cielorraso desmontable con perfilería de aluminio y placas de yeso o vinílicas. Ideal para oficinas y comercios con acceso fácil a instalaciones.",
    tags: "Cielorraso · Desmontable",
  },
  {
    num: "03",
    title: "Cielorraso de Yeso",
    desc: "Cielorrasos de yeso aplicado directo o con estructura Durlock. Terminaciones lisas, con cornisas y molduras. La solución clásica y elegante para tu hogar.",
    tags: "Cielorraso · Yeso · Durlock",
  },
  {
    num: "04",
    title: "Cielorraso PVC",
    desc: "Instalación de cielorraso PVC para cocinas, baños y lavaderos. Material resistente a la humedad, fácil de limpiar, en distintos diseños y colores.",
    tags: "Cielorraso PVC · Baños",
  },
];

const REVEST_TAGS = ["Durlock", "Knauf", "Cielorraso", "Tabiques", "Revestimiento", "Construcción en seco"];

function DrySection() {
  return (
    <section id="seco" className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Nuestros servicios principales"
          title="Construcción"
          accent="en Seco"
          subtitle="Trabajamos con placas Durlock y Knauf para resolver cualquier proyecto de construcción en seco: desde tabiques divisorios hasta cielorrasos complejos. Rapidez, limpieza y acabado perfecto."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DRY_SERVICES.map((s) => (
            <article
              key={s.num}
              className="group flex flex-col border border-[#2b2b2b] bg-[#141414] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#f5d000] hover:shadow-[0_20px_40px_-15px_rgba(245,208,0,0.15)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-4xl text-[#f5d000]/25 transition-colors group-hover:text-[#f5d000]">{s.num}</span>
              </div>
              <h3 className="font-display text-2xl text-white">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#ededed]/60">{s.desc}</p>
              <p className="mt-4 text-xs font-semibold tracking-wider text-[#f5d000]">{s.tags}</p>
            </article>
          ))}
        </div>

        {/* Revestimientos y terminaciones — texto exacto artedur.com */}
        <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <div className="relative">
            <img
              src="/assets/82.jpeg"
              alt="Revestimiento de alta calidad en construcción en seco"
              className="h-[420px] w-full border border-[#2b2b2b] object-cover"
            />
            <div className="absolute -bottom-5 -left-5 hidden bg-[#f5d000] px-6 py-4 sm:block">
              <p className="font-display text-2xl text-black">Durlock · Knauf</p>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#f5d000] uppercase">Revestimientos y terminaciones</p>
            <h2 className="font-display text-4xl leading-[0.95] text-white sm:text-5xl">
              Revestimiento de <span className="text-[#f5d000]">Alta Calidad</span>
            </h2>
            <div className="mt-5 h-[3px] w-11 bg-[#f5d000]" />
            <p className="mt-6 leading-relaxed text-[#ededed]/60">
              Nuestro equipo realiza revestimientos interiores con placas de yeso, fibrocemento y materiales especiales.
              Cada trabajo se ejecuta con los estándares que exigen las marcas <strong className="text-white">Durlock</strong> y{" "}
              <strong className="text-white">Knauf</strong>. Terminaciones prolijas, durables y estéticamente superiores.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {REVEST_TAGS.map((t) => (
                <span key={t} className="border border-[#f5d000]/30 bg-[#f5d000]/5 px-3 py-1.5 text-xs font-semibold text-[#f5d000]">
                  {t}
                </span>
              ))}
            </div>
            <a
              href="#contacto"
              className="mt-8 inline-flex items-center gap-2 bg-[#f5d000] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#d4b200]"
            >
              Solicitar presupuesto <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pisos (textos exactos artedur.com) ---------------- */
const FLOORS = [
  { title: "Cerámicos y Porcelanato", desc: "Colocación con junta perfecta, corte a medida y terminación impecable." },
  { title: "Pisos Vinílicos y Flotantes", desc: "Rápida instalación sin obra. Ideal para reformas con mínima rotura." },
  { title: "Pisos de Madera y Parquet", desc: "Instalación, lijado y tratamiento de pisos de madera maciza y laminados." },
  { title: "Microcemento", desc: "Aplicación en pisos y paredes para un look moderno, continuo y resistente." },
];

function FloorsSection() {
  return (
    <section id="pisos" className="bg-[#141414] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Pisos"
          title="Pisos para"
          accent="cada espacio"
          subtitle="Instalamos y colocamos pisos de distintos materiales para ambientes residenciales y comerciales. Trabajamos con precisión para garantizar un resultado nivelado, prolijo y duradero."
        />
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {FLOORS.map((f, i) => (
              <div key={f.title} className="border border-[#2b2b2b] bg-[#0a0a0a] p-6 transition-colors hover:border-[#f5d000]">
                <p className="font-display text-3xl text-[#f5d000]">0{i + 1}</p>
                <h3 className="mt-2 font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#ededed]/60">{f.desc}</p>
              </div>
            ))}
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 bg-[#f5d000] px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-[#d4b200] sm:col-span-2"
            >
              Consultar sobre pisos <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-4">
            <img
              src="/assets/47.jpeg"
              alt="Colocación de pisos en Buenos Aires"
              className="h-[300px] w-full border border-[#2b2b2b] object-cover"
            />
            <div className="grid grid-cols-2 gap-4">
              <img
                src="/assets/59.jpeg"
                alt="Instalación de pisos cerámicos y porcelanato en Buenos Aires"
                className="h-[190px] w-full border border-[#2b2b2b] object-cover"
              />
              <img
                src="/assets/70.jpeg"
                alt="Piso vinílico instalado en interior de vivienda Buenos Aires"
                className="h-[190px] w-full border border-[#2b2b2b] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pintura (textos exactos artedur.com) ---------------- */
const PAINT_GALLERY = [
  { img: "/assets/8.jpeg", label: "Pintura interior" },
  { img: "/assets/10.jpeg", label: "Frente exterior" },
  { img: "/assets/19.jpeg", label: "Aplicación látex" },
  { img: "/assets/20.jpeg", label: "Acabado blanco" },
  { img: "/assets/33.jpeg", label: "Trabajos en altura" },
  { img: "/assets/21.jpeg", label: "Techos y molduras" },
];

const PAINT_POINTS = [
  "Preparación de superficies",
  "Acabado final yeso o enduido",
  "Pintura general interiores y exteriores",
  "Casas y edificios",
  "Trabajos en altura",
  "Andamios y silletas",
  "Frentes, terrazas y techos",
];

function PaintingSection() {
  return (
    <section id="pintura" className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Pintura profesional"
          title="Pintura Interior"
          accent="& Exterior"
          subtitle="Pintores profesionales con amplia experiencia para casas, edificios y frentes comerciales en toda la Ciudad de Buenos Aires y Gran Buenos Aires."
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="grid grid-cols-2 gap-3">
              {PAINT_GALLERY.map((g) => (
                <div key={g.label} className="group relative h-40 overflow-hidden border border-[#2b2b2b]">
                  <img src={g.img} alt={g.label} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2 text-xs font-semibold text-white">
                    {g.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display text-3xl text-white sm:text-4xl">Nuestros trabajos de pintura incluyen:</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {PAINT_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 border border-[#2b2b2b] bg-[#141414] px-4 py-3 text-sm text-[#ededed]/80">
                  <span className="h-2 w-2 shrink-0 bg-[#f5d000]" /> {p}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-[#ededed]/60">
              En <strong className="text-white">ARTEDUR</strong> sabemos que una buena pintura empieza antes de aplicar el
              color. La preparación de superficies es clave: lijado, enduido, masillado y corrección de imperfecciones
              para un acabado profesional que dure en el tiempo.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#ededed]/60">
              Trabajamos con productos de primera línea: látex acrílicos, esmaltes e impermeabilizantes para exteriores.
              Nuestro equipo cuenta con andamios y silletas para trabajos en altura en edificios, frentes y terrazas con
              total seguridad.
            </p>
            <a
              href="#contacto"
              className="mt-6 inline-flex items-center gap-2 bg-[#f5d000] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#d4b200]"
            >
              Pedir presupuesto de pintura <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Materiales (textos exactos artedur.com) ---------------- */
const MATERIALS = [
  "Placas Durlock",
  "Placas Knauf",
  "Perfiles y Montantes",
  "Pinturas y Esmaltes",
  "Cielorraso PVC",
  "Enduido y Masilla",
  "Cerámicos y Porcelanato",
  "Impermeabilizantes",
];

function MaterialsSection() {
  return (
    <section id="materiales" className="bg-[#141414] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Venta mayorista y minorista"
          title="Venta de"
          accent="Materiales"
          subtitle="Stock permanente de los principales materiales para construcción en seco. Trabajamos con las marcas líderes del mercado argentino."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MATERIALS.map((m) => (
            <a
              key={m}
              href="#contacto"
              className="group flex flex-col justify-between border border-[#2b2b2b] bg-[#0a0a0a] p-6 transition-all hover:border-[#f5d000]"
            >
              <p className="font-display text-xl leading-tight text-white">{m}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#f5d000] uppercase">
                Consultar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border border-[#f5d000]/30 bg-[#f5d000]/5 p-6 sm:flex-row">
          <p className="text-sm text-[#ededed]/80">No encontrás lo que buscás? Consultanos por cualquier material.</p>
          <a
            href="#contacto"
            className="inline-flex shrink-0 items-center gap-2 bg-[#f5d000] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#d4b200]"
          >
            Consultar disponibilidad <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Trabajos (12 imágenes reales de artedur.com) ---------------- */
const WORKS = [
  "/assets/32.jpeg", "/assets/2.jpeg", "/assets/3.jpeg",
  "/assets/4.jpeg", "/assets/5.jpeg", "/assets/6.jpeg",
  "/assets/7.jpeg", "/assets/21.jpeg", "/assets/33.jpeg",
  "/assets/10.jpeg", "/assets/19.jpeg", "/assets/12.jpeg",
];

function WorksSection() {
  return (
    <section id="trabajos" className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Portfolio de obras"
          title="Trabajos"
          accent="Realizados"
          subtitle="Más de 500 obras ejecutadas en CABA y Gran Buenos Aires. Desde pequeñas reformas hasta grandes proyectos de construcción en seco y terminaciones."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKS.map((img, i) => (
            <figure key={i} className="group relative h-64 cursor-pointer overflow-hidden border border-[#2b2b2b]">
              <img
                src={img}
                alt={`Trabajo realizado ARTEDUR ${i + 1} - construcción en seco Buenos Aires`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#f5d000]/0 transition-colors duration-300 group-hover:bg-[#f5d000]/10" />
            </figure>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-sm text-[#ededed]/60">Queres un trabajo así? Consultanos</p>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 border border-[#f5d000] px-7 py-3.5 text-sm font-bold text-[#f5d000] transition-colors hover:bg-[#f5d000] hover:text-black"
          >
            Ver más Trabajos <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contacto (textos exactos artedur.com) ---------------- */
function ContactSection() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", interest: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast({ title: "Faltan datos", description: "Completá al menos tu nombre y mensaje.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setForm({ name: "", phone: "", interest: "", message: "" });
      toast({
        title: "¡Gracias! 🎉",
        description: "Tu consulta fue recibida. Nuestro bot ya preparó una respuesta para vos.",
      });
    } catch {
      toast({ title: "Error", description: "No se pudo enviar. Probá de nuevo.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contacto" className="bg-[#141414] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Estamos para ayudarte"
          title="Contacto"
          subtitle="Contactanos para solicitar tu presupuesto sin cargo. Respondemos a la brevedad en horario comercial."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4 border border-[#2b2b2b] bg-[#0a0a0a] p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="c-name">Nombre completo *</Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre"
                className="border-[#2b2b2b] bg-[#141414]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">Teléfono</Label>
              <Input
                id="c-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="11-XXXX-XXXX"
                className="border-[#2b2b2b] bg-[#141414]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-msg">Mensaje *</Label>
              <Textarea
                id="c-msg"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Contanos qué necesitás..."
                rows={5}
                className="border-[#2b2b2b] bg-[#141414]"
              />
            </div>
            <Button type="submit" disabled={sending} className="w-full bg-[#f5d000] text-black hover:bg-[#d4b200]">
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                "Enviar consulta"
              )}
            </Button>
            {sent && (
              <p className="rounded-md border border-[#f5d000]/40 bg-[#f5d000]/10 px-4 py-3 text-center text-sm text-[#f5d000]">
                Gracias! Te contactaremos a la brevedad.
              </p>
            )}
          </form>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-6">
              <MapPin className="mb-3 h-6 w-6 text-[#f5d000]" />
              <h3 className="font-display text-xl text-white">Dirección</h3>
              <p className="mt-2 text-sm text-[#ededed]/60">Av. Castañares 2123 – CABA</p>
              <p className="text-sm text-[#ededed]/60">Av. Rivadavia 10514 - CABA</p>
              <p className="text-sm text-[#ededed]/60">Ciudad Autónoma de Buenos Aires</p>
            </div>
            <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-6">
              <Mail className="mb-3 h-6 w-6 text-[#f5d000]" />
              <h3 className="font-display text-xl text-white">Email</h3>
              <a href="mailto:artedur@yahoo.com.ar" className="mt-2 block break-all text-sm text-[#ededed]/60 hover:text-[#f5d000]">
                artedur@yahoo.com.ar
              </a>
              <p className="mb-2 mt-4 text-xs font-bold tracking-widest text-[#f5d000] uppercase">Redes Sociales</p>
              <div className="flex items-center gap-4 text-sm text-[#ededed]/60">
                <a href="https://instagram.com/artedur.ar" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#f5d000]">
                  <Instagram className="h-4 w-4" /> artedur.ar
                </a>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-[#ededed]/60">
                <a href="https://facebook.com/artedur" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#f5d000]">
                  <Facebook className="h-4 w-4" /> artedur
                </a>
              </div>
            </div>
            <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-6">
              <Phone className="mb-3 h-6 w-6 text-[#f5d000]" />
              <h3 className="font-display text-xl text-white">Teléfonos</h3>
              <p className="mt-2 text-sm text-[#ededed]/60">11-6691-9404</p>
              <p className="text-sm text-[#ededed]/60">15-6255-2131</p>
              <p className="text-sm text-[#ededed]/60">15-2252-5222</p>
            </div>
            <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-6">
              <Clock className="mb-3 h-6 w-6 text-[#f5d000]" />
              <h3 className="font-display text-xl text-white">Horarios de atención</h3>
              <p className="mt-2 text-sm text-[#ededed]/60">Lunes a Viernes: 8:00 a 17:00 hs.</p>
              <p className="text-sm text-[#ededed]/60">Sábados: 8:00 a 13:00 hs.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer (textos exactos artedur.com) ---------------- */
function Footer() {
  return (
    <footer className="mt-auto border-t border-[#2b2b2b] bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl leading-none text-white">
              ARTE<span className="text-[#f5d000]">DUR</span>
            </p>
            <span className="text-[10px] font-semibold tracking-[0.35em] text-[#f5d000]">DURLOCK</span>
            <p className="mt-3 max-w-sm text-sm text-[#ededed]/50">
              Especialistas en construcción en seco, Durlock, cielorrasos, pintura y reformas en Buenos Aires desde hace
              más de 25 años.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold tracking-widest text-[#f5d000] uppercase">Servicios</p>
            <ul className="space-y-2 text-sm text-[#ededed]/60">
              <li><a href="#seco" className="transition-colors hover:text-[#f5d000]">Construcción en seco</a></li>
              <li><a href="#seco" className="transition-colors hover:text-[#f5d000]">Tabiques Durlock</a></li>
              <li><a href="#seco" className="transition-colors hover:text-[#f5d000]">Cielorraso desmontable</a></li>
              <li><a href="#seco" className="transition-colors hover:text-[#f5d000]">Cielorraso PVC</a></li>
              <li><a href="#pisos" className="transition-colors hover:text-[#f5d000]">Pisos</a></li>
              <li><a href="#pintura" className="transition-colors hover:text-[#f5d000]">Pintura interior y exterior</a></li>
              <li><a href="#materiales" className="transition-colors hover:text-[#f5d000]">Venta de materiales</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold tracking-widest text-[#f5d000] uppercase">Contacto</p>
            <ul className="space-y-2 text-sm text-[#ededed]/60">
              <li><a href="mailto:artedur@yahoo.com.ar" className="transition-colors hover:text-[#f5d000]">artedur@yahoo.com.ar</a></li>
              <li><a href="tel:1166919404" className="transition-colors hover:text-[#f5d000]">11-6691-9404</a></li>
              <li><a href="tel:1562552131" className="transition-colors hover:text-[#f5d000]">15-6255-2131</a></li>
              <li><a href="tel:1522525222" className="transition-colors hover:text-[#f5d000]">15-2252-5222</a></li>
              <li>Av. Castañares 2123 – CABA</li>
              <li>Av. Rivadavia 10514 - CABA</li>
              <li>Lun–Vie 8–17 hs · Sáb 8–13 hs</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-[#2b2b2b] pt-6 text-center text-xs text-[#ededed]/40 sm:flex-row sm:text-left">
          <p>© 2026 ARTEDUR · Todos los derechos reservados</p>
          <p>Construcción en seco · Durlock · Reformas · Buenos Aires</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Page ---------------- */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <DrySection />
        <FloorsSection />
        <PaintingSection />
        <MaterialsSection />
        <WorksSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsappWidget />
    </div>
  );
}
