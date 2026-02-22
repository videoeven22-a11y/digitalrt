'use client';

import React from 'react';
import { History, User, Clock } from 'lucide-react';

interface AuditLogProps {
  logs: any[];
}

const AuditLog: React.FC<AuditLogProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Log Aktivitas Sistem</h2>
          <p className="text-xs md:text-sm text-slate-500">Rekam jejak seluruh perubahan data (Keamanan & Audit)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Aktivitas</th>
                <th className="px-6 py-4">Target Objek</th>
                <th className="px-6 py-4">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shrink-0">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        log.type === 'CREATE' ? 'bg-emerald-500' :
                        log.type === 'UPDATE' ? 'bg-blue-500' :
                        log.type === 'DELETE' ? 'bg-red-500' : 
                        log.type === 'APPROVE' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                      <span className="text-sm font-medium text-slate-600">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono font-bold">{log.target}</code>
                  </td>
                  <td className="px-6 py-4 text-slate-400 flex items-center space-x-1 whitespace-nowrap">
                    <Clock size={12} />
                    <span className="text-[11px] font-medium">{log.time}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                    Belum ada aktivitas yang tercatat...
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

export default AuditLog;
