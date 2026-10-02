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
  MessageCircle,
  X,
  Send,
  Loader2,
  Hammer,
  Ruler,
  Paintbrush,
  Layers,
  LayoutGrid,
  Store,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

/* ---------------- WhatsApp Bot Widget ---------------- */
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
        "¡Hola! 👋 Soy el asistente virtual de ArteDur. ¿En qué te puedo ayudar? Puedo darte info de servicios, precios orientativos y coordinar tu presupuesto gratis 🏗️",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

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
        body: JSON.stringify({ phone: "web-widget", contactName: "Visitante Web", message: text }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "bot", content: data.reply || "Gracias por escribir! Te respondemos a la brevedad." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", content: "Ups, hubo un error. Escribinos al 11-6691-9404 📱" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Chat WhatsApp"
        className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          open ? "bg-[#1e1e1e] text-[#f5d000]" : "bg-[#25D366] text-white animate-pulse-yellow hover:scale-110"
        }`}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[480px] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[#2b2b2b] bg-[#0f0f0f] shadow-2xl animate-fade-up">
          <div className="flex items-center gap-3 bg-[#1e1e1e] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">ArteDur · WhatsApp</p>
              <p className="text-xs text-[#25D366]">● En línea · Respuesta inmediata</p>
            </div>
          </div>
          <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-[#0b141a] p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[#005c4b] text-white"
                      : "rounded-bl-sm bg-[#1f2c33] text-[#e9edef]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl rounded-bl-sm bg-[#1f2c33] px-4 py-3">
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
        <a href="#inicio" className="flex items-center gap-2">
          <span className="font-display text-3xl tracking-wide text-white">
            ARTE<span className="text-[#f5d000]">DUR</span>
          </span>
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
            {menuOpen ? <X className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
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

/* ---------------- Hero ---------------- */
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
        style={{ backgroundImage: "url(/img/hero.jpg)" }}
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
        <a href="#seco" aria-label="Bajar">
          <ChevronDown className="h-7 w-7 animate-bounce text-white/50" />
        </a>
      </div>
    </section>
  );
}

/* ---------------- Marquee ---------------- */
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
function SectionHeader({ tag, title, accent, subtitle }: { tag: string; title: string; accent?: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#f5d000] uppercase">{tag}</p>
      <h2 className="font-display text-4xl text-white sm:text-5xl md:text-6xl">
        {title} {accent && <span className="text-[#f5d000]">{accent}</span>}
      </h2>
      {subtitle && <p className="mt-4 text-[#ededed]/60">{subtitle}</p>}
    </div>
  );
}

/* ---------------- Construcción en Seco ---------------- */
const DRY_SERVICES = [
  {
    icon: <LayoutGrid className="h-8 w-8" />,
    title: "Tabiques Durlock",
    desc: "Instalación de tabiques con placas Durlock y Knauf. Dividí ambientes, mejorá la acústica y la aislación térmica sin obra pesada ni suciedad.",
    tags: "Durlock · Knauf · Tabiques",
  },
  {
    icon: <Ruler className="h-8 w-8" />,
    title: "Cielorraso Desmontable",
    desc: "Perfilería de aluminio y placas de yeso o vinílicas. Ideal para oficinas y comercios con fácil acceso a instalaciones.",
    tags: "Cielorraso · Desmontable",
  },
  {
    icon: <Layers className="h-8 w-8" />,
    title: "Cielorraso de Yeso",
    desc: "Aplicado directo o con estructura Durlock. Terminaciones lisas, con cornisas y molduras. La solución clásica y elegante para tu hogar.",
    tags: "Cielorraso · Yeso · Durlock",
  },
  {
    icon: <Paintbrush className="h-8 w-8" />,
    title: "Cielorraso PVC",
    desc: "Para cocinas, baños y lavaderos. Material resistente a la humedad, fácil de limpiar, en distintos diseños y colores.",
    tags: "Cielorraso PVC · Baños",
  },
];

function DrySection() {
  return (
    <section id="seco" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Servicios principales"
          title="Construcción"
          accent="en Seco"
          subtitle="Trabajamos con placas Durlock y Knauf para resolver cualquier proyecto: rapidez, limpieza y acabado perfecto."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DRY_SERVICES.map((s) => (
            <article
              key={s.title}
              className="group flex flex-col border border-[#2b2b2b] bg-[#141414] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#f5d000] hover:shadow-[0_20px_40px_-15px_rgba(245,208,0,0.15)]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center border border-[#f5d000]/30 bg-[#f5d000]/10 text-[#f5d000] transition-colors group-hover:bg-[#f5d000] group-hover:text-black">
                {s.icon}
              </div>
              <h3 className="font-display text-2xl text-white">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#ededed]/60">{s.desc}</p>
              <p className="mt-4 text-xs font-semibold tracking-wider text-[#f5d000]">{s.tags}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pisos ---------------- */
const FLOORS = [
  { title: "Cerámicos y Porcelanato", desc: "Colocación con junta perfecta, corte a medida y terminación impecable." },
  { title: "Pisos Vinílicos y Flotantes", desc: "Rápida instalación sin obra. Ideal para reformas con mínima rotura." },
  { title: "Pisos de Madera y Parquet", desc: "Instalación, lijado y tratamiento de pisos de madera maciza y laminados." },
  { title: "Microcemento", desc: "Aplicación en pisos y paredes para un look moderno, continuo y resistente." },
];

function FloorsSection() {
  return (
    <section id="pisos" className="bg-[#141414] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader tag="Revestimientos y terminaciones" title="Pisos para" accent="cada espacio" />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {FLOORS.map((f, i) => (
              <div key={f.title} className="border border-[#2b2b2b] bg-[#0a0a0a] p-6 transition-colors hover:border-[#f5d000]">
                <p className="font-display text-3xl text-[#f5d000]">0{i + 1}</p>
                <h3 className="mt-2 font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#ededed]/60">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="relative">
            <img
              src="/img/work-pisos.jpg"
              alt="Instalación de pisos vinílicos"
              className="h-[420px] w-full border border-[#2b2b2b] object-cover"
            />
            <div className="absolute -bottom-5 -left-5 hidden bg-[#f5d000] px-6 py-4 sm:block">
              <p className="font-display text-2xl text-black">Colocación certificada</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pintura ---------------- */
const PAINT_POINTS = [
  "Preparación de superficies",
  "Acabado final yeso o enduido",
  "Pintura general interiores y exteriores",
  "Casas y edificios",
  "Andamios y silletas",
  "Frentes, terrazas y techos",
];

function PaintingSection() {
  return (
    <section id="pintura" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader tag="Pintura profesional" title="Pintura Interior" accent="& Exterior" />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-3">
              {["Pintura interior", "Frente exterior", "Aplicación látex", "Trabajos en altura"].map((t) => (
                <div key={t} className="relative h-28 overflow-hidden border border-[#2b2b2b] bg-[#141414]">
                  <img src="/img/work-pintura.jpg" alt={t} className="h-full w-full object-cover opacity-40" />
                  <span className="absolute bottom-2 left-3 text-sm font-semibold text-white">{t}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-[#ededed]/60">
              En <strong className="text-white">ARTEDUR</strong> sabemos que una buena pintura empieza antes de aplicar el
              color: lijado, enduido, masillado y corrección de imperfecciones. Trabajamos con productos de primera línea:
              látex acrílicos, esmaltes e impermeabilizantes.
            </p>
            <a
              href="#contacto"
              className="mt-6 inline-flex items-center gap-2 bg-[#f5d000] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#d4b200]"
            >
              Pedir presupuesto de pintura <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="font-display text-3xl text-white sm:text-4xl">Nuestros trabajos incluyen:</h3>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {PAINT_POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 border border-[#2b2b2b] bg-[#141414] px-4 py-3 text-sm text-[#ededed]/80">
                  <span className="h-2 w-2 shrink-0 bg-[#f5d000]" /> {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Materiales ---------------- */
const MATERIALS = [
  "Placas Durlock",
  "Placas Knauf",
  "Perfiles y Montantes",
  "Pinturas y Esmaltes",
  "Enduido y Masilla",
  "Impermeabilizantes",
];

function MaterialsSection() {
  return (
    <section id="materiales" className="bg-[#141414] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-[#f5d000] uppercase">Venta mayorista y minorista</p>
            <h2 className="font-display text-4xl text-white sm:text-5xl md:text-6xl">
              Venta de <span className="text-[#f5d000]">Materiales</span>
            </h2>
            <p className="mt-4 max-w-lg text-[#ededed]/60">
              Stock permanente de los principales materiales para construcción en seco. Trabajamos con las marcas líderes
              del mercado argentino.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {MATERIALS.map((m) => (
                <div key={m} className="flex items-center gap-3 border border-[#2b2b2b] bg-[#0a0a0a] px-4 py-3.5 text-sm font-medium text-[#ededed]/80">
                  <Store className="h-4 w-4 shrink-0 text-[#f5d000]" /> {m}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[#ededed]/50">¿No encontrás lo que buscás? Consultanos por cualquier material.</p>
            <a
              href="#contacto"
              className="mt-6 inline-flex items-center gap-2 bg-[#f5d000] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#d4b200]"
            >
              Consultar disponibilidad <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <img
            src="/img/materiales.jpg"
            alt="Materiales de construcción en seco"
            className="h-[440px] w-full border border-[#2b2b2b] object-cover"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Trabajos ---------------- */
const WORKS = [
  { img: "/img/work-tabiques.jpg", title: "Tabiques en Palermo", cat: "Durlock" },
  { img: "/img/work-cielorraso.jpg", title: "Cielorraso oficina Microcentro", cat: "Desmontable" },
  { img: "/img/work-pintura.jpg", title: "Frente en Belgrano", cat: "Pintura" },
  { img: "/img/work-pisos.jpg", title: "Vinílicos en Flores", cat: "Pisos" },
  { img: "/img/work-revestimiento.jpg", title: "Revestimiento con LED", cat: "Terminaciones" },
  { img: "/img/work-comercio.jpg", title: "Local comercial en Caballito", cat: "Integral" },
];

function WorksSection() {
  return (
    <section id="trabajos" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Portfolio de obras"
          title="Realizados"
          subtitle="Más de 500 obras ejecutadas en CABA y Gran Buenos Aires. Desde pequeñas reformas hasta grandes proyectos de construcción en seco."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WORKS.map((w) => (
            <figure key={w.title} className="group relative h-64 cursor-pointer overflow-hidden border border-[#2b2b2b]">
              <img
                src={w.img}
                alt={w.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-xs font-bold tracking-widest text-[#f5d000] uppercase">{w.cat}</p>
                <p className="font-display text-2xl text-white">{w.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 border border-[#f5d000] px-7 py-3.5 text-sm font-bold text-[#f5d000] transition-colors hover:bg-[#f5d000] hover:text-black"
          >
            ¿Querés un trabajo así? Consultanos <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contacto ---------------- */
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
    <section id="contacto" className="bg-[#141414] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          tag="Estamos para ayudarte"
          title="Contactanos"
          subtitle="Solicitá tu presupuesto sin cargo. Respondemos a la brevedad en horario comercial."
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4 border border-[#2b2b2b] bg-[#0a0a0a] p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-interest">Servicio de interés</Label>
              <Input
                id="c-interest"
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                placeholder="Ej: Cielorraso desmontable, pintura, materiales..."
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
                rows={4}
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
                ¡Gracias! Te contactaremos a la brevedad. Revisá tu WhatsApp 📱
              </p>
            )}
          </form>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-6">
              <MapPin className="mb-3 h-6 w-6 text-[#f5d000]" />
              <h3 className="font-display text-xl text-white">Dirección</h3>
              <p className="mt-2 text-sm text-[#ededed]/60">Av. Castañares 2123 – CABA</p>
              <p className="text-sm text-[#ededed]/60">Av. Rivadavia 10514 – CABA</p>
            </div>
            <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-6">
              <Phone className="mb-3 h-6 w-6 text-[#f5d000]" />
              <h3 className="font-display text-xl text-white">Teléfonos</h3>
              <p className="mt-2 text-sm text-[#ededed]/60">11-6691-9404</p>
              <p className="text-sm text-[#ededed]/60">15-6255-2131</p>
              <p className="text-sm text-[#ededed]/60">15-2252-5222</p>
            </div>
            <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-6">
              <Mail className="mb-3 h-6 w-6 text-[#f5d000]" />
              <h3 className="font-display text-xl text-white">Email</h3>
              <p className="mt-2 break-all text-sm text-[#ededed]/60">artedur@yahoo.com.ar</p>
              <div className="mt-3 flex gap-3">
                <a href="https://instagram.com/artedur.ar" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-[#ededed]/50 transition-colors hover:text-[#f5d000]">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://facebook.com/artedur" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-[#ededed]/50 transition-colors hover:text-[#f5d000]">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-6">
              <Clock className="mb-3 h-6 w-6 text-[#f5d000]" />
              <h3 className="font-display text-xl text-white">Horarios</h3>
              <p className="mt-2 text-sm text-[#ededed]/60">Lun a Vie: 8:00 a 17:00 hs.</p>
              <p className="text-sm text-[#ededed]/60">Sábados: 8:00 a 13:00 hs.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="mt-auto border-t border-[#2b2b2b] bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-4xl text-white">
              ARTE<span className="text-[#f5d000]">DUR</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-[#ededed]/50">
              Especialistas en construcción en seco, Durlock, cielorrasos, pintura y reformas en Buenos Aires desde hace
              más de 25 años.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold tracking-widest text-[#f5d000] uppercase">Servicios</p>
            <ul className="space-y-2 text-sm text-[#ededed]/60">
              <li>Construcción en seco · Durlock &amp; Knauf</li>
              <li>Cielorrasos desmontables y PVC</li>
              <li>Pisos y revestimientos</li>
              <li>Pintura interior y exterior</li>
              <li>Venta de materiales</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-bold tracking-widest text-[#f5d000] uppercase">Contacto</p>
            <ul className="space-y-2 text-sm text-[#ededed]/60">
              <li>Av. Castañares 2123 · CABA</li>
              <li>Av. Rivadavia 10514 · CABA</li>
              <li>11-6691-9404</li>
              <li>artedur@yahoo.com.ar</li>
              <li>Lun–Vie 8–17 hs · Sáb 8–13 hs</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-[#2b2b2b] pt-6 text-center text-xs text-[#ededed]/40">
          © 2026 ARTEDUR · Todos los derechos reservados · Construcción en seco · Durlock · Reformas · Buenos Aires
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
