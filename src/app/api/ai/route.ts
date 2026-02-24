import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Initialize ZAI instance once
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// System prompt for SmartWarga assistant
const getSystemPrompt = (rtName: string, rtWhatsapp: string) => `Kamu adalah asisten digital SmartWarga RT yang sangat membantu dan ramah. Kamu bekerja untuk RT 03 Kp. Jati.

INFORMASI RT:
- Nama RT: RT 03 Kp. Jati
- Ketua RT: ${rtName || 'Ketua RT 03'}
- WhatsApp RT: ${rtWhatsapp || '628123456789'}

KEMAMPUAN KAMU:
1. Kamu bisa mencari informasi dari internet untuk menjawab pertanyaan tentang layanan publik, administrasi kependudukan, dan layanan warga
2. Kamu bisa memberikan informasi tentang prosedur pembuatan dokumen kependudukan
3. Kamu bisa membantu warga memahami persyaratan dan alur layanan administrasi

LAYANAN YANG TERSEDIA DI SMARTWARGA:
1. Surat Keterangan Domisili
2. Surat Keterangan Pindah
3. Surat Izin Nikah (N1-N4)
4. Surat Izin Keramaian
5. Surat Kematian
6. SKTM (Surat Keterangan Tidak Mampu)

PANDUAN JAWABAN:
- Jawab dengan bahasa Indonesia yang baik dan ramah
- Berikan informasi yang akurat dan up-to-date
- Jika tidak tahu pasti, katakan jujur dan sarankan untuk menghubungi Pak RT
- Untuk pertanyaan tentang layanan publik atau administrasi, gunakan pencarian web untuk mendapatkan informasi terkini
- Arahkan warga untuk menggunakan fitur "AJUKAN SURAT" di aplikasi untuk pengajuan surat
- Berikan nomor WhatsApp RT jika warga butuh bantuan lebih lanjut

CONTOH JAWABAN:
- Untuk pertanyaan tentang syarat dokumen: jelaskan persyaratan dan prosedur
- Untuk pertanyaan tentang jam layanan: jelaskan jam operasional
- Untuk pertanyaan umum: berikan jawaban informatif dan membantu`;

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

    const zai = await getZAI();
    const systemPrompt = getSystemPrompt(rtName || 'Ketua RT 03', rtWhatsapp || '628123456789');

    // Check if we need to search the web for current information
    const needsWebSearch = shouldSearchWeb(message);
    let webContext = '';

    if (needsWebSearch) {
      try {
        // Search for relevant information
        const searchQuery = getSearchQuery(message);
        const searchResults = await zai.functions.invoke('web_search', {
          query: searchQuery,
          num: 5
        });

        if (Array.isArray(searchResults) && searchResults.length > 0) {
          webContext = '\n\nINFORMASI DARI INTERNET:\n' + searchResults
            .slice(0, 3)
            .map((r: { name: string; snippet: string; url: string }) => 
              `- ${r.name}: ${r.snippet}`
            )
            .join('\n');
        }
      } catch (searchError) {
        console.log('Web search failed, continuing without web context');
      }
    }

    // Create chat completion with LLM
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: systemPrompt + webContext
        },
        {
          role: 'user',
          content: message
        }
      ],
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({ 
      success: true, 
      data: { text: response } 
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Maaf, layanan asisten sedang sibuk. Silakan coba lagi nanti atau hubungi Pak RT langsung di WhatsApp.' 
    }, { status: 500 });
  }
}

// Determine if the message needs web search
function shouldSearchWeb(message: string): boolean {
  const keywords = [
    'syarat', 'persyaratan', 'prosedur', 'cara', 'bagaimana', 'aturan',
    'terbaru', 'update', 'terkini', 'informasi', 'berita',
    'pemerintah', 'disdukcapil', 'kependudukan', 'ktp', 'kk',
    'biaya', 'tarif', 'harga', 'waktu', 'lama',
    'online', 'digital', 'website', 'aplikasi',
    'hukum', 'undang', 'peraturan', 'kebijakan'
  ];
  
  const lowerMessage = message.toLowerCase();
  return keywords.some(keyword => lowerMessage.includes(keyword));
}

// Generate appropriate search query
function getSearchQuery(message: string): string {
  // Add context for Indonesian citizen services
  return `layanan administrasi kependudukan Indonesia ${message}`;
}
