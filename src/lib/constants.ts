import { 
  FileText, 
  MapPin, 
  Users, 
  ShieldCheck 
} from 'lucide-react';

// App Configuration
export const APP_NAME = "SmartWarga RT 03";
export const APP_SUBTITLE = "Sistem Digital Layanan RT 03 / RW 02 Kp. Jati";
export const APP_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/b/bc/Logo_RT_RW.png";

// Default RT Configuration
export const DEFAULT_RT_CONFIG = {
  rtName: 'Ketua RT 03',
  rtWhatsapp: '628123456789',
  rtEmail: 'rt03.kpjati@smartwarga.id',
  appName: APP_NAME,
  appLogo: APP_LOGO_URL
};

// Feature List
export const FEATURE_LIST = [
  {
    title: "Database Digital",
    desc: "Penyimpanan data warga aman dan terstruktur.",
    icon: Users
  },
  {
    title: "Surat Otomatis",
    desc: "Generate PDF resmi dengan QR Code dalam hitungan detik.",
    icon: FileText
  },
  {
    title: "Integrasi Wilayah",
    desc: "Data alamat sinkron dengan API nasional.",
    icon: MapPin
  },
  {
    title: "Keamanan RBAC",
    desc: "Akses bertingkat untuk Super Admin dan Staf.",
    icon: ShieldCheck
  }
];

// Letter Type Options for Forms
export const LETTER_TYPE_OPTIONS = [
  { value: 'Surat Keterangan Pindah', label: 'Surat Keterangan Pindah (F-1.03)' },
  { value: 'Surat Izin Nikah (N1-N4)', label: 'Surat Izin Nikah (Model N1-N4)' },
  { value: 'Surat Izin Keramaian', label: 'Surat Izin Keramaian' },
  { value: 'Surat Kematian', label: 'Surat Kematian' },
  { value: 'SKTM (Surat Keterangan Tidak Mampu)', label: 'SKTM (Surat Keterangan Tidak Mampu)' },
  { value: 'Surat Keterangan Domisili', label: 'Surat Keterangan Domisili' }
];

// Religion Options
export const RELIGION_OPTIONS = [
  'Islam',
  'Kristen Protestan',
  'Kristen Katolik',
  'Hindu',
  'Buddha',
  'Konghucu'
];

// Blood Type Options
export const BLOOD_TYPE_OPTIONS = ['A', 'B', 'AB', 'O', '-'];

// Marital Status Options
export const MARITAL_STATUS_OPTIONS = [
  'Lajang',
  'Menikah',
  'Cerai Hidup',
  'Cerai Mati'
];

// Gender Options
export const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'];

// Day Options (Indonesian)
export const DAY_OPTIONS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// Pasaran Options (Javanese)
export const PASARAN_OPTIONS = ["Legi", "Paing", "Pon", "Wage", "Kliwon"];

// Klasifikasi Pindah Options
export const KLASIFIKASI_PINDAH_OPTIONS = [
  "Dalam satu desa/kelurahan",
  "Antar desa/kelurahan dalam satu kecamatan",
  "Antar kecamatan dalam satu kabupaten/kota",
  "Antar kabupaten/kota dalam satu provinsi",
  "Antar provinsi"
];

// Alasan Pindah Options
export const ALASAN_PINDAH_OPTIONS = [
  "Pekerjaan",
  "Pendidikan",
  "Kesehatan",
  "Keamanan",
  "Keluarga",
  "Perumahan",
  "Lainnya"
];

// Jenis Pindah Options
export const JENIS_PINDAH_OPTIONS = [
  "Kepala Keluarga",
  "KK & Seluruh Anggota Keluarga",
  "KK & Sebagian Anggota Keluarga",
  "Anggota Keluarga"
];

// SHDK Options
export const SHDK_OPTIONS = [
  "Kepala Keluarga",
  "Suami",
  "Istri",
  "Anak",
  "Menantu",
  "Cucu",
  "Orang Tua",
  "Mertua",
  "Famili Lain"
];

// Bridge Status Options (for Nikah)
export const BRIDE_STATUS_OPTIONS = ['Perjaka / Gadis', 'Duda / Janda'];
