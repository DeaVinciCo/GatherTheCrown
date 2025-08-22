import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const account = await prisma.account.upsert({
    where: { email: 'dev@example.com' },
    update: {},
    create: { email: 'dev@example.com' }
  });

  const hero = await prisma.hero.upsert({
    where: { id: 'hero1' },
    update: {},
    create: {
      id: 'hero1',
      name: 'Forge',
      accountId: account.id,
      element: 'Fire'
    }
  });

  await prisma.creat.upsert({
    where: { id: 'creat1' },
    update: {},
    create: {
      id: 'creat1',
      species: 'Pyrogryph',
      element: 'Fire',
      stage: 'hatchling',
      heroId: hero.id
    }
  });

  await prisma.inventoryItem.createMany({
    data: [
      { name: 'Odyssey Sword', type: 'weapon', heroId: hero.id },
      { name: 'Bow', type: 'tool', heroId: hero.id }
    ],
    skipDuplicates: true
  });

  await prisma.crownFragment.upsert({
    where: { id: 'frag1' },
    update: {},
    create: {
      id: 'frag1',
      metal: 'Gold',
      gem: 'Sapphire',
      shards: 1,
      heroId: hero.id
    }
  });

  console.log('Seed data inserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
