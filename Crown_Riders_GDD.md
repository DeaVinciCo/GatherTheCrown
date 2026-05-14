# Crown Riders - Game Design Document

**Working Title:** Crown Riders  
**Genre:** Fantasy Combat Racing RPG  
**Platform:** Mobile + PC (Console expansion later)  
**Influences:** F-Zero X, Mario Kart, Pokémon, Zelda, D&D  
**Created:** March 21, 2021  
**Last Updated:** February 23, 2026

---

## 🎮 Core Concept

Players ride legendary mythical creats (creatures) through dangerous, dynamic racecourses filled with traps, obstacles, and rival racers. It's not just about speed — it's survival, skill, strategy, and bonding with your mount.

**Win Conditions:**
- Reach the finish line first
- Collect required items during the race
- Knock out all other racers (arena mode)
- Survive to the end (Battle Royale)

---

## 🧩 Core Gameplay Loop

### Character Creation
- Customize appearance + starting ability stats
- Abilities synergize with creat type:
  - Earth-affinity → Golem/Stone creats
  - Swift rogues → Air/Wind dragons
  - Water-sorcerers → Amphibious Leviathans

### Creat Bonding
- Start with baby/young creat
- Train and bond through races, trials, battles
- Creats level up independently
- Unique movesets per creat type (tremor gallop, hydroboost swim, shadow phase dash)

### Race Format
- Terrain varies: looped, linear, labyrinth-style
- Weather and elemental hazards (rain/tornado, dust/sandstorm, fire/lava flow)
- Collect items or complete objectives mid-race to qualify
- Dynamic obstacles and terrain changes

---

## 🗺️ Game Modes

### 1. Story Mode (Solo/Co-op)
**Purpose:** Core progression, loot acquisition, world exploration

**Features:**
- Deep narrative uncovering the origins of "The Crown"
- Explore hubs + wild zones on dynamic world map
- Side quests for rare items, attacks, gear, creature items
- Meet NPCs, rival factions, elemental gods
- Boss battles with massive gold + unique item drops

**Rewards:**
- Weapons, attacks, armor (rider + creature)
- Gold, gems, shards
- Cosmetics, titles, emblems
- Tradeable items for player economy
- Unlocks for other game modes

### 2. Race Mode (Map + Circuit)
**Types:**
- Quickplay Circuit (1-3 laps)
- Gauntlet Run (hazard heavy + objectives)
- Elemental Terrain Races
- Legendary Path (requires keys, mid-bosses)
- Training Tracks

**Features:**
- Live obstacles (lava bursts, sand traps, fog)
- Mid-race power-up shrines
- Creature-specific shortcuts
- World map travel between regions

### 3. Battle Royale (Survival Race)
**Rules:**
- 16-32 players
- Shrinking elemental zone
- Eliminated by HP loss, environmental deaths, or being lapped
- Random item pickups
- Last rider standing OR finish with The Crown (makes you glow = target)

### 4. PvP Duel / Arena Combat
**Format:**
- 1v1 or 2v2 tactical arena battles
- Pre-built or earned attack loadouts
- Defensive zones + terrain objects
- Stadium maps with dynamic hazards
- Ranked ladder: Bronze → Iron → Ember → Crystal → Crowned

### 5. Melee Mode ("Clash Arena")
**Style:**
- Third-person mount-based melee combat
- Lock-on or free aim
- Combo strikes, dodge-rolls, mount attacks
- Dynasty Warriors x Monster Hunter vibes

**Equipment:**
- 1 Melee Weapon (Spear, Whip, Saber, Gauntlet)
- 1 Sidearm (Dagger, Shortbow, Glove Shot)
- 1 Utility (Trap, Bomb, Healing Totem, Smoke Veil)

**Mechanics:**
- Stamina system for attacking/dodging
- Armor durability (breakable parts)
- Elemental resistances
- Cinematic finishers

### 6. Team Battle / Co-op PvP
**Modes:**
- 3v3 or 4v4 team races/combat
- Item Relay (pass crown/item like baton)
- Protect the Carrier
- Control Zones (race + hold territory)

---

## ⚔️ Combat System

### Attack System Structure
**Total: 15 attacks per game**
- 5 pre-loaded by player (custom loadout)
  - 1 "Core/Static" attack (can't swap, based on class + creature)
  - 4 swappable loadout attacks (limited uses)
- 4 found/earned mid-race (pickups, quests, defeating enemies)
- Max inventory: 5 equipped attacks at once

### Attack Categories
| Category | Purpose | Examples |
|----------|---------|----------|
| 🔺 Damage | Hurt/KO opponent | Flame Lash, Rock Spike, Hail Blast |
| 🌀 Utility | Steal, distract, redirect | Mirage Field, Tracker Pulse |
| ⚡ Speed | Boost, dash, shortcuts | Wind Surge, Lightning Glide |
| 🛡️ Defense | Block, heal, protect | Stone Shell, Life Vine |
| 💎 Economy | Steal/boost gold | Gold Siphon, Gem Drain |
| 🧩 Terrain | Hazards, obstacles | Quake Fissure, Ice Wall, Fire Zone |

### Attack Properties
Each attack has:
- **Duration:** How long it affects target (2-5 seconds)
- **Disruption:** How much it delays opponent progress
- **Counterability:** Can it be dodged/blocked/resisted?
- **Uses:** 2-5 uses per attack
- **Ammo/Cooldown:** Limited availability

### Missed Attack Mechanic
- Missed attacks leave behind recoverable energy shards
- Can be absorbed IF:
  - Player has elemental affinity
  - Has open attack slot
  - Makes contact in time
- Absorbed version may only have 1 use

### Elemental Counters
- ❄️ Ice counters Fire
- 💨 Wind counters Earth
- 🌊 Water cleanses Poison/Blind
- ☀️ Light dispels Shadow
- 🧱 Earth grounds Lightning

---

## 🔫 Handheld Weapons (PvP Focus)

| Weapon | Base DMG | Effect | Duration | Ammo | Counter |
|--------|----------|--------|----------|------|---------|
| Flame Sling | 10 HP | AOE burn (DOT) | 3s | 5 stones | Water/roll |
| Poison Dagger | 15 HP | DOT + slow | 5s | 3 throws | Cleanse |
| Mini Crossbow | 25 HP | Bleed | Instant | 2 bolts | Dodge/shield |
| Long-Nose Pistol | 30 HP | Knockback | Instant | 2 shots | Air jump |
| Glove Blaster | 15 HP | Flame cone (50°) | 1.5s | Cooldown 10s | Ice shield |
| Elemental Pebble | 8 HP | AOE confuse | 4s | 6 pellets | Distance |
| Shock Whip | 10 HP | Stun mount | 2s | Recharge 15s | Timing |
| Smoke Globe | 0 HP | Conceals area | 6s | 2 globes | Wait out |

**Damage Formula:**
```
Total Damage = (Base Weapon DMG × Player Attack Stat × Crit Multiplier) - Enemy Defense
```

**Health Pool:** 100 HP standard  
**DOT Limit:** Max 2 concurrent DOTs per player

---

## 🌍 World Structure

### Biomes & Fallen Kingdoms
- 🌲 **Sylvara** (Forest Kingdom) - corrupted by Shadow
- 🔥 **Pyrrathia** (Lava Kingdom) - destroyed by Water flood
- ❄️ **Frostvale** (Ice Kingdom) - eternal winter + Fire attacks
- 🏜️ **Zerath Dunes** (Desert Kingdom) - drought + sandstorms
- 🌿 **Mor'gahl Fen** (Swamp Kingdom) - poison disaster + Light purge
- 💎 **Luminaris** (Crystal Kingdom) - Shadow invasion + Light overload
- 🌑 **Umbral Reach** (Shadow Kingdom) - Light invasion + Void consumption
- 👑 **Crown Convergence** (Final Kingdom) - ALL elements at war

Each kingdom has hidden royal vaults with legendary loot and cinematic backstories.  
See **Royal_Loot_Codex.md** for complete vault system details.

### Elemental Events
| Element | Normal Event | Extreme Version |
|---------|--------------|-----------------|
| 🌧️ Water | Rainstorm (slippery) | Tornado (sucks off-track) |
| 🌬️ Air | Wind gusts | Sandstorm (blinds) |
| 🔥 Fire | Combustion sparks | Lava flow (kills on contact) |
| 🌱 Earth | Mudslide (slow) | Earthquake (terrain cracks) |
| ❄️ Ice | Hail (chip HP) | Blizzard (freezes movement) |
| ☠️ Shadow | Fog (stealth boost) | Rift zone (flip controls) |
| ☀️ Light | Beam strikes | Solar surge (disables tech) |

**Creature Immunity:** Some creatures thrive in their element (2x speed in lava for fire beasts)

---

## 🐉 Creats & Classes

### Starting Creat Types
| Element | Creature Examples | Playstyle |
|---------|-------------------|-----------|
| 🔥 Fire | Lava Hound, Ember Hawk | Aggro, traps, burn DOT |
| 🌊 Water | Reef Serpent, Aqua Tortoise | Defensive, healing, cleanse |
| 🌬️ Air | Sky Strider, Storm Vulture | Speed, mobility, evasion |
| 🪨 Earth | Stonehorn, Root Crawler | Heavy defense, map control |

**Expansion Ideas:**
- Shadow/Light dual elementals
- Mixed mounts (Electric/Ice, Nature/Poison)
- Beast Fusion (evolve/combine creatures)

### Character Classes (Examples)
- **Pyra** (Fire) - Aggressive fire mage
- **Nilo** (Water) - Defensive healer
- **Zeff** (Air) - Speed demon
- **Drox** (Earth) - Tank commander

---

## 💰 Economy & Progression

### Currency
- **Gold:** Primary currency from races, quests, bosses
- **Gems:** Rare currency for premium items
- **Shards:** Crafting materials
- **Crowns:** Elite PvP currency
- **Royal Currencies:** Kingdom-specific currencies (see Royal_Loot_Codex.md)
  - Emerald Leaves, Flame Coins, Frost Shards, Sun Tokens, Venom Vials, Prism Shards, Void Coins, Crown Shards
  - Convertible to Crown Shards for legendary upgrades
  - Used for kingdom restoration and special purchases

### Gold Sources
- Race placement rewards
- Boss defeats (BIG payouts)
- Side quest completion
- Selling tradeable items
- PvP victories (can loot opponents)

### Boss Gold Formula
```
Gold = Base + Time Bonus + Style Bonus + Difficulty Multiplier
```

| Tier | Boss Example | Base Gold | Multiplier |
|------|--------------|-----------|------------|
| 🟢 Common | Fire Shrine Mini | 100 | x1.0 |
| 🔵 Rare | Warden of Dunes | 300 | x1.5 |
| 🟣 Epic | Glacier Serpent | 500 | x2.0 |
| 🟡 Legendary | The Riftwatcher | 800 | x2.5 |
| 🔴 World Boss | Molten Crownling | 1000+ | x3.5 |

**Style Bonuses:**
- No items used: +10%
- Perfect dodge: +50g
- Combo finisher: +5%
- Under 2 mins: +100g

### Gold Vault Milestones
| Gold Earned | Reward |
|-------------|--------|
| 5,000g | Backpack Upgrade |
| 10,000g | Creature carrying emote |
| 25,000g | Gold Aura visual effect |
| 50,000g | Title: "Crownforged" |
| 100,000g | Secret boss vault unlock |

---

## 🎁 Progression Systems

### 1. Gamewide Rewards
- First new biome: Explorer's Cache + 50g
- 100 total races: Crown Fuel skin
- 10 hours Story Mode: Title "Lorebound" + 200g
- First major boss: Side story unlock + rare chest
- Own 3+ creatures: Backpack/barn expansion

### 2. Character Progression
| Milestone | Reward |
|-----------|--------|
| Level 5 | Pick passive: +5% Speed / -10% Knockback / +1 Weapon Slot |
| Level 10 | Emote: "Challenge Stance" |
| Class Mastery | Cosmetic set unlock |
| 3 no-item wins | "Purist" title + bonus XP |

### 3. Creature Progression
| Milestone | Reward |
|-----------|--------|
| Level 3 | Saddle upgrade option |
| Level 5 | "Trust Burst" ability |
| 25 wins | Rare breed color variant |
| Feed rare herb | Random passive (+3% resistance) |
| Max XP | Legacy system (pass to new rider) |

### 4. Mode-Specific Rewards
| Mode/Map | Exclusive Reward |
|----------|------------------|
| PvP Arena | Emblems, armor dyes, Crown titles |
| Fire Canyon | Lava Core weapon mod |
| Sand Maze | Compass Trinket (bonus quest gold) |
| Ranked Top 10 | Golden mount trail effect |
| Melee Mode | Unique stances, taunts, finishers |

### 5. Future/Locked Content
- Collect 3 "Unknown Fragments" → Opens future world gate
- Defeat hidden "Crownless" NPC → Unlocks playable version Season 2
- Perfect time in race #7 → Sky Mount shrine access (future patch)
- Store mysterious egg → Hatches next update 👀

---

## 👥 Social & Multiplayer

### Friends & Teams
- Add/accept friend requests
- View online status + mount emotes
- Create duos/squads for quick join
- Tradeable item gifting (capped to rare tier)

### Factions (Biblical Color System)
Six major factions based on Biblical colors and materials:

| Faction | Color | Focus | Primary Metal |
|---------|-------|-------|---------------|
| 🔵 The Watchers | Blue (Tekhelet) | Law, defense, wisdom | Silver |
| 🟣 The Sovereigns | Purple (Argaman) | Leadership, trade, strategy | Bronze |
| 🔴 The Purifiers | Scarlet (Shani) | Combat, sacrifice, fire | Iron |
| ⚪ The Sanctified | White | Healing, light, purity | Silver |
| 🟡 The Anointed | Gold | Crafting, blessings, priests | Gold |
| ⚫ The Penitents | Black (Sackcloth) | Stealth, atonement, shadow | Iron |

Each faction has unique abilities, exclusive materials, and special crafting rules.  
See **Biblical_Materials_and_Factions.md** for complete faction system details.

### Multiplayer Modes
| Mode | Players | Description |
|------|---------|-------------|
| Practice Grounds | Solo/Party | Test mounts, weapons, combos |
| Quick Match | 4-16 | Casual races/PvP |
| Ranked Ladder | 1v1/Team | ELO-based climb |
| Crown Trials | Elite | Invite-only gauntlets |
| Faction Skirmish | 4v4/6v6 | Team objective PvP |

### Ranked Tiers
Iron → Ember → Flame → Riftborn → Crowned

---

## 🛒 Shops & Trading

### NPC Shops
- **Mount Market:** Food, evolution stones, armor
- **Weapon Smith:** Sidearms, upgrades, traps
- **Potion Brewer:** Buffs, antidotes, refills
- **Skin Artisan:** Cosmetics, dyes, auras, banners
- **Black Market Trader:** (Random spawn) Rare gear, forbidden tech

### Player Trading
- Sell: Rare herbs, extra drops, unused weapons, creature gear
- Buy: Missing stones, consumables, uncommon skins
- Trade: Stat modifiers, off-element loot

---

## 🎯 Next Steps for Development

### Phase 1: MVP (Minimum Viable Product)
- 3 playable creature types (Fire, Water, Air)
- 3 character classes
- 1 basic race map
- Basic objective: Finish + collect 3 items
- Light combat/PvP: knockback/stun

### Phase 2: Prototype
- One full race with hazards
- Attack system (5 attacks functional)
- Basic UI mockup
- Test creature bonding mechanics

### Phase 3: Vertical Slice
- Full story mode intro (first 30 mins)
- 1 boss fight with gold drops
- PvP arena test
- Creature leveling system

### Phase 4: Alpha
- 3 biomes
- 6 creatures
- Full attack roster (15 attacks)
- Multiplayer testing

---

## 🧰 Development Tools

**Recommended Engine:** Unity or Godot
- Unity: Better mobile support, huge asset store
- Godot: Open-source, lighter, faster prototyping

**Asset Creation:**
- Free assets for early prototypes
- AI-generated concepts for creatures/maps
- Visual scripting for non-coders

**Prototyping Tools:**
- Tiled Map Editor (race maps)
- Figma/Canva (UI mockups)
- Unity Playground templates

---

## 📝 Notes & Ideas

- Consider seasonal tournaments or boss races
- Add storyline campaign for single-player
- Mount evolution based on player choices
- Magic zones that amplify/negate abilities
- Obstacle perks (right gear = breeze through sections)
- Multiplayer guilds/clans with shared gear

---

**This is a living document. Update as the vision evolves.**

👑🔥🐉
