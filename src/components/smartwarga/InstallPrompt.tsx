'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, Share2, Plus } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
  }, []);

  useEffect(() => {
    // Check if this is first visit
    const hasVisited = localStorage.getItem('smartwarga-visited');
    
    if (hasVisited) {
      return;
    }

    // Mark as visited
    localStorage.setItem('smartwarga-visited', 'true');
    
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // Show prompt after 3 seconds if not installed
    if (!standalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Detect Android
  const isAndroid = /Android/.test(navigator.userAgent);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden w-full max-w-sm animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pasang Aplikasi</h3>
                <p className="text-xs text-green-100">Akses lebih cepat dari home screen</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 text-center">
            Simpan SmartWarga di ponsel Anda untuk akses lebih mudah!
          </p>

          {isIOS ? (
            // iOS Instructions
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                  <Share2 size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">1. Tap Tombol Share</p>
                  <p className="text-xs text-slate-400">Ikon kotak dengan panah ke atas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                  <Plus size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">2. Pilih &quot;Add to Home Screen&quot;</p>
                  <p className="text-xs text-slate-400">Scroll ke bawah</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Download size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-700">3. Tap &quot;Add&quot;</p>
                  <p className="text-xs text-emerald-600">Selesai! Ikon ada di home screen</p>
                </div>
              </div>
            </div>
          ) : isAndroid ? (
            // Android Instructions
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl text-lg font-bold">
                  ⋮
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">1. Tap Menu (⋮)</p>
                  <p className="text-xs text-slate-400">Pojok kanan atas browser</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                  <Plus size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">2. Pilih &quot;Add to Home screen&quot;</p>
                  <p className="text-xs text-slate-400">Atau &quot;Install app&quot;</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Download size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-700">Selesai!</p>
                  <p className="text-xs text-emerald-600">Ikon SmartWarga ada di home screen</p>
                </div>
              </div>
            </div>
          ) : (
            // Desktop/Other
            <div className="text-center py-4">
              <p className="text-sm text-slate-600">
                Buka halaman ini di ponsel Anda untuk menginstall aplikasi.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button 
            onClick={handleDismiss}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
