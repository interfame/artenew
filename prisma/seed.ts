import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Seeding Artedur database...");

  // Admin user
  await prisma.user.upsert({
    where: { email: "josedemo@demo.com" },
    update: {},
    create: {
      email: "josedemo@demo.com",
      password: hashPassword("artedur2026"),
      name: "José Demo",
      role: "admin",
    },
  });

  // Products - materiales de construcción en seco (precios ARS)
  const products = [
    { sku: "DUR-STD-95", name: "Placa Durlock STD 9.5mm 1200x2400", category: "Placas", brand: "Durlock", unit: "placa", price: 12500, cost: 9800, stock: 240, minStock: 50 },
    { sku: "DUR-RH-125", name: "Placa Durlock RH 12.5mm Resistente Humedad", category: "Placas", brand: "Durlock", unit: "placa", price: 18900, cost: 15200, stock: 160, minStock: 40 },
    { sku: "KNA-STD-95", name: "Placa Knauf STD 9.5mm 1200x2400", category: "Placas", brand: "Knauf", unit: "placa", price: 11800, cost: 9200, stock: 180, minStock: 40 },
    { sku: "PER-MON-89", name: "Montante 89mm x 3m Galvanizado", category: "Perfiles", brand: "Durlock", unit: "unidad", price: 8200, cost: 6400, stock: 320, minStock: 60 },
    { sku: "PER-EST-70", name: "Perfil Estructural 70mm x 3m", category: "Perfiles", brand: "Knauf", unit: "unidad", price: 9500, cost: 7400, stock: 210, minStock: 50 },
    { sku: "PER-SOL-35", name: "Solera 35mm x 3m", category: "Perfiles", brand: "Durlock", unit: "unidad", price: 5400, cost: 4100, stock: 400, minStock: 80 },
    { sku: "TOR-APX-1000", name: "Tornillos Autoperforantes 6x1\" x1000", category: "Fijaciones", brand: "Grabber", unit: "caja", price: 15000, cost: 11800, stock: 85, minStock: 20 },
    { sku: "CIN-PAPEL-150", name: "Cinta de Papel para Juntas 150m", category: "Terminaciones", brand: "Durlock", unit: "rollo", price: 4200, cost: 3100, stock: 120, minStock: 30 },
    { sku: "END-MAS-20", name: "Enduido Plástico Masilla 20kg", category: "Terminaciones", brand: "Gatwick", unit: "baldde", price: 16500, cost: 12800, stock: 65, minStock: 15 },
    { sku: "LAT-BLA-20", name: "Látex Interior Blanco 20L", category: "Pinturas", brand: "Tersuave", unit: "bidón", price: 45000, cost: 36000, stock: 45, minStock: 10 },
    { sku: "ESM-SIN-4", name: "Esmalte Sintético Blanco 4L", category: "Pinturas", brand: "Alba", unit: "lata", price: 28000, cost: 22000, stock: 38, minStock: 10 },
    { sku: "FIS-SEL-4", name: "Fijador Sellador Acrílico 4L", category: "Pinturas", brand: "Petrilac", unit: "lata", price: 19500, cost: 15200, stock: 52, minStock: 12 },
    { sku: "IMP-ASF-20", name: "Impermeabilizante Asfáltico 20L", category: "Impermeabilizantes", brand: "Firplas", unit: "bidón", price: 68000, cost: 55000, stock: 22, minStock: 6 },
    { sku: "PVC-CIE-250", name: "Placa PVC Cielorraso 250mm x 6m Blanca", category: "Cielorraso PVC", brand: "Tigre", unit: "placa", price: 14500, cost: 11200, stock: 190, minStock: 40 },
    { sku: "AIS-LAV-50", name: "Lana de Vidrio 50mm x 1.2m Rollo", category: "Aislaciones", brand: "Isover", unit: "rollo", price: 22000, cost: 17500, stock: 34, minStock: 8 },
    { sku: "PIS-VIN-M2", name: "Piso Vinílico SPC 4mm Roble Natural", category: "Pisos", brand: "Premo", unit: "m2", price: 18000, cost: 14200, stock: 500, minStock: 100 },
    { sku: "ADI-VIN-20", name: "Adhesivo para Pisos Vinílicos 20kg", category: "Pisos", brand: "Furio", unit: "baldde", price: 9800, cost: 7600, stock: 40, minStock: 10 },
    { sku: "PLA-CEP-12", name: "Placa de Yeso Cépia 12mm", category: "Terminaciones", brand: "Cerámicas San Lorenzo", unit: "m2", price: 7800, cost: 6100, stock: 300, minStock: 60 },
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { sku: p.sku }, update: {}, create: p });
  }

  // Leads CRM
  const leads = [
    { name: "María González", phone: "+54 9 11 5566-7788", email: "maria.gonzalez@gmail.com", source: "web", status: "nuevo", interest: "Cielorraso desmontable", notes: "Consultó por cielorraso para cocina en Caballito, apto 60m2." },
    { name: "Carlos Rodríguez", phone: "+54 9 11 4433-2211", email: "carlosrod@hotmail.com", source: "whatsapp", status: "contactado", interest: "Tabiques Durlock", notes: "Quiere dividir un ambiente en su depto de Palermo. Presupuestar visita." },
    { name: "Estudio Jurídico Ávila & Asoc.", phone: "+54 11 4788-9900", email: "admin@avilaasoc.com.ar", source: "facebook", status: "presupuesto", interest: "Oficina completa", notes: "Oficina 120m2 en Microcentro: tabiques, cielorraso desmontable y pintura. Presupuesto enviado: $4.200.000." },
    { name: "Laura Ferreyra", phone: "+54 9 11 2233-4455", email: "lauryferr@yahoo.com.ar", source: "instagram", status: "negociacion", interest: "Piso vinílico", notes: "55m2 de SPC en Flores. Negociando precio por pago contado." },
    { name: "Consorcio Edificio Rivadavia 10500", phone: "+54 11 4455-6677", email: "consorcio.rivadavia@gmail.com", source: "referido", status: "ganado", interest: "Pintura de frente", notes: "Pintura completa de frente y terraza. Aprobado por ABL de propietarios." },
    { name: "Diego Sarmiento", phone: "+54 9 11 6677-8899", email: "diego.sarmiento@gmail.com", source: "web", status: "nuevo", interest: "Revestimiento en seco", notes: "Quiere revestir pared de living con placas y LED." },
    { name: "Ferretería El Clavo de Oro", phone: "+54 11 4411-2233", email: "ventas@elclavodeoro.com.ar", source: "referido", status: "ganado", interest: "Venta mayorista", notes: "Cliente mayorista recurrente: compra mensual de placas y perfiles." },
    { name: "Ana Paula Vega", phone: "+54 9 11 7788-9900", email: "anapvega@gmail.com", source: "whatsapp", status: "contactado", interest: "Cielorraso PVC", notes: "Cocina y lavadero. Consultó por colores disponibles." },
    { name: "Constructora del Sur SRL", phone: "+54 11 4999-8877", email: "compras@cdelsur.com.ar", source: "facebook", status: "presupuesto", interest: "Obra completa 3 pisos", notes: "Licitación: 3 pisos de construcción en seco en Villa Devoto." },
    { name: "Jorge Malagrino", phone: "+54 9 11 1122-3344", email: "jorgemala@hotmail.com", source: "telefono", status: "perdido", interest: "Pintura interior", notes: "Le resultó caro. Recontactar en 6 meses." },
  ];
  for (const l of leads) {
    await prisma.lead.create({ data: l });
  }

  // Clients
  const clients = [
    { name: "Consorcio Edificio Rivadavia 10500", phone: "+54 11 4455-6677", email: "consorcio.rivadavia@gmail.com", address: "Av. Rivadavia 10500, CABA", cuit: "30-71234567-4", type: "empresa", notes: "Pintura de frente aprobada 2026." },
    { name: "Ferretería El Clavo de Oro", phone: "+54 11 4411-2233", email: "ventas@elclavodeoro.com.ar", address: "Av. Castañares 2000, CABA", cuit: "30-69876543-2", type: "empresa", notes: "Mayorista. Cuenta corriente 30 días." },
    { name: "Ricardo Pompey", phone: "+54 9 11 3344-5566", email: "rickypompey@gmail.com", address: "Callao 900, CABA", type: "particular", notes: "Reforma integral de departamento." },
    { name: "Panadería La Espiga", phone: "+54 11 4566-7788", email: "laespiga@gmail.com", address: "Av. Directorio 3400, CABA", type: "empresa", notes: "Cielorraso PVC en cocina." },
  ];
  for (const c of clients) {
    await prisma.client.create({ data: c });
  }

  // Invoices
  const invoices = [
    {
      number: "0001-00000001", type: "B", clientName: "Consorcio Edificio Rivadavia 10500", status: "pagada",
      items: JSON.stringify([
        { description: "Pintura de frente completo - 180m2", qty: 180, price: 8500 },
        { description: "Andamios y silletas - 15 días", qty: 15, price: 12000 },
        { description: "Enduido y preparación de superficie", qty: 1, price: 380000 },
      ]),
      subtotal: 2150000, iva: 451500, total: 2601500, paymentMethod: "transferencia",
    },
    {
      number: "0001-00000002", type: "A", clientName: "Ferretería El Clavo de Oro", status: "pagada",
      items: JSON.stringify([
        { description: "Placa Durlock STD 9.5mm", qty: 60, price: 12500 },
        { description: "Montante 89mm x 3m", qty: 80, price: 8200 },
      ]),
      subtotal: 1406000, iva: 295260, total: 1701260, paymentMethod: "cuenta corriente",
    },
    {
      number: "0001-00000003", type: "B", clientName: "Ricardo Pompey", status: "pendiente",
      items: JSON.stringify([
        { description: "Tabique Durlock doble placa 12m2", qty: 12, price: 38000 },
        { description: "Cielorraso yeso aplicado 22m2", qty: 22, price: 26000 },
      ]),
      subtotal: 1028000, iva: 215880, total: 1243880,
    },
    {
      number: "0001-00000004", type: "B", clientName: "Panadería La Espiga", status: "pagada",
      items: JSON.stringify([
        { description: "Cielorraso PVC blanco 28m2", qty: 28, price: 15500 },
        { description: "Perfilería PVC y accesorios", qty: 1, price: 96000 },
      ]),
      subtotal: 530000, iva: 111300, total: 641300, paymentMethod: "efectivo",
    },
  ];
  for (const inv of invoices) {
    await prisma.invoice.create({
      data: { ...inv, paidAt: inv.status === "pagada" ? new Date() : null },
    });
  }

  // Campaigns
  const campaigns = [
    {
      name: "Cielorrasos Invierno 2026", channel: "facebook", objective: "leads", status: "activa",
      budget: 250000, spent: 87500,
      headline: "Cielorraso desmontable desde $26.000/m2 ✨",
      body: "Renová tu hogar u oficina sin obra. Durlock certificado, installment en 12 cuotas. Presupuesto gratis en 24hs.",
      cta: "Pedir presupuesto", audience: "CABA y GBA, 28-60 años, interesados en remodelación",
      startDate: new Date("2026-06-01"),
      results: JSON.stringify({ impressions: 84200, clicks: 3120, leads: 47, cpl: 1862 }),
    },
    {
      name: "Durlock Oferta Placas", channel: "instagram", objective: "ventas", status: "activa",
      budget: 180000, spent: 62400,
      headline: "Placas Durlock con 15% OFF pagando contado",
      body: "Stock permanente en Castañares y Rivadavia. Envíos a obra en CABA y GBA.",
      cta: "Ver precios", audience: "Constructores, arquitectos, ferreterías",
      startDate: new Date("2026-06-15"),
      results: JSON.stringify({ impressions: 51800, clicks: 2240, leads: 31, cpl: 2013 }),
    },
    {
      name: "Pintura de Frentes - Temporada", channel: "google", objective: "leads", status: "pausada",
      budget: 300000, spent: 231000,
      headline: "Pintura profesional de frentes y edificios",
      body: "Trabajos en altura con andamios y silletas. Más de 25 años en Buenos Aires.",
      cta: "Solicitar visita", audience: "Administradores de consorcios, CABA",
      startDate: new Date("2026-03-01"), endDate: new Date("2026-05-31"),
      results: JSON.stringify({ impressions: 126400, clicks: 4890, leads: 68, cpl: 3397 }),
    },
    {
      name: "WhatsApp Remarketing", channel: "whatsapp", objective: "ventas", status: "borrador",
      budget: 90000, spent: 0,
      headline: "¿Seguís pensando en renovar tus espacios?",
      body: "Te pasamos presupuesto sin cargo en 24hs. Respondé este mensaje.",
      cta: "Escribinos", audience: "Leads que consultaron y no compraron (90 días)",
    },
  ];
  for (const c of campaigns) {
    await prisma.campaign.create({ data: c });
  }

  // Social posts
  const posts = [
    {
      platform: "facebook", status: "publicado", aiGenerated: true, likes: 87, comments: 12,
      content: "🔨 Otra obra terminada en Palermo! Tabiques Durlock con aislación acústica para dividir el living en dos ambientes. Trabajo limpio, sin embarro y en 2 días. ¿Vos también querés sumar metros? Presupuesto gratis 👉 artedur.com",
      hashtags: "#Durlock #ConstrucciónEnSeco #Palermo #BuenosAires #ArteDur",
      publishedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
    {
      platform: "instagram", status: "publicado", aiGenerated: true, likes: 143, comments: 23,
      content: "✨ Cielorraso desmontable en oficina de Microcentro. Acceso total a instalaciones, terminación impecable y luz integrada. El antes y después habla por sí solo 👀",
      hashtags: "#Cielorraso #Oficinas #Reformas #ConstrucciónEnSeco",
      publishedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
    {
      platform: "facebook", status: "programado", aiGenerated: true,
      content: "📢 OFERTA DE LA SEMANA: Placas Durlock STD 9.5mm a precio mayorista. Retiro por Castañares o te lo llevamos a obra. Stock permanente garantizado. Consultá por cantidades 🏗️",
      hashtags: "#Durlock #Oferta #Materiales #Construcción",
      scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
    },
    {
      platform: "facebook", status: "borrador", aiGenerated: false,
      content: "🧱 Nuevo ingreso: pisos vinílicos SPC 4mm en 6 diseños de madera. Impermeables, ideales para cocinas. Colocación disponible con nuestro equipo.",
      hashtags: "#PisosVinílicos #SPC #Remodelación",
    },
  ];
  for (const p of posts) {
    await prisma.socialPost.create({ data: p });
  }

  // Email templates
  const templates = [
    {
      name: "Respuesta a consulta web", category: "bienvenida", subject: "Recibimos tu consulta - ArteDur Construcción en Seco",
      body: "Hola {nombre}!\n\nGracias por contactarte con ArteDur. Recibimos tu consulta sobre {interes} y un especialista te va a responder dentro de las próximas 24 horas hábiles.\n\nSi querés acelerar el proceso, escribinos por WhatsApp al 11-6691-9404.\n\nSaludos,\nEquipo ArteDur\nConstrucción en seco - Buenos Aires",
    },
    {
      name: "Envío de presupuesto", category: "presupuesto", subject: "Tu presupuesto de ArteDur está listo 📋",
      body: "Hola {nombre}!\n\nTe adjuntamos el presupuesto por {interes} que solicitaste.\n\nEl mismo tiene una validez de 15 días e incluye materiales y mano de obra. Cualquier ajuste que necesites, respondé este mail y lo vemos juntos.\n\nSaludos,\nEquipo ArteDur",
    },
    {
      name: "Seguimiento post-presupuesto", category: "seguimiento", subject: "¿Pudiste ver el presupuesto, {nombre}?",
      body: "Hola {nombre}!\n\nTe escribimos para saber si pudiste ver el presupuesto que te enviamos sobre {interes}.\n\nSi tenés dudas o querés ajustar algo, estamos a tu disposición. También podemos coordinar una visita técnica sin cargo.\n\nSaludos,\nEquipo ArteDur",
    },
    {
      name: "Promoción mensual clientes", category: "promocion", subject: "Nueva promo del mes en materiales 🏗️",
      body: "Hola!\n\nEste mes tenemos ofertas especiales en placas Durlock y perfilería con descuentos por cantidad.\n\nPasá por Av. Castañares 2123 o Av. Rivadavia 10514 y mostrá este mail.\n\nEquipo ArteDur",
    },
  ];
  for (const t of templates) {
    await prisma.emailTemplate.create({ data: t });
  }

  // Email logs
  const emailLogs = [
    { to: "admin@avilaasoc.com.ar", subject: "Tu presupuesto de ArteDur está listo 📋", body: "Presupuesto por oficina 120m2: tabiques, cielorraso y pintura. Total $4.200.000.", leadId: "estudio", status: "enviado", aiGenerated: true },
    { to: "consorcio.rivadavia@gmail.com", subject: "Confirmación de inicio de obra", body: "Confirmamos inicio de pintura de frente para el lunes 8hs.", status: "enviado" },
    { to: "lauryferr@yahoo.com.ar", subject: "¿Pudiste ver el presupuesto, Laura?", body: "Seguimiento del presupuesto de piso vinílico 55m2 en Flores.", leadId: "laura", status: "enviado", aiGenerated: true },
  ];
  for (const e of emailLogs) {
    await prisma.emailLog.create({ data: e });
  }

  // Conversations WhatsApp
  const conversations = [
    {
      contactName: "María González", phone: "+54 9 11 5566-7788", status: "bot", unread: 1,
      messages: [
        { role: "user", content: "Hola, vi la página. Quisiera saber cuánto sale un cielorraso desmontable de 15 metros cuadrados", aiGenerated: false },
        { role: "bot", content: "¡Hola María! 👋 Gracias por escribir a ArteDur. El cielorraso desmontable arranca en $26.000/m2 incluyendo perfilería de aluminio y colocación. Para 15m2 estaríamos hablando de un estimado de $390.000. ¿Te parece si coordinamos una visita técnica sin cargo para darte el precio exacto? 🏗️", aiGenerated: true },
        { role: "user", content: "Sí, me interesa. Podrían venir esta semana?", aiGenerated: false },
      ],
    },
    {
      contactName: "Carlos Rodríguez", phone: "+54 9 11 4433-2211", status: "abierta", unread: 0,
      messages: [
        { role: "user", content: "Buenas! Hacen tabiques de durlock con aislación acústica?", aiGenerated: false },
        { role: "bot", content: "¡Buenas Carlos! Sí, hacemos tabiques Durlock y Knauf con lana de vidrio para máxima aislación acústica. Ideal para dividir ambientes sin obra pesada 💪 ¿Para qué zona sería? Te armamos presupuesto sin cargo.", aiGenerated: true },
        { role: "agent", content: "Hola Carlos, soy José de ArteDur. Te paso el detalle del tabique doble placa con aislación. Podemos coordinar visita el jueves o viernes, el que te quede mejor.", aiGenerated: false },
      ],
    },
    {
      contactName: "Ferretería El Clavo de Oro", phone: "+54 11 4411-2233", status: "atendida", unread: 0,
      messages: [
        { role: "user", content: "José, necesito 40 placas RH y 60 montantes. Para el viernes.", aiGenerated: false },
        { role: "agent", content: "Dale, te las separo. 40 RH 12.5 y 60 montantes 89mm. Te paso la factura A por mail. Envío a obra incluido en CABA 👌", aiGenerated: false },
      ],
    },
  ];
  for (const c of conversations) {
    await prisma.conversation.create({
      data: {
        contactName: c.contactName,
        phone: c.phone,
        status: c.status,
        unread: c.unread,
        messages: { create: c.messages },
      },
    });
  }

  // Activities
  const activities = [
    { type: "sistema", content: "Lead recibido desde formulario web" },
    { type: "llamada", content: "Llamada de contacto: interesado en visita técnica" },
    { type: "email", content: "Presupuesto enviado por email: $4.200.000" },
    { type: "nota", content: "Cliente negocia descuento por pago contado. Máximo 8%." },
    { type: "sistema", content: "Lead generado desde campaña Facebook 'Cielorrasos Invierno 2026'" },
  ];
  for (const a of activities) {
    await prisma.activity.create({ data: a });
  }

  console.log("Seed completed!");
  console.log("Admin: josedemo@demo.com / artedur2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
