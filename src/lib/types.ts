// SmartWarga Types

export enum AdminRole {
  SUPER_ADMIN = 'Super Admin',
  STAFF = 'Staf'
}

export enum MaritalStatus {
  LAJANG = 'Lajang',
  MENIKAH = 'Menikah',
  CERAI_HIDUP = 'Cerai Hidup',
  CERAI_MATI = 'Cerai Mati'
}

export enum LetterType {
  PINDAH = 'Surat Keterangan Pindah',
  NIKAH = 'Surat Izin Nikah (N1-N4)',
  KERAMAIAN = 'Surat Izin Keramaian',
  KEMATIAN = 'Surat Kematian',
  SKTM = 'SKTM (Surat Keterangan Tidak Mampu)',
  DOMISILI = 'Surat Keterangan Domisili'
}

export enum RequestStatus {
  PENDING = 'Menunggu Verifikasi',
  APPROVED = 'Disetujui',
  REJECTED = 'Ditolak'
}

// Status Warga
export enum ResidentStatus {
  AKTIF = 'AKTIF',
  PINDAH = 'PINDAH',
  MENINGGAL = 'MENINGGAL'
}

export interface Resident {
  id?: string;
  nik: string;
  noKk: string;
  name: string;
  pob: string;
  dob: string;
  gender: 'Laki-laki' | 'Perempuan';
  religion: string;
  occupation: string;
  bloodType: string;
  maritalStatus: MaritalStatus | string;
  province: string;
  regency: string;
  district: string;
  village: string;
  address: string;
  // Status Warga
  status?: ResidentStatus | string;
  statusDate?: string;  // Tanggal pindah/meninggal
  statusNote?: string;  // Keterangan tambahan
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ServiceRequest {
  id?: string;
  nik: string;
  residentName: string;
  type: LetterType | string;
  status: RequestStatus | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  address?: string;
  pobDob?: string;
  purpose?: string;
  deathDetails?: {
    date: string;
    dayPasaran: string;
    time: string;
    place: string;
    burialPlace: string;
  };
  nikahDetails?: {
    brideStatus: string;
    fatherName: string;
    fatherNik: string;
    motherName: string;
    motherNik: string;
  };
  pindahDetails?: {
    noKk: string;
    addrAsal: string;
    rtAsal: string;
    rwAsal: string;
    desaAsal: string;
    kecAsal: string;
    kabAsal: string;
    provAsal: string;
    addrTujuan: string;
    rtTujuan: string;
    rwTujuan: string;
    desaTujuan: string;
    kecTujuan: string;
    kabTujuan: string;
    provTujuan: string;
    alasanPindah: string;
    klasifikasiPindah: string;
    jenisPindah: string;
    familyMembers: { nik: string; name: string; shdk: string }[];
  };
  sktmDetails?: {
    parentName: string;
    parentNik: string;
    parentPobDob: string;
    parentJob: string;
    parentAddress: string;
  };
  domisiliDetails?: {
    nationality: string;
    durationStay: string;
    gender: string;
    pob: string;
    dob: string;
    religion: string;
    occupation: string;
  };
  pdfUrl?: string;
}

export interface AdminUser {
  id?: string;
  username: string;
  password: string;
  name: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuditLog {
  id?: string;
  action: string;
  user: string;
  target: string;
  type: string;
  createdAt?: Date;
}

export interface RTConfig {
  id?: string;
  rtName: string;
  rtWhatsapp: string;
  rtEmail: string;
  appName: string;
  appLogo: string;
  updatedAt?: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
