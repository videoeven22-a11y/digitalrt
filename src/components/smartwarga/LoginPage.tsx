'use client';

import React, { useState } from 'react';
import { Shield, User, Loader2, ArrowRight, AlertCircle, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { RTConfig } from '@/lib/types';

interface LoginPageProps {
  rtConfig: RTConfig;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onBack?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ rtConfig, onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await onLogin(username, password);
    
    if (!success) {
      setError('Username atau password salah');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 md:p-6 w-full">
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="self-start mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Dashboard
        </button>
      )}
      
      <div className="w-full max-w-[420px] space-y-6">
        {/* Logo dan Judul */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-xl mb-2">
            {rtConfig.appLogo ? (
              <img 
                src={rtConfig.appLogo} 
                alt="Logo" 
                className="w-12 h-12 object-contain" 
              />
            ) : (
              <Shield className="w-12 h-12 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{rtConfig.appName || 'SmartWarga'}</h1>
            <p className="text-slate-500 text-sm mt-1">Login Admin</p>
          </div>
        </div>

        {/* Form Login */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Kosongkan jika belum ada admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Kosongkan jika belum ada admin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>MASUK</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-bold">Cara Login:</p>
              <p className="mt-1"><strong>Belum ada admin:</strong> Kosongkan semua field, klik MASUK</p>
              <p className="mt-1"><strong>Sudah ada admin:</strong> Isi username & password yang terdaftar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
