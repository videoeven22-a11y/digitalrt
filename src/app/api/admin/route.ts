import { NextRequest, NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

// GET - Fetch all admin users
export async function GET() {
  try {
    // Initialize database first
    await initializeDatabase();
    
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
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch admins',
      hint: 'Coba akses /api/init terlebih dahulu'
    }, { status: 500 });
  }
}

// POST - Login or Create admin
export async function POST(request: NextRequest) {
  try {
    // Initialize database first
    await initializeDatabase();
    
    const body = await request.json();
    
    // Login action
    if (body.action === 'login') {
      console.log('[Login] Attempt for user:', body.username);
      
      const admin = await db.adminUser.findFirst({
        where: {
          username: body.username,
          password: body.password
        }
      });
      
      if (!admin) {
        console.log('[Login] Failed - invalid credentials');
        return NextResponse.json({ 
          success: false, 
          error: 'Username atau password salah. Gunakan: admin / admin123' 
        }, { status: 401 });
      }
      
      console.log('[Login] Success for:', admin.name);
      
      // Try to create audit log (ignore if fails)
      try {
        await db.auditLog.create({
          data: {
            action: 'Login Admin',
            user: admin.name,
            target: `Username: ${admin.username}`,
            type: 'LOGIN'
          }
        });
      } catch (e) {
        // Ignore audit log errors
      }
      
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
  } catch (error: any) {
    console.error('Error in admin operation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Operation failed: ' + error.message,
      hint: 'Coba akses /api/init terlebih dahulu, kemudian login dengan admin/admin123'
    }, { status: 500 });
  }
}

// PUT - Update admin (Hanya Super Admin)
export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const body = await request.json();
    const { id, name, username, password, role, requesterRole } = body;
    
    if (requesterRole !== 'Super Admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Hanya Super Admin yang dapat mengedit admin' 
      }, { status: 403 });
    }
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
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
    
    const updateData: { name?: string; username?: string; password?: string; role?: string } = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    
    const admin = await db.adminUser.update({
      where: { id },
      data: updateData
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
    await initializeDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const requesterRole = searchParams.get('requesterRole');
    
    if (requesterRole !== 'Super Admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Hanya Super Admin yang dapat menghapus admin' 
      }, { status: 403 });
    }
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    const admin = await db.adminUser.findUnique({ where: { id } });
    if (admin?.role === 'Super Admin') {
      const superAdminCount = await db.adminUser.count({
        where: { role: 'Super Admin' }
      });
      
      if (superAdminCount <= 1) {
        return NextResponse.json({ 
          success: false, 
          error: 'Tidak dapat menghapus Super Admin terakhir.' 
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
