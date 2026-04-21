extends Control

var _unlocked_slots: int = 1
var _cooldown_pct: float = 0.0
var _attack_count: int = 1
var _hero_xp_current: float = 0.0
var _hero_xp_max: float = 100.0

func set_state(data: Dictionary) -> void:
	_unlocked_slots = clampi(int(data.get("unlocked_slots", 1)), 1, 6)
	_cooldown_pct = clampf(float(data.get("cooldown_pct", 0.0)), 0.0, 1.0)
	_attack_count = max(1, int(data.get("attack_count", 1)))
	_hero_xp_current = float(data.get("hero_xp_current", 0.0))
	_hero_xp_max = maxf(float(data.get("hero_xp_max", 100.0)), 1.0)
	queue_redraw()

func _draw() -> void:
	draw_string(ThemeDB.fallback_font, Vector2(8, 18), "ITEMS 1-5 / HERO XP / COOLDOWN", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.95, 0.92, 0.86, 1.0))
	for i in 5:
		var slot_rect := Rect2(8 + i * 32, 28, 26, 26)
		var unlocked: bool = i < _unlocked_slots
		draw_rect(slot_rect, Color(0.26, 0.34, 0.46, 1.0) if unlocked else Color(0.14, 0.14, 0.16, 0.9), true)
		draw_rect(slot_rect, Color(0.95, 0.78, 0.28, 1.0) if unlocked else Color(0.31, 0.31, 0.34, 0.95), false, 1.5)
		draw_string(ThemeDB.fallback_font, slot_rect.position + Vector2(7, 18), "%d" % (i + 1), HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(0.96, 0.94, 0.84, 1.0))
		if unlocked:
			var cooldown_h: float = slot_rect.size.y * _cooldown_pct
			var cd_rect := Rect2(slot_rect.position.x, slot_rect.position.y + slot_rect.size.y - cooldown_h, slot_rect.size.x, cooldown_h)
			draw_rect(cd_rect, Color(0.06, 0.10, 0.18, 0.58), true)

	draw_string(ThemeDB.fallback_font, Vector2(8, 70), "Unlocked: %d | Attacks: %d" % [_unlocked_slots, _attack_count], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.95, 0.90, 0.78, 1.0))
	_draw_meter_bar(Rect2(8, 78, 192, 10), clampf(_hero_xp_current / _hero_xp_max, 0.0, 1.0), Color(0.33, 0.83, 0.50, 0.95))
	draw_string(ThemeDB.fallback_font, Vector2(8, 98), "Hero XP %d/%d" % [int(_hero_xp_current), int(_hero_xp_max)], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.84, 0.95, 0.86, 1.0))
	_draw_meter_bar(Rect2(8, 104, 192, 10), _cooldown_pct, Color(0.30, 0.66, 0.98, 0.95))
	draw_string(ThemeDB.fallback_font, Vector2(8, 124), "Cooldown %.0f%%" % (_cooldown_pct * 100.0), HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.84, 0.89, 0.95, 1.0))

func _draw_meter_bar(rect: Rect2, pct: float, fill_color: Color) -> void:
	draw_rect(rect, Color(0.09, 0.12, 0.17, 0.95), true)
	draw_rect(Rect2(rect.position, Vector2(rect.size.x * clampf(pct, 0.0, 1.0), rect.size.y)), fill_color, true)
	draw_rect(rect, Color(0.02, 0.03, 0.05, 1.0), false, 1.0)
