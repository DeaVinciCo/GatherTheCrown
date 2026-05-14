import { PrismaClient, Hero } from '@prisma/client';

export class HeroStore {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient = new PrismaClient()) {
    this.prisma = prisma;
  }

  createHero(data: Omit<Hero, 'id'> & { id?: string }): Promise<Hero> {
    return this.prisma.hero.create({ data });
  }

  getHero(id: string): Promise<Hero | null> {
    return this.prisma.hero.findUnique({ where: { id } });
  }

  updateHero(id: string, data: Partial<Hero>): Promise<Hero> {
    return this.prisma.hero.update({ where: { id }, data });
  }

  deleteHero(id: string): Promise<Hero> {
    return this.prisma.hero.delete({ where: { id } });
  }
}
