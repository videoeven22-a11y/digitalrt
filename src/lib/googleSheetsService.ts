// Google Sheets API Service for Push Operations
import { google } from 'googleapis';
import { db } from '@/lib/db';

// Types
interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

interface PushResult {
  success: boolean;
  message: string;
  recordsPushed: number;
  recordsFailed: number;
  details?: string;
}

// Column headers for the sheet
const SHEET_HEADERS = [
  'NIK', 'No KK', 'Nama Lengkap', 'Tempat Lahir', 'Tanggal Lahir',
  'Jenis Kelamin', 'Agama', 'Pekerjaan', 'Golongan Darah',
  'Status Perkawinan', 'Provinsi', 'Kabupaten', 'Kecamatan', 'Kelurahan',
  'Alamat', 'Status Warga', 'Tanggal Status', 'Keterangan Status', 'Updated At'
];

// Get Google Sheets client
async function getGoogleSheetsClient(serviceAccountJson: string) {
  try {
    const credentials: ServiceAccountCredentials = JSON.parse(serviceAccountJson);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error: any) {
    throw new Error(`Gagal menginisialisasi Google Sheets client: ${error.message}`);
  }
}

// Extract Sheet ID from URL
export function extractSheetId(url: string): string | null {
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

// Push all residents to Google Sheet
export async function pushAllResidentsToSheet(): Promise<PushResult> {
  const config = await db.syncConfig.findFirst({
    where: { isActive: true }
  });

  if (!config || !config.sheetId || !config.serviceAccount) {
    return {
      success: false,
      message: 'Konfigurasi sinkronisasi tidak lengkap. Pastikan Service Account JSON sudah dikonfigurasi.',
      recordsPushed: 0,
      recordsFailed: 0,
    };
  }

  try {
    const sheets = await getGoogleSheetsClient(config.serviceAccount);
    
    // Get all residents
    const residents = await db.resident.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (residents.length === 0) {
      return {
        success: true,
        message: 'Tidak ada data warga untuk disinkronkan.',
        recordsPushed: 0,
        recordsFailed: 0,
      };
    }

    // Prepare rows data
    const rows = residents.map(r => [
      r.nik,
      r.noKk,
      r.name,
      r.pob,
      r.dob,
      r.gender,
      r.religion,
      r.occupation,
      r.bloodType,
      r.maritalStatus,
      r.province,
      r.regency,
      r.district,
      r.village,
      r.address || '',
      r.status,
      r.statusDate || '',
      r.statusNote || '',
      r.updatedAt.toISOString(),
    ]);

    // Clear existing data and write new data
    const sheetName = config.sheetName || 'Sheet1';
    
    // First, clear the sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId: config.sheetId,
      range: `${sheetName}!A1:S`,
    });

    // Then write headers and data
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [SHEET_HEADERS, ...rows],
      },
    });

    // Update sync config
    await db.syncConfig.update({
      where: { id: config.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'success',
        lastSyncCount: residents.length,
      }
    });

    // Create sync log
    await db.syncLog.create({
      data: {
        syncConfigId: config.id,
        direction: 'push',
        status: 'success',
        recordsPushed: residents.length,
        recordsPulled: 0,
        recordsUpdated: 0,
        recordsFailed: 0,
        message: `Berhasil push ${residents.length} data warga ke Google Sheet`,
        completedAt: new Date(),
      }
    });

    return {
      success: true,
      message: `Berhasil mengirim ${residents.length} data warga ke Google Sheet!`,
      recordsPushed: residents.length,
      recordsFailed: 0,
    };
  } catch (error: any) {
    // Log failure
    if (config.id) {
      await db.syncLog.create({
        data: {
          syncConfigId: config.id,
          direction: 'push',
          status: 'failed',
          recordsPushed: 0,
          recordsPulled: 0,
          recordsUpdated: 0,
          recordsFailed: 0,
          message: `Gagal push ke Google Sheet: ${error.message}`,
          completedAt: new Date(),
        }
      });
    }

    return {
      success: false,
      message: `Gagal mengirim data ke Google Sheet: ${error.message}`,
      recordsPushed: 0,
      recordsFailed: 0,
      details: error.message,
    };
  }
}

// Push a single resident (for real-time sync)
export async function pushSingleResident(resident: any): Promise<boolean> {
  const config = await db.syncConfig.findFirst({
    where: { isActive: true, autoSync: true }
  });

  if (!config || !config.sheetId || !config.serviceAccount) {
    return false;
  }

  try {
    const sheets = await getGoogleSheetsClient(config.serviceAccount);
    const sheetName = config.sheetName || 'Sheet1';

    // Find the row with matching NIK
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;
    
    // Find row index (skip header, so start from 1)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && rows[i][0] === resident.nik) {
        rowIndex = i + 1; // 1-indexed for Google Sheets
        break;
      }
    }

    const rowData = [
      resident.nik,
      resident.noKk,
      resident.name,
      resident.pob,
      resident.dob,
      resident.gender,
      resident.religion,
      resident.occupation,
      resident.bloodType,
      resident.maritalStatus,
      resident.province,
      resident.regency,
      resident.district,
      resident.village,
      resident.address || '',
      resident.status,
      resident.statusDate || '',
      resident.statusNote || '',
      resident.updatedAt?.toISOString() || new Date().toISOString(),
    ];

    if (rowIndex > 0) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.sheetId,
        range: `${sheetName}!A${rowIndex}:S${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowData],
        },
      });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: config.sheetId,
        range: `${sheetName}!A:S`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowData],
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error pushing single resident:', error);
    return false;
  }
}

// Delete a resident row from sheet
export async function deleteResidentFromSheet(nik: string): Promise<boolean> {
  const config = await db.syncConfig.findFirst({
    where: { isActive: true, autoSync: true }
  });

  if (!config || !config.sheetId || !config.serviceAccount) {
    return false;
  }

  try {
    const sheets = await getGoogleSheetsClient(config.serviceAccount);
    const sheetName = config.sheetName || 'Sheet1';

    // Find the row with matching NIK
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = response.data.values || [];
    let rowIndex = -1;
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && rows[i][0] === nik) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex > 0) {
      // Clear the row (delete would shift rows, so we just clear it)
      await sheets.spreadsheets.values.clear({
        spreadsheetId: config.sheetId,
        range: `${sheetName}!A${rowIndex}:S${rowIndex}`,
      });
    }

    return true;
  } catch (error) {
    console.error('Error deleting resident from sheet:', error);
    return false;
  }
}

// Test connection with service account
export async function testServiceAccountConnection(
  serviceAccountJson: string,
  sheetId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const sheets = await getGoogleSheetsClient(serviceAccountJson);
    
    // Try to get sheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const sheetTitle = response.data.properties?.title || 'Unknown';
    
    return {
      success: true,
      message: `Koneksi berhasil! Sheet: "${sheetTitle}"`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Gagal terhubung: ${error.message}`,
    };
  }
}
