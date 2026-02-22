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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
