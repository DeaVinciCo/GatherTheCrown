extends CharacterMotor2D
## Player character controller.

var attack_active: bool = false
var attack_cooldown: float = 0.0
var attack_cooldown_max: float = 0.5
var aim_direction: Vector2 = Vector2.RIGHT

var _avatar_root: Node2D
var _avatar_body: Polygon2D
var _avatar_head: Polygon2D
var _avatar_hair: Polygon2D
var _avatar_emblem: Polygon2D
var _avatar_shadow: Polygon2D
var _anim_time: float = 0.0

func _ready() -> void:
	movement_speed = 220.0
	z_index = 25
	_ensure_visible_body()
	_build_custom_avatar()
	add_to_group("player")
	print("Player initialized")

func _ensure_visible_body() -> void:
	var sprite := get_node_or_null("Sprite2D") as Sprite2D
	if sprite:
		sprite.visible = false

func _build_custom_avatar() -> void:
	if has_node("Avatar"):
		_avatar_root = get_node("Avatar") as Node2D
		return

	_avatar_root = Node2D.new()
	_avatar_root.name = "Avatar"
	add_child(_avatar_root)

	_avatar_shadow = Polygon2D.new()
	_avatar_shadow.name = "Shadow"
	_avatar_shadow.color = Color(0.0, 0.0, 0.0, 0.35)
	_avatar_shadow.polygon = PackedVector2Array([
		Vector2(-12, 16),
		Vector2(12, 16),
		Vector2(9, 20),
		Vector2(-9, 20)
	])
	_avatar_root.add_child(_avatar_shadow)

	_avatar_body = Polygon2D.new()
	_avatar_body.name = "Body"
	_avatar_body.color = Color(0.11, 0.55, 0.98, 1.0)
	_avatar_body.polygon = PackedVector2Array([
		Vector2(0, -10),
		Vector2(11, -1),
		Vector2(10, 12),
		Vector2(-10, 12),
		Vector2(-11, -1)
	])
	_avatar_root.add_child(_avatar_body)

	_avatar_head = Polygon2D.new()
	_avatar_head.name = "Head"
	_avatar_head.color = Color(1.0, 0.84, 0.66, 1.0)
	_avatar_head.polygon = PackedVector2Array([
		Vector2(-6, -18),
		Vector2(6, -18),
		Vector2(7, -8),
		Vector2(-7, -8)
	])
	_avatar_root.add_child(_avatar_head)

	_avatar_hair = Polygon2D.new()
	_avatar_hair.name = "Hair"
	_avatar_hair.color = Color(0.12, 0.15, 0.22, 1.0)
	_avatar_hair.polygon = PackedVector2Array([
		Vector2(-7, -18),
		Vector2(7, -18),
		Vector2(5, -22),
		Vector2(-5, -22)
	])
	_avatar_root.add_child(_avatar_hair)

	_avatar_emblem = Polygon2D.new()
	_avatar_emblem.name = "Crest"
	_avatar_emblem.color = Color(1.0, 0.84, 0.15, 1.0)
	_avatar_emblem.polygon = PackedVector2Array([
		Vector2(0, -2),
		Vector2(3, 2),
		Vector2(0, 5),
		Vector2(-3, 2)
	])
	_avatar_root.add_child(_avatar_emblem)

func _process(delta: float) -> void:
	_anim_time += delta
	update_aim_direction()
	GameState.player_position = global_position

	if attack_cooldown > 0.0:
		attack_cooldown -= delta

	if Input.is_action_just_pressed("attack") and attack_cooldown <= 0.0:
		perform_aim_attack()

	if Input.is_action_just_pressed("interact"):
		try_interact()

	if Input.is_action_just_pressed("sync"):
		activate_sync()

	_update_avatar_animation_state()

func update_aim_direction() -> void:
	var mouse_pos: Vector2 = get_global_mouse_position()
	var aim_vec: Vector2 = (mouse_pos - global_position).normalized()
	if aim_vec != Vector2.ZERO:
		aim_direction = aim_vec

func _update_avatar_animation_state() -> void:
	if _avatar_root == null:
		return

	var moving := velocity.length() > 6.0
	var bob_amp := 2.2 if moving else 0.8
	var bob_speed := 12.0 if moving else 5.0
	var bob := sin(_anim_time * bob_speed) * bob_amp
	_avatar_root.position.y = bob

	var facing := current_direction
	if facing == Vector2.ZERO:
		facing = Vector2.DOWN

	if facing.x < -0.2:
		_avatar_root.scale.x = -1.0
	elif facing.x > 0.2:
		_avatar_root.scale.x = 1.0

	var tilt := 0.0
	if moving:
		tilt = clamp(facing.x * 0.12, -0.12, 0.12)
	_avatar_body.rotation = tilt
	_avatar_head.rotation = -tilt * 0.7

	if facing.y < -0.45:
		_avatar_body.color = Color(0.2, 0.65, 1.0, 1.0)
	elif facing.y > 0.45:
		_avatar_body.color = Color(0.09, 0.48, 0.9, 1.0)
	else:
		_avatar_body.color = Color(0.11, 0.55, 0.98, 1.0)

	_avatar_emblem.scale = Vector2.ONE * (1.0 + abs(sin(_anim_time * 6.0)) * 0.06)

func perform_aim_attack() -> void:
	if attack_active:
		return

	attack_active = true
	attack_cooldown = attack_cooldown_max

	var attack_dir: Vector2 = aim_direction
	print("Player attacking in direction: ", attack_dir)

	var attack_pos: Vector2 = global_position + attack_dir * 40.0
	var damage: float = 15.0
	if SyncSystem.is_synced:
		damage *= SyncSystem.sync_bonuses["damage_multiplier"]

	print("Attack damage: ", damage, " at ", attack_pos)
	SyncSystem.gain_sync(5.0)
	attack_active = false

func try_interact() -> void:
	var interaction = InteractPromptController.get_current_interaction()
	if interaction:
		interaction.interact(self)
	else:
		print("No interaction available")

func activate_sync() -> void:
	if SyncSystem.sync_meter >= 80.0:
		SyncSystem.activate_sync()
		print("Sync activated!")
	else:
		print("Not enough sync meter. Current: ", SyncSystem.sync_meter)