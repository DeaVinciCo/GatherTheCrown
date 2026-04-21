extends Interactable
## MaterialGatherPoint - Interactable to gather restoration materials

@export var material_type: String = "essence_water"
@export var material_amount: int = 1

func _ready() -> void:
	super._ready()
	display_name = "Material Gather Point"
	interaction_type = "gather"

func on_interact(actor: Node, component: InteractionComponent) -> void:
	# Add material to inventory
	InventorySystem.add_item(material_type, material_amount)
	
	print("Gathered %d x %s" % [material_amount, material_type])
	
	# Mark as gathered (disable interaction)
	component.set_active(false)
	
	# Call parent
	super.on_interact(actor, component)
	
	# Emit feedback
	EventBus.hud_updated.emit()
