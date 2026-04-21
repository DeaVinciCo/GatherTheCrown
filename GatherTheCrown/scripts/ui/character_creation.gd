extends Control
## CharacterCreation - "FORGE A HERO" screen
## Full royal navy/gold art-deco UI — no preset heroes, player builds their own
## Three banner paths: Red (Strength), Blue (Magic), Gold (Balance/Divine)
## Layout: title | banner path select | left panel (identity) | right panel (abilities) | name + confirm

const ELEMENTS := ["Fire", "Water", "Earth", "Storm", "Light", "Shadow"]
const RACES := ["Human", "Hybrid"]
const LOOKS := ["Trailblazer", "Warden", "Skyrunner", "Runeborn"]
const CLOTHES := ["Ranger Wrap", "Forgeguard Coat", "Tideweave Vest", "Stormmantle Cloak"]
const STARTER_WEAPONS := ["Bronze Saber", "Scout Bow", "Twin Hatchets", "Runic Spear"]

# Banner paths — your three banner system (Red/Blue/Gold)
const BANNER_PATHS := [
	{"label": "STRENGTH",  "color": Color(0.78, 0.12, 0.12, 1.0), "desc": "Raw power. Melee focus.\nHigh HP & attack. Earns GC fast.",
	 "element": "Fire",    "weapon": "Bronze Saber",   "look": "Warden",       "clothes": "Forgeguard Coat"},
	{"label": "MAGIC",     "color": Color(0.18, 0.36, 0.84, 1.0), "desc": "Elemental mastery. Spell focus.\nHigh mana & creat bond.",
	 "element": "Water",   "weapon": "Runic Spear",    "look": "Runeborn",     "clothes": "Tideweave Vest"},
	{"label": "BALANCE",   "color": Color(0.88, 0.70, 0.15, 1.0), "desc": "Divine harmony. Versatile.\nGrows with creat. Unlocks all paths.",
	 "element": "Light",   "weapon": "Scout Bow",      "look": "Trailblazer",  "clothes": "Stormmantle Cloak"}
]

# Color constants (royal palette)
const NAVY       := Color(0.05,  0.07,  0.13,  1.0)
const NAVY_MID   := Color(0.07,  0.10,  0.18,  1.0)
const GOLD       := Color(0.92,  0.74,  0.24,  1.0)
const GOLD_DIM   := Color(0.62,  0.49,  0.18,  1.0)
const GOLD_GLOW  := Color(0.96,  0.80,  0.32,  0.30)
const WHITE_TEXT := Color(0.92,  0.93,  0.96,  1.0)

# State
var _selected_banner: int = 2  # Default: Gold (Balance)
var _hero_name: String = ""
var _custom_element: String = "Fire"
var _custom_weapon: String = "Bronze Saber"
var _custom_look: String = "Trailblazer"
var _custom_race: String = "Human"
var _status_text: String = ""
var _status_error: bool = false
var _gem_pulse: float = 0.0
var _name_input_node: LineEdit

func _ready() -> void:
	_build_ui()
	if GameState.has_hero_profile():
		_load_existing_profile()

func _process(delta: float) -> void:
	_gem_pulse = fmod(_gem_pulse + delta, TAU)
	queue_redraw()

func _build_ui() -> void:
	# Full dark background
	var bg := ColorRect.new()
	bg.name = "Backdrop"
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.color = NAVY
	add_child(bg)

	var layer := CanvasLayer.new()
	layer.layer = 2
	add_child(layer)

	# ---- TITLE ----
	var title := Label.new()
	title.text = "FORGE A HERO"
	title.position = Vector2(0, 36)
	title.size = Vector2(1280, 50)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 36)
	title.add_theme_color_override("font_color", GOLD)
	layer.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "Gather The Crown: Creats & Foes"
	subtitle.position = Vector2(0, 78)
	subtitle.size = Vector2(1280, 28)
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 16)
	subtitle.add_theme_color_override("font_color", GOLD_DIM)
	layer.add_child(subtitle)

	# ---- BANNER PATH SELECTOR ----
	var banner_label := Label.new()
	banner_label.text = "CHOOSE YOUR PATH"
	banner_label.position = Vector2(0, 114)
	banner_label.size = Vector2(1280, 24)
	banner_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	banner_label.add_theme_font_size_override("font_size", 12)
	banner_label.add_theme_color_override("font_color", GOLD_DIM)
	layer.add_child(banner_label)

	for i in BANNER_PATHS.size():
		var bdata := BANNER_PATHS[i]
		var bx := 264.0 + i * 256.0
		_build_banner_button(layer, i, bx, 140.0, bdata)

	# ---- LEFT PANEL: Identity ----
	_build_section_panel(layer, "IDENTITY", 280, 360, 300, 260)
	_build_option_row(layer, "Race",    RACES,           284, 380, func(v): _custom_race = v)
	_build_option_row(layer, "Look",    LOOKS,           284, 432, func(v): _custom_look = v)
	_build_option_row(layer, "Element", ELEMENTS,        284, 484, func(v): _custom_element = v)

	# ---- RIGHT PANEL: Abilities ----
	_build_section_panel(layer, "STARTING ABILITIES", 700, 360, 300, 260)
	_build_option_row(layer, "Weapon",  STARTER_WEAPONS, 704, 380, func(v): _custom_weapon = v)
	_build_option_row(layer, "Clothes", CLOTHES,         704, 432, func(v): _custom_look = v)

	# ---- NAME INPUT ----
	var name_lbl := Label.new()
	name_lbl.text = "HERO NAME"
	name_lbl.position = Vector2(390, 376)
	name_lbl.add_theme_font_size_override("font_size", 11)
	name_lbl.add_theme_color_override("font_color", GOLD_DIM)
	layer.add_child(name_lbl)

	_name_input_node = LineEdit.new()
	_name_input_node.placeholder_text = "Enter your hero's name..."
	_name_input_node.position = Vector2(390, 396)
	_name_input_node.size = Vector2(280, 40)
	_name_input_node.max_length = 24
	_name_input_node.add_theme_color_override("font_color", WHITE_TEXT)
	_name_input_node.text_changed.connect(func(t): _hero_name = t.strip_edges())
	layer.add_child(_name_input_node)

	# ---- CONFIRM BUTTON ----
	var confirm_btn := Button.new()
	confirm_btn.text = "FORGE YOUR HERO"
	confirm_btn.position = Vector2(390, 452)
	confirm_btn.size = Vector2(280, 48)
	confirm_btn.add_theme_color_override("font_color", NAVY)
	confirm_btn.pressed.connect(_on_forge_pressed)
	layer.add_child(confirm_btn)

	# Skip button (smaller, dimmer)
	var skip_btn := Button.new()
	skip_btn.text = "Continue with existing hero"
	skip_btn.position = Vector2(390, 512)
	skip_btn.size = Vector2(280, 30)
	skip_btn.add_theme_font_size_override("font_size", 12)
	skip_btn.pressed.connect(_on_skip_pressed)
	layer.add_child(skip_btn)

	# Status label
	var status_node := Label.new()
	status_node.name = "StatusLabel"
	status_node.position = Vector2(280, 560)
	status_node.size = Vector2(720, 30)
	status_node.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status_node.add_theme_font_size_override("font_size", 13)
	layer.add_child(status_node)

func _build_banner_button(parent: Node, index: int, x: float, y: float, bdata: Dictionary) -> void:
	var btn := Button.new()
	btn.position = Vector2(x, y)
	btn.size = Vector2(220, 170)
	btn.flat = true
	btn.pressed.connect(_select_banner.bind(index))
	btn.name = "BannerBtn_%d" % index
	parent.add_child(btn)

	var lbl := Label.new()
	lbl.text = String(bdata.label)
	lbl.position = Vector2(0, 12)
	lbl.size = Vector2(220, 24)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.add_theme_font_size_override("font_size", 15)
	lbl.add_theme_color_override("font_color", bdata.color as Color)
	btn.add_child(lbl)

	var desc_lbl := Label.new()
	desc_lbl.text = String(bdata.desc)
	desc_lbl.position = Vector2(8, 44)
	desc_lbl.size = Vector2(204, 80)
	desc_lbl.add_theme_font_size_override("font_size", 11)
	desc_lbl.add_theme_color_override("font_color", WHITE_TEXT)
	desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	btn.add_child(desc_lbl)

func _build_section_panel(parent: Node, label_text: String, x: int, y: int, w: int, h: int) -> void:
	var panel := Panel.new()
	panel.position = Vector2(x, y)
	panel.size = Vector2(w, h)
	parent.add_child(panel)

	var lbl := Label.new()
	lbl.text = label_text
	lbl.position = Vector2(8, 4)
	lbl.add_theme_font_size_override("font_size", 11)
	lbl.add_theme_color_override("font_color", GOLD_DIM)
	panel.add_child(lbl)

func _build_option_row(parent: Node, label_text: String, options: Array, x: int, y: int, on_change: Callable) -> void:
	var lbl := Label.new()
	lbl.text = label_text
	lbl.position = Vector2(x, y)
	lbl.size = Vector2(80, 20)
	lbl.add_theme_font_size_override("font_size", 11)
	lbl.add_theme_color_override("font_color", GOLD_DIM)
	parent.add_child(lbl)

	var opt := OptionButton.new()
	opt.position = Vector2(x + 84, y - 2)
	opt.size = Vector2(200, 26)
	for o in options:
		opt.add_item(String(o))
	opt.item_selected.connect(func(idx): on_change.call(opt.get_item_text(idx)))
	parent.add_child(opt)

func _select_banner(index: int) -> void:
	_selected_banner = index
	var bdata := BANNER_PATHS[index]
	_custom_element = bdata.element
	_custom_weapon = bdata.weapon
	_custom_look = bdata.look
	queue_redraw()

func _draw() -> void:
	# Draw divider rails and center gem over the UI
	var w := size.x
	var gem_pulse_a := 0.3 + 0.2 * sin(_gem_pulse)

	# Top gold rail
	draw_line(Vector2(100, 110), Vector2(w - 100, 110), Color(GOLD.r, GOLD.g, GOLD.b, 0.4), 1.5)
	draw_line(Vector2(100, 116), Vector2(w - 100, 116), Color(GOLD.r, GOLD.g, GOLD.b, 0.2), 1.0)

	# Banner highlight for selected
	var bx := 264.0 + _selected_banner * 256.0
	var banner_color := BANNER_PATHS[_selected_banner].color as Color
	draw_rect(Rect2(bx - 2, 138, 224, 174), Color(banner_color.r, banner_color.g, banner_color.b, 0.18), true)
	draw_rect(Rect2(bx - 2, 138, 224, 174), Color(banner_color.r, banner_color.g, banner_color.b, 0.7), false, 2.5)

	# Mid horizontal divider
	draw_line(Vector2(280, 356), Vector2(w - 280, 356), Color(GOLD.r, GOLD.g, GOLD.b, 0.35), 1.0)

	# Center gem (heartbeat)
	var gem_pos := Vector2(w * 0.5, 134)
	draw_circle(gem_pos, 14.0 + 2.0 * sin(_gem_pulse), Color(GOLD_GLOW.r, GOLD_GLOW.g, GOLD_GLOW.b, gem_pulse_a))
	var gem_pts := PackedVector2Array([
		gem_pos + Vector2(0, -11), gem_pos + Vector2(11, 0),
		gem_pos + Vector2(0, 11),  gem_pos + Vector2(-11, 0)
	])
	draw_colored_polygon(gem_pts, banner_color)
	draw_polyline(gem_pts + PackedVector2Array([gem_pts[0]]), GOLD, 2.0, true)

	# Status text
	var status_color := Color(0.98, 0.35, 0.35, 1.0) if _status_error else Color(GOLD.r, GOLD.g, GOLD.b, 0.9)
	if _status_text != "":
		var font := ThemeDB.fallback_font
		var sw := font.get_string_size(_status_text, HORIZONTAL_ALIGNMENT_CENTER, -1, 13).x
		draw_string(font, Vector2((w - sw) * 0.5, 572), _status_text,
			HORIZONTAL_ALIGNMENT_LEFT, -1, 13, status_color)

func _set_status(text: String, error: bool = false) -> void:
	_status_text = text
	_status_error = error
	queue_redraw()

func _on_forge_pressed() -> void:
	if GameState.has_hero_profile() and not GameState.story_completed_once:
		_set_status("Complete Story Mode first to create another hero.", true)
		return
	if GameState.has_hero_profile() and not GameState.can_create_character(GameState.get_character_count()):
		_set_status("Character slots are locked or full.", true)
		return

	var name_val := _hero_name.strip_edges()
	if _name_input_node:
		name_val = _name_input_node.text.strip_edges()

	if name_val.length() < 2:
		_set_status("Name must be at least 2 characters.", true)
		return

	var bdata := BANNER_PATHS[_selected_banner]
	var profile := {
		"name": name_val,
		"element": _custom_element if _custom_element != "" else bdata.element,
		"race": _custom_race,
		"look": _custom_look if _custom_look != "" else bdata.look,
		"clothes": bdata.clothes,
		"starter_weapon": _custom_weapon if _custom_weapon != "" else bdata.weapon,
		"banner_path": bdata.label
	}

	GameState.set_hero_profile(profile)
	GameState.equipped_items.clear()
	GameState.equipped_items[String(profile["starter_weapon"])] = 1
	SaveManager.save_game()

	_set_status("Hero forged. Entering the trials...", false)
	await get_tree().create_timer(0.35).timeout
	SceneRouter.go_to_zone("res://scenes/world/ForestTrialsEntrance.tscn")

func _on_skip_pressed() -> void:
	if not GameState.has_hero_profile():
		_set_status("Forge a hero first before continuing.", true)
		return
	SaveManager.save_game()
	SceneRouter.go_to_zone("res://scenes/world/GreenwoodClearing.tscn")

func _load_existing_profile() -> void:
	var profile := GameState.hero_profile
	if _name_input_node:
		_name_input_node.text = String(profile.get("name", ""))
	_custom_element = String(profile.get("element", "Fire"))
	_custom_race = String(profile.get("race", "Human"))
	_custom_look = String(profile.get("look", "Trailblazer"))
	_custom_weapon = String(profile.get("starter_weapon", "Bronze Saber"))
	var banner_path := String(profile.get("banner_path", "BALANCE"))
	for i in BANNER_PATHS.size():
		if BANNER_PATHS[i].label == banner_path:
			_selected_banner = i
			break
	var msg := "Story complete — up to 3 heroes allowed." if GameState.story_completed_once else "Existing hero loaded. Forge a new one or continue."
	_set_status(msg, false)
