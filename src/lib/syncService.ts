// Google Sheets Sync Service
// Handles two-way synchronization between local database and Google Sheets

import { PrismaClient, Resident } from '@prisma/client';

// Create a fresh PrismaClient instance for sync operations
// This ensures we always have access to the latest models
const getPrismaClient = () => {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }
  
  // Always create a new client if syncConfig model is missing
  if (globalForPrisma.prisma) {
    const client = globalForPrisma.prisma as any
    if (!client.syncConfig) {
      globalForPrisma.prisma = new PrismaClient({ log: ['query'] })
    }
  } else {
    globalForPrisma.prisma = new PrismaClient({ log: ['query'] })
  }
  
  return globalForPrisma.prisma
}

const db = getPrismaClient()

// Types
export interface SyncConfigData {
  id?: string;
  sheetUrl: string;
  sheetId?: string;
  sheetName: string;
  syncToken?: string;
  autoSync: boolean;
  syncInterval: number;
  isActive: boolean;
}

export interface SyncResult {
  success: boolean;
  direction: 'push' | 'pull' | 'bidirectional';
  recordsPushed: number;
  recordsPulled: number;
  recordsUpdated: number;
  recordsFailed: number;
  message: string;
  details?: string;
}

export interface SheetRow {
  NIK: string;
  NoKK: string;
  Nama: string;
  TempatLahir: string;
  TanggalLahir: string;
  JenisKelamin: string;
  Agama: string;
  Pekerjaan: string;
  GolonganDarah: string;
  StatusPerkawinan: string;
  Provinsi: string;
  Kabupaten: string;
  Kecamatan: string;
  Kelurahan: string;
  Alamat: string;
  StatusWarga?: string;
  StatusDate?: string;
  StatusNote?: string;
  UpdatedAt?: string;
}

// Extract Sheet ID from Google Sheets URL
export function extractSheetId(url: string): string | null {
  // Match patterns like:
  // https://docs.google.com/spreadsheets/d/SHEET_ID/edit
  // https://docs.google.com/spreadsheets/d/SHEET_ID/edit?gid=0
  // https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Get CSV export URL from Sheet ID
export function getCsvExportUrl(sheetId: string, gid: string = '0'): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

// Get published CSV URL (for published sheets)
export function getPublishedCsvUrl(sheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
}

// Parse CSV to array of objects
function parseCsv(csvText: string): SheetRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Map headers to standard field names
  const fieldMap: Record<string, string> = {
    'nik': 'NIK',
    'no kk': 'NoKK',
    'no_kk': 'NoKK',
    'nokk': 'NoKK',
    'kk': 'NoKK',
    'nama': 'Nama',
    'nama lengkap': 'Nama',
    'nama_lengkap': 'Nama',
    'tempat lahir': 'TempatLahir',
    'tempat_lahir': 'TempatLahir',
    'pob': 'TempatLahir',
    'tanggal lahir': 'TanggalLahir',
    'tanggal_lahir': 'TanggalLahir',
    'tgl lahir': 'TanggalLahir',
    'dob': 'TanggalLahir',
    'ttl': 'TanggalLahir',
    'jenis kelamin': 'JenisKelamin',
    'jenis_kelamin': 'JenisKelamin',
    'jk': 'JenisKelamin',
    'gender': 'JenisKelamin',
    'agama': 'Agama',
    'religion': 'Agama',
    'pekerjaan': 'Pekerjaan',
    'occupation': 'Pekerjaan',
    'job': 'Pekerjaan',
    'golongan darah': 'GolonganDarah',
    'golongan_darah': 'GolonganDarah',
    'goldar': 'GolonganDarah',
    'blood type': 'GolonganDarah',
    'bloodtype': 'GolonganDarah',
    'status perkawinan': 'StatusPerkawinan',
    'status_perkawinan': 'StatusPerkawinan',
    'status kawin': 'StatusPerkawinan',
    'marital status': 'StatusPerkawinan',
    'provinsi': 'Provinsi',
    'province': 'Provinsi',
    'kabupaten': 'Kabupaten',
    'kabupaten/kota': 'Kabupaten',
    'kota': 'Kabupaten',
    'regency': 'Kabupaten',
    'kecamatan': 'Kecamatan',
    'district': 'Kecamatan',
    'kelurahan': 'Kelurahan',
    'village': 'Kelurahan',
    'desa': 'Kelurahan',
    'alamat': 'Alamat',
    'address': 'Alamat',
    'alamat lengkap': 'Alamat',
    'status warga': 'StatusWarga',
    'status_warga': 'StatusWarga',
    'status': 'StatusWarga',
  };

  // Normalize headers
  const normalizedHeaders = headers.map(h => {
    const normalized = h.toLowerCase().trim();
    return fieldMap[normalized] || h.trim();
  });

  // Parse rows
  const rows: SheetRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    
    normalizedHeaders.forEach((header, index) => {
      if (index < values.length) {
        row[header] = values[index]?.trim() || '';
      }
    });

    // Only add rows with valid NIK
    if (row['NIK'] && row['NIK'].length >= 16) {
      rows.push(row as SheetRow);
    }
  }

  return rows;
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

// Convert Resident to SheetRow
function residentToRow(resident: Resident): SheetRow {
  return {
    NIK: resident.nik,
    NoKK: resident.noKk,
    Nama: resident.name,
    TempatLahir: resident.pob,
    TanggalLahir: resident.dob,
    JenisKelamin: resident.gender,
    Agama: resident.religion,
    Pekerjaan: resident.occupation,
    GolonganDarah: resident.bloodType,
    StatusPerkawinan: resident.maritalStatus,
    Provinsi: resident.province,
    Kabupaten: resident.regency,
    Kecamatan: resident.district,
    Kelurahan: resident.village,
    Alamat: resident.address || '',
    StatusWarga: resident.status,
    StatusDate: resident.statusDate || '',
    StatusNote: resident.statusNote || '',
    UpdatedAt: resident.updatedAt.toISOString(),
  };
}

// Convert SheetRow to Resident data
function rowToResidentData(row: SheetRow): Partial<Resident> {
  return {
    nik: row.NIK,
    noKk: row.NoKK,
    name: row.Nama,
    pob: row.TempatLahir,
    dob: row.TanggalLahir,
    gender: row.JenisKelamin,
    religion: row.Agama,
    occupation: row.Pekerjaan,
    bloodType: row.GolonganDarah,
    maritalStatus: row.StatusPerkawinan,
    province: row.Provinsi,
    regency: row.Kabupaten,
    district: row.Kecamatan,
    village: row.Kelurahan,
    address: row.Alamat,
    status: (row.StatusWarga as Resident['status']) || 'AKTIF',
    statusDate: row.StatusDate || null,
    statusNote: row.StatusNote || null,
  };
}

// Fetch data from Google Sheet
export async function fetchFromSheet(sheetId: string): Promise<SheetRow[]> {
  try {
    // Try published CSV first
    const publishedUrl = getPublishedCsvUrl(sheetId);
    const response = await fetch(publishedUrl);
    
    if (!response.ok) {
      // Try export URL
      const exportUrl = getCsvExportUrl(sheetId);
      const exportResponse = await fetch(exportUrl);
      
      if (!exportResponse.ok) {
        throw new Error('Sheet tidak dapat diakses. Pastikan sheet sudah dipublish ke web.');
      }
      
      const csvText = await exportResponse.text();
      return parseCsv(csvText);
    }
    
    const csvText = await response.text();
    return parseCsv(csvText);
  } catch (error) {
    console.error('Error fetching from sheet:', error);
    throw error;
  }
}

// Get sync config
export async function getSyncConfig(): Promise<SyncConfigData | null> {
  const config = await db.syncConfig.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' }
  });
  
  if (!config) return null;
  
  return {
    id: config.id,
    sheetUrl: config.sheetUrl,
    sheetId: config.sheetId || undefined,
    sheetName: config.sheetName,
    syncToken: config.syncToken || undefined,
    autoSync: config.autoSync,
    syncInterval: config.syncInterval,
    isActive: config.isActive,
  };
}

// Save sync config
export async function saveSyncConfig(data: SyncConfigData): Promise<SyncConfigData> {
  const sheetId = data.sheetId || extractSheetId(data.sheetUrl);
  
  const config = await db.syncConfig.upsert({
    where: { id: data.id || 'default' },
    create: {
      sheetUrl: data.sheetUrl,
      sheetId: sheetId,
      sheetName: data.sheetName,
      syncToken: data.syncToken,
      autoSync: data.autoSync,
      syncInterval: data.syncInterval,
      isActive: true,
    },
    update: {
      sheetUrl: data.sheetUrl,
      sheetId: sheetId,
      sheetName: data.sheetName,
      syncToken: data.syncToken,
      autoSync: data.autoSync,
      syncInterval: data.syncInterval,
      isActive: true,
    }
  });
  
  return {
    id: config.id,
    sheetUrl: config.sheetUrl,
    sheetId: config.sheetId || undefined,
    sheetName: config.sheetName,
    syncToken: config.syncToken || undefined,
    autoSync: config.autoSync,
    syncInterval: config.syncInterval,
    isActive: config.isActive,
  };
}

// Create sync log
async function createSyncLog(
  syncConfigId: string,
  direction: 'push' | 'pull' | 'bidirectional',
  status: 'success' | 'failed' | 'partial',
  data: {
    recordsPushed?: number;
    recordsPulled?: number;
    recordsUpdated?: number;
    recordsFailed?: number;
    message?: string;
    details?: string;
  }
): Promise<void> {
  await db.syncLog.create({
    data: {
      syncConfigId,
      direction,
      status,
      recordsPushed: data.recordsPushed || 0,
      recordsPulled: data.recordsPulled || 0,
      recordsUpdated: data.recordsUpdated || 0,
      recordsFailed: data.recordsFailed || 0,
      message: data.message,
      details: data.details,
      completedAt: new Date(),
    }
  });
}

// Pull data from Google Sheet to local database
export async function pullFromSheet(currentUser?: string): Promise<SyncResult> {
  const config = await getSyncConfig();
  
  if (!config || !config.sheetId) {
    return {
      success: false,
      direction: 'pull',
      recordsPushed: 0,
      recordsPulled: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      message: 'Konfigurasi sinkronisasi tidak ditemukan',
    };
  }

  try {
    const sheetRows = await fetchFromSheet(config.sheetId);
    let recordsPulled = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    for (const row of sheetRows) {
      try {
        if (!row.NIK || row.NIK.length < 16) {
          recordsFailed++;
          continue;
        }

        const residentData = rowToResidentData(row);
        
        // Check if resident exists
        const existing = await db.resident.findUnique({
          where: { nik: row.NIK }
        });

        if (existing) {
          // Update if sheet data is newer
          const sheetUpdatedAt = row.UpdatedAt ? new Date(row.UpdatedAt) : null;
          const localUpdatedAt = existing.updatedAt;
          
          if (!sheetUpdatedAt || sheetUpdatedAt > localUpdatedAt) {
            await db.resident.update({
              where: { nik: row.NIK },
              data: residentData
            });
            recordsUpdated++;
          }
        } else {
          // Create new resident
          await db.resident.create({
            data: residentData as any
          });
          recordsPulled++;
        }
      } catch (error: any) {
        recordsFailed++;
        errors.push(`NIK ${row.NIK}: ${error.message}`);
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

    // Create log
    await createSyncLog(config.id!, 'pull', recordsFailed > 0 ? 'partial' : 'success', {
      recordsPulled,
      recordsUpdated,
      recordsFailed,
      message: `Berhasil pull ${recordsPulled} data baru, update ${recordsUpdated} data`,
      details: errors.length > 0 ? JSON.stringify(errors) : undefined,
    });

    return {
      success: true,
      direction: 'pull',
      recordsPushed: 0,
      recordsPulled,
      recordsUpdated,
      recordsFailed,
      message: `Berhasil mengambil ${recordsPulled} data baru dan mengupdate ${recordsUpdated} data dari Google Sheet`,
      details: errors.length > 0 ? JSON.stringify(errors) : undefined,
    };
  } catch (error: any) {
    // Log failure
    if (config.id) {
      await createSyncLog(config.id, 'pull', 'failed', {
        message: error.message,
      });
    }

    return {
      success: false,
      direction: 'pull',
      recordsPushed: 0,
      recordsPulled: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      message: `Gagal mengambil data dari Google Sheet: ${error.message}`,
    };
  }
}

// Generate CSV for export
export function generateSyncCsv(residents: Resident[]): string {
  const headers = [
    'NIK', 'No KK', 'Nama Lengkap', 'Tempat Lahir', 'Tanggal Lahir',
    'Jenis Kelamin', 'Agama', 'Pekerjaan', 'Golongan Darah',
    'Status Perkawinan', 'Provinsi', 'Kabupaten', 'Kecamatan', 'Kelurahan',
    'Alamat', 'Status Warga', 'Tanggal Status', 'Keterangan Status', 'Updated At'
  ];

  const rows = residents.map(r => {
    const row = residentToRow(r);
    return [
      row.NIK,
      row.NoKK,
      row.Nama,
      row.TempatLahir,
      row.TanggalLahir,
      row.JenisKelamin,
      row.Agama,
      row.Pekerjaan,
      row.GolonganDarah,
      row.StatusPerkawinan,
      row.Provinsi,
      row.Kabupaten,
      row.Kecamatan,
      row.Kelurahan,
      row.Alamat,
      row.StatusWarga,
      row.StatusDate,
      row.StatusNote,
      row.UpdatedAt,
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Get sync logs
export async function getSyncLogs(limit: number = 20): Promise<any[]> {
  const logs = await db.syncLog.findMany({
    take: limit,
    orderBy: { startedAt: 'desc' }
  });
  
  return logs;
}

// Delete sync config
export async function deleteSyncConfig(): Promise<boolean> {
  try {
    await db.syncConfig.deleteMany({});
    return true;
  } catch {
    return false;
  }
}

// Two-way sync (bidirectional)
export async function bidirectionalSync(currentUser?: string): Promise<SyncResult> {
  const config = await getSyncConfig();
  
  if (!config || !config.sheetId) {
    return {
      success: false,
      direction: 'bidirectional',
      recordsPushed: 0,
      recordsPulled: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      message: 'Konfigurasi sinkronisasi tidak ditemukan',
    };
  }

  try {
    // First, pull from sheet
    const pullResult = await pullFromSheet(currentUser);
    
    // Then, get all local data and compare with sheet
    // For now, we'll just return the pull result
    // Full bidirectional sync would require tracking changes on both sides
    
    return {
      success: pullResult.success,
      direction: 'bidirectional',
      recordsPushed: 0,
      recordsPulled: pullResult.recordsPulled,
      recordsUpdated: pullResult.recordsUpdated,
      recordsFailed: pullResult.recordsFailed,
      message: `Sinkronisasi selesai. ${pullResult.message}`,
      details: pullResult.details,
    };
  } catch (error: any) {
    return {
      success: false,
      direction: 'bidirectional',
      recordsPushed: 0,
      recordsPulled: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      message: `Gagal sinkronisasi: ${error.message}`,
    };
  }
}

// Test connection to Google Sheet
export async function testSheetConnection(sheetUrl: string): Promise<{
  success: boolean;
  message: string;
  rowCount?: number;
  headers?: string[];
}> {
  const sheetId = extractSheetId(sheetUrl);
  
  if (!sheetId) {
    return {
      success: false,
      message: 'URL Google Sheet tidak valid. Pastikan format URL benar.',
    };
  }

  try {
    const rows = await fetchFromSheet(sheetId);
    
    if (rows.length === 0) {
      return {
        success: true,
        message: 'Koneksi berhasil, tapi tidak ada data yang ditemukan. Pastikan sheet memiliki data dengan header yang benar.',
        rowCount: 0,
      };
    }

    const headers = Object.keys(rows[0]);
    
    // Check for required columns
    const hasNik = headers.some(h => h.toLowerCase().includes('nik'));
    
    if (!hasNik) {
      return {
        success: true,
        message: 'Koneksi berhasil, tapi kolom NIK tidak ditemukan. Pastikan header kolom sesuai format.',
        rowCount: rows.length,
        headers,
      };
    }

    return {
      success: true,
      message: `Koneksi berhasil! Ditemukan ${rows.length} data warga.`,
      rowCount: rows.length,
      headers,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal terhubung ke Google Sheet: ${error.message}. Pastikan sheet sudah dipublish ke web (File > Share > Publish to web).`,
    };
  }
}
