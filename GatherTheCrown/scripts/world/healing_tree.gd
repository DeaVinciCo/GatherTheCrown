extends Area2D
## Sacred tree that heals the player when they interact nearby.

@export var tree_label: String = "Healing Tree"
@export var heal_amount: float = 22.0
@export var heal_cooldown: float = 4.0

var _player_inside: bool = false
var _cooldown_left: float = 0.0

func _ready() -> void:
	monitoring = true
	monitorable = true
	z_index = 2

	if not has_node("CollisionShape2D"):
		var collision := CollisionShape2D.new()
		var shape := CircleShape2D.new()
		shape.radius = 34.0
		collision.shape = shape
		add_child(collision)

	if not has_node("TreeCanopy"):
		var canopy := Polygon2D.new()
		canopy.name = "TreeCanopy"
		canopy.polygon = PackedVector2Array([
			Vector2(-22, 8),
			Vector2(0, -34),
			Vector2(22, 8)
		])
		canopy.color = Color(0.22, 0.58, 0.22, 1.0)
		add_child(canopy)

	if not has_node("TreeTrunk"):
		var trunk := ColorRect.new()
		trunk.name = "TreeTrunk"
		trunk.position = Vector2(-5, 8)
		trunk.size = Vector2(10, 22)
		trunk.color = Color(0.38, 0.24, 0.12, 1.0)
		add_child(trunk)

	if not has_node("TreeLabel"):
		var label := Label.new()
		label.name = "TreeLabel"
		label.text = "%s  [E] Heal" % tree_label
		label.position = Vector2(-70, -54)
		label.modulate = Color(0.80, 0.98, 0.76, 0.92)
		add_child(label)

	if not body_entered.is_connected(_on_body_entered):
		body_entered.connect(_on_body_entered)
	if not body_exited.is_connected(_on_body_exited):
		body_exited.connect(_on_body_exited)

func _process(delta: float) -> void:
	if _cooldown_left > 0.0:
		_cooldown_left -= delta

	if not _player_inside or _cooldown_left > 0.0:
		return

	if Input.is_action_just_pressed("interact"):
		_heal_player()

func _on_body_entered(body: Node) -> void:
	if body and body.is_in_group("player"):
		_player_inside = true

func _on_body_exited(body: Node) -> void:
	if body and body.is_in_group("player"):
		_player_inside = false

func _heal_player() -> void:
	var player := get_tree().get_first_node_in_group("player")
	if player == null:
		return

	var health = player.get_node_or_null("Health")
	if health == null:
		return

	health.heal(heal_amount)
	GameState.player_stats["hp"] = int(round(health.current_hp))
	_cooldown_left = heal_cooldown
	EventBus.hud_updated.emit()
