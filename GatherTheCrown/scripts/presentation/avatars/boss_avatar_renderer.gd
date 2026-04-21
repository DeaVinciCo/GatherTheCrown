extends RefCounted
## Renders and animates boss avatars with strong silhouette, crown motif, and telegraph feedback.

class_name BossAvatarRenderer

var _root: Node2D
var _shadow: Polygon2D
var _core: Polygon2D
var _crown: Polygon2D
var _aura: Line2D
var _anim_time: float = 0.0

func setup(host: CharacterBody2D, element: String) -> void:
	var sprite := host.get_node_or_null("Sprite2D") as Sprite2D
	if sprite:
		sprite.visible = false

	if host.has_node("Avatar"):
		_root = host.get_node("Avatar") as Node2D
		set_element(element)
		return

	_root = Node2D.new()
	_root.name = "Avatar"
	host.add_child(_root)

	_shadow = Polygon2D.new()
	_shadow.name = "Shadow"
	_shadow.color = Color(0.0, 0.0, 0.0, 0.35)
	_shadow.polygon = PackedVector2Array([
		Vector2(-20, 24),
		Vector2(20, 24),
		Vector2(15, 30),
		Vector2(-15, 30)
	])
	_root.add_child(_shadow)

	_core = Polygon2D.new()
	_core.name = "Core"
	_core.polygon = PackedVector2Array([
		Vector2(0, -22),
		Vector2(18, -8),
		Vector2(15, 14),
		Vector2(0, 22),
		Vector2(-15, 14),
		Vector2(-18, -8)
	])
	_root.add_child(_core)

	_crown = Polygon2D.new()
	_crown.name = "Crown"
	_crown.polygon = PackedVector2Array([
		Vector2(-14, -18),
		Vector2(-8, -30),
		Vector2(-2, -20),
		Vector2(0, -34),
		Vector2(2, -20),
		Vector2(8, -30),
		Vector2(14, -18)
	])
	_root.add_child(_crown)

	_aura = Line2D.new()
	_aura.name = "Aura"
	_aura.width = 2.8
	_aura.closed = true
	_aura.default_color = Color(1.0, 0.58, 0.22, 0.75)
	_aura.points = PackedVector2Array([
		Vector2(0, -28),
		Vector2(20, -14),
		Vector2(24, 0),
		Vector2(20, 14),
		Vector2(0, 28),
		Vector2(-20, 14),
		Vector2(-24, 0),
		Vector2(-20, -14)
	])
	_root.add_child(_aura)

	set_element(element)

func set_element(element: String) -> void:
	if _core == null or _crown == null:
		return

	var palette := _palette_for_element(element)
	_core.color = palette.base
	_crown.color = palette.accent
	if _aura:
		_aura.default_color = palette.aura

func tick(delta: float, velocity: Vector2, telegraphing: bool, phase: int) -> void:
	if _root == null:
		return

	_anim_time += delta
	var pulse_speed := 6.0 if telegraphing else 3.0
	var pulse_strength := 0.12 if telegraphing else 0.05
	var pulse := 1.0 + sin(_anim_time * pulse_speed) * pulse_strength
	_root.scale = Vector2.ONE * pulse

	var bob := sin(_anim_time * (8.0 if phase > 1 else 5.0)) * (2.2 if phase > 1 else 1.2)
	_root.position.y = bob
	_root.rotation = clampf(velocity.x * 0.0006, -0.08, 0.08)

	if _aura:
		_aura.rotation += delta * (0.9 if telegraphing else 0.35)
		_aura.modulate.a = 0.95 if telegraphing else 0.7

func _palette_for_element(element: String) -> Dictionary:
	match element.to_lower():
		"fire":
			return {
				"base": Color(0.74, 0.2, 0.13, 1.0),
				"accent": Color(1.0, 0.72, 0.28, 0.95),
				"aura": Color(1.0, 0.48, 0.2, 0.78)
			}
		"water":
			return {
				"base": Color(0.15, 0.36, 0.72, 1.0),
				"accent": Color(0.64, 0.86, 1.0, 0.95),
				"aura": Color(0.45, 0.8, 1.0, 0.75)
			}
		"earth":
			return {
				"base": Color(0.34, 0.45, 0.2, 1.0),
				"accent": Color(0.84, 0.76, 0.5, 0.95),
				"aura": Color(0.72, 0.62, 0.38, 0.75)
			}
		"shadow":
			return {
				"base": Color(0.2, 0.16, 0.32, 1.0),
				"accent": Color(0.76, 0.68, 0.9, 0.95),
				"aura": Color(0.54, 0.42, 0.8, 0.75)
			}
		_:
			return {
				"base": Color(0.55, 0.22, 0.18, 1.0),
				"accent": Color(1.0, 0.78, 0.42, 0.95),
				"aura": Color(1.0, 0.56, 0.24, 0.75)
			}
