import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const account = await prisma.account.upsert({
        where: { email: 'dev@example.com' },
        update: {},
        create: { email: 'dev@example.com' }
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
            fragments: [
                { id: 'frag1', metal: 'Gold', gem: 'Sapphire', shards: 1 }
            ]
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
            fragments: [
                { id: 'frag2', metal: 'Silver', gem: 'Quartz', shards: 2 }
            ]
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
            fragments: [
                { id: 'frag3', metal: 'Copper', gem: 'Topaz', shards: 3 }
            ]
        }
    ];
    for (const h of heroes) {
        const hero = await prisma.hero.upsert({
            where: { id: h.id },
            update: {},
            create: {
                id: h.id,
                name: h.name,
                accountId: account.id,
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
                rageThreshold: 0.25
            },
            {
                id: 'frost-seraph',
                name: 'Frost Seraph',
                element: 'Frost',
                hp: 450,
                stamina: 120,
                mana: 250,
                phases: 3,
                rageThreshold: 0.3
            },
            {
                id: 'terra-titan',
                name: 'Terra Titan',
                element: 'Earth',
                hp: 600,
                stamina: 150,
                mana: 100,
                phases: 1,
                rageThreshold: 0.2
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
