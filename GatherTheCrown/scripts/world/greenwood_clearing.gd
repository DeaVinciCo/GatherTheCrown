extends Node2D
## Greenwood Clearing - Home base zone
## Includes crown forge station, feed interaction, exit to WoodedTrail

var _player: Node2D
@onready var _exit_marker: Marker2D = $ExitMarker

func _ready() -> void:
	print("Greenwood Clearing loaded")
	GameState.current_zone = "GreenwoodClearing"
	EventBus.zone_changed.emit("GreenwoodClearing")
	_player = _resolve_player()
	
	# Spawn creat only if lifecycle confirms it is active and not already present
	if CompanionLifecycle.current_state == CompanionLifecycle.LifecycleState.CREAT_ACTIVE and not has_node("FireCreat"):
		var creat_path = CompanionLifecycle.get_creat_scene_path(CompanionLifecycle.egg_type)
		var creat_scene = load(creat_path)
		if creat_scene:
			var creat = creat_scene.instantiate()
			add_child(creat)
			if _player:
				creat.global_position = _player.global_position + Vector2(50, 0)
				print("Creat re-spawned in home base")
			else:
				push_warning("[GreenwoodClearing] Creat spawned but player was not found yet.")

func _process(_delta: float) -> void:
	# Handle zone exit interaction
	if Input.is_action_just_pressed("interact"):
		_player = _resolve_player()
		if _player == null:
			push_warning("[GreenwoodClearing] Interact ignored: player not found.")
			return
		if _player.global_position.distance_to(_exit_marker.global_position) < 50:
			print("Exiting to WoodedTrail...")
			SceneRouter.go_to_zone("res://scenes/world/WoodedTrail.tscn")

func _resolve_player() -> Node2D:
	var direct_player: Node2D = get_node_or_null("Player") as Node2D
	if direct_player:
		return direct_player
	var group_players: Array = get_tree().get_nodes_in_group("player")
	if group_players.size() > 0:
		return group_players[0] as Node2D
	return null
