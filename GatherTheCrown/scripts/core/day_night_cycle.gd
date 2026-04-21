extends Node
## DayNightCycle  30-minute day / 30-minute night global cycle.
## Adds its own CanvasLayer overlay so every scene is tinted automatically.
## Read `is_day`, `phase_name`, `get_time_label()`, `get_cycle_percent()`.

const DAY_DURATION   := 1800.0   # 30 real minutes
const NIGHT_DURATION := 1800.0   # 30 real minutes
const FULL_CYCLE     := DAY_DURATION + NIGHT_DURATION  # 3600 s

# Transition windows (in seconds within their half-cycle)
const TRANSITION_WINDOW := 300.0  # 5 min dawn/dusk/night-fade

## Current position in the 3600-second cycle (0 = start of day)
## Start at 600 s (past the 300 s dawn window) so the first frame is clear daytime.
var elapsed: float = 600.0

var is_day: bool = true
var phase_name: String = "day"  # "dawn" | "day" | "dusk" | "night"

var _overlay_layer: CanvasLayer
var _overlay_rect: ColorRect
var _prev_phase: String = ""

signal day_started
signal night_started
signal phase_changed(new_phase: String)

func _ready() -> void:
	print("[DayNightCycle] Starting initialization...")
	_build_overlay()
	print("[DayNightCycle] Initialization complete")

func _process(delta: float) -> void:
	elapsed = fmod(elapsed + delta, FULL_CYCLE)
	_update_phase()
	_apply_overlay()

#  Overlay setup 

func _build_overlay() -> void:
	if _overlay_layer != null:
		print("[DayNightCycle] Overlay already built, skipping")
		return
	
	print("[DayNightCycle] Building overlay...")
	_overlay_layer = CanvasLayer.new()
	_overlay_layer.name = "DayNightOverlay"
	_overlay_layer.layer = 90  # Above world, below HUD (HUD uses 128 by default)

	_overlay_rect = ColorRect.new()
	_overlay_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_overlay_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_overlay_rect.color = Color(0, 0, 0, 0)

	_overlay_layer.add_child(_overlay_rect)
	add_child(_overlay_layer)
	print("[DayNightCycle] Overlay built successfully")

#  Phase tracking 

func _update_phase() -> void:
	var prev_day := is_day

	if elapsed < DAY_DURATION:
		is_day = true
		var day_pct := elapsed / DAY_DURATION
		if day_pct < TRANSITION_WINDOW / DAY_DURATION:
			phase_name = "dawn"
		elif day_pct > 1.0 - (TRANSITION_WINDOW / DAY_DURATION):
			phase_name = "dusk"
		else:
			phase_name = "day"
	else:
		is_day = false
		phase_name = "night"

	if is_day != prev_day:
		if is_day:
			day_started.emit()
		else:
			night_started.emit()

	if phase_name != _prev_phase:
		_prev_phase = phase_name
		phase_changed.emit(phase_name)

func _apply_overlay() -> void:
	if not is_instance_valid(_overlay_rect):
		return
	_overlay_rect.color = get_overlay_color()

#  Public helpers 

func get_overlay_color() -> Color:
	## Returns the full-screen tint for the current moment in the cycle.
	## Day = transparent. Dawn/dusk = warm amber. Night = deep navy.
	if elapsed < DAY_DURATION:
		var day_pct := elapsed / DAY_DURATION
		var t_dawn := day_pct / (TRANSITION_WINDOW / DAY_DURATION)
		var t_dusk := (day_pct - (1.0 - TRANSITION_WINDOW / DAY_DURATION)) / (TRANSITION_WINDOW / DAY_DURATION)

		if day_pct < TRANSITION_WINDOW / DAY_DURATION:
			# Dawn: warm sunrise fades to clear
			return Color(0.60, 0.22, 0.02, 0.45 * (1.0 - clampf(t_dawn, 0.0, 1.0)))
		elif day_pct > 1.0 - (TRANSITION_WINDOW / DAY_DURATION):
			# Dusk: clear fades to warm amber
			return Color(0.55, 0.18, 0.02, 0.42 * clampf(t_dusk, 0.0, 1.0))
		else:
			return Color(0, 0, 0, 0)
	else:
		var night_pct := (elapsed - DAY_DURATION) / NIGHT_DURATION
		var night_in  := TRANSITION_WINDOW / NIGHT_DURATION
		var night_out := 1.0 - night_in

		if night_pct < night_in:
			# Evening: amber  deep navy
			var t := clampf(night_pct / night_in, 0.0, 1.0)
			return Color(0.55, 0.18, 0.02, 0.42).lerp(Color(0.01, 0.03, 0.20, 0.74), t)
		elif night_pct > night_out:
			# Pre-dawn: deep navy  amber
			var t := clampf((night_pct - night_out) / night_in, 0.0, 1.0)
			return Color(0.01, 0.03, 0.20, 0.74).lerp(Color(0.60, 0.22, 0.02, 0.45), t)
		else:
			return Color(0.01, 0.03, 0.20, 0.74)

func get_time_label() -> String:
	## E.g. " Day  04:32" or " Night  18:07"
	if is_day:
		var s := int(elapsed)
		return " Day  %02d:%02d" % [int(s / 60.0), s % 60]
	else:
		var s := int(elapsed - DAY_DURATION)
		return " Night  %02d:%02d" % [int(s / 60.0), s % 60]

func get_cycle_percent() -> float:
	## 0.0 = start of day, 0.5 = start of night, 1.0 = end of full cycle.
	return elapsed / FULL_CYCLE
