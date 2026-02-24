interface WAMessageParams {
  name: string;
  nik: string;
  pobDob?: string;
  address: string;
  type: string;
  purpose?: string;
  rtPhone: string;
  rtEmail: string;
  deathDetails?: {
    date: string;
    dayPasaran: string;
    time: string;
    place: string;
    burialPlace?: string;
  };
  nikahDetails?: {
    brideStatus: string;
    fatherName: string;
    fatherNik: string;
    motherName: string;
    motherNik: string;
  };
  pindahDetails?: {
    destAddress: string;
    destProv: string;
    destReg: string;
    destDist: string;
    destVill: string;
  };
  pdfLink: string;
}

export const generateWAUrl = ({ 
  name, 
  nik, 
  pobDob, 
  address, 
  type, 
  purpose, 
  rtPhone, 
  rtEmail,
  deathDetails, 
  nikahDetails,
  pindahDetails,
  pdfLink 
}: WAMessageParams): string => {
  const cleanPhone = rtPhone.replace(/\D/g, '');
  
  let extraSection = '';
  
  if (deathDetails) {
    extraSection = `
*DETAIL KEJADIAN (KEMATIAN):*
Tanggal: ${deathDetails.date}
Waktu: ${deathDetails.time} WIB
Tempat: ${deathDetails.place}
Lokasi Makam: ${deathDetails.burialPlace || '-'}
`;
  }

  if (nikahDetails) {
    extraSection = `
*DETAIL NIKAH (MODEL N1):*
Status: ${nikahDetails.brideStatus}
Ayah: ${nikahDetails.fatherName}
Ibu: ${nikahDetails.motherName}
`;
  }

  if (pindahDetails) {
    extraSection = `
*DETAIL TUJUAN PINDAH:*
Alamat: ${pindahDetails.destAddress}
Wilayah: ${pindahDetails.destVill}, ${pindahDetails.destDist}, ${pindahDetails.destReg}, ${pindahDetails.destProv}
`;
  }

  const message = `🔔 *PENGAJUAN SURAT DIGITAL*

Halo Pak RT, saya warga ingin mengajukan surat melalui sistem *SmartWarga*.

*Identitas:*
Nama: ${name}
NIK: ${nik}
TTL: ${pobDob || '-'}
Alamat Asal: ${address}

*Dokumen:*
📄 ${type}
${extraSection}
*Keperluan:*
${purpose || '-'}

__________________________

*Link Draft Dokumen (PDF):*
${pdfLink}

*Kontak RT:*
Email: ${rtEmail}
WA: ${rtPhone}

_Mohon bantuannya untuk diproses, terima kasih._`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
