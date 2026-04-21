import { PrismaClient } from '@prisma/client';
export class HeroStore {
    constructor(prisma = new PrismaClient()) {
        this.prisma = prisma;
    }
    createHero(data) {
        return this.prisma.hero.create({ data });
    }
    getHero(id) {
        return this.prisma.hero.findUnique({ where: { id } });
    }
    updateHero(id, data) {
        return this.prisma.hero.update({ where: { id }, data });
    }
    deleteHero(id) {
        return this.prisma.hero.delete({ where: { id } });
    }
}
