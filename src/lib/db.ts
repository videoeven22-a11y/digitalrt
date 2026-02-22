import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitialized: boolean
}

// Database path configuration for different platforms:
// - Render: /app/data/smartwarga.db (persistent disk)
// - Vercel/Cloudflare: /tmp/smartwarga.db (temporary, not persistent)
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

// Create Prisma client
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    datasourceUrl: getDatabaseUrl(),
  })
}

// Export database client
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Initialize database with default data
// This runs on first connection and ensures admin exists
export async function initializeDatabase() {
  // Prevent multiple initializations
  if (globalForPrisma.dbInitialized) {
    return
  }
  
  try {
    console.log('[DB] Checking database initialization...')
    
    // Check if admin exists
    const adminCount = await db.adminUser.count()
    
    if (adminCount === 0) {
      console.log('[DB] No admin found, creating default admin...')
      
      // Create default admin
      await db.adminUser.create({
        data: {
          username: 'admin',
          password: 'admin123',
          name: 'Pak RT',
          role: 'Super Admin'
        }
      })
      console.log('[DB] Default admin created: admin/admin123')
    }
    
    // Check RT config
    const configCount = await db.rTConfig.count()
    
    if (configCount === 0) {
      console.log('[DB] Creating default RT config...')
      await db.rTConfig.create({
        data: {
          id: 'default',
          rtName: 'Pak RT',
          rtWhatsapp: '628123456789',
          rtEmail: 'rt03@smartwarga.id',
          appName: 'SmartWarga RT 03',
          appLogo: ''
        }
      })
      console.log('[DB] Default RT config created')
    }
    
    globalForPrisma.dbInitialized = true
    console.log('[DB] Database initialized successfully')
  } catch (error) {
    console.error('[DB] Initialization error:', error)
    // Don't throw, allow app to continue
  }
}

// Auto-initialize on first query (wrapper pattern)
const originalFindFirst = db.adminUser.findFirst.bind(db.adminUser)
db.adminUser.findFirst = async (...args: any[]) => {
  await initializeDatabase()
  return originalFindFirst(...args)
}
