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
  LogIn,
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
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'surat', label: 'Layanan Mandiri', icon: FileText },
  ];

  if (isLoggedIn) {
    menuItems.splice(1, 0, { id: 'warga', label: 'Database Warga', icon: Users });
    if (userRole === 'Super Admin') {
      menuItems.push(
        { id: 'admin', label: 'Kelola Admin', icon: ShieldCheck },
        { id: 'audit', label: 'Audit Log', icon: History }
      );
    }
  }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <img src={rtConfig.appLogo} alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-slate-800 leading-tight truncate">{rtConfig.appName}</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Layanan Digital</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-8 px-2 space-y-3">
          <button onClick={onOpenRegister} className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-xl transition-all font-black text-[11px] uppercase tracking-wider">
            <UserPlus size={16} /><span>DAFTAR WARGA</span>
          </button>
          <button onClick={onOpenService} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg shadow-blue-100 transition-all font-black text-[11px] uppercase tracking-wider">
            <PlusCircle size={16} /><span>AJUKAN SURAT</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
        {isLoggedIn ? (
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200">
            <LogOut size={18} /><span>LOG OUT</span>
          </button>
        ) : (
          <button onClick={() => setActiveTab('login')} className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-blue-600 hover:bg-blue-50 border-2 border-blue-100 rounded-2xl transition-all text-xs font-black uppercase tracking-widest bg-white shadow-sm">
            <LogIn size={18} /><span>LOGIN ADMIN</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
