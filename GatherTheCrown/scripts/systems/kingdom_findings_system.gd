extends Node
## KingdomFindingsSystem - Manages discoveries that help:
## 1. Rider Findings - personal items, food, loot, tools (side quests)
## 2. Town Findings - building restoration items (NPCs ask for)
## 3. Kingdom Findings - civic infrastructure (major progression)
##
## Tied to three key types:
## - Trail Key (Rider side paths & caches)
## - Town Key (community & home access)
## - Kingdom Key (civic infrastructure)

enum FindingCategory {
	RIDER,      # Hero-focused discoveries
	TOWN,       # Community/building items
	KINGDOM     # Civic/structural items
}

enum KeyType {
	TRAIL,      # Field/side path exploration
	TOWN,       # Town homes and commerce
	KINGDOM     # Gates, archives, towers
}

class Finding:
	var id: String
	var category: FindingCategory
	var name: String
	var description: String
	var location: String
	var key_type: KeyType
	var required_for_quest: String  # quest_id or ""
	var npc_request: Dictionary  # {npc_id, dialogue_line}
	var discovered: bool = false
	var found_date: float = 0.0
	var restore_value: int = 0  # How much this contributes to kingdom restoration
	
	func _init(p_id: String, p_category: FindingCategory, p_name: String) -> void:
		id = p_id
		category = p_category
		name = p_name
		description = ""
		location = ""
		key_type = KeyType.TRAIL
		required_for_quest = ""
		npc_request = {}
		restore_value = 0

var findings: Dictionary = {}  # finding_id  Finding
var discovered_findings: Dictionary = {}  # finding_id  count
var npc_requests: Dictionary = {}  # npc_id  [Finding requests]
var pending_deliveries: Dictionary = {}  # npc_id  [finding_id]
var completed_deliveries: Dictionary = {}  # npc_id  [finding_id]

signal finding_discovered(finding: Finding)
signal finding_delivered(npc_id: String, finding: Finding)
signal town_request_completed(npc_id: String, total_restoration_value: int)
signal kingdom_milestone_reached(milestone: String, value: int)

func _ready() -> void:
	print("[KingdomFindingsSystem] Initializing...")
	_initialize_findings()
	print("[KingdomFindingsSystem] Initialization complete with %d findings" % findings.size())

#  Initialization 

func _initialize_findings() -> void:
	"""Populate all available findings."""
	
	#  RIDER FINDINGS 
	_add_finding("rider_food_cache", FindingCategory.RIDER, "Dried Rations Cache",
		"A hidden cache of preserved food from a wanderer's camp",
		"Hidden Trail", KeyType.TRAIL, 10)
	
	_add_finding("rider_potion_kit", FindingCategory.RIDER, "Alchemist's Potion Kit",
		"Tools and ingredients for brewing potions",
		"Abandoned Herbalist's Hut", KeyType.TRAIL, 15)
	
	_add_finding("rider_craft_blueprint", FindingCategory.RIDER, "Crown Fragment Blueprint",
		"Design notes for a powerful crown piece",
		"Scholar's Archive", KeyType.TRAIL, 20)
	
	_add_finding("rider_treasure_map", FindingCategory.RIDER, "Treasure Map",
		"Leads to valuable loot in unexplored territory",
		"Tomb of Legends", KeyType.TRAIL, 25)
	
	_add_finding("rider_lore_scroll", FindingCategory.RIDER, "Ancient Scroll",
		"Contains lore about the kingdom's history",
		"Crumbling Library", KeyType.TRAIL, 5)
	
	#  TOWN FINDINGS 
	_add_finding("town_lamp_oil", FindingCategory.TOWN, "Lamp Oil Cask",
		"Fuel for street lamps and lanterns",
		"Oil Storage Depot", KeyType.TOWN, 0)
	_findings_set_npc("town_lamp_oil", "innkeeper_main", "We need light in the streets...")
	_findings_set_restore_value("town_lamp_oil", 15)
	
	_add_finding("town_window_glass", FindingCategory.TOWN, "Window Glass Panes",
		"Replacement glass for broken windows",
		"Old Workshop", KeyType.TOWN, 0)
	_findings_set_npc("town_window_glass", "shopkeeper_01", "Doors and windows have been broken for years...")
	_findings_set_restore_value("town_window_glass", 20)
	
	_add_finding("town_door_hinges", FindingCategory.TOWN, "Iron Door Hinges",
		"Sturdy hinges for wooden doors",
		"Blacksmith's Scrap Pile", KeyType.TOWN, 0)
	_findings_set_npc("town_door_hinges", "carpenter_01", "I need materials to fix the homes...")
	_findings_set_restore_value("town_door_hinges", 18)
	
	_add_finding("town_cloth_bolts", FindingCategory.TOWN, "Cloth Bolts",
		"Textile for bedding and curtains",
		"Abandoned Mill", KeyType.TOWN, 0)
	_findings_set_npc("town_cloth_bolts", "weaver_01", "The people need warm blankets and proper bedding")
	_findings_set_restore_value("town_cloth_bolts", 12)
	
	_add_finding("town_medicine_kit", FindingCategory.TOWN, "Apothecary Kit",
		"Medicines for healing the sick",
		"Healer's Cottage", KeyType.TOWN, 0)
	_findings_set_npc("town_medicine_kit", "healer_main", "There are still those who need medical aid...")
	_findings_set_restore_value("town_medicine_kit", 25)
	
	_add_finding("town_kitchen_supplies", FindingCategory.TOWN, "Kitchen Equipment",
		"Pots, pans, cooking tools",
		"Grand Kitchen Ruins", KeyType.TOWN, 0)
	_findings_set_npc("town_kitchen_supplies", "tavern_keeper", "We need to feed people properly again")
	_findings_set_restore_value("town_kitchen_supplies", 16)
	
	_add_finding("town_timber_beams", FindingCategory.TOWN, "Timber Beams",
		"Structural wood for repairs",
		"Old Lumber Mill", KeyType.TOWN, 0)
	_findings_set_npc("town_timber_beams", "builder_01", "Without materials, I cannot repair the structures")
	_findings_set_restore_value("town_timber_beams", 22)
	
	#  KINGDOM FINDINGS 
	_add_finding("kingdom_gate_key", FindingCategory.KINGDOM, "Master Gate Key",
		"Key to the city's main gates",
		"Castle Vault", KeyType.KINGDOM, 0)
	_findings_set_npc("kingdom_gate_key", "gate_keeper", "The gates have been sealed for too long")
	_findings_set_restore_value("kingdom_gate_key", 40)
	
	_add_finding("kingdom_ward_stones", FindingCategory.KINGDOM, "Ward Stones (Set)",
		"Protective stones for the kingdom's borders",
		"Elemental Shrine", KeyType.KINGDOM, 0)
	_findings_set_npc("kingdom_ward_stones", "mage_council", "The kingdom's defenses are crumbling")
	_findings_set_restore_value("kingdom_ward_stones", 35)
	
	_add_finding("kingdom_light_core", FindingCategory.KINGDOM, "Kingdom Light Core",
		"Crystal that powers the capital's lights",
		"Crystal Chamber", KeyType.KINGDOM, 0)
	_findings_set_npc("kingdom_light_core", "architect_chief", "The city's heart must shine again")
	_findings_set_restore_value("kingdom_light_core", 50)
	
	_add_finding("kingdom_archive_seal", FindingCategory.KINGDOM, "Archive Seal of Authority",
		"Unlocks the kingdom's historical archives",
		"Throne Room", KeyType.KINGDOM, 0)
	_findings_set_npc("kingdom_archive_seal", "chronicler", "Our history has been locked away from us")
	_findings_set_restore_value("kingdom_archive_seal", 30)
	
	_add_finding("kingdom_bell_parts", FindingCategory.KINGDOM, "Bell Tower Parts",
		"Components to restore the kingdom's bell",
		"Tower Ruins", KeyType.KINGDOM, 0)
	_findings_set_npc("kingdom_bell_parts", "bell_master", "The bell that called people to gather hasn't rung in years")
	_findings_set_restore_value("kingdom_bell_parts", 28)
	
	_add_finding("kingdom_monument_stone", FindingCategory.KINGDOM, "Monument Foundation Stone",
		"Central piece of the kingdom's monument",
		"Monument Plaza", KeyType.KINGDOM, 0)
	_findings_set_npc("kingdom_monument_stone", "sculptor", "A kingdom needs something to remember itself by")
	_findings_set_restore_value("kingdom_monument_stone", 45)

func _add_finding(id: String, category: FindingCategory, finding_name: String, desc: String, location: String, key: KeyType, restore: int) -> void:
	var finding = Finding.new(id, category, finding_name)
	finding.description = desc
	finding.location = location
	finding.key_type = key
	finding.restore_value = restore
	findings[id] = finding

func _findings_set_npc(finding_id: String, npc_id: String, request_text: String) -> void:
	if finding_id in findings:
		findings[finding_id].npc_request = {"npc_id": npc_id, "request": request_text}
		if not npc_id in npc_requests:
			npc_requests[npc_id] = []
		npc_requests[npc_id].append(findings[finding_id])

func _findings_set_restore_value(finding_id: String, value: int) -> void:
	if finding_id in findings:
		findings[finding_id].restore_value = value

#  Discovery 

func discover_finding(finding_id: String) -> bool:
	"""Mark a finding as discovered."""
	if not finding_id in findings:
		print("ERROR: Finding not found: %s" % finding_id)
		return false
	
	var finding = findings[finding_id]
	if not finding.discovered:
		finding.discovered = true
		finding.found_date = Time.get_ticks_msec()
	
	if not finding_id in discovered_findings:
		discovered_findings[finding_id] = 0
	discovered_findings[finding_id] += 1
	
	finding_discovered.emit(finding)
	print("Finding discovered: %s (x%d)" % [finding.name, discovered_findings[finding_id]])
	EventBus.hud_updated.emit()
	
	return true

func get_finding(finding_id: String) -> Finding:
	return findings.get(finding_id)

func get_findings_by_category(category: FindingCategory) -> Array:
	var result = []
	for f_id in findings:
		if findings[f_id].category == category:
			result.append(findings[f_id])
	return result

func get_findings_by_key_type(key: KeyType) -> Array:
	var result = []
	for f_id in findings:
		if findings[f_id].key_type == key:
			result.append(findings[f_id])
	return result

func get_npc_requests(npc_id: String) -> Array:
	"""Get all items an NPC is requesting."""
	return npc_requests.get(npc_id, []).duplicate()

#  Delivery & Restoration 

func deliver_finding_to_npc(finding_id: String, npc_id: String) -> bool:
	"""Deliver a discovered finding to an NPC."""
	if not finding_id in discovered_findings or discovered_findings[finding_id] < 1:
		print("ERROR: Finding not discovered yet")
		return false
	
	var finding = findings[finding_id]
	if finding.npc_request.get("npc_id", "") != npc_id:
		print("ERROR: This NPC did not request this item")
		return false
	
	discovered_findings[finding_id] -= 1
	
	# Mark for restoration
	if not npc_id in pending_deliveries:
		pending_deliveries[npc_id] = []
	pending_deliveries[npc_id].append(finding_id)
	
	finding_delivered.emit(npc_id, finding)
	print("Finding delivered to %s: %s (+%d to restoration)" % [npc_id, finding.name, finding.restore_value])
	EventBus.hud_updated.emit()
	
	return true

func get_delivery_count_for_npc(npc_id: String) -> int:
	"""How many items have been delivered to this NPC."""
	return pending_deliveries.get(npc_id, []).size() + completed_deliveries.get(npc_id, []).size()

func complete_npc_deliveries(npc_id: String) -> int:
	"""Complete all deliveries for an NPC. Returns total restoration value."""
	if not npc_id in pending_deliveries:
		return 0
	
	var total_value = 0
	for finding_id in pending_deliveries[npc_id]:
		if finding_id in findings:
			total_value += findings[finding_id].restore_value

	if not completed_deliveries.has(npc_id):
		completed_deliveries[npc_id] = []
	for finding_id in pending_deliveries[npc_id]:
		completed_deliveries[npc_id].append(finding_id)
	
	pending_deliveries.erase(npc_id)
	town_request_completed.emit(npc_id, total_value)
	print("NPC %s deliveries complete (+%d to kingdom)" % [npc_id, total_value])
	
	# Check if kingdom milestone reached
	var kingdom_value = get_total_kingdom_restoration_value()
	if kingdom_value % 100 == 0:
		kingdom_milestone_reached.emit("tier_%d" % (kingdom_value / 100), kingdom_value)
	
	return total_value

func get_total_kingdom_restoration_value() -> int:
	"""Total restoration progress."""
	var total = 0
	for npc_id in pending_deliveries:
		for finding_id in pending_deliveries[npc_id]:
			if finding_id in findings:
				total += findings[finding_id].restore_value
	for npc_id in completed_deliveries:
		for finding_id in completed_deliveries[npc_id]:
			if finding_id in findings:
				total += findings[finding_id].restore_value
	return total

#  Save/Load 

func get_save_data() -> Dictionary:
	var findings_data = {}
	for f_id in discovered_findings:
		findings_data[f_id] = {
			"count": discovered_findings[f_id],
			"discovered_date": findings[f_id].found_date
		}
	
	return {
		"discovered_findings": findings_data,
		"pending_deliveries": pending_deliveries,
		"completed_deliveries": completed_deliveries
	}

func load_from_save_data(save_data: Dictionary) -> void:
	discovered_findings.clear()
	pending_deliveries.clear()
	completed_deliveries.clear()
	
	for f_id in save_data.get("discovered_findings", {}):
		discovered_findings[f_id] = save_data["discovered_findings"][f_id].get("count", 0)
		if f_id in findings:
			findings[f_id].discovered = discovered_findings[f_id] > 0
			findings[f_id].found_date = save_data["discovered_findings"][f_id].get("discovered_date", 0.0)

	for npc_id in save_data.get("pending_deliveries", {}):
		pending_deliveries[npc_id] = save_data["pending_deliveries"][npc_id].duplicate()

	for npc_id in save_data.get("completed_deliveries", {}):
		completed_deliveries[npc_id] = save_data["completed_deliveries"][npc_id].duplicate()
	
	print("[KingdomFindings] Loaded: %d discovered, %d pending NPCs, %d completed NPCs" % [discovered_findings.size(), pending_deliveries.size(), completed_deliveries.size()])



