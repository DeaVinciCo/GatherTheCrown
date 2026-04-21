extends Control
## RoyalPanel - Reusable dark-navy/gold art-deco panel
## Use for: main menu, settings, hero board, inventory screens — anything OUTSIDE gameplay
## Matches Image 1 (Canva design): deep navy bg, symmetrical gold trim, corner diamonds

class_name RoyalPanel

@export var title_text: String = "" :
	set(val):
		title_text = val
		if is_node_ready():
			queue_redraw()

@export var panel_width: float = 700.0 :
	set(val):
		panel_width = val
		custom_minimum_size.x = val
		queue_redraw()

@export var panel_height: float = 500.0 :
	set(val):
		panel_height = val
		custom_minimum_size.y = val
		queue_redraw()

@export var show_corner_diamonds: bool = true
@export var show_side_arrows: bool = false
@export var glow_intensity: float = 0.55

# Color palette — locked to your identity
const NAVY_DARK   := Color(0.055, 0.075, 0.145, 0.96)
const NAVY_MID    := Color(0.07,  0.09,  0.18,  0.97)
const GOLD_BRIGHT := Color(0.92,  0.74,  0.28,  1.0)
const GOLD_DIM    := Color(0.62,  0.49,  0.19,  1.0)
const GOLD_GLOW   := Color(0.96,  0.82,  0.38,  0.38)
const TRIM_LINE   := Color(0.78,  0.62,  0.22,  0.88)

func _ready() -> void:
	custom_minimum_size = Vector2(panel_width, panel_height)
	mouse_filter = MOUSE_FILTER_PASS

func _draw() -> void:
	var w := size.x
	var h := size.y

	# --- Background fill ---
	_draw_navy_bg(w, h)

	# --- Outer gold border ---
	_draw_gold_border(w, h, 2.5, GOLD_BRIGHT)
	_draw_gold_border(w, h, 6.0, GOLD_DIM)

	# --- Inner inset border (double-line art deco look) ---
	var inset := 10.0
	_draw_gold_border_inset(w, h, inset, 1.5, TRIM_LINE)
	_draw_gold_border_inset(w, h, inset + 4.0, 1.0, GOLD_DIM)

	# --- Corner diamonds ---
	if show_corner_diamonds:
		_draw_corner_diamonds(w, h)

	# --- Top center diamond gem ---
	_draw_center_gem(w)

	# --- Side arrows (optional) ---
	if show_side_arrows:
		_draw_side_arrows(h)

	# --- Title ---
	if title_text != "":
		_draw_title(w)

func _draw_navy_bg(w: float, h: float) -> void:
	# Subtle gradient feel: slightly lighter in center
	draw_rect(Rect2(Vector2.ZERO, Vector2(w, h)), NAVY_DARK, true)
	var center_rect := Rect2(w * 0.1, h * 0.1, w * 0.8, h * 0.8)
	draw_rect(center_rect, Color(NAVY_MID.r, NAVY_MID.g, NAVY_MID.b, 0.35), true)

func _draw_gold_border(w: float, h: float, inset: float, color: Color) -> void:
	var pts := PackedVector2Array([
		Vector2(inset, inset),
		Vector2(w - inset, inset),
		Vector2(w - inset, h - inset),
		Vector2(inset, h - inset),
		Vector2(inset, inset)
	])
	draw_polyline(pts, color, 1.5, true)

func _draw_gold_border_inset(w: float, h: float, inset: float, width: float, color: Color) -> void:
	# Art-deco: cut corners slightly
	var cut := 14.0
	var pts := PackedVector2Array([
		Vector2(inset + cut, inset),
		Vector2(w - inset - cut, inset),
		Vector2(w - inset, inset + cut),
		Vector2(w - inset, h - inset - cut),
		Vector2(w - inset - cut, h - inset),
		Vector2(inset + cut, h - inset),
		Vector2(inset, h - inset - cut),
		Vector2(inset, inset + cut),
		Vector2(inset + cut, inset)
	])
	draw_polyline(pts, color, width, true)

func _draw_corner_diamonds(w: float, h: float) -> void:
	var positions := [
		Vector2(20, 20), Vector2(w - 20, 20),
		Vector2(20, h - 20), Vector2(w - 20, h - 20)
	]
	for pos in positions:
		_draw_diamond(pos, 7.0, GOLD_BRIGHT, NAVY_DARK)

func _draw_center_gem(w: float) -> void:
	# Glowing gem at top center — your "heartbeat" symbol
	var gem_pos := Vector2(w * 0.5, 14.0)
	_draw_diamond(gem_pos, 10.0, GOLD_BRIGHT, Color(0.55, 0.18, 0.72, 1.0))
	# Outer glow ring
	if glow_intensity > 0.0:
		var glow_color := Color(GOLD_GLOW.r, GOLD_GLOW.g, GOLD_GLOW.b, glow_intensity * 0.5)
		draw_circle(gem_pos, 16.0, glow_color)

func _draw_side_arrows(h: float) -> void:
	# Left arrow (>>)
	for offset in [0.0, 8.0]:
		draw_polyline(PackedVector2Array([
			Vector2(offset + 2, h * 0.5 - 12),
			Vector2(offset + 12, h * 0.5),
			Vector2(offset + 2, h * 0.5 + 12)
		]), GOLD_DIM, 2.0, true)
	# Right arrow (<<)
	for offset in [0.0, 8.0]:
		var rx := size.x - offset
		draw_polyline(PackedVector2Array([
			Vector2(rx - 2, h * 0.5 - 12),
			Vector2(rx - 12, h * 0.5),
			Vector2(rx - 2, h * 0.5 + 12)
		]), GOLD_DIM, 2.0, true)

func _draw_title(w: float) -> void:
	var font := ThemeDB.fallback_font
	var font_size := 22
	var text_w := font.get_string_size(title_text, HORIZONTAL_ALIGNMENT_CENTER, -1, font_size).x
	var x := (w - text_w) * 0.5
	# Shadow
	draw_string(font, Vector2(x + 2, 50), title_text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, Color(0, 0, 0, 0.7))
	# Gold text
	draw_string(font, Vector2(x, 48), title_text, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, GOLD_BRIGHT)

func _draw_diamond(center: Vector2, half: float, border_color: Color, fill_color: Color) -> void:
	var pts := PackedVector2Array([
		center + Vector2(0, -half),
		center + Vector2(half, 0),
		center + Vector2(0, half),
		center + Vector2(-half, 0)
	])
	draw_colored_polygon(pts, fill_color)
	draw_polyline(pts + PackedVector2Array([pts[0]]), border_color, 1.5, true)
