extends CharacterMotor2D
## Player character controller

var attack_active: bool = false
var attack_cooldown: float = 0.0
var attack_cooldown_max: float = 0.5

var aim_direction: Vector2 = Vector2.RIGHT  # Direction player is aiming (from mouse)

func _ready() -> void:
	# Set up components
	movement_speed = 200.0
	z_index = 25
	_ensure_visible_body()
	
	# Add player to "player" group for interaction detection
	add_to_group("player")
	
	print("Player initialized")

func _ensure_visible_body() -> void:
	var sprite := get_node_or_null("Sprite2D") as Sprite2D
	if sprite and sprite.texture == null:
		sprite.visible = false

	if has_node("VisibleBody"):
		return

	var body := Polygon2D.new()
	body.name = "VisibleBody"
	body.color = Color(0.15, 0.45, 0.95, 1.0)
	body.polygon = PackedVector2Array([
		Vector2(0, -16),
		Vector2(13, -2),
		Vector2(10, 14),
		Vector2(-10, 14),
		Vector2(-13, -2)
	])
	body.z_index = 1
	add_child(body)

func _process(delta: float) -> void:
	# Update aim direction (where mouse is pointing)
	update_aim_direction()
	
	# Update player position in GameState for creat spawning
	GameState.player_position = global_position
	
	# Update attack cooldown
	if attack_cooldown > 0:
		attack_cooldown -= delta
	
	# Handle attack input (aim-to-cursor)
	if Input.is_action_just_pressed("attack") and attack_cooldown <= 0:
		perform_aim_attack()
	
	# Handle interact input
	if Input.is_action_just_pressed("interact"):
		try_interact()
	
	# Handle sync input
	if Input.is_action_just_pressed("sync"):
		activate_sync()

func update_aim_direction() -> void:
	# Calculate direction from player to mouse cursor
	var mouse_pos: Vector2 = get_global_mouse_position()
	var aim_vec: Vector2 = (mouse_pos - global_position).normalized()
	
	if aim_vec != Vector2.ZERO:
		aim_direction = aim_vec

func perform_aim_attack() -> void:
	if attack_active:
		return
	
	attack_active = true
	attack_cooldown = attack_cooldown_max
	
	# Get attack direction (aim-to-cursor)
	var attack_dir: Vector2 = aim_direction
	
	print("Player attacking in direction: ", attack_dir)
	
	# TODO: spawn WeaponSwing.tscn with hitbox at proper position
	# Spawn attack hitbox in aimed direction
	var attack_pos: Vector2 = global_position + attack_dir * 40.0
	
	# Simulate damage (would normally be via animation callback)
	var damage: float = 15.0
	if SyncSystem.is_synced:
		damage *= SyncSystem.sync_bonuses["damage_multiplier"]
	
	print("Attack damage: ", damage)
	
	# Gain sync meter on attack
	SyncSystem.gain_sync(5.0)
	
	attack_active = false

func try_interact() -> void:
	# Get current interaction if available
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
