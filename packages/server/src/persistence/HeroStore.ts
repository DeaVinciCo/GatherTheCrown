import { Hero, Prisma, PrismaClient } from '@prisma/client';

export class HeroStore {
  constructor(private readonly prisma: PrismaClient) {}

  async createHero(data: Prisma.HeroUncheckedCreateInput): Promise<Hero> {
    const payload: Prisma.HeroUncheckedCreateInput = { ...data };

    // Keep create endpoint usable even if client payload does not include an account.
    if (!payload.accountId) {
      const account = await this.prisma.account.upsert({
        where: { email: 'player@local.game' },
        update: {},
        create: { email: 'player@local.game' }
      });
      payload.accountId = account.id;
    }

    return this.prisma.hero.create({ data: payload });
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

