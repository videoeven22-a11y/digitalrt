'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  Check,
  X,
  Lock
} from 'lucide-react';
import { ServiceRequest, RequestStatus, RTConfig } from '@/lib/types';
import { generateWAUrl } from '@/services/whatsappService';

interface LetterRequestsProps {
  requests: ServiceRequest[];
  onUpdateStatus: (id: string, status: RequestStatus) => void;
  isLoggedIn: boolean;
  rtConfig: RTConfig;
}

const LetterRequests: React.FC<LetterRequestsProps> = ({ requests, onUpdateStatus, isLoggedIn, rtConfig }) => {
  // No search for public view - show all requests

  const handleWhatsApp = (req: ServiceRequest) => {
    const url = generateWAUrl({
      name: req.residentName,
      nik: req.nik,
      address: req.address || 'Wilayah RT 03 / RW 02 Kp. Jati',
      type: req.type,
      rtPhone: rtConfig.rtWhatsapp,
      rtEmail: rtConfig.rtEmail,
      purpose: req.purpose,
      pdfLink: 'https://smartwarga.id/docs/' + req.id + '.pdf'
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Antrean Layanan</h2>
          <p className="text-xs md:text-sm text-slate-500">
            Daftar pengajuan surat yang sedang diproses oleh RT 03 Kp. Jati.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/30">
          {!isLoggedIn && (
            <div className="flex items-center space-x-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <Lock size={14} />
              <span>LOGIN ADMIN UNTUK VERIFIKASI</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">ID & Warga</th>
                <th className="px-6 py-4">Dokumen</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length > 0 ? requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0 font-mono text-[10px]">
                        ID
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{req.residentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{req.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-600">{req.type}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 italic">{req.createdAt ? new Date(req.createdAt).toLocaleDateString('id-ID') : '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      req.status === RequestStatus.APPROVED ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      req.status === RequestStatus.REJECTED ? 'bg-red-50 text-red-600 border border-red-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {req.status === RequestStatus.APPROVED && <CheckCircle2 size={12} />}
                      {req.status === RequestStatus.REJECTED && <XCircle size={12} />}
                      <span>{req.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      {isLoggedIn && req.status === RequestStatus.PENDING && (
                        <>
                          <button 
                            onClick={() => req.id && onUpdateStatus(req.id, RequestStatus.APPROVED)}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                            title="Setujui"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => req.id && onUpdateStatus(req.id, RequestStatus.REJECTED)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                            title="Tolak"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleWhatsApp(req)}
                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                        title="Hubungi WA"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                    Belum ada pengajuan surat yang masuk...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LetterRequests;
