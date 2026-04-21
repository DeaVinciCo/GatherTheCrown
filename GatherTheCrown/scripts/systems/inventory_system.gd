extends Node
## Inventory management system

var inventory: Dictionary = {}  # item_id -> quantity

const PREMIUM_DISPLAY_NAMES := {
	"food_basic": "Wayfarer Provisions",
	"shard_bronze": "Embersteel Shard",
	"shard_iron": "Dreadsteel Shard",
	"shard_silver": "Moonsteel Shard",
	"shard_gold": "Aurorite Shard",
	"shard_obsidian": "Osmium-Bixbite Shard",
	"shard_crystal": "Aethersteel Shard",
	"shard_runic": "Starforged Shard",
	"metal_fragment_bronze": "Embersteel Fragment",
	"metal_fragment_iron": "Dreadsteel Fragment",
	"metal_fragment_silver": "Moonsteel Fragment",
	"embersteel_fragment": "Embersteel Fragment",
	"dreadsteel_fragment": "Dreadsteel Fragment",
	"moonsteel_fragment": "Moonsteel Fragment",
	"starglass_shard": "Starglass Shard",
	"gem_red": "Dragonheart Ruby",
	"gem_blue": "Abyss Sapphire",
	"gem_green": "Verdant Alexandrite",
	"gem_yellow": "Solar Topaz",
	"gem_clear": "Storm Quartz",
	"gem_purple": "Void Amethyst",
	"gem_black": "Nightfall Painite"
}

func _ready() -> void:
	print("InventorySystem initialized")
	# Start with some basic items for MVP testing
	add_item("food_basic", 5)
	add_item("embersteel_fragment", 10)

func add_item(item_id: String, quantity: int = 1) -> void:
	if quantity <= 0:
		return

	if item_id not in inventory:
		inventory[item_id] = 0
	
	inventory[item_id] += quantity

	var crown_system = get_node_or_null("/root/CrownProgressionSystem")
	if crown_system and crown_system.has_method("register_collectible"):
		crown_system.register_collectible(item_id, quantity)

	EventBus.item_added.emit(item_id, quantity)
	EventBus.inventory_changed.emit()
	_emit_currency_signal(item_id)
	print("Added ", quantity, "x ", item_id)

func remove_item(item_id: String, quantity: int = 1) -> bool:
	if item_id not in inventory or inventory[item_id] < quantity:
		return false
	
	inventory[item_id] -= quantity
	if inventory[item_id] <= 0:
		inventory.erase(item_id)
	
	EventBus.item_removed.emit(item_id, quantity)
	EventBus.inventory_changed.emit()
	_emit_currency_signal(item_id)
	return true

## Emit gem/shard signals so HUD can react without polling
func _emit_currency_signal(item_id: String) -> void:
	var crown_sys = get_node_or_null("/root/CrownProgressionSystem")
	if not crown_sys:
		return
	var normalized: String = crown_sys.normalize_collectible(item_id)
	if normalized == "":
		return
	var count: int = inventory.get(normalized, 0)
	if normalized.begins_with("gem_"):
		EventBus.gem_changed.emit(normalized, count)
	elif normalized.begins_with("shard_"):
		EventBus.shard_changed.emit(normalized, count)

func has_item(item_id: String, quantity: int = 1) -> bool:
	return inventory.get(item_id, 0) >= quantity

func get_item_count(item_id: String) -> int:
	return inventory.get(item_id, 0)

func get_item_display_name(item_id: String) -> String:
	if PREMIUM_DISPLAY_NAMES.has(item_id):
		return String(PREMIUM_DISPLAY_NAMES[item_id])
	return String(item_id).replace("_", " ").capitalize()

func get_all_items() -> Dictionary:
	return inventory.duplicate()

func set_inventory(items: Dictionary) -> void:
	inventory = {}
	for item_id in items.keys():
		inventory[String(item_id)] = int(items[item_id])
	EventBus.inventory_changed.emit()

func clear_inventory() -> void:
	inventory.clear()
	EventBus.inventory_changed.emit()
