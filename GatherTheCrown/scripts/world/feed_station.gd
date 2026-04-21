extends Interactable
## FeedStation - Interactive station for feeding creat
## Example of concrete Interactable implementation

@export var food_type: String = "food_basic"
@export var food_cost: int = 1
@export var bond_gain: float = 0.05
@export var hunger_reduction: int = 30

func _ready() -> void:
	super._ready()
	display_name = "Feed Creat Station"
	interaction_type = "feed_creat"

func on_interact(actor: Node, component: InteractionComponent) -> void:
	# Check if egg is in care (feed egg to reduce neglect)
	if CompanionLifecycle.current_state == CompanionLifecycle.LifecycleState.EGG_IN_CARE:
		print("Feeding egg...")
		CompanionLifecycle.feed_egg()
		EventBus.hud_updated.emit()
		return
	
	# Feed active creat only if lifecycle confirms creat is active
	if CompanionLifecycle.current_state != CompanionLifecycle.LifecycleState.CREAT_ACTIVE:
		component.interaction_failed.emit("No creat to feed")
		print("No creat to feed yet")
		return
	
	# Check if player has food
	if not InventorySystem.has_item(food_type, food_cost):
		component.interaction_failed.emit("Not enough food")
		print("Not enough %s in inventory" % food_type)
		return
	
	# Consume food
	InventorySystem.remove_item(food_type, food_cost)
	
	# Increase bond
	BondSystem.increase_bond(CompanionLifecycle.egg_type, bond_gain)

	# Reduce hunger
	BondSystem.decrease_hunger(CompanionLifecycle.egg_type, hunger_reduction)
	
	# Gain sync
	SyncSystem.gain_sync(5.0)
	
	print("Creat fed! Bond +%.0f%%, Hunger -%d" % [bond_gain * 100, hunger_reduction])
	
	# Call parent
	super.on_interact(actor, component)
	
	# Emit feedback signal
	EventBus.hud_updated.emit()
