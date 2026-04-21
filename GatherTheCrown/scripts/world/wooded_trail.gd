extends Node2D
## Wooded Trail - Exploration and combat zone
## Harder enemy roster: Orc Warriors, Skeleton Guards, Bandit Rogues, Crown Knights

## Enemy type definitions for WoodedTrail (intermediate zone).
## These are heavier foes than the CrownrideCircuit starter area.
const ENEMY_DEFS: Dictionary = {
	"orc_warrior": {
		"type": "orc_warrior", "name": "Orc Warrior",
		"class": "knight",
		"hp": 100.0, "speed": 80.0, "behavior": "ground_chase",
		"gc_min": 30, "gc_max": 55, "attack_cooldown": 1.8
	},
	"skeleton_guard": {
		"type": "skeleton_guard", "name": "Skeleton Guard",
		"class": "raider",
		"hp": 80.0, "speed": 60.0, "behavior": "ground_patrol",
		"gc_min": 22, "gc_max": 40, "attack_cooldown": 1.6
	},
	"bandit_rogue": {
		"type": "bandit_rogue", "name": "Bandit Rogue",
		"class": "raider",
		"hp": 70.0, "speed": 100.0, "behavior": "ground_chase",
		"gc_min": 25, "gc_max": 45, "attack_cooldown": 1.4
	},
	"crown_knight": {
		"type": "crown_knight", "name": "Crown Knight",
		"class": "knight",
		"hp": 135.0, "speed": 110.0, "behavior": "ground_chase",
		"gc_min": 55, "gc_max": 90, "attack_cooldown": 2.2
	}
}

## Positions and which enemy type spawns there
## Orc Warriors and Skeleton Guards in the deeper woods;
## Bandit Rogues near the trail edges; Crown Knight guarding the boss approach
var _enemy_spawn_table: Array = [
	{"pos": Vector2(400, 200), "type": "orc_warrior"},
	{"pos": Vector2(800, 400), "type": "skeleton_guard"},
	{"pos": Vector2(200, 600), "type": "bandit_rogue"},
	{"pos": Vector2(650, 550), "type": "orc_warrior"},
	{"pos": Vector2(950, 200), "type": "crown_knight"},
]

func _ready() -> void:
	print("Wooded Trail loaded")
	GameState.current_zone = "WoodedTrail"
	EventBus.zone_changed.emit("WoodedTrail")

	# Spawn creat only if lifecycle confirms it is active and not already present
	if CompanionLifecycle.current_state == CompanionLifecycle.LifecycleState.CREAT_ACTIVE and not has_node("FireCreat"):
		var creat_path = CompanionLifecycle.get_creat_scene_path(CompanionLifecycle.egg_type)
		var creat_scene = load(creat_path)
		if creat_scene:
			var creat = creat_scene.instantiate()
			add_child(creat)
			var player = $Player
			if player:
				creat.global_position = player.global_position + Vector2(50, 0)
			print("Creat re-spawned in wooded trail")

	for entry in _enemy_spawn_table:
		spawn_typed_enemy(entry["pos"], entry["type"])

	spawn_boss(Vector2(1100, 300))

func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("interact"):
		var player = $Player
		if player and player.global_position.distance_to($ExitMarker.global_position) < 50:
			print("Returning to Greenwood Clearing...")
			SceneRouter.go_to_zone("res://scenes/world/GreenwoodClearing.tscn")

func spawn_typed_enemy(position: Vector2, type_key: String) -> void:
	var enemy_scene = load("res://scenes/actors/enemies/Enemy.tscn")
	if not enemy_scene:
		return
	var enemy = enemy_scene.instantiate()
	enemy.global_position = position
	add_child(enemy)

	var type_data: Dictionary = ENEMY_DEFS.get(type_key, ENEMY_DEFS["orc_warrior"])
	enemy.set_meta("enemy_type", type_data["type"])
	if enemy.has_method("apply_type_data"):
		enemy.call("apply_type_data", type_data)
	else:
		var health = enemy.get_node_or_null("Health")
		if health:
			health.max_hp = float(type_data.get("hp", 100.0))
			health.current_hp = health.max_hp
		enemy.set("movement_speed", float(type_data.get("speed", 80.0)))

	print("Spawned %s at %s" % [type_data["name"], position])

## Legacy helper — spawns a default Orc Warrior (keeps old call sites working)
func spawn_enemy(position: Vector2) -> void:
	spawn_typed_enemy(position, "orc_warrior")

func spawn_boss(position: Vector2) -> void:
	var boss = load("res://scenes/actors/enemies/Boss.tscn").instantiate()
	boss.global_position = position
	add_child(boss)
	print("Boss spawned at: ", position)
