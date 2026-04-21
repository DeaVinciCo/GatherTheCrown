extends Node
## Save/load system for hero profile and core game progression state

var save_file_path: String = "user://gather_crown_save.dat"

func _ready() -> void:
	print("SaveManager initialized")

func save_game() -> void:
	var file = FileAccess.open(save_file_path, FileAccess.WRITE)
	if file == null:
		print("ERROR: Unable to open save file for write: ", save_file_path)
		return

	var save_data = {
		"game_state": {
			"current_zone": GameState.current_zone,
			"player_position": GameState.player_position,
			"player_stats": GameState.player_stats,
			"has_creat": GameState.has_creat,
			"creat_egg_type": GameState.creat_egg_type,
			"protected_first_creat_id": GameState.protected_first_creat_id,
			"companion_stats": GameState.companion_stats,
			"selected_crown": GameState.selected_crown,
			"completed_crowns": GameState.completed_crowns,
			"equipped_items": GameState.equipped_items,
			"hero_profile": GameState.hero_profile,
			"hero_roster": GameState.hero_roster,
			"active_hero_index": GameState.active_hero_index,
			"gold_coins": GameState.gold_coins,
			"bixbite": GameState.bixbite,
			"earned_gc_lifetime": GameState.earned_gc_lifetime,
			"story_completed_once": GameState.story_completed_once,
			"story_completion_count": GameState.story_completion_count,
			"unlocked_character_slots": GameState.unlocked_character_slots,
			"discovered_zones": GameState.discovered_zones,
			"mastered_zones": GameState.mastered_zones,
			"flags": GameState.flags,
			"boss_cooldowns": GameState.boss_cooldowns,
			"boss_defeat_counts": GameState.boss_defeat_counts
		},
		"inventory": InventorySystem.get_all_items(),
		"bond_system": BondSystem.get_save_data(),
		"crown_progression": CrownProgressionSystem.get_save_data(),
		"companion_lifecycle": {
			"current_state": int(CompanionLifecycle.current_state),
			"egg_type": CompanionLifecycle.egg_type,
			"care_start_time": CompanionLifecycle.care_start_time,
			"neglect_timer": CompanionLifecycle.neglect_timer,
			"hatch_progress": CompanionLifecycle.hatch_progress
		},
		"checkpoints": CheckpointSystem.get_save_data(),
		"kingdom_findings": KingdomFindingsSystem.get_save_data(),
		"advanced_inventory": AdvancedInventorySystem.get_save_data()
	}

	file.store_var(save_data, true)
	print("Game saved to: ", save_file_path)

func load_game() -> void:
	if not has_save():
		print("No save found")
		return

	var file = FileAccess.open(save_file_path, FileAccess.READ)
	if file == null:
		print("ERROR: Unable to open save file for read: ", save_file_path)
		return

	var data = file.get_var(true)
	if typeof(data) != TYPE_DICTIONARY:
		print("ERROR: Save data format invalid")
		return

	var gs = data.get("game_state", {})
	GameState.current_zone = gs.get("current_zone", GameState.current_zone)
	GameState.player_position = gs.get("player_position", GameState.player_position)
	GameState.player_stats = gs.get("player_stats", GameState.player_stats)
	GameState.has_creat = gs.get("has_creat", GameState.has_creat)
	GameState.creat_egg_type = gs.get("creat_egg_type", GameState.creat_egg_type)
	GameState.protected_first_creat_id = gs.get("protected_first_creat_id", GameState.protected_first_creat_id)
	GameState.companion_stats = gs.get("companion_stats", GameState.companion_stats)
	GameState.selected_crown = gs.get("selected_crown", GameState.selected_crown)
	GameState.completed_crowns = gs.get("completed_crowns", GameState.completed_crowns)
	GameState.equipped_items = gs.get("equipped_items", GameState.equipped_items)
	GameState.hero_profile = gs.get("hero_profile", GameState.hero_profile)
	GameState.hero_roster = gs.get("hero_roster", GameState.hero_roster)
	GameState.active_hero_index = int(gs.get("active_hero_index", GameState.active_hero_index))
	GameState.gold_coins = int(gs.get("gold_coins", GameState.gold_coins))
	GameState.bixbite = int(gs.get("bixbite", GameState.bixbite))
	GameState.earned_gc_lifetime = int(gs.get("earned_gc_lifetime", GameState.earned_gc_lifetime))
	GameState.story_completed_once = bool(gs.get("story_completed_once", GameState.story_completed_once))
	GameState.story_completion_count = int(gs.get("story_completion_count", GameState.story_completion_count))
	GameState.unlocked_character_slots = int(gs.get("unlocked_character_slots", GameState.unlocked_character_slots))
	GameState.discovered_zones = gs.get("discovered_zones", GameState.discovered_zones)
	GameState.mastered_zones = gs.get("mastered_zones", GameState.mastered_zones)
	GameState.flags = gs.get("flags", GameState.flags)
	GameState.boss_cooldowns = gs.get("boss_cooldowns", GameState.boss_cooldowns)
	GameState.boss_defeat_counts = gs.get("boss_defeat_counts", GameState.boss_defeat_counts)

	InventorySystem.set_inventory(data.get("inventory", {}))
	BondSystem.load_save_data(data.get("bond_system", {}))
	CrownProgressionSystem.load_save_data(data.get("crown_progression", {}))

	var lifecycle = data.get("companion_lifecycle", {})
	CompanionLifecycle.current_state = lifecycle.get("current_state", CompanionLifecycle.current_state)
	CompanionLifecycle.egg_type = lifecycle.get("egg_type", CompanionLifecycle.egg_type)
	CompanionLifecycle.care_start_time = lifecycle.get("care_start_time", CompanionLifecycle.care_start_time)
	CompanionLifecycle.neglect_timer = lifecycle.get("neglect_timer", CompanionLifecycle.neglect_timer)
	CompanionLifecycle.hatch_progress = lifecycle.get("hatch_progress", CompanionLifecycle.hatch_progress)

	CheckpointSystem.load_from_save_data(data.get("checkpoints", {}))
	KingdomFindingsSystem.load_from_save_data(data.get("kingdom_findings", {}))
	AdvancedInventorySystem.load_from_save_data(data.get("advanced_inventory", {}))

	print("Game loaded from: ", save_file_path)

func has_save() -> bool:
	return FileAccess.file_exists(save_file_path)

func delete_save() -> void:
	if FileAccess.file_exists(save_file_path):
		DirAccess.remove_absolute(save_file_path)
