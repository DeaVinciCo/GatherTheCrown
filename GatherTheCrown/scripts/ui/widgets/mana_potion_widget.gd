extends Control

var _mana_current: float = 0.0
var _mana_max: float = 100.0
var _potions_current: float = 0.0
var _potions_max: float = 20.0
var _potions_used: float = 0.0
var _spell_cooldown_pct: float = 0.0
var _mana_boosted: bool = false
var _potions_boosted: bool = false

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
	draw_string(ThemeDB.fallback_font, Vector2(8, 18), "MANA / BOOST / SPELL CD", HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color(0.88, 0.95, 1.0, 1.0))
	_draw_fill_lane(Rect2(8, 26, 196, 16), _mana_current / _mana_max, Color(0.22, 0.62, 0.98, 1.0), _mana_boosted)
	draw_string(ThemeDB.fallback_font, Vector2(8, 58), "Mana %d/%d" % [int(_mana_current), int(_mana_max)], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.83, 0.91, 1.0, 1.0))
	draw_string(ThemeDB.fallback_font, Vector2(124, 58), "Boost %s" % ("ON" if _mana_boosted else "OFF"), HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.76, 0.91, 1.0, 1.0))

	_draw_fill_lane(Rect2(8, 70, 196, 12), _spell_cooldown_pct, Color(0.29, 0.67, 0.99, 1.0), false)
	draw_string(ThemeDB.fallback_font, Vector2(8, 94), "Spell CD %.0f%%" % (_spell_cooldown_pct * 100.0), HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.84, 0.89, 0.95, 1.0))

	_draw_fill_lane(Rect2(8, 102, 196, 12), _potions_current / _potions_max, Color(0.75, 0.48, 0.93, 1.0), _potions_boosted)
	draw_string(ThemeDB.fallback_font, Vector2(8, 126), "Potions Used %d | Left %d" % [int(_potions_used), int(_potions_current)], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.93, 0.87, 0.98, 1.0))

func _draw_fill_lane(rect: Rect2, pct: float, fill_color: Color, boosted: bool) -> void:
	var amount := clampf(pct, 0.0, 1.0)
	draw_rect(rect, Color(0.08, 0.11, 0.16, 0.95), true)
	var fill_rect := Rect2(rect.position, Vector2(rect.size.x * amount, rect.size.y))
	draw_rect(fill_rect, fill_color, true)
	if boosted:
		draw_rect(rect.grow(3.0), Color(fill_color.r, fill_color.g, fill_color.b, 0.45), false, 2.0)
	draw_rect(rect, Color(0.02, 0.03, 0.05, 1.0), false, 1.5)
