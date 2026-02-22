import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all audit logs
export async function GET() {
  try {
    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
