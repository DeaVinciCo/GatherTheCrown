# CONTENT BIBLE
## Gather The Crown: Creats & Foes — Complete Content Reference
**Version:** 0.2.0 | **Last Updated:** April 21, 2026

*This document is the authoritative reference for all in-game content: enemies, bosses, creats, crowns, gems, shards, items, zones, and NPCs. Any new content must be added here first, then implemented in code.*

---

## TABLE OF CONTENTS

1. [Enemies](#1-enemies)
2. [Bosses](#2-bosses)
3. [Creats (Companions)](#3-creats-companions)
4. [Crown System — Full Reference](#4-crown-system--full-reference)
5. [Gems](#5-gems)
6. [Metal Shards](#6-metal-shards)
7. [Items & Materials](#7-items--materials)
8. [Zones — Full Reference](#8-zones--full-reference)
9. [NPCs & Interactables](#9-npcs--interactables)
10. [Kingdom Findings](#10-kingdom-findings)
11. [Side Quests](#11-side-quests)

---

## 1. ENEMIES

### Enemy Taxonomy
- **Combat Class:** `scout` (fast/fragile), `raider` (balanced), `knight` (slow/tough)
- **Behavior:** `ground_chase`, `ground_patrol`, `flying`
- **Type IDs** are used in code — lore names are display only

### Enemy Roster

#### Goblin Scout
| Field | Value |
|-------|-------|
| **Type ID** | `goblin_scout` |
| **Lore Name** | Bramble Scavenger |
| **Combat Class** | Scout |
| **Behavior** | ground_chase |
| **Visual Color** | Green (0.2, 0.8, 0.2) |
| **HP** | Low (~30) |
| **Speed** | Fast (140) |
| **Chase Range** | 320px |
| **Attack Range** | 60px |
| **Attack Cooldown** | 1.5s |
| **GC Reward** | 10–25 |
| **Drop Weight** | 40% (most common) |
| **Loot** | embersteel_fragment |
| **Lore** | Scavengers of the broken forest paths. Cowardly alone, dangerous in packs. |

#### Forest Bat
| Field | Value |
|-------|-------|
| **Type ID** | `forest_bat` |
| **Lore Name** | Dusk Shriek |
| **Combat Class** | Scout |
| **Behavior** | flying |
| **Visual Color** | Purple (0.5, 0.0, 0.8) |
| **HP** | Low (~25) |
| **Speed** | Fast (130) |
| **Drop Weight** | 25% |
| **Loot** | embersteel_fragment (rare) |
| **Lore** | Nocturnal flyers that grow bolder in broken moonlight. |

#### Cave Bat
| Field | Value |
|-------|-------|
| **Type ID** | `cave_bat` |
| **Lore Name** | Ironwing |
| **Combat Class** | Scout |
| **Behavior** | flying |
| **Visual Color** | Purple (0.5, 0.0, 0.8) |
| **HP** | Low (~20) |
| **Speed** | Medium (110) |
| **Drop Weight** | 15% |
| **Loot** | dreadsteel_fragment |
| **Lore** | Cave-dwelling bats with hardened wing spines. Found near old mine shafts. |

#### Bandit Rogue
| Field | Value |
|-------|-------|
| **Type ID** | `bandit_rogue` |
| **Lore Name** | Ashwood Cutthroat |
| **Combat Class** | Raider |
| **Behavior** | ground_chase |
| **Visual Color** | Crimson (0.9, 0.2, 0.2) |
| **HP** | Medium (~60) |
| **Speed** | Medium (110) |
| **Drop Weight** | 20% |
| **Loot** | embersteel_fragment, moonsteel_fragment (rare) |
| **Lore** | Desperate outlaws who prey on travelers in the broken kingdom. |

#### Orc Warrior
| Field | Value |
|-------|-------|
| **Type ID** | `orc_warrior` |
| **Lore Name** | Thornback Brawler |
| **Combat Class** | Raider |
| **Behavior** | ground_chase |
| **Visual Color** | Olive (0.4, 0.6, 0.1) |
| **HP** | High (~100) |
| **Speed** | Slow (80) |
| **Drop Weight** | — (boss/elite only) |
| **Loot** | embersteel_fragment ×2, chance at moonsteel_fragment |
| **Lore** | Heavy-set marauders with thorn-covered backs. Slow but devastating in melee. |

#### Skeleton Guard
| Field | Value |
|-------|-------|
| **Type ID** | `skeleton_guard` |
| **Lore Name** | Bonewarden |
| **Combat Class** | Knight |
| **Behavior** | ground_patrol |
| **Visual Color** | Bone (0.9, 0.9, 0.8) |
| **HP** | High (~90) |
| **Speed** | Slow (70) |
| **Drop Weight** | — (dungeon/castle only) |
| **Loot** | dreadsteel_fragment ×2 |
| **Lore** | Animated remains of the old kingdom's guard. They still patrol their last-given posts. |

#### Crown Knight
| Field | Value |
|-------|-------|
| **Type ID** | `crown_knight` |
| **Lore Name** | Shattered Sworn |
| **Combat Class** | Knight |
| **Behavior** | ground_chase |
| **Visual Color** | Gold (1.0, 0.8, 0.0) |
| **HP** | High (~120) |
| **Speed** | Medium (100) |
| **Drop Weight** | — (late game only) |
| **Loot** | moonsteel_fragment, chance at aurorite_fragment |
| **Lore** | Former crown guardians, now twisted by corrupted metal. Their armor still gleams. |

---

## 2. BOSSES

### Boss Scaling Formula
```
HP      = base_hp × (1 + (level - 1) × 0.45)
Speed   = base_speed + (level - 1) × 5
Damage  = base_damage + (level - 1) × 4
Cooldown = base_cooldown - (level - 1) × 0.1 (minimum 0.5)
Telegraph = telegraph_time - (level × 0.05)
```

### Boss Tier Table
| Tier | Level Range | HP Multiplier | Bixbite Reward |
|------|-------------|---------------|----------------|
| T1 | 1 | 1.0× | 0 |
| T2 | 2 | 1.45× | 2 |
| T3 | 3 | 1.9× | 4 |
| T4 | 4 | 2.35× | 6 |
| T5 | 5 | 2.8× | 8 |

### Embercrown Champion (fire_boss_001)
| Field | Value |
|-------|-------|
| **Boss ID** | `fire_boss_001` |
| **Lore Name** | Embercrown Champion |
| **Element** | Fire |
| **Zone** | Wooded Trail |
| **Level** | 10 (recommended) |
| **Phase 1 Damage** | 12 base |
| **Phase 2 Damage** | 18 base |
| **Phase 2 Trigger** | 50% HP |
| **Phase 2 Changes** | Speed → 150, Cooldown → 2.0s |
| **Telegraph** | Turns red for 1.0s before attacking |
| **Gem Drop** | gem_red (Dragonheart Ruby) |
| **Shard Drop** | shard_silver (Moonsteel) |
| **GC Reward** | 35,000 × level |
| **Bixbite Reward** | 2 × (level - 1) |
| **Lore** | Once a noble champion who wore a crown of living ember. Now the corruption has made the fire turn inward. |

*Note: Future bosses follow same boss_ai.gd pattern. Add gem drop via `_gem_for_element(element)` mapping.*

---

## 3. CREATS (COMPANIONS)

### Creat Design Rules
1. Each Creat matches one element
2. Creat attacks scale with bond (0% → 1% bond)
3. Only one Creat active at a time
4. Creat can be commanded: Follow / Attack / Defensive

### FireCreat (Implemented)
| Field | Value |
|-------|-------|
| **Type ID** | `fire_creat` |
| **Element** | Fire |
| **Scene** | `scenes/actors/companion/FireCreat.tscn` |
| **Visual** | Orange flame body (Polygon2D) |
| **Follow Distance** | 50px |
| **Movement Speed** | 180 |
| **Attack Range** | 100px |
| **Attack Cooldown** | 2.0s |
| **Base Damage** | 8 |
| **Max Damage** | 12 (at 100% bond) |
| **Synced Damage** | ×2 multiplier |
| **Sync Gain per Hit** | +3 |
| **Special** | Fire burst projectile (visual placeholder) |
| **Lore** | A small flame-spirit hatched from an ember egg. Fierce but loyal — it fights harder the closer your bond grows. |

### IceCreat (Planned)
| Field | Value |
|-------|-------|
| **Type ID** | `ice_creat` |
| **Element** | Ice |
| **Scene** | `scenes/actors/companion/IceCreat.tscn` (not built) |
| **Visual** | Blue crystal body |
| **Planned Attack** | Ice bolt that slows enemies |
| **Special** | Freeze effect on sync attack |
| **Lore** | Born from a glacier egg. Its attacks chill the air and slow those they touch. |

### EarthCreat (Planned)
| Field | Value |
|-------|-------|
| **Type ID** | `earth_creat` |
| **Element** | Earth |
| **Scene** | `scenes/actors/companion/EarthCreat.tscn` (not built) |
| **Planned Attack** | AoE stomp (medium area, high damage) |
| **Special** | Roots enemies during sync |
| **Lore** | Hatched from a stone egg deep in the forest. Its footsteps shake the ground. |

### StormCreat (Planned)
| Field | Value |
|-------|-------|
| **Type ID** | `storm_creat` |
| **Element** | Storm |
| **Scene** | `scenes/actors/companion/StormCreat.tscn` (not built) |
| **Planned Attack** | Chain lightning (hits 2–3 enemies) |
| **Special** | EMP burst during sync (disables enemy attacks briefly) |
| **Lore** | Electric and erratic — a storm creat's attacks rarely miss if its bond is strong. |

### ShadowCreat (Planned)
| Field | Value |
|-------|-------|
| **Type ID** | `shadow_creat` |
| **Element** | Shadow |
| **Scene** | `scenes/actors/companion/ShadowCreat.tscn` (not built) |
| **Planned Attack** | Debuff strike (reduces enemy damage) |
| **Special** | Cloaks player for 2s during sync |
| **Lore** | Shadow creats are rare, silent, and unsettling to enemies. Their bond is forged in silence. |

---

## 4. CROWN SYSTEM — FULL REFERENCE

### What Is a Crown?
Each Crown is a forged artifact proving mastery of a game mode. Forging requires collecting specific Gems and Metal Shards from combat, exploration, and special events.

### Crown Forging Requirements

#### crown_story_sovereign — Story Sovereign
| Requirement | Quantity |
|-------------|----------|
| Starforged (shard_runic) | ×2 |
| Aurorite (shard_gold) | ×2 |
| Storm Quartz (gem_clear) | ×2 |
| Nightfall Painite (gem_black) | ×1 |
| Void Amethyst (gem_purple) | ×1 |
| **GC Reward** | **1,200,000** |
| **Bixbite Reward** | **35** |
| **Unlock** | Endgame story zone |

#### crown_melee_duelist — Melee Duelist
| Requirement | Source |
|-------------|--------|
| TBD — Combat mastery materials | Clashborn Arena |
| **GC Reward** | TBD |
| **Unlock** | Advanced arena tier |

#### crown_race_torque — Race Torque
| Requirement | Source |
|-------------|--------|
| TBD — Racing materials | Crownride Circuit top times |
| **Unlock** | Elite race track |

#### crown_minigame_tactician — Minigame Tactician
| Requirement | Source |
|-------------|--------|
| TBD | Crown Trials completion |
| **Unlock** | Bonus challenge modes |

#### crown_pve_warden — PvE Warden
| Requirement | Source |
|-------------|--------|
| TBD — Arena clear materials | Wave 10+ completions |
| **Unlock** | Endless arena mode |

#### crown_pvp_conqueror — PvP Conqueror
| Requirement | Source |
|-------------|--------|
| TBD — PvP ranking rewards | Ranked 1v1 wins |
| **Unlock** | PvP tournament access |

#### crown_sidequest_seeker — Sidequest Seeker
| Requirement | Source |
|-------------|--------|
| TBD — Quest completion materials | All side quest chains |
| **Unlock** | Secret questline |

#### crown_finding_scavenger — Finding Scavenger
| Requirement | Source |
|-------------|--------|
| TBD — Kingdom findings | All 30 findings discovered + delivered |
| **Unlock** | Kingdom restoration completion |

#### crown_meta_seven_realms — Seven Realms
| Requirement | Source |
|-------------|--------|
| All 9 other crowns forged | Every game mode |
| **GC Reward** | Ultimate (TBD) |
| **Unlock** | Final endgame area + title |

---

## 5. GEMS

Gems are rare elemental crystals found in boss drops, special chests, and Crown Trials. Each has a canonical ID and multiple lore aliases.

| Gem ID | Lore Name | Element | Tier | GC Value | Aliases |
|--------|-----------|---------|------|----------|---------|
| gem_blue | Abyss Sapphire | Water / Shadow | 3 | High | gem_sapphire |
| gem_red | Dragonheart Ruby | Fire | 3 | High | gem_ruby |
| gem_yellow | Solar Topaz | Light / Storm | 2 | Medium | gem_topaz |
| gem_green | Verdant Alexandrite | Earth | 2 | Medium | gem_alexandrite |
| gem_clear | Storm Quartz | Storm | 2 | Medium | gem_quartz, gem_storm |
| gem_purple | Void Amethyst | Shadow | 3 | High | gem_amethyst |
| gem_black | Nightfall Painite | Shadow / Dark | 4 | Very High | gem_painite, gem_dark |

### Gem Sources
| Source | Gem Drop Chance |
|--------|----------------|
| Boss kill (matching element) | Guaranteed |
| Boss kill (off-element) | 30% |
| Crown Trial chest | 100% |
| World treasure chest | 15% |
| Kingdom milestone reward | 1× specific gem |

---

## 6. METAL SHARDS

Metal Shards are refined material pieces used in Crown forging. They drop from enemies and bosses.

| Shard ID | Lore Name | Tier | GC Value | Primary Source | Aliases |
|----------|-----------|------|----------|---------------|---------|
| shard_iron | Dreadsteel Fragment | 1 | Low | Cave enemies, bats | dreadsteel_fragment |
| shard_bronze | Embersteel Fragment | 2 | Low | Goblin scouts, forest enemies | embersteel_fragment |
| shard_silver | Moonsteel Fragment | 3 | Medium | Boss drops T1-2, bandit rogues | moonsteel_fragment |
| shard_gold | Aurorite Fragment | 4 | High | Boss drops T2-3 | aurorite_fragment |
| shard_obsidian | Osmium Shard | 5 | High | Rare world spawns, skeleton drops | osmium_shard |
| shard_crystal | Aethersteel Shard | 6 | Very High | Restoration site rewards | aethersteel_shard |
| shard_runic | Starforged Metal | 7 | Extremely High | Crown Trials only | starforged_shard |

---

## 7. ITEMS & MATERIALS

### Food & Provisions
| Item ID | Display Name | Stack | Source | Effect |
|---------|-------------|-------|--------|--------|
| food_basic | Dry Rations | 20 | Starting inventory | +5 energy |
| herb_mild | Mild Herb | 30 | Greenwood Clearing | +3 HP regen |
| ember_fruit | Ember Fruit | 20 | Restoration site daily | +10 HP |
| bread | Travelers Bread | 20 | Town shops | +8 HP |
| apple | Wild Apple | 30 | Forest gathering | +4 HP |

### Creat Food
| Item ID | Display Name | Feed Value | Bond Bonus |
|---------|-------------|------------|------------|
| food_basic | Dry Rations | 20 | +0.05 bond |
| ember_fruit | Ember Fruit | 35 | +0.08 bond |
| herb_mild | Mild Herb | 15 | +0.03 bond |

### Potions
| Item ID | Display Name | Stack | Effect |
|---------|-------------|-------|--------|
| potion_health_small | Minor Health Potion | 10 | +30 HP |
| potion_health_large | Major Health Potion | 5 | +80 HP |
| potion_sync | Sync Elixir | 5 | +50 sync meter |

### Keys (Keyring — not inventory)
| Key ID | Name | Use |
|--------|------|-----|
| trail_key | Trail Key | Unlock Forest Trial routes |
| town_key | Town Key | Enter town areas |
| kingdom_key | Kingdom Key | Enter kingdom zones |

### Essences (Restoration Materials)
| Item ID | Display Name | Source | Use |
|---------|-------------|--------|-----|
| essence_water | Water Essence | MaterialGatherPoint | Restoration sites |
| essence_fire | Fire Essence | WoodedTrail gathering | Restoration sites |
| essence_earth | Earth Essence | Forest gathering | Restoration sites |

---

## 8. ZONES — FULL REFERENCE

### Greenwood Clearing (Home Hub)
| Field | Value |
|-------|-------|
| **Zone ID** | `greenwood_clearing` |
| **Scene** | `GreenwoodClearing.tscn` |
| **Type** | `forest_hub` |
| **Level Range** | 1–5 |
| **Biome** | Forest |
| **Creat Density** | Fire 30%, Earth 40%, Water 20% |
| **Resources** | embersteel_fragment ×5, herb_mild ×3 |
| **Landmarks** | crown_forge_01, bond_shrine_01 |
| **Restoration Sites** | 3 (Ancient Grove first) |
| **Music** | Peaceful forest ambient (TBD) |
| **Lore** | The last safe clearing in the fractured forest. The Crown Forge still stands, waiting for a hero worthy enough to use it. |

### Wooded Trail
| Field | Value |
|-------|-------|
| **Zone ID** | `wooded_trail` |
| **Scene** | `WoodedTrail.tscn` |
| **Type** | `combat_zone` |
| **Level Range** | 5–15 |
| **Biome** | Dark Forest |
| **Boss** | fire_boss_001 (Embercrown Champion, recommended level 10) |
| **Resources** | embersteel_fragment ×10, essence_fire ×2 |
| **Music** | Tense exploration (TBD) |
| **Lore** | A once-peaceful trail now thick with corrupted creatures. The Embercrown Champion lurks at its heart. |

### Forest Trials Entrance
| Field | Value |
|-------|-------|
| **Zone ID** | `forest_trials_entrance` |
| **Scene** | `ForestTrialsEntrance.tscn` |
| **Type** | `hub` |
| **Level Range** | Any |
| **Route Selection** | Keys 1–5 select route, ESC returns home |
| **Creat Integration** | If creat hatches while in entrance, auto-routes home |

### Forest Trials — Sproutbound
| Field | Value |
|-------|-------|
| **Zone ID** | `forest_trials_sproutbound` |
| **Type** | `combat_zone` |
| **Duration** | 6–9 min |
| **Encounters** | 3–4 (goblin_scout, forest_bat) |
| **Level Range** | 1–5 |
| **Loot Focus** | embersteel_fragment |

### Forest Trials — Emberroot
| Field | Value |
|-------|-------|
| **Zone ID** | `forest_trials_emberroot` |
| **Type** | `combat_zone` |
| **Duration** | 10–14 min |
| **Encounters** | 4–5 (bandit_rogue, cave_bat, goblin_scout) |
| **Level Range** | 5–10 |
| **Loot Focus** | moonsteel_fragment, embersteel_fragment |

### Forest Trials — Crownfire
| Field | Value |
|-------|-------|
| **Zone ID** | `forest_trials_crownfire` |
| **Type** | `combat_zone` |
| **Duration** | 14–18 min |
| **Encounters** | 6 (orc_warrior, bandit_rogue, skeleton_guard) |
| **Level Range** | 10–15 |
| **Loot Focus** | moonsteel_fragment, rare gem chance |

### Crownride Circuit
| Field | Value |
|-------|-------|
| **Zone ID** | `crownride_circuit` |
| **Scene** | `CrownrideCircuit.tscn` |
| **Type** | `racing_zone` |
| **Enemy Spawns** | 8 enemies (goblin_scout 40%, forest_bat 25%, cave_bat 15%, bandit_rogue 20%) |
| **Level Range** | Any |
| **Leaderboard** | Global, ranked |
| **Crown** | crown_race_torque |

### Restoration Site 01 (Ancient Grove)
| Field | Value |
|-------|-------|
| **Zone ID** | `restoration_site_01` |
| **Scene** | `RestorationSite_01.tscn` |
| **Type** | `restoration_site` |
| **Level Range** | 3–8 |
| **Default State** | unrestored |
| **Restoration Duration** | 5 seconds |
| **Daily Reward** | ember_fruit ×3 |
| **Lore** | An ancient grove where a bond shrine once stood. Restoring it will draw creats back to the area. |

### Clashborn Arena
| Field | Value |
|-------|-------|
| **Zone ID** | `clashborn_arena` |
| **Type** | `arena` |
| **Level Range** | Any |
| **Modes** | Wave combat (PvE), 1v1 duel (PvP) |
| **Crown** | crown_pve_warden, crown_pvp_conqueror |
| **Status** | Stub |

### Crown Trials
| Field | Value |
|-------|-------|
| **Zone ID** | `crown_trials` |
| **Type** | `crown_trial` |
| **Level Range** | Any |
| **Purpose** | Challenge rooms for each crown |
| **Unique Loot** | shard_runic (Starforged — only source) |
| **Status** | Stub |

---

## 9. NPCS & INTERACTABLES

### Crown Forge NPC
| Field | Value |
|-------|-------|
| **Scene** | `CrownForgeNPC.tscn` |
| **Location** | Greenwood Clearing |
| **Function** | Opens CrownForgeScreen, enables crown forging |
| **Dialogue** | TBD |
| **Lore** | The last CrownSmith — a forge-master who remembers the kingdom before the fracture. |

### Feed Station
| Field | Value |
|-------|-------|
| **Scene** | `FeedStation.tscn` |
| **Location** | Greenwood Clearing |
| **Function** | Feed active Creat (reduce hunger, increase bond) |
| **Uses food from** | InventorySystem (food_basic, ember_fruit, etc.) |

### Rest Point
| Field | Value |
|-------|-------|
| **Scene** | `RestPoint.tscn` |
| **Location** | Greenwood Clearing, end of trial routes |
| **Function** | Heal player HP to max, create manual save, restore checkpoint |
| **Interactions** | E to interact → full heal + save |

### Material Gather Point
| Field | Value |
|-------|-------|
| **Scene** | `MaterialGatherPoint.tscn` |
| **Location** | Various zones |
| **Function** | Gather 1× of specified material per interact |
| **Reset** | On zone reload (configurable) |

### Egg Discovery Trigger
| Field | Value |
|-------|-------|
| **Scene** | `EggDiscoveryTrigger.tscn` |
| **Location** | Greenwood Clearing (first time) + hidden in world |
| **Function** | Opens element picker → calls CompanionLifecycle.acquire_egg() |
| **One-time** | Yes — trigger removes itself after use |

### Town NPCs (Kingdom Findings Recipients)
| NPC ID | Name | Finding They Need |
|--------|------|------------------|
| innkeeper | Innkeeper | Lamp Oil (town_lamp_oil) |
| shopkeeper | Shopkeeper | Window Glass (town_window_glass) |
| carpenter | Carpenter | Door Hinges (town_door_hinges) |
| weaver | Weaver | Cloth Bolts (town_cloth_bolts) |
| healer | Healer | Medicine Kit (town_medicine_kit) |
| tavern | Tavern | Kitchen Supplies (town_kitchen_supplies) |
| builder | Builder | Timber Beams (town_timber_beams) |

### Kingdom Officials (Royal Findings Recipients)
| NPC ID | Name | Finding They Need | Value |
|--------|------|------------------|-------|
| gate_keeper | Gate Keeper | Kingdom Gate Key | 40 |
| mage_council | Mage Council | Ward Stones | 35 |
| architect_chief | Architect Chief | Light Core | 50 |

---

## 10. KINGDOM FINDINGS

Kingdom Findings are world-discovered items that can be delivered to NPCs to restore the kingdom. Three categories: Rider (personal), Town (community), Kingdom (royalty).

### Rider Findings (Personal Survival)
| Finding ID | Display Name | Key Type | Description |
|------------|-------------|----------|-------------|
| rider_food_cache | Dried Rations Cache | Trail | Emergency food stores for travelers |
| rider_potion_kit | Field Potion Kit | Trail | Healing supplies for the road |
| rider_craft_blueprint | Craft Blueprint | Trail | Techniques for wilderness crafting |
| rider_treasure_map | Treasure Map | Trail | A map marking hidden valuables |
| rider_lore_scroll | Ancient Lore Scroll | Trail | Records of the kingdom's history |

### Town Findings (Community Restoration)
| Finding ID | Display Name | NPC Request | Key Type | Description |
|------------|-------------|-------------|----------|-------------|
| town_lamp_oil | Lamp Oil | Innkeeper | Town | Oil for lanterns and streetlights |
| town_window_glass | Window Glass | Shopkeeper | Town | Panes to replace broken storefronts |
| town_door_hinges | Door Hinges | Carpenter | Town | Iron hinges for repairing town gates |
| town_cloth_bolts | Cloth Bolts | Weaver | Town | Fabric for making clothes and banners |
| town_medicine_kit | Medicine Kit | Healer | Town | Supplies for treating the injured |
| town_kitchen_supplies | Kitchen Supplies | Tavern | Town | Tools and provisions for the kitchen |
| town_timber_beams | Timber Beams | Builder | Town | Structural wood for reconstruction |

### Kingdom Findings (Royal Restoration)
| Finding ID | Display Name | NPC Request | Key Type | Restore Value | Description |
|------------|-------------|-------------|----------|---------------|-------------|
| kingdom_gate_key | Kingdom Gate Key | Gate Keeper | Kingdom | 40 | The master key to the kingdom's outer gate |
| kingdom_ward_stones | Ward Stones | Mage Council | Kingdom | 35 | Enchanted stones to restore magical wards |
| kingdom_light_core | Light Core | Architect Chief | Kingdom | 50 | The magical light source for the throne hall |

### Total Kingdom Restoration Value
When all Kingdom findings are delivered: **125 restoration value**

---

## 11. SIDE QUESTS

*Side quest content is Phase 2. Structure defined, actual quests TBD.*

### Quest Tiers
| Tier | Color Code | Type | Reward Tier |
|------|-----------|------|------------|
| Finder | Amber | Fetch/Discover | Low (GC + item) |
| Clearance | Emerald | Kill enemies | Medium (GC + shard) |
| Restoration | Crimson | Rebuild structures | High (GC + gem) |
| Royal Arc | Gold | Story-critical | Gem + bixbite + crown progress |

### Planned Quest Examples

**Finder: The Missing Supply Run**
- Objective: Find rider_food_cache in the wooded trail
- Reward: 500 GC, herb_mild ×5
- Giver: Rider NPC at trail entrance

**Clearance: Bandit Problem**
- Objective: Defeat 5 bandit_rogue enemies
- Reward: 1500 GC, moonsteel_fragment ×1
- Giver: Carpenter (blocked from town entry)

**Restoration: Ancient Grove Repair**
- Objective: Restore restoration_site_01
- Reward: 2000 GC, gem_green chance
- Giver: Crown Forge NPC

**Royal Arc: Return of the Ward**
- Objective: Deliver kingdom_ward_stones to mage_council
- Reward: gem_clear, bixbite ×2, Crown progress
- Giver: Crown forge NPC + automatically triggers on finding discovery

---

*Content Bible is the authoritative reference. All content added to the game must first be documented here. This ensures the game remains consistent and developers know what exists before building.*
