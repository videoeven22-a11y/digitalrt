'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, MapPin, User, Baby, Home, Users, Plus, Trash2 } from 'lucide-react';
import { MaritalStatus, Resident } from '@/lib/types';
import { fetchProvinces, fetchRegencies, fetchDistricts, fetchVillages } from '@/services/locationService';

interface ResidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Resident) => void;
  initialData: Resident | null;
  isAdmin?: boolean;
}

interface FamilyMember {
  name: string;
  nik: string;
  gender: string;
  dob: string;
  pob: string;
  religion: string;
  occupation: string;
  maritalStatus: string;
  relationship: string;
}

const shdkOptions = ["Kepala Keluarga", "Suami", "Istri", "Anak", "Menantu", "Cucu", "Orang Tua", "Mertua", "Famili Lain"];

const ResidentFormModal: React.FC<ResidentFormModalProps> = ({ isOpen, onClose, onSave, initialData, isAdmin = false }) => {
  const [provinces, setProvinces] = useState<any[]>([]);
  
  // States for Address
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  
  // States for POB (Place of Birth)
  const [pobRegencies, setPobRegencies] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'none' | 'province' | 'regency' | 'district' | 'village' | 'pob'>('none');

  // Family members state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [pobRegenciesFamily, setPobRegenciesFamily] = useState<{[key: number]: any[]}>({});

  const [formData, setFormData] = useState<Resident>({
    nik: '', noKk: '', name: '', pob: '', dob: '', gender: 'Laki-laki',
    religion: 'Islam', occupation: '-', bloodType: '-',
    maritalStatus: MaritalStatus.LAJANG, province: '', regency: '',
    district: '', village: '', address: '',
    status: 'AKTIF', statusDate: '', statusNote: ''
  });

  const [selProvId, setSelProvId] = useState('');
  const [selRegId, setSelRegId] = useState('');
  const [selDistId, setSelDistId] = useState('');
  const [selVillId, setSelVillId] = useState('');

  const [selPobProvId, setSelPobProvId] = useState('');
  const [selPobRegId, setSelPobRegId] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      if (isOpen) {
        setLoadingStep('province');
        const data = await fetchProvinces();
        setProvinces(data);
        setLoadingStep('none');

        if (initialData) {
          setFormData(initialData);
          setFamilyMembers([]);
        } else {
          setFormData({
            nik: '', noKk: '', name: '', pob: '', dob: '', gender: 'Laki-laki',
            religion: 'Islam', occupation: '-', bloodType: '-',
            maritalStatus: MaritalStatus.LAJANG, province: '', regency: '',
            district: '', village: '', address: '',
            status: 'AKTIF', statusDate: '', statusNote: ''
          });
          setSelProvId(''); setSelRegId(''); setSelDistId(''); setSelVillId('');
          setSelPobProvId(''); setSelPobRegId('');
          setFamilyMembers([]);
        }
      }
    };
    loadInitialData();
  }, [isOpen, initialData]);

  // Handle POB Province Change
  const handlePobProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelPobProvId(id);
    setSelPobRegId('');
    setPobRegencies([]);
    if (id) {
      setLoadingStep('pob');
      const data = await fetchRegencies(id);
      setPobRegencies(data);
      setLoadingStep('none');
    }
  };

  const handlePobRegChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = pobRegencies.find(r => r.id === id);
    setSelPobRegId(id);
    setFormData(prev => ({ ...prev, pob: item?.name || '' }));
  };

  // Handle Current Address Province Change
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = provinces.find(p => p.id === id);
    setSelProvId(id); setSelRegId(''); setSelDistId(''); setSelVillId('');
    setRegencies([]); setDistricts([]); setVillages([]);
    setFormData(prev => ({ ...prev, province: item?.name || '', regency: '', district: '', village: '' }));
    if (id) {
      setLoadingStep('regency');
      const data = await fetchRegencies(id);
      setRegencies(data);
      setLoadingStep('none');
    }
  };

  const handleRegencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = regencies.find(p => p.id === id);
    setSelRegId(id); setSelDistId(''); setSelVillId('');
    setDistricts([]); setVillages([]);
    setFormData(prev => ({ ...prev, regency: item?.name || '', district: '', village: '' }));
    if (id) {
      setLoadingStep('district');
      const data = await fetchDistricts(id);
      setDistricts(data);
      setLoadingStep('none');
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = districts.find(p => p.id === id);
    setSelDistId(id); setSelVillId(''); setVillages([]);
    setFormData(prev => ({ ...prev, district: item?.name || '', village: '' }));
    if (id) {
      setLoadingStep('village');
      const data = await fetchVillages(id);
      setVillages(data);
      setLoadingStep('none');
    }
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = villages.find(p => p.id === id);
    setSelVillId(id);
    setFormData(prev => ({ ...prev, village: item?.name || '' }));
  };

  // Family member handlers
  const addFamilyMember = () => {
    if (familyMembers.length >= 10) return;
    setFamilyMembers([...familyMembers, {
      name: '', nik: '', gender: 'Laki-laki', dob: '', pob: '',
      religion: 'Islam', occupation: '-', maritalStatus: 'Lajang',
      relationship: 'Anak'
    }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nik.length !== 16) { alert("NIK harus 16 digit!"); return; }
    
    setIsSubmitting(true);
    
    // Save main resident first
    await new Promise<void>((resolve) => {
      onSave(formData);
      setTimeout(resolve, 800);
    });

    // Save family members if any
    for (const member of familyMembers) {
      if (member.name && member.nik && member.nik.length === 16) {
        const familyResident: Resident = {
          nik: member.nik,
          noKk: formData.noKk, // Same KK
          name: member.name,
          pob: member.pob || '-',
          dob: member.dob,
          gender: member.gender as any,
          religion: member.religion,
          occupation: member.occupation || '-',
          bloodType: '-',
          maritalStatus: member.maritalStatus as any,
          province: formData.province, // Same address
          regency: formData.regency,
          district: formData.district,
          village: formData.village,
          address: formData.address,
          status: 'AKTIF',
          statusDate: '',
          statusNote: `Hubungan: ${member.relationship}`
        };
        await new Promise<void>((resolve) => {
          onSave(familyResident);
          setTimeout(resolve, 300);
        });
      }
    }
    
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 overflow-hidden">
      <div className="bg-white w-full max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom sm:zoom-in duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{initialData ? 'Ubah Data' : 'Pendaftaran Warga'}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">SINKRONISASI DATA NASIONAL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 flex-1 scrollbar-hide">
          <form id="resident-reg-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <User size={16} /><h4 className="text-[11px] font-black uppercase tracking-widest">Identitas Dasar</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">NIK</label>
                  <input 
                    required 
                    type="text" 
                    maxLength={16} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.nik} 
                    onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">No. KK</label>
                  <input 
                    required 
                    type="text" 
                    maxLength={16} 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.noKk} 
                    onChange={e => setFormData({...formData, noKk: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kelamin</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white"
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Status Pernikahan</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white"
                    value={formData.maritalStatus}
                    onChange={e => setFormData({...formData, maritalStatus: e.target.value as any})}
                  >
                    <option value="Lajang">Lajang</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Agama</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white"
                    value={formData.religion}
                    onChange={e => setFormData({...formData, religion: e.target.value})}
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Kristen Katolik">Kristen Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Pekerjaan</label>
                  <input 
                    type="text"
                    placeholder="Contoh: Wiraswasta, PNS, dll"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.occupation} 
                    onChange={e => setFormData({...formData, occupation: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Baby size={16} /><h4 className="text-[11px] font-black uppercase tracking-widest">Kelahiran (TTL)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Provinsi Lahir</label>
                  <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white" value={selPobProvId} onChange={handlePobProvChange}>
                    <option value="">Pilih Provinsi</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kota Lahir {loadingStep === 'pob' && '...'}</label>
                  <select required disabled={!selPobProvId} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white disabled:opacity-50" value={selPobRegId} onChange={handlePobRegChange}>
                    <option value="">Pilih Kota</option>
                    {pobRegencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                  <input required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <MapPin size={16} /><h4 className="text-[11px] font-black uppercase tracking-widest">Domisili Sekarang</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Provinsi</label>
                  <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white" value={selProvId} onChange={handleProvinceChange}>
                    <option value="">Pilih Provinsi</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kota {loadingStep === 'regency' && '...'}</label>
                  <select required disabled={!selProvId} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white disabled:opacity-50" value={selRegId} onChange={handleRegencyChange}>
                    <option value="">Pilih Kota</option>
                    {regencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kecamatan {loadingStep === 'district' && '...'}</label>
                  <select required disabled={!selRegId} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white disabled:opacity-50" value={selDistId} onChange={handleDistrictChange}>
                    <option value="">Pilih Kecamatan</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kelurahan {loadingStep === 'village' && '...'}</label>
                  <select required disabled={!selDistId} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none bg-white disabled:opacity-50" value={selVillId} onChange={handleVillageChange}>
                    <option value="">Pilih Kelurahan</option>
                    {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <Home size={14} /><label className="text-[10px] font-bold uppercase">Alamat Lengkap</label>
                  </div>
                  <textarea 
                    required 
                    rows={3}
                    placeholder="Contoh: Jl. Merdeka No. 05, RT 05/02"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                  <p className="text-[10px] text-slate-400 italic">Sebutkan nama jalan, nomor rumah, dan detail RT/RW.</p>
                </div>
              </div>
            </div>

            {/* Tambah Keluarga Section - Only for new registration */}
            {!initialData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-green-600">
                  <Users size={16} /><h4 className="text-[11px] font-black uppercase tracking-widest">Anggota Keluarga (Opsional)</h4>
                </div>
                <button 
                  type="button" 
                  onClick={addFamilyMember} 
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold hover:bg-green-100 transition-colors"
                >
                  <Plus size={14} /> TAMBAH
                </button>
              </div>
              
              {familyMembers.length > 0 && (
                <p className="text-[10px] text-slate-500">
                  Alamat domisili akan sama dengan kepala keluarga. Pastikan NIK berbeda untuk setiap anggota.
                </p>
              )}
              
              <div className="space-y-4">
                {familyMembers.map((member, idx) => (
                  <div key={idx} className="p-4 bg-green-50/50 rounded-xl border border-green-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-green-700">Anggota #{idx + 1}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFamilyMember(idx)} 
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                        <input 
                          type="text" 
                          placeholder="Nama anggota keluarga"
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]" 
                          value={member.name} 
                          onChange={e => updateFamilyMember(idx, 'name', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">NIK</label>
                        <input 
                          type="text" 
                          maxLength={16}
                          placeholder="16 digit NIK"
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]" 
                          value={member.nik} 
                          onChange={e => updateFamilyMember(idx, 'nik', e.target.value.replace(/\D/g, ''))} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Hubungan</label>
                        <select 
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]"
                          value={member.relationship}
                          onChange={e => updateFamilyMember(idx, 'relationship', e.target.value)}
                        >
                          {shdkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Jenis Kelamin</label>
                        <select 
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]"
                          value={member.gender}
                          onChange={e => updateFamilyMember(idx, 'gender', e.target.value)}
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Tgl Lahir</label>
                        <input 
                          type="date" 
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]" 
                          value={member.dob} 
                          onChange={e => updateFamilyMember(idx, 'dob', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Tempat Lahir</label>
                        <input 
                          type="text" 
                          placeholder="Kota kelahiran"
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]" 
                          value={member.pob} 
                          onChange={e => updateFamilyMember(idx, 'pob', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Agama</label>
                        <select 
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]"
                          value={member.religion}
                          onChange={e => updateFamilyMember(idx, 'religion', e.target.value)}
                        >
                          <option value="Islam">Islam</option>
                          <option value="Kristen Protestan">Kristen Protestan</option>
                          <option value="Kristen Katolik">Kristen Katolik</option>
                          <option value="Hindu">Hindu</option>
                          <option value="Buddha">Buddha</option>
                          <option value="Konghucu">Konghucu</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Pekerjaan</label>
                        <input 
                          type="text" 
                          placeholder="Pekerjaan"
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]" 
                          value={member.occupation} 
                          onChange={e => updateFamilyMember(idx, 'occupation', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Status Nikah</label>
                        <select 
                          className="w-full p-2.5 bg-white border rounded-lg text-[11px]"
                          value={member.maritalStatus}
                          onChange={e => updateFamilyMember(idx, 'maritalStatus', e.target.value)}
                        >
                          <option value="Lajang">Lajang</option>
                          <option value="Menikah">Menikah</option>
                          <option value="Cerai Hidup">Cerai Hidup</option>
                          <option value="Cerai Mati">Cerai Mati</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
          </form>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-bold text-sm">Batal</button>
          <button form="resident-reg-form" type="submit" disabled={isSubmitting || loadingStep !== 'none'} className="px-10 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg disabled:opacity-50 flex items-center space-x-2 transition-all active:scale-95">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentFormModal;
