import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pushSingleResident, deleteResidentFromSheet } from '@/lib/googleSheetsService';

// GET - Fetch all residents
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const gender = searchParams.get('gender') || 'all';
    const maritalStatus = searchParams.get('maritalStatus') || 'all';
    
    const residents = await db.resident.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search } },
              { nik: { contains: search } },
              { noKk: { contains: search } }
            ]
          },
          gender !== 'all' ? { gender } : {},
          maritalStatus !== 'all' ? { maritalStatus } : {}
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, data: residents });
  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch residents' }, { status: 500 });
  }
}

// POST - Create new resident
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if NIK already exists
    const existing = await db.resident.findUnique({
      where: { nik: body.nik }
    });
    
    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'NIK sudah terdaftar dalam sistem' 
      }, { status: 400 });
    }
    
    const resident = await db.resident.create({
      data: {
        nik: body.nik,
        noKk: body.noKk,
        name: body.name,
        pob: body.pob,
        dob: body.dob,
        gender: body.gender,
        religion: body.religion,
        occupation: body.occupation,
        bloodType: body.bloodType,
        maritalStatus: body.maritalStatus,
        province: body.province,
        regency: body.regency,
        district: body.district,
        village: body.village,
        address: body.address
      }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'Pendaftaran Warga Baru',
        user: body.currentUser || 'Warga (Public)',
        target: `Nama: ${body.name}`,
        type: 'CREATE'
      }
    });
    
    // Auto-sync to Google Sheet (non-blocking)
    pushSingleResident(resident).catch(err => 
      console.error('Auto-sync to sheet failed:', err)
    );
    
    return NextResponse.json({ success: true, data: resident });
  } catch (error) {
    console.error('Error creating resident:', error);
    return NextResponse.json({ success: false, error: 'Failed to create resident' }, { status: 500 });
  }
}

// PUT - Update resident
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const resident = await db.resident.update({
      where: { nik: body.nik },
      data: {
        noKk: body.noKk,
        name: body.name,
        pob: body.pob,
        dob: body.dob,
        gender: body.gender,
        religion: body.religion,
        occupation: body.occupation,
        bloodType: body.bloodType,
        maritalStatus: body.maritalStatus,
        province: body.province,
        regency: body.regency,
        district: body.district,
        village: body.village,
        address: body.address,
        status: body.status || 'AKTIF',
        statusDate: body.statusDate || null,
        statusNote: body.statusNote || null
      }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'Update Data Warga',
        user: body.currentUser || 'Warga (Public)',
        target: `NIK: ${body.nik}`,
        type: 'UPDATE'
      }
    });
    
    // Auto-sync to Google Sheet (non-blocking)
    pushSingleResident(resident).catch(err => 
      console.error('Auto-sync to sheet failed:', err)
    );
    
    return NextResponse.json({ success: true, data: resident });
  } catch (error) {
    console.error('Error updating resident:', error);
    return NextResponse.json({ success: false, error: 'Failed to update resident' }, { status: 500 });
  }
}

// DELETE - Delete resident
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nik = searchParams.get('nik');
    const currentUser = searchParams.get('currentUser') || 'Admin';
    
    if (!nik) {
      return NextResponse.json({ success: false, error: 'NIK is required' }, { status: 400 });
    }
    
    await db.resident.delete({
      where: { nik }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'Hapus Data Warga',
        user: currentUser,
        target: `NIK: ${nik}`,
        type: 'DELETE'
      }
    });
    
    // Auto-sync delete to Google Sheet (non-blocking)
    deleteResidentFromSheet(nik).catch(err => 
      console.error('Auto-sync delete from sheet failed:', err)
    );
    
    return NextResponse.json({ success: true, message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Error deleting resident:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete resident' }, { status: 500 });
  }
}
