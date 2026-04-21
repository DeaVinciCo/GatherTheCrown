extends Control

var _current_hp: float = 0.0
var _max_hp: float = 100.0
const SEGMENTS := 10
var _anim_time: float = 0.0

func _ready() -> void:
	set_process(true)

func _process(delta: float) -> void:
	_anim_time += delta
	queue_redraw()

func set_state(data: Dictionary) -> void:
	_current_hp = float(data.get("current", 0.0))
	_max_hp = maxf(float(data.get("max", 100.0)), 1.0)
	queue_redraw()

func _draw() -> void:
	var panel := Rect2(Vector2.ZERO, size)
	draw_rect(panel, Color(0.08, 0.10, 0.14, 0.82), true)
	draw_rect(panel, Color(0.44, 0.20, 0.20, 0.75), false, 1.6)

	var title_color := Color(0.95, 0.92, 0.90, 1.0)
	draw_string(ThemeDB.fallback_font, Vector2(44, 18), "HERO HEALTH", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, title_color)

	var icon_pulse := 0.88 + sin(_anim_time * 3.7) * 0.12
	draw_circle(Vector2(18, 28), 10.0, Color(0.96, 0.25, 0.25, icon_pulse))
	draw_circle(Vector2(28, 28), 10.0, Color(0.96, 0.25, 0.25, icon_pulse))
	draw_colored_polygon(PackedVector2Array([Vector2(8, 31), Vector2(38, 31), Vector2(23, 48)]), Color(0.96, 0.25, 0.25, icon_pulse))
	draw_arc(Vector2(23, 31), 16.0, 0.0, TAU, 40, Color(1.0, 0.55, 0.55, 0.25), 1.4)

	var pct: float = clampf(_current_hp / _max_hp, 0.0, 1.0)
	var lit_segments: int = int(round(pct * SEGMENTS))

	for i in SEGMENTS:
		var seg_x: float = 46.0 + i * 18.0
		var seg_y: float = 28.0 + abs(i - 4.5) * 0.6
		var segment_rect := Rect2(seg_x, seg_y, 14.0, 12.0)
		var on_color := Color(0.94, 0.24, 0.24, 1.0)
		var off_color := Color(0.28, 0.16, 0.16, 0.9)
		draw_rect(segment_rect, on_color if i < lit_segments else off_color, true)
		if i < lit_segments:
			draw_rect(segment_rect.grow(-2.0), Color(1.0, 0.70, 0.70, 0.45), true)
		draw_rect(segment_rect, Color(0.08, 0.06, 0.06, 1.0), false, 1.5)

	draw_string(ThemeDB.fallback_font, Vector2(48, 62), "%d / %d" % [int(_current_hp), int(_max_hp)], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(0.98, 0.94, 0.94, 1.0))
