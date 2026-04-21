extends Node
## LayerController - Manages visibility of map layers based on zoom level

var layers: Dictionary = {}  # layer_name -> CanvasLayer

signal layer_visibility_changed(layer_name: String, visible: bool)

func _ready() -> void:
	# Cache references to all layers
	# These will be child nodes of MapScreen
	var parent = get_parent()
	
	layers["terrain"] = parent.get_node_or_null("MapContainer/TerrainLayer")
	layers["detail"] = parent.get_node_or_null("MapContainer/DetailLayer")
	layers["interactive"] = parent.get_node_or_null("MapContainer/InteractiveLayer")
	layers["event"] = parent.get_node_or_null("MapContainer/EventLayer")
	layers["restoration"] = parent.get_node_or_null("MapContainer/RestorationLayer")
	layers["heatmap"] = parent.get_node_or_null("MapContainer/CreatHeatmap")
	layers["faction"] = parent.get_node_or_null("MapContainer/FactionLayer")
	
	print("LayerController initialized with %d layers" % layers.size())

func update_visibility(zoom_level: int) -> void:
	# Control which layers show based on zoom level
	match zoom_level:
		0:  # World View - show only terrain and major landmarks
			show_layer("terrain", true)
			show_layer("detail", false)
			show_layer("interactive", true)
			show_layer("event", true)
			show_layer("restoration", false)
			show_layer("heatmap", false)
			show_layer("faction", false)
			print("Switched to World View")
		
		1:  # Region View (default) - show everything except heatmap/faction
			show_layer("terrain", true)
			show_layer("detail", true)
			show_layer("interactive", true)
			show_layer("event", true)
			show_layer("restoration", true)
			show_layer("heatmap", false)
			show_layer("faction", false)
			print("Switched to Region View")
		
		2:  # Local View - show all layers including advanced
			show_layer("terrain", true)
			show_layer("detail", true)
			show_layer("interactive", true)
			show_layer("event", true)
			show_layer("restoration", true)
			show_layer("heatmap", false)  # User must toggle
			show_layer("faction", false)  # User must toggle
			print("Switched to Local View")

func toggle_layer(layer_name: String, enabled: bool) -> void:
	show_layer(layer_name, enabled)

func show_layer(layer_name: String, visible: bool) -> void:
	if layer_name in layers:
		var layer = layers[layer_name]
		if layer:
			layer.visible = visible
			layer_visibility_changed.emit(layer_name, visible)
		else:
			print("Warning: Layer '%s' not found" % layer_name)

func is_layer_visible(layer_name: String) -> bool:
	if layer_name in layers:
		var layer = layers[layer_name]
		return layer.visible if layer else false
	return false

func get_all_layers() -> Array:
	return layers.keys()
