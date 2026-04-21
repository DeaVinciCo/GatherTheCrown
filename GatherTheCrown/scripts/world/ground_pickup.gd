extends Area2D
## Lightweight world pickup for gems, shards, food, and bonus GC.

@export var item_id: String = "shard_bronze"
@export var quantity: int = 1
@export var gc_bonus: int = 0
@export var display_name: String = "Shard"
@export var pickup_color: Color = Color(0.8, 0.7, 0.4, 1.0)

var _collected: bool = false
var _anim_time: float = 0.0
var _token: Polygon2D
var _halo: Polygon2D
var _shine: Polygon2D
var _pickup_label: Label

func _ready() -> void:
	monitoring = true
	monitorable = true
	z_index = 4

	if not has_node("CollisionShape2D"):
		var collision := CollisionShape2D.new()
		var shape := CircleShape2D.new()
		shape.radius = 13.0
		collision.shape = shape
		add_child(collision)

	if not has_node("Halo"):
		_halo = Polygon2D.new()
		_halo.name = "Halo"
		_halo.polygon = PackedVector2Array([
			Vector2(0, -16),
			Vector2(11, -11),
			Vector2(16, 0),
			Vector2(11, 11),
			Vector2(0, 16),
			Vector2(-11, 11),
			Vector2(-16, 0),
			Vector2(-11, -11)
		])
		_halo.color = pickup_color.darkened(0.45)
		_halo.modulate.a = 0.55
		add_child(_halo)
	else:
		_halo = get_node("Halo") as Polygon2D

	if not has_node("Token"):
		_token = Polygon2D.new()
		_token.name = "Token"
		_token.polygon = PackedVector2Array([
			Vector2(0, -11),
			Vector2(9, -3),
			Vector2(9, 3),
			Vector2(0, 11),
			Vector2(-9, 3),
			Vector2(-9, -3)
		])
		_token.color = pickup_color
		add_child(_token)
	else:
		_token = get_node("Token") as Polygon2D

	if not has_node("Shine"):
		_shine = Polygon2D.new()
		_shine.name = "Shine"
		_shine.polygon = PackedVector2Array([
			Vector2(0, -8),
			Vector2(3, 0),
			Vector2(0, 8),
			Vector2(-3, 0)
		])
		_shine.color = Color(1.0, 0.98, 0.85, 0.92)
		_shine.z_index = 1
		add_child(_shine)
	else:
		_shine = get_node("Shine") as Polygon2D

	if not has_node("PickupLabel"):
		_pickup_label = Label.new()
		_pickup_label.name = "PickupLabel"
		_pickup_label.text = display_name
		_pickup_label.position = Vector2(-42, -28)
		_pickup_label.modulate = Color(0.92, 0.95, 0.84, 0.9)
		_pickup_label.z_index = 5
		add_child(_pickup_label)
	else:
		_pickup_label = get_node("PickupLabel") as Label

	if not body_entered.is_connected(_on_body_entered):
		body_entered.connect(_on_body_entered)

func _process(delta: float) -> void:
	if _collected:
		return

	_anim_time += delta
	var hover := sin(_anim_time * 2.6) * 3.2
	position.y += hover * delta

	if _token:
		_token.rotation += delta * 0.65
		_token.scale = Vector2.ONE * (1.0 + abs(sin(_anim_time * 5.4)) * 0.06)

	if _halo:
		_halo.rotation -= delta * 0.42
		_halo.scale = Vector2.ONE * (1.0 + abs(sin(_anim_time * 2.8)) * 0.1)
		_halo.modulate.a = 0.4 + abs(sin(_anim_time * 4.0)) * 0.22

	if _shine:
		_shine.rotation += delta * 1.9
		_shine.scale.x = 0.6 + abs(sin(_anim_time * 6.0)) * 0.8

	if _pickup_label:
		_pickup_label.modulate.a = 0.72 + abs(sin(_anim_time * 3.2)) * 0.2

func _on_body_entered(body: Node) -> void:
	if _collected:
		return
	if body == null or not body.is_in_group("player"):
		return

	_collected = true
	if quantity > 0 and item_id != "":
		InventorySystem.add_item(item_id, quantity)
	if gc_bonus > 0:
		GameState.add_gold(gc_bonus)

	EventBus.hud_updated.emit()
	if _token:
		_token.modulate = Color(1, 1, 1, 0.15)
	if _halo:
		_halo.modulate = Color(1, 1, 1, 0.08)
	queue_free()
