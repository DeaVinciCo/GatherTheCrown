extends CharacterBody2D
## Boss AI controller
## Complex patterns, multiple phases, telegraphed attacks

class_name BossAI

@export var boss_id: String = "boss_name"
@export var boss_element: String = "fire"

var player: Node
var chase_range: float = 500.0
var attack_range: float = 120.0
var movement_speed: float = 100.0
var attack_cooldown: float = 0.0
var attack_cooldown_max: float = 3.0
var telegraph_time: float = 1.0
var is_telegraphing: bool = false
var is_dead: bool = false
var phase: int = 1
var boss_level: int = 1
var _avatar_renderer := BossAvatarRenderer.new()

func _ready() -> void:
	add_to_group("boss")
	player = get_tree().root.get_child(0).get_node_or_null("Player")
	_avatar_renderer.setup(self, boss_element)
	
	# Add health and hurtbox
	if not has_node("Health"):
		var health = preload("res://scripts/combat/health.gd").new()
		health.name = "Health"
		health.max_hp = 100.0
		health.current_hp = 100.0
		add_child(health)
	
	# Listen for phase changes
	get_node("Health").health_changed.connect(_on_health_changed)

	boss_level = GameState.get_boss_level(boss_id)
	_apply_boss_scaling()

func _process(delta: float) -> void:
	if attack_cooldown > 0:
		attack_cooldown -= delta
	_avatar_renderer.tick(delta, velocity, is_telegraphing, phase)

func _physics_process(delta: float) -> void:
	if is_dead or not player:
		return
	
	var distance_to_player = global_position.distance_to(player.global_position)
	
	if distance_to_player < chase_range:
		# Maintain distance for phase 1
		var direction = (player.global_position - global_position).normalized()
		
		if distance_to_player > attack_range + 50:
			velocity = direction * movement_speed
		else:
			velocity = direction * movement_speed * 0.5  # Back away slightly
		
		# Attack with telegraph
		if distance_to_player < attack_range and attack_cooldown <= 0 and not is_telegraphing:
			telegraph_attack()
	else:
		velocity = Vector2.ZERO
	
	move_and_slide()

func telegraph_attack() -> void:
	is_telegraphing = true
	print("Boss telegraphs attack!")
	
	await get_tree().create_timer(telegraph_time).timeout

	perform_attack(player)
	is_telegraphing = false

func perform_attack(target: Node) -> void:
	attack_cooldown = attack_cooldown_max
	print("Boss attacks!")
	
	var base_damage = 12.0 if phase == 1 else 18.0
	var damage = base_damage + float((boss_level - 1) * 4)
	if target.has_node("Health"):
		target.get_node("Health").take_damage(damage)
		EventBus.damage_dealt.emit("boss", "player", damage, {})

func _apply_boss_scaling() -> void:
	var health_node = get_node_or_null("Health")
	if not health_node:
		return

	var hp_scale := 1.0 + (float(boss_level - 1) * 0.45)
	health_node.max_hp = 100.0 * hp_scale
	health_node.current_hp = health_node.max_hp

	movement_speed = 100.0 + float((boss_level - 1) * 20)
	attack_cooldown_max = maxf(1.4, 3.0 - float((boss_level - 1) * 0.35))
	telegraph_time = maxf(0.65, 1.0 - float((boss_level - 1) * 0.1))

	print("Boss tier applied: L%d (%d min target)" % [boss_level, GameState.get_target_boss_duration_minutes(boss_level)])

func _on_health_changed(current: float, max_hp: float) -> void:
	var health_percent = current / max_hp
	
	if health_percent < 0.5 and phase == 1:
		phase = 2
		print("Boss enters phase 2!")
		movement_speed = 150.0  # Faster
		attack_cooldown_max = 2.0  # More frequent attacks

func die() -> void:
	is_dead = true
	print("Boss defeated!")
	EventBus.boss_defeated.emit(boss_id)
	GameState.record_boss_defeat(boss_id)
	
	# Progression-aligned loot and currency rewards.
	var shard_drop = "metal_fragment_silver" if boss_level < 3 else "shard_gold"
	var gem_drop := _gem_for_element(boss_element)
	InventorySystem.add_item(shard_drop, 3 + boss_level)
	InventorySystem.add_item(gem_drop, 1 + boss_level)
	GameState.add_gold(35000 * boss_level)
	if boss_level >= 2:
		GameState.bixbite += 2 * (boss_level - 1)
	
	queue_free()

func _gem_for_element(element: String) -> String:
	match element.to_lower():
		"fire":
			return "gem_red"
		"water":
			return "gem_blue"
		"earth":
			return "gem_green"
		"storm", "lightning", "light":
			return "gem_clear"
		"shadow":
			return "gem_purple"
		_:
			return "gem_yellow"
