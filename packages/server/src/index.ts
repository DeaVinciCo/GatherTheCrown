import express from 'express';
import { Server } from 'colyseus';
import { createServer } from 'http';
import cors from 'cors';
import { LobbyRoom } from './rooms/LobbyRoom';
import { StoryRoom } from './rooms/StoryRoom';
import { BattleRoom } from './rooms/BattleRoom';
import { logger } from './utils/logger';

const port = Number(process.env.PORT) || 2567;

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.get('/health', (_, res) => res.json({ ok: true }));

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
