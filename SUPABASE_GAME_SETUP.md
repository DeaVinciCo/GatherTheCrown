# Supabase Setup for Gather The Crown: Creats & Foes

This is the fastest setup path (chosen for you):
- Use the SQL file to create the full database structure in Supabase.
- Point Prisma at that Supabase Postgres database.
- Seed starter game data.

## 1) Create a Supabase project
1. Go to https://supabase.com and create a new project.
2. Wait for database provisioning to finish.

## 2) Import the game schema (one paste)
1. Open Supabase Dashboard -> SQL Editor.
2. Open and copy all contents of:
   - supabase/migrations/001_gtc_core.sql
3. Paste and run it in SQL Editor.
4. Then run:
   - supabase/migrations/002_hero_full_fields.sql

This creates tables and updates for:
- Users, Heroes, Creats, Inventory, Crown Fragments
- Bosses, Quests, Kingdoms, Crowns, Achievements
- Story choices, boss progress, match history
- RLS starter policies (including User self-access)
- Full Hero persistence fields (all major local registry state)

## 3) Configure server environment
1. Copy:
   - packages/server/.env.example -> packages/server/.env
2. Fill values in packages/server/.env:
   - DATABASE_URL
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

Important: use the Supabase pooler connection string for DATABASE_URL.

## 4) Configure client environment
1. Copy:
   - packages/client/.env.example -> packages/client/.env.local
2. Fill values in packages/client/.env.local:
   - VITE_API_URL
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

Important: the anon key is safe for client use; do not put service-role keys in client env files.

## 5) Install dependencies and generate Prisma client
From workspace root:

```bash
pnpm install
pnpm --filter @game/server db:generate
```

## 6) Push Prisma schema and seed data

```bash
pnpm --filter @game/server db:push
pnpm --filter @game/server db:seed
```

If db:push reports drift because SQL was imported first, run either:
- keep SQL as source of truth: continue without db:push, or
- make Prisma source of truth: reset target DB and run db:push first, then seed.

## 7) Run the game

```bash
pnpm dev
```

## Plain-language glossary
- SQL schema: the exact list of tables/columns your game stores.
- ERD: a diagram picture of how tables relate.
- Prisma: TypeScript tool your server uses to read/write the database.
- Supabase: hosted Postgres + auth + storage + APIs.

## Files added for this setup
- supabase/migrations/001_gtc_core.sql
- supabase/migrations/002_hero_full_fields.sql
- packages/server/prisma/schema.prisma
- packages/server/prisma/seed.ts
- packages/server/.env.example
- packages/server/src/utils/supabaseAdmin.ts
- packages/client/.env.example

## Auth flow now used by the game
1. Client signs up via server endpoint `/auth/signup` (creates Supabase Auth user + app User row).
2. Client signs in directly with Supabase (`signInWithPassword`).
3. Client calls server `/auth/me` with `Authorization: Bearer <access_token>`.
4. Server verifies JWT with Supabase and returns user + heroes.
5. Game state auto-saves to `/heroes/:id/state` with Bearer token.
