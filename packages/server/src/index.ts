import express from 'express';
import { Server } from 'colyseus';
import { createServer } from 'http';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { LobbyRoom } from './rooms/LobbyRoom';
import { StoryRoom } from './rooms/StoryRoom';
import { BattleRoom } from './rooms/BattleRoom';
import { logger } from './utils/logger';
import { HeroStore } from './persistence/HeroStore';

const port = Number(process.env.PORT) || 2567;

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const prisma = new PrismaClient();
  const heroStore = new HeroStore(prisma);

  app.get('/health', (_, res) => {
    res.json({ ok: true });
  });

  app.get('/heroes', async (_, res) => {
    const heroes = await heroStore.listHeroes();
    res.json(heroes);
  });

  app.get('/heroes/:id', async (req, res) => {
    const hero = await heroStore.getHero(req.params.id);
    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    return res.json(hero);
  });

  app.post('/heroes', async (req, res) => {
    try {
      const hero = await heroStore.createHero(req.body);
      return res.status(201).json(hero);
    } catch (error) {
      logger.error(`Could not save hero: ${error}`);
      return res.status(400).json({ error: 'Could not save hero' });
    }
  });

  app.put('/heroes/:id', async (req, res) => {
    try {
      const hero = await heroStore.updateHero(req.params.id, req.body);
      return res.json(hero);
    } catch (error) {
      logger.error(`Could not update hero ${req.params.id}: ${error}`);
      return res.status(400).json({ error: 'Could not update hero' });
    }
  });

  app.delete('/heroes/:id', async (req, res) => {
    try {
      const hero = await heroStore.deleteHero(req.params.id);
      return res.json(hero);
    } catch (error) {
      logger.error(`Could not delete hero ${req.params.id}: ${error}`);
      return res.status(400).json({ error: 'Could not delete hero' });
    }
  });

  const httpServer = createServer(app);
  const gameServer = new Server();
  gameServer.attach({ server: httpServer });

  gameServer.define('lobby', LobbyRoom);
  gameServer.define('story', StoryRoom);
  gameServer.define('battle', BattleRoom);

  await new Promise<void>((resolve) => {
    httpServer.listen(port, () => resolve());
  });

  logger.info(`Server listening on ws://localhost:${port}`);

  const shutdown = async () => {
    logger.info('Shutting down server...');
    await prisma.$disconnect();
    httpServer.close();
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  logger.error(`Failed to bootstrap server: ${error}`);
  process.exit(1);
});
