import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

/**
 * Resolución de DATABASE_URL compatible con Vercel:
 * - Si DATABASE_URL apunta a una base alojada (postgres, mysql, turso, etc.) se usa tal cual.
 * - Si el entorno es serverless (Vercel), el filesystem es de solo lectura excepto /tmp,
 *   por lo que se copia la base SQLite incluida en el repo (db/custom.db, con datos demo)
 *   a /tmp y se usa desde ahí en el primer arranque.
 * - En desarrollo local se usa la DATABASE_URL de .env (file:./db/custom.db).
 */
function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL

  // Base de datos alojada (no SQLite) → respetar tal cual
  if (configured && !configured.startsWith('file:')) {
    return configured
  }

  // Serverless (Vercel): copiar la base incluida a /tmp (únicos datos persistibles)
  if (process.env.VERCEL === '1') {
    try {
      const src = path.join(process.cwd(), 'db', 'custom.db')
      const dest = '/tmp/artedur.db'
      if (fs.existsSync(src) && !fs.existsSync(dest)) {
        fs.copyFileSync(src, dest)
      }
      return 'file:/tmp/artedur.db'
    } catch {
      // si falla la copia, seguir con la URL configurada
    }
  }

  return configured || 'file:./db/custom.db'
}

process.env.DATABASE_URL = resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
