'use client';

import React from 'react';
import { Bell, User, Menu, LogIn, LogOut, Shield } from 'lucide-react';
import { AdminUser } from '@/lib/types';
import { RTConfig } from '@/lib/types';

interface HeaderProps {
  user: AdminUser | null;
  onMenuClick: () => void;
  onAdminClick: () => void;
  rtConfig?: RTConfig;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuClick, onAdminClick, rtConfig }) => {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
      {/* Left side - Menu button (only for logged in) or Logo (for public) */}
      <div className="flex items-center space-x-4 flex-1">
        {user ? (
          <button 
            onClick={onMenuClick}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              {rtConfig?.appLogo ? (
                <img src={rtConfig.appLogo} alt="Logo" className="w-6 h-6 object-contain" />
              ) : (
                <Shield className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{rtConfig?.appName || 'SmartWarga'}</h1>
            </div>
          </div>
        )}
      </div>

      {/* Right side - Login or User info */}
      <div className="flex items-center gap-3">
        {!user ? (
          <button 
            onClick={onAdminClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all text-sm font-semibold shadow-md"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">Login Admin</span>
          </button>
        ) : (
          <>
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                {user.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.role}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
