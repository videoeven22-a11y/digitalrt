import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all information
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') === 'true';
    
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (activeOnly) where.isActive = true;
    
    const information = await db.information.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    
    return NextResponse.json({ success: true, data: information });
  } catch (error) {
    console.error('Error fetching information:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch information' }, { status: 500 });
  }
}

// POST - Create new information
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const info = await db.information.create({
      data: {
        category: body.category,
        title: body.title,
        content: body.content,
        link: body.link || null,
        icon: body.icon || null,
        color: body.color || 'blue',
        order: body.order || 0,
        isActive: body.isActive ?? true
      }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'Tambah Informasi',
        user: body.currentUser || 'Admin',
        target: `${body.category}: ${body.title}`,
        type: 'CREATE'
      }
    });
    
    return NextResponse.json({ success: true, data: info });
  } catch (error) {
    console.error('Error creating information:', error);
    return NextResponse.json({ success: false, error: 'Failed to create information' }, { status: 500 });
  }
}

// PUT - Update information
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const info = await db.information.update({
      where: { id: body.id },
      data: {
        category: body.category,
        title: body.title,
        content: body.content,
        link: body.link || null,
        icon: body.icon || null,
        color: body.color,
        order: body.order,
        isActive: body.isActive
      }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'Update Informasi',
        user: body.currentUser || 'Admin',
        target: `${body.category}: ${body.title}`,
        type: 'UPDATE'
      }
    });
    
    return NextResponse.json({ success: true, data: info });
  } catch (error) {
    console.error('Error updating information:', error);
    return NextResponse.json({ success: false, error: 'Failed to update information' }, { status: 500 });
  }
}

// DELETE - Delete information
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const currentUser = searchParams.get('currentUser');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    
    // Get info before delete for audit log
    const info = await db.information.findUnique({ where: { id } });
    
    await db.information.delete({ where: { id } });
    
    // Create audit log
    if (info) {
      await db.auditLog.create({
        data: {
          action: 'Hapus Informasi',
          user: currentUser || 'Admin',
          target: `${info.category}: ${info.title}`,
          type: 'DELETE'
        }
      });
    }
    
    return NextResponse.json({ success: true, message: 'Information deleted successfully' });
  } catch (error) {
    console.error('Error deleting information:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete information' }, { status: 500 });
  }
}
