'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { AdminUser, RTConfig } from '@/lib/types';

interface LoginPageProps {
  rtConfig: RTConfig;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ rtConfig, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [initStatus, setInitStatus] = useState<'checking' | 'ready' | 'error'>('checking');

  // Initialize database on mount
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const res = await fetch('/api/init');
        const data = await res.json();
        if (data.success) {
          setInitStatus('ready');
          console.log('Database initialized:', data.message);
        } else {
          setInitStatus('error');
          console.error('Init failed:', data.error);
        }
      } catch (err) {
        console.error('Init error:', err);
        setInitStatus('ready'); // Still allow login attempt
      }
    };
    initDatabase();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await onLogin(username, password);
    
    if (!success) {
      setError('Username atau password salah. Coba: admin/admin123');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 md:p-6">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="w-full max-w-[420px] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[32px] shadow-2xl shadow-blue-100 mb-2 overflow-hidden border-4 border-white transform transition-transform hover:scale-105">
            <img 
              src={rtConfig.appLogo} 
              alt="Logo" 
              className="w-14 h-14 object-contain" 
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{rtConfig.appName}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Sistem Administrasi RT 03 / RW 02 Kp. Jati</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm relative">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
             <Shield size={120} />
          </div>

          {/* Loading state while initializing */}
          {initStatus === 'checking' && (
            <div className="flex items-center justify-center py-8 space-x-3 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm">Memproses...</span>
            </div>
          )}

          {initStatus !== 'checking' && (
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username Admin</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="Masukkan username"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kata Sandi</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[11px] text-red-600 font-bold flex items-center space-x-3 animate-bounce">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-70 group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span className="text-sm">MASUK DASHBOARD</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Default credentials hint */}
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-700">Kredensial Default:</p>
              <p className="text-xs text-blue-600 mt-1">Username: <code className="bg-blue-100 px-1.5 py-0.5 rounded">admin</code></p>
              <p className="text-xs text-blue-600">Password: <code className="bg-blue-100 px-1.5 py-0.5 rounded">admin123</code></p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">SmartWarga RT 03 Kp. Jati • Digitalized v2.4.1</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
