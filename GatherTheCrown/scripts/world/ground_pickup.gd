extends Area2D
## Lightweight world pickup for gems, shards, food, and bonus GC.

@export var item_id: String = "shard_bronze"
@export var quantity: int = 1
@export var gc_bonus: int = 0
@export var display_name: String = "Shard"
@export var pickup_color: Color = Color(0.8, 0.7, 0.4, 1.0)

var _collected: bool = false

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

	if not has_node("Token"):
		var token := Polygon2D.new()
		token.name = "Token"
		token.polygon = PackedVector2Array([
			Vector2(0, -10),
			Vector2(10, 0),
			Vector2(0, 10),
			Vector2(-10, 0)
		])
		token.color = pickup_color
		add_child(token)

	if not has_node("PickupLabel"):
		var label := Label.new()
		label.name = "PickupLabel"
		label.text = display_name
		label.position = Vector2(-42, -28)
		label.modulate = Color(0.92, 0.95, 0.84, 0.9)
		label.z_index = 5
		add_child(label)

	if not body_entered.is_connected(_on_body_entered):
		body_entered.connect(_on_body_entered)

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
	queue_free()
