extends Control

var _active: bool = false
var _health_current: float = 0.0
var _health_max: float = 100.0
var _xp_current: float = 0.0
var _xp_max: float = 100.0
var _food_current: float = 0.0
var _food_max: float = 100.0
const SEGMENTS := 10
var _anim_time: float = 0.0

func _ready() -> void:
	set_process(true)

func _process(delta: float) -> void:
	_anim_time += delta
	queue_redraw()

func set_state(data: Dictionary) -> void:
	_active = bool(data.get("active", false))
	_health_current = float(data.get("health_current", 0.0))
	_health_max = maxf(float(data.get("health_max", 100.0)), 1.0)
	_xp_current = float(data.get("xp_current", 0.0))
	_xp_max = maxf(float(data.get("xp_max", 100.0)), 1.0)
	_food_current = float(data.get("food_current", 0.0))
	_food_max = maxf(float(data.get("food_max", 100.0)), 1.0)
	queue_redraw()

func _draw() -> void:
	var panel := Rect2(Vector2.ZERO, size)
	draw_rect(panel, Color(0.05, 0.11, 0.12, 0.84), true)
	draw_rect(panel, Color(0.20, 0.68, 0.70, 0.75), false, 1.4)

	draw_string(ThemeDB.fallback_font, Vector2(34, 18), "CREAT STATUS", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0.88, 0.95, 1.0, 1.0))

	var icon_pulse := 0.80 + sin(_anim_time * 2.9) * 0.18
	draw_circle(Vector2(10, 28), 9.0, Color(0.21, 0.57, 0.95, icon_pulse))
	draw_circle(Vector2(20, 28), 9.0, Color(0.21, 0.57, 0.95, icon_pulse))
	draw_colored_polygon(PackedVector2Array([Vector2(2, 31), Vector2(28, 31), Vector2(15, 45)]), Color(0.21, 0.57, 0.95, icon_pulse))
	draw_arc(Vector2(15, 31), 14.0, 0.0, TAU, 32, Color(0.53, 0.88, 1.0, 0.24), 1.1)

	if not _active:
		draw_string(ThemeDB.fallback_font, Vector2(34, 38), "Creat not active yet", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.65, 0.72, 0.78, 0.95))
		return

	var hp_pct: float = clampf(_health_current / _health_max, 0.0, 1.0)
	var lit_segments: int = int(round(hp_pct * SEGMENTS))
	for i in SEGMENTS:
		var seg_rect := Rect2(34.0 + i * 14.5, 24.0, 11.0, 10.0)
		draw_rect(seg_rect, Color(0.28, 0.70, 1.0, 1.0) if i < lit_segments else Color(0.14, 0.20, 0.30, 0.95), true)
		if i < lit_segments:
			draw_rect(seg_rect.grow(-2.0), Color(0.70, 0.92, 1.0, 0.35), true)
		draw_rect(seg_rect, Color(0.03, 0.05, 0.07, 1.0), false, 1.0)
	draw_string(ThemeDB.fallback_font, Vector2(34, 50), "HP %d/%d" % [int(_health_current), int(_health_max)], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.86, 0.94, 1.0, 1.0))

	_draw_fill_lane(Rect2(34, 58, 150, 12), _xp_current / _xp_max, Color(0.35, 0.88, 0.54, 1.0))
	draw_string(ThemeDB.fallback_font, Vector2(34, 84), "XP %d/%d" % [int(_xp_current), int(_xp_max)], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.80, 0.94, 0.82, 1.0))

	_draw_fill_lane(Rect2(34, 92, 150, 12), _food_current / _food_max, Color(0.95, 0.72, 0.24, 1.0))
	draw_string(ThemeDB.fallback_font, Vector2(34, 118), "Food %d/%d" % [int(_food_current), int(_food_max)], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.98, 0.91, 0.72, 1.0))

func _draw_fill_lane(rect: Rect2, pct: float, fill_color: Color) -> void:
	var amount := clampf(pct, 0.0, 1.0)
	draw_rect(rect, Color(0.08, 0.11, 0.16, 0.95), true)
	draw_rect(Rect2(rect.position, Vector2(rect.size.x * amount, rect.size.y)), fill_color, true)
	draw_rect(rect, Color(0.02, 0.03, 0.05, 1.0), false, 1.0)
