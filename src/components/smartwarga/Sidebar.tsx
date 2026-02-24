'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  PlusCircle, 
  ShieldCheck, 
  History, 
  LogOut,
  X,
  UserPlus
} from 'lucide-react';
import { RTConfig } from '@/lib/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenService: () => void;
  onOpenRegister: () => void;
  userRole: string | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  rtConfig: RTConfig;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenService, 
  onOpenRegister,
  userRole, 
  isOpen, 
  onClose,
  onLogout,
  isLoggedIn,
  rtConfig
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'warga', label: 'Database Warga', icon: Users },
    { id: 'surat', label: 'Pengajuan Surat', icon: FileText },
    { id: 'admin', label: 'Pengaturan', icon: ShieldCheck },
  ];

  const handleMenuClick = (tab: string) => {
    setActiveTab(tab);
    onClose();
  };

  const handleOpenService = () => {
    onOpenService();
    onClose();
  };

  const handleOpenRegister = () => {
    onOpenRegister();
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[320px] bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              {rtConfig.appLogo ? (
                <img src={rtConfig.appLogo} alt="Logo" className="w-6 h-6 object-contain" />
              ) : (
                <Users className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight truncate">{rtConfig.appName || 'SmartWarga'}</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Layanan Digital</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100 mt-2">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider px-4">Aksi Cepat</p>
          </div>

          <button
            onClick={handleOpenService}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-all"
          >
            <PlusCircle size={20} />
            <span>Ajukan Surat</span>
          </button>

          <button
            onClick={handleOpenRegister}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all"
          >
            <UserPlus size={20} />
            <span>Daftar Warga</span>
          </button>

          {isLoggedIn && (
            <>
              <div className="pt-4 border-t border-slate-100 mt-2">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider px-4">Admin</p>
              </div>

              {userRole === 'Super Admin' && (
                <button
                  onClick={() => handleMenuClick('audit')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${activeTab === 'audit' 
                      ? 'bg-purple-50 text-purple-600' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <History size={20} />
                  <span>Riwayat Aktivitas</span>
                </button>
              )}

              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} />
                <span>Keluar Admin</span>
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
