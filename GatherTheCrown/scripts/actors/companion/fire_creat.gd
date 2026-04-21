extends CharacterBody2D
## Fire Creat companion AI
## Always follows player, attacks based on command mode
## Commands: Follow (passive), Attack (aggressive), Defensive (guarding)

var player: Node
var follow_distance: float = 50.0
var movement_speed: float = 180.0
var attack_range: float = 100.0
var attack_cooldown: float = 0.0
var attack_cooldown_max: float = 2.0
var _anim_time: float = 0.0

var _avatar_root: Node2D
var _avatar_flame_outer: Polygon2D
var _avatar_flame_inner: Polygon2D
var _avatar_eye_left: Polygon2D
var _avatar_eye_right: Polygon2D

func _ready() -> void:
	player = get_parent().get_node_or_null("Player")
	if not player:
		print("WARNING: FireCreat could not find Player!")
	
	# Add to group for combat detection
	add_to_group("allies")
	_build_custom_avatar()
	
	print("Fire Creat spawned and ready to follow")

func _process(delta: float) -> void:
	# Update cooldown
	if attack_cooldown > 0:
		attack_cooldown -= delta
	
	# Gain hunger over time
	BondSystem.creat_hunger["fire_creat"] = min(100, BondSystem.creat_hunger.get("fire_creat", 50) + 0.1 * delta)
	_anim_time += delta
	_update_avatar_animation()

func _build_custom_avatar() -> void:
	var sprite := get_node_or_null("Sprite2D") as Sprite2D
	if sprite:
		sprite.visible = false

	if has_node("Avatar"):
		_avatar_root = get_node("Avatar") as Node2D
		return

	_avatar_root = Node2D.new()
	_avatar_root.name = "Avatar"
	add_child(_avatar_root)

	_avatar_flame_outer = Polygon2D.new()
	_avatar_flame_outer.name = "FlameOuter"
	_avatar_flame_outer.color = Color(1.0, 0.35, 0.05, 1.0)
	_avatar_flame_outer.polygon = PackedVector2Array([
		Vector2(0, -16),
		Vector2(10, -5),
		Vector2(8, 10),
		Vector2(0, 14),
		Vector2(-8, 10),
		Vector2(-10, -5)
	])
	_avatar_root.add_child(_avatar_flame_outer)

	_avatar_flame_inner = Polygon2D.new()
	_avatar_flame_inner.name = "FlameInner"
	_avatar_flame_inner.color = Color(1.0, 0.85, 0.2, 0.95)
	_avatar_flame_inner.polygon = PackedVector2Array([
		Vector2(0, -10),
		Vector2(5, -2),
		Vector2(4, 7),
		Vector2(0, 10),
		Vector2(-4, 7),
		Vector2(-5, -2)
	])
	_avatar_root.add_child(_avatar_flame_inner)

	_avatar_eye_left = Polygon2D.new()
	_avatar_eye_left.name = "EyeLeft"
	_avatar_eye_left.color = Color(0.1, 0.06, 0.02, 0.95)
	_avatar_eye_left.polygon = PackedVector2Array([
		Vector2(-4, -2),
		Vector2(-2, -2),
		Vector2(-2, 0),
		Vector2(-4, 0)
	])
	_avatar_root.add_child(_avatar_eye_left)

	_avatar_eye_right = Polygon2D.new()
	_avatar_eye_right.name = "EyeRight"
	_avatar_eye_right.color = Color(0.1, 0.06, 0.02, 0.95)
	_avatar_eye_right.polygon = PackedVector2Array([
		Vector2(2, -2),
		Vector2(4, -2),
		Vector2(4, 0),
		Vector2(2, 0)
	])
	_avatar_root.add_child(_avatar_eye_right)

func _update_avatar_animation() -> void:
	if _avatar_root == null:
		return

	var pulse := 1.0 + sin(_anim_time * 9.0) * 0.08
	var flicker := 1.0 + sin(_anim_time * 18.0) * 0.04
	var moving := velocity.length() > 5.0

	_avatar_root.scale = Vector2.ONE * pulse
	_avatar_root.position.y = sin(_anim_time * (8.0 if moving else 4.0)) * (1.8 if moving else 0.9)
	_avatar_flame_inner.scale = Vector2.ONE * flicker
	_avatar_flame_outer.rotation = clamp(velocity.x / max(1.0, movement_speed) * 0.35, -0.35, 0.35)

func _physics_process(delta: float) -> void:
	if player:
		# Always follow player
		var distance_to_player = global_position.distance_to(player.global_position)
		if distance_to_player > follow_distance:
			var direction = (player.global_position - global_position).normalized()
			velocity = direction * movement_speed
		else:
			velocity = Vector2.ZERO
		
		move_and_slide()
		
		# Only attack if in ATTACK mode
		if CompanionCommands.is_attacking() and attack_cooldown <= 0:
			attempt_attack()

func attempt_attack() -> void:
	# Find nearest enemy within range
	var nearby_enemies = get_tree().get_nodes_in_group("enemy")
	if nearby_enemies.is_empty():
		return
	
	var nearest_enemy = nearby_enemies[0]
	var nearest_dist = global_position.distance_to(nearest_enemy.global_position)
	
	for enemy in nearby_enemies:
		var dist = global_position.distance_to(enemy.global_position)
		if dist < nearest_dist:
			nearest_dist = dist
			nearest_enemy = enemy
	
	if nearest_dist < attack_range:
		perform_fire_attack(nearest_enemy)

func perform_fire_attack(target: Node) -> void:
	attack_cooldown = attack_cooldown_max
	print("Fire Creat attacks target!")
	
	# Apply fire damage
	var base_damage = 8.0
	
	# Boost if creat has high bond
	var bond = BondSystem.creat_bonds.get("fire_creat", 0.5)
	base_damage *= (1.0 + bond * 0.5)  # +50% damage at max bond
	
	if SyncSystem.is_synced:
		base_damage *= SyncSystem.sync_bonuses["creat_attack_rate"]
	
	# Damage target
	if target.has_node("Health"):
		target.get_node("Health").take_damage(base_damage)
	
	# Gain sync meter when attacking
	SyncSystem.gain_sync(3.0)
