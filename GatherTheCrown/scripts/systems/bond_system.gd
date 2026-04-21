extends Node
## Manages Creat bond / affection mechanics

var creat_bonds: Dictionary = {}  # creat_id -> bond_value (0.0 to 1.0)
var creat_hunger: Dictionary = {}  # creat_id -> hunger_value (0 to 100)

func _ready() -> void:
	print("BondSystem initialized")

func increase_bond(creat_id: String, delta: float) -> void:
	if creat_id not in creat_bonds:
		creat_bonds[creat_id] = 0.5
	
	var old_bond = creat_bonds[creat_id]
	creat_bonds[creat_id] = clamp(creat_bonds[creat_id] + delta, 0.0, 1.0)
	
	EventBus.bond_changed.emit(creat_id, creat_bonds[creat_id], creat_bonds[creat_id] - old_bond)

func decrease_hunger(creat_id: String, food_value: int) -> void:
	if creat_id not in creat_hunger:
		creat_hunger[creat_id] = 50
	
	creat_hunger[creat_id] = max(0, creat_hunger[creat_id] - food_value)
	
	# Bonus bond from feeding
	increase_bond(creat_id, 0.05)
	
	EventBus.creat_fed.emit(creat_id, "food_item", 0.05)

func get_bond(creat_id: String) -> float:
	if creat_id not in creat_bonds:
		creat_bonds[creat_id] = 0.5
	return creat_bonds[creat_id]

func get_hunger(creat_id: String) -> float:
	if creat_id not in creat_hunger:
		creat_hunger[creat_id] = 50
	return creat_hunger[creat_id]

func add_bond_xp(amount: float, creat_id: String = "fire_creat") -> void:
	# 100 XP ~= +0.5 bond progress; capped in increase_bond.
	var delta := maxf(0.0, amount) / 200.0
	if delta > 0.0:
		increase_bond(creat_id, delta)

func get_save_data() -> Dictionary:
	return {
		"creat_bonds": creat_bonds.duplicate(true),
		"creat_hunger": creat_hunger.duplicate(true)
	}

func load_save_data(data: Dictionary) -> void:
	if typeof(data) != TYPE_DICTIONARY:
		return
	creat_bonds = data.get("creat_bonds", {}).duplicate(true)
	creat_hunger = data.get("creat_hunger", {}).duplicate(true)
