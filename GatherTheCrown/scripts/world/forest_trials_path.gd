extends Node2D
## ForestTrialsPath - Shared path logic for easy/medium/hard trial branches
## Branches converge to home base once objective is complete.

@export var path_title: String = "Sproutbound Trail"
@export var encounter_min: int = 3
@export var encounter_max: int = 4
@export var egg_discovery_defeat: int = 3
@export var estimated_time: String = "5-8 min"
@export var theme_color: Color = Color(0.16, 0.28, 0.14, 1)

const PLAYER_SPAWN := Vector2(560, 390)
const FOE_SPAWN := Vector2(760, 390)

const ENEMY_DEFS: Dictionary = {
	"goblin_scout": {
		"type": "goblin_scout", "name": "Goblin Scout",
		"class": "scout",
		"hp": 60.0, "speed": 120.0, "behavior": "ground_chase",
		"gc_min": 10, "gc_max": 25, "attack_cooldown": 1.2
	},
	"forest_bat": {
		"type": "forest_bat", "name": "Forest Bat",
		"class": "scout",
		"hp": 40.0, "speed": 150.0, "behavior": "flying",
		"gc_min": 6, "gc_max": 15, "attack_cooldown": 0.9
	},
	"cave_bat": {
		"type": "cave_bat", "name": "Cave Bat",
		"class": "scout",
		"hp": 30.0, "speed": 180.0, "behavior": "flying",
		"gc_min": 4, "gc_max": 10, "attack_cooldown": 0.75
	},
	"bandit_rogue": {
		"type": "bandit_rogue", "name": "Bandit Rogue",
		"class": "raider",
		"hp": 70.0, "speed": 100.0, "behavior": "ground_chase",
		"gc_min": 18, "gc_max": 38, "attack_cooldown": 1.4
	},
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
	"crown_knight": {
		"type": "crown_knight", "name": "Crown Knight",
		"class": "knight",
		"hp": 135.0, "speed": 110.0, "behavior": "ground_chase",
		"gc_min": 55, "gc_max": 90, "attack_cooldown": 2.2
	}
}

const TRIAL_POOLS: Dictionary = {
	"sproutbound": [
		{"type": "goblin_scout", "weight": 45},
		{"type": "forest_bat", "weight": 35},
		{"type": "cave_bat", "weight": 20}
	],
	"emberroot": [
		{"type": "goblin_scout", "weight": 24},
		{"type": "forest_bat", "weight": 18},
		{"type": "bandit_rogue", "weight": 30},
		{"type": "skeleton_guard", "weight": 20},
		{"type": "orc_warrior", "weight": 8}
	],
	"crownfire": [
		{"type": "bandit_rogue", "weight": 22},
		{"type": "orc_warrior", "weight": 30},
		{"type": "skeleton_guard", "weight": 28},
		{"type": "crown_knight", "weight": 8},
		{"type": "cave_bat", "weight": 5}
	]
}

var player: Node
var encounter_goal: int = 0
var defeats: int = 0
var active_enemy: Node
var egg_found: bool = false
var run_completed: bool = false
var _active_marker: Node2D
var _debug_player_marker: Polygon2D
var _debug_foe_marker: Polygon2D
var _debug_ring: Line2D

@onready var title_label: Label = $TitleLabel
@onready var status_label: Label = $StatusLabel
@onready var hint_label: Label = $HintLabel
@onready var backdrop: ColorRect = $ColorRect

func _ready() -> void:
	GameState.current_zone = "ForestTrialsPath"
	_cleanup_blocking_overlays()
	_set_daynight_overlay_visible(false)
	if backdrop:
		backdrop.color = theme_color
	if title_label:
		title_label.text = "%s | ETA %s" % [path_title, estimated_time]
	if hint_label:
		hint_label.text = "Move with WASD/Arrows. Press [Space] near foe to resolve encounter. Press [Esc] to return."

	encounter_goal = randi_range(encounter_min, encounter_max)
	_spawn_player()
	_ensure_active_camera()
	_spawn_next_enemy()
	_spawn_debug_fallbacks()
	_log_runtime_evidence()
	_update_status()

func _process(_delta: float) -> void:
	if run_completed:
		return

	if _active_marker and active_enemy and is_instance_valid(active_enemy):
		_active_marker.global_position = active_enemy.global_position
	if _debug_ring and active_enemy and is_instance_valid(active_enemy):
		_debug_ring.global_position = active_enemy.global_position

func _unhandled_input(event: InputEvent) -> void:
	if run_completed:
		return

	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_ESCAPE:
			_set_daynight_overlay_visible(true)
			SceneRouter.go_to_zone("res://scenes/world/ForestTrialsEntrance.tscn")
			get_viewport().set_input_as_handled()
			return

		if event.keycode == KEY_SPACE or event.is_action_pressed("attack"):
			_attempt_resolve_encounter()
			get_viewport().set_input_as_handled()

func _spawn_player() -> void:
	var preplaced_player: Node2D = get_node_or_null("StaticPlayer") as Node2D
	if preplaced_player:
		player = preplaced_player
		player.add_to_group("player")
		player.global_position = PLAYER_SPAWN
		print("[ForestTrialsPath] Using preplaced player at ", player.global_position)
		return

	var player_scene = load("res://scenes/actors/player/Player.tscn")
	if player_scene == null:
		push_warning("[ForestTrialsPath] Could not load player scene")
		return

	player = player_scene.instantiate()
	add_child(player)
	player.global_position = PLAYER_SPAWN
	player.add_to_group("player")
	print("[ForestTrialsPath] Player spawned at ", player.global_position)

func _spawn_next_enemy() -> void:
	if defeats >= encounter_goal:
		_complete_path()
		return

	var preplaced_enemy: Node2D = get_node_or_null("StaticEnemy") as Node2D
	if preplaced_enemy:
		active_enemy = preplaced_enemy
		active_enemy.global_position = FOE_SPAWN
		_spawn_active_marker(active_enemy.global_position)
		print("[ForestTrialsPath] Using preplaced enemy at ", active_enemy.global_position)
		var hp_pre: Node = active_enemy.get_node_or_null("Health") as Node
		if hp_pre and hp_pre.has_signal("died") and not hp_pre.died.is_connected(_on_enemy_died):
			hp_pre.died.connect(_on_enemy_died)
		return

	var enemy_scene = load("res://scenes/actors/enemies/Enemy.tscn")
	if enemy_scene == null:
		push_warning("[ForestTrialsPath] Could not load enemy scene")
		return

	active_enemy = enemy_scene.instantiate()
	add_child(active_enemy)
	active_enemy.global_position = FOE_SPAWN
	var enemy_type := _roll_trial_enemy_type()
	var enemy_data := ENEMY_DEFS.get(enemy_type, ENEMY_DEFS["goblin_scout"])
	active_enemy.set_meta("enemy_type", enemy_type)
	if active_enemy.has_method("apply_type_data"):
		active_enemy.call("apply_type_data", enemy_data)
	if hint_label:
		hint_label.text = "Encounter %d/%d: %s nearby. Press [Space] in range." % [defeats + 1, encounter_goal, String(enemy_data["name"])]
	_spawn_active_marker(active_enemy.global_position)
	print("[ForestTrialsPath] Enemy spawned at ", active_enemy.global_position)

	var health = active_enemy.get_node_or_null("Health")
	if health and health.has_signal("died") and not health.died.is_connected(_on_enemy_died):
		health.died.connect(_on_enemy_died)

func _roll_trial_enemy_type() -> String:
	var route_key := _route_key()
	var pool: Array = TRIAL_POOLS.get(route_key, TRIAL_POOLS["sproutbound"])
	var total_weight := 0
	for entry in pool:
		total_weight += int(entry.get("weight", 1))

	var roll := randi_range(0, max(0, total_weight - 1))
	var running := 0
	for entry in pool:
		running += int(entry.get("weight", 1))
		if roll < running:
			return String(entry.get("type", "goblin_scout"))

	return "goblin_scout"

func _route_key() -> String:
	var title := path_title.to_lower()
	if title.find("crownfire") != -1:
		return "crownfire"
	if title.find("emberroot") != -1:
		return "emberroot"
	return "sproutbound"

func _attempt_resolve_encounter() -> void:
	if not active_enemy or not is_instance_valid(active_enemy) or not player:
		if hint_label:
			hint_label.text = "No active foe."
		return

	var player_node: Node2D = player as Node2D
	var enemy_node: Node2D = active_enemy as Node2D
	var distance_to_enemy: float = player_node.global_position.distance_to(enemy_node.global_position)
	if distance_to_enemy > 140.0:
		if hint_label:
			hint_label.text = "Move closer to the red marker. Distance: %d" % int(distance_to_enemy)
		return

	var health: Node = active_enemy.get_node_or_null("Health") as Node
	if health:
		health.take_damage(999)
	else:
		active_enemy.queue_free()

func _on_enemy_died() -> void:
	defeats += 1
	if not egg_found and defeats >= egg_discovery_defeat and CompanionLifecycle.current_state == CompanionLifecycle.LifecycleState.NO_CREAT:
		egg_found = true
		# Show element picker - player chooses the creat's element
		var picker_script = load("res://scripts/ui/egg_element_picker.gd")
		if picker_script:
			var picker: CanvasLayer = picker_script.new() as CanvasLayer
			get_tree().root.add_child(picker)
		if hint_label:
			hint_label.text = "Creat Egg discovered after trial %d! Finish the route to return home." % defeats

	_update_status()
	await get_tree().create_timer(0.35).timeout
	_spawn_next_enemy()

func _update_status() -> void:
	if status_label:
		status_label.text = "Defeats: %d / %d | Egg target: after %d" % [defeats, encounter_goal, egg_discovery_defeat]

func _complete_path() -> void:
	run_completed = true
	if hint_label:
		hint_label.text = "Path converging to Greenwood Clearing..."

	# Ensure players can start care phase once route returns home.
	if CompanionLifecycle.current_state == CompanionLifecycle.LifecycleState.EGG_ACQUIRED:
		CompanionLifecycle.begin_care()

	SaveManager.save_game()
	await get_tree().create_timer(1.0).timeout
	_set_daynight_overlay_visible(true)
	SceneRouter.go_to_zone("res://scenes/world/GreenwoodClearing.tscn")

func _exit_tree() -> void:
	_set_daynight_overlay_visible(true)
	if _active_marker and is_instance_valid(_active_marker):
		_active_marker.queue_free()
	if _debug_player_marker and is_instance_valid(_debug_player_marker):
		_debug_player_marker.queue_free()
	if _debug_foe_marker and is_instance_valid(_debug_foe_marker):
		_debug_foe_marker.queue_free()
	if _debug_ring and is_instance_valid(_debug_ring):
		_debug_ring.queue_free()

func _set_daynight_overlay_visible(visible: bool) -> void:
	if not has_node("/root/DayNightCycle"):
		return
	var cycle: Node = get_node("/root/DayNightCycle")
	var overlay: CanvasItem = cycle.get_node_or_null("DayNightOverlay") as CanvasItem
	if overlay:
		overlay.visible = visible

func _ensure_active_camera() -> void:
	if player and player.has_node("Camera2D"):
		var player_camera := player.get_node("Camera2D") as Camera2D
		if player_camera:
			player_camera.enabled = true
			player_camera.make_current()
			return

	var fallback_camera := Camera2D.new()
	fallback_camera.name = "RouteCamera"
	fallback_camera.enabled = true
	fallback_camera.global_position = Vector2(640, 360)
	add_child(fallback_camera)
	fallback_camera.make_current()

func _spawn_active_marker(at_position: Vector2) -> void:
	var preplaced_ring := get_node_or_null("StaticEncounterRing") as Line2D
	if preplaced_ring:
		preplaced_ring.global_position = at_position
		preplaced_ring.visible = true
		preplaced_ring.z_index = 301

	if _active_marker and is_instance_valid(_active_marker):
		_active_marker.queue_free()

	_active_marker = Node2D.new()
	_active_marker.name = "EncounterMarker"
	_active_marker.global_position = at_position
	add_child(_active_marker)

	var ring := Line2D.new()
	ring.width = 3.0
	ring.default_color = Color(1.0, 0.26, 0.22, 0.95)
	for i in range(24):
		var t := TAU * float(i) / 24.0
		ring.add_point(Vector2(cos(t), sin(t)) * 24.0)
	ring.add_point(ring.points[0])
	_active_marker.add_child(ring)

func _cleanup_blocking_overlays() -> void:
	var root := get_tree().root
	for child in root.get_children():
		if child.name == "MapScreen" or child.name == "PreBattlePrep":
			child.queue_free()

func _spawn_debug_fallbacks() -> void:
	if _debug_player_marker == null or not is_instance_valid(_debug_player_marker):
		_debug_player_marker = Polygon2D.new()
		_debug_player_marker.name = "DebugPlayerMarker"
		_debug_player_marker.polygon = PackedVector2Array([
			Vector2(0, -28), Vector2(24, 0), Vector2(0, 28), Vector2(-24, 0)
		])
		_debug_player_marker.color = Color(0.20, 0.72, 1.0, 0.96)
		_debug_player_marker.z_index = 300
		add_child(_debug_player_marker)

	if _debug_foe_marker == null or not is_instance_valid(_debug_foe_marker):
		_debug_foe_marker = Polygon2D.new()
		_debug_foe_marker.name = "DebugFoeMarker"
		_debug_foe_marker.polygon = PackedVector2Array([
			Vector2(0, -30), Vector2(26, 0), Vector2(0, 30), Vector2(-26, 0)
		])
		_debug_foe_marker.color = Color(1.0, 0.22, 0.22, 0.98)
		_debug_foe_marker.z_index = 300
		add_child(_debug_foe_marker)

	if _debug_ring == null or not is_instance_valid(_debug_ring):
		_debug_ring = Line2D.new()
		_debug_ring.name = "DebugEncounterRing"
		_debug_ring.width = 8.0
		_debug_ring.default_color = Color(1.0, 0.95, 0.15, 0.96)
		_debug_ring.z_index = 301
		for i in range(32):
			var t := TAU * float(i) / 32.0
			_debug_ring.add_point(Vector2(cos(t), sin(t)) * 42.0)
		_debug_ring.add_point(_debug_ring.points[0])
		add_child(_debug_ring)

	if player and is_instance_valid(player):
		_debug_player_marker.global_position = player.global_position
	else:
		_debug_player_marker.global_position = PLAYER_SPAWN

	if active_enemy and is_instance_valid(active_enemy):
		_debug_foe_marker.global_position = active_enemy.global_position
		_debug_ring.global_position = active_enemy.global_position
	else:
		_debug_foe_marker.global_position = FOE_SPAWN
		_debug_ring.global_position = FOE_SPAWN

func _log_runtime_evidence() -> void:
	var cam: Camera2D = get_viewport().get_camera_2d()
	var cam_rect: Rect2 = Rect2(Vector2.ZERO, get_viewport_rect().size)
	if cam:
		var size: Vector2 = get_viewport_rect().size * cam.zoom
		cam_rect = Rect2(cam.global_position - size * 0.5, size)

	print("[ForestTrialsPath][Evidence] root=", name, " parent=", get_parent().name if get_parent() else "<none>")
	print("[ForestTrialsPath][Evidence] cam_rect=", cam_rect)
	_log_node_state("player", player, cam_rect)
	_log_node_state("foe", active_enemy, cam_rect)
	_log_node_state("encounter_marker", _active_marker, cam_rect)
	_log_node_state("debug_player", _debug_player_marker, cam_rect)
	_log_node_state("debug_foe", _debug_foe_marker, cam_rect)
	_log_node_state("debug_ring", _debug_ring, cam_rect)

func _log_node_state(label: String, node: Node, cam_rect: Rect2) -> void:
	if node == null or not is_instance_valid(node):
		print("[ForestTrialsPath][Evidence] ", label, " present=false")
		return

	if node is CanvasItem:
		var c: CanvasItem = node as CanvasItem
		var p_name: String = c.get_parent().name if c.get_parent() else "<none>"
		var inside: bool = cam_rect.has_point(c.global_position)
		print("[ForestTrialsPath][Evidence] ", label,
			" present=true",
			" parent=", p_name,
			" pos=", c.global_position,
			" in_camera=", inside,
			" visible=", c.visible,
			" modulate=", c.modulate,
			" scale=", c.scale,
			" z_index=", c.z_index)
	else:
		var p_name2: String = node.get_parent().name if node.get_parent() else "<none>"
		print("[ForestTrialsPath][Evidence] ", label, " present=true parent=", p_name2, " (non-CanvasItem)")
