extends RefCounted
## Renders and animates the Fire Creat avatar visuals.

class_name FireCreatAvatarRenderer

var _avatar_root: Node2D
var _avatar_flame_outer: Polygon2D
var _avatar_flame_inner: Polygon2D
var _avatar_core: Polygon2D
var _avatar_tail: Polygon2D
var _avatar_ember: Polygon2D
var _anim_time: float = 0.0

func setup(host: CharacterBody2D) -> void:
	var sprite := host.get_node_or_null("Sprite2D") as Sprite2D
	if sprite:
		sprite.visible = false

	if host.has_node("Avatar"):
		_avatar_root = host.get_node("Avatar") as Node2D
		return

	_avatar_root = Node2D.new()
	_avatar_root.name = "Avatar"
	host.add_child(_avatar_root)

	_avatar_flame_outer = Polygon2D.new()
	_avatar_flame_outer.name = "FlameOuter"
	_avatar_flame_outer.color = Color(1.0, 0.35, 0.05, 1.0)
	_avatar_flame_outer.polygon = PackedVector2Array([
		Vector2(0, -16),
		Vector2(10, -5),
		Vector2(8, 10),
		Vector2(0, 14),
		Vector2(-8, 10),
		Vector2(-10, -5)
	])
	_avatar_root.add_child(_avatar_flame_outer)

	_avatar_flame_inner = Polygon2D.new()
	_avatar_flame_inner.name = "FlameInner"
	_avatar_flame_inner.color = Color(1.0, 0.85, 0.2, 0.95)
	_avatar_flame_inner.polygon = PackedVector2Array([
		Vector2(0, -10),
		Vector2(5, -2),
		Vector2(4, 7),
		Vector2(0, 10),
		Vector2(-4, 7),
		Vector2(-5, -2)
	])
	_avatar_root.add_child(_avatar_flame_inner)

	_avatar_core = Polygon2D.new()
	_avatar_core.name = "Core"
	_avatar_core.color = Color(1.0, 0.98, 0.72, 0.92)
	_avatar_core.polygon = PackedVector2Array([
		Vector2(0, -6),
		Vector2(3, -1),
		Vector2(3, 4),
		Vector2(0, 6),
		Vector2(-3, 4),
		Vector2(-3, -1)
	])
	_avatar_root.add_child(_avatar_core)

	_avatar_tail = Polygon2D.new()
	_avatar_tail.name = "Tail"
	_avatar_tail.color = Color(0.92, 0.22, 0.08, 0.85)
	_avatar_tail.polygon = PackedVector2Array([
		Vector2(-4, 10),
		Vector2(4, 10),
		Vector2(8, 18),
		Vector2(0, 22),
		Vector2(-8, 18)
	])
	_avatar_root.add_child(_avatar_tail)

	_avatar_ember = Polygon2D.new()
	_avatar_ember.name = "Ember"
	_avatar_ember.color = Color(1.0, 0.7, 0.2, 0.75)
	_avatar_ember.polygon = PackedVector2Array([
		Vector2(0, -20),
		Vector2(3, -16),
		Vector2(0, -12),
		Vector2(-3, -16)
	])
	_avatar_root.add_child(_avatar_ember)

	var eye_left := Polygon2D.new()
	eye_left.name = "EyeLeft"
	eye_left.color = Color(0.1, 0.06, 0.02, 0.95)
	eye_left.polygon = PackedVector2Array([
		Vector2(-4, -2),
		Vector2(-2, -2),
		Vector2(-2, 0),
		Vector2(-4, 0)
	])
	_avatar_root.add_child(eye_left)

	var eye_right := Polygon2D.new()
	eye_right.name = "EyeRight"
	eye_right.color = Color(0.1, 0.06, 0.02, 0.95)
	eye_right.polygon = PackedVector2Array([
		Vector2(2, -2),
		Vector2(4, -2),
		Vector2(4, 0),
		Vector2(2, 0)
	])
	_avatar_root.add_child(eye_right)

func tick(delta: float, velocity: Vector2, movement_speed: float) -> void:
	if _avatar_root == null:
		return

	_anim_time += delta
	var pulse := 1.0 + sin(_anim_time * 9.0) * 0.08
	var flicker := 1.0 + sin(_anim_time * 18.0) * 0.04
	var moving := velocity.length() > 5.0

	_avatar_root.scale = Vector2.ONE * pulse
	_avatar_root.position.y = sin(_anim_time * (8.0 if moving else 4.0)) * (1.8 if moving else 0.9)
	_avatar_flame_inner.scale = Vector2.ONE * flicker
	_avatar_flame_outer.rotation = clamp(velocity.x / max(1.0, movement_speed) * 0.35, -0.35, 0.35)
	if _avatar_core:
		_avatar_core.scale = Vector2.ONE * (1.0 + abs(sin(_anim_time * 11.0)) * 0.12)
	if _avatar_tail:
		_avatar_tail.rotation = -_avatar_flame_outer.rotation * 0.75 + sin(_anim_time * (12.0 if moving else 6.0)) * 0.06
	if _avatar_ember:
		_avatar_ember.position.y = -16 + sin(_anim_time * 6.0) * 2.2
		_avatar_ember.rotation += delta * 1.6