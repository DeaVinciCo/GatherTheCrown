extends RefCounted
## Renders and animates the player avatar visuals.

class_name PlayerAvatarRenderer

var _avatar_root: Node2D
var _avatar_body: Polygon2D
var _avatar_head: Polygon2D
var _avatar_hair: Polygon2D
var _avatar_emblem: Polygon2D
var _avatar_shadow: Polygon2D
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

	_avatar_shadow = Polygon2D.new()
	_avatar_shadow.name = "Shadow"
	_avatar_shadow.color = Color(0.0, 0.0, 0.0, 0.35)
	_avatar_shadow.polygon = PackedVector2Array([
		Vector2(-12, 16),
		Vector2(12, 16),
		Vector2(9, 20),
		Vector2(-9, 20)
	])
	_avatar_root.add_child(_avatar_shadow)

	_avatar_body = Polygon2D.new()
	_avatar_body.name = "Body"
	_avatar_body.color = Color(0.11, 0.55, 0.98, 1.0)
	_avatar_body.polygon = PackedVector2Array([
		Vector2(0, -10),
		Vector2(11, -1),
		Vector2(10, 12),
		Vector2(-10, 12),
		Vector2(-11, -1)
	])
	_avatar_root.add_child(_avatar_body)

	_avatar_head = Polygon2D.new()
	_avatar_head.name = "Head"
	_avatar_head.color = Color(1.0, 0.84, 0.66, 1.0)
	_avatar_head.polygon = PackedVector2Array([
		Vector2(-6, -18),
		Vector2(6, -18),
		Vector2(7, -8),
		Vector2(-7, -8)
	])
	_avatar_root.add_child(_avatar_head)

	_avatar_hair = Polygon2D.new()
	_avatar_hair.name = "Hair"
	_avatar_hair.color = Color(0.12, 0.15, 0.22, 1.0)
	_avatar_hair.polygon = PackedVector2Array([
		Vector2(-7, -18),
		Vector2(7, -18),
		Vector2(5, -22),
		Vector2(-5, -22)
	])
	_avatar_root.add_child(_avatar_hair)

	_avatar_emblem = Polygon2D.new()
	_avatar_emblem.name = "Crest"
	_avatar_emblem.color = Color(1.0, 0.84, 0.15, 1.0)
	_avatar_emblem.polygon = PackedVector2Array([
		Vector2(0, -2),
		Vector2(3, 2),
		Vector2(0, 5),
		Vector2(-3, 2)
	])
	_avatar_root.add_child(_avatar_emblem)

func tick(delta: float, velocity: Vector2, current_direction: Vector2) -> void:
	if _avatar_root == null:
		return

	_anim_time += delta
	var moving := velocity.length() > 6.0
	var bob_amp := 2.2 if moving else 0.8
	var bob_speed := 12.0 if moving else 5.0
	var bob := sin(_anim_time * bob_speed) * bob_amp
	_avatar_root.position.y = bob

	var facing := current_direction
	if facing == Vector2.ZERO:
		facing = Vector2.DOWN

	if facing.x < -0.2:
		_avatar_root.scale.x = -1.0
	elif facing.x > 0.2:
		_avatar_root.scale.x = 1.0

	var tilt := 0.0
	if moving:
		tilt = clamp(facing.x * 0.12, -0.12, 0.12)
	_avatar_body.rotation = tilt
	_avatar_head.rotation = -tilt * 0.7

	if facing.y < -0.45:
		_avatar_body.color = Color(0.2, 0.65, 1.0, 1.0)
	elif facing.y > 0.45:
		_avatar_body.color = Color(0.09, 0.48, 0.9, 1.0)
	else:
		_avatar_body.color = Color(0.11, 0.55, 0.98, 1.0)

	_avatar_emblem.scale = Vector2.ONE * (1.0 + abs(sin(_anim_time * 6.0)) * 0.06)