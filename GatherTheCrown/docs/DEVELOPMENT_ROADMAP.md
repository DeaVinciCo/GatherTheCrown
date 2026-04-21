# DEVELOPMENT ROADMAP
## Gather The Crown: Creats & Foes
**Version:** 0.2.0 | **Last Updated:** April 21, 2026

*This roadmap tracks what is built, what is next, and the order of work. Update this document every time a phase is started or completed.*

---

## CURRENT STATUS AT A GLANCE

| Area | Status |
|------|--------|
| Core Architecture | ✅ Complete |
| Movement System | ✅ Complete |
| Combat (basic) | ✅ Complete |
| Enemy AI | ✅ Complete |
| Creat Lifecycle | ✅ Complete |
| Bond + Sync Systems | ✅ Complete |
| Inventory (both tiers) | ✅ Complete |
| Crown Progression Structure | ✅ Complete |
| Day/Night Cycle | ✅ Complete |
| Checkpoint + Findings Systems | ✅ Complete |
| HUD | ⚠️ Structure only |
| Map Screen | ⚠️ Structure only |
| Boss Encounters (in scene) | ⚠️ Partial |
| Forest Trial Zones (content) | ⚠️ Stub scenes |
| Sound & Music | ❌ Not started |
| Sprite Art | ❌ Not started |
| Multiplayer | ❌ Phase 3 |

---

## PHASE 0 — FOUNDATIONS ✅ COMPLETE
*Completed: April 2026*

All core systems are implemented as Godot Autoloads and are functional.

**Deliverables completed:**
- [x] Project structure + project.godot with all autoloads
- [x] GameState, EventBus, SceneRouter, SaveManager
- [x] InventorySystem + AdvancedInventorySystem
- [x] BondSystem + SyncSystem
- [x] CompanionLifecycle (full state machine)
- [x] CrownProgressionSystem (structure + gem/shard data)
- [x] CheckpointSystem + KingdomFindingsSystem
- [x] RestorationSystem
- [x] DayNightCycle
- [x] Character creation screen
- [x] Boot → CharacterCreation → Game flow
- [x] Movement system (8-directional, direct key press)
- [x] Hitbox/Hurtbox combat architecture
- [x] Enemy AI (7 types, 3 behaviors)
- [x] Boss AI (2 phases, scaling, loot)
- [x] FireCreat companion (follow, attack, sync)
- [x] CompanionCommands (F key toggle)
- [x] Forest Trials Entrance (route selection 1–5)
- [x] Debug diagnostics + spawn reports

---

## PHASE 1 — PLAYABLE MVP VERTICAL SLICE
*Target: May–June 2026*

**Goal:** A complete, polished vertical slice that tells the full game loop from boot to first crown forge. The player should be able to:
1. Create a hero
2. Find an egg, hatch a Creat
3. Fight enemies in at least 2 combat zones
4. Collect enough materials to forge Crown #1
5. See the crown forged

### Phase 1 Tasks (Priority Order)

#### P1.1 — HUD Completion ⚠️
- [ ] Wire hero HP widget to player Health component
- [ ] Wire creat status widget to BondSystem + CompanionLifecycle
- [ ] Wire sync meter widget to SyncSystem
- [ ] Wire attack cooldown widget to player attack timer
- [ ] Connect day/night time display
- [ ] Test all widgets update in real-time during combat
- **Files:** `scripts/ui/hud.gd`, `scripts/ui/hud_state_mapper.gd`, `scripts/ui/widgets/`

#### P1.2 — Forest Trials Zone Content ⚠️
- [ ] Populate ForestTrials_Sproutbound.tscn with 3–4 enemy groups
- [ ] Populate ForestTrials_Emberroot.tscn with 4–5 enemy groups
- [ ] Add rest point at end of each trial route
- [ ] Add material pickup(s) mid-route
- [ ] Test full route run: enter → fight → pickup → exit
- **Files:** `scenes/world/ForestTrials_*.tscn`, `scripts/world/forest_trials_path.gd`

#### P1.3 — Crown Forge Screen ⚠️
- [ ] Display all 10 crowns with requirements
- [ ] Show current player gem/shard inventory
- [ ] Highlight craftable crowns (all materials present)
- [ ] Implement forge button: remove materials, mark crown complete, award GC
- [ ] Crown forged celebration animation (gold flash + text)
- **Files:** `scripts/ui/crown_forge_screen.gd`, `scenes/world/CrownForgeNPC.tscn`

#### P1.4 — Boss Encounter — Embercrown Champion ⚠️
- [ ] Populate WoodedTrail.tscn with boss encounter zone
- [ ] Place fire_boss_001 with correct type data applied
- [ ] Pre-battle prep screen before boss room entry
- [ ] Apply PRECISE_BOSS combat profile on boss zone entry
- [ ] Boss death drops gem_red + shard_silver
- [ ] Post-boss rest point + zone exit
- **Files:** `scenes/world/WoodedTrail.tscn`, `scripts/actors/ai/boss_ai.gd`, `scenes/world/BossPrepSpace.tscn`

#### P1.5 — Map Screen Completion ⚠️
- [ ] Load zone data from zones.json
- [ ] Show discovered zones as clickable pins
- [ ] Show undiscovered zones as fog
- [ ] Enable travel to known zones
- [ ] Mark current zone with player indicator
- **Files:** `scripts/ui/map_manager.gd`, `scripts/ui/map_screen.gd`, `data/zones.json`

#### P1.6 — Greenwood Clearing Full Scene ⚠️
- [ ] Place all NPCs: Crown Forge, Feed Station, Rest Point, Egg Discovery Trigger
- [ ] Make all NPCs interactable with E key
- [ ] Crown Forge NPC opens CrownForgeScreen
- [ ] Feed Station feeds active Creat from inventory
- [ ] Rest Point heals + saves
- [ ] Test full hub loop: arrive → feed → rest → forge → depart
- **Files:** `scenes/world/GreenwoodClearing.tscn`

#### P1.7 — Character Stat System
- [ ] Add strength, agility, defense stats to hero profile
- [ ] Wire stats into damage formula
- [ ] Level-up event (on zone complete or boss kill)
- [ ] Stats visible on character screen
- **Files:** `scripts/core/game_state.gd`, `scripts/actors/player/player.gd`

#### P1.8 — Audio (Basic)
- [ ] Import placeholder SFX: attack swing, hit, death
- [ ] Import placeholder music: hub theme, combat theme, boss theme
- [ ] Wire SFX to combat events (via EventBus signals)
- [ ] Wire music to zone transitions
- **Files:** `assets/audio/`, new `scripts/core/audio_manager.gd`

#### P1.9 — First-Time Experience Polish
- [ ] Tutorial overlay: brief pop-ups for movement, attack, creat
- [ ] First egg discovery scene: camera pan + message
- [ ] First boss encounter intro: brief lore text before fight
- [ ] Crown forged celebration: full-screen announce + fanfare

---

## PHASE 2 — CONTENT EXPANSION
*Target: July–September 2026*

**Goal:** All 10 crowns have defined requirements and sourcing paths. 3 full kingdom zones with distinct biomes. All 5 Creat types implemented. Side quest system live.

### Phase 2 Tasks

#### P2.1 — Remaining Creat Types (4)
- [ ] IceCreat — freeze attack, slow on hit
- [ ] EarthCreat — AoE stomp
- [ ] StormCreat — chain lightning
- [ ] ShadowCreat — debuff + cloak

#### P2.2 — All 10 Crown Requirements Defined
- [ ] Design and document remaining 8 crowns in CONTENT_BIBLE.md
- [ ] Implement requirements in CrownProgressionSystem
- [ ] Assign unique unlock (game mode or zone) per crown

#### P2.3 — New Kingdom Zones (2)
- [ ] Zone 2: Town biome (Clearance + Restoration side quests)
- [ ] Zone 3: Kingdom approach (Castle arc entry)

#### P2.4 — Side Quest System
- [ ] Quest data structure (from quests.ts in shared)
- [ ] Quest giver NPCs in hub and zones
- [ ] Quest tracker UI
- [ ] Reward distribution system

#### P2.5 — Full Crownride Circuit Race
- [ ] Actual race track with Creat mounting mechanic
- [ ] Lap timer + lap count
- [ ] Basic finish line logic
- [ ] Leaderboard (local for now)

#### P2.6 — Clashborn Arena — Wave Mode
- [ ] Wave definition data (wave_01 through wave_10)
- [ ] Enemy spawn by wave with increasing difficulty
- [ ] Wave clear reward: materials and GC
- [ ] Arena unlock logic from Crown progress

#### P2.7 — Key System Activation
- [ ] Trail Key found through gameplay (not just initialized)
- [ ] Town Key + Kingdom Key gated behind story progress
- [ ] Keys visible in keyring display

#### P2.8 — Restoration Full Flow
- [ ] All 3 Greenwood Clearing restoration sites buildable
- [ ] Daily reward delivery system (automatic on zone entry if day has passed)
- [ ] Visual state changes for restored vs unrestored structures

---

## PHASE 3 — POLISH & MULTIPLAYER
*Target: Q4 2026+*

**Goal:** Game is content-complete, polished, and multiplayer-ready.

### Phase 3 Tasks

#### P3.1 — Full Sprite Art
- [ ] Player hero (all 4 looks × 8 directions)
- [ ] All 5 Creat species (idle, walk, attack animations)
- [ ] All 7 enemy types (idle, walk, attack, death)
- [ ] 2 bosses (full animation sets)
- [ ] Zone tilesets (3 biomes)

#### P3.2 — Full Audio
- [ ] Complete music tracks for all zones
- [ ] Complete SFX library
- [ ] Voice barks (grunts, death sounds) for all enemies
- [ ] Creat vocal sounds (different by element)

#### P3.3 — Multiplayer (Colyseus)
- [ ] Lobby Room (party formation, 2–4 players)
- [ ] Story Room (co-op play)
- [ ] Battle Room (1v1 PvP arena)
- [ ] Global leaderboards (Crownride, Arena)
- [ ] Server deploy (packages/server)

#### P3.4 — Mobile Export
- [ ] Godot mobile export configuration
- [ ] Touch input layer for movement + attack
- [ ] UI scaling for phone screens

#### P3.5 — Achievement System
- [ ] 30 achievements (combat, exploration, bond, crowns)
- [ ] Achievement notification pop-up
- [ ] Achievement screen in options menu

#### P3.6 — Accessibility
- [ ] Colorblind mode (alternative color palettes)
- [ ] Font size scaling
- [ ] Input rebinding
- [ ] Screen shake toggle

---

## TECHNICAL DEBT BACKLOG

Issues to resolve, not blocking but should be addressed:

| Issue | Priority | Notes |
|-------|----------|-------|
| Key "1" creat spawn in CrownrideCircuit | Low | Feature deferred |
| AdvancedInventorySystem add/remove refinement | Medium | Item stack limits may need testing |
| RestorationSystem data loading from JSON | Medium | Currently hardcoded defaults |
| MapManager zone data loading | Medium | Needs zones.json integration |
| Boss scene population (beyond WoodedTrail) | Phase 2 | |
| CrownProgressionSystem collectible tracking | Medium | Register_collectible flow needs validation |
| enemy_ai.gd `die()` emits boss_defeated | Low | Should only be in boss_ai.gd |
| ShadowCreat, IceCreat scene paths (placeholders) | Phase 2 | All point to FireCreat.tscn |
| HUD crown_forge_screen stub | Phase 1.3 | |
| pre_battle_prep_screen stub | Phase 1.4 | |

---

## VERSION HISTORY

| Version | Date | Summary |
|---------|------|---------|
| 0.1.0 | April 2026 | Initial project — all core systems built, MVP playable slice |
| 0.1.1 | April 21, 2026 | Movement fix (diagonal-only bug), enemy debug diagnostics, documentation overhaul |
| 0.2.0 | April 21, 2026 | Comprehensive design documentation created (GDD, Systems, Content Bible, Art Guide, Roadmap) |

---

## MILESTONE CRITERIA

### "MVP Playable" (Phase 1 complete) — Definition
- [ ] Player can boot → create hero → find egg → hatch creat → enter forest trial → fight enemies → collect materials → forge first crown
- [ ] All HUD elements display correct live data
- [ ] At least 2 combat zones fully populated
- [ ] Boss fight (Embercrown Champion) fully functional
- [ ] Basic audio: SFX for combat, placeholder music per zone
- [ ] No blocking bugs (game crashes = 0 during core loop)

### "Content Complete" (Phase 2 complete) — Definition
- [ ] All 10 crowns have defined requirements and forge paths
- [ ] All 5 Creat types implemented
- [ ] 3 full kingdom zones playable
- [ ] Side quest system live with ≥10 quests
- [ ] Arena wave mode playable

### "Shippable" (Phase 3 complete) — Definition
- [ ] Full sprite art for all characters
- [ ] Full audio (music + SFX)
- [ ] Multiplayer (lobby + co-op)
- [ ] Performance: stable 60 FPS on mid-tier PC
- [ ] Zero critical bugs in core loop
