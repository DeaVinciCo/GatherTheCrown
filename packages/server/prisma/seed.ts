import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { username: 'dev' },
    update: {},
    create: {
      username: 'dev',
      password: 'dev_only_change_me'
    }
  });

  const heroes = [
    {
      id: 'hero1',
      name: 'Forge',
      element: 'Fire',
      creat: { id: 'creat1', species: 'Pyrogryph', element: 'Fire', stage: 'hatchling' },
      items: [
        { name: 'Odyssey Sword', type: 'weapon' },
        { name: 'Bow', type: 'tool' }
      ],
      fragments: [{ id: 'frag1', metal: 'Gold', gem: 'Sapphire', shards: 1 }]
    },
    {
      id: 'hero2',
      name: 'Glacia',
      element: 'Frost',
      creat: { id: 'creat2', species: 'Frostling', element: 'Frost', stage: 'hatchling' },
      items: [
        { name: 'Frost Dagger', type: 'weapon' },
        { name: 'Ice Rod', type: 'tool' }
      ],
      fragments: [{ id: 'frag2', metal: 'Silver', gem: 'Quartz', shards: 2 }]
    },
    {
      id: 'hero3',
      name: 'Terra',
      element: 'Earth',
      creat: { id: 'creat3', species: 'Terradrake', element: 'Earth', stage: 'hatchling' },
      items: [
        { name: 'Earth Hammer', type: 'weapon' },
        { name: 'Shovel', type: 'tool' }
      ],
      fragments: [{ id: 'frag3', metal: 'Copper', gem: 'Topaz', shards: 3 }]
    }
  ];

  for (const h of heroes) {
    const hero = await prisma.hero.upsert({
      where: { id: h.id },
      update: {},
      create: {
        id: h.id,
        name: h.name,
        userId: user.id,
        element: h.element
      }
    });

    await prisma.creat.upsert({
      where: { id: h.creat.id },
      update: {},
      create: {
        id: h.creat.id,
        species: h.creat.species,
        element: h.creat.element,
        stage: h.creat.stage,
        heroId: hero.id
      }
    });

    await prisma.inventoryItem.createMany({
      data: h.items.map((i) => ({ ...i, heroId: hero.id })),
      skipDuplicates: true
    });

    for (const frag of h.fragments) {
      await prisma.crownFragment.upsert({
        where: { id: frag.id },
        update: {},
        create: { ...frag, heroId: hero.id }
      });
    }
  }

  await prisma.kingdom.createMany({
    data: [
      {
        id: 'sylvara',
        name: 'Sylvara',
        element: 'Nature',
        lore: 'Woodland empire of druids and living root citadels.',
        vaultLocation: 'Beneath the Rootspire'
      },
      {
        id: 'pyrrathia',
        name: 'Pyrrathia',
        element: 'Fire',
        lore: 'Volcanic kingdom of ember smiths and forge rites.',
        vaultLocation: 'Magma chamber vault'
      },
      {
        id: 'frostvale',
        name: 'Frostvale',
        element: 'Ice',
        lore: 'Crystalline realm frozen by an ancient winter curse.',
        vaultLocation: 'Frozen palace throne vault'
      },
      {
        id: 'zerath_dunes',
        name: 'Zerath Dunes',
        element: 'Desert',
        lore: 'Sunbound kingdom buried under shifting dunes.',
        vaultLocation: 'Pyramid of the Sun King'
      },
      {
        id: 'morgahl_fen',
        name: "Mor'gahl Fen",
        element: 'Poison',
        lore: 'Alchemy swamplands twisted by toxic rites.',
        vaultLocation: 'Sunken palace vault'
      },
      {
        id: 'luminaris',
        name: 'Luminaris',
        element: 'Light',
        lore: 'Shattered crystal city powered by light prisms.',
        vaultLocation: 'Highest Shardspire fragment'
      },
      {
        id: 'umbral_reach',
        name: 'Umbral Reach',
        element: 'Shadow',
        lore: 'Twilight kingdom phasing near the void.',
        vaultLocation: 'Abyss gate vault'
      },
      {
        id: 'crown_convergence',
        name: 'Crown Convergence',
        element: 'Unified',
        lore: 'Origin kingdom where the first crown was forged.',
        vaultLocation: 'Sky island reliquaries'
      }
    ],
    skipDuplicates: true
  });

  await prisma.crownRecipe.createMany({
    data: [
      { id: 'story_gold_sapphire', mode: 'story', metal: 'Gold', gem: 'Sapphire', requiredShards: 3 },
      { id: 'racing_aethersteel_quartz', mode: 'racing', metal: 'Aethersteel', gem: 'Quartz', requiredShards: 2 },
      { id: 'melee_gold_topaz', mode: 'melee', metal: 'Gold', gem: 'Topaz', requiredShards: 2 }
    ],
    skipDuplicates: true
  });

  await prisma.questDefinition.createMany({
    data: [
      {
        id: 'main_001',
        name: 'The Egg',
        description: 'Find the mysterious egg and return to Elder Miriam.',
        type: 'main',
        levelRequired: 1,
        giver: 'Elder Miriam',
        location: 'Home Village',
        rewardsJson: '{"xp":100,"gold":50}'
      },
      {
        id: 'sylvara_001',
        name: 'Forest Awakening',
        description: 'Cleanse corruption in the Sylvara outskirts.',
        type: 'kingdom_restoration',
        levelRequired: 2,
        giver: 'Warden Elowen',
        location: 'Sylvara',
        rewardsJson: '{"xp":150,"gold":80,"crownShards":1}'
      }
    ],
    skipDuplicates: true
  });

  await prisma.achievementDefinition.createMany({
    data: [
      {
        id: 'first_bond',
        title: 'First Bond',
        description: 'Hatch your first creat companion.',
        category: 'bond',
        targetValue: 1,
        rewardJson: '{"gold":100}'
      },
      {
        id: 'boss_hunter',
        title: 'Boss Hunter',
        description: 'Defeat any boss 10 times.',
        category: 'combat',
        targetValue: 10,
        rewardJson: '{"crownShards":2}'
      }
    ],
    skipDuplicates: true
  });

  await prisma.boss.createMany({
    data: [
      {
        id: 'ember-reignlord',
        name: 'Ember Reignlord',
        element: 'Fire',
        hp: 500,
        stamina: 100,
        mana: 200,
        phases: 2,
        rageThreshold: 0.25,
        tier: 2,
        accessType: 'door',
        bossType: 'structure_guardian',
        sizeClass: 'medium',
        strengthClass: 'elite',
        battleStyle: 'elite_duel'
      },
      {
        id: 'frost-seraph',
        name: 'Frost Seraph',
        element: 'Frost',
        hp: 450,
        stamina: 120,
        mana: 250,
        phases: 3,
        rageThreshold: 0.3,
        tier: 3,
        accessType: 'portal',
        bossType: 'castle_lord',
        sizeClass: 'large',
        strengthClass: 'champion',
        battleStyle: 'multi_phase_arena'
      },
      {
        id: 'terra-titan',
        name: 'Terra Titan',
        element: 'Earth',
        hp: 600,
        stamina: 150,
        mana: 100,
        phases: 1,
        rageThreshold: 0.2,
        tier: 2,
        accessType: 'door',
        bossType: 'structure_guardian',
        sizeClass: 'medium',
        strengthClass: 'champion',
        battleStyle: 'elite_duel'
      }
    ],
    skipDuplicates: true
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
