extends Node
## Handles scene transitions and navigation

const ENABLE_LOGS: bool = false

var current_scene: Node = null
var ui_layers: Dictionary = {}  # screen_name -> node

func _ready() -> void:
	current_scene = get_tree().current_scene
	if ENABLE_LOGS and current_scene:
		print("SceneRouter initialized with scene: ", current_scene.name)

func go_to_zone(zone_scene_path: String, _transition_name: String = "fade") -> void:
	if zone_scene_path.strip_edges() == "":
		push_error("[SceneRouter] Empty scene path passed to go_to_zone")
		return
	if not ResourceLoader.exists(zone_scene_path):
		push_error("[SceneRouter] Scene does not exist: %s" % zone_scene_path)
		return

	var err := get_tree().change_scene_to_file(zone_scene_path)
	if err != OK:
		push_error("[SceneRouter] change_scene_to_file failed for %s (error: %s)" % [zone_scene_path, error_string(err)])
		return
	EventBus.zone_changed.emit(zone_scene_path)
	call_deferred("_report_current_scene", zone_scene_path)

func _report_current_scene(expected_path: String) -> void:
	if not ENABLE_LOGS:
		return
	await get_tree().process_frame
	current_scene = get_tree().current_scene
	if current_scene:
		print("[SceneRouter] Expected path: ", expected_path)
		print("[SceneRouter] Loaded root scene name: ", current_scene.name)
		print("[SceneRouter] Loaded root scene path: ", current_scene.scene_file_path)
	else:
		print("[SceneRouter] No current scene after load for expected path: ", expected_path)

func open_screen(ui_scene_path: String) -> Node:
	var packed_scene := ResourceLoader.load(ui_scene_path) as PackedScene
	if packed_scene == null:
		push_error("[SceneRouter] Failed to load UI scene: %s" % ui_scene_path)
		return null
	var screen := packed_scene.instantiate()
	get_tree().root.add_child(screen)
	EventBus.screen_opened.emit(ui_scene_path)
	return screen

func close_screen(screen_node: Node) -> void:
	if screen_node == null or not is_instance_valid(screen_node):
		return
	EventBus.screen_closed.emit(screen_node.name)
	screen_node.queue_free()

func get_current_scene() -> Node:
	return current_scene
