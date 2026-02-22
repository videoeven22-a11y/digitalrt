'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Shield, UserPlus, MoreHorizontal, ShieldAlert, Lock, UserCheck, RefreshCcw, Database, Server, Loader2, CheckCircle, FileUp, AlertCircle, LogOut as LogOutIcon, Mail, Phone, User as UserIcon, Save, X, Key, Briefcase, Image as ImageIcon, RotateCcw, Trash2, Eye, EyeOff, Edit2, Skull } from 'lucide-react';
import { AdminRole, RTConfig, AdminUser, Resident } from '@/lib/types';
import { APP_LOGO_URL, APP_NAME } from '@/lib/constants';

interface AdminManagementProps {
  userRole: string;
  onLogout: () => void;
  rtConfig: RTConfig;
  setRtConfig: (config: RTConfig) => void;
  currentUser?: AdminUser | null;
  residents?: Resident[];
  onEditResident?: (resident: Resident) => void;
  onDeleteResident?: (nik: string) => void;
}

interface StaffFormData {
  name: string;
  username: string;
  password: string;
  role: string;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ userRole, onLogout, rtConfig, setRtConfig, currentUser, residents = [], onEditResident, onDeleteResident }) => {
  const [tempConfig, setTempConfig] = useState<RTConfig>(rtConfig);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Modal State for Adding Staff
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [staffForm, setStaffForm] = useState<StaffFormData>({
    name: '', username: '', password: '', role: 'Staf'
  });
  const [staffError, setStaffError] = useState('');

  // Admins list from database
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  // Edit admin state
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', username: '', password: '', role: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Filter residents by status
  const wargaPindah = residents.filter(r => r.status === 'PINDAH');
  const wargaMeninggal = residents.filter(r => r.status === 'MENINGGAL');

  // Fetch admins on mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch('/api/admin');
        const data = await res.json();
        if (data.success) {
          setAdminsList(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setIsLoadingAdmins(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Limit 1MB
        alert("Ukuran logo terlalu besar. Maksimal 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempConfig({ ...tempConfig, appLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBranding = () => {
    if (window.confirm("Kembalikan tampilan ke pengaturan awal?")) {
      setTempConfig({ ...tempConfig, appName: APP_NAME, appLogo: APP_LOGO_URL });
    }
  };

  const handleSaveConfig = () => {
    setIsSavingConfig(true);
    setTimeout(() => {
      setRtConfig(tempConfig);
      setIsSavingConfig(false);
      alert('Pengaturan berhasil diperbarui.');
    }, 1000);
  };

  // Handle save new staff/admin
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    
    if (!staffForm.name || !staffForm.username || !staffForm.password || !staffForm.role) {
      setStaffError('Semua field harus diisi');
      return;
    }

    if (staffForm.password.length < 6) {
      setStaffError('Password minimal 6 karakter');
      return;
    }

    setIsSavingStaff(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          username: staffForm.username.toLowerCase().replace(/\s/g, ''),
          password: staffForm.password,
          name: staffForm.name,
          role: staffForm.role,
          currentUser: currentUser?.name,
          requesterRole: currentUser?.role
        })
      });

      const data = await res.json();
      if (data.success) {
        setAdminsList([data.data, ...adminsList]);
        setIsStaffModalOpen(false);
        setStaffForm({ name: '', username: '', password: '', role: 'Staf' });
      } else {
        setStaffError(data.error || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      setStaffError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSavingStaff(false);
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = async (id: string, name: string) => {
    if (!confirm(`Hapus admin "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      const res = await fetch(`/api/admin?id=${id}&requesterRole=${encodeURIComponent(currentUser?.role || '')}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAdminsList(adminsList.filter(a => a.id !== id));
      } else {
        alert(data.error || 'Gagal menghapus admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Terjadi kesalahan');
    }
  };

  // Handle open edit modal
  const handleOpenEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditForm({
      name: admin.name,
      username: admin.username,
      password: '',
      role: admin.role
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editForm.name || !editForm.username || !editForm.role) {
      setEditError('Nama, username, dan role harus diisi');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAdmin?.id,
          name: editForm.name,
          username: editForm.username.toLowerCase().replace(/\s/g, ''),
          password: editForm.password || undefined,
          role: editForm.role,
          currentUser: currentUser?.name,
          requesterRole: currentUser?.role
        })
      });

      const data = await res.json();
      if (data.success) {
        setAdminsList(adminsList.map(a => a.id === data.data.id ? data.data : a));
        setIsEditModalOpen(false);
        setEditingAdmin(null);
      } else {
        setEditError(data.error || 'Gagal menyimpan perubahan');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      setEditError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Pengaturan Sistem</h2>
          <p className="text-xs md:text-sm text-slate-500">Sesuaikan identitas dan akses pengelola.</p>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-xs font-bold">
          <LogOutIcon size={16} />
          <span>KELUAR ADMIN</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Visual Branding Section */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ImageIcon size={20} /></div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Visual & Branding</h3>
              </div>
              <button onClick={handleResetBranding} className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center space-x-1">
                <RotateCcw size={12} />
                <span>RESET DEFAULT</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors">
                    <img src={tempConfig.appLogo} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <FileUp size={14} />
                  </button>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Aplikasi</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10" 
                      value={tempConfig.appName} 
                      onChange={e => setTempConfig({...tempConfig, appName: e.target.value})} 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">* Nama ini akan muncul di Sidebar dan halaman Login.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RT Identity Section */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Server size={20} /></div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Identitas Pengurus</h3>
              </div>
              <button 
                onClick={handleSaveConfig} 
                disabled={isSavingConfig}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-blue-100"
              >
                {isSavingConfig ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>SIMPAN PERUBAHAN</span>
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Ketua RT</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={tempConfig.rtName} onChange={e => setTempConfig({...tempConfig, rtName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">WhatsApp Pak RT</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={tempConfig.rtWhatsapp} onChange={e => setTempConfig({...tempConfig, rtWhatsapp: e.target.value})} />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email RT (Notifikasi)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none" value={tempConfig.rtEmail} onChange={e => setTempConfig({...tempConfig, rtEmail: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Mini Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl">
             <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <img src={tempConfig.appLogo} alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <div className="font-bold text-sm truncate">{tempConfig.appName}</div>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Preview Tampilan</p>
             <div className="space-y-2 opacity-50">
                <div className="h-8 bg-white/5 rounded-lg w-full"></div>
                <div className="h-8 bg-white/5 rounded-lg w-3/4"></div>
             </div>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Daftar Pengelola</h3>
              {/* Hanya Super Admin yang bisa tambah admin */}
              {currentUser?.role === 'Super Admin' && (
                <button onClick={() => { setIsStaffModalOpen(true); setStaffError(''); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"><UserPlus size={16} /></button>
              )}
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {isLoadingAdmins ? (
                <div className="p-6 text-center">
                  <Loader2 size={20} className="animate-spin text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-400 mt-2">Memuat data...</p>
                </div>
              ) : adminsList.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-400">Belum ada pengelola</p>
                </div>
              ) : (
                adminsList.map((admin) => (
                  <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        admin.role === 'Super Admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : admin.role === 'Admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>{admin.name.charAt(0)}</div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800">{admin.name}</p>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          admin.role === 'Super Admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : admin.role === 'Admin'
                            ? 'bg-blue-100 text-blue-700'
                            : admin.role === 'Sekretaris RT'
                            ? 'bg-green-100 text-green-700'
                            : admin.role === 'Bendahara RT'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {admin.role === 'Super Admin' ? 'SUPER ADMIN' : admin.role === 'Admin' ? 'ADMIN' : admin.role}
                        </span>
                      </div>
                    </div>
                    {/* Hanya Super Admin yang bisa edit/hapus admin */}
                    {currentUser?.role === 'Super Admin' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(admin)}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit admin"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id!, admin.name)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus admin"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Warga Pindah & Meninggal - Hanya untuk Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Warga Pindah */}
        <div className="bg-white rounded-[24px] border border-blue-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-5 bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  <LogOutIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Warga Pindah</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Monitoring warga yang telah pindah</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                {wargaPindah.length} Jiwa
              </div>
            </div>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {wargaPindah.length > 0 ? (
              <div className="space-y-3">
                {wargaPindah.map((warga) => (
                  <div key={warga.nik} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-200 shrink-0">
                        {warga.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-slate-800">{warga.name}</p>
                          <div className="flex gap-1 shrink-0">
                            <button 
                              onClick={() => onEditResident?.(warga)}
                              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                              title="Edit data warga"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`Hapus data warga "${warga.name}"?`)) {
                                  onDeleteResident?.(warga.nik);
                                }
                              }}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="Hapus data warga"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">NIK</p>
                            <p className="text-[11px] text-slate-600 font-mono">{warga.nik}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">No. KK</p>
                            <p className="text-[11px] text-slate-600 font-mono">{warga.noKk}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Jenis Kelamin</p>
                            <p className="text-[11px] text-slate-600">{warga.gender}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Tgl Lahir</p>
                            <p className="text-[11px] text-slate-600">{warga.pob}, {warga.dob}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-100 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <p className="text-[9px] text-slate-400 font-bold uppercase min-w-[60px]">Alamat Asal</p>
                        <p className="text-[11px] text-slate-600">{warga.address || '-'}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <p className="text-[9px] text-blue-500 font-bold uppercase min-w-[60px]">Pindah Ke</p>
                        <p className="text-[11px] text-blue-600 font-medium">{warga.statusNote || '-'}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <p className="text-[9px] text-slate-400 font-bold uppercase min-w-[60px]">Tgl Pindah</p>
                        <p className="text-[11px] text-slate-600 font-medium">{warga.statusDate || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                  <LogOutIcon size={20} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Belum ada warga yang pindah</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel Warga Meninggal */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 md:p-5 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-600 text-white rounded-xl shadow-md">
                  <Skull size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Warga Meninggal Dunia</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Monitoring warga yang telah wafat</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-slate-600 text-white rounded-full text-xs font-bold">
                {wargaMeninggal.length} Jiwa
              </div>
            </div>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {wargaMeninggal.length > 0 ? (
              <div className="space-y-3">
                {wargaMeninggal.map((warga) => (
                  <div key={warga.nik} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg border border-slate-200 shrink-0">
                        {warga.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-slate-700">{warga.name}</p>
                          <div className="flex gap-1 shrink-0">
                            <button 
                              onClick={() => onEditResident?.(warga)}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition-colors"
                              title="Edit data warga"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`Hapus data warga "${warga.name}"?`)) {
                                  onDeleteResident?.(warga.nik);
                                }
                              }}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                              title="Hapus data warga"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">NIK</p>
                            <p className="text-[11px] text-slate-600 font-mono">{warga.nik}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">No. KK</p>
                            <p className="text-[11px] text-slate-600 font-mono">{warga.noKk}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Jenis Kelamin</p>
                            <p className="text-[11px] text-slate-600">{warga.gender}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Tgl Lahir</p>
                            <p className="text-[11px] text-slate-600">{warga.pob}, {warga.dob}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <p className="text-[9px] text-slate-400 font-bold uppercase min-w-[60px]">Alamat</p>
                        <p className="text-[11px] text-slate-600">{warga.address || '-'}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <p className="text-[9px] text-slate-500 font-bold uppercase min-w-[60px]">Keterangan</p>
                        <p className="text-[11px] text-slate-600 font-medium">{warga.statusNote || '-'}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <p className="text-[9px] text-slate-400 font-bold uppercase min-w-[60px]">Tgl Wafat</p>
                        <p className="text-[11px] text-slate-700 font-bold">{warga.statusDate || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                  <Skull size={20} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Belum ada warga yang meninggal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add Staff */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Tambah Admin Baru</h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              {staffError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-xs">
                  <AlertCircle size={14} />
                  <span>{staffError}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                <input required type="text" placeholder="Nama yang akan tampil" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                <input required type="text" placeholder="Untuk login (tanpa spasi)" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10" value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value.toLowerCase().replace(/\s/g, '')})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
                    value={staffForm.password}
                    onChange={e => setStaffForm({...staffForm, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan / Posisi</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
                  value={staffForm.role}
                  onChange={e => setStaffForm({...staffForm, role: e.target.value})}
                >
                  <optgroup label="Super Admin">
                    <option value="Super Admin">Super Admin (Akses Penuh)</option>
                  </optgroup>
                  <optgroup label="Admin Biasa">
                    <option value="Admin">Admin (Manage Warga & Surat)</option>
                    <option value="Sekretaris RT">Sekretaris RT</option>
                    <option value="Bendahara RT">Bendahara RT</option>
                    <option value="Staf">Staf</option>
                  </optgroup>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors">Batal</button>
                <button disabled={isSavingStaff} type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {isSavingStaff ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  <span>SIMPAN ADMIN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Admin */}
      {isEditModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Edit Admin</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-xs">
                  <AlertCircle size={14} />
                  <span>{editError}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                <input required type="text" placeholder="Nama yang akan tampil" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Username</label>
                <input required type="text" placeholder="Untuk login (tanpa spasi)" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value.toLowerCase().replace(/\s/g, '')})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Password Baru (kosongkan jika tidak diubah)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
                    value={editForm.password}
                    onChange={e => setEditForm({...editForm, password: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan / Posisi</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
                  value={editForm.role}
                  onChange={e => setEditForm({...editForm, role: e.target.value})}
                >
                  <optgroup label="Super Admin">
                    <option value="Super Admin">Super Admin (Akses Penuh)</option>
                  </optgroup>
                  <optgroup label="Admin Biasa">
                    <option value="Admin">Admin (Manage Warga & Surat)</option>
                    <option value="Sekretaris RT">Sekretaris RT</option>
                    <option value="Bendahara RT">Bendahara RT</option>
                    <option value="Staf">Staf</option>
                  </optgroup>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors">Batal</button>
                <button disabled={isSavingEdit} type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {isSavingEdit ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>SIMPAN PERUBAHAN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
