extends Interactable
## RestorationStructure - Interactive broken structure that player can restore
## Example of restoration mini-loop

@export var site_id: String = "restoration_site_01"
@export var required_material: String = "essence_water"
@export var material_cost: int = 1
@export var restoration_duration: float = 5.0

var has_gathered_material: bool = false

func _ready() -> void:
	super._ready()
	display_name = "Broken Structure"
	interaction_type = "restore"

func on_interact(actor: Node, component: InteractionComponent) -> void:
	# Check if materials gathered
	if not has_gathered_material:
		component.interaction_failed.emit("Need to gather materials first")
		print("Need %s to restore structure" % required_material)
		return
	
	# Check if player has required material
	if not InventorySystem.has_item(required_material, material_cost):
		component.interaction_failed.emit("Missing %s" % required_material)
		print("Not enough %s" % required_material)
		return
	
	# Consume material
	InventorySystem.remove_item(required_material, material_cost)
	
	# Start restoration
	RestorationSystem.start_restoration(site_id, restoration_duration)
	
	# Listen for completion
	RestorationSystem.restoration_completed.connect(_on_restoration_completed)
	
	print("Restoration started on %s!" % site_id)
	
	# Call parent
	super.on_interact(actor, component)

func set_material_gathered(gathered: bool) -> void:
	has_gathered_material = gathered

func _on_restoration_completed(completed_site_id: String, _reward: Dictionary) -> void:
	if completed_site_id == site_id:
		# Update visual state (change color, add glow, etc.)
		update_visual_state_restored()
		print("Structure restoration complete!")
		
		# Disconnect signal
		if RestorationSystem.restoration_completed.is_connected(_on_restoration_completed):
			RestorationSystem.restoration_completed.disconnect(_on_restoration_completed)

func update_visual_state_restored() -> void:
	# TODO: Change sprite color/animation to show restored state
	# For now, just print
	print("Visual state updated to 'restored'")
