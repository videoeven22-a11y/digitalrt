import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitialized: boolean
}

// Database configuration:
// - Production (Vercel): Use DATABASE_URL from environment (PostgreSQL)
// - Local development: Use SQLite if DATABASE_URL not set
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl) {
    // Development fallback - SQLite
    console.log('[DB] No DATABASE_URL found, using local SQLite')
    return 'file:./dev.db'
  }
  
  return dbUrl
}

// Create Prisma client
const createPrismaClient = () => {
  const dbUrl = getDatabaseUrl()
  const isPostgres = dbUrl.includes('postgresql') || dbUrl.includes('postgres')
  console.log('[DB] Using database:', isPostgres ? 'PostgreSQL' : 'SQLite')
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: dbUrl,
  })
}

// Export database client
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Initialize database with default data
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

    // Check information data
    const infoCount = await db.information.count()
    
    if (infoCount === 0) {
      console.log('[DB] Creating sample information...')
      
      const sampleInfo = [
        {
          category: 'jadwal',
          title: 'Jadwal Ronda Minggu Ini',
          content: 'Senin: Pak Budi, Rabu: Pak Ahmad, Jumat: Pak Dedi, Minggu: Pak Eko',
          color: 'violet',
          order: 1,
          isActive: true
        },
        {
          category: 'jadwal',
          title: 'Jadwal Ronda Minggu Depan',
          content: 'Senin: Pak Sugi, Rabu: Pak Tono, Jumat: Pak Wawan, Minggu: Pak Agus',
          color: 'violet',
          order: 2,
          isActive: true
        },
        {
          category: 'pengumuman',
          title: 'Kerja Bakti Sabtu Pagi',
          content: 'Diharapkan seluruh warga bergabung untuk kerja bakti membersihkan lingkungan RT.',
          color: 'amber',
          order: 1,
          isActive: true
        },
        {
          category: 'pemerintah',
          title: 'Program BLT Dana Desa',
          content: 'Pendaftaran BLT Dana Desa tahun 2025 dibuka hingga akhir bulan ini.',
          color: 'emerald',
          order: 1,
          isActive: true
        }
      ]

      for (const info of sampleInfo) {
        await db.information.create({ data: info })
      }
      console.log('[DB] Sample information created')
    }
    
    globalForPrisma.dbInitialized = true
    console.log('[DB] Database initialized successfully')
  } catch (error) {
    console.error('[DB] Initialization error:', error)
    // Don't throw, allow app to continue
  }
}
