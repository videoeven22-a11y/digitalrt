'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  PlusCircle,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onOpenService: () => void;
  onOpenRegister: () => void;
  isLoggedIn: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenService, onOpenRegister, isLoggedIn }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  ];

  if (isLoggedIn) {
    items.push({ id: 'warga', label: 'Warga', icon: Users });
    items.push({ id: 'surat', label: 'Surat', icon: FileText });
  } else {
    items.push({ id: 'surat', label: 'Surat', icon: FileText });
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-1 p-2 ${
              isActive ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <Icon size={22} />
            <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenRegister}
        className="flex flex-col items-center space-y-1 p-2 text-slate-400"
      >
        <UserPlus size={22} />
        <span className="text-[9px] font-bold uppercase tracking-tight">Daftar</span>
      </button>

      {!isLoggedIn && (
        <button
          onClick={() => setActiveTab('login')}
          className={`flex flex-col items-center space-y-1 p-2 ${
            activeTab === 'login' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <ShieldCheck size={22} />
          <span className="text-[9px] font-bold uppercase tracking-tight">Admin</span>
        </button>
      )}
      
      {/* Floating Action for Mobile Services */}
      <button 
        onClick={onOpenService}
        className="flex flex-col items-center -translate-y-6"
      >
        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-200 border-4 border-white active:scale-90 transition-transform">
          <PlusCircle size={28} />
        </div>
      </button>
    </div>
  );
};

export default BottomNav;
