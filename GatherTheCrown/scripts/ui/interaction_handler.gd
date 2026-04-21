extends Node
## InteractionHandler - Manages map interactions (hover, click, context menu)

var map_manager: Node
var zone_data_manager: Node
var tooltip_panel: PanelContainer
var context_menu: PopupMenu
var selected_zone: String = ""

signal zone_context_menu_opened(zone_id: String)
signal fast_travel_requested(zone_id: String)
signal waypoint_requested(position: Vector2)

func _ready() -> void:
	map_manager = get_parent().get_node_or_null("MapManager")
	zone_data_manager = get_parent().get_node_or_null("MapManager/ZoneDataManager")
	tooltip_panel = get_parent().get_node_or_null("TooltipPanel")
	context_menu = get_parent().get_node_or_null("ContextMenu")
	
	# Connect context menu signals
	if context_menu:
		context_menu.id_pressed.connect(_on_context_menu_pressed)
	
	print("InteractionHandler initialized")

func _input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		var zone = detect_zone_at_position(event.position)
		if zone:
			selected_zone = zone
			show_context_menu(zone, event.position)
			get_tree().root.set_input_as_handled()
	
	elif event is InputEventMouseMotion:
		var zone = detect_zone_at_position(event.position)
		if zone:
			show_tooltip(zone, event.position)
		else:
			hide_tooltip()

func detect_zone_at_position(position: Vector2) -> String:
	# TODO: Implement actual clickable region detection
	# For now, return nearest zone to click position
	if not zone_data_manager:
		return ""
	
	var zones = zone_data_manager.get_all_zones()
	var nearest_zone = ""
	var nearest_distance = 100.0  # Click tolerance
	
	for zone_id in zones.keys():
		var zone_data = zones[zone_id]
		var zone_pos = _array_to_vector2(zone_data.get("position", [0, 0]))
		var distance = position.distance_to(zone_pos)
		
		if distance < nearest_distance:
			nearest_zone = zone_id
			nearest_distance = distance
	
	return nearest_zone

func show_tooltip(zone_id: String, position: Vector2) -> void:
	if not tooltip_panel or not zone_data_manager:
		return
	
	var zone_data = zone_data_manager.get_zone(zone_id)
	if zone_data.is_empty():
		return
	
	# Build tooltip text
	var name = zone_data.get("name", "Unknown")
	var level_range = zone_data.get("level_range", [1, 5])
	var discovered = map_manager.is_zone_discovered(zone_id) if map_manager else false
	
	var status = "Unknown" if not discovered else "Discovered"
	var mastered = map_manager.is_zone_mastered(zone_id) if map_manager else false
	if mastered:
		status = "Mastered"
	
	var tooltip_text = "%s\nLvl %d-%d\n[%s]" % [name, level_range[0], level_range[1], status]
	
	# Show tooltip
	if tooltip_panel.has_node("TooltipLabel"):
		tooltip_panel.get_node("TooltipLabel").text = tooltip_text
	
	tooltip_panel.global_position = position + Vector2(20, 20)
	tooltip_panel.show()

func hide_tooltip() -> void:
	if tooltip_panel:
		tooltip_panel.hide()

func show_context_menu(zone_id: String, position: Vector2) -> void:
	if not context_menu or not map_manager or not zone_data_manager:
		return
	
	var zone_data = zone_data_manager.get_zone(zone_id)
	if zone_data.is_empty():
		return
	
	# Store zone_id for menu actions
	selected_zone = zone_id
	
	# Build context menu
	context_menu.clear()
	
	# Fast Travel option (if unlocked)
	var can_fast_travel = map_manager.is_zone_discovered(zone_id)
	context_menu.add_item("Fast Travel", 0) if can_fast_travel else context_menu.add_item("[Locked] Fast Travel", 0)
	
	# Set Waypoint
	context_menu.add_item("Set Waypoint", 1)
	
	# Information
	context_menu.add_item("Information", 2)
	
	# Active Events
	var active_events = zone_data.get("active_events", [])
	if active_events.size() > 0:
		context_menu.add_item("Active Events (%d)" % active_events.size(), 3)
	
	# Resources
	var resources = zone_data.get("resources", [])
	if resources.size() > 0:
		context_menu.add_item("Resources (%d)" % resources.size(), 4)
	
	# Quests
	context_menu.add_item("Quests", 5)
	
	# Travel Time
	var from_zone = map_manager.get_current_zone_id()
	var travel_time = map_manager.get_travel_time(from_zone, zone_id)
	context_menu.add_item("Travel Time: %s" % travel_time, 6)
	
	context_menu.popup_rect = Rect2(position, Vector2(200, 200))
	zone_context_menu_opened.emit(zone_id)

func _on_context_menu_pressed(index: int) -> void:
	match index:
		0:  # Fast Travel
			if map_manager and map_manager.is_zone_discovered(selected_zone):
				fast_travel_requested.emit(selected_zone)
				print("Fast travel to: ", selected_zone)
		
		1:  # Set Waypoint
			if zone_data_manager:
				var zone_data = zone_data_manager.get_zone(selected_zone)
				var pos = _array_to_vector2(zone_data.get("position", [0, 0]))
				map_manager.place_waypoint(pos)
				waypoint_requested.emit(pos)
		
		2:  # Information
			print("Show info for: ", selected_zone)
		
		3:  # Active Events
			print("Show active events for: ", selected_zone)
		
		4:  # Resources
			print("Show resources for: ", selected_zone)
		
		5:  # Quests
			print("Show quests for: ", selected_zone)
		
		6:  # Travel Time
			print("Show travel time for: ", selected_zone)

func _array_to_vector2(raw_value: Variant) -> Vector2:
	if raw_value is Array and raw_value.size() >= 2:
		return Vector2(float(raw_value[0]), float(raw_value[1]))
	if raw_value is Vector2:
		return raw_value
	return Vector2.ZERO
