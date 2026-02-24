'use client';

import React, { useState, useEffect } from 'react';
import {
  Link2,
  Link2Off,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Clock,
  Settings,
  History,
  Loader2,
  Sheet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Trash2,
  Key,
  Info,
  FileJson,
  Sparkles,
} from 'lucide-react';

interface SyncConfig {
  id?: string;
  sheetUrl: string;
  sheetId?: string;
  sheetName: string;
  serviceAccount?: string;
  autoSync: boolean;
  syncInterval: number;
  isActive: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  lastSyncCount?: number;
}

interface SyncLog {
  id: string;
  direction: string;
  status: string;
  message: string | null;
  recordsPushed: number;
  recordsPulled: number;
  recordsUpdated: number;
  recordsFailed: number;
  startedAt: string;
  completedAt: string | null;
}

interface SyncSettingsProps {
  currentUser?: string;
  onSyncComplete?: () => void;
}

const SyncSettings: React.FC<SyncSettingsProps> = ({ currentUser, onSyncComplete }) => {
  const [config, setConfig] = useState<SyncConfig | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [sheetUrl, setSheetUrl] = useState('');
  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rowCount?: number } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const configRes = await fetch('/api/sync');
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.success && configData.data) {
          setConfig(configData.data);
          setSheetUrl(configData.data.sheetUrl);
          if (configData.data.serviceAccount) {
            setServiceAccountJson('***configured***');
          }
        }
      }

      const logsRes = await fetch('/api/sync?action=logs');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        if (logsData.success) {
          setLogs(logsData.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading sync data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!sheetUrl.trim()) {
      setTestResult({ success: false, message: 'Masukkan URL Google Sheet terlebih dahulu' });
      return;
    }

    setIsConnecting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'test', 
          sheetUrl,
          serviceAccount: serviceAccountJson && serviceAccountJson !== '***configured***' ? serviceAccountJson : undefined
        }),
      });

      const data = await res.json();
      setTestResult(data.data);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    if (!sheetUrl.trim()) return;

    setIsConnecting(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          sheetUrl,
          sheetName: 'Sheet1',
          serviceAccount: serviceAccountJson && serviceAccountJson !== '***configured***' ? serviceAccountJson : undefined,
          autoSync: true,
          syncInterval: 60,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setTestResult({ success: true, message: data.message || 'Berhasil terhubung ke Google Sheet!' });
        loadData();
      } else {
        setTestResult({ success: false, message: data.error || 'Gagal menyimpan konfigurasi' });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async (direction: 'pull' | 'push' | 'sync') => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: direction,
          currentUser,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSyncResult({ success: true, message: data.data.message });
        loadData();
        onSyncComplete?.();
      } else {
        setSyncResult({ success: false, message: data.data?.message || data.error || 'Gagal sinkronisasi' });
      }
    } catch (error: any) {
      setSyncResult({ success: false, message: error.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Yakin ingin memutus koneksi sinkronisasi?')) return;

    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      });

      setConfig(null);
      setSheetUrl('');
      setServiceAccountJson('');
      setTestResult(null);
      setSyncResult(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleExportForSync = async () => {
    window.open('/api/sync?action=export', '_blank');
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'partial':
        return <AlertCircle size={16} className="text-amber-500" />;
      default:
        return <Clock size={16} className="text-slate-400" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'pull':
        return <ArrowDownToLine size={14} className="text-blue-500" />;
      case 'push':
        return <ArrowUpFromLine size={14} className="text-emerald-500" />;
      case 'bidirectional':
        return <ArrowLeftRight size={14} className="text-purple-500" />;
      default:
        return <RotateCcw size={14} className="text-slate-400" />;
    }
  };

  const hasWriteAccess = config?.serviceAccount || (serviceAccountJson && serviceAccountJson !== '***configured***');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
            <Sheet size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Sinkronisasi Google Sheets</h3>
            <p className="text-xs text-slate-500">Two-way sync antara database lokal dan Google Spreadsheet</p>
          </div>
        </div>
        {config && (
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            hasWriteAccess 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            <Link2 size={12} />
            {hasWriteAccess ? 'Read & Write' : 'Read Only'}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings size={14} />
          Pengaturan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <History size={14} />
          Riwayat
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-5">
          {/* Connection Setup */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-lg mt-0.5">
                <Link2 size={16} className="text-slate-500" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-600 block mb-2">
                  URL Google Spreadsheet
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    disabled={isConnecting}
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={isConnecting || !sheetUrl}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    {isConnecting ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Settings - Service Account */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Key size={12} />
                {showAdvanced ? 'Sembunyikan' : 'Tampilkan'} Pengaturan Lanjutan (Service Account)
              </button>
              
              {showAdvanced && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles size={16} className="text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Service Account untuk Write Access</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Dengan Service Account, Anda bisa menulis data KE Google Sheet secara otomatis saat menambah/mengubah data warga.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1.5">
                      <FileJson size={12} className="inline mr-1" />
                      Service Account JSON Key
                    </label>
                    <textarea
                      value={serviceAccountJson}
                      onChange={(e) => setServiceAccountJson(e.target.value)}
                      placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-24 resize-none"
                      disabled={isConnecting}
                    />
                  </div>
                  
                  <div className="p-3 bg-white/50 rounded-lg border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-600 mb-2">Cara mendapatkan Service Account:</p>
                    <ol className="space-y-1 text-[10px] text-slate-500">
                      <li>1. Buka Google Cloud Console</li>
                      <li>2. Buat Service Account & download JSON key</li>
                      <li>3. Share Google Sheet dengan email Service Account</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} className="mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium">{testResult.message}</p>
                  {testResult.rowCount !== undefined && (
                    <p className="mt-1 opacity-75">Ditemukan {testResult.rowCount} baris data</p>
                  )}
                </div>
              </div>
            )}

            {/* Connect/Disconnect Buttons */}
            <div className="flex gap-2 pt-2">
              {config ? (
                <button
                  onClick={handleDisconnect}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all border border-red-100"
                >
                  <Link2Off size={14} />
                  Putus Koneksi
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !sheetUrl}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isConnecting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Link2 size={14} />
                  )}
                  Hubungkan
                </button>
              )}
            </div>
          </div>

          {/* Sync Actions */}
          {config && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ArrowLeftRight size={16} />
                Aksi Sinkronisasi
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Pull from Sheet */}
                <button
                  onClick={() => handleSync('pull')}
                  disabled={isSyncing}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-all disabled:opacity-50"
                >
                  <div className="p-2.5 bg-white rounded-xl shadow-sm">
                    <ArrowDownToLine size={18} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-700">Pull</p>
                    <p className="text-[10px] text-slate-500">Dari Sheet</p>
                  </div>
                </button>

                {/* Push to Sheet */}
                <button
                  onClick={() => handleSync('push')}
                  disabled={isSyncing || !hasWriteAccess}
                  className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition-all disabled:opacity-50"
                >
                  <div className="p-2.5 bg-white rounded-xl shadow-sm">
                    <ArrowUpFromLine size={18} className="text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-700">Push</p>
                    <p className="text-[10px] text-slate-500">Ke Sheet</p>
                  </div>
                </button>

                {/* Export CSV */}
                <button
                  onClick={handleExportForSync}
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-100 transition-all"
                >
                  <div className="p-2.5 bg-white rounded-xl shadow-sm">
                    <Download size={18} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-700">Export</p>
                    <p className="text-[10px] text-slate-500">CSV</p>
                  </div>
                </button>
              </div>

              {!hasWriteAccess && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    <strong>Mode Read-Only:</strong> Untuk bisa Push data ke Google Sheet, konfigurasikan Service Account di pengaturan lanjutan.
                  </p>
                </div>
              )}

              {/* Last Sync Info */}
              {config.lastSyncAt && (
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-xs text-slate-500">Sinkronisasi terakhir:</span>
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    {formatDate(config.lastSyncAt)} ({config.lastSyncCount} data)
                  </span>
                </div>
              )}

              {/* Sync Result */}
              {syncResult && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  syncResult.success
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {syncResult.success ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={16} className="mt-0.5 shrink-0" />
                  )}
                  <p>{syncResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Info size={16} />
              Cara Menggunakan:
            </h4>
            <ol className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Buat Google Spreadsheet dengan header: NIK, No KK, Nama, Tempat Lahir, Tanggal Lahir, dll.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Share spreadsheet dengan Editor (untuk write) atau publish ke web (untuk read-only)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span>Copy URL spreadsheet dan paste di atas, lalu klik "Hubungkan"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                <span>Untuk <strong>auto-sync saat tambah warga</strong>, konfigurasikan Service Account</span>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {logs.length > 0 ? (
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg mt-0.5">
                        {getDirectionIcon(log.direction)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700 capitalize">{log.direction}</span>
                          {getStatusIcon(log.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{log.message || 'Sinkronisasi selesai'}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {log.recordsPulled > 0 && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              +{log.recordsPulled} baru
                            </span>
                          )}
                          {log.recordsPushed > 0 && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              ↑{log.recordsPushed} push
                            </span>
                          )}
                          {log.recordsUpdated > 0 && (
                            <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                              ↻{log.recordsUpdated} update
                            </span>
                          )}
                          {log.recordsFailed > 0 && (
                            <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              ✗{log.recordsFailed} gagal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400">{formatDate(log.startedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <History size={24} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">Belum ada riwayat sinkronisasi</p>
            </div>
          )}
        </div>
      )}

      {/* Sheet Link */}
      {config && (
        <a
          href={config.sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-200"
        >
          <ExternalLink size={14} />
          Buka Google Spreadsheet
        </a>
      )}
    </div>
  );
};

export default SyncSettings;
