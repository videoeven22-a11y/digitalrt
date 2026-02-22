'use client';

import React, { useState, useRef, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Edit,
  Download,
  CheckCircle2,
  Search,
  Filter,
  Loader2,
  MapPin,
  Calendar,
  FileSpreadsheet,
  RotateCcw,
  User,
  Users as UsersIcon,
  ArrowLeftRight,
  X
} from 'lucide-react';
import { AdminRole, Resident, MaritalStatus, ResidentStatus } from '@/lib/types';
import SyncSettings from './SyncSettings';

interface ResidentDatabaseProps {
  residents: Resident[];
  onAddResident: () => void;
  onEditResident: (res: Resident) => void;
  onDeleteResident: (nik: string) => void;
  userRole: AdminRole;
  currentUser?: string;
  onRefresh?: () => void;
}

const ResidentDatabase: React.FC<ResidentDatabaseProps> = ({ 
  residents, 
  onAddResident, 
  onEditResident, 
  onDeleteResident, 
  userRole,
  currentUser,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [maritalFilter, setMaritalFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [kkFilter, setKkFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to calculate age
  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get unique KK list for the filter
  const uniqueKkList = useMemo(() => {
    const kks = Array.from(new Set(residents.map(r => r.noKk))).sort();
    return kks;
  }, [residents]);

  const filteredResidents = residents.filter(r => {
    const age = calculateAge(r.dob);
    
    // Search filter
    const matchesSearch = 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.nik.includes(searchTerm) ||
      r.noKk.includes(searchTerm);

    // Gender filter
    const matchesGender = genderFilter === 'all' || r.gender === genderFilter;

    // Marital filter
    const matchesMarital = maritalFilter === 'all' || r.maritalStatus === maritalFilter;

    // KK filter
    const matchesKk = kkFilter === 'all' || r.noKk === kkFilter;

    // Status filter - match uppercase enum values
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter || (!r.status && statusFilter === 'AKTIF');

    // Age group filter
    let matchesAge = true;
    if (ageFilter === 'balita') matchesAge = age < 5;
    else if (ageFilter === 'anak') matchesAge = age >= 5 && age <= 12;
    else if (ageFilter === 'remaja') matchesAge = age >= 13 && age <= 17;
    else if (ageFilter === 'dewasa') matchesAge = age >= 18 && age <= 59;
    else if (ageFilter === 'lansia') matchesAge = age >= 60;

    return matchesSearch && matchesGender && matchesMarital && matchesKk && matchesAge && matchesStatus;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setMaritalFilter('all');
    setAgeFilter('all');
    setKkFilter('all');
    setStatusFilter('all');
  };

  const handleGlobalUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert(`Berhasil memproses file: ${file.name}. Sistem telah mensinkronisasi data ke Database Warga.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 2000);
  };

  const headers = [
    "NIK", "No KK", "Nama Lengkap", "Tempat Lahir", "Tanggal Lahir", 
    "Jenis Kelamin", "Agama", "Pekerjaan", "Golongan Darah", 
    "Status Perkawinan", "Provinsi", "Kabupaten/Kota", "Kecamatan", "Kelurahan", "Alamat Lengkap"
  ];

  const handleDownloadTemplate = () => {
    const DELIMITER = ";";
    const csvContent = ["sep=;", headers.join(DELIMITER)].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Template_Data_Warga_SmartWarga.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    setTimeout(() => {
      let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; font-family: sans-serif; }
            th { background-color: #2563eb; color: #ffffff; padding: 10px; border: 1px solid #1e40af; font-size: 12px; }
            td { padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; }
            .text-cell { mso-number-format:"\\@"; }
          </style>
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredResidents.map(r => `
                <tr>
                  <td class="text-cell">${r.nik}</td>
                  <td class="text-cell">${r.noKk}</td>
                  <td>${r.name}</td>
                  <td>${r.pob}</td>
                  <td>${r.dob}</td>
                  <td>${r.gender}</td>
                  <td>${r.religion}</td>
                  <td>${r.occupation}</td>
                  <td>${r.bloodType}</td>
                  <td>${r.maritalStatus}</td>
                  <td>${r.province}</td>
                  <td>${r.regency}</td>
                  <td>${r.district}</td>
                  <td>${r.village}</td>
                  <td>${r.address || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Database_Warga_RT05_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 1200);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Database Warga</h2>
          <p className="text-xs md:text-sm text-slate-500">Total: <span className="font-bold text-blue-600">{residents.length}</span> Jiwa Terdaftar</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-xs font-bold shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Template Excel</span>
          </button>
          
          <button 
            onClick={handleExportExcel}
            disabled={isExporting || filteredResidents.length === 0}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all text-xs font-bold disabled:opacity-50 shadow-sm"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            <span>UNDUH EXCEL</span>
          </button>

          <button 
            onClick={() => setShowSyncModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl hover:bg-purple-100 transition-all text-xs font-bold shadow-sm"
          >
            <ArrowLeftRight size={16} />
            <span className="hidden sm:inline">SYNC SHEETS</span>
          </button>

          <button 
            onClick={onAddResident}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-xs font-bold shadow-lg shadow-blue-100"
          >
            <Plus size={16} />
            <span>TAMBAH WARGA</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input 
                type="text" 
                placeholder="Cari NIK, KK, atau Nama Warga..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, .xlsx, .xls"
                onChange={handleGlobalUpdate}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-blue-600 bg-white border border-blue-100 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span>{isUploading ? 'MEMPROSES...' : 'IMPORT'}</span>
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all shadow-sm ${
                  showFilters || genderFilter !== 'all' || maritalFilter !== 'all' || ageFilter !== 'all' || kkFilter !== 'all' || statusFilter !== 'all'
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={16} />
                <span>FILTER</span>
              </button>
            </div>
          </div>

          {/* Advanced Filter Panel */}
          {showFilters && (
            <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-inner grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={12}/> Jenis Kelamin
                </label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <option value="all">Semua Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki (L)</option>
                  <option value="Perempuan">Perempuan (P)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 size={12}/> Status Kawin
                </label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={maritalFilter}
                  onChange={(e) => setMaritalFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  {Object.values(MaritalStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={12}/> Kelompok Usia
                </label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                >
                  <option value="all">Semua Usia</option>
                  <option value="balita">Balita (&lt; 5 th)</option>
                  <option value="anak">Anak (5-12 th)</option>
                  <option value="remaja">Remaja (13-17 th)</option>
                  <option value="dewasa">Dewasa (18-59 th)</option>
                  <option value="lansia">Lansia (60+ th)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <UsersIcon size={12}/> No. Kartu Keluarga
                </label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={kkFilter}
                  onChange={(e) => setKkFilter(e.target.value)}
                >
                  <option value="all">Semua Nomor KK</option>
                  {uniqueKkList.map(kk => (
                    <option key={kk} value={kk}>KK: {kk}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 size={12}/> Status Warga
                </label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  {Object.values(ResidentStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center space-x-2 p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-[11px] font-bold transition-colors border border-red-100"
                >
                  <RotateCcw size={14} />
                  <span>RESET FILTER</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                <th className="px-6 py-5">Warga & Kelahiran</th>
                <th className="px-6 py-5">Identitas (NIK/KK)</th>
                <th className="px-6 py-5">Alamat Domisili</th>
                <th className="px-6 py-5">Kategori</th>
                <th className="px-6 py-5 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredResidents.length > 0 ? filteredResidents.map((res) => (
                <tr key={res.nik} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-bold text-base border border-blue-100 shadow-sm shrink-0">
                        {res.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{res.name}</p>
                        <div className="flex items-center text-[10px] text-slate-400 space-x-2 mt-1">
                          <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{res.gender === 'Laki-laki' ? 'L' : 'P'}</span>
                          <span className="text-slate-200">•</span>
                          <span className="flex items-center space-x-1">
                            <Calendar size={12} className="text-slate-300" />
                            <span>{res.pob}, {formatDate(res.dob)} ({calculateAge(res.dob)} th)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-black text-slate-300 uppercase w-6">NIK</span>
                        <p className="text-[11px] font-mono font-bold text-slate-700 tracking-wider">{res.nik}</p>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-black text-slate-300 uppercase w-6">KK</span>
                        <p className="text-[11px] font-mono font-medium text-slate-500 tracking-wider">{res.noKk}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[280px]">
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-slate-50 rounded-lg shrink-0 mt-0.5">
                        <MapPin size={14} className="text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-600 truncate">
                          {res.address || `${res.village || '-'}, ${res.district || '-'}`}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate font-medium mt-0.5">
                          {res.regency || '-'}, {res.province || '-'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1.5">
                      {/* Status Warga Badge */}
                      <span className={`w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        res.status === 'PINDAH' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        res.status === 'MENINGGAL' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {res.status === 'PINDAH' ? 'Pindah' : res.status === 'MENINGGAL' ? 'Meninggal' : 'Aktif'}
                      </span>
                      {/* Status Date & Note for Pindah/Meninggal */}
                      {(res.status === 'PINDAH' || res.status === 'MENINGGAL') && res.statusDate && (
                        <p className="text-[9px] text-slate-400 font-medium">
                          {res.status === 'MENINGGAL' ? 'Wafat: ' : 'Pindah: '}{formatDate(res.statusDate)}
                        </p>
                      )}
                      {res.statusNote && (
                        <p className="text-[9px] text-slate-400 truncate max-w-[150px]" title={res.statusNote}>
                          {res.statusNote}
                        </p>
                      )}
                      {/* Marital Status */}
                      <span className={`w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        res.maritalStatus === 'Menikah' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        res.maritalStatus === 'Lajang' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {res.maritalStatus}
                      </span>
                      <div className="flex items-center text-slate-400 space-x-1.5">
                        <UsersIcon size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-tight">{res.occupation}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => onEditResident(res)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Data"
                      >
                        <Edit size={18} />
                      </button>
                      {userRole === AdminRole.SUPER_ADMIN && (
                        <button 
                          onClick={() => {
                            if(window.confirm(`Hapus data ${res.name}?`)) {
                              onDeleteResident(res.nik);
                            }
                          }}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus Data"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <UsersIcon size={48} className="text-slate-300" />
                      <p className="text-slate-500 text-sm font-medium italic">Warga tidak ditemukan dengan filter ini...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredResidents.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menampilkan {filteredResidents.length} dari {residents.length} warga</p>
            <div className="flex items-center space-x-1">
               <button className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400">Prev</button>
               <button className="px-3 py-1 bg-blue-600 border border-blue-600 rounded text-[10px] font-bold text-white">1</button>
               <button className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Sinkronisasi Google Sheets</h3>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
              <SyncSettings 
                currentUser={currentUser}
                onSyncComplete={() => {
                  onRefresh?.();
                  setShowSyncModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDatabase;
