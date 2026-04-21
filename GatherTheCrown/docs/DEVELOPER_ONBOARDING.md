# DEVELOPER ONBOARDING GUIDE
## Gather The Crown: Creats & Foes
**Version:** 0.2.0 | **Last Updated:** April 21, 2026

*Start here. This guide gets you from zero to running code in under 10 minutes.*

---

## TABLE OF CONTENTS

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Running the Game](#3-running-the-game)
4. [Project Structure](#4-project-structure)
5. [The Codebase — Where Things Are](#5-the-codebase--where-things-are)
6. [Making Your First Change](#6-making-your-first-change)
7. [Coding Conventions](#7-coding-conventions)
8. [Testing & Debugging](#8-testing--debugging)
9. [Git Workflow](#9-git-workflow)
10. [Key Documents Reference](#10-key-documents-reference)

---

## 1. PREREQUISITES

### Required Software
| Tool | Version | Purpose |
|------|---------|---------|
| **Godot Engine** | 4.x (4.0+) | Game engine — runs and edits the Godot project |
| **Visual Studio Code** | Any recent | Code editor (optional but recommended) |
| **Git** | Any | Version control |
| **Node.js** | 18+ | For packages/server and packages/client (Phase 3) |
| **pnpm** | 8+ | Package manager for Node packages |

### Recommended VS Code Extensions
- `godot-tools` (Godot GDScript support)
- `EditorConfig` (consistent formatting)
- GitLens (Git history in editor)

---

## 2. PROJECT SETUP

### Clone the Repository
```bash
git clone https://github.com/DeaVinciCo/GatherTheCrown.git
cd GatherTheCrown
```

### Open the Godot Project
1. Launch Godot 4.x
2. Click **Import** in the project manager
3. Navigate to `GatherTheCrown/` subfolder (not the root!)
4. Select `project.godot`
5. Click **Import & Edit**

> ⚠️ The Godot project is in `GatherTheCrown/` — not the repo root. The repo root contains the TypeScript packages and docs.

### Verify Project Loads
- Godot should open without errors in the Output panel
- You should see the file tree with `scripts/`, `scenes/`, `data/`, `assets/`
- The project panel should show `Boot.tscn` as the main scene

### (Optional) TypeScript Packages Setup
```bash
# From repo root:
pnpm install
# This installs packages for client, server, and shared
```

---

## 3. RUNNING THE GAME

### Start the Game (Godot Editor)
1. Press **F5** in Godot Editor (or click the Run button ▶)
2. Main scene: `scenes/bootstrap/Boot.tscn` launches automatically
3. First run: character creation screen appears
4. Second run: loads your save and continues

### What You'll See
1. **Character Creation Screen** ("Forge a Hero")
   - Fill in a hero name, pick element/race/look/clothes/weapon
   - Click "FORGE YOUR HERO"
2. **Forest Trials Entrance**
   - Press 1–5 to pick a route
   - Press ESC to go to Greenwood Clearing (home)
3. **Combat Zone**
   - Move: W/A/S/D or arrow keys
   - Attack: Left click (aims at mouse), or Spacebar
   - Find egg: walk into shimmering trigger area

### Console Output
- Open the **Output** panel in Godot (bottom of screen)
- On zone entry, you'll see spawn reports:
  ```
  [CrownrideCircuit] ========== SPAWN REPORT ===========
  [CrownrideCircuit] Total enemies spawned: 8
  [goblin_scout_0] visible_body=true color=0.2,0.8,0.2 z_index=20
  ...
  ```
- Debug checks print on startup with `[DebugChecks]` prefix

---

## 4. PROJECT STRUCTURE

```
game/                          ← Repo root
├── GatherTheCrown/            ← GODOT PROJECT (open this in Godot)
│   ├── project.godot          ← Project settings + autoloads
│   ├── scripts/               ← ALL GDScript code
│   │   ├── core/              ← GameState, EventBus, SceneRouter, SaveManager, DayNightCycle
│   │   ├── systems/           ← Inventory, Bond, Sync, Crown, Restoration, Checkpoint, etc.
│   │   ├── combat/            ← Hitbox, Hurtbox, Health, CombatEngine
│   │   ├── actors/            ← Player, Enemy AI, Boss AI, FireCreat, CompanionCommands
│   │   │   ├── player/
│   │   │   ├── companion/
│   │   │   └── ai/
│   │   ├── ui/                ← HUD, CharacterCreation, MapManager, CrownForgeScreen, etc.
│   │   │   └── widgets/       ← HP widget, creat widget, attack widget, mana widget
│   │   ├── world/             ← Zone scripts (GreenWoodClearing, ForestTrials, etc.)
│   │   ├── bootstrap/         ← boot.gd (startup logic)
│   │   ├── debug/             ← debug_checks.gd (auto-diagnostic on load)
│   │   └── test/              ← game_loop_validator.gd, runtime_smoke_test.gd
│   ├── scenes/                ← ALL .tscn scene files
│   │   ├── bootstrap/         ← Boot.tscn
│   │   ├── ui/                ← HUD.tscn, MapScreen.tscn, CharacterCreation.tscn
│   │   ├── world/             ← All zone scenes
│   │   └── actors/            ← Player.tscn, Enemy.tscn, Boss.tscn, FireCreat.tscn
│   ├── data/                  ← JSON data files
│   │   ├── zones.json         ← Zone definitions
│   │   └── databases/         ← Item DB, enemy DB (in progress)
│   ├── assets/                ← Art, audio (mostly empty — see Phase 1)
│   │   ├── art/               ← Sprites, tilesets
│   │   └── audio/             ← Music, SFX
│   └── docs/                  ← All game documentation ← YOU ARE HERE
│
├── packages/                  ← TypeScript project (Phase 3 multiplayer)
│   ├── client/                ← Phaser browser client
│   ├── server/                ← Colyseus + Express server
│   └── shared/                ← Shared types and messages
│
├── docs/                      ← Root-level docs (cross-platform guides)
└── extracted_game/            ← Python prototype (reference only)
    └── GatherTheCrown-CreatsAndFoes/
```

---

## 5. THE CODEBASE — WHERE THINGS ARE

### "I want to change how the player moves"
→ `scripts/actors/character_motor_2d.gd` — `handle_movement()` function

### "I want to change enemy stats or add a new enemy type"
→ `scripts/actors/ai/enemy_ai.gd` — `ENEMY_DEFS` array in the world script (e.g., `crownride_circuit.gd`)
→ Also document in `docs/CONTENT_BIBLE.md`

### "I want to add a new item to inventory"
→ `scripts/systems/advanced_inventory_system.gd` — `_initialize_item_database()`
→ Add to `PREMIUM_DISPLAY_NAMES` in `inventory_system.gd`

### "I want to fire a game event"
→ `scripts/core/event_bus.gd` — add signal there, then emit from the source script

### "I want to change the day/night cycle timing"
→ `scripts/core/day_night_cycle.gd` — `DAY_DURATION`, `NIGHT_DURATION`, `TRANSITION_WINDOW` constants

### "I want to add a new zone"
→ Create scene in `scenes/world/`
→ Create script in `scripts/world/`
→ Add to `scripts/ui/map_manager.gd` zone_scene_lookup
→ Add to `data/zones.json`
→ Document in `docs/CONTENT_BIBLE.md`

### "I want to add a new crown"
→ `scripts/systems/crown_progression_system.gd` — add to crown definitions
→ Document in `docs/CONTENT_BIBLE.md` and `docs/GAME_DESIGN_DOCUMENT.md`

### "I want to check if the player has a creat"
→ `GameState.has_creat` (bool)
→ or `CompanionLifecycle.current_state == CompanionLifecycle.LifecycleState.CREAT_ACTIVE`

### "I want to respond to when a boss is defeated"
→ Connect to `EventBus.boss_defeated` signal in your script's `_ready()`

### "I want to add something to the save file"
→ `scripts/core/save_manager.gd` — add to `save_game()` and `load_game()`

---

## 6. MAKING YOUR FIRST CHANGE

### Example: Change enemy goblin_scout speed

1. Open `GatherTheCrown/scripts/world/crownride_circuit.gd` in Godot script editor
2. Find the `ENEMY_DEFS` array
3. Locate the `goblin_scout` entry: `{ "type": "goblin_scout", ... "speed": 120, ... }`
4. Change `"speed": 120` to `"speed": 90`
5. Press F5 to test
6. Enter the Crownride Circuit zone
7. Check Output panel for spawn report — speed should be applied

### Example: Make player start with more gold

1. Open `scripts/core/game_state.gd`
2. Find `gold_coins: int` and change the default value
3. Or add a line in `reset()` to set a starting amount

### Example: Add a new EventBus signal

1. Open `scripts/core/event_bus.gd`
2. Add: `signal my_new_event(parameter1, parameter2)`
3. Emit it from any script: `EventBus.my_new_event.emit(val1, val2)`
4. Connect from any script: `EventBus.my_new_event.connect(_on_my_new_event)`
5. Document in `docs/SYSTEMS_ARCHITECTURE.md` under the Event Bus section

---

## 7. CODING CONVENTIONS

### GDScript Style
```gdscript
# Class declarations at top
class_name MyClass

# Constants in UPPER_SNAKE_CASE
const MAX_BOND = 1.0
const ENEMY_TYPES = ["goblin", "bat"]

# Variables: descriptive snake_case
var movement_speed: float = 200.0
var is_attacking: bool = false
var current_zone: String

# Functions: snake_case, verb first
func handle_movement() -> void:
    pass

func get_current_zone() -> String:
    return current_zone

# Private functions prefix with underscore
func _on_health_changed(current: float, max_hp: float) -> void:
    pass
```

### Signal Naming
- Format: `noun_verbed` (past tense)
- ✅ `item_added`, `boss_defeated`, `zone_changed`, `bond_changed`
- ❌ `on_item_add`, `itemAdded`, `item_change`

### Comment Policy
- Comment **why**, not what
- ✅ `# Bond capped at 1.0 to prevent overflow in damage formula`
- ❌ `# Set bond to 1.0`
- Leave TODO comments for incomplete work: `# TODO: Load from JSON when data/ ready`

### No Magic Numbers
```gdscript
# ❌ Bad
if sync_meter >= 80:

# ✅ Good
const SYNC_ACTIVATION_THRESHOLD = 80.0
if sync_meter >= SYNC_ACTIVATION_THRESHOLD:
```

### Input Handling Rule
**Always use direct key presses**, not InputMap actions:
```gdscript
# ✅ Always use this
if Input.is_key_pressed(KEY_W):

# ❌ Never use this (InputMap may not be configured)
if Input.is_action_pressed("move_up"):
```

### Scene Node References
- Use `@onready var` for nodes that exist when scene loads
- Never use `get_node()` strings in `_process()` — cache in `_ready()`
```gdscript
# ✅ Good
@onready var health_widget: Node = $HUD/HealthWidget

# ❌ Bad
func _process(delta):
    get_node("HUD/HealthWidget").update()
```

---

## 8. TESTING & DEBUGGING

### Built-in Debug Tools

**debug_checks.gd** — Runs automatically on scene load, prints:
- Inventory contents
- Keyring status
- Kingdom findings count
- Checkpoint history
- Day/Night status
- GameState creat/zone info

**game_loop_validator.gd** — Full boot sequence test:
- Run from the test scene `scenes/test/SystemTest.tscn`
- Output saved to `user://game_loop_test_log.txt`

**Spawn Report** — Prints on zone entry in any zone with enemy spawning:
```
[CrownrideCircuit] ========== SPAWN REPORT ===========
[CrownrideCircuit] Total enemies: 8
[enemy_name] visible_body=true/false  z_index=20  in_camera=true/false
```

### Common Debug Scenarios

**Enemies not visible:**
1. Check spawn report in Output panel
2. Verify `visible_body=true` for all enemies
3. Verify `z_index=20` (should be above background at -4 to 5)
4. If `in_camera=false`, check camera2D follow is attached to player

**Movement not working:**
1. Verify `character_motor_2d.gd` uses `Input.is_key_pressed()` — not `is_action_pressed()`
2. Check `_physics_process()` is calling `handle_movement()`
3. Verify the node is a CharacterBody2D

**Creat won't hatch:**
1. Check `CompanionLifecycle.current_state` in debugger
2. Verify `hatch_progress >= 1.0` (needs 300 sec of being in EGG_IN_CARE without dying)
3. Check neglect timer hasn't exceeded threshold (100.0)

**Bond not increasing:**
1. Call `BondSystem.get_bond("fire_creat")` in debugger
2. Check feeding: `BondSystem.decrease_hunger("fire_creat", 20)` should also increase bond
3. In combat: verify `SyncSystem.gain_sync()` is being called on creat attacks

**Crown progress not tracking:**
1. Check `CrownProgressionSystem.crown_progress` dictionary
2. Verify `register_collectible()` is being called when gem/shard added to inventory
3. Verify item ID aliases (`embersteel_fragment → shard_bronze`) resolve correctly

### Godot Debugger Tips
- **Breakpoints:** Click line number in script editor
- **Remote Inspect:** While game runs, use Scene panel → Remote tab to inspect live node values
- **Profiler:** Run → Debugger → Profiler (check _physics_process time)
- **Output filter:** Search `[CrownrideCircuit]` to filter spawn logs

---

## 9. GIT WORKFLOW

### Branches
- `GatherTheCrown` — Main branch (production-ready code only)
- `feature/your-feature-name` — For new features
- `fix/bug-description` — For bug fixes

### Commit Message Format
```
[Scope] Brief description

- Detail 1
- Detail 2

Files modified: file1.gd, file2.tscn
```

**Examples:**
```
[Combat] Fix enemy hitbox not detecting player hurtbox

- Added owner_team check before damage application
- Enemies now correctly deal damage to "player" team

Files modified: scripts/combat/hitbox.gd
```

```
[HUD] Wire hero HP widget to Health component

- HP widget now reads from player Health node
- Updates each frame via HudStateMapper
- Segments flash red below 25%

Files modified: scripts/ui/hud.gd, scripts/ui/hud_state_mapper.gd
```

### Push Process
```bash
git add -A
git commit -m "[Scope] Description"
git push origin GatherTheCrown
```

### Before Merging
- [ ] No compile errors (check Godot Output for parse errors)
- [ ] Core loop still works (Boot → CharCreate → Combat)
- [ ] No regressions in movement, combat, creat
- [ ] Update relevant docs if architecture changed

---

## 10. KEY DOCUMENTS REFERENCE

| Document | Location | Purpose |
|----------|----------|---------|
| **Game Design Document** | `docs/GAME_DESIGN_DOCUMENT.md` | Vision, loops, systems design intent |
| **Systems Architecture** | `docs/SYSTEMS_ARCHITECTURE.md` | Autoload APIs, signal reference, data flow |
| **Content Bible** | `docs/CONTENT_BIBLE.md` | All enemies, bosses, creats, crowns, zones, items |
| **Art Style Guide** | `docs/ART_STYLE_GUIDE.md` | Visual and audio direction |
| **Development Roadmap** | `docs/DEVELOPMENT_ROADMAP.md` | What's built, what's next, milestones |
| **This Document** | `docs/DEVELOPER_ONBOARDING.md` | How to get started and contribute |
| **QUICKSTART** | `QUICKSTART.md` | How to play the game (player-facing) |
| **README** | `README.md` | Project overview for GitHub |

### Documentation Update Rule
When you make a significant change:
1. **New enemy type** → Update `docs/CONTENT_BIBLE.md`
2. **New autoload/signal** → Update `docs/SYSTEMS_ARCHITECTURE.md`
3. **New game mechanic** → Update `docs/GAME_DESIGN_DOCUMENT.md`
4. **New art asset** → Update `docs/ART_STYLE_GUIDE.md` if it sets a standard
5. **New phase task completed** → Update `docs/DEVELOPMENT_ROADMAP.md`
6. **New control or gameplay rule** → Update `QUICKSTART.md`

---

## QUICK REFERENCE CARD

```
Run game:          F5 in Godot
Move:              W/A/S/D or arrows
Attack:            Left click (toward mouse)
Interact:          E
Feed/Command creat: F
Toggle sync:       / (numpad or keyboard)
Map:               M
Inventory:         I
Chat:              Shift
Restore:           R

Add signal:        event_bus.gd → emit anywhere → connect in _ready()
Save state:        SaveManager.save_game()
Check creat state: CompanionLifecycle.current_state
Check bond:        BondSystem.get_bond("fire_creat")
Route to zone:     SceneRouter.go_to_zone("res://scenes/world/Zone.tscn")
Check inventory:   InventorySystem.has_item("gem_red", 1)
```
