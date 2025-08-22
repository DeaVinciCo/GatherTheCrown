# Gather The Crown: Creats & Foes

**Gather The Crown: Creats & Foes** is a multiplayer, browser‑based action RPG built for a monorepo workflow.  
The project ships with a minimal yet complete “vertical slice” of the game loop, featuring a story boss, a randomized forest run, basic crafting and a functional HUD that showcases the artifact frame concept.

---

## Contents

- [Vision](#vision)
- [Feature Pillars](#feature-pillars)
- [Repository Structure](#repository-structure)
- [Installation](#installation)
- [Running the Game](#running-the-game)
- [Database](#database)
- [Architecture Overview](#architecture-overview)
  - [Packages](#packages)
  - [Networking](#networking)
  - [Scenes](#scenes)
  - [Data Schema](#data-schema)
  - [Content Pipeline](#content-pipeline)
  - [Balancing Knobs](#balancing-knobs)
  - [Accessibility](#accessibility)
  - [Testing & Telemetry Stubs](#testing--telemetry-stubs)
- [Roadmap](#roadmap)
- [Smoke Test (Quick Walkthrough)](#smoke-test-quick-walkthrough)

---

## Vision

A story‑first online action RPG where heroes bond with mythical companions called **creats**.  
Players reclaim walled kingdoms, assemble elemental crowns and eventually free the Crownbound Reignlords.

The vertical slice features:

- One creat species: **Pyrogryph** (Fire).
- One story boss: **The Ember Reignlord** (becomes an ally if defeated with an Ice debuff).
- One crown recipe: **Gold Base + Sapphire Gem**.
- Basic combat and a functional HUD.
- Randomized forest run, Haven base, first Crown Trial, district stub and a simple racing track.

---

## Feature Pillars

1. **Bonded Combat** – Hero + creat synergy. Bond tiers 50/75/100% unlock combo bonuses.
2. **Crown Collection** – Assemble crowns from metal bases, gems and shards to unlock buffs.
3. **Reclaim & Restore** – Clear districts inside walled kingdoms to reclaim territory.
4. **Replayable Wilds** – Forest zones shuffle layout and pickups per run using a seed.
5. **Fair Economy** – Gold, shards and gems. Stub store UI for development only.

---

## Repository Structure

```
/README.md                – This document
/pnpm-workspace.yaml      – PNPM workspace config
/package.json             – Root scripts (dev/build/start/db)
/tsconfig.base.json       – Shared TS config
/.eslintrc.cjs            – ESLint configuration
/.prettierrc              – Prettier rules
/packages
  /shared                 – TypeScript definitions and cross‑platform utilities
  /server                 – Colyseus server + Prisma + content
  /client                 – Phaser 3 client with Vite build
```

---

## Installation

Requires **Node.js ≥18** and **pnpm ≥8**.

```bash
pnpm install
```

This installs all workspace dependencies: server, client and shared packages.

---

## Running the Game

### Development

Use two terminals (or tmux panes):

```bash
# Terminal 1 – start server with nodemon
pnpm --filter @game/server dev

# Terminal 2 – start client with Vite
pnpm --filter @game/client dev
```

Or use the root helper script to run both concurrently:

```bash
pnpm dev
```

Open the client at <http://localhost:5173>. The server runs on <http://localhost:2567> with a `/health` route.

### Production build

```bash
pnpm build       # builds the client
pnpm start       # runs compiled server (served separately)
```

---

## Database

Prisma is configured for SQLite in development and is portable to PostgreSQL.

```bash
pnpm db:migrate  # apply migrations
pnpm db:seed     # insert starter data
```

The database lives in `packages/server/prisma/dev.db`.

---

## Architecture Overview

### Packages

- **@game/shared** – TypeScript definitions and cross‑platform utilities.
- **@game/server** – Node.js + Colyseus authoritative server. Handles state, combat, AI and persistence.
- **@game/client** – Phaser 3 WebGL client. Renders scenes and communicates via Colyseus.

### Networking

- WebSockets through Colyseus rooms.
- Rooms: `LobbyRoom`, `StoryRoom`, `BattleRoom`.
- Typed packets (join/leave, input, damage, loot, objectives, crown updates).
- Server is authoritative: combat, cooldowns, loot rolls.
- Client predicts only camera/UI; server reconciliation for entity positions.

### Scenes

1. **Boot** – Generates procedural textures.
2. **Preload** – Shows loading bar.
3. **MainMenu** – Title screen; “Forge Your Hero”.
4. **ForgeHero** – Choose weapon & name; spawns hero record.
5. **Haven** – Safe zone hub, vendors and crown forge.
6. **ForestZone** – Seeded layout shuffle with pickups & mini‑boss.
7. **District01** – First inside‑walls district stub.
8. **BattleArena** – 1v1 melee test.
9. **CrownTrial01** – Ritual boss encounter (two phases).
10. **Racing Track (stub)** – Enter via Haven menu.

### HUD – Artifact Frame

Top‑left: Hero HP & Stamina  
Top‑right: Creat HP & Energy + Element crest  
Bottom‑right: Mana ring, potions (max 6) and spells (max 12)  
Outer orbs: Gems, Keys, Shards, Menus, Gold, Options  
Center orb: Bonded menu (names, bond %, combo list)

Locked elements are dimmed; tooltips explain unlocks.

### Data Schema

Prisma models: `Account`, `Hero`, `Creat`, `InventoryItem`, `CrownFragment`, `Progress`, `MatchHistory`.

Each hero owns a creat, inventory items and crown fragments. Progress records unlocked districts and bond level. MatchHistory stores session results.

### Content Pipeline

- **Creats** – Add to `packages/server/src/content/creats.ts`. Include element, stats and progression.
- **Weapons** – Add to `packages/server/src/content/weapons.ts`.
- **Crowns** – Add recipes to `packages/server/src/content/crowns.ts`.
- **Bosses** – Add to `packages/server/src/content/bosses.ts`.
- Run `pnpm db:seed` after modifying seed data to populate the database.

### Balancing Knobs

- `POTION_CAP` = 6, `SPELL_CAP` = 12.
- Mana cooldown ~40s. Carry 10–15.
- Boss fights: ~5min first phase, ~10min total.
- Combo chains: 3→6→12→18→24→30.
- Crown rewards: gold, gems, shards, bixbite & buff multiplier.
- Economy display abbreviates counts: `1.2K`, `75K`, `1.8M`.

### Accessibility

- All scenes use large readable fonts.
- HUD scales with window size.
- Simple color palette; high contrast mode in development (toggle in options).
- Tooltips explain unavailable elements.

### Testing & Telemetry Stubs

- `pnpm --filter @game/shared test` runs vitest unit tests for shared logic.
- Telemetry hooks (`logger.ts`) can be wired to real analytics later.

---

## Roadmap

1. Expand districts and add reclamation meta‑game.
2. More creat species with unique abilities.
3. Racing, mini‑games and advanced crown trials.
4. Persisted matchmaking and guild systems.
5. Richer art, animations and audio.

---

## Smoke Test (Quick Walkthrough)

1. **Create a hero**
   - Run the dev environment.
   - In Main Menu select “Forge Your Hero”.
   - Enter a name, choose Odyssey Sword.

2. **Enter Forest**
   - From Haven, click “Forest Run”.
   - Move with arrows/WASD; defeat the mini‑boss (red blob).

3. **Return to Haven**
   - After victory you auto‑return with loot and a crown fragment.

4. **Start Crown Trial**
   - From Haven select “Crown Trial I”.
   - Fight the Ember Reignlord.
   - Use ice debuff (multitool) to free them.

5. **Complete Crown**
   - In Haven, interact with the forge table.
   - Combine Gold Base + Sapphire to craft the crown.
   - Receive rewards and witness HUD update.

Enjoy exploring the early foundation of **Gather The Crown: Creats & Foes!**
