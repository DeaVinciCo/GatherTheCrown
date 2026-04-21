extends Node
## Handles scene transitions and navigation

var current_scene: Node
var ui_layers: Dictionary = {}  # screen_name -> node

func _ready() -> void:
	current_scene = get_tree().current_scene
	print("SceneRouter initialized with scene: ", current_scene.name)

func go_to_zone(zone_scene_path: String, _transition_name: String = "fade") -> void:
	print("[SceneRouter] Transitioning to zone path: ", zone_scene_path)
	EventBus.zone_changed.emit(zone_scene_path)
	var err := get_tree().change_scene_to_file(zone_scene_path)
	print("[SceneRouter] change_scene_to_file result: ", err)
	call_deferred("_report_current_scene", zone_scene_path)

func _report_current_scene(expected_path: String) -> void:
	await get_tree().process_frame
	current_scene = get_tree().current_scene
	if current_scene:
		print("[SceneRouter] Expected path: ", expected_path)
		print("[SceneRouter] Loaded root scene name: ", current_scene.name)
		print("[SceneRouter] Loaded root scene path: ", current_scene.scene_file_path)
	else:
		print("[SceneRouter] No current scene after load for expected path: ", expected_path)

func open_screen(ui_scene_path: String) -> Node:
	print("Opening screen: ", ui_scene_path)
	var screen = load(ui_scene_path).instantiate()
	get_tree().root.add_child(screen)
	EventBus.screen_opened.emit(ui_scene_path)
	return screen

func close_screen(screen_node: Node) -> void:
	print("Closing screen: ", screen_node.name)
	EventBus.screen_closed.emit(screen_node.name)
	screen_node.queue_free()

func get_current_scene() -> Node:
	return current_scene
