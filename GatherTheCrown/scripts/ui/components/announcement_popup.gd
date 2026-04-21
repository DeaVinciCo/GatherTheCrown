extends Control
## AnnouncementPopup - Glowing gold celebration banner
## Use for: "Quest Complete", race results (1st/2nd/3rd), mini-game wins, big moments
## Based on Image 4 glowing gold style with sparkle/pop-in feel

class_name AnnouncementPopup

enum AnnouncementType {
	QUEST_COMPLETE,   # Quest Complete
	RACE_RESULT,      # 1st / 2nd / 3rd place
	ACHIEVEMENT,      # Achievement unlocked
	MINI_GAME,        # Mini-game result
	KINGDOM_UNLOCK,   # New Kingdom Unlocked
	BOSS_DEFEATED     # Boss defeated (biggest)
}

@export var headline: String = "" :
	set(val):
		headline = val
		if is_node_ready(): queue_redraw()

@export var subline: String = "" :
	set(val):
		subline = val
		if is_node_ready(): queue_redraw()

@export var announcement_type: AnnouncementType = AnnouncementType.QUEST_COMPLETE
@export var rank: int = 0  # 1/2/3 for race results, 0 = unused

# Colors
const NAVY_BG     := Color(0.03,  0.04,  0.09,  0.97)
const GOLD_BRIGHT := Color(0.98,  0.82,  0.28,  1.0)
const GOLD_MID    := Color(0.88,  0.68,  0.18,  1.0)
const GOLD_GLOW   := Color(0.96,  0.80,  0.32,  0.45)
const RED_GEM     := Color(0.92,  0.22,  0.22,  1.0)
const RANK_COLORS := [Color(0.98, 0.82, 0.28, 1.0), Color(0.78, 0.78, 0.82, 1.0), Color(0.82, 0.48, 0.22, 1.0)]

var _anim_t: float = 0.0
var _anim_phase: String = "idle"  # "in", "hold", "out", "idle"
var _hold_duration: float = 3.0
var _scale_anim: float = 0.0
var _glow_pulse: float = 0.0

signal dismissed

func _ready() -> void:
	visible = false
	mouse_filter = MOUSE_FILTER_IGNORE

func _process(delta: float) -> void:
	match _anim_phase:
		"in":
			_anim_t += delta * 3.5
			_scale_anim = _ease_out_back(_anim_t)
			if _anim_t >= 1.0:
				_anim_t = 0.0
				_anim_phase = "hold"
				_scale_anim = 1.0
			queue_redraw()
		"hold":
			_anim_t += delta
			_glow_pulse = (sin(_anim_t * TAU * 0.9) * 0.5 + 0.5)
			if _anim_t >= _hold_duration:
				_anim_t = 0.0
				_anim_phase = "out"
			queue_redraw()
		"out":
			_anim_t += delta * 2.5
			_scale_anim = 1.0 - _ease_in(_anim_t)
			modulate.a = maxf(0.0, 1.0 - _anim_t)
			if _anim_t >= 1.0:
				visible = false
				_anim_phase = "idle"
				dismissed.emit()
			queue_redraw()

func show_announcement(head: String, sub: String = "", type: AnnouncementType = AnnouncementType.QUEST_COMPLETE, hold: float = 3.5, placement_rank: int = 0) -> void:
	headline = head
	subline = sub
	announcement_type = type
	rank = placement_rank
	_hold_duration = hold
	_anim_t = 0.0
	_scale_anim = 0.0
	_glow_pulse = 0.0
	_anim_phase = "in"
	modulate.a = 1.0
	visible = true
	queue_redraw()

func _draw() -> void:
	if _scale_anim <= 0.01:
		return

	var w := size.x
	var h := size.y
	var cx := w * 0.5
	var cy := h * 0.5

	# Scale from center
	draw_set_transform(Vector2(cx * (1.0 - _scale_anim), cy * (1.0 - _scale_anim)), 0.0, Vector2(_scale_anim, _scale_anim))

	# Background
	draw_rect(Rect2(Vector2.ZERO, Vector2(w, h)), NAVY_BG, true)

	# Outer glow border (pulses in hold phase)
	var glow_a := GOLD_GLOW.a * (0.5 + 0.5 * _glow_pulse)
	var glow_col := Color(GOLD_GLOW.r, GOLD_GLOW.g, GOLD_GLOW.b, glow_a)
	draw_rect(Rect2(-4, -4, w + 8, h + 8), glow_col, false, 6.0)

	# Gold outer border
	draw_rect(Rect2(Vector2.ZERO, Vector2(w, h)), GOLD_BRIGHT, false, 2.5)
	# Inner border
	draw_rect(Rect2(6, 6, w - 12, h - 12), GOLD_MID, false, 1.5)

	# Diamond accent points on border edges
	for pos in [Vector2(cx, 3), Vector2(cx, h - 3), Vector2(3, cy), Vector2(w - 3, cy)]:
		_draw_border_diamond(pos, 6.0)

	# Red gem accents at sides (Image 4 style)
	_draw_red_gem(Vector2(18, cy), 7.0)
	_draw_red_gem(Vector2(w - 18, cy), 7.0)

	# Rank indicator (if race result)
	if announcement_type == AnnouncementType.RACE_RESULT and rank >= 1 and rank <= 3:
		_draw_rank_badge(Vector2(cx, 22), rank)

	# Headline text
	if headline != "":
		var font := ThemeDB.fallback_font
		var fsize := _headline_font_size()
		var text_y := cy - (8.0 if subline != "" else 0.0)
		# Subtle glow behind text
		draw_string(font, Vector2(cx - _text_half_width(headline, fsize) + 2, text_y + 2),
			headline, HORIZONTAL_ALIGNMENT_LEFT, -1, fsize, Color(0, 0, 0, 0.6))
		draw_string(font, Vector2(cx - _text_half_width(headline, fsize), text_y),
			headline, HORIZONTAL_ALIGNMENT_LEFT, -1, fsize, GOLD_BRIGHT)

	# Subline text
	if subline != "":
		var font := ThemeDB.fallback_font
		draw_string(font, Vector2(cx - _text_half_width(subline, 14), cy + 14),
			subline, HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color(0.90, 0.90, 0.94, 0.90))

	# Type tag
	var tag := _type_tag()
	if tag != "":
		var font := ThemeDB.fallback_font
		draw_string(font, Vector2(16, 18), tag,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(GOLD_MID.r, GOLD_MID.g, GOLD_MID.b, 0.78))

	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

func _draw_border_diamond(center: Vector2, half: float) -> void:
	var pts := PackedVector2Array([
		center + Vector2(0, -half),
		center + Vector2(half * 0.6, 0),
		center + Vector2(0, half),
		center + Vector2(-half * 0.6, 0)
	])
	draw_colored_polygon(pts, GOLD_BRIGHT)

func _draw_red_gem(center: Vector2, half: float) -> void:
	var pts := PackedVector2Array([
		center + Vector2(0, -half),
		center + Vector2(half, 0),
		center + Vector2(0, half),
		center + Vector2(-half, 0)
	])
	draw_colored_polygon(pts, RED_GEM)
	draw_polyline(pts + PackedVector2Array([pts[0]]), GOLD_BRIGHT, 1.5, true)

func _draw_rank_badge(center: Vector2, rank_num: int) -> void:
	var rank_color := RANK_COLORS[rank_num - 1]
	var rank_text := [" 1ST ", " 2ND ", " 3RD "][rank_num - 1]
	var font := ThemeDB.fallback_font
	var tw := font.get_string_size(rank_text, HORIZONTAL_ALIGNMENT_CENTER, -1, 16).x
	draw_rect(Rect2(center.x - tw * 0.5 - 8, center.y - 12, tw + 16, 22), NAVY_BG, true)
	draw_rect(Rect2(center.x - tw * 0.5 - 8, center.y - 12, tw + 16, 22), rank_color, false, 2.0)
	draw_string(font, Vector2(center.x - tw * 0.5, center.y + 5), rank_text,
		HORIZONTAL_ALIGNMENT_LEFT, -1, 16, rank_color)

func _headline_font_size() -> int:
	match announcement_type:
		AnnouncementType.BOSS_DEFEATED:    return 26
		AnnouncementType.KINGDOM_UNLOCK:   return 24
		AnnouncementType.QUEST_COMPLETE:   return 22
		AnnouncementType.RACE_RESULT:      return 20
		_:                                 return 18

func _type_tag() -> String:
	match announcement_type:
		AnnouncementType.QUEST_COMPLETE:  return "QUEST COMPLETE"
		AnnouncementType.RACE_RESULT:     return "RACE RESULT"
		AnnouncementType.ACHIEVEMENT:     return "ACHIEVEMENT UNLOCKED"
		AnnouncementType.MINI_GAME:       return "MINI-GAME"
		AnnouncementType.KINGDOM_UNLOCK:  return "NEW KINGDOM"
		AnnouncementType.BOSS_DEFEATED:   return "BOSS DEFEATED"
	return ""

func _text_half_width(text: String, fsize: int) -> float:
	return ThemeDB.fallback_font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, fsize).x * 0.5

func _ease_out_back(t: float) -> float:
	var c1 := 1.70158
	var c3 := c1 + 1.0
	return 1.0 + c3 * pow(t - 1.0, 3.0) + c1 * pow(t - 1.0, 2.0)

func _ease_in(t: float) -> float:
	return t * t


## Static helper: show announcement on any node in the current scene
static func show_on(parent: Node, head: String, sub: String = "",
		type: AnnouncementType = AnnouncementType.QUEST_COMPLETE,
		hold: float = 3.5, placement_rank: int = 0) -> AnnouncementPopup:
	var popup := AnnouncementPopup.new()
	popup.size = Vector2(520, 90)
	popup.position = Vector2(
		(parent.get_viewport().get_visible_rect().size.x - 520) * 0.5,
		80
	)
	var layer := CanvasLayer.new()
	layer.layer = 50
	parent.add_child(layer)
	layer.add_child(popup)
	popup.show_announcement(head, sub, type, hold, placement_rank)
	# Auto-clean layer when done
	popup.dismissed.connect(layer.queue_free)
	return popup
