extends Node
## MapManager - Core map system controller
## Manages zone data, layer visibility, player selections, discovery state

var zones_discovered: Dictionary = {}  # zone_id -> bool
var zones_mastered: Dictionary = {}    # zone_id -> bool
var current_selected_zone: String = ""
var current_destination_zone: String = ""
var current_travel_purpose: String = "pve"
var waypoints: Array[Vector2] = []
var current_zoom_level: int = 1  # 0=World, 1=Region (default), 2=Local

var zone_data: Dictionary = {}  # Loaded from JSON
var layer_controller: Node
var interaction_handler: Node
var zone_data_manager: Node

var zone_scene_lookup: Dictionary = {
	"greenwood_clearing": "res://scenes/world/GreenwoodClearing.tscn",
	"wooded_trail": "res://scenes/world/WoodedTrail.tscn",
	"restoration_site_01": "res://scenes/world/RestorationSite_01.tscn",
	"forest_trials_entrance": "res://scenes/world/ForestTrialsEntrance.tscn",
	"forest_trials_sproutbound": "res://scenes/world/ForestTrials_Sproutbound.tscn",
	"forest_trials_emberroot": "res://scenes/world/ForestTrials_Emberroot.tscn",
	"forest_trials_crownfire": "res://scenes/world/ForestTrials_Crownfire.tscn",
	"crownride_circuit": "res://scenes/world/CrownrideCircuit.tscn",
	"clashborn_arena": "res://scenes/world/ClashbornArena.tscn",
	"crown_trials": "res://scenes/world/CrownTrials.tscn"
}

signal zone_selected(zone_id: String)
signal waypoint_added(position: Vector2)
signal waypoint_removed(position: Vector2)
signal discovery_changed(zone_id: String, discovered: bool)
signal zoom_changed(level: int)
signal destination_set(zone_id: String, purpose: String)
signal route_planned(from_zone: String, to_zone: String, route: Array)
signal travel_started(from_zone: String, to_zone: String, purpose: String)
signal travel_completed(zone_id: String)

func _ready() -> void:
	# Initialize sub-systems
	layer_controller = get_node_or_null("LayerController")
	interaction_handler = get_node_or_null("InteractionHandler")
	zone_data_manager = get_node_or_null("ZoneDataManager")
	
	if zone_data_manager:
		zone_data = zone_data_manager.load_zone_data("res://data/zones.json")
		_rebuild_scene_lookup_from_zone_data()
	
	# Load saved discovery state from GameState
	load_discovery_state_from_game()
	
	# Update visuals
	update_layer_visibility()
	print("MapManager initialized")

func _process(_delta: float) -> void:
	# Handle zoom input
	if Input.is_action_just_pressed("ui_minus"):
		set_zoom_level(clampi(current_zoom_level - 1, 0, 2))
	if Input.is_action_just_pressed("ui_plus"):
		set_zoom_level(clampi(current_zoom_level + 1, 0, 2))

func set_zoom_level(level: int) -> void:
	if current_zoom_level != level:
		current_zoom_level = level
		zoom_changed.emit(level)
		update_layer_visibility()
		print("Zoom level changed to: ", level)

func discover_zone(zone_id: String) -> void:
	if not zones_discovered.get(zone_id, false):
		zones_discovered[zone_id] = true
		discovery_changed.emit(zone_id, true)
		GameState.discovered_zones[zone_id] = true
		update_zone_visuals(zone_id)
		print("Zone discovered: ", zone_id)

func master_zone(zone_id: String) -> void:
	if not zones_mastered.get(zone_id, false):
		zones_mastered[zone_id] = true
		GameState.mastered_zones[zone_id] = true
		update_zone_visuals(zone_id)
		print("Zone mastered: ", zone_id)

func select_zone(zone_id: String) -> void:
	current_selected_zone = zone_id
	zone_selected.emit(zone_id)
	discover_zone(zone_id)  # Auto-discover on selection

func set_destination(zone_id: String, purpose: String = "pve") -> Dictionary:
	if zone_data_manager == null:
		return {"ok": false, "reason": "ZoneDataManager unavailable"}

	var zone_info = get_zone_info(zone_id)
	if zone_info.is_empty():
		return {"ok": false, "reason": "Unknown zone: %s" % zone_id}

	var unlock_result := _check_zone_unlock(zone_id, zone_info)
	if not unlock_result.get("ok", false):
		return unlock_result

	current_destination_zone = zone_id
	current_travel_purpose = purpose.to_lower()
	select_zone(zone_id)

	var from_zone = get_current_zone_id()
	var route_result = zone_data_manager.find_route(from_zone, zone_id)
	destination_set.emit(zone_id, current_travel_purpose)
	if route_result.get("ok", false):
		route_planned.emit(from_zone, zone_id, route_result.get("route", []))

	return {
		"ok": true,
		"from_zone": from_zone,
		"to_zone": zone_id,
		"purpose": current_travel_purpose,
		"route": route_result.get("route", []),
		"travel_time": route_result.get("travel_time", "Unknown"),
		"distance": route_result.get("distance", 0.0),
		"reachable": route_result.get("ok", false)
	}

func plan_route_to(zone_id: String) -> Dictionary:
	if zone_data_manager == null:
		return {"ok": false, "reason": "ZoneDataManager unavailable"}
	return zone_data_manager.find_route(get_current_zone_id(), zone_id)

func travel_to_destination(instant: bool = false) -> Dictionary:
	if current_destination_zone == "":
		return {"ok": false, "reason": "No destination set"}
	return travel_to_zone(current_destination_zone, current_travel_purpose, instant)

func travel_to_zone(zone_id: String, purpose: String = "pve", instant: bool = false) -> Dictionary:
	var zone_info = get_zone_info(zone_id)
	if zone_info.is_empty():
		return {"ok": false, "reason": "Unknown zone: %s" % zone_id}

	var unlock_result := _check_zone_unlock(zone_id, zone_info)
	if not unlock_result.get("ok", false):
		return unlock_result

	var from_zone = get_current_zone_id()
	var route_result = plan_route_to(zone_id)
	if not route_result.get("ok", false):
		return {
			"ok": false,
			"reason": route_result.get("reason", "No valid route found")
		}

	var target_scene = _resolve_zone_scene(zone_id, zone_info)
	if target_scene == "":
		return {
			"ok": false,
			"reason": "Destination scene not implemented yet for %s" % zone_id,
			"route": route_result.get("route", []),
			"travel_time": route_result.get("travel_time", "Unknown")
		}

	travel_started.emit(from_zone, zone_id, purpose)
	GameState.current_zone = _zone_id_to_state_name(zone_id)
	if instant:
		SceneRouter.go_to_zone(target_scene)
	else:
		# MVP behavior: route simulation resolves immediately once confirmed.
		SceneRouter.go_to_zone(target_scene)
	travel_completed.emit(zone_id)

	return {
		"ok": true,
		"from_zone": from_zone,
		"to_zone": zone_id,
		"purpose": purpose,
		"scene": target_scene,
		"route": route_result.get("route", []),
		"travel_time": route_result.get("travel_time", "Unknown")
	}

func place_waypoint(position: Vector2) -> void:
	if waypoints.size() < 3:  # Limit to 3 waypoints
		waypoints.append(position)
		waypoint_added.emit(position)
		print("Waypoint placed at: ", position)
	else:
		print("Maximum waypoints reached")

func remove_waypoint(position: Vector2) -> void:
	if position in waypoints:
		waypoints.erase(position)
		waypoint_removed.emit(position)
		print("Waypoint removed")

func get_nearest_waypoint() -> Vector2:
	if waypoints.is_empty():
		return Vector2.ZERO
	
	var player_pos = GameState.player_position
	var nearest = waypoints[0]
	var min_distance = player_pos.distance_to(nearest)
	
	for wp in waypoints:
		var distance = player_pos.distance_to(wp)
		if distance < min_distance:
			nearest = wp
			min_distance = distance
	
	return nearest

func get_travel_time(from_zone: String, to_zone: String) -> String:
	# Returns travel time estimate
	if zone_data_manager:
		return zone_data_manager.calculate_travel_time(from_zone, to_zone)
	return "Unknown"

func get_current_zone_id() -> String:
	var current = _normalize_zone_id(GameState.current_zone)
	if current != "" and get_zone_info(current).is_empty() == false:
		return current

	if zones_discovered.has("greenwood_clearing"):
		return "greenwood_clearing"

	if zone_data.has("zones"):
		var keys = zone_data["zones"].keys()
		if keys.size() > 0:
			return String(keys[0])

	return ""

func get_zone_position(zone_id: String) -> Vector2:
	var zone_info = get_zone_info(zone_id)
	if zone_info.is_empty():
		return Vector2.ZERO
	var pos = zone_info.get("position", [0, 0])
	return _array_to_vector2(pos)

func update_layer_visibility() -> void:
	if layer_controller:
		layer_controller.update_visibility(current_zoom_level)

func update_zone_visuals(zone_id: String) -> void:
	# Trigger visual updates for zone (glow, label, etc.)
	EventBus.hud_updated.emit()

func load_discovery_state_from_game() -> void:
	zones_discovered = GameState.discovered_zones.duplicate()
	zones_mastered = GameState.mastered_zones.duplicate()

func save_discovery_state_to_game() -> void:
	GameState.discovered_zones = zones_discovered.duplicate()
	GameState.mastered_zones = zones_mastered.duplicate()

func get_zone_info(zone_id: String) -> Dictionary:
	return zone_data.get("zones", {}).get(zone_id, {})

func is_zone_discovered(zone_id: String) -> bool:
	return zones_discovered.get(zone_id, false)

func is_zone_mastered(zone_id: String) -> bool:
	return zones_mastered.get(zone_id, false)

func _normalize_zone_id(zone_name: String) -> String:
	if zone_name == "":
		return ""

	var value = zone_name.to_snake_case().to_lower()
	return value.replace(" ", "_")

func _zone_id_to_state_name(zone_id: String) -> String:
	var result = ""
	for part in zone_id.split("_"):
		if part.length() == 0:
			continue
		result += part.capitalize()
	return result

func _array_to_vector2(raw_value: Variant) -> Vector2:
	if raw_value is Array and raw_value.size() >= 2:
		return Vector2(float(raw_value[0]), float(raw_value[1]))
	if raw_value is Vector2:
		return raw_value
	return Vector2.ZERO

func _rebuild_scene_lookup_from_zone_data() -> void:
	var zones: Dictionary = zone_data.get("zones", {})
	for zone_id in zones.keys():
		var zid := String(zone_id)
		var info: Dictionary = zones[zid]
		var explicit_scene := String(info.get("scene", ""))
		if explicit_scene != "":
			zone_scene_lookup[zid] = explicit_scene

func _resolve_zone_scene(zone_id: String, zone_info: Dictionary) -> String:
	var explicit_scene := String(zone_info.get("scene", ""))
	if explicit_scene != "":
		return explicit_scene
	return String(zone_scene_lookup.get(zone_id, ""))

func _check_zone_unlock(zone_id: String, zone_info: Dictionary) -> Dictionary:
	var unlock_condition := String(zone_info.get("unlock_condition", "")).strip_edges()
	if unlock_condition == "":
		return {"ok": true}

	if unlock_condition == "story_completed_once" and not GameState.story_completed_once:
		return {
			"ok": false,
			"reason": "%s is locked until story mode is completed once" % zone_info.get("name", zone_id),
			"unlock_condition": unlock_condition
		}

	return {
		"ok": false,
		"reason": "%s is locked (condition: %s)" % [zone_info.get("name", zone_id), unlock_condition],
		"unlock_condition": unlock_condition
	}
