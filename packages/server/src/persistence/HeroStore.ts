import { Hero, Prisma, PrismaClient } from '@prisma/client';

export class HeroStore {
  constructor(private readonly prisma: PrismaClient) {}

  async createHero(data: Prisma.HeroUncheckedCreateInput): Promise<Hero> {
    return this.prisma.hero.create({ data });
  }

  async getHero(id: string): Promise<Hero | null> {
    return this.prisma.hero.findUnique({ where: { id } });
  }

  async listHeroes(): Promise<Hero[]> {
    return this.prisma.hero.findMany({ orderBy: { name: 'asc' } });
  }

  async updateHero(id: string, data: Prisma.HeroUncheckedUpdateInput): Promise<Hero> {
    return this.prisma.hero.update({ where: { id }, data });
  }

  async deleteHero(id: string): Promise<Hero> {
    return this.prisma.hero.delete({ where: { id } });
  }
}

