extends Interactable
## MaterialGatherPoint - Interactable to gather restoration materials

@export var material_type: String = "essence_water"
@export var material_amount: int = 1

var _anim_time: float = 0.0
var _model_root: Node2D
var _crystal_a: Polygon2D
var _crystal_b: Polygon2D
var _glow: Polygon2D

func _ready() -> void:
	super._ready()
	display_name = "Material Gather Point"
	interaction_type = "gather"
	_setup_visual_model()

func _process(delta: float) -> void:
	_anim_time += delta
	if _model_root:
		_model_root.position.y = sin(_anim_time * 2.2) * 1.2
	if _crystal_a:
		_crystal_a.rotation = sin(_anim_time * 1.8) * 0.06
	if _crystal_b:
		_crystal_b.rotation = -sin(_anim_time * 1.4) * 0.05
	if _glow:
		_glow.modulate.a = 0.28 + abs(sin(_anim_time * 3.0)) * 0.2

func on_interact(actor: Node, component: InteractionComponent) -> void:
	# Add material to inventory
	InventorySystem.add_item(material_type, material_amount)
	
	print("Gathered %d x %s" % [material_amount, material_type])
	
	# Mark as gathered (disable interaction)
	component.set_active(false)
	if _model_root:
		_model_root.modulate = Color(0.55, 0.62, 0.72, 0.45)
	
	# Call parent
	super.on_interact(actor, component)
	
	# Emit feedback
	EventBus.hud_updated.emit()

func _setup_visual_model() -> void:
	var sprite := get_node_or_null("Sprite2D") as Sprite2D
	if sprite:
		sprite.visible = false

	if has_node("Model"):
		_model_root = get_node("Model") as Node2D
		return

	_model_root = Node2D.new()
	_model_root.name = "Model"
	add_child(_model_root)

	_glow = Polygon2D.new()
	_glow.name = "Glow"
	_glow.color = Color(0.25, 0.63, 0.96, 0.36)
	_glow.polygon = PackedVector2Array([
		Vector2(0, -14),
		Vector2(12, 0),
		Vector2(0, 14),
		Vector2(-12, 0)
	])
	_model_root.add_child(_glow)

	_crystal_a = Polygon2D.new()
	_crystal_a.name = "CrystalA"
	_crystal_a.color = Color(0.56, 0.88, 1.0, 1.0)
	_crystal_a.polygon = PackedVector2Array([
		Vector2(0, -18),
		Vector2(8, -2),
		Vector2(4, 12),
		Vector2(-4, 12),
		Vector2(-8, -2)
	])
	_model_root.add_child(_crystal_a)

	_crystal_b = Polygon2D.new()
	_crystal_b.name = "CrystalB"
	_crystal_b.color = Color(0.42, 0.72, 0.95, 0.92)
	_crystal_b.polygon = PackedVector2Array([
		Vector2(-10, 4),
		Vector2(-3, -8),
		Vector2(2, 2),
		Vector2(-2, 12)
	])
	_model_root.add_child(_crystal_b)
