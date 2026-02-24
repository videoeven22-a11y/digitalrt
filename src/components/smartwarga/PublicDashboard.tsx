'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Bell, Phone, MapPin, Clock, 
  Shield, ChevronRight, MessageCircle, Calendar,
  Building2, Heart, Award, Megaphone, Link2, X
} from 'lucide-react';
import { Resident, ServiceRequest, RTConfig, Information } from '@/lib/types';

interface PublicDashboardProps {
  rtConfig: RTConfig;
  residents: Resident[];
  requests: ServiceRequest[];
  onLoginClick: () => void;
  onOpenService?: (type?: string) => void;
  onOpenRegister?: () => void;
}

export default function PublicDashboard({ rtConfig, residents, requests, onLoginClick, onOpenService, onOpenRegister }: PublicDashboardProps) {
  const [informations, setInformations] = useState<Information[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLayananOpen, setIsLayananOpen] = useState(false);

  useEffect(() => {
    const fetchInformations = async () => {
      try {
        const res = await fetch('/api/information');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setInformations(data.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching information:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInformations();
  }, []);

  // Calculate statistics
  const totalWarga = residents.length;
  const wargaAktif = residents.filter(r => r.status === 'AKTIF' || !r.status).length;
  const pengajuanSurat = requests.filter(r => r.status === 'Menunggu Verifikasi').length;
  
  // Get information by category
  const infoPemerintah = informations.filter(i => i.category === 'pemerintah' && i.isActive).slice(0, 5);
  const pengumuman = informations.filter(i => i.category === 'pengumuman' && i.isActive).slice(0, 5);
  const jadwal = informations.filter(i => i.category === 'jadwal' && i.isActive).slice(0, 5);
  const links = informations.filter(i => i.category === 'link' && i.isActive);

  // Available services
  const layanan = [
    { id: 'domisili', name: 'Surat Keterangan Domisili', icon: FileText, color: 'bg-blue-500', desc: 'Keterangan tempat tinggal' },
    { id: 'sktm', name: 'Surat Keterangan Tidak Mampu', icon: Heart, color: 'bg-rose-500', desc: 'Untuk bantuan sosial' },
    { id: 'usaha', name: 'Surat Keterangan Usaha', icon: Building2, color: 'bg-emerald-500', desc: 'Keterangan memiliki usaha' },
    { id: 'kematian', name: 'Surat Keterangan Kematian', icon: Award, color: 'bg-purple-500', desc: 'Surat kematian warga' },
    { id: 'ktpkk', name: 'Surat Pengantar KTP/KK', icon: Users, color: 'bg-orange-500', desc: 'Pengantar pembuatan KTP/KK' },
    { id: 'lainnya', name: 'Surat Keterangan Lainnya', icon: FileText, color: 'bg-slate-500', desc: 'Keperluan lainnya' },
  ];

  // Render info item
  const renderInfoItem = (item: Information) => {
    const content = (
      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          {item.link ? <Link2 size={14} className="text-blue-500" /> : <FileText size={14} className="text-slate-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-800 text-sm">{item.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.content}</p>
        </div>
        {item.link && <ChevronRight size={16} className="text-slate-400 shrink-0" />}
      </div>
    );

    if (item.link) {
      return (
        <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      );
    }
    return <div key={item.id}>{content}</div>;
  };

  const handleLayananClick = (layananId: string) => {
    setIsLayananOpen(false);
    if (onOpenService) {
      onOpenService(layananId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            {rtConfig.appLogo ? (
              <img src={rtConfig.appLogo} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <Shield className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{rtConfig.appName || 'SmartWarga RT'}</h1>
            <p className="text-emerald-100 text-sm">Portal Layanan Warga</p>
          </div>
        </div>
        
        <p className="text-emerald-50 text-sm mt-4">
          Selamat datang di portal layanan digital RT. Silakan gunakan layanan kami untuk mengurus surat dan keperluan administrasi lainnya.
        </p>
        
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <Users className="w-6 h-6 mx-auto mb-1 text-emerald-100" />
            <div className="text-2xl font-bold">{totalWarga}</div>
            <div className="text-xs text-emerald-100">Total Warga</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <Heart className="w-6 h-6 mx-auto mb-1 text-green-200" />
            <div className="text-2xl font-bold">{wargaAktif}</div>
            <div className="text-xs text-emerald-100">Warga Aktif</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <FileText className="w-6 h-6 mx-auto mb-1 text-yellow-200" />
            <div className="text-2xl font-bold">{pengajuanSurat}</div>
            <div className="text-xs text-emerald-100">Pengajuan</div>
          </div>
        </div>
      </div>

      {/* Tombol Layanan Administrasi - Prominent */}
      <button
        onClick={() => setIsLayananOpen(true)}
        className="w-full p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold">Layanan Administrasi</h2>
              <p className="text-blue-100 text-sm">Ajukan surat keterangan dan keperluan lainnya</p>
            </div>
          </div>
          <ChevronRight className="w-8 h-8 text-white/60" />
        </div>
      </button>

      {/* Tombol Daftar Warga */}
      {onOpenRegister && (
        <button
          onClick={onOpenRegister}
          className="w-full p-5 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold">Daftar Warga Baru</h2>
                <p className="text-emerald-100 text-sm">Daftarkan data kependudukan Anda</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/60" />
          </div>
        </button>
      )}

      {/* Pengumuman Section - Always show */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-5 h-5 text-amber-600" />
          <h2 className="font-semibold text-amber-800">Pengumuman</h2>
        </div>
        {pengumuman.length > 0 ? (
          <div className="space-y-2">
            {pengumuman.map(renderInfoItem)}
          </div>
        ) : (
          <div className="text-center py-6 bg-white rounded-xl">
            <Megaphone className="w-8 h-8 text-amber-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Belum ada pengumuman</p>
          </div>
        )}
      </div>

      {/* Info Pemerintah & Jadwal - Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info Pemerintah */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-800">Info Pemerintah</h2>
          </div>
          {infoPemerintah.length > 0 ? (
            <div className="space-y-2">
              {infoPemerintah.map(renderInfoItem)}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-xl">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Belum ada info pemerintah</p>
            </div>
          )}
        </div>

        {/* Jadwal Kegiatan */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-violet-600" />
            <h2 className="font-semibold text-slate-800">Jadwal Kegiatan</h2>
          </div>
          {jadwal.length > 0 ? (
            <div className="space-y-2">
              {jadwal.map(renderInfoItem)}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-xl">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Belum ada jadwal kegiatan</p>
            </div>
          )}
        </div>
      </div>

      {/* Link Penting - Always show */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600" />
          Link Penting
        </h2>
        {links.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {links.map(renderInfoItem)}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-xl">
            <Link2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Belum ada link penting</p>
          </div>
        )}
      </div>

      {/* Kontak RT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-emerald-600" />
          Kontak RT
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-slate-500">Ketua RT</div>
              <div className="font-medium text-slate-800">{rtConfig.rtName || 'Pak RT'}</div>
            </div>
          </div>
          {rtConfig.rtWhatsapp && (
            <a 
              href={`https://wa.me/${rtConfig.rtWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-500">WhatsApp</div>
                <div className="font-medium text-green-700">Hubungi via WhatsApp</div>
              </div>
              <ChevronRight className="w-5 h-5 text-green-600 ml-auto" />
            </a>
          )}
          {rtConfig.rtEmail && (
            <a 
              href={`mailto:${rtConfig.rtEmail}`}
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Email</div>
                <div className="font-medium text-blue-700">{rtConfig.rtEmail}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-600 ml-auto" />
            </a>
          )}
        </div>
      </div>

      {/* Admin Login Button - Subtle */}
      <div className="text-center pt-2 pb-4">
        <p className="text-sm text-slate-400">
          Login admin tersedia di pojok kanan atas →
        </p>
      </div>

      {/* Layanan Modal */}
      {isLayananOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsLayananOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Layanan Administrasi</h2>
                    <p className="text-blue-100 text-sm">Pilih jenis surat yang diajukan</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLayananOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {layanan.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLayananClick(item.id)}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all text-left group"
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{item.name}</h3>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
