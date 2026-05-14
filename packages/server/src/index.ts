import express, { Request, Response, NextFunction } from 'express';
import { Server } from 'colyseus';
import { createServer } from 'http';
import cors from 'cors';
import { LobbyRoom } from './rooms/LobbyRoom';
import { StoryRoom } from './rooms/StoryRoom';
import { BattleRoom } from './rooms/BattleRoom';
import { logger } from './utils/logger';
import { HeroStore } from './persistence/HeroStore';
import {
  signupUser, verifyToken, getUserWithHeroes,
  createHeroForUser, updateHeroScene, getHeroById, saveHeroState
} from './utils/auth';

const port = Number(process.env.PORT) || 2567;

// ── JWT middleware ────────────────────────────────────────────────────────────
// Attaches req.userId when a valid Supabase Bearer token is present.
// Routes call requireAuth() to enforce authentication.
declare global {
  namespace Express {
    interface Request { userId?: string; }
  }
}

async function jwtMiddleware(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      const user = await verifyToken(auth.slice(7));
      req.userId = user.id;
    } catch {
      // token invalid — userId stays undefined; protected routes will reject below
    }
  }
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) return res.status(401).json({ error: 'Authentication required' });
  next();
}

async function bootstrap() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(jwtMiddleware);

  const heroStore = new HeroStore();

  app.get('/health', (_, res) => res.json({ ok: true }));

  // ── AUTH ENDPOINTS ────────────────────────────────────────────────
  // Signup: server creates the Supabase Auth user + User record.
  // The client then calls Supabase signInWithPassword directly to get a session.
  app.post('/auth/signup', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      const user = await signupUser(username, password);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // /auth/me: returns current user + heroes for an authenticated session.
  // Called by client after sign-in to hydrate the game registry.
  app.get('/auth/me', requireAuth, async (req, res) => {
    try {
      const result = await getUserWithHeroes(req.userId!);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Legacy login endpoint — kept for backward compat but no longer needed.
  // Client should sign in via Supabase directly, then call /auth/me.
  app.post('/auth/login', async (req, res) => {
    res.status(410).json({
      error: 'This endpoint is deprecated. Sign in via Supabase Auth and call GET /auth/me.'
    });
  });

  // ── HERO ENDPOINTS ────────────────────────────────────────────────
  app.post('/heroes/create', requireAuth, async (req, res) => {
    try {
      const { heroData } = req.body;
      if (!heroData) {
        return res.status(400).json({ error: 'heroData required' });
      }
      const hero = await createHeroForUser(req.userId!, heroData);
      res.json({ success: true, hero });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/heroes/:id', requireAuth, async (req, res) => {
    const heroId = String(req.params.id);
    const hero = await getHeroById(heroId);
    if (!hero || hero.userId !== req.userId) {
      return res.status(404).json({ error: 'Hero not found' });
    }
    res.json(hero);
  });

  app.put('/heroes/:id/scene', requireAuth, async (req, res) => {
    try {
      const heroId = String(req.params.id);
      const { sceneName } = req.body;
      if (!sceneName) {
        return res.status(400).json({ error: 'sceneName required' });
      }
      const hero = await getHeroById(heroId);
      if (!hero || hero.userId !== req.userId) {
        return res.status(404).json({ error: 'Hero not found' });
      }
      const updated = await updateHeroScene(heroId, sceneName);
      res.json({ success: true, hero: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Persist full runtime state (creat, gold, level, scene, skills, etc.)
  app.put('/heroes/:id/state', requireAuth, async (req, res) => {
    try {
      const heroId = String(req.params.id);
      const hero = await getHeroById(heroId);
      if (!hero || hero.userId !== req.userId) {
        return res.status(404).json({ error: 'Hero not found' });
      }
      const updated = await saveHeroState(heroId, req.body);
      res.json({ success: true, hero: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Hero count for the authenticated user
  app.get('/users/me/hero-count', requireAuth, async (req, res) => {
    try {
      const { PrismaClient: PC } = await import('@prisma/client');
      const p = new PC();
      const count = await p.hero.count({ where: { userId: req.userId } });
      res.json({ count });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Legacy route kept for backward compat
  app.get('/users/:userId/hero-count', requireAuth, async (req, res) => {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const { PrismaClient: PC } = await import('@prisma/client');
      const p = new PC();
      const count = await p.hero.count({ where: { userId: req.userId } });
      res.json({ count });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/heroes', requireAuth, async (req, res) => {
    try {
      const hero = await heroStore.createHero({ ...req.body, userId: req.userId });
      res.json(hero);
    } catch (err) {
      res.status(400).json({ error: 'Could not create hero' });
    }
  });

  app.put('/heroes/:id', requireAuth, async (req, res) => {
    try {
      const heroId = String(req.params.id);
      const owned = await getHeroById(heroId);
      if (!owned || owned.userId !== req.userId) {
        return res.status(404).json({ error: 'Hero not found' });
      }
      const hero = await heroStore.updateHero(heroId, req.body);
      res.json(hero);
    } catch (err) {
      res.status(400).json({ error: 'Could not update hero' });
    }
  });

  app.delete('/heroes/:id', requireAuth, async (req, res) => {
    try {
      const heroId = String(req.params.id);
      const owned = await getHeroById(heroId);
      if (!owned || owned.userId !== req.userId) {
        return res.status(404).json({ error: 'Hero not found' });
      }
      const hero = await heroStore.deleteHero(heroId);
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
