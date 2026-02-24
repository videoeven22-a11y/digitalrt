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
      console.log('[Login] Attempt for user:', body.username || '(empty)');
      
      // Cek jumlah admin di database
      let adminCount = await db.adminUser.count();
      
      // Jika belum ada admin sama sekali, buat default admin
      if (adminCount === 0) {
        console.log('[Login] No admin found, creating default admin...');
        try {
          await db.adminUser.create({
            data: {
              username: 'admin',
              password: 'admin123',
              name: 'Pak RT',
              role: 'Super Admin'
            }
          });
          adminCount = 1;
          console.log('[Login] Default admin created: admin/admin123');
        } catch (e) {
          console.log('[Login] Could not create default admin, might already exist');
        }
      }
      
      // Jika username dan password kosong, cari default admin (admin/admin123)
      if (!body.username && !body.password) {
        const defaultAdmin = await db.adminUser.findFirst({
          where: {
            username: 'admin',
            password: 'admin123'
          }
        });
        
        if (defaultAdmin) {
          // Masih pakai default, izinkan login kosong
          console.log('[Login] Success with default admin (empty credentials)');
          return NextResponse.json({ 
            success: true, 
            data: {
              id: defaultAdmin.id,
              username: defaultAdmin.username,
              name: defaultAdmin.name,
              role: defaultAdmin.role
            }
          });
        }
        
        // Tidak ada default admin, harus isi username/password
        return NextResponse.json({ 
          success: false, 
          error: 'Username dan password harus diisi. Admin sudah dikonfigurasi.' 
        }, { status: 401 });
      }
      
      // Cari user berdasarkan username dan password
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
          error: 'Username atau password salah' 
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
    
    // Create new admin
    if (body.action === 'create') {
      // Cek apakah username sudah ada
      const existing = await db.adminUser.findUnique({
        where: { username: body.username }
      });
      
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: `Username "${body.username}" sudah digunakan. Coba username lain.` 
        }, { status: 400 });
      }
      
      // Tentukan role: jika belum ada admin sama sekali, jadi Super Admin
      const adminCount = await db.adminUser.count();
      const role = adminCount === 0 ? 'Super Admin' : (body.role || 'Staf');
      
      const admin = await db.adminUser.create({
        data: {
          username: body.username,
          password: body.password,
          name: body.name,
          role: role
        }
      });
      
      // Log audit
      try {
        await db.auditLog.create({
          data: {
            action: 'Tambah Admin',
            user: body.currentUser || 'System',
            target: `${admin.name} (${admin.username}) - ${admin.role}`,
            type: 'ADMIN'
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

// PUT - Update admin
export async function PUT(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const body = await request.json();
    const { id, name, username, password, role } = body;
    
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
          error: `Username "${username}" sudah digunakan. Coba username lain.` 
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
    
    // Log audit
    try {
      await db.auditLog.create({
        data: {
          action: 'Edit Admin',
          user: body.currentUser || 'System',
          target: `${admin.name} (${admin.username})`,
          type: 'ADMIN'
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
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ success: false, error: 'Failed to update admin' }, { status: 500 });
  }
}

// DELETE - Delete admin
export async function DELETE(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
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
    
    // Log audit
    try {
      await db.auditLog.create({
        data: {
          action: 'Hapus Admin',
          user: searchParams.get('currentUser') || 'System',
          target: admin ? `${admin.name} (${admin.username})` : id,
          type: 'ADMIN'
        }
      });
    } catch (e) {
      // Ignore audit log errors
    }
    
    return NextResponse.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete admin' }, { status: 500 });
  }
}
