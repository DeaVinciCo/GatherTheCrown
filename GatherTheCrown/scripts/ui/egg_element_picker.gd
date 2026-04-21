extends CanvasLayer
## EggElementPicker
## Shown when the player finds a creat egg.
## Player chooses which element bonds with the egg - Fire, Ice, Earth, Storm, or Shadow.
## Calls CompanionLifecycle.acquire_egg() with the chosen element_id then removes itself.

const ELEMENTS: Array = [
	{ "id": "fire_creat",   "label": "Fire",   "color": Color(1.0, 0.30, 0.10) },
	{ "id": "ice_creat",    "label": "Ice",    "color": Color(0.50, 0.85, 1.0) },
	{ "id": "earth_creat",  "label": "Earth",  "color": Color(0.30, 0.65, 0.20) },
	{ "id": "storm_creat",  "label": "Storm",  "color": Color(0.55, 0.55, 1.0) },
	{ "id": "shadow_creat", "label": "Shadow", "color": Color(0.45, 0.20, 0.65) },
]

func _ready() -> void:
	layer = 100  # Render above all game elements
	_build_ui()

func _build_ui() -> void:
	# Dim overlay
	var overlay = ColorRect.new()
	overlay.color = Color(0.0, 0.0, 0.0, 0.65)
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(overlay)

	# Centered panel
	var panel = Panel.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.size = Vector2(460, 340)
	panel.position = Vector2(-230, -170)
	add_child(panel)

	var margin = MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 24)
	margin.add_theme_constant_override("margin_right", 24)
	margin.add_theme_constant_override("margin_top", 20)
	margin.add_theme_constant_override("margin_bottom", 20)
	panel.add_child(margin)

	var vbox = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 10)
	margin.add_child(vbox)

	var title = Label.new()
	title.text = "An egg stirs with elemental energy!\nChoose its bond:"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 18)
	vbox.add_child(title)

	var sep = HSeparator.new()
	vbox.add_child(sep)

	for elem in ELEMENTS:
		var btn = Button.new()
		btn.text = elem["label"]
		btn.add_theme_color_override("font_color", elem["color"])
		btn.add_theme_font_size_override("font_size", 20)
		var elem_id: String = elem["id"]
		btn.pressed.connect(func(): _on_element_chosen(elem_id))
		vbox.add_child(btn)

func _on_element_chosen(element_id: String) -> void:
	CompanionLifecycle.acquire_egg(element_id)
	queue_free()
