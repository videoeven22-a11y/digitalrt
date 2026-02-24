import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123',
      name: 'Pak RT Budiman',
      role: 'Super Admin'
    }
  });

  console.log('Created admin user:', admin);

  // Create default RT config
  const config = await prisma.rTConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      rtName: 'Pak RT Budiman',
      rtWhatsapp: '628123456789',
      rtEmail: 'rt03.kpjati@smartwarga.id',
      appName: 'SmartWarga RT 03 Kp. Jati',
      appLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Logo_RT_RW.png'
    }
  });

  console.log('Created RT config:', config);

  // Create sample information
  const informationData = [
    {
      category: 'jadwal',
      title: 'Jadwal Ronda Minggu Ini',
      content: 'Senin: Pak Budi, Rabu: Pak Ahmad, Jumat: Pak Dedi, Minggu: Pak Eko',
      color: 'violet',
      order: 1,
      isActive: true
    },
    {
      category: 'jadwal',
      title: 'Jadwal Ronda Minggu Depan',
      content: 'Senin: Pak Sugi, Rabu: Pak Tono, Jumat: Pak Wawan, Minggu: Pak Agus',
      color: 'violet',
      order: 2,
      isActive: true
    },
    {
      category: 'pengumuman',
      title: 'Kerja Bakti Sabtu Pagi',
      content: 'Diharapkan seluruh warga bergabung untuk kerja bakti membersihkan lingkungan RT.',
      color: 'amber',
      order: 1,
      isActive: true
    },
    {
      category: 'pemerintah',
      title: 'Program BLT Dana Desa',
      content: 'Pendaftaran BLT Dana Desa tahun 2025 dibuka hingga akhir bulan ini.',
      color: 'emerald',
      order: 1,
      isActive: true
    },
    {
      category: 'link',
      title: 'Website Desa Jati',
      content: 'Kunjungi website resmi desa untuk informasi lebih lanjut',
      link: 'https://desa-jati.example.com',
      color: 'blue',
      order: 1,
      isActive: true
    }
  ];

  for (const info of informationData) {
    const existing = await prisma.information.findFirst({
      where: { title: info.title }
    });
    
    if (!existing) {
      const created = await prisma.information.create({ data: info });
      console.log('Created information:', created.title);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
