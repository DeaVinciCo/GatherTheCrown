extends Node
## RestorationSystem - Manages restoration site state and rewards
## Tracks which sites are restored, pending, etc.

var restoration_sites: Dictionary = {}  # site_id  state dict
var restoration_in_progress: Dictionary = {}  # site_id  timer

signal restoration_started(site_id: String)
signal restoration_completed(site_id: String, reward: Dictionary)
signal restoration_progress(site_id: String, progress: float)

func _ready() -> void:
	# Load from data or initialize
	load_restoration_state()
	print("RestorationSystem initialized with %d sites" % restoration_sites.size())

func _process(delta: float) -> void:
	# Update in-progress restorations
	for site_id in restoration_in_progress.keys():
		restoration_in_progress[site_id] -= delta
		restoration_progress.emit(site_id, get_restoration_progress(site_id))
		
		if restoration_in_progress[site_id] <= 0:
			complete_restoration(site_id)
			restoration_in_progress.erase(site_id)

func start_restoration(site_id: String, duration: float = 5.0) -> bool:
	# Check if site is already restored
	if is_site_restored(site_id):
		print("Site %s already restored" % site_id)
		return false
	
	# Start restoration timer
	restoration_in_progress[site_id] = duration
	restoration_started.emit(site_id)
	
	print("Restoration started on %s (%.1f seconds)" % [site_id, duration])
	return true

func complete_restoration(site_id: String) -> void:
	# Mark site as restored
	if site_id in restoration_sites:
		restoration_sites[site_id]["state"] = "restored"
		restoration_sites[site_id]["completed_date"] = Time.get_ticks_msec()
		
		# Get reward data
		var reward = get_restoration_reward(site_id)
		
		# Give reward items
		for item in reward.get("items", []):
			InventorySystem.add_item(item["type"], item.get("amount", 1))
		
		restoration_completed.emit(site_id, reward)
		
		print("Restoration completed on %s! Reward: %s" % [site_id, reward])
		EventBus.hud_updated.emit()

func is_site_restored(site_id: String) -> bool:
	if site_id in restoration_sites:
		return restoration_sites[site_id]["state"] == "restored"
	return false

func is_restoration_in_progress(site_id: String) -> bool:
	return site_id in restoration_in_progress

func get_restoration_progress(site_id: String) -> float:
	if site_id in restoration_in_progress:
		# Return progress as 0.0-1.0
		var remaining = restoration_in_progress[site_id]
		var original = 5.0  # Default duration
		return 1.0 - (remaining / original)
	return 0.0

func get_restoration_reward(_site_id: String) -> Dictionary:
	# TODO: Load from restoration data JSON
	# For now, return default
	return {
		"items": [
			{"type": "lore_item", "amount": 1}
		],
		"daily_income": [
			{"type": "essence_water", "amount": 1}
		]
	}

func get_daily_reward(site_id: String) -> Array:
	if is_site_restored(site_id):
		return get_restoration_reward(site_id).get("daily_income", [])
	return []

func load_restoration_state() -> void:
	# Initialize default sites
	restoration_sites = {
		"restoration_site_01": {
			"id": "restoration_site_01",
			"name": "Ancient Grove",
			"state": "unrestored",  # or "restored"
			"completed_date": null
		}
	}

func save_restoration_state() -> void:
	# TODO: Save to SaveManager
	pass



