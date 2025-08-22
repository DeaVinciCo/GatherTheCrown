import express from 'express';
import { Server } from 'colyseus';
import { createServer } from 'http';
import cors from 'cors';
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

  const heroStore = new HeroStore();

  app.get('/health', (_, res) => res.json({ ok: true }));

  app.get('/heroes/:id', async (req, res) => {
    const hero = await heroStore.getHero(req.params.id);
    if (!hero) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    res.json(hero);
  });

  app.post('/heroes', async (req, res) => {
    try {
      const hero = await heroStore.createHero(req.body);
      res.json(hero);
    } catch (err) {
      res.status(400).json({ error: 'Could not create hero' });
    }
  });

  app.put('/heroes/:id', async (req, res) => {
    try {
      const hero = await heroStore.updateHero(req.params.id, req.body);
      res.json(hero);
    } catch (err) {
      res.status(400).json({ error: 'Could not update hero' });
    }
  });

  app.delete('/heroes/:id', async (req, res) => {
    try {
      const hero = await heroStore.deleteHero(req.params.id);
      res.json(hero);
    } catch (err) {
      res.status(400).json({ error: 'Could not delete hero' });
    }
  });

  const gameServer = new Server({
    server: createServer(app)
  });

  gameServer.define('lobby', LobbyRoom);
  gameServer.define('story', StoryRoom);
  gameServer.define('battle', BattleRoom);

  gameServer.listen(port);
  logger.info(`Server listening on ws://localhost:${port}`);
}

bootstrap();
