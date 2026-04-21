extends Node
## CrownProgressionSystem
## Tracks gem/shard pickup progress for crown-shaped puzzle assembly per game mode.

signal crown_progress_changed(crown_id: String)
signal crown_completed(crown_id: String)

const GEM_ALIASES := {
	"gem_topaz":       "gem_yellow",
	"gem_sapphire":    "gem_blue",
	"gem_spinel":      "gem_red",
	"gem_alexandrite": "gem_green",
	"gem_painite":     "gem_black",
	"gem_jeremejevite":"gem_clear",
	"gem_quartz":      "gem_clear"   # Clear crystal  storm/light element
}

const SHARD_ALIASES := {
	"metal_fragment_bronze": "shard_bronze",
	"metal_fragment_silver": "shard_silver",
	"metal_fragment_iron": "shard_iron",
	"crystal_shard": "shard_crystal",
	# Premium collectible aliases (new naming pass)
	"embersteel_fragment": "shard_bronze",
	"moonsteel_fragment": "shard_silver",
	"dreadsteel_fragment": "shard_iron",
	"starglass_shard": "shard_crystal",
	# Lore-accurate metal names (map to tier equivalents)
	"starforged":   "shard_runic",     # Tier 7  divine alloy
	"aethersteel":  "shard_crystal",   # Tier 6  storm/light metal
	"osmium":       "shard_obsidian",  # Tier 5  heavy rare metal
	"runemetal":    "shard_runic",
	"crystalsteel": "shard_crystal",
	"aurorite":     "shard_gold",      # Divine/ancestral  gold-tier
	"bixbite_shard": "shard_obsidian"  # Bixbite metal form (not currency)
}

const GEM_META := {
	"gem_blue":   {"element": "water",     "tier": 3, "value_gc": 250,  "lore_names": ["Abyss Sapphire"],        "gc_range": [300, 500]},
	"gem_red":    {"element": "fire",      "tier": 4, "value_gc": 500,  "lore_names": ["Dragonheart Ruby"],      "gc_range": [500, 1000]},
	"gem_yellow": {"element": "energy",    "tier": 5, "value_gc": 800,  "lore_names": ["Solar Topaz"],           "gc_range": [700, 1500]},
	"gem_green":  {"element": "earth",     "tier": 2, "value_gc": 300,  "lore_names": ["Verdant Alexandrite"],   "gc_range": [300, 600]},
	"gem_clear":  {"element": "lightning", "tier": 6, "value_gc": 1000, "lore_names": ["Storm Quartz", "Royal Crystal"], "gc_range": [1000, 1600]},
	"gem_purple": {"element": "shadow",    "tier": 7, "value_gc": 1500, "lore_names": ["Void Amethyst"],         "gc_range": [1500, 2400]},
	"gem_black":  {"element": "void",      "tier": 8, "value_gc": 3000, "lore_names": ["Nightfall Painite"],     "gc_range": [3000, 5000]}
}

const SHARD_META := {
	"shard_iron":     {"tier": 1, "value_gc": 125,  "lore_names": ["Dreadsteel"]},
	"shard_bronze":   {"tier": 2, "value_gc": 250,  "lore_names": ["Embersteel"]},
	"shard_silver":   {"tier": 3, "value_gc": 500,  "lore_names": ["Moonsteel"]},
	"shard_gold":     {"tier": 4, "value_gc": 900,  "lore_names": ["Aurorite"]},
	"shard_obsidian": {"tier": 5, "value_gc": 1400, "lore_names": ["Obsidian", "Osmium", "Bixbite"]},
	"shard_crystal":  {"tier": 6, "value_gc": 1800, "lore_names": ["Crystalsteel", "Aethersteel"]},
	"shard_runic":    {"tier": 7, "value_gc": 2600, "lore_names": ["Runemetal", "Starforged"]}
}

const CROWN_DEFS := {
	"crown_story_sovereign": {
		"name": "The Sovereign's Diadem",
		"mode": "story",
		"requirements": {
			"shard_runic": 2,
			"shard_gold": 2,
			"gem_clear": 2,
			"gem_black": 1,
			"gem_purple": 1
		},
		"rewards": {"gc": 1200000, "bixbite": 35, "items": {"shard_runic": 1, "gem_clear": 2}}
	},
	"crown_melee_duelist": {
		"name": "The Duelist's Crest",
		"mode": "melee",
		"requirements": {
			"shard_bronze": 3,
			"shard_silver": 2,
			"gem_red": 3,
			"gem_yellow": 2,
			"gem_blue": 1
		},
		"rewards": {"gc": 350000, "bixbite": 8, "items": {"gem_red": 2, "shard_silver": 1}}
	},
	"crown_race_torque": {
		"name": "The Racer's Torque",
		"mode": "race",
		"requirements": {
			"shard_iron": 2,
			"shard_crystal": 2,
			"gem_yellow": 3,
			"gem_clear": 2,
			"gem_blue": 1
		},
		"rewards": {"gc": 300000, "bixbite": 6, "items": {"gem_yellow": 2}}
	},
	"crown_minigame_tactician": {
		"name": "The Tactician's Band",
		"mode": "mini_game",
		"requirements": {
			"shard_bronze": 2,
			"shard_iron": 2,
			"gem_green": 2,
			"gem_blue": 2,
			"gem_yellow": 1
		},
		"rewards": {"gc": 180000, "bixbite": 4, "items": {"shard_bronze": 1}}
	},
	"crown_pve_warden": {
		"name": "The Warden's Circlet",
		"mode": "pve",
		"requirements": {
			"shard_gold": 2,
			"shard_silver": 2,
			"gem_green": 2,
			"gem_purple": 2,
			"gem_clear": 1
		},
		"rewards": {"gc": 500000, "bixbite": 12, "items": {"shard_gold": 1, "gem_green": 1}}
	},
	"crown_pvp_conqueror": {
		"name": "The Conqueror's Halo",
		"mode": "pvp",
		"requirements": {
			"shard_obsidian": 2,
			"shard_runic": 1,
			"gem_black": 1,
			"gem_purple": 3,
			"gem_clear": 2
		},
		"rewards": {"gc": 900000, "bixbite": 25, "items": {"gem_purple": 2, "shard_obsidian": 1}}
	},
	"crown_sidequest_seeker": {
		"name": "The Seeker's Laurel",
		"mode": "side_quest",
		"requirements": {
			"shard_iron": 2,
			"shard_bronze": 2,
			"gem_green": 2,
			"gem_blue": 1,
			"gem_red": 1
		},
		"rewards": {"gc": 220000, "bixbite": 5, "items": {"gem_green": 1}}
	},
	"crown_finding_scavenger": {
		"name": "Finding Crown",
		"mode": "universal",
		"requirements": {
			"shard_iron": 1,
			"shard_bronze": 1,
			"shard_silver": 1,
			"shard_gold": 1,
			"gem_blue": 1,
			"gem_red": 1,
			"gem_yellow": 1,
			"gem_green": 1,
			"gem_clear": 1,
			"gem_purple": 1
		},
		"rewards": {"gc": 700000, "bixbite": 15, "items": {"shard_runic": 1, "gem_black": 1}}
	},
	"crown_meta_seven_realms": {
		"name": "Crown of the Seven Realms",
		"mode": "meta",
		"requirements": {
			"shard_runic": 7,      # Starforged  one per realm
			"gem_black": 3,        # Painite  void essence
			"gem_green": 3,        # Alexandrite  earth essence
			"gem_clear": 3,        # Jeremejevite  storm essence
			"gem_purple": 2,       # Shadow essence
			"gem_blue": 2,         # Water essence
			"gem_red": 2,          # Fire essence
			"gem_yellow": 2        # Sun/energy essence
		},
		"rewards": {
			"gc": 5000000,
			"bixbite": 150,
			"items": {"shard_runic": 3, "gem_black": 2},
			"special": "mythfall_gate_unlock"  # Opens endgame area
		},
		"stat_bonus": {"all_stats_pct": 15}  # +15% all stats while equipped
	}
}

var crown_progress: Dictionary = {}

func _ready() -> void:
	_reset_progress()
	print("CrownProgressionSystem initialized")

func _reset_progress() -> void:
	crown_progress.clear()
	for crown_id in CROWN_DEFS.keys():
		var req: Dictionary = CROWN_DEFS[crown_id]["requirements"]
		var filled: Dictionary = {}
		for part_id in req.keys():
			filled[part_id] = 0
		crown_progress[crown_id] = {
			"filled": filled,
			"completed": false,
			"completed_at": 0
		}

func normalize_collectible(item_id: String) -> String:
	if item_id in GEM_META or item_id in SHARD_META:
		return item_id
	if item_id in GEM_ALIASES:
		return String(GEM_ALIASES[item_id])
	if item_id in SHARD_ALIASES:
		return String(SHARD_ALIASES[item_id])
	return ""

func is_collectible(item_id: String) -> bool:
	return normalize_collectible(item_id) != ""

func register_collectible(item_id: String, quantity: int = 1) -> void:
	var normalized := normalize_collectible(item_id)
	if normalized == "" or quantity <= 0:
		return

	# InventorySystem can feed collectibles before this autoload's _ready runs.
	# Ensure progress data exists regardless of autoload initialization order.
	if crown_progress.is_empty():
		_reset_progress()

	for crown_id in CROWN_DEFS.keys():
		var req: Dictionary = CROWN_DEFS[crown_id]["requirements"]
		if normalized not in req:
			continue
		if crown_id not in crown_progress:
			continue

		var state: Dictionary = crown_progress[crown_id]
		var filled: Dictionary = state["filled"]
		var required: int = int(req[normalized])
		var current: int = int(filled.get(normalized, 0))
		var next_value: int = mini(required, current + quantity)
		if next_value != current:
			filled[normalized] = next_value
			crown_progress[crown_id] = state
			crown_progress_changed.emit(crown_id)

		if can_complete_crown(crown_id):
			complete_crown(crown_id)

func get_crown_ids() -> Array:
	return CROWN_DEFS.keys()

func get_crown_definition(crown_id: String) -> Dictionary:
	if crown_id not in CROWN_DEFS:
		return {}
	return CROWN_DEFS[crown_id].duplicate(true)

func get_crown_progress(crown_id: String) -> Dictionary:
	if crown_id not in crown_progress:
		return {}
	return crown_progress[crown_id].duplicate(true)

func can_complete_crown(crown_id: String) -> bool:
	if crown_id not in CROWN_DEFS or crown_id not in crown_progress:
		return false

	var state: Dictionary = crown_progress[crown_id]
	if bool(state.get("completed", false)):
		return false

	var req: Dictionary = CROWN_DEFS[crown_id]["requirements"]
	var filled: Dictionary = state["filled"]
	for part_id in req.keys():
		if int(filled.get(part_id, 0)) < int(req[part_id]):
			return false
	return true

func complete_crown(crown_id: String) -> bool:
	if not can_complete_crown(crown_id):
		return false

	var state: Dictionary = crown_progress[crown_id]
	state["completed"] = true
	state["completed_at"] = Time.get_unix_time_from_system()
	crown_progress[crown_id] = state

	if GameState:
		GameState.completed_crowns[crown_id] = true

	var rewards: Dictionary = CROWN_DEFS[crown_id]["rewards"]
	if GameState and rewards.has("gc"):
		GameState.add_gold(int(rewards["gc"]))
	if GameState and rewards.has("bixbite"):
		GameState.bixbite += int(rewards["bixbite"])

	if rewards.has("items"):
		var items: Dictionary = rewards["items"]
		for item_id in items.keys():
			InventorySystem.add_item(String(item_id), int(items[item_id]))

	InventorySystem.add_item(crown_id, 1)
	crown_completed.emit(crown_id)
	EventBus.hud_updated.emit()
	print("Crown completed: %s" % CROWN_DEFS[crown_id]["name"])
	return true

func get_save_data() -> Dictionary:
	return {
		"progress": crown_progress.duplicate(true)
	}

func load_save_data(data: Dictionary) -> void:
	_reset_progress()
	if typeof(data) != TYPE_DICTIONARY:
		return
	var incoming: Dictionary = data.get("progress", {})
	for crown_id in incoming.keys():
		if crown_id in crown_progress:
			crown_progress[crown_id] = incoming[crown_id]
