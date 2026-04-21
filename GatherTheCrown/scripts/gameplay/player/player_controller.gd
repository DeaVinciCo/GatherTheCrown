extends CharacterMotor2D
## Player character controller.

var attack_active: bool = false
var attack_cooldown: float = 0.0
var attack_cooldown_max: float = 0.5
var aim_direction: Vector2 = Vector2.RIGHT

var _avatar_renderer := PlayerAvatarRenderer.new()

func _ready() -> void:
	movement_speed = 220.0
	z_index = 25
	_avatar_renderer.setup(self)
	add_to_group("player")
	print("Player initialized")

func _process(delta: float) -> void:
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

	_avatar_renderer.tick(delta, velocity, current_direction)

func update_aim_direction() -> void:
	var mouse_pos: Vector2 = get_global_mouse_position()
	var aim_vec: Vector2 = (mouse_pos - global_position).normalized()
	if aim_vec != Vector2.ZERO:
		aim_direction = aim_vec

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