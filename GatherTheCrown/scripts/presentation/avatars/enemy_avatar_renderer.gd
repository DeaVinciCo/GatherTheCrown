extends RefCounted
## Renders and animates enemy avatars with layered silhouettes and readable combat motion.

class_name EnemyAvatarRenderer

var _root: Node2D
var _shadow: Polygon2D
var _body: Polygon2D
var _trim: Polygon2D
var _eyes: Polygon2D
var _spike: Polygon2D
var _anim_time: float = 0.0

func setup(host: CharacterBody2D, enemy_type: String, combat_class: String) -> void:
	var sprite := host.get_node_or_null("Sprite2D") as Sprite2D
	if sprite:
		sprite.visible = false

	if host.has_node("Avatar"):
		_root = host.get_node("Avatar") as Node2D
		reconfigure(enemy_type, combat_class)
		return

	_root = Node2D.new()
	_root.name = "Avatar"
	host.add_child(_root)

	_shadow = Polygon2D.new()
	_shadow.name = "Shadow"
	_shadow.color = Color(0.0, 0.0, 0.0, 0.28)
	_shadow.polygon = PackedVector2Array([
		Vector2(-14, 17),
		Vector2(14, 17),
		Vector2(10, 22),
		Vector2(-10, 22)
	])
	_root.add_child(_shadow)

	_body = Polygon2D.new()
	_body.name = "Body"
	_root.add_child(_body)

	_trim = Polygon2D.new()
	_trim.name = "Trim"
	_trim.color = Color(1.0, 0.92, 0.65, 0.85)
	_trim.polygon = PackedVector2Array([
		Vector2(0, -11),
		Vector2(7, -2),
		Vector2(0, 6),
		Vector2(-7, -2)
	])
	_root.add_child(_trim)

	_eyes = Polygon2D.new()
	_eyes.name = "Eyes"
	_eyes.color = Color(0.05, 0.02, 0.02, 0.95)
	_eyes.polygon = PackedVector2Array([
		Vector2(-5, -3),
		Vector2(-1, -3),
		Vector2(-1, -1),
		Vector2(-5, -1),
		Vector2(1, -3),
		Vector2(5, -3),
		Vector2(5, -1),
		Vector2(1, -1)
	])
	_root.add_child(_eyes)

	_spike = Polygon2D.new()
	_spike.name = "Spike"
	_spike.color = Color(0.95, 0.9, 0.8, 0.8)
	_spike.polygon = PackedVector2Array([
		Vector2(0, -18),
		Vector2(4, -11),
		Vector2(-4, -11)
	])
	_root.add_child(_spike)

	reconfigure(enemy_type, combat_class)

func reconfigure(enemy_type: String, combat_class: String) -> void:
	if _root == null or _body == null:
		return

	_body.polygon = _body_shape_for_class(combat_class)
	_body.color = _base_color_for_type(enemy_type)

	var accent := _accent_color_for_type(enemy_type)
	if _trim:
		_trim.color = accent
	if _spike:
		_spike.visible = combat_class != "scout"
		_spike.color = accent.lightened(0.15)

func tick(delta: float, velocity: Vector2, movement_speed: float, attack_cooldown_ratio: float) -> void:
	if _root == null:
		return

	_anim_time += delta
	var moving := velocity.length() > 4.0
	var bob_speed := 12.0 if moving else 5.0
	var bob_amp := 1.8 if moving else 0.7
	_root.position.y = sin(_anim_time * bob_speed) * bob_amp

	if velocity.x < -2.0:
		_root.scale.x = -1.0
	elif velocity.x > 2.0:
		_root.scale.x = 1.0

	var normalized_speed := velocity.length() / maxf(1.0, movement_speed)
	_body.rotation = clampf(velocity.x * 0.0012, -0.12, 0.12)

	# Eyes tighten and trim glows as attacks come off cooldown.
	var eye_squint := 1.0 - clampf(normalized_speed * 0.18, 0.0, 0.18)
	_eyes.scale.y = eye_squint
	var tension := 1.0 - clampf(attack_cooldown_ratio, 0.0, 1.0)
	_trim.scale = Vector2.ONE * (1.0 + tension * 0.12)

func _body_shape_for_class(combat_class: String) -> PackedVector2Array:
	match combat_class:
		"scout":
			return PackedVector2Array([
				Vector2(0, -13),
				Vector2(12, -2),
				Vector2(8, 12),
				Vector2(-8, 12),
				Vector2(-12, -2)
			])
		"knight":
			return PackedVector2Array([
				Vector2(0, -15),
				Vector2(13, -6),
				Vector2(10, 12),
				Vector2(0, 17),
				Vector2(-10, 12),
				Vector2(-13, -6)
			])
		_:
			return PackedVector2Array([
				Vector2(0, -14),
				Vector2(11, -4),
				Vector2(11, 10),
				Vector2(0, 14),
				Vector2(-11, 10),
				Vector2(-11, -4)
			])

func _base_color_for_type(enemy_type: String) -> Color:
	match enemy_type:
		"goblin_scout":
			return Color(0.22, 0.57, 0.2, 1.0)
		"forest_bat":
			return Color(0.31, 0.2, 0.47, 1.0)
		"cave_bat":
			return Color(0.2, 0.12, 0.34, 1.0)
		"bandit_rogue":
			return Color(0.54, 0.18, 0.2, 1.0)
		"orc_warrior":
			return Color(0.38, 0.5, 0.2, 1.0)
		"skeleton_guard":
			return Color(0.8, 0.8, 0.72, 1.0)
		"crown_knight":
			return Color(0.58, 0.44, 0.14, 1.0)
		_:
			return Color(0.78, 0.24, 0.24, 1.0)

func _accent_color_for_type(enemy_type: String) -> Color:
	match enemy_type:
		"forest_bat", "cave_bat":
			return Color(0.95, 0.67, 1.0, 0.9)
		"skeleton_guard":
			return Color(0.95, 0.95, 1.0, 0.9)
		"crown_knight":
			return Color(1.0, 0.87, 0.42, 0.9)
		_:
			return Color(1.0, 0.78, 0.56, 0.88)
