extends Node2D
## Crownride Circuit - first playable overworld screen with pickups and enemy pressure.

@export var mode_name: String = "Crownride Racing"
@export var unlock_condition: String = ""

const ENEMY_SCENE := preload("res://scenes/actors/enemies/Enemy.tscn")
const PICKUP_SCRIPT := preload("res://scripts/world/ground_pickup.gd")
const TREE_SCRIPT := preload("res://scripts/world/healing_tree.gd")

const FOREST_TRIALS_SCENE := "res://scenes/world/ForestTrialsEntrance.tscn"
const HOME_BASE_SCENE := "res://scenes/world/GreenwoodClearing.tscn"

const PIXELS_PER_METER: float = 64.0
const ENEMY_AGGRO_METERS: float = 5.0
const DARK_GREEN := Color(34.0 / 255.0, 100.0 / 255.0, 34.0 / 255.0, 1.0)
const LIGHT_GREEN := Color(50.0 / 255.0, 120.0 / 255.0, 50.0 / 255.0, 1.0)
const STONE_GRAY := Color(128.0 / 255.0, 128.0 / 255.0, 128.0 / 255.0, 1.0)
const DARK_STONE := Color(64.0 / 255.0, 64.0 / 255.0, 64.0 / 255.0, 1.0)
const DIRT_A := Color(101.0 / 255.0, 67.0 / 255.0, 33.0 / 255.0, 1.0)
const DIRT_B := Color(139.0 / 255.0, 69.0 / 255.0, 19.0 / 255.0, 1.0)

var _player: Node2D
var _attack_cooldown: float = 0.0
var _rng := RandomNumberGenerator.new()
var _map_screen: Node
var _ui_layer: CanvasLayer
var _inventory_panel: Panel
var _inventory_text: RichTextLabel
var _chat_panel: ColorRect
var _chat_text: RichTextLabel
var _m_key_down: bool = false
var _i_key_down: bool = false
var _shift_key_down: bool = false

var _pickup_spawns := [
	{"id": "embersteel_fragment", "qty": 1, "gc": 40, "name": "Embersteel Fragment", "color": Color(0.75, 0.55, 0.28, 1.0), "pos": Vector2(700, 460)},
	{"id": "gem_green", "qty": 1, "gc": 140, "name": "Verdant Alexandrite", "color": Color(0.22, 0.82, 0.40, 1.0), "pos": Vector2(860, 350)},
	{"id": "food_basic", "qty": 1, "gc": 15, "name": "Wayfarer Provisions", "color": Color(0.95, 0.72, 0.30, 1.0), "pos": Vector2(520, 420)},
	{"id": "dreadsteel_fragment", "qty": 1, "gc": 50, "name": "Dreadsteel Fragment", "color": Color(0.75, 0.76, 0.80, 1.0), "pos": Vector2(980, 280)},
	{"id": "gem_blue", "qty": 1, "gc": 170, "name": "Abyss Sapphire", "color": Color(0.24, 0.56, 0.95, 1.0), "pos": Vector2(390, 350)}
]

var _enemy_spawns := [
	Vector2(980, 500), Vector2(320, 520), Vector2(1090, 280), Vector2(860, 620),
	Vector2(520, 640), Vector2(230, 360), Vector2(1160, 610), Vector2(1090, 430)
]

var _tree_spawns := []

var _safe_zones := [
	{"name": "Ancient Grove", "pos": Vector2(150, 150), "radius": 60.0, "heal_rate": 12.0},
	{"name": "Sacred Spring", "pos": Vector2(1130, 150), "radius": 50.0, "heal_rate": 12.0},
	{"name": "Healing Circle", "pos": Vector2(640, 600), "radius": 55.0, "heal_rate": 14.0},
	{"name": "Sanctuary Stone", "pos": Vector2(200, 520), "radius": 45.0, "heal_rate": 10.0}
]

var _forest_trials_marker: Vector2 = Vector2(1140, 120)
var _home_marker: Vector2 = Vector2(160, 120)

@onready var _title_label: Label = $TitleLabel
@onready var _desc_label: Label = $DescLabel
@onready var _locked_label: Label = $LockedLabel

func _ready() -> void:
	_rng.seed = 1337
	GameState.current_zone = "CrownrideCircuit"
	EventBus.zone_changed.emit("CrownrideCircuit")
	var bg: ColorRect = $Background
	bg.color = DARK_GREEN
	bg.z_index = -50

	_player = $Player
	if _player:
		_player.global_position = Vector2(640, 520)
		var camera: Camera2D = _player.get_node_or_null("Camera2D")
		if camera:
			camera.zoom = Vector2(1.8, 1.8)
			camera.position_smoothing_enabled = true

	_setup_ui_copy()
	_setup_overlay_ui()
	_spawn_safe_zone_rings()
	_spawn_path_guides()
	_spawn_decor_grass()
	_spawn_healing_trees()
	_spawn_pickups()
	_spawn_enemies()
	_print_spawn_report()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.is_action_pressed("map_toggle") or event.keycode == KEY_M:
			_toggle_map_screen()
			get_viewport().set_input_as_handled()
			return
		if event.is_action_pressed("inventory_toggle") or event.keycode == KEY_I:
			_toggle_inventory_panel()
			get_viewport().set_input_as_handled()
			return
		if event.is_action_pressed("chat_toggle") or event.keycode == KEY_SHIFT:
			_toggle_chat_panel()
			get_viewport().set_input_as_handled()
			return
		if event.is_action_pressed("restore_checkpoint"):
			_restore_last_checkpoint()
			get_viewport().set_input_as_handled()
			return

func _process(delta: float) -> void:
	# Fallback hotkeys keep UI toggles responsive even when unhandled input is consumed.
	_process_hotkey_fallbacks()

	if _attack_cooldown > 0.0:
		_attack_cooldown -= delta

	if _player == null:
		return

	_update_route_hint()
	_apply_safe_zone_heal(delta)

	if Input.is_action_just_pressed("attack") and _attack_cooldown <= 0.0:
		_attack_cooldown = 0.22
		_player_attack_nearby_enemies()

	if Input.is_action_just_pressed("interact"):
		_try_scene_route()

func _setup_overlay_ui() -> void:
	_ui_layer = CanvasLayer.new()
	_ui_layer.layer = 20
	add_child(_ui_layer)

	_inventory_panel = Panel.new()
	_inventory_panel.position = Vector2(880, 80)
	_inventory_panel.size = Vector2(360, 540)
	_inventory_panel.visible = false
	_ui_layer.add_child(_inventory_panel)

	var inv_title := Label.new()
	inv_title.text = "Inventory [I]"
	inv_title.position = Vector2(12, 10)
	_inventory_panel.add_child(inv_title)

	_inventory_text = RichTextLabel.new()
	_inventory_text.position = Vector2(12, 38)
	_inventory_text.size = Vector2(336, 490)
	_inventory_text.bbcode_enabled = false
	_inventory_text.fit_content = false
	_inventory_panel.add_child(_inventory_text)

	_chat_panel = ColorRect.new()
	_chat_panel.position = Vector2(860, 460)
	_chat_panel.size = Vector2(400, 220)
	_chat_panel.color = Color(1, 1, 1, 0.15)
	_chat_panel.visible = false
	_ui_layer.add_child(_chat_panel)

	var chat_border := Panel.new()
	chat_border.position = Vector2.ZERO
	chat_border.size = _chat_panel.size
	_chat_panel.add_child(chat_border)

	_chat_text = RichTextLabel.new()
	_chat_text.position = Vector2(12, 10)
	_chat_text.size = Vector2(376, 198)
	_chat_text.bbcode_enabled = false
	_chat_panel.add_child(_chat_text)
	_chat_text.text = "Local Chat [Shift]\n\n- Channel connected.\n- Type chat integration is pending UI pass.\n- M opens atlas map, I opens inventory."

func _toggle_map_screen() -> void:
	if is_instance_valid(_map_screen):
		SceneRouter.close_screen(_map_screen)
		_map_screen = null
		return
	_map_screen = SceneRouter.open_screen("res://scenes/ui/MapScreen.tscn")

func _toggle_inventory_panel() -> void:
	if _inventory_panel == null:
		return
	_inventory_panel.visible = not _inventory_panel.visible
	if _inventory_panel.visible:
		_refresh_inventory_panel()

func _toggle_chat_panel() -> void:
	if _chat_panel == null:
		return
	_chat_panel.visible = not _chat_panel.visible

func _restore_last_checkpoint() -> void:
	var cp = CheckpointSystem.get_current_checkpoint()
	if cp == null:
		_locked_label.text = "No checkpoint found to restore."
		return
	var ok := CheckpointSystem.load_checkpoint(cp.id)
	if not ok:
		_locked_label.text = "Restore failed."
		return
	if cp.zone != GameState.current_zone:
		var zone_to_scene := {
			"CrownrideCircuit": "res://scenes/world/CrownrideCircuit.tscn",
			"ForestTrialsEntrance": "res://scenes/world/ForestTrialsEntrance.tscn",
			"GreenwoodClearing": "res://scenes/world/GreenwoodClearing.tscn",
			"WoodedTrail": "res://scenes/world/WoodedTrail.tscn"
		}
		if zone_to_scene.has(cp.zone):
			SceneRouter.go_to_zone(String(zone_to_scene[cp.zone]))
		else:
			_locked_label.text = "Restored checkpoint in %s" % cp.zone
		return
	if _player:
		_player.global_position = cp.position
	_locked_label.text = "Checkpoint restored: %s" % cp.id

func _refresh_inventory_panel() -> void:
	if _inventory_text == null:
		return
	var lines: Array[String] = []
	lines.append("GC: %d" % GameState.gold_coins)
	lines.append("Bixbite: %d" % GameState.bixbite)
	lines.append("------------------------")
	var all_items: Dictionary = InventorySystem.get_all_items()
	if all_items.is_empty():
		lines.append("(No items yet)")
	else:
		for item_id in all_items.keys():
			var display_name := InventorySystem.get_item_display_name(String(item_id)) if InventorySystem.has_method("get_item_display_name") else String(item_id)
			lines.append("%s x%d" % [display_name, int(all_items[item_id])])
	_inventory_text.text = "\n".join(lines)

func _setup_ui_copy() -> void:
	_title_label.text = "Crownride Edge - Wildway Approach"
	_title_label.modulate = Color(0.86, 1.0, 0.75, 1.0)
	_desc_label.text = "Python look ported: clean grass, cobblestone crossing, guardian trees, and item drops.\nHeal in sacred zones, defeat enemies for GC rewards, and choose your trail." \
		+ "\n\nFollow the crossing paths: right/up to Forest Trials, left/up to Home Base."
	_desc_label.modulate = Color(0.84, 0.92, 0.74, 1.0)
	_locked_label.text = "Controls: Move (WASD/Arrows), Attack (LMB), Interact (E)"
	_locked_label.modulate = Color(1.0, 0.91, 0.62, 1.0)

func _spawn_safe_zone_rings() -> void:
	var layer := _ensure_layer("SafeZoneLayer")
	for zone in _safe_zones:
		var ring := Line2D.new()
		ring.width = 2.0
		ring.default_color = Color(0.45, 0.90, 0.45, 0.35)
		var points := PackedVector2Array()
		for i in range(28):
			var ang := float(i) / 28.0 * TAU
			points.append(zone.pos + Vector2(cos(ang), sin(ang)) * zone.radius)
		ring.points = points
		layer.add_child(ring)

func _apply_safe_zone_heal(delta: float) -> void:
	if _player == null:
		return
	var health = _player.get_node_or_null("Health")
	if health == null:
		return

	for zone in _safe_zones:
		if _player and _player.global_position.distance_to(zone.pos) <= zone.radius:
			health.heal(zone.heal_rate * delta)
			GameState.player_stats["hp"] = int(round(health.current_hp))
			return

func _spawn_path_guides() -> void:
	var layer := _ensure_layer("PathLayer")
	# Python style: cobblestone crossroad + two rough dirt leads for direction.
	_spawn_cobblestone_cross(layer)
	_spawn_dirt_trails(layer)

	var forest_edge := Line2D.new()
	forest_edge.width = 12.0
	forest_edge.default_color = Color(0.20, 0.16, 0.08, 0.42)
	forest_edge.points = PackedVector2Array([Vector2(640, 530), Vector2(770, 420), Vector2(900, 300), Vector2(1020, 210), Vector2(1140, 120)])
	layer.add_child(forest_edge)

	var forest_path := Line2D.new()
	forest_path.width = 8.0
	forest_path.default_color = Color(0.63, 0.49, 0.24, 0.95)
	forest_path.points = forest_edge.points
	layer.add_child(forest_path)

	var home_edge := Line2D.new()
	home_edge.width = 10.0
	home_edge.default_color = Color(0.22, 0.18, 0.10, 0.40)
	home_edge.points = PackedVector2Array([Vector2(640, 530), Vector2(520, 420), Vector2(420, 315), Vector2(300, 220), Vector2(160, 120)])
	layer.add_child(home_edge)

	var home_path := Line2D.new()
	home_path.width = 6.0
	home_path.default_color = Color(0.66, 0.54, 0.31, 0.95)
	home_path.points = home_edge.points
	layer.add_child(home_path)

	var forest_label := Label.new()
	forest_label.text = "Forest Trials this way ->"
	forest_label.position = _forest_trials_marker + Vector2(-60, -30)
	forest_label.modulate = Color(0.82, 1.0, 0.58, 1.0)
	layer.add_child(forest_label)

	var home_label := Label.new()
	home_label.text = "<- Home Base this way"
	home_label.position = _home_marker + Vector2(-34, -30)
	home_label.modulate = Color(1.0, 0.94, 0.70, 1.0)
	layer.add_child(home_label)

	_spawn_route_arrow(layer, _forest_trials_marker + Vector2(-8, 8), Vector2(1, -0.2), Color(0.82, 1.0, 0.58, 0.95))
	_spawn_route_arrow(layer, _home_marker + Vector2(8, 8), Vector2(-1, -0.2), Color(1.0, 0.94, 0.70, 0.95))

func _spawn_route_arrow(layer: Node, pos: Vector2, direction: Vector2, color: Color) -> void:
	var arrow := Polygon2D.new()
	arrow.position = pos
	arrow.color = color
	var dir := direction.normalized()
	var right := Vector2(-dir.y, dir.x)
	arrow.polygon = PackedVector2Array([
		dir * 26.0,
		right * 9.0 - dir * 9.0,
		right * 3.0 - dir * 12.0,
		right * 3.0 - dir * 26.0,
		right * -3.0 - dir * 26.0,
		right * -3.0 - dir * 12.0,
		right * -9.0 - dir * 9.0
	])
	layer.add_child(arrow)

func _spawn_cobblestone_cross(layer: Node) -> void:
	var horizontal_y := 360
	for x in range(0, 1280, 12):
		for y_off in range(-20, 20, 8):
			var seed := int((x * 7 + (horizontal_y + y_off) * 13) % 100)
			if seed < 70:
				var stone := Polygon2D.new()
				stone.position = Vector2(x + (seed % 6) - 3, horizontal_y + y_off + ((seed / 6) % 6) - 3)
				stone.color = STONE_GRAY
				var s := 4 + (seed % 3)
				stone.polygon = PackedVector2Array([
					Vector2(-s, -s), Vector2(s, -s), Vector2(s, s), Vector2(-s, s)
				])
				layer.add_child(stone)

	var vertical_x := 1280 / 3
	for y in range(0, 720, 12):
		for x_off in range(-20, 20, 8):
			var seed := int((((vertical_x + x_off) * 11 + y * 17)) % 100)
			if seed < 70:
				var stone := Polygon2D.new()
				stone.position = Vector2(vertical_x + x_off + (seed % 6) - 3, y + ((seed / 6) % 6) - 3)
				stone.color = DARK_STONE
				var s := 4 + (seed % 3)
				stone.polygon = PackedVector2Array([
					Vector2(-s, -s), Vector2(s, -s), Vector2(s, s), Vector2(-s, s)
				])
				layer.add_child(stone)

func _spawn_dirt_trails(layer: Node) -> void:
	# Water side lead (right)
	var water_y := 720 / 4
	for x in range(640, 1330, 10):
		for i in range(35):
			var seed := int((x * 3 + (water_y + i) * 7) % 100)
			var p := Polygon2D.new()
			p.position = Vector2(x + (seed % 12) - 6, water_y + i - 17 + ((seed / 12) % 8) - 4)
			var r := 2 + (seed % 3)
			p.color = DIRT_A if seed % 3 == 0 else DIRT_B
			p.polygon = PackedVector2Array([Vector2(-r, -r), Vector2(r, -r), Vector2(r, r), Vector2(-r, r)])
			layer.add_child(p)

	# Forest lead (top)
	var forest_x := int(2 * 1280 / 3)
	for y in range(-50, int(720 / 3), 10):
		for i in range(40):
			var seed := int(((forest_x + i) * 5 + y * 9) % 100)
			var p := Polygon2D.new()
			p.position = Vector2(forest_x + i - 20 + (seed % 12) - 6, y + ((seed / 12) % 12) - 6)
			var r := 2 + (seed % 3)
			p.color = DIRT_B if seed % 3 == 0 else Color(160.0 / 255.0, 82.0 / 255.0, 45.0 / 255.0, 1.0)
			p.polygon = PackedVector2Array([Vector2(-r, -r), Vector2(r, -r), Vector2(r, r), Vector2(-r, r)])
			layer.add_child(p)

func _spawn_decor_grass() -> void:
	var layer := _ensure_layer("GrassLayer")
	for y in range(0, 720, 40):
		for x in range(0, 1280, 40):
			if _rng.randf() < 0.30:
				var blade := Line2D.new()
				blade.width = 2.0
				blade.default_color = LIGHT_GREEN
				var bx := float(x + _rng.randi_range(-15, 15))
				var by := float(y + _rng.randi_range(-15, 15))
				var bh := float(_rng.randi_range(3, 8))
				blade.points = PackedVector2Array([Vector2(bx, by), Vector2(bx + _rng.randi_range(-1, 1), by - bh)])
				layer.add_child(blade)

func _spawn_healing_trees() -> void:
	var layer := _ensure_layer("TreeLayer")
	_tree_spawns.clear()
	for zone in _safe_zones:
		for i in range(8):
			var angle := float(i) / 8.0 * TAU
			var p := zone.pos + Vector2(cos(angle), sin(angle)) * (zone.radius + 40.0)
			_tree_spawns.append({"name": "Guardian Pine", "pos": p})

	for tree_data in _tree_spawns:
		var tree := Area2D.new()
		tree.script = TREE_SCRIPT
		tree.position = tree_data.pos
		tree.set("tree_label", String(tree_data.name))
		tree.set("heal_amount", 10.0)
		layer.add_child(tree)

func _spawn_pickups() -> void:
	var layer := _ensure_layer("PickupLayer")
	for pickup_data in _pickup_spawns:
		_spawn_pickup(layer, pickup_data.id, int(pickup_data.qty), int(pickup_data.gc), pickup_data.name, pickup_data.color, pickup_data.pos)

func _spawn_pickup(layer: Node, item_id: String, quantity: int, gc_bonus: int, display_name: String, color: Color, pos: Vector2) -> void:
	var pickup := Area2D.new()
	pickup.script = PICKUP_SCRIPT
	pickup.position = pos
	pickup.set("item_id", item_id)
	pickup.set("quantity", quantity)
	pickup.set("gc_bonus", gc_bonus)
	pickup.set("display_name", display_name)
	pickup.set("pickup_color", color)
	layer.add_child(pickup)

func _spawn_enemies() -> void:
	var layer := _ensure_layer("EnemyLayer")
	print("[DEBUG] EnemyLayer z_index: ", layer.z_index if layer is CanvasItem else "N/A")
	for spawn_pos in _enemy_spawns:
		var enemy := ENEMY_SCENE.instantiate()
		enemy.global_position = spawn_pos
		enemy.set("chase_range", ENEMY_AGGRO_METERS * PIXELS_PER_METER)
		var type_data := _roll_enemy_type()
		enemy.set_meta("enemy_type", type_data["type"])
		layer.add_child(enemy)

		# Apply typed stats after the node is in the tree
		if enemy.has_method("apply_type_data"):
			enemy.call("apply_type_data", type_data)
		else:
			# Fallback: set HP directly on health node
			var health = enemy.get_node_or_null("Health")
			if health:
				health.max_hp = float(type_data.get("hp", 60.0))
				health.current_hp = health.max_hp
			enemy.set("movement_speed", float(type_data.get("speed", 100.0)))

		var visible_body = enemy.get_node_or_null("VisibleBody")
		print("[DEBUG] Enemy spawned: type=", type_data["type"], " pos=", spawn_pos, " visible_body_exists=", visible_body != null, " color=", visible_body.color if visible_body else "N/A")

		var health_node = enemy.get_node_or_null("Health")
		if health_node and health_node.has_signal("died") and not health_node.died.is_connected(_on_enemy_died.bind(enemy)):
			health_node.died.connect(_on_enemy_died.bind(enemy))

func _player_attack_nearby_enemies() -> void:
	if _player == null:
		return

	var level := max(1, int(GameState.player_stats.get("level", 1)))
	var strength := max(0.0, float(GameState.player_stats.get("strength", 10.0)))
	var hit_count := clampi(1 + int(floor((level - 1) / 5.0)) + int(floor(strength / 25.0)), 1, 4)
	GameState.player_stats["attack_count_total"] = hit_count

	for enemy in get_tree().get_nodes_in_group("enemy"):
		if enemy is Node2D and enemy.global_position.distance_to(_player.global_position) <= 92.0:
			var health = enemy.get_node_or_null("Health")
			if health:
				for strike in range(hit_count):
					if health.is_dead:
						break
					var per_hit_damage := _calculate_player_hit_damage(enemy, strike)
					health.take_damage(per_hit_damage)
					EventBus.damage_dealt.emit("player", enemy.name, per_hit_damage, {"strike": strike + 1, "hits": hit_count})

func _process_hotkey_fallbacks() -> void:
	var m_down := Input.is_key_pressed(KEY_M)
	if m_down and not _m_key_down:
		_toggle_map_screen()
	_m_key_down = m_down

	var i_down := Input.is_key_pressed(KEY_I)
	if i_down and not _i_key_down:
		_toggle_inventory_panel()
	_i_key_down = i_down

	var shift_down := Input.is_key_pressed(KEY_SHIFT)
	if shift_down and not _shift_key_down:
		_toggle_chat_panel()
	_shift_key_down = shift_down

## Enemy type definitions for CrownrideCircuit (starter zone).
## Heavier enemies (orc_warrior, skeleton_guard, crown_knight) belong in WoodedTrail+.
const ENEMY_DEFS: Dictionary = {
	"goblin_scout": {
		"type": "goblin_scout", "name": "Goblin Scout",
		"class": "scout",
		"hp": 60.0, "speed": 120.0, "behavior": "ground_chase",
		"gc_min": 10, "gc_max": 25, "attack_cooldown": 1.2,
		"weight": 40
	},
	"forest_bat": {
		"type": "forest_bat", "name": "Forest Bat",
		"class": "scout",
		"hp": 40.0, "speed": 150.0, "behavior": "flying",
		"gc_min": 6, "gc_max": 15, "attack_cooldown": 0.9,
		"weight": 25
	},
	"cave_bat": {
		"type": "cave_bat", "name": "Cave Bat",
		"class": "scout",
		"hp": 30.0, "speed": 180.0, "behavior": "flying",
		"gc_min": 4, "gc_max": 10, "attack_cooldown": 0.75,
		"weight": 15
	},
	"bandit_rogue": {
		"type": "bandit_rogue", "name": "Bandit Rogue",
		"class": "raider",
		"hp": 70.0, "speed": 100.0, "behavior": "ground_chase",
		"gc_min": 18, "gc_max": 38, "attack_cooldown": 1.4,
		"weight": 20
	}
}

func _roll_enemy_type() -> Dictionary:
	var total_weight: int = 0
	for key in ENEMY_DEFS:
		total_weight += int(ENEMY_DEFS[key]["weight"])
	var roll := _rng.randi_range(0, total_weight - 1)
	var running := 0
	for key in ENEMY_DEFS:
		running += int(ENEMY_DEFS[key]["weight"])
		if roll < running:
			return ENEMY_DEFS[key]
	return ENEMY_DEFS["goblin_scout"]

func _enemy_damage_multiplier(enemy: Node) -> float:
	var etype := String(enemy.get_meta("enemy_type", "goblin_scout"))
	match etype:
		"goblin_scout":  return 1.0
		"forest_bat":    return 0.85   # Fast but weak
		"cave_bat":      return 0.70   # Nuisance only
		"bandit_rogue":  return 1.20   # Sneaky hard hit
		_:               return 1.0

func _calculate_player_hit_damage(enemy: Node, strike_index: int) -> float:
	var level := max(1, int(GameState.player_stats.get("level", 1)))
	var strength := max(0.0, float(GameState.player_stats.get("strength", 10.0)))
	var attack_power := max(0.0, float(GameState.player_stats.get("attack_power", 0.0)))
	var base := 6.0 + (level * 1.2) + (strength * 0.35) + (attack_power * 0.45)
	var combo_falloff := maxf(0.72, 1.0 - (0.08 * float(strike_index)))
	return base * combo_falloff * _enemy_damage_multiplier(enemy)

func _on_enemy_died(enemy: Node) -> void:
	if enemy == null or not is_instance_valid(enemy):
		return

	var drop_position := enemy.global_position + Vector2(randf_range(-22.0, 22.0), randf_range(-16.0, 16.0))
	var layer := _ensure_layer("PickupLayer")
	var etype := String(enemy.get_meta("enemy_type", "goblin_scout"))

	match etype:
		"goblin_scout":
			# Green drops: food and occasional small shard
			_spawn_pickup(layer, "food_basic", 1, 45, "Wayfarer Provisions", Color(0.92, 0.76, 0.29, 1.0), drop_position)
			if randf() < 0.30:
				_spawn_pickup(layer, "moonsteel_fragment", 1, 90, "Moonsteel Fragment", Color(0.81, 0.83, 0.88, 1.0), drop_position)
		"forest_bat", "cave_bat":
			# Bats rarely drop anything — just a tiny GC bonus
			if randf() < 0.20:
				_spawn_pickup(layer, "food_basic", 1, 20, "Wayfarer Provisions", Color(0.92, 0.76, 0.29, 1.0), drop_position)
		"bandit_rogue":
			# Bandits carry stolen goods — best loot in starter zone
			_spawn_pickup(layer, "moonsteel_fragment", 1, 110, "Moonsteel Fragment", Color(0.81, 0.83, 0.88, 1.0), drop_position)
			if randf() < 0.35:
				_spawn_pickup(layer, "gem_red", 1, 220, "Dragonheart Ruby", Color(0.96, 0.33, 0.33, 1.0), drop_position)
		_:
			_spawn_pickup(layer, "food_basic", 1, 45, "Wayfarer Provisions", Color(0.92, 0.76, 0.29, 1.0), drop_position)

func _try_scene_route() -> void:
	if _player == null:
		return
	if _player.global_position.distance_to(_forest_trials_marker) <= 84.0:
		SceneRouter.go_to_zone(FOREST_TRIALS_SCENE)
		return

	if _player.global_position.distance_to(_home_marker) <= 84.0:
		SceneRouter.go_to_zone(HOME_BASE_SCENE)

func _update_route_hint() -> void:
	if _player == null:
		return
	if _player.global_position.distance_to(_forest_trials_marker) <= 84.0:
		_locked_label.text = "Press [E] to enter Forest Trials"
		return

	if _player.global_position.distance_to(_home_marker) <= 84.0:
		_locked_label.text = "Press [E] to return Home Base"
		return

	_locked_label.text = "Enemies aggro at ~5m. Healing zones restore HP; trees also heal with [E]."

func _ensure_layer(name: String) -> Node:
	var node = get_node_or_null(name)
	if node:
		return node

	node = Node2D.new()
	node.name = name
	if node is CanvasItem:
		(node as CanvasItem).z_index = _layer_z(name)
	add_child(node)
	return node

func _layer_z(name: String) -> int:
	match name:
		"GrassLayer":
			return -4
		"PathLayer":
			return -3
		"SafeZoneLayer":
			return -2
		"TreeLayer":
			return 5
		"PickupLayer":
			return 12
		"EnemyLayer":
			return 20
		_:
			return 0

func _print_spawn_report() -> void:
	print("[CrownrideCircuit] ========== SPAWN REPORT ==========")
	print("[CrownrideCircuit] Player at: ", _player.global_position if _player else Vector2.ZERO)
	if _player:
		var player_body = _player.get_node_or_null("VisibleBody")
		print("[CrownrideCircuit] Player VisibleBody exists: ", player_body != null, " color: ", player_body.color if player_body else "N/A")
	
	var cam_rect := _camera_world_rect()
	print("[CrownrideCircuit] Camera rect: ", cam_rect)
	
	var enemy_layer = get_node_or_null("EnemyLayer")
	print("[CrownrideCircuit] EnemyLayer exists: ", enemy_layer != null, " z_index: ", enemy_layer.z_index if enemy_layer else "N/A")
	
	var enemies := get_tree().get_nodes_in_group("enemy")
	print("[CrownrideCircuit] Total enemies in 'enemy' group: ", enemies.size())
	for enemy in enemies:
		if enemy is Node2D:
			var ep: Vector2 = enemy.global_position
			var visible_body = enemy.get_node_or_null("VisibleBody")
			var enemy_parent = enemy.get_parent()
			print("  > ", enemy.name, " @ pos=", ep, " parent=", enemy_parent.name if enemy_parent else "NONE", " z_index=", enemy.z_index, " visible_body=", visible_body != null, " in_view=", cam_rect.has_point(ep))
			if visible_body:
				print("    VisibleBody color: ", visible_body.color, " z_index: ", visible_body.z_index)

	var pickup_layer := get_node_or_null("PickupLayer")
	if pickup_layer:
		print("[CrownrideCircuit] Pickup count: ", pickup_layer.get_child_count(), " z_index: ", pickup_layer.z_index)
		for child in pickup_layer.get_children():
			if child is Node2D:
				var pp: Vector2 = (child as Node2D).global_position
				print("  > ", child.name, " @ ", pp, " in_view=", cam_rect.has_point(pp))

	var tree_layer := get_node_or_null("TreeLayer")
	if tree_layer:
		print("[CrownrideCircuit] Tree count: ", tree_layer.get_child_count(), " z_index: ", tree_layer.z_index)
	print("[CrownrideCircuit] ==================================")

func _camera_world_rect() -> Rect2:
	if _player == null:
		return Rect2(Vector2.ZERO, Vector2(1280, 720))
	var camera: Camera2D = _player.get_node_or_null("Camera2D")
	if camera == null:
		return Rect2(Vector2.ZERO, Vector2(1280, 720))
	var viewport_size := get_viewport().get_visible_rect().size
	var half_size := (viewport_size * 0.5) * camera.zoom
	var center := camera.global_position
	return Rect2(center - half_size, half_size * 2.0)
