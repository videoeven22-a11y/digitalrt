import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_RT_CONFIG } from '@/lib/constants';

// GET - Fetch RT configuration
export async function GET() {
  try {
    const config = await db.rTConfig.findFirst();
    
    if (!config) {
      // Create default config if not exists
      const newConfig = await db.rTConfig.create({
        data: DEFAULT_RT_CONFIG
      });
      return NextResponse.json({ success: true, data: newConfig });
    }
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch config' }, { status: 500 });
  }
}

// PUT - Update RT configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const existingConfig = await db.rTConfig.findFirst();
    
    let config;
    if (existingConfig) {
      config = await db.rTConfig.update({
        where: { id: existingConfig.id },
        data: {
          rtName: body.rtName,
          rtWhatsapp: body.rtWhatsapp,
          rtEmail: body.rtEmail,
          appName: body.appName,
          appLogo: body.appLogo
        }
      });
    } else {
      config = await db.rTConfig.create({
        data: {
          rtName: body.rtName,
          rtWhatsapp: body.rtWhatsapp,
          rtEmail: body.rtEmail,
          appName: body.appName,
          appLogo: body.appLogo
        }
      });
    }
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'Update Konfigurasi RT',
        user: body.currentUser || 'Admin',
        target: 'Pengaturan Sistem',
        type: 'UPDATE'
      }
    });
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ success: false, error: 'Failed to update config' }, { status: 500 });
  }
}
