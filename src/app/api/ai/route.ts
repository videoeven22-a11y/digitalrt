import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, rtName, rtWhatsapp } = body;
    
    if (!message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message is required' 
      }, { status: 400 });
    }

    // Simple AI response logic for SmartWarga
    const lowerMessage = message.toLowerCase();
    let response = '';

    // Letter types
    const letterTypes = [
      'Surat Keterangan Pindah',
      'Surat Izin Nikah (N1-N4)',
      'Surat Izin Keramaian',
      'Surat Kematian',
      'SKTM (Surat Keterangan Tidak Mampu)',
      'Surat Keterangan Domisili'
    ];

    if (lowerMessage.includes('surat') || lowerMessage.includes('dokumen') || lowerMessage.includes('layanan')) {
      response = `📄 *Layanan Surat yang Tersedia:*\n\n${letterTypes.map((type, i) => `${i + 1}. ${type}`).join('\n')}\n\nUntuk mengajukan surat, klik tombol "AJUKAN SURAT" di sidebar atau menu utama. Prosesnya cepat dan mudah!`;
    } 
    else if (lowerMessage.includes('daftar') || lowerMessage.includes('pendaftaran') || lowerMessage.includes('warga baru')) {
      response = `📝 *Pendaftaran Warga Baru*\n\nUntuk mendaftar sebagai warga RT 03 Kp. Jati, Anda perlu menyiapkan:\n• NIK (16 digit)\n• Nomor Kartu Keluarga (KK)\n• Nama Lengkap\n• Tempat & Tanggal Lahir\n• Alamat Lengkap\n\nKlik tombol "DAFTAR WARGA" di sidebar untuk memulai pendaftaran.`;
    }
    else if (lowerMessage.includes('kontak') || lowerMessage.includes('rt') || lowerMessage.includes('hubungi') || lowerMessage.includes('whatsapp') || lowerMessage.includes('wa')) {
      response = `📞 *Kontak RT 03 Kp. Jati:*\n\n👨‍💼 Ketua RT: ${rtName || 'Ketua RT 03'}\n📱 WhatsApp: ${rtWhatsapp || '628123456789'}\n\nJangan ragu untuk menghubungi Ketua RT untuk keperluan mendesak atau konsultasi.`;
    }
    else if (lowerMessage.includes('jam') || lowerMessage.includes('buka') || lowerMessage.includes('operasional')) {
      response = `🕐 *Jam Operasional:*\n\nSistem SmartWarga dapat diakses 24 jam untuk:\n• Pendaftaran warga baru\n• Pengajuan surat online\n• Cek status pengajuan\n\nUntuk verifikasi dan pengambilan dokumen, silakan datang pada jam kerja atau hubungi Pak RT terlebih dahulu.`;
    }
    else if (lowerMessage.includes('persyaratan') || lowerMessage.includes('syarat')) {
      response = `📋 *Persyaratan Umum Pengajuan Surat:*\n\n1. NIK aktif dan terdaftar\n2. Kartu Keluarga (KK)\n3. KTP Elektronik\n4. Surat pengantar dari RT/RW (jika diperlukan)\n\nSetiap jenis surat mungkin memiliki persyaratan tambahan. Sistem akan memandu Anda mengisi data yang diperlukan.`;
    }
    else if (lowerMessage.includes('sksm') || lowerMessage.includes('tidak mampu')) {
      response = `📋 *SKTM (Surat Keterangan Tidak Mampu)*\n\nSKTM digunakan untuk:\n• Pengajuan beasiswa\n• Bantuan sosial\n• KIP Kuliah\n• Subsidi pemerintah\n\nDiperlukan data:\n• NIK dan KK orang tua/wali\n• Data siswa/anak\n• Alamat lengkap`;
    }
    else if (lowerMessage.includes('pindah') || lowerMessage.includes('mutasi')) {
      response = `🏠 *Surat Keterangan Pindah*\n\nUntuk pindah alamat, diperlukan:\n• Data alamat asal lengkap\n• Data alamat tujuan\n• Daftar keluarga yang ikut pindah\n• Alasan perpindahan\n\nSistem akan generate formulir F-1.03 sesuai PERMENDAGRI.`;
    }
    else if (lowerMessage.includes('help') || lowerMessage.includes('bantu') || lowerMessage.includes('cara')) {
      response = `🤖 *Bantuan SmartWarga AI*\n\nSaya bisa membantu Anda dengan:\n• ℹ️ Informasi layanan surat\n• 📝 Cara pendaftaran warga\n• 📞 Kontak RT\n• 📋 Persyaratan dokumen\n\nKetik pertanyaan Anda, atau gunakan kata kunci seperti: "surat", "daftar", "kontak RT", "persyaratan".`;
    }
    else if (lowerMessage.includes('halo') || lowerMessage.includes('hi') || lowerMessage.includes('hai')) {
      response = `Halo! 👋\n\nSelamat datang di SmartWarga RT 03 Kp. Jati.\n\nSaya siap membantu Anda dengan informasi layanan RT 03 Kp. Jati. Silakan tanyakan apa yang Anda butuhkan!`;
    }
    else {
      response = `Terima kasih atas pertanyaannya! 🙏\n\nSaya bisa membantu Anda dengan:\n• ℹ️ Jenis surat dan layanan\n• 📝 Cara pendaftaran warga\n• 📞 Kontak Pak RT\n• 📋 Persyaratan dokumen\n\nSilakan ketik pertanyaan lebih spesifik atau gunakan kata kunci seperti "surat", "daftar", atau "kontak".`;
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { text: response } 
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Maaf, layanan asisten sedang sibuk. Silakan coba lagi nanti.' 
    }, { status: 500 });
  }
}
