import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to ensure default admin exists
async function ensureDefaultAdmin() {
  const adminCount = await db.adminUser.count();
  if (adminCount === 0) {
    await db.adminUser.create({
      data: {
        username: 'admin',
        password: 'admin123',
        name: 'Ketua RT',
        role: 'Super Admin'
      }
    });
    console.log('Default admin created: admin / admin123');
  }
  
  // Also ensure RT config exists
  const configCount = await db.rTConfig.count();
  if (configCount === 0) {
    await db.rTConfig.create({
      data: {
        id: 'default',
        rtName: 'Ketua RT',
        rtWhatsapp: '628123456789',
        rtEmail: 'rt03.kpjati@smartwarga.id',
        appName: 'SmartWarga RT 03 Kp. Jati',
        appLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Logo_RT_RW.png'
      }
    });
    console.log('Default RT config created');
  }
}

// GET - Fetch all admin users
export async function GET() {
  try {
    // Ensure default admin exists
    await ensureDefaultAdmin();
    
    const admins = await db.adminUser.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST - Login or Create admin
export async function POST(request: NextRequest) {
  try {
    // Ensure default admin exists before any operation
    await ensureDefaultAdmin();
    
    const body = await request.json();
    
    // Login action
    if (body.action === 'login') {
      const admin = await db.adminUser.findFirst({
        where: {
          username: body.username,
          password: body.password // In production, use proper password hashing
        }
      });
      
      if (!admin) {
        return NextResponse.json({ 
          success: false, 
          error: 'Username atau password salah' 
        }, { status: 401 });
      }
      
      // Create audit log
      await db.auditLog.create({
        data: {
          action: 'Login Admin',
          user: admin.name,
          target: `Username: ${admin.username}`,
          type: 'LOGIN'
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        data: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role
        }
      });
    }
    
    // Create new admin (Hanya Super Admin)
    if (body.action === 'create') {
      // Validasi: Hanya Super Admin yang bisa tambah admin
      if (body.requesterRole !== 'Super Admin') {
        return NextResponse.json({ 
          success: false, 
          error: 'Hanya Super Admin yang dapat menambah admin baru' 
        }, { status: 403 });
      }
      
      const existing = await db.adminUser.findUnique({
        where: { username: body.username }
      });
      
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: 'Username sudah digunakan' 
        }, { status: 400 });
      }
      
      const admin = await db.adminUser.create({
        data: {
          username: body.username,
          password: body.password,
          name: body.name,
          role: body.role || 'Staf'
        }
      });
      
      // Create audit log
      await db.auditLog.create({
        data: {
          action: 'Tambah Admin Baru',
          user: body.currentUser || 'Admin',
          target: `Username: ${body.username}`,
          type: 'CREATE'
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        data: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role
        }
      });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin operation:', error);
    return NextResponse.json({ success: false, error: 'Operation failed' }, { status: 500 });
  }
}

// PUT - Update admin (Hanya Super Admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, username, password, role, requesterRole } = body;
    
    // Validasi: Hanya Super Admin yang bisa edit admin
    if (requesterRole !== 'Super Admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Hanya Super Admin yang dapat mengedit admin' 
      }, { status: 403 });
    }
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    // Check if username already exists (for other users)
    if (username) {
      const existing = await db.adminUser.findFirst({
        where: {
          username,
          NOT: { id }
        }
      });
      
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: 'Username sudah digunakan' 
        }, { status: 400 });
      }
    }
    
    // Build update data
    const updateData: { name?: string; username?: string; password?: string; role?: string } = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    
    const admin = await db.adminUser.update({
      where: { id },
      data: updateData
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'Edit Admin',
        user: body.currentUser || 'Admin',
        target: `Username: ${admin.username}`,
        type: 'UPDATE'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ success: false, error: 'Failed to update admin' }, { status: 500 });
  }
}

// DELETE - Delete admin (Hanya Super Admin)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const requesterRole = searchParams.get('requesterRole');
    
    // Validasi: Hanya Super Admin yang bisa hapus admin
    if (requesterRole !== 'Super Admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Hanya Super Admin yang dapat menghapus admin' 
      }, { status: 403 });
    }
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    // Check if this is the last Super Admin
    const admin = await db.adminUser.findUnique({ where: { id } });
    if (admin?.role === 'Super Admin') {
      const superAdminCount = await db.adminUser.count({
        where: { role: 'Super Admin' }
      });
      
      if (superAdminCount <= 1) {
        return NextResponse.json({ 
          success: false, 
          error: 'Tidak dapat menghapus Super Admin terakhir. Minimal harus ada 1 Super Admin.' 
        }, { status: 400 });
      }
    }
    
    await db.adminUser.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete admin' }, { status: 500 });
  }
}
