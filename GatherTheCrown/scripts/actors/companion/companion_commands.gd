extends Node
## CompanionCommands - Simple command layer for Fire Creat
## Follow, Attack, Defensive modes

enum CommandMode {
	FOLLOW,     # Follow player passively
	ATTACK,     # Actively attack enemies
	DEFENSIVE   # Stay near player, only counter-attack
}

var current_command: CommandMode = CommandMode.FOLLOW
var creat_node: Node = null

signal command_changed(new_command: CommandMode)

func _ready() -> void:
	print("CompanionCommands initialized: %s" % CommandMode.keys()[current_command])

func _process(_delta: float) -> void:
	# Toggle command with F key (only if creat is active)
	if CompanionLifecycle.current_state != CompanionLifecycle.LifecycleState.CREAT_ACTIVE:
		return
	
	if Input.is_action_just_pressed("feed"):  # Reusing feed key for command toggle
		toggle_command()

func toggle_command() -> void:
	# Cycle: Follow  Attack  Defensive  Follow
	current_command = (current_command + 1) % CommandMode.size()
	command_changed.emit(current_command)
	
	var command_name = CommandMode.keys()[current_command]
	print("Creat command changed to: %s" % command_name)
	EventBus.hud_updated.emit()

func set_command(mode: CommandMode) -> void:
	if current_command != mode:
		current_command = mode
		command_changed.emit(current_command)
		print("Creat command set to: %s" % CommandMode.keys()[mode])

func get_current_command() -> CommandMode:
	return current_command

func get_command_name() -> String:
	return CommandMode.keys()[current_command]

func is_attacking() -> bool:
	return current_command == CommandMode.ATTACK

func is_following() -> bool:
	return current_command == CommandMode.FOLLOW

func is_defensive() -> bool:
	return current_command == CommandMode.DEFENSIVE
