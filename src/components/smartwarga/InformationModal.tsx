'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Link2, FileText, Calendar, Megaphone, Building2 } from 'lucide-react';

interface InfoData {
  id?: string;
  category: string;
  title: string;
  content: string;
  link?: string | null;
  icon?: string | null;
  color?: string | null;
  order?: number;
  isActive?: boolean;
}

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editData?: InfoData | null;
}

const categoryOptions = [
  { value: 'pemerintah', label: 'Info Pemerintah', icon: Building2 },
  { value: 'jadwal', label: 'Jadwal Ronda', icon: Calendar },
  { value: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
  { value: 'link', label: 'Link Penting', icon: Link2 },
];

const colorOptions = [
  { value: 'emerald', label: 'Hijau' },
  { value: 'blue', label: 'Biru' },
  { value: 'violet', label: 'Ungu' },
  { value: 'rose', label: 'Merah Muda' },
  { value: 'amber', label: 'Kuning' },
  { value: 'slate', label: 'Abu-abu' },
];

const InformationModal: React.FC<InformationModalProps> = ({ isOpen, onClose, onSave, editData }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<InfoData>({
    category: 'pengumuman',
    title: '',
    content: '',
    link: '',
    color: 'blue',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        category: 'pengumuman',
        title: '',
        content: '',
        link: '',
        color: 'blue',
        order: 0,
        isActive: true
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = '/api/information';
      const method = editData?.id ? 'PUT' : 'POST';
      const body = editData?.id 
        ? { ...formData, id: editData.id, currentUser: 'Admin' }
        : { ...formData, currentUser: 'Admin' };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        onSave();
        onClose();
      } else {
        alert(data.error || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving information:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {editData?.id ? 'Edit Informasi' : 'Tambah Informasi Baru'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori</label>
            <select
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Judul</label>
            <input
              required
              type="text"
              placeholder="Judul informasi"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Isi / Deskripsi</label>
            <textarea
              required
              rows={3}
              placeholder="Konten informasi"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Link (Opsional)</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
              value={formData.link || ''}
              onChange={e => setFormData({ ...formData, link: e.target.value || null })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Warna</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
                value={formData.color || 'blue'}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
              >
                {colorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Urutan</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
                value={formData.order || 0}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-xs text-slate-600">Tampilkan di dashboard</label>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              disabled={isSaving}
              type="submit"
              className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>SIMPAN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InformationModal;
