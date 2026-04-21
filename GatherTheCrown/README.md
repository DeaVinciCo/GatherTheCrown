# Gather The Crown - Godot 4.x MVP

**⚡ Last Updated:** April 21, 2026 - Movement fixes & comprehensive documentation update  
**📖 Start Here:** [QUICKSTART.md](QUICKSTART.md) for current gameplay guide  
**📋 Recent Changes:** See [CHANGES_APRIL_21_2026.md](../CHANGES_APRIL_21_2026.md)

A vertical-slice RPG in Godot 4.x featuring elemental bonds, crown crafting, and turn-based combat.

## Design Inspiration

Art direction and world-building draw from **Biblical and Ethiopian heritage**:

- **Colors** — Based on pigments named in the Cepher/Hebrew scriptures: *tekhelet* (royal blue), *argaman* (purple), *tola'at shani* (crimson), gold, and white linen. Ethiopian illuminated manuscript palettes (ochre, earthen red, turquoise) guide the tileset and UI color choices.
- **Fabrics & Textures** — Crown and character designs reference the priestly garments described in the Torah and the imperial regalia of the *Kebra Nagast* (Ethiopian royal epic). Fine linen, embroidered gold borders, and woven patterns are key motifs.
- **Architecture** — Zones reference Solomonic temple proportions, Lalibela rock-hewn church layouts, and highland Ethiopian *gojjo* round-house forms.
- **Naming** — Boss and zone names draw on Hebrew, Ge'ez, and Amharic roots.

These references should remain specific and intentional — not generic fantasy — as the project grows.

## Project Structure

```
GatherTheCrown/
├── project.godot           # Godot project config
├── scenes/                 # All .tscn scene files
│   ├── bootstrap/
│   │   └── Boot.tscn      # Entry point
│   ├── world/
│   │   ├── GreenwoodClearing.tscn  # Home base
│   │   └── WoodedTrail.tscn        # Combat zone
│   ├── actors/
│   │   ├── player/
│   │   │   └── Player.tscn
│   │   ├── companion/
│   │   │   └── FireCreat.tscn
│   │   └── enemies/
│   │       ├── Enemy.tscn
│   │       └── Boss.tscn
│   └── ui/
│       └── HUD.tscn
├── scripts/                # All .gd script files
│   ├── bootstrap/
│   │   └── boot.gd
│   ├── core/              # Autoloads
│   │   ├── event_bus.gd
│   │   ├── game_state.gd
│   │   ├── scene_router.gd
│   │   └── save_manager.gd
│   ├── world/
│   │   ├── greenwood_clearing.gd
│   │   └── wooded_trail.gd
│   ├── actors/
│   │   ├── character_motor_2d.gd
│   │   ├── player/
│   │   │   └── player.gd
│   │   ├── companion/
│   │   │   └── fire_creat.gd
│   │   └── ai/
│   │       ├── enemy_ai.gd
│   │       └── boss_ai.gd
│   ├── combat/
│   │   ├── health.gd
│   │   ├── hurtbox.gd
│   │   ├── hitbox.gd
│   │   └── combat_engine.gd
│   ├── systems/
│   │   ├── bond_system.gd
│   │   ├── sync_system.gd
│   │   ├── inventory_system.gd
│   │   └── crafting/
│   │       └── crown_forge_system.gd
│   └── ui/
│       ├── hud.gd
│       ├── crown_forge_screen.gd
│       └── pre_battle_prep_screen.gd
├── data/
│   ├── resources/        # .tres data assets (stub for expansion)
│   └── databases/
├── assets/               # Art and audio (empty - ready for content)
└── tests/               # Unit tests (stub for expansion)
```

## Core Systems

### 1. Event Bus (EventBus.gd)
Centralized signal system for decoupled communication between systems.

**Key Signals:**
- `damage_dealt` - Combat event
- `bond_changed` - Creat affection update
- `sync_meter_changed` - Sync progress
- `zone_changed` - Scene transitions
- `boss_started/boss_defeated` - Boss encounters

### 2. Game State (GameState.gd)
Global game data persistence across scenes.

**Tracks:**
- Player stats (HP, energy)
- Companion stats (hunger, bond level)
- Selected crown
- Flags (tutorial complete, boss defeats)
- Boss cooldowns

### 3. Scene Router (SceneRouter.gd)
Manages scene transitions and UI layer management.

**Methods:**
- `go_to_zone(scene_path)` - Load world scene
- `open_screen(ui_scene_path)` - Layer UI on top
- `close_screen(screen_node)` - Remove UI layer

### 4. Bond System (BondSystem.gd)
Manages Creat affection and hunger mechanics.

**Mechanics:**
- Bond: 0.0 to 1.0 (0% to 100%)
- Hunger: 0 to 100
- Feeding creat increases bond by 0.05
- High bond unlocks better companion AI

### 5. Sync System (SyncSystem.gd)
Manages Sync meter and Sync mode activation.

**Mechanics:**
- Sync meter: 0 to 100 (increases on hits)
- Activate at 80+ meter (costs all meter)
- Active for 10 seconds
- Bonuses:
  - Damage: 1.5x multiplier
  - Speed: 1.3x multiplier
  - Creat attack rate: 2.0x

### 6. Inventory System (InventorySystem.gd)
Tracks all items and resources.

**Starting Items:**
- 5x food_basic
- 10x metal_fragment_bronze

### 7. Combat Engine (CombatEngine.gd)
Unified combat rules and profiles.

**Profiles:**
- **Fast Forgiving**: Friendly hitboxes, high aim assist (regular enemies)
- **Precise Boss**: Strict timing, low aim assist (boss only)

### 8. Health & Hurtbox/Hitbox System
Classic damage-dealing system:

- **Health**: Tracks HP, emits `died` signal when HP <= 0
- **Hurtbox**: Area2D that receives damage
- **Hitbox**: Area2D that deals damage on overlap

## Gameplay Features (MVP)

### Player
- 8-directional movement (WASD)
- Sword attacks (Space)
- Feed companion (F)
- Activate Sync mode (Shift)

### Fire Creat Companion
- Follows player within 50 pixels
- Auto-attacks nearby enemies
- Gains bond/sync from fighting
- Displays hunger/bond on HUD

### Combat
- Player deals 15 damage per attack
- Creat deals 8 damage per attack
- Regular enemies: 30 HP, deal 5 damage
- Boss: 100 HP (phase 2 at 50%), deals 12-18 damage
- Boss telegraphs attacks 1 second before hitting

### Sync Mode
- Gain 5 sync on player attack, 3 on creat attack
- Cost: 80+ meter to activate
- Duration: 10 seconds
- Effect: 1.5x damage, 1.3x speed for all allies

### Zones
- **GreenwoodClearing**: Home base (safe)
- **WoodedTrail**: Combat zone (3 regular enemies + 1 boss)

### UI
- Health bar (top-left)
- Bond meter (top-left)
- Hunger bar (top-left)
- Sync meter (top-left)
- Inventory display (top-left)
- Control hints (bottom-center)

## How to Play

1. **Run the project** in Godot 4.x
2. **Move** with WASD
3. **Attack** with Space (8-directional)
4. **Feed** companion with F (costs food, gains bond)
5. **Activate Sync** with Shift (costs 80 sync meter)
6. **Navigate** with E (exit zones, open doors)

### First Run
- Start at GreenwoodClearing (safe)
- Press E at exit marker to go to WoodedTrail
- Defeat enemies and the boss
- Press E to return home

## Next Steps (Post-MVP)

1. **Art & Animation**
   - Replace placeholder circles with sprites
   - Add attack animations
   - Add idle/walk cycles
   - Add VFX (hit sparks, burns, sync glow)

2. **Audio**
   - Background music per zone
   - SFX (attack, hit, sync activation)
   - Creat voice lines

3. **Content Expansion**
   - More creats (Water, Earth, Storm, Shadow elements)
   - More zones (5+ biomes)
   - 20+ restoration sites
   - Crown tiers (Iron, Silver, Gold, Mythril, Void)
   - Loot tables for enemies
   - Boss variation

4. **Systems**
   - Equipment/gear system
   - Skill tree
   - Creat evolution/breeding
   - Save/load system
   - Settings menu

5. **3D Migration**
   - Replace 2D scenes with 3D equivalents
   - Use same combat engine (already decoupled)
   - Use same data-driven approach

## Autoloads (Auto-Initialized)

Configured in `project.godot` under `[autoload]`:

```
EventBus → scripts/core/event_bus.gd
GameState → scripts/core/game_state.gd
SceneRouter → scripts/core/scene_router.gd
SaveManager → scripts/core/save_manager.gd
BondSystem → scripts/systems/bond_system.gd
SyncSystem → scripts/systems/sync_system.gd
InventorySystem → scripts/systems/inventory_system.gd
```

All autoloads are globally accessible by name (e.g., `EventBus.damage_dealt.emit(...)`)

## Input Map

Configured in `project.godot` under `[input]`:

- `move_up` - W / Up arrow
- `move_down` - S / Down arrow
- `move_left` - A / Left arrow
- `move_right` - D / Right arrow
- `attack` - Space / Left mouse button
- `interact` - E
- `feed` - F
- `sync` - Shift

## Debug Tips

Enable debug output in the Godot console to watch:
- Zone transitions
- Combat events
- System state changes
- Error/warnings

Use the HUD to monitor:
- Player health
- Companion bond
- Sync meter
- Inventory

## Design Documents

- Story Mode world and quest loop blueprint: `docs/STORY_MODE_WORLD_BLUEPRINT.md`
- Mode structure, championships, ranked/unranked, faction layer: `docs/MODE_STRUCTURE_AND_RANKING.md`
- Full player guide (goals, currencies, crowns, limits, progression): `docs/PLAYER_COMPENDIUM_HOW_TO_PLAY.md`

## Validation & Testing

- Untested systems checklist (map, inventory, HUD, hotkeys): `UNTESTED_SYSTEMS_CHECKLIST.md`

## Known Limitations (MVP)

1. **No saving** - Progress lost on close
2. **Single boss** - Only one fight available
3. **Placeholder graphics** - Colored circles only
4. **No music/SFX** - Silent for now
5. **Limited enemy AI** - Simple chase + attack
6. **No creat evolution** - Fire creat only

---

**Created:** April 2026  
**Engine:** Godot 4.x  
**Status:** Vertical Slice MVP  
**Next Milestone:** Art & Audio Polish
