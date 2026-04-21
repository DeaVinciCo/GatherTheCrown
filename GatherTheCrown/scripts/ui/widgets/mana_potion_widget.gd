extends Control

var _mana_current: float = 0.0
var _mana_max: float = 100.0
var _potions_current: float = 0.0
var _potions_max: float = 20.0
var _potions_used: float = 0.0
var _spell_cooldown_pct: float = 0.0
var _mana_boosted: bool = false
var _potions_boosted: bool = false
var _anim_time: float = 0.0

func _ready() -> void:
	set_process(true)

func _process(delta: float) -> void:
	_anim_time += delta
	queue_redraw()

func set_state(data: Dictionary) -> void:
	_mana_current = float(data.get("mana_current", 0.0))
	_mana_max = maxf(float(data.get("mana_max", 100.0)), 1.0)
	_potions_current = float(data.get("potions_current", 0.0))
	_potions_max = maxf(float(data.get("potions_max", 20.0)), 1.0)
	_potions_used = clampf(float(data.get("potions_used", 0.0)), 0.0, _potions_max)
	_spell_cooldown_pct = clampf(float(data.get("spell_cooldown_pct", 0.0)), 0.0, 1.0)
	_mana_boosted = bool(data.get("mana_boosted", false))
	_potions_boosted = bool(data.get("potions_boosted", false))
	queue_redraw()

func _draw() -> void:
	var panel := Rect2(Vector2.ZERO, size)
	draw_rect(panel, Color(0.05, 0.08, 0.14, 0.82), true)
	draw_rect(panel, Color(0.20, 0.50, 0.76, 0.80), false, 1.6)

	draw_string(ThemeDB.fallback_font, Vector2(8, 18), "MANA / BOOST / SPELL CD", HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color(0.88, 0.95, 1.0, 1.0))
	_draw_mana_icon(Vector2(214, 14))
	_draw_fill_lane(Rect2(8, 26, 196, 16), _mana_current / _mana_max, Color(0.22, 0.62, 0.98, 1.0), _mana_boosted)
	draw_string(ThemeDB.fallback_font, Vector2(8, 58), "Mana %d/%d" % [int(_mana_current), int(_mana_max)], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.83, 0.91, 1.0, 1.0))
	draw_string(ThemeDB.fallback_font, Vector2(124, 58), "Boost %s" % ("ON" if _mana_boosted else "OFF"), HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.76, 0.91, 1.0, 1.0))

	_draw_fill_lane(Rect2(8, 70, 196, 12), _spell_cooldown_pct, Color(0.29, 0.67, 0.99, 1.0), false)
	draw_string(ThemeDB.fallback_font, Vector2(8, 94), "Spell CD %.0f%%" % (_spell_cooldown_pct * 100.0), HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.84, 0.89, 0.95, 1.0))

	_draw_fill_lane(Rect2(8, 102, 196, 12), _potions_current / _potions_max, Color(0.75, 0.48, 0.93, 1.0), _potions_boosted)
	_draw_potion_icon(Vector2(214, 90))
	draw_string(ThemeDB.fallback_font, Vector2(8, 126), "Potions Used %d | Left %d" % [int(_potions_used), int(_potions_current)], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.93, 0.87, 0.98, 1.0))

func _draw_fill_lane(rect: Rect2, pct: float, fill_color: Color, boosted: bool) -> void:
	var amount := clampf(pct, 0.0, 1.0)
	draw_rect(rect, Color(0.08, 0.11, 0.16, 0.95), true)
	var fill_rect := Rect2(rect.position, Vector2(rect.size.x * amount, rect.size.y))
	draw_rect(fill_rect, fill_color, true)
	if boosted:
		var shimmer := 0.32 + sin(_anim_time * 4.2) * 0.13
		draw_rect(rect.grow(3.0), Color(fill_color.r, fill_color.g, fill_color.b, shimmer), false, 2.0)
	draw_rect(rect, Color(0.02, 0.03, 0.05, 1.0), false, 1.5)

func _draw_mana_icon(center: Vector2) -> void:
	var wobble := sin(_anim_time * 2.4) * 1.1
	var points := PackedVector2Array([
		center + Vector2(0, -10 + wobble),
		center + Vector2(8, -2 + wobble),
		center + Vector2(5, 8 + wobble),
		center + Vector2(-5, 8 + wobble),
		center + Vector2(-8, -2 + wobble),
	])
	draw_colored_polygon(points, Color(0.28, 0.78, 1.0, 0.95))
	draw_polyline(points + PackedVector2Array([points[0]]), Color(0.80, 0.95, 1.0, 0.8), 1.3)

func _draw_potion_icon(center: Vector2) -> void:
	var glow := 0.72 + sin(_anim_time * 3.1) * 0.20
	var bottle := Rect2(center.x - 8, center.y - 8, 16, 18)
	var cork := Rect2(center.x - 4, center.y - 13, 8, 5)
	draw_rect(cork, Color(0.93, 0.82, 0.61, 0.9), true)
	draw_rect(bottle, Color(0.78, 0.48, 0.98, glow), true)
	draw_rect(bottle, Color(0.93, 0.84, 1.0, 0.95), false, 1.1)
