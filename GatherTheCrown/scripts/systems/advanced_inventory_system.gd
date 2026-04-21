extends Node
## AdvancedInventorySystem - Tabbed inventory with categories, smart scaling, and home storage
## Replaces the basic inventory system with structure that scales to 1000+ items

enum InventoryTab {
	GEAR,       # Clothing
	PROVISIONS, # Food & consumables
	ARMORY,     # Weapons & tools
	ARCANA,     # Spells, scrolls, magic
	MATERIALS,  # Crafting & restoration
	TRADE,      # Sellables
	CREAT,      # Creat care
	QUEST       # Quest items, locked
}

enum ItemCategory {
	# GEAR
	HEAD, UPPER, LOWER, HANDS, FEET, OUTERWEAR, ACCESSORIES,
	# PROVISIONS
	MEALS, RAW, FRUITS, LIQUIDS, TREATS, SPECIAL_FOOD,
	# ARMORY
	BLADES, POLEARMS, BLUNT, RANGED, TOOLS, SPECIAL_WEAPONS,
	# ARCANA
	SCROLLS, RUNES, RELICS, CHARMS, MAGIC_CONSUMABLES,
	# MATERIALS
	COMMON_MAT, REFINED_MAT, ELEMENTAL, ORGANIC, STRUCTURAL, RARE_MAT,
	# TRADE
	VALUABLES, ARTIFACTS, BULK_GOODS, CURIOSITIES,
	# CREAT
	EGGS, CREAT_FOOD, CARE_ITEMS, CREAT_ACCESSORIES, TRAINING,
	# QUEST
	MAIN_QUEST, SIDE_QUEST, LORE
}

class ItemData:
	var id: String
	var category: ItemCategory
	var tab: InventoryTab
	var max_stack: int
	var quantity: int = 0
	var acquired_time: float = 0.0
	var is_new: bool = false  # Highlight recently acquired
	
	func _init(p_id: String, p_cat: ItemCategory, p_tab: InventoryTab, p_stack: int) -> void:
		id = p_id
		category = p_cat
		tab = p_tab
		max_stack = p_stack
		acquired_time = Time.get_ticks_msec() / 1000.0

# Player inventory (carries with hero)
var player_inventory: Dictionary = {}  # item_id  ItemData

# Home base storage (fixed location)
var home_storage: Dictionary = {}  # item_id  ItemData

# Keys (separate system, no slots)
var keyring: Dictionary = {
	"trail_key": 0,
	"town_key": 0,
	"kingdom_key": 0
}

# Item definitions (what each item is)
var item_database: Dictionary = {}

# Player level (affects capacity)
var player_level: int = 1

# Storage capacity (scales)
var max_slots: int = 100
var max_home_slots: int = 300

signal inventory_changed
signal item_added(item_id: String, quantity: int)
signal item_removed(item_id: String, quantity: int)
signal inventory_full(item_id: String, wanted: int, available_space: int)
signal stack_limit_hit(item_id: String, max_stack: int)
signal storage_opened(storage_type: String)  # "player" or "home"
signal key_added(key_type: String, quantity: int)

func _normalize_key_id(key_id: String) -> String:
	match key_id:
		"key_trail", "trail_key":
			return "trail_key"
		"key_town", "town_key":
			return "town_key"
		"key_kingdom", "kingdom_key":
			return "kingdom_key"
		_:
			return key_id

func _ready() -> void:
	print("[AdvancedInventorySystem] Initializing...")
	_initialize_item_database()
	print("[AdvancedInventorySystem] Database initialized with %d items" % item_database.size())
	_update_capacity_for_level(player_level)
	print("[AdvancedInventorySystem] Initialization complete - Player slots: %d, Home slots: %d" % [max_slots, max_home_slots])

#  Initialization 

func _initialize_item_database() -> void:
	"""Register all known items with their categories and stack limits."""
	
	# GEAR - Head
	_register_item("hood_leather", ItemCategory.HEAD, InventoryTab.GEAR, 1)
	_register_item("helm_iron", ItemCategory.HEAD, InventoryTab.GEAR, 1)
	
	# GEAR - Upper
	_register_item("tunic_linen", ItemCategory.UPPER, InventoryTab.GEAR, 1)
	_register_item("armor_bronze", ItemCategory.UPPER, InventoryTab.GEAR, 1)
	
	# GEAR - Outerwear (your "jacket" category)
	_register_item("cloak_wool", ItemCategory.OUTERWEAR, InventoryTab.GEAR, 1)
	_register_item("jacket_padded", ItemCategory.OUTERWEAR, InventoryTab.GEAR, 1)
	
	# PROVISIONS - Meals
	_register_item("bread_loaf", ItemCategory.MEALS, InventoryTab.PROVISIONS, 20)
	_register_item("cooked_meat", ItemCategory.MEALS, InventoryTab.PROVISIONS, 15)
	
	# PROVISIONS - Liquids
	_register_item("water_flask", ItemCategory.LIQUIDS, InventoryTab.PROVISIONS, 10)
	_register_item("mead", ItemCategory.LIQUIDS, InventoryTab.PROVISIONS, 8)
	
	# PROVISIONS - Fruits
	_register_item("apple", ItemCategory.FRUITS, InventoryTab.PROVISIONS, 30)
	_register_item("berry_wild", ItemCategory.FRUITS, InventoryTab.PROVISIONS, 25)
	
	# PROVISIONS - Special (rare food)
	_register_item("honey_jar", ItemCategory.SPECIAL_FOOD, InventoryTab.PROVISIONS, 5)
	_register_item("bond_treat", ItemCategory.SPECIAL_FOOD, InventoryTab.PROVISIONS, 3)
	
	# ARMORY - Blades
	_register_item("sword_bronze", ItemCategory.BLADES, InventoryTab.ARMORY, 1)
	_register_item("dagger_steel", ItemCategory.BLADES, InventoryTab.ARMORY, 2)
	
	# ARMORY - Tools
	_register_item("pickaxe", ItemCategory.TOOLS, InventoryTab.ARMORY, 1)
	_register_item("hatchet", ItemCategory.TOOLS, InventoryTab.ARMORY, 1)
	
	# ARCANA - Scrolls
	_register_item("scroll_fire", ItemCategory.SCROLLS, InventoryTab.ARCANA, 3)
	_register_item("scroll_healing", ItemCategory.SCROLLS, InventoryTab.ARCANA, 2)
	
	# ARCANA - Consumables
	_register_item("potion_health", ItemCategory.MAGIC_CONSUMABLES, InventoryTab.ARCANA, 10)
	_register_item("potion_mana", ItemCategory.MAGIC_CONSUMABLES, InventoryTab.ARCANA, 8)
	
	# MATERIALS - Structural (your restoration items!)
	_register_item("glass_shard", ItemCategory.STRUCTURAL, InventoryTab.MATERIALS, 250)
	_register_item("door_hinge", ItemCategory.STRUCTURAL, InventoryTab.MATERIALS, 50)
	_register_item("window_pane", ItemCategory.STRUCTURAL, InventoryTab.MATERIALS, 100)
	_register_item("timber_beam", ItemCategory.STRUCTURAL, InventoryTab.MATERIALS, 30)
	
	# MATERIALS - Common
	_register_item("wood_log", ItemCategory.COMMON_MAT, InventoryTab.MATERIALS, 99)
	_register_item("stone_block", ItemCategory.COMMON_MAT, InventoryTab.MATERIALS, 99)
	
	# MATERIALS - Elemental
	_register_item("shard_fire", ItemCategory.ELEMENTAL, InventoryTab.MATERIALS, 50)
	_register_item("shard_ice", ItemCategory.ELEMENTAL, InventoryTab.MATERIALS, 50)
	
	# TRADE - Valuables
	_register_item("gem_ruby", ItemCategory.VALUABLES, InventoryTab.TRADE, 20)
	_register_item("coin_gold", ItemCategory.VALUABLES, InventoryTab.TRADE, 999)
	
	# CREAT - Food
	_register_item("creat_meal", ItemCategory.CREAT_FOOD, InventoryTab.CREAT, 30)
	_register_item("creat_treat", ItemCategory.CREAT_FOOD, InventoryTab.CREAT, 10)
	
	# CREAT - Care
	_register_item("bond_tonic", ItemCategory.CARE_ITEMS, InventoryTab.CREAT, 5)
	_register_item("grooming_kit", ItemCategory.CARE_ITEMS, InventoryTab.CREAT, 3)
	
	# QUEST - Keys (these actually go in keyring, but listed here for reference)
	_register_item("key_trail", ItemCategory.MAIN_QUEST, InventoryTab.QUEST, 99)
	_register_item("key_town", ItemCategory.MAIN_QUEST, InventoryTab.QUEST, 99)
	_register_item("key_kingdom", ItemCategory.MAIN_QUEST, InventoryTab.QUEST, 99)

func _register_item(item_id: String, category: ItemCategory, tab: InventoryTab, max_stack: int) -> void:
	item_database[item_id] = {
		"category": category,
		"tab": tab,
		"max_stack": max_stack
	}

func _update_capacity_for_level(level: int) -> void:
	"""Scale inventory capacity based on player level."""
	player_level = level
	
	# Player inventory scaling
	match level:
		1:
			max_slots = 100
		10:
			max_slots = 125
		20:
			max_slots = 150
		30:
			max_slots = 175
		_:
			if level >= 40:
				max_slots = 200
			else:
				max_slots = int(100 + ((level / 40.0) * 100.0))
	
	# Home storage can be expanded via restoration or kingdoms findings
	# Start at 300, grows with progression
	max_home_slots = 300 + (level * 10)
	
	print("Inventory capacity updated for level %d: Player=%d slots, Home=%d slots" % [level, max_slots, max_home_slots])

#  Item Management 

func add_item(item_id: String, quantity: int = 1, storage_type: String = "player") -> bool:
	"""Add item to inventory. Returns true if fully added, false if partial/rejected."""
	if quantity <= 0:
		return false
	var requested_quantity := quantity
	
	var storage = player_inventory if storage_type == "player" else home_storage
	var max_capacity = max_slots if storage_type == "player" else max_home_slots
	
	# Get item data
	if not item_id in item_database:
		print("ERROR: Item not registered: %s" % item_id)
		return false
	
	var db_item = item_database[item_id]
	var max_stack = db_item.get("max_stack", 1)
	
	# Special handling for keys
	if item_id in ["key_trail", "key_town", "key_kingdom"]:
		return add_key(_normalize_key_id(item_id), quantity)
	
	# Stack into existing item or create new
	if item_id in storage:
		var current = storage[item_id]
		var can_add = max_stack - current.quantity
		if can_add <= 0:
			stack_limit_hit.emit(item_id, max_stack)
			return false
		
		var to_add = min(quantity, can_add)
		current.quantity += to_add
		current.is_new = true
		quantity -= to_add
	else:
		# Add new stack if space available
		if storage.size() >= max_capacity:
			inventory_full.emit(item_id, quantity, 0)
			return false
		
		var new_item = ItemData.new(item_id, db_item.get("category"), db_item.get("tab"), max_stack)
		new_item.quantity = min(quantity, max_stack)
		new_item.is_new = true
		storage[item_id] = new_item
		quantity -= new_item.quantity
	
	# If quantity remains, overflow (reject or queue to home storage)
	if quantity > 0 and storage_type == "player":
		print("Partial add: %d of %s added, %d overflow" % [storage[item_id].quantity, item_id, quantity])

	var added_quantity := requested_quantity - quantity
	if added_quantity > 0:
		item_added.emit(item_id, added_quantity)
	inventory_changed.emit()
	return quantity == 0

func remove_item(item_id: String, quantity: int = 1, storage_type: String = "player") -> bool:
	"""Remove item from inventory."""
	var storage = player_inventory if storage_type == "player" else home_storage
	
	if item_id not in storage:
		return false
	
	if storage[item_id].quantity < quantity:
		return false
	
	storage[item_id].quantity -= quantity
	if storage[item_id].quantity <= 0:
		storage.erase(item_id)
	
	item_removed.emit(item_id, quantity)
	inventory_changed.emit()
	return true

func get_item_count(item_id: String, storage_type: String = "player") -> int:
	"""Get quantity of an item."""
	var storage = player_inventory if storage_type == "player" else home_storage
	if item_id in storage:
		return storage[item_id].quantity
	return 0

#  Keyring System (no slots) 

func add_key(key_id: String, quantity: int = 1) -> bool:
	"""Add a key (doesn't use inventory slots)."""
	var normalized_key_id := _normalize_key_id(key_id)
	if normalized_key_id not in keyring:
		return false
	
	keyring[normalized_key_id] += quantity
	key_added.emit(normalized_key_id, quantity)
	print("Key added: %s (x%d)" % [normalized_key_id, keyring[normalized_key_id]])
	return true

func get_key_count(key_id: String) -> int:
	"""Get quantity of a specific key."""
	return keyring.get(_normalize_key_id(key_id), 0)

func has_key(key_id: String) -> bool:
	"""Check if hero has at least one of this key."""
	return keyring.get(_normalize_key_id(key_id), 0) > 0

#  Inventory Views 

func get_items_in_tab(tab: InventoryTab, storage_type: String = "player") -> Array:
	"""Get all items in a specific tab."""
	var storage = player_inventory if storage_type == "player" else home_storage
	var result = []
	
	for item_id in storage:
		if storage[item_id].tab == tab:
			result.append(storage[item_id])
	
	return result

func get_items_in_category(category: ItemCategory, storage_type: String = "player") -> Array:
	"""Get all items in a specific category."""
	var storage = player_inventory if storage_type == "player" else home_storage
	var result = []
	
	for item_id in storage:
		if storage[item_id].category == category:
			result.append(storage[item_id])
	
	return result

func get_all_items(storage_type: String = "player") -> Array:
	"""Get all items, optionally filtered by status."""
	storage_opened.emit(storage_type)
	var storage = player_inventory if storage_type == "player" else home_storage
	var result = []
	
	for item_id in storage:
		result.append(storage[item_id])
	
	return result

func get_recently_acquired(storage_type: String = "player", since_seconds: float = 60.0) -> Array:
	"""Get items acquired in last N seconds."""
	var storage = player_inventory if storage_type == "player" else home_storage
	var now: float = Time.get_ticks_msec() / 1000.0
	var result = []
	
	for item_id in storage:
		var item = storage[item_id]
		if now - item.acquired_time < since_seconds:
			result.append(item)
	
	return result

#  Storage Queries 

func get_used_slots(storage_type: String = "player") -> int:
	"""How many slots are currently used."""
	var storage = player_inventory if storage_type == "player" else home_storage
	return storage.size()

func get_available_slots(storage_type: String = "player") -> int:
	"""How many slots remain."""
	var max_cap = max_slots if storage_type == "player" else max_home_slots
	return max_cap - get_used_slots(storage_type)

func get_storage_percent(storage_type: String = "player") -> float:
	"""Inventory fill percentage (0.0 to 1.0)."""
	var max_cap = max_slots if storage_type == "player" else max_home_slots
	return float(get_used_slots(storage_type)) / float(max_cap)

#  Save/Load 

func get_save_data() -> Dictionary:
	"""Export inventory for SaveManager."""
	var inv_data = {}
	for item_id in player_inventory:
		inv_data[item_id] = player_inventory[item_id].quantity
	
	var home_data = {}
	for item_id in home_storage:
		home_data[item_id] = home_storage[item_id].quantity
	
	return {
		"player_inventory": inv_data,
		"home_storage": home_data,
		"keyring": keyring,
		"player_level": player_level
	}

func load_from_save_data(save_data: Dictionary) -> void:
	"""Restore inventory from SaveManager."""
	print("[AdvancedInventorySystem] Loading from save data...")
	player_inventory.clear()
	home_storage.clear()
	
	# Restore player inventory
	var player_count = 0
	for item_id in save_data.get("player_inventory", {}):
		var quantity = save_data["player_inventory"][item_id]
		if add_item(item_id, quantity, "player"):
			player_count += 1
	print("[AdvancedInventorySystem] Restored %d player inventory stacks" % player_count)
	
	# Restore home storage
	var home_count = 0
	for item_id in save_data.get("home_storage", {}):
		var quantity = save_data["home_storage"][item_id]
		if add_item(item_id, quantity, "home"):
			home_count += 1
	print("[AdvancedInventorySystem] Restored %d home storage stacks" % home_count)
	
	# Restore keys
	var loaded_keyring: Dictionary = save_data.get("keyring", {})
	for key_id in keyring.keys():
		keyring[key_id] = int(loaded_keyring.get(key_id, 0))
	print("[AdvancedInventorySystem] Keyring restored")
	
	# Update capacity for loaded level
	player_level = save_data.get("player_level", 1)
	_update_capacity_for_level(player_level)
	print("[AdvancedInventorySystem] Load complete")
	
	print("Inventory loaded: %d player items, %d home items, keys: %s" % [player_inventory.size(), home_storage.size(), keyring])



