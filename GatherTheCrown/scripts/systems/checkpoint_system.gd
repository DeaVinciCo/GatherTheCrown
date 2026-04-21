extends Node
## CheckpointSystem - Manages three types of checkpoints:
## 1. Journey Checkpoints - exploration, story, zone discovery
## 2. Battle Checkpoints - before/after major boss fights
## 3. Restoration Checkpoints - kingdom/town rebuild milestones

enum CheckpointType {
	JOURNEY,
	BATTLE,
	RESTORATION
}

class Checkpoint:
	var id: String
	var type: CheckpointType
	var zone: String
	var position: Vector2
	var timestamp: float
	var data: Dictionary  # Type-specific data
	
	func _init(p_id: String, p_type: CheckpointType, p_zone: String, p_pos: Vector2) -> void:
		id = p_id
		type = p_type
		zone = p_zone
		position = p_pos
		timestamp = Time.get_ticks_msec()
		data = {}

var checkpoints: Dictionary = {}  # checkpoint_id  Checkpoint
var current_checkpoint: String = ""  # Last reached checkpoint
var checkpoint_history: Array = []  # Stack of checkpoints for "return" logic

signal checkpoint_reached(checkpoint: Checkpoint)
signal checkpoint_loaded(checkpoint: Checkpoint)
signal checkpoint_history_changed

func _ready() -> void:
	print("[CheckpointSystem] Initialization complete")

#  Journey Checkpoints 

func create_journey_checkpoint(checkpoint_id: String, zone: String, position: Vector2, story_data: Dictionary) -> Checkpoint:
	"""Create a checkpoint for exploration/story progression."""
	var cp = Checkpoint.new(checkpoint_id, CheckpointType.JOURNEY, zone, position)
	cp.data = {
		"story_progress": story_data.get("progress", ""),
		"discovered_paths": story_data.get("paths", []),
		"active_quest_stage": story_data.get("quest_stage", ""),
		"lore_found": story_data.get("lore", []),
		"map_revealed": story_data.get("map_revealed", [])
	}
	checkpoints[checkpoint_id] = cp
	current_checkpoint = checkpoint_id
	checkpoint_history.append(checkpoint_id)
	checkpoint_history_changed.emit()
	checkpoint_reached.emit(cp)
	print("Journey checkpoint created: %s at %s" % [checkpoint_id, zone])
	return cp

func create_battle_checkpoint(checkpoint_id: String, zone: String, position: Vector2, battle_data: Dictionary) -> Checkpoint:
	"""Create a checkpoint before a major boss fight."""
	var cp = Checkpoint.new(checkpoint_id, CheckpointType.BATTLE, zone, position)
	cp.data = {
		"boss_id": battle_data.get("boss_id", ""),
		"boss_name": battle_data.get("boss_name", ""),
		"prep_complete": battle_data.get("prep_complete", false),
		"equipped_crown": battle_data.get("equipped_crown", ""),
		"loadout_snapshot": battle_data.get("loadout", {}),
		"consumables": battle_data.get("consumables", {}),
		"battle_intro_seen": false,
		"difficulty": battle_data.get("difficulty", "normal")
	}
	checkpoints[checkpoint_id] = cp
	current_checkpoint = checkpoint_id
	checkpoint_history.append(checkpoint_id)
	checkpoint_history_changed.emit()
	checkpoint_reached.emit(cp)
	print("Battle checkpoint created: %s vs %s" % [checkpoint_id, battle_data.get("boss_name", "Unknown")])
	return cp

func create_restoration_checkpoint(checkpoint_id: String, zone: String, position: Vector2, restoration_data: Dictionary) -> Checkpoint:
	"""Create a checkpoint after restoration milestone."""
	var cp = Checkpoint.new(checkpoint_id, CheckpointType.RESTORATION, zone, position)
	cp.data = {
		"site_id": restoration_data.get("site_id", ""),
		"cleared": restoration_data.get("cleared", false),
		"materials_delivered": restoration_data.get("materials", []),
		"structures_fixed": restoration_data.get("structures", []),
		"npcs_returned": restoration_data.get("npcs", []),
		"passive_yields": restoration_data.get("yields", {}),
		"restoration_tier": restoration_data.get("tier", 0)
	}
	checkpoints[checkpoint_id] = cp
	current_checkpoint = checkpoint_id
	checkpoint_history.append(checkpoint_id)
	checkpoint_history_changed.emit()
	checkpoint_reached.emit(cp)
	print("Restoration checkpoint created: %s" % checkpoint_id)
	return cp

#  Checkpoint retrieval & loading 

func get_checkpoint(checkpoint_id: String) -> Checkpoint:
	return checkpoints.get(checkpoint_id)

func get_current_checkpoint() -> Checkpoint:
	if current_checkpoint == "":
		return null
	return checkpoints.get(current_checkpoint)

func load_checkpoint(checkpoint_id: String) -> bool:
	"""Restore game state to a checkpoint."""
	if not checkpoint_id in checkpoints:
		print("ERROR: Checkpoint not found: %s" % checkpoint_id)
		return false
	
	var cp = checkpoints[checkpoint_id]
	current_checkpoint = checkpoint_id
	
	# Restore position and zone
	GameState.current_zone = cp.zone
	GameState.player_position = cp.position
	
	# Restore type-specific data
	match cp.type:
		CheckpointType.JOURNEY:
			_restore_journey_state(cp)
		CheckpointType.BATTLE:
			_restore_battle_state(cp)
		CheckpointType.RESTORATION:
			_restore_restoration_state(cp)
	
	checkpoint_loaded.emit(cp)
	print("Checkpoint loaded: %s" % checkpoint_id)
	return true

func _restore_journey_state(cp: Checkpoint) -> void:
	# Restore discovered zones and paths
	for path in cp.data.get("discovered_paths", []):
		GameState.discovered_zones[path] = true
	EventBus.hud_updated.emit()

func _restore_battle_state(cp: Checkpoint) -> void:
	# Restore equipped crown and consumables
	GameState.selected_crown = cp.data.get("equipped_crown", "")
	# Player inventory should match loadout snapshot
	EventBus.hud_updated.emit()

func _restore_restoration_state(cp: Checkpoint) -> void:
	# Restore restoration progress
	RestorationSystem.restoration_sites[cp.data.get("site_id", "")]["state"] = "restored"
	EventBus.hud_updated.emit()

#  Checkpoint history & traversal 

func get_checkpoint_history() -> Array:
	return checkpoint_history.duplicate()

func get_previous_checkpoint() -> Checkpoint:
	"""Get the checkpoint before current."""
	if checkpoint_history.size() > 1:
		var idx = checkpoint_history.rfind(current_checkpoint)
		if idx > 0:
			return checkpoints.get(checkpoint_history[idx - 1])
	return null

func list_checkpoints_by_zone(zone: String) -> Array:
	"""Get all checkpoints in a specific zone."""
	var result = []
	for cp_id in checkpoints:
		if checkpoints[cp_id].zone == zone:
			result.append(checkpoints[cp_id])
	return result

func list_checkpoints_by_type(cp_type: CheckpointType) -> Array:
	"""Get all checkpoints of a specific type."""
	var result = []
	for cp_id in checkpoints:
		if checkpoints[cp_id].type == cp_type:
			result.append(checkpoints[cp_id])
	return result

#  Save/Load 

func get_save_data() -> Dictionary:
	"""Export checkpoint data for SaveManager."""
	var cp_data = {}
	for cp_id in checkpoints:
		var cp = checkpoints[cp_id]
		cp_data[cp_id] = {
			"type": int(cp.type),
			"zone": cp.zone,
			"position": [cp.position.x, cp.position.y],
			"timestamp": cp.timestamp,
			"data": cp.data
		}
	
	return {
		"checkpoints": cp_data,
		"current_checkpoint": current_checkpoint,
		"history": checkpoint_history
	}

func load_from_save_data(save_data: Dictionary) -> void:
	"""Restore checkpoint data from SaveManager."""
	print("[CheckpointSystem] Loading from save data...")
	checkpoints.clear()
	checkpoint_history.clear()
	checkpoint_history_changed.emit()
	
	for cp_id in save_data.get("checkpoints", {}):
		var cp_dict = save_data["checkpoints"][cp_id]
		var cp_type: CheckpointType = cp_dict.get("type", 0) as CheckpointType
		var cp = Checkpoint.new(
			cp_id,
			cp_type,
			cp_dict.get("zone", ""),
			Vector2(cp_dict.get("position", [0, 0])[0], cp_dict.get("position", [0, 0])[1])
		)
		cp.timestamp = cp_dict.get("timestamp", 0.0)
		cp.data = cp_dict.get("data", {})
		checkpoints[cp_id] = cp
	
	current_checkpoint = save_data.get("current_checkpoint", "")
	checkpoint_history = save_data.get("history", []).duplicate()
	checkpoint_history_changed.emit()
	print("[CheckpointSystem] Loaded: %d checkpoints, current: %s" % [checkpoints.size(), current_checkpoint])



