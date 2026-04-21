extends Control
## GameLabel - In-game text banner (darker palette, less intrusive than RoyalPanel)
## Use for: quest titles, location names, "New Objective", dialogue popups, system messages
## Based on Image 3 style but darkened to match Image 1 navy scheme

class_name GameLabel

enum LabelType {
	QUEST,        # Quest title / new objective
	LOCATION,     # Zone / location name
	DIALOGUE,     # NPC dialogue popup
	SYSTEM,       # System message (item picked up, etc.)
	OBJECTIVE     # "New Objective" style
}

@export var label_text: String = "" :
	set(val):
		label_text = val
		if is_node_ready(): queue_redraw()

@export var sub_text: String = "" :
	set(val):
		sub_text = val
		if is_node_ready(): queue_redraw()

@export var label_type: LabelType = LabelType.SYSTEM :
	set(val):
		label_type = val
		if is_node_ready(): queue_redraw()

@export var auto_hide_seconds: float = 0.0  # 0 = stays visible, >0 = auto-hides

# Darkened palette (matches gameplay without fighting it)
const NAVY_BG     := Color(0.040, 0.055, 0.110, 0.92)
const GOLD_TRIM   := Color(0.78,  0.61,  0.20,  0.90)
const GOLD_TEXT   := Color(0.94,  0.80,  0.38,  1.0)
const WHITE_TEXT  := Color(0.92,  0.93,  0.96,  0.95)
const GEM_ACCENT  := Color(0.32,  0.58,  0.95,  1.0)  # blue gem accent for quest type

var _hide_timer: float = 0.0
var _visible_alpha: float = 1.0
var _fade_out: bool = false

func _ready() -> void:
	if auto_hide_seconds > 0.0:
		_hide_timer = auto_hide_seconds
	mouse_filter = MOUSE_FILTER_IGNORE

func _process(delta: float) -> void:
	if auto_hide_seconds > 0.0 and _hide_timer > 0.0:
		_hide_timer -= delta
		if _hide_timer <= 0.5:
			_visible_alpha = maxf(0.0, _hide_timer / 0.5)
			modulate.a = _visible_alpha
			if _hide_timer <= 0.0:
				visible = false

func show_message(text: String, sub: String = "", type: LabelType = LabelType.SYSTEM, duration: float = 3.0) -> void:
	label_text = text
	sub_text = sub
	label_type = type
	auto_hide_seconds = duration
	_hide_timer = duration
	_visible_alpha = 1.0
	modulate.a = 1.0
	visible = true
	queue_redraw()

func _draw() -> void:
	var w := size.x
	var h := size.y
	if w <= 0 or h <= 0:
		return

	# Background — slightly curved feel via inset
	draw_rect(Rect2(Vector2.ZERO, Vector2(w, h)), NAVY_BG, true)

	# Top and bottom trim lines
	draw_line(Vector2(0, 0), Vector2(w, 0), GOLD_TRIM, 2.0)
	draw_line(Vector2(0, h), Vector2(w, h), GOLD_TRIM, 2.0)

	# Left/right shorter accent lines (art-deco: not full height)
	var accent_h := h * 0.6
	var off := (h - accent_h) * 0.5
	draw_line(Vector2(0, off), Vector2(0, h - off), GOLD_TRIM, 2.0)
	draw_line(Vector2(w, off), Vector2(w, h - off), GOLD_TRIM, 2.0)

	# Corner notches (diagonal cut like art-deco)
	var notch := 8.0
	for corner in [Vector2(0, 0), Vector2(w, 0), Vector2(0, h), Vector2(w, h)]:
		var sign_x: float = 1.0 if corner.x == 0 else -1.0
		var sign_y: float = 1.0 if corner.y == 0 else -1.0
		draw_line(corner + Vector2(sign_x * notch, 0), corner + Vector2(0, sign_y * notch), GOLD_TRIM, 1.5)

	# Type indicator gem (left side)
	var gem_color := _type_gem_color()
	_draw_small_diamond(Vector2(14, h * 0.5), 5.0, gem_color)

	# Main label text
	if label_text != "":
		var font := ThemeDB.fallback_font
		var fsize := _type_font_size()
		draw_string(font, Vector2(26, h * 0.5 - (2.0 if sub_text != "" else -6.0)), label_text,
			HORIZONTAL_ALIGNMENT_LEFT, w - 36, fsize, GOLD_TEXT)

	# Sub text
	if sub_text != "":
		var font := ThemeDB.fallback_font
		draw_string(font, Vector2(26, h * 0.5 + 14), sub_text,
			HORIZONTAL_ALIGNMENT_LEFT, w - 36, 12, WHITE_TEXT)

	# Right side: type label tag
	var tag_text := _type_tag()
	if tag_text != "":
		var font := ThemeDB.fallback_font
		var tw := font.get_string_size(tag_text, HORIZONTAL_ALIGNMENT_RIGHT, -1, 11).x
		draw_string(font, Vector2(w - tw - 12, 14), tag_text,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(GOLD_TRIM.r, GOLD_TRIM.g, GOLD_TRIM.b, 0.72))

func _type_gem_color() -> Color:
	match label_type:
		LabelType.QUEST:      return Color(0.98, 0.78, 0.20, 1.0)   # gold
		LabelType.LOCATION:   return Color(0.30, 0.85, 0.55, 1.0)   # green
		LabelType.DIALOGUE:   return Color(0.32, 0.58, 0.95, 1.0)   # blue
		LabelType.SYSTEM:     return Color(0.75, 0.75, 0.80, 1.0)   # silver
		LabelType.OBJECTIVE:  return Color(0.96, 0.42, 0.42, 1.0)   # red/urgent
	return GOLD_TRIM

func _type_tag() -> String:
	match label_type:
		LabelType.QUEST:     return "QUEST"
		LabelType.LOCATION:  return "LOCATION"
		LabelType.DIALOGUE:  return "MESSAGE"
		LabelType.SYSTEM:    return ""
		LabelType.OBJECTIVE: return "OBJECTIVE"
	return ""

func _type_font_size() -> int:
	match label_type:
		LabelType.LOCATION:  return 18
		LabelType.QUEST:     return 16
		LabelType.OBJECTIVE: return 15
		_:                   return 13

func _draw_small_diamond(center: Vector2, half: float, color: Color) -> void:
	var pts := PackedVector2Array([
		center + Vector2(0, -half),
		center + Vector2(half, 0),
		center + Vector2(0, half),
		center + Vector2(-half, 0)
	])
	draw_colored_polygon(pts, color)
