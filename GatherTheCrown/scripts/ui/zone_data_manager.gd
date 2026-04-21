extends Node
## ZoneDataManager - Loads and manages zone data from JSON

var zones: Dictionary = {}
var landmarks: Dictionary = {}
var paths: Array = []

func _ready() -> void:
	print("ZoneDataManager initialized")

func load_zone_data(path: String) -> Dictionary:
	# Load zones.json and cache data
	var file = FileAccess.open(path, FileAccess.READ)
	
	if file == null:
		print("Error: Could not load zones.json at: ", path)
		return {}
	
	var json_string = file.get_as_text()
	var data = JSON.parse_string(json_string)
	
	if data == null:
		print("Error: Failed to parse zones.json")
		return {}
	
	zones = data.get("zones", {})
	landmarks = data.get("landmarks", {})
	paths = data.get("paths", [])
	
	print("Loaded %d zones, %d landmarks, %d paths" % [zones.size(), landmarks.size(), paths.size()])
	return data

func get_zone(zone_id: String) -> Dictionary:
	return zones.get(zone_id, {})

func get_landmark(landmark_id: String) -> Dictionary:
	return landmarks.get(landmark_id, {})

func get_all_zones() -> Dictionary:
	return zones.duplicate()

func get_all_landmarks() -> Dictionary:
	return landmarks.duplicate()

func get_zones_in_biome(biome_type: String) -> Array:
	var result: Array = []
	for zone_id in zones.keys():
		if zones[zone_id].get("biome") == biome_type:
			result.append(zone_id)
	return result

func get_landmarks_in_zone(zone_id: String) -> Array:
	var result: Array = []
	for landmark_id in landmarks.keys():
		if landmarks[landmark_id].get("zone") == zone_id:
			result.append(landmark_id)
	return result

func calculate_travel_time(from_zone: String, to_zone: String) -> String:
	# Calculate travel time based on distance and terrain
	var from_data = get_zone(from_zone)
	var to_data = get_zone(to_zone)
	
	if from_data.is_empty() or to_data.is_empty():
		return "Unknown"
	
	var from_pos = _array_to_vector2(from_data.get("position", [0, 0]))
	var to_pos = _array_to_vector2(to_data.get("position", [0, 0]))
	
	var distance = from_pos.distance_to(to_pos)
	
	# Find path difficulty
	var terrain_difficulty = 1.0
	for path in paths:
		if (path.get("from_zone") == from_zone and path.get("to_zone") == to_zone) or \
		   (path.get("from_zone") == to_zone and path.get("to_zone") == from_zone):
			terrain_difficulty = path.get("difficulty", 1.0)
			break
	
	# Base speed (pixels per minute)
	var base_speed = 100.0
	var player_speed = base_speed
	
	# Apply creat speed bonus if synced
	if SyncSystem.is_synced:
		player_speed *= 1.3
	
	# Calculate time
	var travel_time = (distance / player_speed) * terrain_difficulty
	var time_min = int(travel_time)
	var time_max = time_min + 2
	
	return "%d-%d minutes" % [time_min, time_max]

func calculate_segment_minutes(from_zone: String, to_zone: String) -> float:
	var from_data = get_zone(from_zone)
	var to_data = get_zone(to_zone)
	if from_data.is_empty() or to_data.is_empty():
		return 0.0

	var from_pos = _array_to_vector2(from_data.get("position", [0, 0]))
	var to_pos = _array_to_vector2(to_data.get("position", [0, 0]))
	var distance = from_pos.distance_to(to_pos)

	var terrain_difficulty = 1.0
	for path in paths:
		if _path_connects(path, from_zone, to_zone):
			terrain_difficulty = float(path.get("difficulty", 1.0))
			break

	var speed = 100.0
	if SyncSystem.is_synced:
		speed *= 1.3

	return (distance / speed) * terrain_difficulty

func find_route(from_zone: String, to_zone: String) -> Dictionary:
	if from_zone == "" or to_zone == "":
		return {"ok": false, "reason": "Invalid route endpoints"}
	if from_zone == to_zone:
		return {
			"ok": true,
			"route": [from_zone],
			"distance": 0.0,
			"travel_time": "0-1 minutes",
			"minutes": 0.0
		}

	var adjacency = _build_adjacency()
	if not adjacency.has(from_zone) or not adjacency.has(to_zone):
		return {"ok": false, "reason": "Route endpoint missing from graph"}

	var route = _find_shortest_path(from_zone, to_zone, adjacency)
	if route.is_empty():
		return {"ok": false, "reason": "No connected route found"}

	var total_distance := 0.0
	var total_minutes := 0.0
	for i in range(route.size() - 1):
		var segment = _find_path_segment(route[i], route[i + 1])
		if not segment.is_empty():
			total_distance += float(segment.get("distance", 0.0))
		total_minutes += calculate_segment_minutes(route[i], route[i + 1])

	var time_min = int(total_minutes)
	var time_max = time_min + max(1, int(ceil(route.size() * 0.5)))

	return {
		"ok": true,
		"route": route,
		"distance": total_distance,
		"minutes": total_minutes,
		"travel_time": "%d-%d minutes" % [time_min, time_max]
	}

func get_zone_difficulty(zone_id: String) -> Array:
	# Returns [min_level, max_level]
	var zone = get_zone(zone_id)
	return zone.get("level_range", [1, 5])

func get_creat_density(zone_id: String) -> Dictionary:
	# Returns density of each creat type in zone
	var zone = get_zone(zone_id)
	return zone.get("creat_density", {})

func get_zone_resources(zone_id: String) -> Array:
	# Returns list of resources available in zone
	var zone = get_zone(zone_id)
	return zone.get("resources", [])

func _build_adjacency() -> Dictionary:
	var adjacency: Dictionary = {}
	for zone_id in zones.keys():
		adjacency[zone_id] = []

	for path in paths:
		var from_zone = String(path.get("from_zone", ""))
		var to_zone = String(path.get("to_zone", ""))
		if from_zone == "" or to_zone == "":
			continue

		if not adjacency.has(from_zone):
			adjacency[from_zone] = []
		if not adjacency.has(to_zone):
			adjacency[to_zone] = []

		adjacency[from_zone].append(to_zone)
		adjacency[to_zone].append(from_zone)

	return adjacency

func _find_shortest_path(start_zone: String, target_zone: String, adjacency: Dictionary) -> Array:
	var queue: Array = [[start_zone]]
	var visited: Dictionary = {start_zone: true}

	while not queue.is_empty():
		var path: Array = queue.pop_front()
		var current_zone = String(path[path.size() - 1])
		if current_zone == target_zone:
			return path

		for neighbor in adjacency.get(current_zone, []):
			if visited.get(neighbor, false):
				continue
			visited[neighbor] = true
			var next_path = path.duplicate()
			next_path.append(neighbor)
			queue.append(next_path)

	return []

func _find_path_segment(from_zone: String, to_zone: String) -> Dictionary:
	for path in paths:
		if _path_connects(path, from_zone, to_zone):
			return path
	return {}

func _path_connects(path: Dictionary, from_zone: String, to_zone: String) -> bool:
	return (path.get("from_zone") == from_zone and path.get("to_zone") == to_zone) or \
		(path.get("from_zone") == to_zone and path.get("to_zone") == from_zone)

func _array_to_vector2(raw_value: Variant) -> Vector2:
	if raw_value is Array and raw_value.size() >= 2:
		return Vector2(float(raw_value[0]), float(raw_value[1]))
	if raw_value is Vector2:
		return raw_value
	return Vector2.ZERO
