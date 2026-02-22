import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pushAllResidentsToSheet, testServiceAccountConnection, extractSheetId } from '@/lib/googleSheetsService';

// Helper to get CSV URL
function getPublishedCsvUrl(sheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
}

// GET - Get sync config and logs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'logs') {
      const logs = await db.syncLog.findMany({
        take: 20,
        orderBy: { startedAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: logs });
    }

    if (action === 'export') {
      const residents = await db.resident.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      
      const headers = [
        'NIK', 'No KK', 'Nama Lengkap', 'Tempat Lahir', 'Tanggal Lahir',
        'Jenis Kelamin', 'Agama', 'Pekerjaan', 'Golongan Darah',
        'Status Perkawinan', 'Provinsi', 'Kabupaten', 'Kecamatan', 'Kelurahan',
        'Alamat', 'Status Warga', 'Tanggal Status', 'Keterangan Status', 'Updated At'
      ];

      const rows = residents.map(r => [
        r.nik, r.noKk, r.name, r.pob, r.dob, r.gender, r.religion, r.occupation,
        r.bloodType, r.maritalStatus, r.province, r.regency, r.district, r.village,
        r.address || '', r.status, r.statusDate || '', r.statusNote || '', r.updatedAt.toISOString()
      ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sync_warga_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default: get config
    const config = await db.syncConfig.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Save config, test connection, or run sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'test': {
        const sheetId = extractSheetId(data.sheetUrl);
        if (!sheetId) {
          return NextResponse.json({ 
            success: false, 
            data: { success: false, message: 'URL Google Sheet tidak valid' } 
          });
        }
        
        // If service account provided, test with it
        if (data.serviceAccount) {
          const result = await testServiceAccountConnection(data.serviceAccount, sheetId);
          return NextResponse.json({ success: true, data: result });
        }
        
        // Otherwise test with public CSV
        try {
          const response = await fetch(getPublishedCsvUrl(sheetId));
          if (!response.ok) {
            return NextResponse.json({ 
              success: false, 
              data: { success: false, message: 'Sheet tidak dapat diakses. Pastikan sudah di-publish ke web atau gunakan Service Account.' } 
            });
          }
          const text = await response.text();
          const lines = text.split('\n').filter(l => l.trim());
          return NextResponse.json({ 
            success: true, 
            data: { success: true, message: `Koneksi berhasil! Ditemukan ${Math.max(0, lines.length - 1)} baris data (mode read-only).`, rowCount: Math.max(0, lines.length - 1) } 
          });
        } catch (e: any) {
          return NextResponse.json({ 
            success: false, 
            data: { success: false, message: e.message } 
          });
        }
      }

      case 'connect': {
        const sheetId = extractSheetId(data.sheetUrl);
        
        // Validate service account if provided
        if (data.serviceAccount && sheetId) {
          const testResult = await testServiceAccountConnection(data.serviceAccount, sheetId);
          if (!testResult.success) {
            return NextResponse.json({ 
              success: false, 
              error: testResult.message 
            });
          }
        }
        
        const config = await db.syncConfig.upsert({
          where: { id: 'default' },
          create: {
            sheetUrl: data.sheetUrl,
            sheetId: sheetId,
            sheetName: data.sheetName || 'Sheet1',
            serviceAccount: data.serviceAccount || null,
            autoSync: data.autoSync ?? false,
            syncInterval: data.syncInterval ?? 60,
            isActive: true,
          },
          update: {
            sheetUrl: data.sheetUrl,
            sheetId: sheetId,
            sheetName: data.sheetName || 'Sheet1',
            serviceAccount: data.serviceAccount || null,
            autoSync: data.autoSync ?? false,
            syncInterval: data.syncInterval ?? 60,
            isActive: true,
          }
        });
        
        const hasWriteAccess = !!data.serviceAccount;
        return NextResponse.json({ 
          success: true, 
          data: config,
          message: hasWriteAccess 
            ? 'Koneksi berhasil! Anda dapat membaca DAN menulis ke Google Sheet.' 
            : 'Koneksi berhasil (read-only). Untuk menulis ke sheet, konfigurasi Service Account.'
        });
      }

      case 'push': {
        const result = await pushAllResidentsToSheet();
        return NextResponse.json({ success: result.success, data: result });
      }

      case 'pull': {
        const config = await db.syncConfig.findFirst({
          where: { isActive: true }
        });
        
        if (!config?.sheetId) {
          return NextResponse.json({ 
            success: false, 
            data: { success: false, message: 'Konfigurasi sinkronisasi tidak ditemukan' } 
          });
        }
        
        // Pull from sheet - read CSV and update local database
        try {
          const response = await fetch(getPublishedCsvUrl(config.sheetId));
          if (!response.ok) {
            return NextResponse.json({ 
              success: false, 
              data: { success: false, message: 'Tidak dapat mengambil data dari sheet' } 
            });
          }
          
          const text = await response.text();
          const lines = text.split('\n').filter(l => l.trim());
          
          if (lines.length < 2) {
            return NextResponse.json({ 
              success: true, 
              data: { success: true, message: 'Tidak ada data di sheet', recordsPulled: 0, recordsUpdated: 0 } 
            });
          }
          
          // Parse CSV
          const headers = parseCSVLine(lines[0]);
          let recordsPulled = 0;
          let recordsUpdated = 0;
          let recordsFailed = 0;
          
          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row: Record<string, string> = {};
            headers.forEach((h, idx) => {
              row[h.toLowerCase().trim()] = values[idx]?.trim() || '';
            });
            
            const nik = row['nik'] || row['no nik'] || row['no. nik'];
            if (!nik || nik.length < 16) {
              recordsFailed++;
              continue;
            }
            
            try {
              const existing = await db.resident.findUnique({ where: { nik } });
              
              const residentData = {
                nik,
                noKk: row['no kk'] || row['no_kk'] || row['nokk'] || row['kk'] || '',
                name: row['nama'] || row['nama lengkap'] || row['nama_lengkap'] || '',
                pob: row['tempat lahir'] || row['tempat_lahir'] || row['pob'] || '',
                dob: row['tanggal lahir'] || row['tanggal_lahir'] || row['tgl lahir'] || row['dob'] || '',
                gender: row['jenis kelamin'] || row['jenis_kelamin'] || row['jk'] || row['gender'] || 'Laki-laki',
                religion: row['agama'] || row['religion'] || 'Islam',
                occupation: row['pekerjaan'] || row['occupation'] || row['job'] || '',
                bloodType: row['golongan darah'] || row['golongan_darah'] || row['goldar'] || '',
                maritalStatus: row['status perkawinan'] || row['status_perkawinan'] || row['status kawin'] || 'Lajang',
                province: row['provinsi'] || row['province'] || '',
                regency: row['kabupaten'] || row['regency'] || row['kota'] || '',
                district: row['kecamatan'] || row['district'] || '',
                village: row['kelurahan'] || row['village'] || row['desa'] || '',
                address: row['alamat'] || row['address'] || '',
                status: (row['status warga'] || row['status_warga'] || row['status'] || 'AKTIF') as any,
                statusDate: row['tanggal status'] || row['status date'] || null,
                statusNote: row['keterangan status'] || row['status note'] || null,
              };
              
              if (existing) {
                await db.resident.update({ where: { nik }, data: residentData });
                recordsUpdated++;
              } else {
                await db.resident.create({ data: residentData });
                recordsPulled++;
              }
            } catch (e) {
              recordsFailed++;
            }
          }
          
          // Update sync config
          await db.syncConfig.update({
            where: { id: config.id },
            data: {
              lastSyncAt: new Date(),
              lastSyncStatus: recordsFailed > 0 ? 'partial' : 'success',
              lastSyncCount: recordsPulled + recordsUpdated,
            }
          });
          
          return NextResponse.json({ 
            success: true, 
            data: { 
              success: true, 
              message: `Berhasil mengambil ${recordsPulled} data baru dan mengupdate ${recordsUpdated} data`,
              recordsPulled, 
              recordsUpdated, 
              recordsFailed 
            } 
          });
        } catch (e: any) {
          return NextResponse.json({ 
            success: false, 
            data: { success: false, message: e.message } 
          });
        }
      }

      case 'sync': {
        // Push all data to sheet (overwrites)
        const result = await pushAllResidentsToSheet();
        return NextResponse.json({ success: result.success, data: result });
      }

      case 'disconnect': {
        await db.syncConfig.deleteMany({});
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Parse CSV line handling quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// DELETE - Remove sync config
export async function DELETE() {
  try {
    await db.syncConfig.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
