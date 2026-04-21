extends RefCounted
## Renders and animates the Fire Creat avatar visuals.

class_name FireCreatAvatarRenderer

var _avatar_root: Node2D
var _avatar_flame_outer: Polygon2D
var _avatar_flame_inner: Polygon2D
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