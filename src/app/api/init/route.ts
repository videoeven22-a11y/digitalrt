import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Auto-initialize database with default admin and config
export async function GET() {
  try {
    console.log('[Init] Starting database initialization...');
    
    // Try to check if admin exists, if error, run db push first
    let existingAdmin;
    try {
      existingAdmin = await db.adminUser.findFirst();
    } catch (error: any) {
      console.log('[Init] Database tables not found, need to create them');
      // If table doesn't exist, we can't do much in serverless
      // Just try to create admin anyway
    }
    
    if (existingAdmin) {
      console.log('[Init] Admin already exists:', existingAdmin.username);
      return NextResponse.json({ 
        success: true, 
        message: 'Database sudah terinisialisasi',
        admin: { username: existingAdmin.username, name: existingAdmin.name }
      });
    }
    
    // Create default admin user
    console.log('[Init] Creating default admin...');
    const admin = await db.adminUser.create({
      data: {
        username: 'admin',
        password: 'admin123',
        name: 'Pak RT',
        role: 'Super Admin'
      }
    });
    console.log('[Init] Admin created:', admin.username);
    
    // Create default RT config
    let config;
    try {
      config = await db.rTConfig.create({
        data: {
          id: 'default',
          rtName: 'Pak RT',
          rtWhatsapp: '628123456789',
          rtEmail: 'rt@smartwarga.id',
          appName: 'SmartWarga RT',
          appLogo: ''
        }
      });
      console.log('[Init] RT Config created');
    } catch (e) {
      console.log('[Init] RT Config might already exist, skipping');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database berhasil diinisialisasi! Login dengan admin/admin123',
      admin: { username: admin.username, name: admin.name }
    });
  } catch (error: any) {
    console.error('[Init] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hint: 'Jika error tentang tabel tidak ada, pastikan database sudah di-migrate di build time.'
    }, { status: 500 });
  }
}
