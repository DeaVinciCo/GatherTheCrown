# GATHER THE CROWN: CREATS & FOES
## Master Game Design Document
**Version:** 0.2.0 | **Last Updated:** April 21, 2026 | **Engine:** Godot 4.x

---

## TABLE OF CONTENTS

1. [Vision & Elevator Pitch](#1-vision--elevator-pitch)
2. [Core Philosophy](#2-core-philosophy)
3. [Target Audience](#3-target-audience)
4. [Core Gameplay Loops](#4-core-gameplay-loops)
5. [Game Modes](#5-game-modes)
6. [Character System](#6-character-system)
7. [The Creat System](#7-the-creat-system)
8. [Combat System](#8-combat-system)
9. [The Crown System](#9-the-crown-system)
10. [World & Zones](#10-world--zones)
11. [Progression & Economy](#11-progression--economy)
12. [Day/Night Cycle](#12-daynight-cycle)
13. [Kingdom Restoration](#13-kingdom-restoration)
14. [Multiplayer & Social](#14-multiplayer--social)
15. [Feature Status Overview](#15-feature-status-overview)

---

## 1. VISION & ELEVATOR PITCH

**Tagline:** *"Bond. Fight. Forge. Rule."*

**Elevator Pitch:** Gather The Crown is a 2D medieval action RPG where you forge a hero, hatch and bond with a magical creature companion (a "Creat"), venture through a fractured kingdom, collect rare gems and metal shards, and forge one of ten Crowns — each representing mastery of a different aspect of play. Your Creat is not a pet; it is your partner in combat, co-creator of powerful Sync attacks, and the living proof of your bond.

**One-Line Summary:** Explore a broken kingdom with your creature companion, fight enemies in real-time combat, and forge a legendary crown to restore order.

---

## 2. CORE PHILOSOPHY

### Design Pillars

| Pillar | Description |
|--------|-------------|
| **Bond Over Power** | The Creat relationship drives emotional investment. Bond increases stats but more importantly tells a story of partnership. |
| **Readable Combat** | Combat is fast and readable. Enemy telegraphs are clear. The Fast/Forgiving profile ensures accessibility without sacrificing skill expression. |
| **Meaningful Exploration** | Every zone has a reason to be there. Discovery yields Kingdom Findings, materials, and lore — not just XP numbers. |
| **Crown as Achievement** | Forging a Crown is a milestone, not a routine. Each Crown requires specific gameplay mastery and rare materials. |
| **Playable From Day One** | The vertical slice must be fully playable even in early development. Core loop (create hero → find egg → fight → forge) must always work. |

### What This Game Is NOT
- Not a gacha game (no loot boxes, no pay-to-win)
- Not a farming simulator (restoration is meaningful, not mandatory grind)
- Not a passive experience (Creats attack on player commands, not automatically)

---

## 3. TARGET AUDIENCE

**Primary:** Ages 14–35, fans of Pokémon (companion bonding), Stardew Valley (restoration), and Hades (fast, readable combat).

**Secondary:** Players who enjoy crafting/forging systems and completionist goals (10 crowns to collect).

**Platform:** PC first (Godot + potential Electron wrapper), browser/mobile later via Phaser port.

---

## 4. CORE GAMEPLAY LOOPS

### Primary Loop (Session ~15–30 min)
```
Boot Game
    ↓
Character Creation (first time) / Resume (returning)
    ↓
Greenwood Clearing (Home Hub)
    ↓
Choose Activity:
    ├── Forest Trials (Combat: 6–18 min routes)
    ├── Crownride Circuit (Racing)
    ├── Wooded Trail / Other Zones (Exploration/Combat)
    └── Home (Feed Creat, Rest, Craft)
    ↓
Return with: GC (gold coins), Materials, Findings, Bond XP
    ↓
Home Actions:
    ├── Feed Creat (↑ bond, ↓ hunger)
    ├── Visit Crown Forge (check progress, forge if ready)
    ├── Restoration Site (restore kingdom structures)
    └── Rest Point (heal, save checkpoint)
    ↓
Loop restarts
```

### Secondary Loop (Multi-Session Goal)
```
Collect specific Gems + Shards across many sessions
    ↓
Forge a Crown (10 total — each unlocks something)
    ↓
Complete Crown activates new game mode or area
    ↓
Progress toward "Seven Realms" meta-crown
```

### Creat Loop (Companion Arc)
```
Find Egg Discovery Trigger in world
    ↓
Choose element for egg (Fire/Ice/Earth/Storm/Shadow)
    ↓
Care for egg (Feed regularly, avoid neglect)
    ↓
Egg hatches when hatch_progress ≥ 1.0 (300 sec of care)
    ↓
Creat becomes active combat companion
    ↓
Bond grows through: feeding, combat together, sync attacks
    ↓
Higher bond = stronger attacks, richer Sync mode
```

---

## 5. GAME MODES

### Story Mode (Primary)
- Linear world exploration through forest → kingdom regions
- Non-optional critical path; optional side content
- Routes: Sproutbound (easy), Emberroot (medium), Crownfire (hard)
- Boss encounters gated by Crown progress or story flags
- Checkpoint system: Journey, Battle, Restoration types

### Forest Trials
| Route | Duration | Encounters | Difficulty |
|-------|----------|------------|------------|
| Sproutbound | 6–9 min | 3–4 | Beginner |
| Emberroot | 10–14 min | 4–5 | Intermediate |
| Crownfire | 14–18 min | 6 | Advanced |
| Forage Route | 10–15 min | 2–4 light + scavenging | Exploration |
| Home Route | Instant | None | Return only |

### Crownride Circuit (Racing)
- Player rides Creat through timed circuit tracks
- Global leaderboards for ranked runs
- Materials and GC rewards for completion
- Crown: `crown_race_torque`

### Clashborn Arena (PvP/PvE Combat)
- Wave-based arena combat (PvE)
- 1v1 duel ranking (PvP when multiplayer active)
- Crown: `crown_pvp_conqueror` (PvP), `crown_pve_warden` (PvE waves)

### Crown Trials
- Special challenge rooms unlocked per-crown
- Time attacks, puzzle combat, score events
- Crown: `crown_minigame_tactician`

### Side Quests
| Tier | Color | Type | Example |
|------|-------|------|---------|
| Finder | Amber | Fetch/discover | "Find the missing rider's cache" |
| Clearance | Emerald | Clear enemies | "Rid the trail of bandits" |
| Restoration | Crimson | Rebuild structures | "Restore the Ancient Grove" |
| Royal Arc | Gold | Story-critical | "Deliver ward stones to Mage Council" |

---

## 6. CHARACTER SYSTEM

### Hero Creation — "Forge a Hero"
Players create their hero once and the profile persists across saves. Character creation screen uses art-deco royal navy/gold design.

#### Elements (6)
| Element | Color Theme | Combat Style |
|---------|-------------|--------------|
| Fire | Orange/Red | Aggressive burst |
| Water | Blue/Teal | Flowing, defensive |
| Earth | Brown/Green | Steady, heavy |
| Storm | Purple/White | Fast, unpredictable |
| Light | Yellow/White | Healing, radiant |
| Shadow | Dark Purple | Stealth, debuff |

#### Races (2)
- **Human** — Balanced stats, no elemental resistance
- **Hybrid** — Slight elemental affinity based on chosen element

#### Looks (4)
| Look | Visual Identity |
|------|----------------|
| Trailblazer | Scout ranger aesthetic |
| Warden | Heavy armor, protector |
| Skyrunner | Light, agile traveler |
| Runeborn | Arcane markings, mystical |

#### Starter Equipment
**Clothes (4):**
- Ranger Wrap — Light cloth, mobile
- Forgeguard Coat — Metal reinforced
- Tideweave Vest — Water-resistant
- Stormmantle Cloak — Storm resistance

**Weapons (4):**
- Bronze Saber — Fast, melee
- Scout Bow — Ranged, aim-based
- Twin Hatchets — Dual wielding
- Runic Spear — Long range melee + magic

### Banner Paths (3 Quick-build presets)
| Banner | Stats | Preset Combo |
|--------|-------|-------------|
| Strength | Red/Physical | Max melee, heavy armor |
| Magic | Blue/Elemental | Element amplification |
| Balance | Gold/Hybrid | Versatile all-rounder |

### Hero Profile Data
```gdscript
hero_profile = {
  name: String,         # Max 24 chars
  element: String,      # Fire, Water, Earth, Storm, Light, Shadow
  race: String,         # Human, Hybrid
  look: String,         # Trailblazer, Warden, Skyrunner, Runeborn
  clothes: String,      # One of 4 cloth types
  starter_weapon: String # One of 4 weapons
}
```

### Hero Roster
- Up to **3 heroes** per save (hero switching in hub only)
- `active_hero_index` tracks which hero is active

---

## 7. THE CREAT SYSTEM

The Creat is the heart of the game's emotional identity. Players must find, hatch, and raise their Creat companion.

### Lifecycle States
```
NO_CREAT → EGG_ACQUIRED → EGG_IN_CARE → EGG_HATCHING → CREAT_ACTIVE
```

| State | Trigger | Player Action |
|-------|---------|---------------|
| NO_CREAT | Start | Find an Egg Discovery Trigger in the world |
| EGG_ACQUIRED | Touching trigger + choosing element | Begin care (feed, keep warm) |
| EGG_IN_CARE | `begin_care()` called | Feed regularly or egg starts neglect timer |
| EGG_HATCHING | `hatch_progress ≥ 1.0` (after ~300 sec care) | Watch hatching animation |
| CREAT_ACTIVE | Hatch complete | Fight together, feed to maintain bond |

### Neglect System
- Neglect timer increases while in EGG_IN_CARE without feeding
- `neglect_threshold = 100.0` — egg dies if exceeded
- Feeding reduces neglect by `feed_reduces_neglect = 20.0`
- Dead eggs require finding a new trigger (no re-spawn immediately)

### Creat Elements (5 choosable)
| Element | Creat Species | Visual | Combat Style |
|---------|--------------|--------|--------------|
| Fire | FireCreat | Orange/red flame body | Ranged fire burst |
| Ice | IceCreat | Blue crystal body | Slow/freeze attacks |
| Earth | EarthCreat | Brown/green rocky | AoE stomp attacks |
| Storm | StormCreat | Purple electric | Chain lightning |
| Shadow | ShadowCreat | Dark void | Debuff + stealth strike |

*Note: Only FireCreat scene currently implemented. Others are placeholder paths.*

### Bond System
- Bond value: `0.0` to `1.0` (displayed as %)
- Bond increases from: feeding (+0.05 per feed), combat together, Sync attacks
- Bond XP: 100 XP = +0.5 bond increase
- **Combat Impact (FireCreat):** Base 8 damage × (1 + bond × 0.5)
  - 0% bond = 8 damage per attack
  - 100% bond = 12 damage per attack
  - Synced + 100% bond = 24 damage per attack

### Creat Commands (F key toggle)
| Mode | Behavior |
|------|----------|
| FOLLOW | Creat follows player, does not attack |
| ATTACK | Creat aggressively targets nearest enemy |
| DEFENSIVE | Creat guards player, counterattacks |

### Sync Mode
- Sync meter fills during combat (player attacks: +5 per hit, Creat hits: +3 per hit)
- Sync activates when meter ≥ 80 (max 100)
- Sync duration: **10 seconds**
- **Sync Bonuses:**
  - Damage multiplier: ×1.5
  - Creat attack rate: ×2.0
  - Movement speed: ×1.3
- Sync activation: `/` key (Numpad or keyboard)

---

## 8. COMBAT SYSTEM

### Input & Controls
| Key | Action |
|-----|--------|
| W/A/S/D or ↑↓←→ | 8-directional movement |
| Left Mouse Button | Aim attack toward cursor |
| Spacebar | Attack (non-aim alternative) |
| E | Interact with world objects |
| F | Toggle Creat command mode |
| / | Activate Sync mode (when ≥80 meter) |
| R | Restore from checkpoint |

### Combat Profiles
**Fast/Forgiving (standard enemies):**
- Aim assist: 80%
- Input buffer: 100ms
- Lenient i-frames: 0.3 sec
- Enemy hit stun: 50ms
- Parry window: 200ms
- Damage forgiveness: 0.8×

**Precise/Boss (boss fights):**
- Aim assist: 30%
- Input buffer: 50ms
- Lenient i-frames: 0.15 sec
- Enemy hit stun: 75ms
- Parry window: 100ms
- Damage forgiveness: 1.0× (no reduction)

### Damage Formula
```
Base = 6.0 + (player_level × 1.2) + (strength × 0.35)
Final = Base × enemy_type_modifier
Sync = Final × 1.5 (if sync active)
```

### Z-Index / Layer Order (rendering)
| Layer | Z-Index | Contents |
|-------|---------|----------|
| GrassLayer | -4 | Ground tiles |
| PathLayer | -3 | Path tiles |
| SafeZoneLayer | -2 | Safe zone overlay |
| TreeLayer | 5 | Trees, large objects |
| PickupLayer | 12 | Ground pickups |
| EnemyLayer | 20 | Enemy characters |
| Player | 25 | Player character |
| UI | 30+ | HUD elements |

### Enemy Types
| Type | Color | Class | Behavior | HP | Speed |
|------|-------|-------|----------|-----|-------|
| goblin_scout | Green | Scout | ground_chase | Low | Fast |
| forest_bat | Purple | Scout | flying | Low | Fast |
| cave_bat | Purple | Scout | flying | Low | Fast |
| bandit_rogue | Crimson | Raider | ground_chase | Medium | Medium |
| orc_warrior | Olive | Raider | ground_chase | High | Slow |
| skeleton_guard | Bone | Knight | ground_patrol | High | Slow |
| crown_knight | Gold | Knight | ground_chase | High | Medium |

### Boss System
- Bosses have 2 phases (Phase 2 triggers at 50% HP)
- Phase 2: increased speed (150), reduced attack cooldown (2.0s)
- Boss telegraph: turns red for `telegraph_time = 1.0s` before attacking
- Boss scaling formula: `HP × (1 + (level - 1) × 0.45)`
- Boss loot: shard (silver or gold) + gem (by element) + GC reward + bixbite

### Hitbox / Hurtbox Architecture
- `Hitbox` (Area2D): deals damage, tracks already-hit targets, applies knockback
- `Hurtbox` (Area2D): receives damage, checks team validity
- I-frame system: sets invulnerability timer + 0.5 alpha flash
- Knockback: `200.0` force applied to CharacterBody2D parent

### Attack Range
- Player melee attack: ~92px radius (aim toward cursor)
- Player attack damage: 15 base
- Player attack cooldown: 0.5 seconds
- Creat attack range: 100px from Creat position

---

## 9. THE CROWN SYSTEM

Crowns are the ultimate goal of the game — each one represents mastery of a different gameplay mode and requires rare materials to forge.

### Gems (7 types)
| Gem ID | Lore Name | Element | Tier |
|--------|-----------|---------|------|
| gem_blue | Abyss Sapphire | Water/Shadow | 3 |
| gem_red | Dragonheart Ruby | Fire | 3 |
| gem_yellow | Solar Topaz | Light/Storm | 2 |
| gem_green | Verdant Alexandrite | Earth | 2 |
| gem_clear | Storm Quartz | Storm | 2 |
| gem_purple | Void Amethyst | Shadow | 3 |
| gem_black | Nightfall Painite | Shadow/Dark | 4 |

### Shards (7 types — Metal/Material Grades)
| Shard ID | Lore Name | Tier | Source |
|----------|-----------|------|--------|
| shard_iron | Dreadsteel | 1 | Cave enemies, basic mining |
| shard_bronze | Embersteel | 2 | Forest enemies, goblin drops |
| shard_silver | Moonsteel | 3 | Boss drops (T1-2) |
| shard_gold | Aurorite | 4 | Boss drops (T2-3) |
| shard_obsidian | Osmium | 5 | Rare world spawns |
| shard_crystal | Aethersteel | 6 | Restoration rewards |
| shard_runic | Starforged | 7 | Crown Trials only |

### Gem/Shard Aliases (alternate item names that auto-normalize)
- `gem_topaz → gem_yellow`, `gem_sapphire → gem_blue`, `gem_ruby → gem_red`
- `embersteel_fragment → shard_bronze`, `moonsteel_fragment → shard_silver`, `dreadsteel_fragment → shard_iron`

### The 10 Crowns
| Crown ID | Name | Requirements | Reward (GC / Bixbite) | Unlock |
|----------|------|-------------|----------------------|--------|
| crown_story_sovereign | Story Sovereign | 2× shard_runic, 2× shard_gold, 2× gem_clear, 1× gem_black, 1× gem_purple | 1,200,000 / 35 | Endgame zone |
| crown_melee_duelist | Melee Duelist | TBD | TBD | Clashborn Arena |
| crown_race_torque | Race Torque | TBD | TBD | Crownride Circuit |
| crown_minigame_tactician | Minigame Tactician | TBD | TBD | Crown Trials |
| crown_pve_warden | PvE Warden | TBD | TBD | Arena waves |
| crown_pvp_conqueror | PvP Conqueror | TBD | TBD | 1v1 ranking |
| crown_sidequest_seeker | Sidequest Seeker | TBD | TBD | All side quests |
| crown_finding_scavenger | Finding Scavenger | TBD | TBD | All Kingdom Findings |
| crown_meta_seven_realms | Seven Realms | All other 9 crowns | Ultimate reward | Meta-completion |

### Crown Forging Flow
```
Visit Crown Forge NPC at Greenwood Clearing
    ↓
View Crown requirements in Crown Forge Screen
    ↓
Deposit required gems + shards
    ↓
Crown is forged (one-time milestone)
    ↓
Crown is displayed in Crown Collection
    ↓
Game mode or area associated with crown unlocks
```

---

## 10. WORLD & ZONES

### Zone Types
| Type | Purpose |
|------|---------|
| `forest_hub` | Safe home base with NPCs, services |
| `combat_zone` | Enemy encounters, boss rooms |
| `racing_zone` | Creat racing track |
| `restoration_site` | Broken structures to repair |
| `arena` | Wave combat or PvP |
| `crown_trial` | Specific challenge rooms |

### Current Zones (Implemented / Partial)
| Zone ID | Scene | Type | Level | Boss | Status |
|---------|-------|------|-------|------|--------|
| greenwood_clearing | GreenwoodClearing.tscn | forest_hub | 1–5 | None | Partial |
| wooded_trail | WoodedTrail.tscn | combat_zone | 5–15 | fire_boss_001 | Partial |
| forest_trials_entrance | ForestTrialsEntrance.tscn | hub | 1 | None | Implemented |
| forest_trials_sproutbound | ForestTrials_Sproutbound.tscn | combat_zone | 1–5 | None | Stub |
| forest_trials_emberroot | ForestTrials_Emberroot.tscn | combat_zone | 5–10 | None | Stub |
| forest_trials_crownfire | ForestTrials_Crownfire.tscn | combat_zone | 10–15 | None | Stub |
| crownride_circuit | CrownrideCircuit.tscn | racing_zone | Any | None | Partial |
| clashborn_arena | ClashbornArena.tscn | arena | Any | None | Stub |
| crown_trials | CrownTrials.tscn | crown_trial | Any | None | Stub |
| restoration_site_01 | RestorationSite_01.tscn | restoration_site | 3–8 | None | Partial |

### Greenwood Clearing (Home Hub) — Full Spec
**Purpose:** Safe, NPCs, all services available
**NPCs & Interactables:**
- `CrownForgeNPC` — Crown assembly station
- `FeedStation` — Feed active Creat
- `RestPoint` — Heal + manual save
- `MaterialGatherPoint` — Gather essence/materials
- `EggDiscoveryTrigger` — First-time egg discovery spot

**Zone Resources:**
- embersteel_fragment × 5 (renewable)
- herb_mild × 3 (renewable)

**Zone Landmarks:**
- crown_forge_01 (the Crown Forge)
- bond_shrine_01 (bond with Creat here)

### Creat Density (Per Zone, per spawn tick)
```json
{
  "greenwood_clearing": { "fire": 0.3, "earth": 0.4, "water": 0.2 },
  "wooded_trail": { "fire": 0.6, "earth": 0.2, "storm": 0.1 }
}
```

### Zone Transition
- Handled by `SceneRouter.go_to_zone(path, transition_name)`
- Transition types: fade, slide, instant
- Zone entry triggers: spawn enemies, start day/night, load checkpoint

---

## 11. PROGRESSION & ECONOMY

### Currencies
| Currency | Symbol | Source | Use |
|----------|--------|--------|-----|
| Gold Coins (GC) | 🪙 | Enemy kills, boss drops, kingdom events | Buy items, forge materials, trade |
| Bixbite | 💎 | Boss kills, milestones, rare events | Premium materials, rare trades |

### Economy Benchmarks
| Event | GC Reward |
|-------|-----------|
| Standard enemy kill | 10–30 GC |
| Zone clear | 100–500 GC |
| Boss kill (T1, level 1) | 35,000 GC |
| Boss kill (per level bonus) | × (level) |
| Restoration site daily | Varies by site |
| Crown forged | 1,200,000+ GC (returned) |

### Inventory System (2-tier)
**Player Inventory:** 100 slots (scales with level), 8 tabs
**Home Storage:** 300 slots, unlimited access in hub

**Inventory Tabs:**
| Tab | Contains |
|-----|----------|
| GEAR | Armor, clothing, accessories |
| PROVISIONS | Food, meals, potions |
| ARMORY | Weapons, shields |
| ARCANA | Spells, scrolls, runes |
| MATERIALS | Gems, shards, essences |
| TRADE | Trade goods for NPCs |
| CREAT | Creat items, eggs, care items |
| QUEST | Quest items, keys, findings |

**Key Items (Keyring, not inventory):**
- Trail Key — unlocks forest trial routes
- Town Key — unlocks town areas
- Kingdom Key — unlocks kingdom zones

### Hero Stats
```
hp: current/max (default 100/100)
energy: current/max (default 100/100)
```
*Full stat system (strength, agility, etc.) planned for Phase 2.*

---

## 12. DAY/NIGHT CYCLE

- **Day duration:** 30 minutes real-time
- **Night duration:** 30 minutes real-time
- **Transition window:** 5 minutes (dawn and dusk)
- **Start time:** 10 minutes into day (post-dawn by default)
- **Visual:** Full-screen CanvasLayer tint overlay (layer 90)
  - Dawn: warm orange tint
  - Day: clear (no tint)
  - Dusk: amber tint
  - Night: deep blue/purple tint
- **Gameplay effects (planned):** Night = stronger enemies, different spawns, some areas locked

### Time Display
- Format: ` Day  04:32` or ` Night  22:15`
- Accessible via `DayNightCycle.get_time_label()`

---

## 13. KINGDOM RESTORATION

The kingdom is broken. Players gather Findings (items, structures, materials) and deliver them to NPCs to restore the world.

### Finding Categories
| Category | Who Benefits | Example Items |
|----------|-------------|---------------|
| RIDER | Your own journey / survival | Food cache, potion kit, craft blueprint |
| TOWN | Town NPCs (Innkeeper, Shopkeeper, Carpenter, etc.) | Lamp oil, window glass, door hinges, cloth bolts |
| KINGDOM | Kingdom officials (Gate Keeper, Mage Council, Architect Chief) | Gate key (value 40), Ward stones (value 35), Light core (value 50) |

### Restoration Flow
```
Discover a finding in the world (area2D trigger or pickup)
    ↓
Finding marked in KingdomFindingsSystem
    ↓
Return to corresponding NPC
    ↓
Deliver finding (check-in dialogue)
    ↓
Town/Kingdom restoration value increases
    ↓
When enough value accumulated → milestone event
    ↓
Passive daily income from restored sites
```

### Restoration Sites
- `restoration_site_01` — Ancient Grove (unrestored by default)
- Restoring takes ~5 seconds and required materials
- Restored sites yield daily items (ember_fruit × 3, etc.)

---

## 14. MULTIPLAYER & SOCIAL

*Multiplayer is Phase 3 content. Infrastructure laid in packages/server.*

### Colyseus Rooms (planned)
- **LobbyRoom** — Matchmaking, party formation
- **StoryRoom** — Co-op story mode (2–4 players)
- **BattleRoom** — PvP arena matches

### Social Features (planned)
- Global leaderboards for Crownride and Arena
- Crown collection showcase
- Chat system (Shift key — already implemented)

---

## 15. FEATURE STATUS OVERVIEW

### Implemented & Working ✅
- Character creation (UI + save logic)
- Hero profile system (GameState persistence)
- Movement system (8-directional, direct key presses)
- Basic combat (hitbox/hurtbox/health)
- Enemy AI (7 types, 3 behaviors)
- Creat lifecycle (egg → hatch → active)
- FireCreat companion (follows, attacks, sync)
- Creat commands (Follow/Attack/Defensive via F key)
- Sync system (meter, activation, bonuses)
- Bond system (feeding, XP, combat scaling)
- Inventory system (basic add/remove/query)
- Advanced inventory (8 tabs, home storage, keyring)
- Crown Progression System (structure + gem/shard tracking)
- Day/Night Cycle (visual tint, time display)
- Event Bus (30+ signals, reactive architecture)
- Scene Router (zone transitions, UI overlays)
- Save/Load system (full game state persistence)
- Checkpoint system (Journey/Battle/Restoration)
- Kingdom Findings system (30+ findings initialized)
- Restoration system (start/complete/rewards)
- Egg Discovery Trigger (element picker UI)
- Forest Trials Entrance (route selection 1–5)
- Boss AI (2 phases, scaling, loot drops)
- Debug diagnostics (spawn reports, system checks)

### Partially Implemented ⚠️
- HUD (widget structure only, data binding incomplete)
- Map screen (structure complete, zone data loading needs work)
- Boss combat encounters (AI works, full boss scenes TBD)
- Forest trial zone scenes (scripts done, scene content TBD)
- Crown Forge screen (UI skeleton only)
- Pre-battle prep screen (skeleton)
- Restoration site visual states (logic works, no visual change yet)
- Creat species (only FireCreat; IceCreat, EarthCreat, StormCreat, ShadowCreat are paths only)

### Planned / Not Started ❌
- Full stat system (strength, agility, defense, etc.)
- Key "1" creat spawning in Crownride Circuit
- Sound effects and music
- Particle effects and animations
- 7 of 9 Crown full requirements (only Story Sovereign defined)
- Second and third kingdom zones
- Castle arc (2–5 floors per kingdom)
- PvP mode
- Multiplayer (Phase 3)
- Mobile export
- Localization

---

*This document is the source of truth for game design intent. Update version number and date when making significant design changes.*
