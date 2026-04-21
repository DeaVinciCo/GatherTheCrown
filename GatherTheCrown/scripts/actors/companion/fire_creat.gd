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
var _avatar_renderer := FireCreatAvatarRenderer.new()

func _ready() -> void:
	player = get_parent().get_node_or_null("Player")
	if not player:
		print("WARNING: FireCreat could not find Player!")
	
	# Add to group for combat detection
	add_to_group("allies")
	_avatar_renderer.setup(self)
	
	print("Fire Creat spawned and ready to follow")

func _process(delta: float) -> void:
	# Update cooldown
	if attack_cooldown > 0:
		attack_cooldown -= delta
	
	# Gain hunger over time
	BondSystem.creat_hunger["fire_creat"] = min(100, BondSystem.creat_hunger.get("fire_creat", 50) + 0.1 * delta)
	_avatar_renderer.tick(delta, velocity, movement_speed)

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
