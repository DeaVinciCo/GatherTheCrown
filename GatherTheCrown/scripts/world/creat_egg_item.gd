extends Interactable
## CreatEggItem - A discoverable egg that hatches into a creat companion
## The creat's element is chosen by the player via EggElementPicker.

func _ready() -> void:
	super._ready()
	display_name = "Creat Egg"
	interaction_type = "collect_egg"

func on_interact(actor: Node, component: InteractionComponent) -> void:
	# Add a generic egg to inventory
	InventorySystem.add_item("creat_egg", 1)

	print("Found a creat egg!")

	# Show element picker - player decides the creat's element
	var picker_script = load("res://scripts/ui/egg_element_picker.gd")
	if picker_script:
		var picker = picker_script.new()
		get_tree().root.add_child(picker)

	# Remove from world
	component.set_active(false)
	queue_free()

	# Emit event (egg_type unknown until picker resolves)
	EventBus.item_collected.emit("creat_egg", "unknown")
	EventBus.hud_updated.emit()

	# Call parent
	super.on_interact(actor, component)
