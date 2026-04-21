# 🎮 Gather The Crown - Quick Start Guide

**Last Updated:** April 21, 2026 (Movement & Gameplay Fixes Applied)

## Installation & Setup

### 1. Open in Godot 4.x
- **Engine Required:** Godot 4.0.0 or later
- **Open Project:** File → Open Project → Select `GatherTheCrown` folder
- **First Load:** Godot will import all scenes and scripts (30-60 seconds)

### 2. Run the Game
- **Press F5** or **Click the Run button** (play icon)
- Game starts with character creation or existing hero
- If character exists: boots to **ForestTrialsEntrance** (route selection screen)
- You'll see:
  - Blue pentagon (you = player character model)
  - UI hints at bottom (controls listed below)

## Basic Controls ✅ UPDATED

| Key(s) | Action |
|--------|--------|
| **W** or **↑** | Move up |
| **A** or **←** | Move left |
| **S** or **↓** | Move down |
| **D** or **→** | Move right |
| **Any combination** | Move diagonals (e.g., W+D for up-right) |
| **LMB** (left mouse) | Attack in aimed direction |
| **E** | Interact / Enter zone |
| **M** | Toggle map screen |
| **I** | Toggle inventory |
| **Shift** | Toggle chat panel |
| **R** | Restore last checkpoint |

**NOTE:** Movement uses **direct key presses** (not input actions) for maximum compatibility. All 8 directions (up, down, left, right, + diagonals) now work freely.

## First Game Experience

### ✅ Step 1: Character Creation (1m)
If no hero exists, you'll see **CharacterCreation screen**:
1. Enter your hero's name
2. Click **[Forge Hero]** button
3. Game assigns initial stats and creates your first Creat

### ✅ Step 2: Route Selection - Forest Trials (1m)
After character creation, you arrive at **ForestTrialsEntrance**:
- Shows 5 numbered routes (Press 1-5 to select):
  - **1. Sproutbound** - Beginner forest route
  - **2. Emberroot** - Fire-themed challenges
  - **3. Crownfire** - Elite enemy encounters
  - **4. Forage** - Exploration and resource gathering
  - **5. Home** - Return to Greenwood Clearing

Select any route to enter combat zone.

### ✅ Step 3: Movement Test (30s)
Once in a combat zone:
1. Press **W** to move up - should move freely
2. Press **A+W** together - should move diagonally up-left
3. Try all directions: **W, A, S, D** and combinations
4. **8-directional movement now working!** (bug fixed)

### ✅ Step 4: Enemy Encounters (2m)
You should see enemies appearing (diamond-shaped polygons):
- **Green diamonds** = Scouts (fast, low HP)
- **Purple diamonds** = Bats (flying)
- **Red diamonds** = Bandits (higher damage)
- **Golden diamonds** = Boss enemies

If enemies not visible:
- Check game console (View → Output in VS Code)
- Look for: `[CrownrideCircuit] ========== SPAWN REPORT ===========`
- All enemies should spawn at known positions (see debug output)

### ✅ Step 5: Combat (1m+)
1. Move toward an enemy with **WASD**
2. Left-click (**LMB**) to attack in aimed direction (aim cursor)
3. Enemy takes damage and may attack back
4. Collect drops (fragments, gems, food)
5. Gold coins (**GC**) awarded on enemy defeat

---

## Combat System Overview

### Attack & Aim
- **Left Mouse Button**: Attack in direction player is facing
- **Direction**: Determined by mouse cursor position
- **Cooldown**: ~0.5 seconds between attacks
- **Range**: ~92 pixels radius around player

### Damage Calculation
```
Base Damage = 6.0 + (Level × 1.2) + (Strength × 0.35)
Enemy Type Modifier: Varies by enemy (see battle debug output)
```

### Enemies & Drops
- **Goblin Scout** (40% spawn rate): Drops food + occasional Moonsteel
- **Forest Bat** (25% spawn rate): Rare food drops
- **Cave Bat** (15% spawn rate): Minimal drops
- **Bandit Rogue** (20% spawn rate): Quality materials + gems

### Victory Condition
- Defeat all enemy waves
- Clear zone for loot gathering
- Restore materials to checkpoint for rewards (future feature)

## Troubleshooting

### "Movement only works diagonally"
**Status: FIXED** (April 21, 2026)
- The character motor was using input actions that might not be configured
- **Solution**: Updated to use direct key presses only
- **Action**: Rebuild project (Ctrl+B) and press F5 to test
- You should now move freely in all 8 directions

### "No enemies visible in combat zone"
- Enemies ARE being spawned but may have visibility issues
- **Action**: Check console output:
  1. Open **View → Output** in VS Code
  2. Run game (F5)
  3. Look for: `[CrownrideCircuit] ========== SPAWN REPORT ===========`
  4. Check:
     - `Total enemies in 'enemy' group: X` (should be ~8)
     - Each enemy: `visible_body=true` (should be true)
     - Enemy colors listed (green, purple, red for different types)
- **If visible_body=false**: Rendering issue in VisibleBody creation
- **Report output**: If enemies still missing, share the SPAWN REPORT section

### "Black screen on startup"
- Godot is loading scenes and compiling scripts
- **Wait 30-60 seconds** for first load
- Check Godot console (View → Output) for compilation errors

### "Character doesn't move at all"
- Ensure Godot window is focused (click on viewport)
- Try pressing **W** key
- Check that script has no syntax errors (Project → Build)

### "Attack doesn't hit anything"
- Attack range is ~92 pixels (roughly character body + extension)
- Get closer to enemy (within 2 body-widths)
- Click to attack and aim with mouse cursor
- Use **LMB** (left mouse button), not keyboard

### "Godot won't open project"
- Ensure **Godot 4.0+** installed (check Help → About)
- If import dialog appears: Click **Import** and wait for import to complete
- Delete `.godot/` folder if stuck: `rm -r .godot/` then reopen

## What's Next?

### Gameplay Path
1. **Complete character creation** or load existing hero
2. **Select combat route** (1-5) from Forest Trials
3. **Defeat enemies** and collect materials
4. **Return to zones** to restore sites for rewards
5. **Craft crowns** using collected materials
6. **Progress through story** unlocking new areas

### Developer Exploration
1. **Understand input system**:
   - Open `scripts/actors/character_motor_2d.gd` - movement handling
   - See how direct key presses work (no action map dependency)

2. **Examine enemy spawning**:
   - Open `scripts/world/crownride_circuit.gd` - enemy spawning code
   - Check `_spawn_enemies()` function for type definitions
   - Review debug logging for diagnostic info

3. **Explore combat**:
   - Open `scripts/actors/ai/enemy_ai.gd` - enemy AI behavior
   - See `apply_type_data()` for how enemies get stats
   - Review `_behavior_chase()` for chase mechanics

4. **Try modding**:
   - Change player damage: Edit `_calculate_player_hit_damage()` in `crownride_circuit.gd`
   - Adjust enemy difficulty: Modify ENEMY_DEFS weights and HP values
   - Change colors: Edit `_color_for_type()` in `enemy_ai.gd`

### Debug & Diagnostic Features
- **Console logging**: All systems log to OUTPUT console
- **Spawn report**: Automatically printed on zone entry
- **Visual debugging**: 
  - Player = blue pentagon
  - Enemies = colored diamonds (green/purple/red based on type)
  - Pickups = yellow stars/blue gems
  - Safe zones = green rings

## Development Notes

### Core Architecture
- **All systems use signals** - Check `scripts/core/event_bus.gd` for inter-system communication
- **All data in GameState** - Global autoload tracks hero stats, progression, discovered zones
- **Auto-routing enabled** - Boot.gd handles scene loading flow automatically
- **Data-driven spawning** - zones.json defines enemies, pickups, safe zones per level
- **Character motor abstraction** - CharacterMotor2D base class used by Player and all enemies

### Key Systems (All Implemented)
- ✅ **Movement System** - 8-directional, direct key input (no action map required)
- ✅ **Enemy AI** - Type-based spawning with weighted rolls, chase behavior, loot drops
- ✅ **Combat** - Aim-to-cursor attacks, damage calculation, enemy defeat rewards
- ✅ **Inventory System** - Premium material names (Embersteel, Moonsteel, etc.) with aliases
- ✅ **Map System** - Zone discovery, unlock gating (story_completed_once), waypoint navigation
- ✅ **Character Roster** - Multi-hero support with active hero tracking
- ✅ **Crown Progression** - Collectible-based puzzle system with tier unlocking

### Recent Fixes (April 21, 2026)
- ✅ **Movement input** - Fixed diagonal-only restriction by using direct key presses
- ✅ **Debug logging** - Added comprehensive spawn reporting for enemy visibility diagnostics
- ✅ **Premium material system** - Material naming upgraded with backward compatibility aliases

### Save/Load System
- **In Development** - SaveManager configured and ready
- **Currently**: GameState persists hero roster and zone discovery within session
- **Next Phase**: Full checkpoint/restore system with persistent saves

## Feature Status

### ✅ Fully Implemented & Playable
- Player movement (8-directional, WASD/Arrows)
- Enemy spawning (4 types with weighted rolls)
- Combat system (aim-to-cursor attacks, damage calculation)
- Loot drops (materials, gems, currency)
- Inventory system (with premium material names)
- Zone discovery (story-gated unlock system)
- Multi-hero support (character roster tracking)
- Map screen (with waypoint system - debug UI for now)
- Character creation (hero forging with base stats)

### 🔧 In Progress
- Enemy visibility diagnostics (debug logging added)
- Restoration system save/load
- Per-hero creat roster UI
- Creat spawning on demand (key-based)
- Boss encounters (template ready)

### 📋 Planned/Not Yet
- Art assets (currently using simple polygon shapes)
- Audio/Music
- Animation
- Advanced AI behaviors
- Crown crafting mechanics (UI ready)
- Equipment system
- Skill trees
- Mobile controls

---

## Quick Reference

### Zone Entry Points
- **Boot** → Character Creation/Loading
- **CharacterCreation** → Hero Forging
- **ForestTrialsEntrance** → Route Selection (1-5)
- **CrownrideCircuit** → Starting Combat Zone (from route 1)
- **GreenwoodClearing** → Safe Hub (home base)

### Input Mapping (No InputMap Required)
All input uses direct key presses:
- `KEY_W`, `KEY_A`, `KEY_S`, `KEY_D` - Movement
- `KEY_UP`, `KEY_DOWN`, `KEY_LEFT`, `KEY_RIGHT` - Alternative movement
- `LMB` (mouse click) - Attack
- `KEY_E` - Interact
- `KEY_M` - Map toggle
- `KEY_I` - Inventory toggle
- `KEY_SHIFT` - Chat panel
- `KEY_R` - Checkpoint restore

### Console Debug Output
Check **View → Output** for:
- `[Boot]` - Bootstrap sequence
- `[CrownrideCircuit] SPAWN REPORT` - Enemy/pickup diagnostics
- `[DEBUG]` - Detailed spawn tracking
- `damage_dealt` events - Combat log
- Zone/route transitions

---

## Design & Development Documentation

For deeper reference on any topic, see the `docs/` folder:

| Document | What It Covers |
|----------|---------------|
| [Game Design Document](docs/GAME_DESIGN_DOCUMENT.md) | Vision, game modes, all systems design intent |
| [Systems Architecture](docs/SYSTEMS_ARCHITECTURE.md) | Autoload APIs, signals, data flow diagrams |
| [Content Bible](docs/CONTENT_BIBLE.md) | All enemies, bosses, creats, crowns, zones, items |
| [Art Style Guide](docs/ART_STYLE_GUIDE.md) | Visual and audio direction |
| [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md) | What is built, what is next, phase milestones |
| [Developer Onboarding](docs/DEVELOPER_ONBOARDING.md) | Setup guide, conventions, debugging, git workflow |

---

**Ready to play?** Press **F5** in Godot now!

For detailed system documentation, see [README.md](README.md)
