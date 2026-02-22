import { NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Initialize database and create default admin
export async function GET() {
  console.log('[Init API] Starting database initialization...');
  
  try {
    // Try to initialize using Prisma
    await initializeDatabase();
    
    // Verify admin exists
    const admin = await db.adminUser.findFirst({
      where: { username: 'admin' }
    });
    
    if (admin) {
      return NextResponse.json({ 
        success: true, 
        message: '✅ Database siap! Login dengan: admin / admin123',
        admin: { username: admin.username, name: admin.name }
      });
    }
    
    // Create admin if not exists
    const newAdmin = await db.adminUser.create({
      data: {
        username: 'admin',
        password: 'admin123',
        name: 'Pak RT',
        role: 'Super Admin'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Admin berhasil dibuat! Login dengan: admin / admin123',
      admin: { username: newAdmin.username, name: newAdmin.name }
    });
    
  } catch (error: any) {
    console.error('[Init API] Error:', error);
    
    // Check if it's a "table doesn't exist" error
    if (error.message?.includes('does not exist') || 
        error.message?.includes('no such table') ||
        error.code === 'P2021') {
      
      return NextResponse.json({ 
        success: false, 
        error: 'Database tables belum dibuat',
        solution: 'Pastikan build command menyertakan: prisma db push',
        buildCommand: 'prisma generate && prisma db push --accept-data-loss && next build'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Force reset/recreate
export async function POST() {
  console.log('[Init API] Force creating admin...');
  
  try {
    // Try to create admin directly
    let admin;
    
    try {
      admin = await db.adminUser.create({
        data: {
          username: 'admin',
          password: 'admin123',
          name: 'Pak RT',
          role: 'Super Admin'
        }
      });
      console.log('[Init API] Admin created');
    } catch (createError: any) {
      // If admin exists, find it
      if (createError.code === 'P2002') {
        admin = await db.adminUser.findFirst({
          where: { username: 'admin' }
        });
        console.log('[Init API] Admin already exists');
      } else {
        throw createError;
      }
    }
    
    // Try to create RT config
    try {
      await db.rTConfig.create({
        data: {
          id: 'default',
          rtName: 'Pak RT',
          rtWhatsapp: '628123456789',
          rtEmail: 'rt03@smartwarga.id',
          appName: 'SmartWarga RT 03',
          appLogo: ''
        }
      });
    } catch (e) {
      // Ignore if exists
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Database siap! Login dengan: admin / admin123',
      admin: admin ? { username: admin.username, name: admin.name } : null
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      solution: 'Jika error tentang tabel tidak ada, deploy ulang dengan build command yang benar'
    }, { status: 500 });
  }
}
