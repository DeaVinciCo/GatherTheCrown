extends Control
## MapScreen - Interactive world map with zoom, route planning, and destination travel

const MAP_RECT := Rect2(24.0, 80.0, 900.0, 580.0)
const PURPOSES := ["pvp", "pve", "race", "mini_games", "story", "side_quest"]

@onready var map_manager: Node = $MapManager
@onready var mode_selector: OptionButton = $Panel/ModeSelector
@onready var zoom_label: Label = $Panel/ZoomLabel
@onready var selected_label: Label = $Panel/SelectedZoneLabel
@onready var route_info: RichTextLabel = $Panel/RouteInfo

var selected_zone: String = ""
var selected_route: Array = []
var camera_center: Vector2 = Vector2.ZERO
var base_scale: float = 1.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	set_process_unhandled_input(true)

	if mode_selector:
		mode_selector.clear()
		for purpose in PURPOSES:
			mode_selector.add_item(_pretty_purpose(purpose))
		mode_selector.select(1)  # PvE default

	if map_manager:
		map_manager.zoom_changed.connect(_on_zoom_changed)
		map_manager.destination_set.connect(_on_destination_set)

	_refresh_zoom_label()
	_refresh_selection("Click a location to inspect it")
	_refresh_route_info("Select a zone and press Plan Route")
	queue_redraw()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		SceneRouter.close_screen(self)
		get_viewport().set_input_as_handled()
		return

	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_ENTER or event.keycode == KEY_KP_ENTER:
			_on_set_destination_pressed()
			get_viewport().set_input_as_handled()
		elif event.keycode == KEY_T:
			_on_travel_pressed()
			get_viewport().set_input_as_handled()

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			map_manager.set_zoom_level(clampi(map_manager.current_zoom_level + 1, 0, 2))
			queue_redraw()
			return
		if event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			map_manager.set_zoom_level(clampi(map_manager.current_zoom_level - 1, 0, 2))
			queue_redraw()
			return
		if event.button_index == MOUSE_BUTTON_LEFT:
			var clicked_zone = _find_clicked_zone(event.position)
			if clicked_zone != "":
				selected_zone = clicked_zone
				map_manager.select_zone(selected_zone)
				_refresh_selection(_zone_summary(selected_zone))
				queue_redraw()
			return
		if event.button_index == MOUSE_BUTTON_RIGHT:
			var waypoint_zone = _find_clicked_zone(event.position)
			if waypoint_zone != "":
				var waypoint_world := _array_to_vector2(map_manager.get_zone_info(waypoint_zone).get("position", [0, 0]))
				map_manager.place_waypoint(waypoint_world)
				_refresh_route_info("Waypoint added: %s" % waypoint_zone)
				queue_redraw()
			return
		if event.button_index == MOUSE_BUTTON_MIDDLE:
			var nearest := map_manager.get_nearest_waypoint()
			if nearest != Vector2.ZERO:
				map_manager.remove_waypoint(nearest)
				_refresh_route_info("Removed nearest waypoint")
				queue_redraw()

func _draw() -> void:
	_draw_backdrop()
	_draw_map_layers()
	_draw_overlay_labels()

func _draw_backdrop() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.02, 0.05, 0.08, 0.82), true)
	draw_rect(MAP_RECT.grow(2), Color(0.95, 0.78, 0.42, 0.5), false, 3.0)
	draw_rect(MAP_RECT, Color(0.11, 0.16, 0.2, 0.97), true)

func _draw_map_layers() -> void:
	if not map_manager or not map_manager.zone_data_manager:
		return

	var zones: Dictionary = map_manager.zone_data_manager.get_all_zones()
	if zones.is_empty():
		return

	_rebuild_camera(zones)
	_draw_paths(zones)
	_draw_route_highlight(zones)
	_draw_zones(zones)

func _draw_paths(_zones: Dictionary) -> void:
	for path_data in map_manager.zone_data_manager.paths:
		var from_zone = String(path_data.get("from_zone", ""))
		var to_zone = String(path_data.get("to_zone", ""))
		if from_zone == "" or to_zone == "":
			continue

		var from_pos = _map_position(from_zone)
		var to_pos = _map_position(to_zone)
		var discovered = map_manager.is_zone_discovered(from_zone) and map_manager.is_zone_discovered(to_zone)
		var line_color = Color(0.24, 0.42, 0.52, 0.45)
		if discovered:
			line_color = Color(0.57, 0.87, 0.96, 0.52)
		draw_line(from_pos, to_pos, line_color, 2.0)

func _draw_route_highlight(_zones: Dictionary) -> void:
	if selected_route.size() < 2:
		return

	for i in range(selected_route.size() - 1):
		var from_pos = _map_position(String(selected_route[i]))
		var to_pos = _map_position(String(selected_route[i + 1]))
		draw_line(from_pos, to_pos, Color(1.0, 0.87, 0.45, 0.95), 4.0)

func _draw_zones(zones: Dictionary) -> void:
	for zone_id in zones.keys():
		var zone_data = zones[zone_id]
		var zone_pos = _map_position(String(zone_id))
		var is_discovered = map_manager.is_zone_discovered(String(zone_id))
		var is_current = String(zone_id) == map_manager.get_current_zone_id()
		var is_selected = String(zone_id) == selected_zone

		var radius = 8.0
		if map_manager.current_zoom_level == 2:
			radius = 11.0
		elif map_manager.current_zoom_level == 0:
			radius = 6.0

		var fill_color = _zone_type_color(String(zone_data.get("type", "")))
		if not is_discovered:
			fill_color = fill_color.darkened(0.55)

		draw_circle(zone_pos, radius, fill_color)

		if is_current:
			draw_circle(zone_pos, radius + 4.0, Color(0.25, 0.98, 0.72, 0.9), false, 2.0)
		if is_selected:
			draw_circle(zone_pos, radius + 7.0, Color(1.0, 0.86, 0.45, 0.95), false, 2.5)
		if String(zone_id) == map_manager.current_destination_zone:
			draw_arc(zone_pos, radius + 11.0, 0.0, TAU, 32, Color(0.98, 0.94, 0.36, 0.92), 2.0)

		if _can_draw_zone_label(String(zone_id), is_discovered):
			var label_pos = zone_pos + Vector2(10, -10)
			draw_string(
				ThemeDB.fallback_font,
				label_pos,
				String(zone_data.get("name", zone_id)),
				HORIZONTAL_ALIGNMENT_LEFT,
				-1,
				14,
				Color(0.93, 0.96, 0.98, 0.96)
			)

	_draw_waypoints()

func _draw_waypoints() -> void:
	if not map_manager:
		return

	for wp in map_manager.waypoints:
		var map_pos := _world_to_map_position(wp)
		if not MAP_RECT.has_point(map_pos):
			continue
		draw_circle(map_pos, 5.0, Color(1.0, 0.62, 0.20, 0.95))
		draw_circle(map_pos, 9.0, Color(1.0, 0.88, 0.38, 0.75), false, 1.5)

func _draw_overlay_labels() -> void:
	var view_name = ["World", "Regional", "Local"][map_manager.current_zoom_level]
	draw_string(
		ThemeDB.fallback_font,
		MAP_RECT.position + Vector2(12, 20),
		"%s View" % view_name,
		HORIZONTAL_ALIGNMENT_LEFT,
		-1,
		16,
		Color(0.98, 0.82, 0.51, 0.94)
	)

func _rebuild_camera(zones: Dictionary) -> void:
	var min_pos = Vector2(100000.0, 100000.0)
	var max_pos = Vector2(-100000.0, -100000.0)

	for zone_data in zones.values():
		var zone_pos = _array_to_vector2(zone_data.get("position", [0, 0]))
		min_pos.x = min(min_pos.x, zone_pos.x)
		min_pos.y = min(min_pos.y, zone_pos.y)
		max_pos.x = max(max_pos.x, zone_pos.x)
		max_pos.y = max(max_pos.y, zone_pos.y)

	var world_size = (max_pos - min_pos).abs()
	var scale_x = MAP_RECT.size.x / max(world_size.x, 1.0)
	var scale_y = MAP_RECT.size.y / max(world_size.y, 1.0)
	base_scale = min(scale_x, scale_y) * 0.84

	var current_zone = map_manager.get_current_zone_id()
	if map_manager.current_zoom_level == 0:
		camera_center = (min_pos + max_pos) * 0.5
	elif map_manager.current_zoom_level == 1:
		camera_center = _array_to_vector2(zones.get(current_zone, {}).get("position", [0, 0]))
		base_scale *= 1.22
	else:
		var focus_zone = selected_zone if selected_zone != "" else current_zone
		camera_center = _array_to_vector2(zones.get(focus_zone, {}).get("position", [0, 0]))
		base_scale *= 1.78

func _map_position(zone_id: String) -> Vector2:
	var zone_data = map_manager.get_zone_info(zone_id)
	var world_pos = _array_to_vector2(zone_data.get("position", [0, 0]))
	return _world_to_map_position(world_pos)

func _world_to_map_position(world_pos: Vector2) -> Vector2:
	var map_center = MAP_RECT.position + (MAP_RECT.size * 0.5)
	return map_center + ((world_pos - camera_center) * base_scale)

func _find_clicked_zone(mouse_position: Vector2) -> String:
	if not MAP_RECT.has_point(mouse_position):
		return ""

	var zones: Dictionary = map_manager.zone_data_manager.get_all_zones()
	var nearest_zone = ""
	var nearest_distance = 24.0

	for zone_id in zones.keys():
		var zone_pos = _map_position(String(zone_id))
		var distance = mouse_position.distance_to(zone_pos)
		if distance < nearest_distance:
			nearest_distance = distance
			nearest_zone = String(zone_id)

	return nearest_zone

func _can_draw_zone_label(zone_id: String, is_discovered: bool) -> bool:
	if map_manager.current_zoom_level == 2:
		return true
	if map_manager.current_zoom_level == 1:
		return is_discovered or zone_id == map_manager.get_current_zone_id() or zone_id == selected_zone
	return zone_id == map_manager.get_current_zone_id() or zone_id == selected_zone

func _zone_type_color(zone_type: String) -> Color:
	match zone_type:
		"forest_hub":
			return Color(0.24, 0.86, 0.53, 1)
		"combat_zone":
			return Color(0.93, 0.44, 0.34, 1)
		"restoration_site":
			return Color(0.38, 0.72, 0.96, 1)
		_:
			return Color(0.73, 0.73, 0.82, 1)

func _zone_summary(zone_id: String) -> String:
	var zone = map_manager.get_zone_info(zone_id)
	if zone.is_empty():
		return "Unknown zone"

	var levels = zone.get("level_range", [1, 1])
	var zone_type = String(zone.get("type", "unknown")).replace("_", " ").capitalize()
	return "%s | %s | Lv %d-%d" % [zone.get("name", zone_id), zone_type, int(levels[0]), int(levels[1])]

func _selected_purpose() -> String:
	if not mode_selector:
		return "pve"
	var index = clampi(mode_selector.selected, 0, PURPOSES.size() - 1)
	return PURPOSES[index]

func _pretty_purpose(value: String) -> String:
	return value.replace("_", " ").capitalize()

func _refresh_zoom_label() -> void:
	if not zoom_label:
		return
	zoom_label.text = "Zoom: %s" % ["World", "Regional", "Local"][map_manager.current_zoom_level]

func _refresh_selection(text: String) -> void:
	if selected_label:
		selected_label.text = text

func _refresh_route_info(text: String) -> void:
	if route_info:
		route_info.text = text

func _on_zoom_changed(_level: int) -> void:
	_refresh_zoom_label()
	queue_redraw()

func _on_destination_set(zone_id: String, purpose: String) -> void:
	_refresh_route_info("Destination set: %s (%s)" % [zone_id, _pretty_purpose(purpose)])

func _on_zoom_in_pressed() -> void:
	map_manager.set_zoom_level(clampi(map_manager.current_zoom_level + 1, 0, 2))

func _on_zoom_out_pressed() -> void:
	map_manager.set_zoom_level(clampi(map_manager.current_zoom_level - 1, 0, 2))

func _on_plan_route_pressed() -> void:
	if selected_zone == "":
		_refresh_route_info("Select a zone before planning a route")
		return

	var route_result = map_manager.plan_route_to(selected_zone)
	if not route_result.get("ok", false):
		selected_route = []
		_refresh_route_info("Route unavailable: %s" % route_result.get("reason", "Unknown"))
		queue_redraw()
		return

	selected_route = route_result.get("route", [])
	_refresh_route_info(
		"Route: %s\nTravel: %s\nDistance: %.0f" % [
			" -> ".join(selected_route),
			route_result.get("travel_time", "Unknown"),
			float(route_result.get("distance", 0.0))
		]
	)
	queue_redraw()

func _on_set_destination_pressed() -> void:
	if selected_zone == "":
		_refresh_route_info("Select a zone before setting destination")
		return

	var destination_result = map_manager.set_destination(selected_zone, _selected_purpose())
	if not destination_result.get("ok", false):
		_refresh_route_info("Destination failed: %s" % destination_result.get("reason", "Unknown"))
		return

	selected_route = destination_result.get("route", [])
	_refresh_route_info(
		"Destination: %s (%s)\nRoute: %s\nETA: %s" % [
			selected_zone,
			_pretty_purpose(_selected_purpose()),
			" -> ".join(selected_route),
			destination_result.get("travel_time", "Unknown")
		]
	)
	_refresh_selection(_zone_summary(selected_zone))
	queue_redraw()

func _on_travel_pressed() -> void:
	if selected_zone == "":
		_refresh_route_info("Select a zone before traveling")
		return

	if map_manager.current_destination_zone != selected_zone:
		map_manager.set_destination(selected_zone, _selected_purpose())

	var travel_result = map_manager.travel_to_destination(false)
	if not travel_result.get("ok", false):
		_refresh_route_info(
			"Travel blocked: %s\n(Route can still be used for side quests/story navigation.)" %
			travel_result.get("reason", "Unknown")
		)
		return

	_refresh_route_info("Traveling to %s..." % selected_zone)
	SceneRouter.close_screen(self)

func _on_close_pressed() -> void:
	SceneRouter.close_screen(self)

func _array_to_vector2(raw_value: Variant) -> Vector2:
	if raw_value is Array and raw_value.size() >= 2:
		return Vector2(float(raw_value[0]), float(raw_value[1]))
	if raw_value is Vector2:
		return raw_value
	return Vector2.ZERO
