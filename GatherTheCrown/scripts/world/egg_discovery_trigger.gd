extends Area2D
## EggDiscoveryTrigger - When player enters, the element picker is shown
## and the player chooses which creat bonds with the egg.
## Place in trial routes at key discovery points

@export var discovery_message: String = "You found a creat egg!"
var has_triggered: bool = false

func _ready() -> void:
	area_entered.connect(_on_area_entered)
	print("Egg discovery trigger ready")

func _on_area_entered(area: Area2D) -> void:
	if has_triggered:
		return
	
	# Check if player entered
	if area.get_parent().name == "Player":
		has_triggered = true
		trigger_discovery()

func trigger_discovery() -> void:
	print(discovery_message)

	# Show element picker so the player chooses the creat's element
	var picker_script = load("res://scripts/ui/egg_element_picker.gd")
	if picker_script:
		var picker = picker_script.new()
		get_tree().root.add_child(picker)

	# Show brief discovery label above the trigger
	var label = Label.new()
	label.text = discovery_message
	label.add_theme_font_size_override("font_size", 32)
	add_child(label)
	label.position = Vector2(-150, -50)

	# Remove trigger area after discovery
	await get_tree().create_timer(3.0).timeout
	queue_free()
