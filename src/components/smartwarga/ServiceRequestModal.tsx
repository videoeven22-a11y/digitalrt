'use client';

// ServiceRequestModal - Form Surat dengan dropdown wilayah untuk Surat Pindah
import React, { useState, useEffect } from 'react';
import { 
  X, Send, FileText, CheckCircle2, Download, 
  MapPin, User, Loader2, Home, 
  Briefcase, Fingerprint, Plus, Trash2,
  Navigation, MapPinned, Info, ClipboardList,
  ChevronRight, ChevronLeft, BookOpen, Baby,
  Clock, Calendar, Skull, Heart, Users as UsersIcon,
  PlusCircle, ArrowRightLeft, Map, UserPlus, Globe,
  ShieldAlert, CheckCircle
} from 'lucide-react';
import { LetterType, ServiceRequest, RequestStatus, RTConfig, MaritalStatus, Resident } from '@/lib/types';
import { jsPDF } from 'jspdf';
import { fetchProvinces, fetchRegencies, fetchDistricts, fetchVillages } from '@/services/locationService';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (req: ServiceRequest) => void;
  rtConfig: RTConfig;
}

interface FamilyMember {
  nik: string;
  name: string;
  shdk: string;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ isOpen, onClose, onSubmit, rtConfig }) => {
  const [step, setStep] = useState(1);
  
  // Constants
  const hariOptions = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const pasaranOptions = ["Legi", "Paing", "Pon", "Wage", "Kliwon"];
  const klasifikasiOptions = [
    "Dalam satu desa/kelurahan",
    "Antar desa/kelurahan dalam satu kecamatan",
    "Antar kecamatan dalam satu kabupaten/kota",
    "Antar kabupaten/kota dalam satu provinsi",
    "Antar provinsi"
  ];
  const alasanOptions = ["Pekerjaan", "Pendidikan", "Kesehatan", "Keamanan", "Keluarga", "Perumahan", "Lainnya"];
  const jenisPindahOptions = ["Kepala Keluarga", "KK & Seluruh Anggota Keluarga", "KK & Sebagian Anggota Keluarga", "Anggota Keluarga"];
  const shdkOptions = ["Kepala Keluarga", "Suami", "Istri", "Anak", "Menantu", "Cucu", "Orang Tua", "Mertua", "Famili Lain"];

  // Location dropdown states - Daerah Asal
  const [provinces, setProvinces] = useState<any[]>([]);
  const [asalRegencies, setAsalRegencies] = useState<any[]>([]);
  const [asalDistricts, setAsalDistricts] = useState<any[]>([]);
  const [asalVillages, setAsalVillages] = useState<any[]>([]);
  const [selAsalProvId, setSelAsalProvId] = useState('');
  const [selAsalRegId, setSelAsalRegId] = useState('');
  const [selAsalDistId, setSelAsalDistId] = useState('');
  const [selAsalVillId, setSelAsalVillId] = useState('');

  // Location dropdown states - Daerah Tujuan
  const [tujuanRegencies, setTujuanRegencies] = useState<any[]>([]);
  const [tujuanDistricts, setTujuanDistricts] = useState<any[]>([]);
  const [tujuanVillages, setTujuanVillages] = useState<any[]>([]);
  const [selTujuanProvId, setSelTujuanProvId] = useState('');
  const [selTujuanRegId, setSelTujuanRegId] = useState('');
  const [selTujuanDistId, setSelTujuanDistId] = useState('');
  const [selTujuanVillId, setSelTujuanVillId] = useState('');

  const [loadingLocation, setLoadingLocation] = useState<'none' | 'asal-reg' | 'asal-dist' | 'asal-vill' | 'tujuan-reg' | 'tujuan-dist' | 'tujuan-vill'>('none');

  // Form State
  const [formData, setFormData] = useState({
    nik: '', 
    name: '', 
    noKk: '',
    type: LetterType.SKTM,
    gender: 'Laki-laki',
    pob: '',
    dob: '',
    religion: 'Islam',
    occupation: 'Wiraswasta',
    maritalStatus: MaritalStatus.LAJANG,
    purpose: '',
    address: '', 
    nationality: 'WNI',
    durationStay: '',
    
    // Alamat Pindah F-1.03 Detail
    addrAsal: '', rtAsal: '', rwAsal: '', desaAsal: '', kecAsal: '', kabAsal: 'Kota Tangerang', provAsal: 'Banten',
    addrTujuan: '', rtTujuan: '', rwTujuan: '', desaTujuan: '', kecTujuan: '', kabTujuan: '', provTujuan: '',
    alasanPindah: 'Keluarga',
    klasifikasiPindah: klasifikasiOptions[3],
    jenisPindah: jenisPindahOptions[1],

    // Detail Kematian
    deathDate: '', 
    deathDay: 'Senin', 
    deathPasaran: 'Legi', 
    deathTime: '00:00',
    deathPlace: '', 
    burialPlace: '', 
    deathCause: 'Sakit / Usia',

    // Detail Nikah Model N1
    brideStatus: 'Perjaka / Gadis',
    fatherName: '', fatherNik: '', fatherTtl: '', fatherReligion: 'Islam', fatherJob: '', fatherAddress: '',
    motherName: '', motherNik: '', motherTtl: '', motherReligion: 'Islam', motherJob: '', motherAddress: '',

    // Detail SKTM (Orang Tua & Anak)
    parentName: '',
    parentNik: '',
    parentPobDob: '',
    parentJob: '',
    parentAddress: '',
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [foundResident, setFoundResident] = useState<Resident | null>(null);
  const [isSearchingNik, setIsSearchingNik] = useState(false);

  // Lookup resident by NIK
  const lookupResidentByNik = async (nik: string) => {
    if (nik.length !== 16) {
      setFoundResident(null);
      return;
    }
    setIsSearchingNik(true);
    try {
      const res = await fetch(`/api/residents?search=${nik}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const resident = data.data[0];
        setFoundResident(resident);
        // Auto-fill form data
        setFormData(prev => ({
          ...prev,
          name: resident.name,
          noKk: resident.noKk,
          pob: resident.pob,
          dob: resident.dob,
          gender: resident.gender,
          religion: resident.religion,
          occupation: resident.occupation,
          maritalStatus: resident.maritalStatus,
          address: resident.address || prev.address
        }));
      } else {
        setFoundResident(null);
      }
    } catch (error) {
      console.error('Error looking up resident:', error);
      setFoundResident(null);
    }
    setIsSearchingNik(false);
  };

  // Debounced NIK lookup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.nik.length === 16) {
        lookupResidentByNik(formData.nik);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.nik]);

  // Calculate Javanese Pasaran from date
  // Reference: January 1, 1900 was Senin Pahing
  const calculateHariPasaran = (dateStr: string) => {
    if (!dateStr) return { hari: '', pasaran: '' };
    
    const hariList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const pasaranList = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Minggu, 1 = Senin, etc.
    const hari = hariList[dayOfWeek];
    
    // Calculate days since reference date (Jan 1, 1900 = Pahing = index 1)
    const refDate = new Date(1900, 0, 1); // January 1, 1900
    const diffTime = date.getTime() - refDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Jan 1, 1900 was Pahing (index 1), so we add 1 to the calculation
    const pasaranIndex = ((diffDays % 5) + 5 + 1) % 5; // +5 to handle negative, +1 for Pahing offset
    const pasaran = pasaranList[pasaranIndex];
    
    return { hari, pasaran };
  };

  // Handle death date change with auto-calculated hari & pasaran
  const handleDeathDateChange = (dateValue: string) => {
    const { hari, pasaran } = calculateHariPasaran(dateValue);
    setFormData(prev => ({
      ...prev,
      deathDate: dateValue,
      deathDay: hari,
      deathPasaran: pasaran
    }));
  };

  // Load provinces on modal open
  useEffect(() => {
    const loadProvinces = async () => {
      if (isOpen) {
        const data = await fetchProvinces();
        setProvinces(data);
      }
    };
    loadProvinces();
  }, [isOpen]);

  // Handlers for Daerah Asal dropdowns
  const handleAsalProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = provinces.find(p => p.id === id);
    setSelAsalProvId(id);
    setSelAsalRegId(''); setSelAsalDistId(''); setSelAsalVillId('');
    setAsalRegencies([]); setAsalDistricts([]); setAsalVillages([]);
    setFormData(prev => ({ ...prev, provAsal: item?.name || '', kabAsal: '', kecAsal: '', desaAsal: '' }));
    if (id) {
      setLoadingLocation('asal-reg');
      const data = await fetchRegencies(id);
      setAsalRegencies(data);
      setLoadingLocation('none');
    }
  };

  const handleAsalRegChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = asalRegencies.find(r => r.id === id);
    setSelAsalRegId(id);
    setSelAsalDistId(''); setSelAsalVillId('');
    setAsalDistricts([]); setAsalVillages([]);
    setFormData(prev => ({ ...prev, kabAsal: item?.name || '', kecAsal: '', desaAsal: '' }));
    if (id) {
      setLoadingLocation('asal-dist');
      const data = await fetchDistricts(id);
      setAsalDistricts(data);
      setLoadingLocation('none');
    }
  };

  const handleAsalDistChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = asalDistricts.find(d => d.id === id);
    setSelAsalDistId(id);
    setSelAsalVillId('');
    setAsalVillages([]);
    setFormData(prev => ({ ...prev, kecAsal: item?.name || '', desaAsal: '' }));
    if (id) {
      setLoadingLocation('asal-vill');
      const data = await fetchVillages(id);
      setAsalVillages(data);
      setLoadingLocation('none');
    }
  };

  const handleAsalVillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = asalVillages.find(v => v.id === id);
    setSelAsalVillId(id);
    setFormData(prev => ({ ...prev, desaAsal: item?.name || '' }));
  };

  // Handlers for Daerah Tujuan dropdowns
  const handleTujuanProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = provinces.find(p => p.id === id);
    setSelTujuanProvId(id);
    setSelTujuanRegId(''); setSelTujuanDistId(''); setSelTujuanVillId('');
    setTujuanRegencies([]); setTujuanDistricts([]); setTujuanVillages([]);
    setFormData(prev => ({ ...prev, provTujuan: item?.name || '', kabTujuan: '', kecTujuan: '', desaTujuan: '' }));
    if (id) {
      setLoadingLocation('tujuan-reg');
      const data = await fetchRegencies(id);
      setTujuanRegencies(data);
      setLoadingLocation('none');
    }
  };

  const handleTujuanRegChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = tujuanRegencies.find(r => r.id === id);
    setSelTujuanRegId(id);
    setSelTujuanDistId(''); setSelTujuanVillId('');
    setTujuanDistricts([]); setTujuanVillages([]);
    setFormData(prev => ({ ...prev, kabTujuan: item?.name || '', kecTujuan: '', desaTujuan: '' }));
    if (id) {
      setLoadingLocation('tujuan-dist');
      const data = await fetchDistricts(id);
      setTujuanDistricts(data);
      setLoadingLocation('none');
    }
  };

  const handleTujuanDistChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = tujuanDistricts.find(d => d.id === id);
    setSelTujuanDistId(id);
    setSelTujuanVillId('');
    setTujuanVillages([]);
    setFormData(prev => ({ ...prev, kecTujuan: item?.name || '', desaTujuan: '' }));
    if (id) {
      setLoadingLocation('tujuan-vill');
      const data = await fetchVillages(id);
      setTujuanVillages(data);
      setLoadingLocation('none');
    }
  };

  const handleTujuanVillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const item = tujuanVillages.find(v => v.id === id);
    setSelTujuanVillId(id);
    setFormData(prev => ({ ...prev, desaTujuan: item?.name || '' }));
  };

  const addFamilyMember = () => {
    if (familyMembers.length >= 10) return;
    setFamilyMembers([...familyMembers, { nik: '', name: '', shdk: 'Anak' }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 15;

    const drawRow = (l: string, v: string, cy: number) => {
      doc.text(l, margin, cy); doc.text(`: ${v}`, 65, cy);
      return cy + 8;
    };

    if (formData.type === LetterType.PINDAH) {
      doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.rect(170, y - 5, 25, 8); doc.text('F-1.03', 182.5, y, { align: 'center' });
      doc.text('PERMENDAGRI NOMOR 109 TAHUN 2019', margin, y); y += 8;
      doc.setFontSize(11); doc.text('FORMULIR PENDAFTARAN PERPINDAHAN PENDUDUK', 105, y, { align: 'center' });
      y += 10; doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      
      y = drawRow('1. Nomor Kartu Keluarga', formData.noKk, y);
      y = drawRow('2. Nama Lengkap Pemohon', formData.name, y);
      y = drawRow('3. NIK Pemohon', formData.nik, y);
      
      y += 3; doc.setFont('helvetica', 'bold'); doc.text('DATA DAERAH ASAL', margin, y); doc.setFont('helvetica', 'normal'); y += 5;
      y = drawRow('Alamat', `${formData.addrAsal} RT:${formData.rtAsal} RW:${formData.rwAsal}`, y);
      y = drawRow('Desa/Kecamatan', `${formData.desaAsal} / ${formData.kecAsal}`, y);
      y = drawRow('Kab/Prov', `${formData.kabAsal} / ${formData.provAsal}`, y);

      y += 3; doc.setFont('helvetica', 'bold'); doc.text('DATA DAERAH TUJUAN', margin, y); doc.setFont('helvetica', 'normal'); y += 5;
      y = drawRow('Alamat Tujuan', `${formData.addrTujuan} RT:${formData.rtTujuan} RW:${formData.rwTujuan}`, y);
      y = drawRow('Wilayah Tujuan', `${formData.desaTujuan}, ${formData.kecTujuan}`, y);
      y = drawRow('Kab/Prov Tujuan', `${formData.kabTujuan}, ${formData.provTujuan}`, y);

      y += 3; doc.setFont('helvetica', 'bold'); doc.text('ALASAN & KLASIFIKASI', margin, y); doc.setFont('helvetica', 'normal'); y += 5;
      y = drawRow('Alasan Pindah', formData.alasanPindah, y);
      y = drawRow('Klasifikasi Pindah', formData.klasifikasiPindah, y);
      y = drawRow('Jenis Kepindahan', formData.jenisPindah, y);

      y += 5; doc.setFont('helvetica', 'bold'); doc.text('DAFTAR KELUARGA YANG IKUT', margin, y); y += 5;
      doc.setFontSize(7);
      doc.rect(margin, y - 4, 170, 5); doc.text('No', margin + 2, y); doc.text('NIK', margin + 15, y); doc.text('Nama Lengkap', margin + 55, y); doc.text('SHDK', margin + 130, y);
      y += 5;
      [{ nik: formData.nik, name: formData.name, shdk: 'Kepala Keluarga' }, ...familyMembers].forEach((m, i) => {
        doc.text(`${i+1}`, margin + 2, y); doc.text(m.nik, margin + 15, y); doc.text(m.name, margin + 55, y); doc.text(m.shdk, margin + 130, y);
        y += 5;
      });
    } 
    else if (formData.type === LetterType.NIKAH) {
      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.text('MODEL N1 - SURAT PENGANTAR NIKAH', 105, y, { align: 'center' }); y += 12;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      y = drawRow('Nama Calon', formData.name, y);
      y = drawRow('NIK', formData.nik, y);
      y = drawRow('Status Perkawinan', formData.brideStatus, y);
      y += 5; doc.setFont('helvetica', 'bold'); doc.text('DATA ORANG TUA (AYAH)', margin, y); doc.setFont('helvetica', 'normal'); y += 8;
      y = drawRow('Nama Ayah', formData.fatherName, y);
      y = drawRow('NIK Ayah', formData.fatherNik, y);
      y += 5; doc.setFont('helvetica', 'bold'); doc.text('DATA ORANG TUA (IBU)', margin, y); doc.setFont('helvetica', 'normal'); y += 8;
      y = drawRow('Nama Ibu', formData.motherName, y);
      y = drawRow('NIK Ibu', formData.motherNik, y);
    }
    else if (formData.type === LetterType.KEMATIAN) {
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('SURAT KETERANGAN KEMATIAN', 105, y, { align: 'center' }); y += 15;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      y = drawRow('Nama Almarhum', formData.name, y);
      y = drawRow('NIK', formData.nik, y);
      y = drawRow('Hari / Pasaran', `${formData.deathDay} ${formData.deathPasaran}`, y);
      y = drawRow('Tanggal Kematian', formData.deathDate, y);
      y = drawRow('Waktu / Jam', `${formData.deathTime} WIB`, y);
      y = drawRow('Tempat Kejadian', formData.deathPlace, y);
      y = drawRow('Tempat Pemakaman', formData.burialPlace, y);
      y = drawRow('Penyebab Kematian', formData.deathCause, y);
    }
    else if (formData.type === LetterType.DOMISILI) {
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('SURAT KETERANGAN DOMISILI', 105, y, { align: 'center' }); y += 15;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      y = drawRow('Nama Lengkap', formData.name, y);
      y = drawRow('Jenis Kelamin', formData.gender, y);
      y = drawRow('NIK', formData.nik, y);
      y = drawRow('Tempat/Tgl Lahir', `${formData.pob}, ${formData.dob}`, y);
      y = drawRow('Agama', formData.religion, y);
      y = drawRow('Pekerjaan', formData.occupation, y);
      y = drawRow('Kewarganegaraan', formData.nationality, y);
      y = drawRow('Alamat Domisili', formData.address, y);
      y = drawRow('Menetap Sejak', formData.durationStay, y);
      y = drawRow('Keperluan', formData.purpose, y);
    }
    else if (formData.type === LetterType.SKTM) {
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('SURAT KETERANGAN TIDAK MAMPU', 105, y, { align: 'center' }); y += 15;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      
      doc.setFont('helvetica', 'bold'); doc.text('DATA ORANG TUA / WALI:', margin, y); doc.setFont('helvetica', 'normal'); y += 8;
      y = drawRow('Nama Orang Tua', formData.parentName, y);
      y = drawRow('NIK Orang Tua', formData.parentNik, y);
      y = drawRow('Tempat/Tgl Lahir', formData.parentPobDob, y);
      y = drawRow('Pekerjaan', formData.parentJob, y);
      y = drawRow('Alamat', formData.parentAddress, y);
      
      y += 5;
      doc.setFont('helvetica', 'bold'); doc.text('DATA SISWA / PEMOHON:', margin, y); doc.setFont('helvetica', 'normal'); y += 8;
      y = drawRow('Nama Pemohon', formData.name, y);
      y = drawRow('NIK Pemohon', formData.nik, y);
      y = drawRow('Tempat/Tgl Lahir', `${formData.pob}, ${formData.dob}`, y);
      y = drawRow('Alamat', formData.address, y);

      y += 8;
      doc.text('Menyatakan bahwa yang bersangkutan benar-benar merupakan keluarga kurang mampu secara ekonomi.', margin, y); y += 8;
      y = drawRow('Keperluan / Tujuan', formData.purpose, y);
    }
    else {
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('SURAT KETERANGAN', 105, y, { align: 'center' }); y += 15;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      doc.text(`Nama : ${formData.name}`, margin, y); y += 8;
      doc.text(`NIK : ${formData.nik}`, margin, y); y += 8;
      doc.text(`Keperluan : ${formData.purpose}`, margin, y);
    }

    y += 20; 
    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text('Tangerang, ' + dateStr, 140, y);
    y += 25; doc.setFont('helvetica', 'bold'); doc.text(`( ${rtConfig.rtName} )`, 140, y);
    doc.save(`Draft_${formData.type.replace(/\s+/g, '_')}_${formData.name}.pdf`);
  };

  const handleFinalSubmit = async () => {
    // Prepare the request data with additional details
    const requestData: ServiceRequest & { 
      statusUpdate?: { status: string; statusDate: string; statusNote: string } 
    } = {
      id: 'REQ-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      nik: formData.nik,
      residentName: formData.name,
      type: formData.type,
      status: RequestStatus.PENDING,
      createdAt: new Date().toLocaleString('id-ID'),
      purpose: formData.purpose,
      address: formData.address || formData.addrAsal
    };

    // Add status update for Surat Pindah
    if (formData.type === LetterType.PINDAH) {
      requestData.statusUpdate = {
        status: 'PINDAH',
        statusDate: new Date().toISOString().split('T')[0],
        statusNote: `Pindah ke: ${formData.addrTujuan}, ${formData.desaTujuan}, ${formData.kecTujuan}, ${formData.kabTujuan}, ${formData.provTujuan}`
      };
      requestData.pindahDetails = {
        noKk: formData.noKk,
        addrAsal: formData.addrAsal,
        rtAsal: formData.rtAsal,
        rwAsal: formData.rwAsal,
        desaAsal: formData.desaAsal,
        kecAsal: formData.kecAsal,
        kabAsal: formData.kabAsal,
        provAsal: formData.provAsal,
        addrTujuan: formData.addrTujuan,
        rtTujuan: formData.rtTujuan,
        rwTujuan: formData.rwTujuan,
        desaTujuan: formData.desaTujuan,
        kecTujuan: formData.kecTujuan,
        kabTujuan: formData.kabTujuan,
        provTujuan: formData.provTujuan,
        alasanPindah: formData.alasanPindah,
        klasifikasiPindah: formData.klasifikasiPindah,
        jenisPindah: formData.jenisPindah,
        familyMembers: familyMembers
      };
    }

    // Add status update for Surat Kematian
    if (formData.type === LetterType.KEMATIAN) {
      requestData.statusUpdate = {
        status: 'MENINGGAL',
        statusDate: formData.deathDate,
        statusNote: `Penyebab: ${formData.deathCause}. Tempat: ${formData.deathPlace}. Pemakaman: ${formData.burialPlace}`
      };
      requestData.deathDetails = {
        date: formData.deathDate,
        dayPasaran: `${formData.deathDay} ${formData.deathPasaran}`,
        time: formData.deathTime,
        place: formData.deathPlace,
        burialPlace: formData.burialPlace
      };
    }

    onSubmit(requestData);
    setStep(4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
               {formData.type === LetterType.PINDAH ? <Navigation size={20} /> : formData.type === LetterType.KEMATIAN ? <Skull size={20} /> : formData.type === LetterType.NIKAH ? <Heart size={20} /> : formData.type === LetterType.SKTM ? <ShieldAlert size={20} /> : <FileText size={20} />}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{formData.type}</h3>
          </div>
          <button onClick={() => { onClose(); setStep(1); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto scrollbar-hide flex-1">
          {step === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(LetterType).map((type) => (
                <button key={type} onClick={() => { setFormData({...formData, type}); setStep(2); }} className={`group flex items-center space-x-3 p-4 border rounded-2xl transition-all text-left hover:border-blue-400 hover:shadow-md ${type === formData.type ? 'bg-blue-50 border-blue-100' : 'border-slate-100'}`}>
                   <div className={`p-3 rounded-xl ${type === LetterType.KEMATIAN ? 'bg-red-50 text-red-600' : type === LetterType.NIKAH ? 'bg-pink-50 text-pink-600' : type === LetterType.PINDAH ? 'bg-blue-50 text-blue-600' : type === LetterType.SKTM ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                    {type === LetterType.PINDAH ? <Navigation size={20} /> : type === LetterType.KEMATIAN ? <Skull size={20} /> : type === LetterType.NIKAH ? <Heart size={20} /> : type === LetterType.SKTM ? <ShieldAlert size={20} /> : <FileText size={20} />}
                   </div>
                   <span className="font-bold text-slate-700 text-xs leading-tight">{type}</span>
                </button>
              ))}
            </div>
          ) : step === 2 ? (
            <form id="service-req-form" onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6">
              
              {/* FORM SURAT PINDAH F-1.03 */}
              {formData.type === LetterType.PINDAH && (
                <div className="space-y-8 animate-in slide-in-from-right">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Fingerprint size={14}/> Identitas Dasar</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input required placeholder="No. Kartu Keluarga" className="md:col-span-2 p-3 bg-slate-50 border rounded-xl text-xs" value={formData.noKk} onChange={e => setFormData({...formData, noKk: e.target.value.replace(/\D/g, '')})} />
                      <div className="relative">
                        <input required placeholder="NIK Pemohon" className="w-full p-3 bg-slate-50 border rounded-xl text-xs pr-10" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})} />
                        {isSearchingNik && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
                        {foundResident && !isSearchingNik && <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
                      </div>
                      <input required placeholder="Nama Lengkap" className={`p-3 bg-slate-50 border rounded-xl text-xs ${foundResident ? 'border-emerald-300 bg-emerald-50/30' : ''}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      {foundResident && (
                        <div className="md:col-span-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                          <CheckCircle size={14} />
                          <span>Data warga ditemukan: <strong>{foundResident.name}</strong> - NIK terverifikasi di database</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-5 bg-blue-50/50 rounded-[24px] border border-blue-100 space-y-4">
                    <p className="text-[10px] font-black text-blue-800 uppercase flex items-center gap-2"><Home size={14}/> Daerah Asal</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Provinsi</label>
                        <select className="w-full p-2.5 bg-white border rounded-lg text-[11px]" value={selAsalProvId} onChange={handleAsalProvChange}>
                          <option value="">Pilih Provinsi</option>
                          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Kota/Kabupaten {loadingLocation === 'asal-reg' && '...'}</label>
                        <select className="w-full p-2.5 bg-white border rounded-lg text-[11px] disabled:opacity-50" disabled={!selAsalProvId} value={selAsalRegId} onChange={handleAsalRegChange}>
                          <option value="">Pilih Kota</option>
                          {asalRegencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Kecamatan {loadingLocation === 'asal-dist' && '...'}</label>
                        <select className="w-full p-2.5 bg-white border rounded-lg text-[11px] disabled:opacity-50" disabled={!selAsalRegId} value={selAsalDistId} onChange={handleAsalDistChange}>
                          <option value="">Pilih Kecamatan</option>
                          {asalDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Kelurahan {loadingLocation === 'asal-vill' && '...'}</label>
                        <select className="w-full p-2.5 bg-white border rounded-lg text-[11px] disabled:opacity-50" disabled={!selAsalDistId} value={selAsalVillId} onChange={handleAsalVillChange}>
                          <option value="">Pilih Kelurahan</option>
                          {asalVillages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Alamat Lengkap (Nama Jalan, No. Rumah)</label>
                        <input placeholder="Contoh: Jl. Merdeka No. 05" className="w-full p-2.5 bg-white border rounded-lg text-[11px]" value={formData.addrAsal} onChange={e => setFormData({...formData, addrAsal: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">RT</label>
                        <input placeholder="003" className="w-full p-2.5 bg-white border rounded-lg text-[11px]" value={formData.rtAsal} onChange={e => setFormData({...formData, rtAsal: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">RW</label>
                        <input placeholder="002" className="w-full p-2.5 bg-white border rounded-lg text-[11px]" value={formData.rwAsal} onChange={e => setFormData({...formData, rwAsal: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-emerald-50/50 rounded-[24px] border border-emerald-100 space-y-4">
                    <p className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-2"><MapPinned size={14}/> Daerah Tujuan</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Provinsi Tujuan</label>
                        <select className="w-full p-2.5 bg-white border rounded-lg text-[11px]" value={selTujuanProvId} onChange={handleTujuanProvChange}>
                          <option value="">Pilih Provinsi</option>
                          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Kota/Kabupaten {loadingLocation === 'tujuan-reg' && '...'}</label>
                        <select className="w-full p-2.5 bg-white border rounded-lg text-[11px] disabled:opacity-50" disabled={!selTujuanProvId} value={selTujuanRegId} onChange={handleTujuanRegChange}>
                          <option value="">Pilih Kota</option>
                          {tujuanRegencies.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Kecamatan {loadingLocation === 'tujuan-dist' && '...'}</label>
                        <select className="w-full p-2.5 bg-white border rounded-lg text-[11px] disabled:opacity-50" disabled={!selTujuanRegId} value={selTujuanDistId} onChange={handleTujuanDistChange}>
                          <option value="">Pilih Kecamatan</option>
                          {tujuanDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Kelurahan {loadingLocation === 'tujuan-vill' && '...'}</label>
                        <select className="w-full p-2.5 bg-white border rounded-lg text-[11px] disabled:opacity-50" disabled={!selTujuanDistId} value={selTujuanVillId} onChange={handleTujuanVillChange}>
                          <option value="">Pilih Kelurahan</option>
                          {tujuanVillages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Alamat Lengkap (Nama Jalan, No. Rumah)</label>
                        <input placeholder="Contoh: Jl. Sudirman No. 10" className="w-full p-2.5 bg-white border rounded-lg text-[11px]" value={formData.addrTujuan} onChange={e => setFormData({...formData, addrTujuan: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">RT</label>
                        <input placeholder="005" className="w-full p-2.5 bg-white border rounded-lg text-[11px]" value={formData.rtTujuan} onChange={e => setFormData({...formData, rtTujuan: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">RW</label>
                        <input placeholder="001" className="w-full p-2.5 bg-white border rounded-lg text-[11px]" value={formData.rwTujuan} onChange={e => setFormData({...formData, rwTujuan: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2"><UsersIcon size={14}/> Keluarga Pengikut</p>
                      <button type="button" onClick={addFamilyMember} className="p-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold"><Plus size={12}/> TAMBAH</button>
                    </div>
                    <div className="space-y-2">
                      {familyMembers.map((member, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input placeholder="Nama" className="flex-[2] p-2.5 border rounded-lg text-[11px]" value={member.name} onChange={e => updateFamilyMember(idx, 'name', e.target.value)} />
                          <input placeholder="NIK" className="flex-[2] p-2.5 border rounded-lg text-[11px]" value={member.nik} onChange={e => updateFamilyMember(idx, 'nik', e.target.value)} />
                          <select className="flex-1 p-2.5 border rounded-lg text-[11px]" value={member.shdk} onChange={e => updateFamilyMember(idx, 'shdk', e.target.value)}>{shdkOptions.map(o => <option key={o}>{o}</option>)}</select>
                          <button type="button" onClick={() => removeFamilyMember(idx)} className="p-2.5 text-red-400"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FORM SURAT DOMISILI */}
              {formData.type === LetterType.DOMISILI && (
                <div className="space-y-6 animate-in slide-in-from-right">
                  <div className="p-5 bg-blue-50/30 rounded-3xl border border-blue-100 space-y-4">
                    <p className="text-[10px] font-black text-blue-800 uppercase flex items-center gap-2"><MapPin size={14} /> Identitas & Alamat Domisili</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label><input required className="w-full p-3 border rounded-xl text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">NIK</label><input required className="w-full p-3 border rounded-xl text-xs" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kelamin</label><select className="w-full p-3 border rounded-xl text-xs" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}><option>Laki-laki</option><option>Perempuan</option></select></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Tempat Lahir</label><input className="w-full p-3 border rounded-xl text-xs" value={formData.pob} onChange={e => setFormData({...formData, pob: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label><input type="date" className="w-full p-3 border rounded-xl text-xs" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Kewarganegaraan</label><input className="w-full p-3 border rounded-xl text-xs" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Menetap Sejak</label><input placeholder="Contoh: Tahun 2020 / Januari 2022" className="w-full p-3 border rounded-xl text-xs" value={formData.durationStay} onChange={e => setFormData({...formData, durationStay: e.target.value})} /></div>
                      <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Domisili Lengkap</label><textarea rows={2} className="w-full p-3 border rounded-xl text-xs" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
                      <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] font-bold text-slate-500 uppercase">Keperluan Surat</label><textarea rows={2} placeholder="Contoh: Melamar Pekerjaan, Persyaratan Bank, dsb." className="w-full p-3 border rounded-xl text-xs" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM SKTM (DETAIL BARU) */}
              {formData.type === LetterType.SKTM && (
                <div className="space-y-6 animate-in slide-in-from-right">
                  <div className="p-5 bg-amber-50/30 rounded-3xl border border-amber-100 space-y-4">
                    <p className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-2"><User size={14} /> Data Orang Tua / Wali</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap Orang Tua</label>
                        <input required className="w-full p-3 border rounded-xl text-xs" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">NIK Orang Tua</label>
                        <input required className="w-full p-3 border rounded-xl text-xs" value={formData.parentNik} onChange={e => setFormData({...formData, parentNik: e.target.value.replace(/\D/g, '')})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tempat/Tgl Lahir Orang Tua</label>
                        <input required className="w-full p-3 border rounded-xl text-xs" placeholder="Tangerang, 12-05-1975" value={formData.parentPobDob} onChange={e => setFormData({...formData, parentPobDob: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Pekerjaan Orang Tua</label>
                        <input required className="w-full p-3 border rounded-xl text-xs" value={formData.parentJob} onChange={e => setFormData({...formData, parentJob: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Orang Tua</label>
                        <textarea required rows={2} className="w-full p-3 border rounded-xl text-xs" value={formData.parentAddress} onChange={e => setFormData({...formData, parentAddress: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-blue-50/30 rounded-3xl border border-blue-100 space-y-4">
                    <p className="text-[10px] font-black text-blue-800 uppercase flex items-center gap-2"><Baby size={14} /> Data Siswa / Pemohon</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Siswa / Anak</label>
                        <input required className="w-full p-3 border rounded-xl text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">NIK Siswa</label>
                        <input required className="w-full p-3 border rounded-xl text-xs" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tempat Lahir</label>
                        <input required className="w-full p-3 border rounded-xl text-xs" value={formData.pob} onChange={e => setFormData({...formData, pob: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Lahir</label>
                        <input required type="date" className="w-full p-3 border rounded-xl text-xs" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Siswa</label>
                        <textarea required rows={2} className="w-full p-3 border rounded-xl text-xs" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tujuan / Fungsi SKTM</label>
                        <textarea required rows={2} placeholder="Contoh: Persyaratan Pengajuan KIP Kuliah" className="w-full p-3 border rounded-xl text-xs" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM KEMATIAN */}
              {formData.type === LetterType.KEMATIAN && (
                <div className="space-y-6 animate-in slide-in-from-right">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Nama Almarhum" className={`md:col-span-2 p-3 border rounded-xl text-xs ${foundResident ? 'border-emerald-300 bg-emerald-50/30' : ''}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <div className="relative">
                      <input required placeholder="NIK Almarhum" className="w-full p-3 border rounded-xl text-xs pr-10" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})} />
                      {isSearchingNik && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
                      {foundResident && !isSearchingNik && <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
                    </div>
                    {foundResident && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                        <CheckCircle size={14} />
                        <span>Data ditemukan</span>
                      </div>
                    )}
                    {/* Tanggal Kematian - diisi pertama */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Calendar size={12} /> Tanggal Kematian
                      </label>
                      <input required type="date" className="w-full p-3 border rounded-xl text-xs bg-slate-50" value={formData.deathDate} onChange={e => handleDeathDateChange(e.target.value)} />
                    </div>
                    <input required type="time" className="p-3 border rounded-xl text-xs bg-slate-50" value={formData.deathTime} onChange={e => setFormData({...formData, deathTime: e.target.value})} />
                    {/* Hari & Pasaran - otomatis terisi */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Clock size={12} /> Hari (Otomatis)
                        </label>
                        <div className={`p-3 border rounded-xl text-xs ${formData.deathDay ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-slate-50 text-slate-400'}`}>
                          {formData.deathDay || 'Pilih tanggal dulu'}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Clock size={12} /> Pasaran (Otomatis)
                        </label>
                        <div className={`p-3 border rounded-xl text-xs ${formData.deathPasaran ? 'bg-amber-50 border-amber-200 text-amber-700 font-medium' : 'bg-slate-50 text-slate-400'}`}>
                          {formData.deathPasaran || 'Pilih tanggal dulu'}
                        </div>
                      </div>
                    </div>
                    <textarea placeholder="Tempat Kejadian" rows={2} className="md:col-span-2 p-3 border rounded-xl text-xs bg-slate-50" value={formData.deathPlace} onChange={e => setFormData({...formData, deathPlace: e.target.value})} />
                    <textarea placeholder="Tempat Pemakaman" rows={2} className="md:col-span-2 p-3 border rounded-xl text-xs bg-slate-50" value={formData.burialPlace} onChange={e => setFormData({...formData, burialPlace: e.target.value})} />
                    <input placeholder="Penyebab Kematian" className="md:col-span-2 p-3 border rounded-xl text-xs bg-slate-50" value={formData.deathCause} onChange={e => setFormData({...formData, deathCause: e.target.value})} />
                  </div>
                </div>
              )}

              {/* FORM NIKAH (MODEL N1) */}
              {formData.type === LetterType.NIKAH && (
                <div className="space-y-6 animate-in slide-in-from-right">
                  <div className="p-5 bg-pink-50/30 rounded-3xl border border-pink-100 space-y-4">
                    <p className="text-[10px] font-black text-pink-800 uppercase flex items-center gap-2"><Heart size={14} /> Data Calon</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <input placeholder="Nama Lengkap" className="md:col-span-2 p-3 bg-white border rounded-xl text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       <input placeholder="NIK" className="p-3 bg-white border rounded-xl text-xs" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})} />
                       <select className="p-3 bg-white border rounded-xl text-xs" value={formData.brideStatus} onChange={e => setFormData({...formData, brideStatus: e.target.value})}><option>Perjaka / Gadis</option><option>Duda / Janda</option></select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Data Ayah</p>
                      <input placeholder="Nama Ayah" className="w-full p-3 border rounded-xl text-xs" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                      <input placeholder="NIK Ayah" className="w-full p-3 border rounded-xl text-xs" value={formData.fatherNik} onChange={e => setFormData({...formData, fatherNik: e.target.value.replace(/\D/g, '')})} />
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Data Ibu</p>
                      <input placeholder="Nama Ibu" className="w-full p-3 border rounded-xl text-xs" value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                      <input placeholder="NIK Ibu" className="w-full p-3 border rounded-xl text-xs" value={formData.motherNik} onChange={e => setFormData({...formData, motherNik: e.target.value.replace(/\D/g, '')})} />
                    </div>
                  </div>
                </div>
              )}

              {/* FORM STANDAR KERAMAIAN */}
              {(formData.type !== LetterType.NIKAH && formData.type !== LetterType.PINDAH && formData.type !== LetterType.KEMATIAN && formData.type !== LetterType.DOMISILI && formData.type !== LetterType.SKTM) && (
                <div className="space-y-6 animate-in slide-in-from-right">
                   <input required placeholder="Nama Lengkap" className="w-full p-3 border rounded-xl text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   <input required placeholder="NIK" className="w-full p-3 border rounded-xl text-xs" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value.replace(/\D/g, '')})} />
                   <textarea placeholder="Alamat Sekarang" rows={2} className="w-full p-3 border rounded-xl text-xs" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                   <textarea placeholder="Keperluan Surat" rows={2} className="w-full p-3 border rounded-xl text-xs" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                </div>
              )}
            </form>
          ) : step === 3 ? (
            <div className="text-center py-12 space-y-6 animate-in zoom-in">
              <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-200"><CheckCircle2 size={48} /></div>
              <div><h4 className="text-2xl font-bold text-slate-800">Pratinjau Selesai</h4><p className="text-slate-500 text-sm mt-2">Draf dokumen {formData.type} siap diunduh dan dikirim.</p></div>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button onClick={generatePDF} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2"><Download size={20} /><span>UNDUH DRAF (PDF)</span></button>
                <button onClick={handleFinalSubmit} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2"><Send size={20} /><span>KIRIM KE PAK RT</span></button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-6 animate-in fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Send size={32} /></div>
              <h4 className="text-2xl font-bold text-slate-800">Berhasil Dikirim!</h4>
              <p className="text-slate-500 text-sm">Pengajuan Anda telah masuk ke antrean. Silakan konfirmasi ke Pak RT {rtConfig.rtName} melalui WhatsApp.</p>
              <button onClick={() => { onClose(); setStep(1); }} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">TUTUP</button>
            </div>
          )}
        </div>

        {step === 2 && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
            <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl text-sm">Kembali</button>
            <button form="service-req-form" type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-95">
               <span>Lanjutkan</span><ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestModal;
// Force recompile - Sun Feb 15 02:09:04 UTC 2026
