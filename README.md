# ARTEDUR — Web + CRM con Automatizaciones

Sitio web de ARTEDUR (construcción en seco, Durlock, cielorrasos, pintura, pisos y venta de materiales en Buenos Aires) con panel de administración tipo CRM y automatizaciones de marketing.

## 🌐 Sitio público (`/`)

Réplica del contenido de artedur.com: servicios de construcción en seco, pisos, pintura, venta de materiales, portfolio de obras, contacto. Incluye widget flotante de WhatsApp con **bot IA** que responde consultas de clientes automáticamente.

## 🔐 Panel CRM (`/admin`)

Acceso oculto (sin botón en el sitio público). Credenciales demo:

- **Email:** `josedemo@demo.com`
- **Contraseña:** `artedur2026`

Módulos:

| Módulo | Función |
|---|---|
| Dashboard | KPIs de facturación, leads, obras, cobranza y pipeline |
| CRM · Leads | Gestión de consultas, estados, notas, seguimiento con IA |
| Facturación | Facturas A/B con IVA 21%, estados e impresión |
| Campañas | Campañas de publicidad (Facebook/Instagram) con copy IA |
| Bot de Marketing | Generación y programación de posts con IA para redes |
| WhatsApp Bot | Bandeja de conversaciones con respuestas automáticas IA |
| Emails | Plantillas, redacción con IA y registro de envíos |
| Materiales | Stock y precios de productos |

## 🚀 Deploy en Vercel

1. Importá el repositorio en [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Next.js** (detectado automáticamente)
3. **No necesitás configurar variables de entorno** para funcionar con la base demo:
   - En producción (serverless), la app copia automáticamente `db/custom.db` (base demo incluida) a `/tmp` y la usa.
4. Deploy. Listo ✅

> **Nota importante:** SQLite en Vercel es efímero (`/tmp` se resetea en cada cold start). Para producción real con datos persistentes, recomendamos migrar a una base alojada (por ejemplo [Turso](https://turso.tech) con libSQL o Vercel Postgres):
> 1. Configurá la variable `DATABASE_URL` con la cadena de conexión de tu base alojada.
> 2. Aplicá el schema: `npx prisma db push`.
> La app detecta automáticamente cualquier `DATABASE_URL` que no sea `file:` y la usa sin cambios.

## 💻 Desarrollo local

```bash
npm install          # o bun install
cp .env.example .env
npx prisma generate
npx prisma db push   # crea la base local
npm run db:seed      # datos demo (opcional, la base ya viene con datos)
npm run dev
```

## 🛠️ Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM (SQLite)
- IA: respuestas del bot, generación de posts, emails y seguimientos (z-ai-web-dev-sdk)
- Autenticación por cookie httpOnly firmada (HMAC)

## ⚠️ Seguridad

Las credenciales incluidas son de demostración. Antes de llevar a producción, cambiá la contraseña del usuario admin en la base de datos.
