# SYSTEMS ARCHITECTURE DOCUMENT
## Gather The Crown: Creats & Foes
**Version:** 0.2.0 | **Last Updated:** April 21, 2026 | **Engine:** Godot 4.6

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Autoload Systems (Singletons)](#2-autoload-systems-singletons)
3. [Event Bus — Signal Reference](#3-event-bus--signal-reference)
4. [Scene Flow & Routing](#4-scene-flow--routing)
5. [Input System](#5-input-system)
6. [Actor Architecture](#6-actor-architecture)
7. [Combat Architecture](#7-combat-architecture)
8. [Save/Load System](#8-saveload-system)
9. [Data Flow Diagrams](#9-data-flow-diagrams)
10. [Adding New Systems — Conventions](#10-adding-new-systems--conventions)

---

## 1. ARCHITECTURE OVERVIEW

The game uses a **reactive singleton-based architecture**. Global systems (Autoloads) hold state and communicate via signals through the central `EventBus`. Scene nodes read from and write to singletons but are not directly coupled to each other.

### High-Level Principle
```
Scene Node → calls → Autoload Singleton method
Autoload   → emits → EventBus signal
Other Autoloads / Scene Nodes → connect to → EventBus signal and react
```

### Why This Pattern?
- Nodes don't need direct references to each other
- Systems can be added/removed without coupling chain breaks
- Easy to test: mock EventBus or just check singleton state
- Debugging: all signals flow through one bus, easy to log

---

## 2. AUTOLOAD SYSTEMS (SINGLETONS)

Listed in load order (project.godot):

| # | Name | File | Role | Status |
|---|------|------|------|--------|
| 1 | EventBus | `scripts/core/event_bus.gd` | Central signal hub | ✅ Complete |
| 2 | GameState | `scripts/core/game_state.gd` | Global state (hero, zone, stats) | ✅ Complete |
| 3 | SceneRouter | `scripts/core/scene_router.gd` | Scene transitions & overlays | ✅ Complete |
| 4 | SaveManager | `scripts/core/save_manager.gd` | Persist/restore game state | ✅ Complete |
| 5 | BondSystem | `scripts/systems/bond_system.gd` | Creat bond & hunger | ✅ Complete |
| 6 | SyncSystem | `scripts/systems/sync_system.gd` | Sync meter & mode | ✅ Complete |
| 7 | InventorySystem | `scripts/systems/inventory_system.gd` | Basic item inventory | ✅ Complete |
| 8 | AdvancedInventorySystem | `scripts/systems/advanced_inventory_system.gd` | Tabbed inventory, home storage | ⚠️ Partial |
| 9 | CrownProgressionSystem | `scripts/systems/crown_progression_system.gd` | Crown completion tracking | ⚠️ Partial |
| 10 | RestorationSystem | `scripts/systems/restoration_system.gd` | Site restoration state | ⚠️ Partial |
| 11 | CompanionLifecycle | `scripts/systems/companion_lifecycle.gd` | Egg → hatch → active | ✅ Complete |
| 12 | InteractPromptController | `scripts/ui/interact_prompt_controller.gd` | Interaction prompt UI | ⚠️ Stub |
| 13 | CompanionCommands | `scripts/actors/companion/companion_commands.gd` | Creat command mode | ✅ Complete |
| 14 | DayNightCycle | `scripts/core/day_night_cycle.gd` | Time & visual tint | ✅ Complete |
| 15 | CheckpointSystem | `scripts/systems/checkpoint_system.gd` | Progress checkpoints | ✅ Complete |
| 16 | KingdomFindingsSystem | `scripts/systems/kingdom_findings_system.gd` | Discovery tracking | ✅ Complete |

---

### GameState — API Reference

```gdscript
# Read
GameState.current_zone          → String
GameState.hero_profile          → Dictionary
GameState.hero_roster           → Array (max 3)
GameState.active_hero_index     → int
GameState.player_stats          → {hp, max_hp, energy, max_energy}
GameState.has_creat             → bool
GameState.companion_stats       → {hp, max_hp, hunger, bond}
GameState.selected_crown        → String
GameState.completed_crowns      → Dictionary
GameState.gold_coins            → int
GameState.bixbite               → int
GameState.earned_gc_lifetime    → int
GameState.discovered_zones      → Dictionary
GameState.mastered_zones        → Dictionary
GameState.boss_cooldowns        → Dictionary
GameState.boss_defeat_counts    → Dictionary

# Write / Actions
GameState.reset()
GameState.has_hero_profile() → bool
GameState.set_hero_profile(profile: Dictionary)
```

---

### InventorySystem — API Reference

```gdscript
# Read
InventorySystem.get_item_count(item_id: String) → int
InventorySystem.has_item(item_id: String, qty: int) → bool
InventorySystem.get_all_items() → Dictionary
InventorySystem.get_item_display_name(item_id: String) → String

# Write
InventorySystem.add_item(item_id: String, quantity: int)
InventorySystem.remove_item(item_id: String, quantity: int) → bool

# Signals (via EventBus)
EventBus.item_added(item_id, quantity)
EventBus.item_removed(item_id, quantity)
EventBus.inventory_changed()
```

**Startup defaults:** 5× food_basic, 10× embersteel_fragment

---

### BondSystem — API Reference

```gdscript
# Read
BondSystem.get_bond(creat_id: String) → float   # 0.0–1.0
BondSystem.get_hunger(creat_id: String) → float # 0–100

# Write
BondSystem.increase_bond(creat_id: String, delta: float)
BondSystem.decrease_hunger(creat_id: String, food_value: float)  # also +0.05 bond
BondSystem.add_bond_xp(amount: float, creat_id: String)          # 100xp → +0.5 bond
```

---

### CompanionLifecycle — API Reference

```gdscript
# States
CompanionLifecycle.current_state  # LifecycleState enum
CompanionLifecycle.egg_type       # String

# Actions
CompanionLifecycle.acquire_egg(egg_type: String)  # NO_CREAT → EGG_ACQUIRED
CompanionLifecycle.begin_care()                   # EGG_ACQUIRED → EGG_IN_CARE
CompanionLifecycle.feed_egg()                     # Reduces neglect, +bond XP
CompanionLifecycle.begin_hatching()               # EGG_IN_CARE → EGG_HATCHING
CompanionLifecycle.complete_hatch()               # EGG_HATCHING → CREAT_ACTIVE

# Signals (on EventBus)
EventBus.egg_acquired(egg_type)
EventBus.egg_hatched(creat_type)
EventBus.egg_neglected()
EventBus.egg_died()
```

---

### SyncSystem — API Reference

```gdscript
# Read
SyncSystem.sync_meter        → float (0–100)
SyncSystem.is_synced         → bool
SyncSystem.get_sync_damage_multiplier() → float  # 1.5 when synced
SyncSystem.get_sync_speed_multiplier()  → float  # 1.3 when synced

# Write
SyncSystem.gain_sync(amount: float)   # Increase meter
SyncSystem.activate_sync()            # Starts sync mode (requires ≥80)
SyncSystem.deactivate_sync()          # End sync mode
```

---

### CheckpointSystem — API Reference

```gdscript
# Create checkpoints
CheckpointSystem.create_journey_checkpoint()
CheckpointSystem.create_battle_checkpoint()
CheckpointSystem.create_restoration_checkpoint()

# Read
CheckpointSystem.get_checkpoint(checkpoint_id: String) → Checkpoint
CheckpointSystem.get_current_checkpoint() → Checkpoint

# Restore
CheckpointSystem.load_checkpoint(checkpoint_id: String)
```

---

### SceneRouter — API Reference

```gdscript
# Navigate
SceneRouter.go_to_zone(zone_scene_path: String, transition_name: String)

# UI overlays (non-destructive)
SceneRouter.open_screen(ui_scene_path: String) → Node
SceneRouter.close_screen(screen_node: Node)

# Query
SceneRouter.get_current_scene() → Node
```

---

### CrownProgressionSystem — API Reference

```gdscript
# Check
CrownProgressionSystem.crown_progress[crown_id]  # {filled, completed, completed_at}

# Add collectibles (gems/shards)
CrownProgressionSystem.register_collectible(item_id: String, quantity: int)
CrownProgressionSystem.normalize_collectible(item_id: String) → String  # resolves aliases

# Crown data
CrownProgressionSystem.GEM_META      # All gem data
CrownProgressionSystem.SHARD_META    # All shard data
```

---

## 3. EVENT BUS — SIGNAL REFERENCE

All signals are defined on `EventBus` (autoload). Connect to signals from any node using:
```gdscript
EventBus.signal_name.connect(_on_signal_name)
```

### Combat Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `damage_dealt` | damager, target, amount, hit_data | Hitbox |
| `enemy_died` | enemy_node | enemy_ai.gd |
| `boss_started` | boss_name | boss_ai.gd |
| `boss_defeated` | boss_name | boss_ai.gd |

### Currency/Economy Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `gold_changed` | new_amount, delta | GameState |
| `bixbite_changed` | new_amount, delta | GameState |
| `gem_changed` | gem_type, quantity | InventorySystem |
| `shard_changed` | shard_type, quantity | InventorySystem |
| `item_added` | item_id, quantity | InventorySystem |
| `item_removed` | item_id, quantity | InventorySystem |
| `inventory_changed` | — | InventorySystem |

### Creat/Bond Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `bond_changed` | creat, new_bond, delta | BondSystem |
| `creat_fed` | creat, food_item, bond_delta | BondSystem |
| `egg_acquired` | egg_type | CompanionLifecycle |
| `egg_hatched` | creat_type | CompanionLifecycle |
| `egg_neglected` | — | CompanionLifecycle |
| `egg_died` | — | CompanionLifecycle |
| `state_changed` | new_state | CompanionLifecycle |

### Sync Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `sync_meter_changed` | new_value, max_value | SyncSystem |
| `sync_activated` | — | SyncSystem |
| `sync_deactivated` | — | SyncSystem |

### Zone/World Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `zone_changed` | zone_name | SceneRouter |
| `discovery_changed` | zone_id, state | MapManager |
| `zone_selected` | zone_id | MapManager |
| `travel_started` | zone_id | MapManager |
| `travel_completed` | zone_id | MapManager |
| `waypoint_added` | zone_id | MapManager |
| `waypoint_removed` | zone_id | MapManager |

### Day/Night Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `day_started` | — | DayNightCycle |
| `night_started` | — | DayNightCycle |
| `phase_changed` | new_phase | DayNightCycle |

### Restoration/Kingdom Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `restoration_started` | site_id | RestorationSystem |
| `restoration_completed` | reward | RestorationSystem |
| `restoration_progress` | site_id, progress | RestorationSystem |
| `finding_discovered` | finding_id | KingdomFindingsSystem |
| `finding_delivered` | npc_id, finding_id | KingdomFindingsSystem |
| `town_request_completed` | npc_id | KingdomFindingsSystem |
| `kingdom_milestone_reached` | milestone | KingdomFindingsSystem |

### Checkpoint Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `checkpoint_reached` | checkpoint_id | CheckpointSystem |
| `checkpoint_loaded` | checkpoint_id | CheckpointSystem |
| `checkpoint_history_changed` | history | CheckpointSystem |

### Companion Command Signals
| Signal | Parameters | Emitted By |
|--------|-----------|------------|
| `command_changed` | new_command | CompanionCommands |

---

## 4. SCENE FLOW & ROUTING

### Boot Sequence
```
Boot.tscn (main scene)
    ↓ boot.gd
    ↓ Check: SaveManager.has_save()
    ├── Yes: Load save → go to last zone or Greenwood Clearing
    └── No:  go to CharacterCreation.tscn
```

### Scene Paths (used with SceneRouter)
```gdscript
# Hub zones
"res://scenes/world/GreenwoodClearing.tscn"
"res://scenes/world/ForestTrialsEntrance.tscn"

# Combat zones
"res://scenes/world/WoodedTrail.tscn"
"res://scenes/world/ForestTrials_Sproutbound.tscn"    # Key 1
"res://scenes/world/ForestTrials_Emberroot.tscn"      # Key 2
"res://scenes/world/ForestTrials_Crownfire.tscn"      # Key 3
"res://scenes/world/ForestTrials_Combat.tscn"         # Key 4 (forage)
"res://scenes/world/CrownrideCircuit.tscn"

# Special
"res://scenes/world/RestorationSite_01.tscn"
"res://scenes/world/ClashbornArena.tscn"
"res://scenes/world/CrownTrials.tscn"

# UI overlays (open with SceneRouter.open_screen)
"res://scenes/ui/HUD.tscn"
"res://scenes/ui/MapScreen.tscn"
"res://scenes/ui/CharacterCreation.tscn"
```

### Forest Trials Route Map (ForestTrialsEntrance.gd)
| Key | Route ID | Destination Scene |
|-----|----------|------------------|
| 1 | sproutbound | ForestTrials_Sproutbound.tscn |
| 2 | emberroot | ForestTrials_Emberroot.tscn |
| 3 | crownfire | ForestTrials_Crownfire.tscn |
| 4 | forage | ForestTrials_Combat.tscn |
| 5 | home | GreenwoodClearing.tscn |
| ESC | — | GreenwoodClearing.tscn |

---

## 5. INPUT SYSTEM

**Architecture:** Direct `Input.is_key_pressed(KEY_*)` calls — no dependency on InputMap actions.

*Rationale: InputMap action names are fragile when unconfigured. Direct key checks are always reliable.*

### Input Map (project.godot — backup reference)
| Action Name | Keys |
|------------|------|
| move_up | W, Up Arrow |
| move_down | S, Down Arrow |
| move_left | A, Left Arrow |
| move_right | D, Right Arrow |
| attack | Mouse LButton, Spacebar |
| interact | E |
| feed | F |
| sync | Numpad / |
| map_toggle | M |
| inventory_toggle | I |
| chat_toggle | Numpad / |
| restore_checkpoint | R |

### Movement Implementation (character_motor_2d.gd)
```gdscript
func handle_movement():
    var dir = Vector2.ZERO
    if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):    dir.y -= 1
    if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):  dir.y += 1
    if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):  dir.x -= 1
    if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT): dir.x += 1
    input_direction = dir.normalized()
    # Lerp velocity for smooth acceleration
    velocity = velocity.lerp(input_direction * movement_speed, acceleration * delta)
```

---

## 6. ACTOR ARCHITECTURE

### Inheritance Chain
```
CharacterBody2D (Godot built-in)
    └── CharacterMotor2D (character_motor_2d.gd)  ← base movement
            ├── Player (player.gd)                 ← hero character
            ├── EnemyAI (enemy_ai.gd)              ← enemy controller
            └── BossAI (boss_ai.gd)                ← boss controller
```

### Player Node Composition
```
Player (CharacterBody2D + player.gd)
    ├── VisibleBody (Polygon2D)          ← blue pentagon visual
    ├── Hitbox (Area2D + hitbox.gd)      ← melee attack area
    ├── Hurtbox (Area2D + hurtbox.gd)   ← takes damage
    ├── Health (Node + health.gd)        ← HP tracking
    └── Camera2D                         ← follows player
```

### Enemy Node Composition
```
Enemy (CharacterBody2D + enemy_ai.gd)
    ├── VisibleBody (Polygon2D)          ← colored diamond (type-coded)
    ├── Hitbox (Area2D + hitbox.gd)      ← melee attack
    ├── Hurtbox (Area2D + hurtbox.gd)   ← takes damage
    └── Health (Node + health.gd)        ← HP tracking
```

### FireCreat Node Composition
```
FireCreat (CharacterBody2D + fire_creat.gd)
    ├── VisibleBody (Polygon2D)          ← orange/fire visual
    ├── Hitbox (Area2D)                  ← fire attack area
    └── [planned: Hurtbox + Health]
```

### Visual Identity System (enemy_ai.gd)
Enemy shapes are diamond Polygon2D (4 points) colored by type:
```gdscript
const TYPE_COLORS = {
    "goblin_scout":   Color(0.2, 0.8, 0.2),   # Green
    "forest_bat":     Color(0.5, 0.0, 0.8),   # Purple
    "cave_bat":       Color(0.5, 0.0, 0.8),   # Purple
    "bandit_rogue":   Color(0.9, 0.2, 0.2),   # Crimson
    "orc_warrior":    Color(0.4, 0.6, 0.1),   # Olive
    "skeleton_guard": Color(0.9, 0.9, 0.8),   # Bone
    "crown_knight":   Color(1.0, 0.8, 0.0),   # Gold
}
```

---

## 7. COMBAT ARCHITECTURE

### Hit Detection Flow
```
Player swings (LMB)
    → Hitbox Area2D enters Hurtbox Area2D
    → Hitbox._on_area_entered(area) fires
    → Check: _can_hit(area.get_owner_team()) — enemy vs player teams
    → Check: area not in already_hit list
    → Call: area.take_hit(damage, knockback_dir)
    → Hurtbox: check is_invulnerable
    → If not: Health.take_damage(damage)
    → If dead: die() → drop loot, emit signals
    → Emit: EventBus.damage_dealt(attacker, target, amount, hit_data)
    → Start invulnerability timer
```

### Combat Profile Application
```gdscript
# Apply to player for standard zones:
CombatEngine.apply_profile(player_node, "FAST_FORGIVING")
# Apply before boss encounters:
CombatEngine.apply_profile(player_node, "PRECISE_BOSS")
```

### Sync Mode Flow
```
Any hit (player or creat) → SyncSystem.gain_sync(amount)
    → sync_meter increases
    → EventBus.sync_meter_changed emitted
    → HUD widget updates meter display

Player presses / → SyncSystem.activate_sync()
    → Check: sync_meter >= 80
    → is_synced = true
    → Start 10-second timer
    → EventBus.sync_activated emitted
    → Player and Creat get stat multipliers

After 10 seconds → SyncSystem.deactivate_sync()
    → is_synced = false
    → EventBus.sync_deactivated emitted
    → Multipliers removed
```

---

## 8. SAVE/LOAD SYSTEM

### Save File Location
`user://gather_crown_save.dat`

### What Gets Saved
SaveManager serializes the state of all these systems:
```
GameState (hero profile, zone, stats, currency, completed crowns)
InventorySystem (all item dictionaries)
AdvancedInventorySystem (player and home storage)
BondSystem (bond values, hunger values)
CrownProgressionSystem (progress per crown)
CompanionLifecycle (egg state, hatch progress)
CheckpointSystem (checkpoint history)
KingdomFindingsSystem (discovered findings, deliveries)
RestorationSystem (site states)
```

### Save Trigger Points
- Manual save: player uses RestPoint interactable
- Auto-save: CheckpointSystem.create_*_checkpoint() calls also trigger save
- Zone transition: save on successful zone load

### Load on Boot
```gdscript
# boot.gd
func _ready():
    if SaveManager.has_save():
        SaveManager.load_game()
        SceneRouter.go_to_zone(GameState.current_zone_scene_path)
    else:
        SceneRouter.go_to_zone("res://scenes/ui/CharacterCreation.tscn")
```

---

## 9. DATA FLOW DIAGRAMS

### Player Attacks Enemy
```
[Player Input] → [player.gd] → [perform_aim_attack()]
    → [Hitbox.damage = 15]
    → [Hitbox Area2D overlaps Enemy Hurtbox]
    → [hurtbox.gd take_hit(15, knockback)]
    → [health.gd take_damage(15)]
    → EventBus.damage_dealt(player, enemy, 15, {})
    → [HUD widget updates health bar if player target]
    → [SyncSystem.gain_sync(5)]
    → EventBus.sync_meter_changed(new_meter, 100)
    → [HUD sync meter updates]
```

### Enemy Drops Loot on Death
```
[Enemy health.gd] → died signal
    → [enemy_ai.gd die()]
    → Calculate GC reward (gc_reward_min to gc_reward_max)
    → GameState.gold_coins += reward
    → EventBus.gold_changed(new_amount, delta)
    → Drop material if type has drop table
    → InventorySystem.add_item(material_id, 1)
    → EventBus.item_added(material_id, 1)
    → [queue_free enemy node]
```

### Creat Bonds Through Combat
```
[fire_creat.gd perform_fire_attack(target)]
    → Calculate damage: 8 × (1 + BondSystem.get_bond("fire_creat") × 0.5)
    → Apply sync multiplier if SyncSystem.is_synced
    → target.take_damage(final_damage)
    → SyncSystem.gain_sync(3)
    → EventBus.damage_dealt(creat, target, damage, {})
```

### Crown Forge Flow
```
[CrownForgeScreen opens]
    → Load CrownProgressionSystem.crown_progress for display
    → Player selects crown to forge
    → CrownProgressionSystem check requirements
    → If all gems/shards present in InventorySystem:
        → InventorySystem.remove_item() for each required material
        → CrownProgressionSystem crown_progress[crown_id].completed = true
        → GameState.completed_crowns[crown_id] = true
        → EventBus.crown_forged(crown_id) [planned]
        → GameState.gold_coins += crown_gc_reward
        → GameState.bixbite += crown_bixbite_reward
        → Unlock associated game mode
```

---

## 10. ADDING NEW SYSTEMS — CONVENTIONS

### Creating a New Autoload
1. Create script in `scripts/systems/` or `scripts/core/`
2. Add to `project.godot` [autoload] section
3. Connect to EventBus signals in `_ready()`
4. Add save/load support in SaveManager if stateful
5. Document in this file under Section 2

### Creating a New Signal
1. Add to `event_bus.gd` with clear name and parameters
2. Document in Section 3 of this document
3. Use format: `noun_verbed` (e.g., `item_added`, `zone_changed`)

### Creating a New Zone Scene
1. Duplicate closest existing .tscn as starting point
2. Assign appropriate script from `scripts/world/`
3. Add zone_id and scene path to `MapManager.zone_scene_lookup`
4. Add zone data entry to `data/zones.json`
5. Add to Forest Trials route table if applicable

### Creating a New Enemy Type
1. Add type string to `enemy_ai.gd TYPE_COLORS` and `_class_for_type()`
2. Define type dictionary with: `{type, lore_name, hp, speed, behavior, gc_min, gc_max, weight}`
3. Add to zone's `ENEMY_DEFS` array in the world script
4. Document in CONTENT_BIBLE.md

### Creating a New Crown
1. Add crown_id and requirements to `CrownProgressionSystem`
2. Define GC and bixbite rewards
3. Add to `GAME_DESIGN_DOCUMENT.md` Crown table
4. Add to `CONTENT_BIBLE.md` Crown section
5. Create the associated game mode or unlock if applicable

### Debugging Tips
- `debug_checks.gd` runs on scene load and prints all system states
- Spawn reports: look for `[CrownrideCircuit] SPAWN REPORT` in Output
- Enemy visibility issues: check z-index (should be 20), parent node (EnemyLayer)
- Input not working: verify using direct `Input.is_key_pressed(KEY_W)` not InputMap actions
- Bond/hunger stale: call `BondSystem.get_bond("fire_creat")` in debugger
