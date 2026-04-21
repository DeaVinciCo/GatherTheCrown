extends Control

const HudStateMapper = preload("res://scripts/ui/hud_state_mapper.gd")
const ICON_KEYS: Texture2D = preload("res://assets/ui/icons/keys.svg")
const ICON_CREAT: Texture2D = preload("res://assets/ui/icons/creat.svg")
const ICON_POTION: Texture2D = preload("res://assets/ui/icons/potion.svg")
const ICON_OTHER: Texture2D = preload("res://assets/ui/icons/other.svg")
const ICON_CHARACTER: Texture2D = preload("res://assets/ui/icons/character.svg")
const ICON_OPTIONS: Texture2D = preload("res://assets/ui/icons/options.svg")
const ICON_INVENTORY: Texture2D = preload("res://assets/ui/icons/inventory.svg")

var player: Node
var companion: Node
var map_screen: Node
var _state_mapper := HudStateMapper.new()
var _pulse_time: float = 0.0

@onready var hero_health_widget: Control = $StatWidgets/HeroHealthWidget
@onready var mana_potion_widget: Control = $StatWidgets/ManaPotionWidget
@onready var creat_status_widget: Control = $StatWidgets/CreatStatusWidget
@onready var attack_widget: Control = $StatWidgets/AttackCooldownWidget
@onready var gem_square_frame: Panel = $FrameLayer/GemSquareFrame
@onready var top_rail: ColorRect = $FrameLayer/TopRail
@onready var bottom_rail: ColorRect = $FrameLayer/BottomRail

@onready var rider_button: Button = $UtilityLayer/RiderGemButton
@onready var creat_button: Button = $UtilityLayer/CreatGemButton
@onready var potion_button: Button = $UtilityLayer/InventoryGemButton
@onready var other_button: Button = $UtilityLayer/OtherGemButton
@onready var char_button: Button = $UtilityLayer/MapGemButton
@onready var options_button: Button = $UtilityLayer/OptionsGemButton
@onready var inventory_menu_button: Button = $UtilityLayer/InventoryMenuButton

@onready var chat_drawer: Panel = $UtilityLayer/ChatDrawer

func _ready() -> void:
	_find_actor_nodes()
	_apply_visual_style()
	_apply_button_icons()
	_bind_buttons()
	_play_intro_animation()
	chat_drawer.visible = false
	print("[HUD] Gem-square modular HUD initialized")

func _process(delta: float) -> void:
	_pulse_time += delta
	var state: Dictionary = _state_mapper.build_state(player, companion)
	hero_health_widget.call("set_state", state.get("hero_health", {}))
	mana_potion_widget.call("set_state", state.get("mana_potions", {}))
	creat_status_widget.call("set_state", state.get("creat_status", {}))
	attack_widget.call("set_state", state.get("attacks", {}))
	_animate_hud()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_SHIFT:
			toggle_chat_drawer()

func _find_actor_nodes() -> void:
	var scene: Node = get_tree().root.get_child(get_tree().root.get_child_count() - 1)
	player = scene.get_node_or_null("Player")
	companion = scene.get_node_or_null("FireCreat")

func _bind_buttons() -> void:
	rider_button.pressed.connect(_on_rider_pressed)
	creat_button.pressed.connect(_on_creat_pressed)
	potion_button.pressed.connect(_on_potion_pressed)
	other_button.pressed.connect(_on_other_pressed)
	char_button.pressed.connect(_on_char_pressed)
	options_button.pressed.connect(_on_options_pressed)
	inventory_menu_button.pressed.connect(_on_inventory_menu_pressed)

func _apply_button_icons() -> void:
	rider_button.icon = ICON_KEYS
	creat_button.icon = ICON_CREAT
	potion_button.icon = ICON_POTION
	other_button.icon = ICON_OTHER
	char_button.icon = ICON_CHARACTER
	options_button.icon = ICON_OPTIONS
	inventory_menu_button.icon = ICON_INVENTORY

	for button in [rider_button, creat_button, potion_button, other_button, char_button, options_button, inventory_menu_button]:
		button.expand_icon = true
		button.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
		button.text = ""

func _apply_visual_style() -> void:
	var frame_style := StyleBoxFlat.new()
	frame_style.bg_color = Color(0.05, 0.08, 0.11, 0.90)
	frame_style.border_color = Color(0.38, 0.76, 0.90, 0.92)
	frame_style.border_width_left = 4
	frame_style.border_width_top = 4
	frame_style.border_width_right = 4
	frame_style.border_width_bottom = 4
	frame_style.corner_radius_top_left = 26
	frame_style.corner_radius_top_right = 26
	frame_style.corner_radius_bottom_right = 26
	frame_style.corner_radius_bottom_left = 26
	frame_style.shadow_color = Color(0.0, 0.0, 0.0, 0.35)
	frame_style.shadow_size = 7
	gem_square_frame.add_theme_stylebox_override("panel", frame_style)

	top_rail.color = Color(0.30, 0.76, 0.95, 0.90)
	bottom_rail.color = Color(0.30, 0.76, 0.95, 0.90)

	var button_style := _make_button_style(Color(0.10, 0.16, 0.22, 0.95), Color(0.16, 0.25, 0.33, 0.98), Color(0.08, 0.13, 0.19, 1.0), Color(0.50, 0.83, 0.95, 0.95))
	for button in [rider_button, creat_button, potion_button, other_button, char_button, options_button, inventory_menu_button]:
		button.custom_minimum_size = Vector2(40.0, 40.0)
		button.add_theme_stylebox_override("normal", button_style.normal)
		button.add_theme_stylebox_override("hover", button_style.hover)
		button.add_theme_stylebox_override("pressed", button_style.pressed)
		button.add_theme_stylebox_override("focus", button_style.hover)

	var chat_style := StyleBoxFlat.new()
	chat_style.bg_color = Color(0.06, 0.11, 0.16, 0.96)
	chat_style.border_color = Color(0.40, 0.74, 0.92, 0.95)
	chat_style.border_width_left = 2
	chat_style.border_width_top = 2
	chat_style.border_width_right = 2
	chat_style.border_width_bottom = 2
	chat_style.corner_radius_top_left = 12
	chat_style.corner_radius_top_right = 12
	chat_style.corner_radius_bottom_right = 12
	chat_style.corner_radius_bottom_left = 12
	chat_drawer.add_theme_stylebox_override("panel", chat_style)

func _make_button_style(normal_color: Color, hover_color: Color, pressed_color: Color, border_color: Color) -> Dictionary:
	var normal := StyleBoxFlat.new()
	normal.bg_color = normal_color
	normal.border_color = border_color
	normal.border_width_left = 2
	normal.border_width_top = 2
	normal.border_width_right = 2
	normal.border_width_bottom = 2
	normal.corner_radius_top_left = 10
	normal.corner_radius_top_right = 10
	normal.corner_radius_bottom_right = 10
	normal.corner_radius_bottom_left = 10

	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = hover_color

	var pressed := normal.duplicate() as StyleBoxFlat
	pressed.bg_color = pressed_color

	return {
		"normal": normal,
		"hover": hover,
		"pressed": pressed,
	}

func _play_intro_animation() -> void:
	var ordered_nodes: Array[Control] = [
		gem_square_frame,
		hero_health_widget,
		mana_potion_widget,
		creat_status_widget,
		attack_widget,
		rider_button,
		creat_button,
		potion_button,
		other_button,
		char_button,
		options_button,
		inventory_menu_button,
	]

	for i in ordered_nodes.size():
		var node := ordered_nodes[i]
		var start_pos := node.position
		node.modulate.a = 0.0
		node.position = start_pos + Vector2(0.0, 16.0)

		var tween := get_tree().create_tween()
		tween.set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
		tween.tween_property(node, "modulate:a", 1.0, 0.35).set_delay(float(i) * 0.035)
		tween.parallel().tween_property(node, "position", start_pos, 0.42).set_delay(float(i) * 0.035)

func _animate_hud() -> void:
	var pulse := 0.95 + sin(_pulse_time * 2.6) * 0.05
	rider_button.modulate = Color(1.0, 1.0, 1.0, pulse)
	options_button.modulate = Color(1.0, 1.0, 1.0, 0.93 + sin(_pulse_time * 3.3) * 0.07)

	var rail_luma := 0.74 + sin(_pulse_time * 1.8) * 0.12
	top_rail.color = Color(0.30, rail_luma, 0.95, 0.90)
	bottom_rail.color = Color(0.30, rail_luma, 0.95, 0.90)

func toggle_map_screen() -> void:
	if is_instance_valid(map_screen):
		SceneRouter.close_screen(map_screen)
		map_screen = null
		return
	map_screen = SceneRouter.open_screen("res://scenes/ui/MapScreen.tscn")

func toggle_chat_drawer() -> void:
	chat_drawer.visible = not chat_drawer.visible

func _on_rider_pressed() -> void:
	print("[HUD] Rider menu placeholder")

func _on_creat_pressed() -> void:
	print("[HUD] Creat menu placeholder")

func _on_potion_pressed() -> void:
	print("[HUD] Potion quick-use placeholder")

func _on_other_pressed() -> void:
	print("[HUD] Other quick action placeholder")

func _on_char_pressed() -> void:
	print("[HUD] Character menu placeholder")

func _on_map_pressed() -> void:
	toggle_map_screen()

func _on_options_pressed() -> void:
	toggle_chat_drawer()
	print("[HUD] Options/chat drawer placeholder")

func _on_inventory_menu_pressed() -> void:
	var scene: Node = get_tree().current_scene
	if scene and scene.has_method("_toggle_inventory_panel"):
		scene.call("_toggle_inventory_panel")
		return
	print("[HUD] Inventory menu placeholder (no world inventory panel in this scene)")



