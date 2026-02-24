'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  TrendingUp,
  UserPlus,
  ArrowRight,
  Edit2,
  Trash2,
  Megaphone,
  Building2,
  ShieldCheck,
  FileText,
  Plus,
  Link2
} from 'lucide-react';
import { ServiceRequest, RequestStatus, Resident } from '@/lib/types';
import InformationModal from './InformationModal';

interface InfoItem {
  id: string;
  category: string;
  title: string;
  content: string;
  link?: string | null;
  icon?: string | null;
  color?: string | null;
  order: number;
  isActive: boolean;
}

interface DashboardProps {
  residentsCount: number;
  residents: Resident[];
  requests: ServiceRequest[];
  onOpenRegister: () => void;
  // Admin actions
  isLoggedIn?: boolean;
  onEditResident?: (resident: Resident) => void;
  onDeleteResident?: (nik: string) => void;
}

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 md:p-3 rounded-xl ${color} text-white shadow-lg`}>
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
      <div className="flex items-center space-x-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">
        <TrendingUp size={12} />
        <span>+{trend}%</span>
      </div>
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">{value}</h3>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
  residentsCount, 
  residents, 
  requests, 
  onOpenRegister,
  isLoggedIn,
  onEditResident,
  onDeleteResident
}) => {
  const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING).length;
  
  // Filter residents by status (enum values are uppercase: AKTIF, PINDAH, MENINGGAL)
  const wargaAktif = residents.filter(r => !r.status || r.status === 'AKTIF');

  // Information state
  const [infoList, setInfoList] = useState<InfoItem[]>([]);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<InfoItem | null>(null);

  // Fetch information
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch('/api/information?active=true');
        const data = await res.json();
        if (data.success) {
          setInfoList(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching information:', error);
      }
    };
    fetchInfo();
  }, []);

  const handleSaveInfo = () => {
    // Refresh info list
    fetch('/api/information?active=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) setInfoList(data.data || []);
      });
  };

  const handleDeleteInfo = async (id: string, title: string) => {
    if (!confirm(`Hapus informasi "${title}"?`)) return;
    try {
      const res = await fetch(`/api/information?id=${id}&currentUser=Admin`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setInfoList(infoList.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Error deleting information:', error);
    }
  };

  // Group info by category
  const infoPemerintah = infoList.filter(i => i.category === 'pemerintah');
  const infoJadwal = infoList.filter(i => i.category === 'jadwal');
  const infoPengumuman = infoList.filter(i => i.category === 'pengumuman');
  const infoLink = infoList.filter(i => i.category === 'link');

  // Get color classes
  const getColorClasses = (color: string | null) => {
    const colors: Record<string, { bg: string; border: string; text: string; headerBg: string; headerBorder: string }> = {
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', headerBg: 'from-emerald-50 to-emerald-100/50', headerBorder: 'border-emerald-100' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', headerBg: 'from-blue-50 to-blue-100/50', headerBorder: 'border-blue-100' },
      violet: { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', headerBg: 'from-violet-50 to-violet-100/50', headerBorder: 'border-violet-100' },
      rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', headerBg: 'from-rose-50 to-rose-100/50', headerBorder: 'border-rose-100' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', headerBg: 'from-amber-50 to-amber-100/50', headerBorder: 'border-amber-100' },
      slate: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600', headerBg: 'from-slate-50 to-slate-100/50', headerBorder: 'border-slate-100' },
    };
    return colors[color || 'blue'] || colors.blue;
  };

  // Render info item
  const renderInfoItem = (item: InfoItem) => {
    const colorClasses = getColorClasses(item.color ?? null);
    const content = (
      <div className={`p-3 ${colorClasses.bg}/50 rounded-xl border ${colorClasses.border} hover:${colorClasses.bg} transition-colors group`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <div className={`p-2 ${colorClasses.bg} rounded-lg ${colorClasses.text} shrink-0`}>
              {item.link ? <Link2 size={14} /> : <FileText size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700">{item.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{item.content}</p>
            </div>
          </div>
          {isLoggedIn && (
            <div className="flex gap-1 shrink-0">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingInfo(item); setIsInfoModalOpen(true); }}
                className="p-1 bg-white hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded transition-colors"
                title="Edit"
              >
                <Edit2 size={10} />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteInfo(item.id, item.title); }}
                className="p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                title="Hapus"
              >
                <Trash2 size={10} />
              </button>
            </div>
          )}
        </div>
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

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Admin Welcome */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <h2 className="text-xl md:text-2xl font-bold">Dashboard Admin</h2>
        <p className="text-slate-300 text-sm mt-1">Kelola data warga dan layanan RT dari panel ini.</p>
      </div>

      {/* Quick Actions for Public Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={onOpenRegister}
          className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[24px] text-left text-white shadow-xl shadow-blue-100 hover:scale-[1.01] transition-all group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <UserPlus size={100} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Pendaftaran Warga Baru</h3>
              <p className="text-blue-100 text-xs md:text-sm font-medium">Belum terdaftar di sistem RT 03 Kp. Jati? Daftarkan diri Anda secara mandiri di sini.</p>
            </div>
            <div className="mt-6 flex items-center space-x-2 font-bold text-sm">
              <span>Mulai Daftar Sekarang</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Warga Aktif" value={wargaAktif.length} icon={Users} color="bg-blue-600" trend="12" />
          <StatCard label="Antrean Surat" value={pendingRequests} icon={Clock} color="bg-amber-500" trend="8" />
        </div>
      </div>

      {/* Informasi Warga - Dynamic from Database */}
      <div className="space-y-4">
        {/* Admin Controls */}
        {isLoggedIn && (
          <div className="flex justify-end">
            <button 
              onClick={() => { setEditingInfo(null); setIsInfoModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              <span>Tambah Informasi</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Pemerintah */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Info Pemerintah</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Pusat & Daerah</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {infoPemerintah.length > 0 ? (
                infoPemerintah.map(renderInfoItem)
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">Belum ada informasi</p>
                </div>
              )}
            </div>
          </div>

          {/* Jadwal Ronda */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 bg-gradient-to-r from-violet-50 to-violet-100/50 border-b border-violet-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-600 text-white rounded-xl shadow-md">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Jadwal Ronda</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Jaga keamanan lingkungan</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {infoJadwal.length > 0 ? (
                infoJadwal.map(renderInfoItem)
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">Belum ada jadwal</p>
                </div>
              )}
            </div>
          </div>

          {/* Pengumuman */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 bg-gradient-to-r from-rose-50 to-rose-100/50 border-b border-rose-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Pengumuman</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Info terkini untuk warga</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {infoPengumuman.length > 0 ? (
                infoPengumuman.map(renderInfoItem)
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">Belum ada pengumuman</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Link Penting - Full Width */}
        {infoLink.length > 0 && (
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  <Link2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Link Penting</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Akses cepat ke layanan</p>
                </div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {infoLink.map(renderInfoItem)}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Highlights */}
        <div className="lg:col-span-3 bg-slate-900 rounded-[24px] p-6 text-white shadow-xl">
          <h4 className="text-lg font-bold mb-4">Layanan Digital RT 03 / RW 02 Kp. Jati</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">Pengajuan surat keterangan tanpa harus ke rumah Pak RT.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">Database warga yang aman dan terintegrasi dengan data nasional.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">Integrasi WhatsApp untuk notifikasi dan komunikasi dengan RT.</p>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
            Dikembangkan untuk RT 03 / RW 02 Kp. Jati
          </div>
        </div>
      </div>

      {/* Information Modal */}
      <InformationModal
        isOpen={isInfoModalOpen}
        onClose={() => { setIsInfoModalOpen(false); setEditingInfo(null); }}
        onSave={handleSaveInfo}
        editData={editingInfo}
      />
    </div>
  );
};

export default Dashboard;
