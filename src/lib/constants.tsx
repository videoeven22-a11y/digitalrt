import React from 'react';
import { 
  FileText, 
  MapPin, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { RTConfig } from '@/lib/types';

// UBAH NAMA DAN LOGO DI SINI
export const APP_NAME = "SmartWarga RT 05";
export const APP_SUBTITLE = "Sistem Digital Layanan RT 05 / RW 02";
export const APP_LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/b/bc/Logo_RT_RW.png";

// Default RT Configuration
export const DEFAULT_RT_CONFIG: RTConfig = {
  rtName: 'Ketua RT 05',
  rtWhatsapp: '628123456789',
  rtEmail: 'rt05@smartwarga.id',
  appName: APP_NAME,
  appLogo: APP_LOGO_URL
};

export const FEATURE_LIST = [
  {
    title: "Database Digital",
    desc: "Penyimpanan data warga aman dan terstruktur.",
    icon: React.createElement(Users, { className: "text-blue-500" })
  },
  {
    title: "Surat Otomatis",
    desc: "Generate PDF resmi dengan QR Code dalam hitungan detik.",
    icon: React.createElement(FileText, { className: "text-emerald-500" })
  },
  {
    title: "Integrasi Wilayah",
    desc: "Data alamat sinkron dengan API nasional.",
    icon: React.createElement(MapPin, { className: "text-amber-500" })
  },
  {
    title: "Keamanan RBAC",
    desc: "Akses bertingkat untuk Super Admin dan Staf.",
    icon: React.createElement(ShieldCheck, { className: "text-purple-500" })
  }
];
