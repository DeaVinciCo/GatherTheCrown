# Checkpoint System & Kingdom Findings

Complete reference for Godot game progression systems.

---

## Part 1: Checkpoint System

**File:** `scripts/systems/checkpoint_system.gd`  
**Autoload:** `CheckpointSystem`

Checkpoints are physical save points in your world that mark major progression moments.

### Three Checkpoint Types

#### 1. Journey Checkpoints
For exploration and story progression.

**When to create:**
- Player enters a major story location for first time
- Discovers route endpoint
- Enters new kingdom capital
- Reaches dungeon entrance
- Clears major path segment
- Finds hidden route or landmark

**What they save:**
- Current location
- Story progress
- Discovered paths
- Active quest stage
- Found lore
- Map reveal state

**Example:**
```gdscript
CheckpointSystem.create_journey_checkpoint(
	"checkpoint_greenwood_main",
	"GreenwoodClearing",
	Vector2(640, 300),
	{
		"progress": "chapter_1_start",
		"paths": ["forest_trials_path", "wooded_trail"],
		"quest_stage": "find_first_egg",
		"lore": ["kingdom_history_01"],
		"map_revealed": ["greenwood_clearing", "forest_entrance"]
	}
)
```

#### 2. Battle Checkpoints
For major boss fights.

**When to create:**
- Before Tier 3+ Crown Sentinels
- Before Story Bosses
- Before Hollow Monarch
- Before faction raid bosses
- Before major arena trials

**What they save:**
- Boss details
- Prep completion state
- Equipped crown/loadout
- Consumables
- Difficulty level
- Battle start point

**Example:**
```gdscript
CheckpointSystem.create_battle_checkpoint(
	"checkpoint_boss_frostking",
	"IcePeak",
	Vector2(800, 200),
	{
		"boss_id": "frostking_tier3",
		"boss_name": "Frostking (Tier 3)",
		"prep_complete": true,
		"equipped_crown": "crimson_crown",
		"loadout": {"weapon": "ice_blade", "shield": "ward_shield"},
		"consumables": {"health_potion": 3, "mana_potion": 2},
		"difficulty": "normal"
	}
)
```

#### 3. Restoration Checkpoints
For kingdom rebuild milestones.

**When to create:**
- After clearing enemies from restoration site
- After delivering required materials
- After major rebuild milestone
- After town/kingdom restoration threshold

**What they save:**
- Site cleared/not cleared
- Materials delivered
- Structures fixed
- NPCs returned
- Passive yields unlocked
- Restoration tier level

**Example:**
```gdscript
CheckpointSystem.create_restoration_checkpoint(
	"checkpoint_restore_town_01",
	"AbandonedTown",
	Vector2(500, 400),
	{
		"site_id": "town_restoration_01",
		"cleared": true,
		"materials": ["lamp_oil", "window_glass", "door_hinges"],
		"structures": ["tavern", "blacksmith", "inn"],
		"npcs": ["innkeeper_main", "blacksmith_01"],
		"yields": {"daily_gold": 50, "daily_materials": ["timber", "cloth"]},
		"tier": 1
	}
)
```

### Using Checkpoints

**Load a checkpoint:**
```gdscript
if CheckpointSystem.load_checkpoint("checkpoint_greenwood_main"):
	print("Checkpoint loaded successfully")
	# Player position, zone, and state restored
```

**Get current checkpoint:**
```gdscript
var current = CheckpointSystem.get_current_checkpoint()
if current:
	print("At: %s" % current.zone)
```

**List checkpoints in a zone:**
```gdscript
var zone_checkpoints = CheckpointSystem.list_checkpoints_by_zone("ForestTrials")
for cp in zone_checkpoints:
	print("%s: %s" % [cp.id, cp.zone])
```

**List by type:**
```gdscript
var battle_checkpoints = CheckpointSystem.list_checkpoints_by_type(CheckpointSystem.CheckpointType.BATTLE)
```

---

## Part 2: Kingdom Findings System

**File:** `scripts/systems/kingdom_findings_system.gd`  
**Autoload:** `KingdomFindingsSystem`

Kingdom Findings are discoveries that help the hero, townspeople, or kingdom itself. They're tied to side quests, restoration, and progression.

### Three Finding Categories

#### 1. Rider Findings (Personal)
Items that help the hero directly.

**Examples:**
- Food caches
- Potion ingredients & kits
- Crafting blueprints
- Treasure maps
- Lore scrolls
- Crown fragment materials

**How they're found:**
- Side quest exploration
- Hidden caches
- Loot from combat
- Old records
- Abandoned homes

**Key type:** `TRAIL` (found via Trail Key)

#### 2. Town Findings (Community)
Items that help buildings and people.

**Examples:**
- Lamp oil (for street lights)
- Window glass panes
- Door hinges
- Cloth bolts (bedding)
- Medicine kits
- Kitchen equipment
- Timber beams

**How they're found:**
- Side quests from NPCs
- Townspeople "bumping into" hero and mentioning needs
- Exploration of abandoned structures
- Dungeon scavenging

**Key type:** `TOWN` (found via Town Key)

**NPC Requests example:**
- Innkeeper: "We need lamp oil for the streets..."
- Carpenter: "I need hinges and timber to repair homes..."
- Healer: "There are still those who need medical aid..."
- Blacksmith: "Door hinges—I can craft them if you find materials..."

#### 3. Kingdom Findings (Civic)
Large-scale infrastructure items.

**Examples:**
- Master gate keys
- Ward stones (kingdom borders)
- Light cores (city lights)
- Archive seals (unlock history)
- Bell tower parts
- Monument foundation stones

**How they're found:**
- Major story progression
- End of dungeon chains
- Boss rewards
- Critical restoration milestones

**Key type:** `KINGDOM` (found via Kingdom Key)

### Using Kingdom Findings

**Discover a finding:**
```gdscript
KingdomFindingsSystem.discover_finding("rider_food_cache")
```

**Get a finding by ID:**
```gdscript
var finding = KingdomFindingsSystem.get_finding("town_lamp_oil")
if finding:
	print("%s: %s" % [finding.name, finding.description])
```

**Get all findings of a category:**
```gdscript
var town_items = KingdomFindingsSystem.get_findings_by_category(
	KingdomFindingsSystem.FindingCategory.TOWN
)
for finding in town_items:
	print("- %s (at %s)" % [finding.name, finding.location])
```

**Get NPC requests:**
```gdscript
var innkeeper_requests = KingdomFindingsSystem.get_npc_requests("innkeeper_main")
for finding in innkeeper_requests:
	print("%s needs: %s" % ["Innkeeper", finding.name])
```

**Deliver a finding to an NPC:**
```gdscript
if KingdomFindingsSystem.deliver_finding_to_npc("town_lamp_oil", "innkeeper_main"):
	print("Delivered lamp oil!")
```

**Complete an NPC's deliveries (triggers restoration):**
```gdscript
var restoration_value = KingdomFindingsSystem.complete_npc_deliveries("innkeeper_main")
print("Restoration points: +%d" % restoration_value)
```

**Get total kingdom restoration:**
```gdscript
var total = KingdomFindingsSystem.get_total_kingdom_restoration_value()
print("Kingdom restoration: %d" % total)
```

---

## Integration: How They Work Together

### Example: Side Quest Flow

1. **Player enters town** → Innkeeper mentions broken lights
2. **Side quest created** → "Find lamp oil for the town"
3. **Player explores** → Discovers `town_lamp_oil` finding
4. **Player delivers** → Uses Town Key to open Oil Storage Depot
5. **Item obtained** → `KingdomFindingsSystem.discover_finding("town_lamp_oil")`
6. **Quest completion** → `KingdomFindingsSystem.deliver_finding_to_npc("town_lamp_oil", "innkeeper_main")`
7. **Restoration triggered** → `KingdomFindingsSystem.complete_npc_deliveries("innkeeper_main")`
8. **Checkpoint created** → Town now has lights restored, new restoration checkpoint

### Progression Pattern

```
Fix individual homes/shops
    ↓
Unlock town restoration request (from Mayor/Guild)
    ↓
Fix town district
    ↓
Unlock kingdom restoration request (from Chancellor)
    ↓
Fix entire kingdom system
    ↓
Kingdom milestone reached
```

### Physical Anchors for Checkpoints

Place checkpoints at:
- Campfires (Journey)
- Inns (Journey + Restoration)
- Waystones (Journey)
- Dungeon approaches (Journey + Battle)
- Prep camps (Battle)
- Restored outposts (Restoration)
- Castle gatehouses (Journey + Battle)
- Throne rooms (Journey + Battle)
- Kingdom center monuments (Restoration + Kingdom)
- Major crossroads (Journey)

---

## Signals

**CheckpointSystem:**
- `checkpoint_reached(checkpoint: Checkpoint)` — When new checkpoint created
- `checkpoint_loaded(checkpoint: Checkpoint)` — When player loads checkpoint
- `checkpoint_history_changed` — When history updates

**KingdomFindingsSystem:**
- `finding_discovered(finding: Finding)` — When item found
- `finding_delivered(npc_id: String, finding: Finding)` — When delivered to NPC
- `town_request_completed(npc_id: String, value: int)` — When NPC's requests filled
- `kingdom_milestone_reached(milestone: String, value: int)` — At restoration tiers

---

## Three Keys Explained

| Key Type | Location Type | For What | Used by |
|----------|---------------|----------|---------|
| **Trail Key** | Side paths, caches, hidden rooms | Rider Findings | Hero exploring |
| **Town Key** | Homes, inns, shops, storerooms | Town Findings | Community restoration |
| **Kingdom Key** | Gates, archives, towers, vaults | Kingdom Findings | Major progression |

---

## Restoration Materials Reference

**Town Findings (Building Restoration):**
- Lamp oil / lantern glass
- Door hinges
- Window glass shards
- Lock parts / replacement locks
- Signs and signage boards
- Cloth / bedding / textiles
- Medicine / potions
- Kitchen equipment / cookware
- Timber beams
- Nails / rivets
- Rope
- Sealant / pitch
- Roof tiles

**Kingdom Findings (Infrastructure):**
- Gate keys / master keys
- Ward stones
- Bridge supports
- Town bell parts
- Archive seals
- Water pump parts
- Mine supports
- Dock anchors
- Irrigation parts
- Signal braziers
- Watchtower lenses
- Public monument pieces
- City light cores / lamp crystals

---

## Implementation Checklist

- [ ] Register CheckpointSystem & KingdomFindingsSystem autoloads ✓ *Done*
- [ ] Integrate with SaveManager ✓ *Done*
- [ ] Create Journey checkpoints at zone entries
- [ ] Create Battle checkpoints before each boss
- [ ] Create Restoration checkpoints after restoration milestones
- [ ] Add NPC dialogue for town findings requests
- [ ] Create side quests for finding deliveries
- [ ] Add Trail/Town/Kingdom keys to world
- [ ] Connect NPC conversations to findings system
- [ ] Track restoration progress toward kingdom milestones
- [ ] Add visual checkpoints to scenes (campfire sprites, etc.)
- [ ] Test save/load flow
