extends Control

const HudStateMapper = preload("res://scripts/ui/hud_state_mapper.gd")

var player: Node
var companion: Node
var map_screen: Node
var _state_mapper := HudStateMapper.new()

@onready var hero_health_widget: Control = $StatWidgets/HeroHealthWidget
@onready var mana_potion_widget: Control = $StatWidgets/ManaPotionWidget
@onready var creat_status_widget: Control = $StatWidgets/CreatStatusWidget
@onready var attack_widget: Control = $StatWidgets/AttackCooldownWidget

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
	_bind_buttons()
	chat_drawer.visible = false
	print("[HUD] Gem-square modular HUD initialized")

func _process(_delta: float) -> void:
	var state: Dictionary = _state_mapper.build_state(player, companion)
	hero_health_widget.call("set_state", state.get("hero_health", {}))
	mana_potion_widget.call("set_state", state.get("mana_potions", {}))
	creat_status_widget.call("set_state", state.get("creat_status", {}))
	attack_widget.call("set_state", state.get("attacks", {}))

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



