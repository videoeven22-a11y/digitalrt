import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In development, clear cached PrismaClient to pick up new models
if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
  const client = globalForPrisma.prisma as any
  if (!client.syncConfig) {
    globalForPrisma.prisma = undefined
  }
}

// Database path configuration for different platforms:
// - Render: /app/data/smartwarga.db (persistent disk)
// - Vercel: /tmp/smartwarga.db (temporary, not persistent)
// - Railway: uses default path
// - Local: uses .env or default
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }
  
  // Check for Render's persistent disk
  if (process.env.RENDER) {
    return 'file:/app/data/smartwarga.db'
  }
  
  // Default to /tmp for serverless environments
  return 'file:/tmp/smartwarga.db'
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  datasourceUrl: getDatabaseUrl(),
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}