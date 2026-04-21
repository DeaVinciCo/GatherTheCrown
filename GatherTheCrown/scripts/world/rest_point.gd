extends Interactable
## RestPoint - Interactive station for resting and healing
## Also triggers egg care if player has egg
## Restores player and creat to full health

func _ready() -> void:
	super._ready()
	display_name = "Rest Point"
	interaction_type = "rest"

func on_interact(actor: Node, component: InteractionComponent) -> void:
	# Check if player has egg that needs care
	if CompanionLifecycle.current_state == CompanionLifecycle.LifecycleState.EGG_ACQUIRED:
		print("Beginning egg care at RestPoint")
		CompanionLifecycle.begin_care()
		return
	
	# Restore player health
	GameState.player_stats["hp"] = GameState.player_stats["max_hp"]
	
	# Restore creat health
	GameState.companion_stats["hp"] = GameState.companion_stats["max_hp"]
	
	# Reset hunger
	GameState.companion_stats["hunger"] = 50
	BondSystem.creat_hunger[CompanionLifecycle.egg_type] = 0.0
	
	print("Player and creat fully rested!")
	
	# Emit feedback
	EventBus.hud_updated.emit()
	
	# Call parent
	super.on_interact(actor, component)
