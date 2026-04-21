extends CharacterBody2D
## Enemy AI controller
## Supports typed enemies: goblin_scout, forest_bat, cave_bat, bandit_rogue,
## orc_warrior, skeleton_guard, crown_knight (Godot-original elite)

class_name EnemyAI

# Enemy type (set via apply_type_data or set_meta "enemy_type")
var enemy_type: String = "goblin_scout"
var lore_name: String = "Goblin Scout"
var combat_class: String = "scout"
var behavior: String = "ground_chase"  # ground_chase | ground_patrol | flying

var player: Node
var chase_range: float = 320.0
var attack_range: float = 60.0
var movement_speed: float = 120.0
var attack_cooldown: float = 0.0
var attack_cooldown_max: float = 1.5
var is_dead: bool = false
var gc_reward_min: int = 10
var gc_reward_max: int = 30
var _avatar_renderer := EnemyAvatarRenderer.new()

# Patrol state
var _patrol_origin: Vector2 = Vector2.ZERO
var _patrol_angle: float = 0.0
var _patrol_radius: float = 80.0
var _patrol_timer: float = 0.0

# Flying state
var _fly_bob: float = 0.0

func _ready() -> void:
	add_to_group("enemy")
	z_index = 22
	_patrol_origin = global_position
	_patrol_angle = randf() * TAU
	_avatar_renderer.setup(self, enemy_type, combat_class)
	player = get_tree().get_first_node_in_group("player")

	if not has_node("Health"):
		var health = preload("res://scripts/combat/health.gd").new()
		health.name = "Health"
		health.max_hp = 30.0
		health.current_hp = 30.0
		add_child(health)

	var health_node: Node = get_node_or_null("Health") as Node
	if health_node and health_node.has_signal("died") and not health_node.died.is_connected(die):
		health_node.died.connect(die)

## Apply stats from a type-data dictionary (called by spawner after instantiate)
func apply_type_data(data: Dictionary) -> void:
	enemy_type = data.get("type", enemy_type)
	lore_name = data.get("name", lore_name)
	combat_class = data.get("class", _class_for_type(enemy_type))
	behavior = data.get("behavior", behavior)
	movement_speed = float(data.get("speed", movement_speed))
	gc_reward_min = int(data.get("gc_min", gc_reward_min))
	gc_reward_max = int(data.get("gc_max", gc_reward_max))
	attack_cooldown_max = float(data.get("attack_cooldown", attack_cooldown_max))
	name = lore_name
	set_meta("enemy_type", enemy_type)
	set_meta("enemy_class", combat_class)

	var health_node := get_node_or_null("Health")
	if health_node:
		var hp := float(data.get("hp", 30.0))
		health_node.max_hp = hp
		health_node.current_hp = hp

	# Re-colour the body shape to match the enemy type
	var body := get_node_or_null("VisibleBody") as Polygon2D
	if body:
		body.color = _color_for_type(enemy_type)

	_avatar_renderer.reconfigure(enemy_type, combat_class)

func _class_for_type(t: String) -> String:
	match t:
		"goblin_scout", "forest_bat", "cave_bat":
			return "scout"
		"bandit_rogue", "skeleton_guard":
			return "raider"
		"orc_warrior", "crown_knight":
			return "knight"
		_:
			return "raider"

func _color_for_type(t: String) -> Color:
	match t:
		"goblin_scout":   return Color(0.27, 0.60, 0.18, 1.0)   # mossy green
		"forest_bat":     return Color(0.35, 0.18, 0.45, 1.0)   # dark purple
		"cave_bat":       return Color(0.20, 0.10, 0.30, 1.0)   # deep violet
		"bandit_rogue":   return Color(0.55, 0.18, 0.18, 1.0)   # dark crimson
		"orc_warrior":    return Color(0.40, 0.55, 0.20, 1.0)   # olive green
		"skeleton_guard": return Color(0.85, 0.85, 0.75, 1.0)   # bone white
		"crown_knight":   return Color(0.60, 0.45, 0.10, 1.0)   # tarnished gold
		_:                return Color(0.83, 0.22, 0.22, 1.0)

func _ensure_visible_body() -> void:
	var sprite := get_node_or_null("Sprite2D") as Sprite2D
	if sprite and sprite.texture == null:
		sprite.visible = false

	if has_node("VisibleBody"):
		print("[DEBUG] VisibleBody already exists for enemy: ", name)
		return

	var body := Polygon2D.new()
	body.name = "VisibleBody"
	body.color = _color_for_type(enemy_type)
	body.polygon = PackedVector2Array([
		Vector2(0, -14),
		Vector2(12, 0),
		Vector2(0, 14),
		Vector2(-12, 0)
	])
	body.z_index = 1
	add_child(body)
	print("[DEBUG] Created VisibleBody for enemy: ", name, " color: ", body.color)

func _process(delta: float) -> void:
	if attack_cooldown > 0:
		attack_cooldown -= delta
	_patrol_timer += delta
	_fly_bob += delta * 4.0
	var cooldown_ratio := attack_cooldown / maxf(0.001, attack_cooldown_max)
	_avatar_renderer.tick(delta, velocity, movement_speed, cooldown_ratio)

func _physics_process(delta: float) -> void:
	if is_dead:
		return

	if player == null or not is_instance_valid(player):
		player = get_tree().get_first_node_in_group("player")

	if not player:
		_do_idle_wander(delta)
		move_and_slide()
		return

	var player_node: Node2D = player as Node2D
	var dist: float = global_position.distance_to(player_node.global_position)

	match behavior:
		"ground_chase":
			_behavior_chase(player_node, dist)
		"ground_patrol":
			_behavior_patrol(player_node, dist, delta)
		"flying":
			_behavior_flying(player_node, dist, delta)
		_:
			_behavior_chase(player_node, dist)

	move_and_slide()

func _behavior_chase(player_node: Node2D, dist: float) -> void:
	if dist < chase_range:
		var dir: Vector2 = (player_node.global_position - global_position).normalized()
		velocity = dir * movement_speed
		if dist < attack_range and attack_cooldown <= 0:
			perform_attack(player)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, movement_speed * 0.15)

func _behavior_patrol(player_node: Node2D, dist: float, delta: float) -> void:
	if dist < chase_range * 0.6:
		# Aggro — chase when player gets close
		var dir: Vector2 = (player_node.global_position - global_position).normalized()
		velocity = dir * movement_speed * 0.85
		if dist < attack_range and attack_cooldown <= 0:
			perform_attack(player)
	else:
		# Slow patrol circle around spawn origin
		_patrol_angle += delta * 0.7
		var target := _patrol_origin + Vector2(cos(_patrol_angle), sin(_patrol_angle)) * _patrol_radius
		var dir: Vector2 = (target - global_position).normalized()
		velocity = dir * movement_speed * 0.5

func _behavior_flying(player_node: Node2D, dist: float, _delta: float) -> void:
	# Bats dart toward player with erratic zigzag; ignore physics obstacles
	var bob_y := sin(_fly_bob) * 18.0
	if dist < chase_range:
		var raw_dir: Vector2 = (player_node.global_position - global_position).normalized()
		# Add a perpendicular wobble for erratic flight feel
		var perp := Vector2(-raw_dir.y, raw_dir.x) * sin(_fly_bob * 1.3) * 0.4
		velocity = (raw_dir + perp).normalized() * movement_speed
		position.y += bob_y * 0.02  # Gentle float effect
		if dist < attack_range and attack_cooldown <= 0:
			perform_attack(player)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, movement_speed * 0.2)

func _do_idle_wander(_delta: float) -> void:
	velocity = velocity.move_toward(Vector2.ZERO, movement_speed * 0.1)

func perform_attack(target: Node) -> void:
	attack_cooldown = attack_cooldown_max
	var damage := _base_attack_damage()
	if target.has_node("Health"):
		target.get_node("Health").take_damage(damage)
		EventBus.damage_dealt.emit("enemy", "player", damage, {"enemy_type": enemy_type})

func _base_attack_damage() -> float:
	match enemy_type:
		"goblin_scout":   return 4.0   # Fast hits, low damage
		"forest_bat":     return 3.0   # Very fast, chip damage
		"cave_bat":       return 2.5   # Swarm nuisance
		"bandit_rogue":   return 6.0   # Fast + decent hit
		"orc_warrior":    return 9.0   # Slow but hard hits
		"skeleton_guard": return 7.0   # Methodical, medium
		"crown_knight":   return 12.0  # Elite — heavy swing
		_:                return 5.0

func die() -> void:
	is_dead = true
	EventBus.entity_died.emit(self)
	GameState.add_gold(randi_range(gc_reward_min, gc_reward_max))
	_drop_loot()
	queue_free()

func _drop_loot() -> void:
	# Each type drops items consistent with its origin
	match enemy_type:
		"goblin_scout":
			InventorySystem.add_item("food_basic", 1)            # Goblin scraps
		"forest_bat":
			if randf() < 0.25:
				InventorySystem.add_item("embersteel_fragment", 1)  # Rare wing bone
		"cave_bat":
			pass  # Almost nothing — nuisance mob
		"bandit_rogue":
			InventorySystem.add_item("embersteel_fragment", 2)  # Stolen goods
			if randf() < 0.30:
				InventorySystem.add_item("moonsteel_fragment", 1)
		"orc_warrior":
			InventorySystem.add_item("embersteel_fragment", 3)
			if randf() < 0.40:
				InventorySystem.add_item("moonsteel_fragment", 1)
		"skeleton_guard":
			InventorySystem.add_item("moonsteel_fragment", 1)           # Ancient armour fragments
			if randf() < 0.35:
				InventorySystem.add_item("gem_red", 1)
		"crown_knight":
			InventorySystem.add_item("moonsteel_fragment", 1)
			InventorySystem.add_item("moonsteel_fragment", 2)
			if randf() < 0.45:
				InventorySystem.add_item("gem_red", 1)
		_:
			InventorySystem.add_item("embersteel_fragment", 2)
