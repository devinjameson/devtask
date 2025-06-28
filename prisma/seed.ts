import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      profiles: {
        create: {
          name: 'Home',
        },
      },
    },
  });

  await prisma.status.createMany({
    data: [{ name: 'Backlog' }, { name: 'In Progress' }, { name: 'Done' }],
    skipDuplicates: true,
  });

  console.log('🌱 Seed complete:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
