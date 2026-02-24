import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all service requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    
    const requests = await db.serviceRequest.findMany({
      where: {
        AND: [
          status !== 'all' ? { status } : {},
          type !== 'all' ? { type } : {}
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST - Create new service request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const serviceRequest = await db.serviceRequest.create({
      data: {
        nik: body.nik,
        residentName: body.residentName,
        type: body.type,
        status: 'Menunggu Verifikasi',
        purpose: body.purpose || null,
        address: body.address || null,
        pobDob: body.pobDob || null,
        deathDetails: body.deathDetails ? JSON.stringify(body.deathDetails) : null,
        nikahDetails: body.nikahDetails ? JSON.stringify(body.nikahDetails) : null,
        pindahDetails: body.pindahDetails ? JSON.stringify(body.pindahDetails) : null,
        shtmDetails: body.sktmDetails ? JSON.stringify(body.sktmDetails) : null,
        domisiliDetails: body.domisiliDetails ? JSON.stringify(body.domisiliDetails) : null
      }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'Pengajuan Surat Baru',
        user: body.residentName,
        target: `${body.type} - NIK: ${body.nik}`,
        type: 'CREATE'
      }
    });

    // Update resident status for Surat Pindah or Surat Kematian
    if (body.statusUpdate) {
      try {
        await db.resident.update({
          where: { nik: body.nik },
          data: {
            status: body.statusUpdate.status as 'AKTIF' | 'PINDAH' | 'MENINGGAL',
            statusDate: body.statusUpdate.statusDate,
            statusNote: body.statusUpdate.statusNote
          }
        });
        
        // Create audit log for status change
        await db.auditLog.create({
          data: {
            action: `Update Status Warga: ${body.statusUpdate.status}`,
            user: body.residentName,
            target: `NIK: ${body.nik} - ${body.statusUpdate.statusNote}`,
            type: 'UPDATE'
          }
        });
      } catch (updateError) {
        console.error('Error updating resident status:', updateError);
        // Continue even if status update fails (resident might not exist)
      }
    }
    
    return NextResponse.json({ success: true, data: serviceRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ success: false, error: 'Failed to create request' }, { status: 500 });
  }
}

// PUT - Update service request (for status updates)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const serviceRequest = await db.serviceRequest.update({
      where: { id: body.id },
      data: {
        status: body.status,
        pdfUrl: body.pdfUrl
      }
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        action: body.status === 'Disetujui' ? 'Persetujuan Surat' : 'Penolakan Surat',
        user: body.currentUser || 'Admin',
        target: `${serviceRequest.type} - ${serviceRequest.residentName}`,
        type: body.status === 'Disetujui' ? 'APPROVE' : 'REJECT'
      }
    });
    
    return NextResponse.json({ success: true, data: serviceRequest });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ success: false, error: 'Failed to update request' }, { status: 500 });
  }
}
