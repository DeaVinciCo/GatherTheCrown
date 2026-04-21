extends Node
## InteractionComponent - Manages interactions for any node
## Attach to any object that should be interactive (NPC, object, station, etc.)

class_name InteractionComponent

@export var interaction_type: String = "generic"  # feed, forge, rest, gather, restore, etc.
@export var interaction_prompt: String = "Press [E] to interact"
@export var interaction_range: float = 50.0  # How close player needs to be
@export var can_repeat: bool = true  # Can interact multiple times
@export var cooldown: float = 0.0  # Seconds between interactions

var is_active: bool = true
var last_interaction_time: float = 0.0
var interaction_target: Node = null  # The object being interacted with

signal interaction_started(component: InteractionComponent)
signal interaction_completed(component: InteractionComponent)
signal interaction_failed(reason: String)

func _ready() -> void:
	# Ensure parent has area detection if needed
	if get_parent() is Area2D:
		var area = get_parent() as Area2D
		area.area_entered.connect(_on_area_entered)
		area.area_exited.connect(_on_area_exited)

func can_interact() -> bool:
	if not is_active:
		return false
	
	# Check cooldown
	if not can_repeat:
		var time_since_last = Time.get_ticks_msec() / 1000.0 - last_interaction_time
		if time_since_last < cooldown:
			return false
	
	return true

func interact(actor: Node) -> bool:
	if not can_interact():
		interaction_failed.emit("Interaction on cooldown")
		return false
	
	# Check distance if actor is a CharacterBody2D
	if actor is CharacterBody2D:
		var distance = actor.global_position.distance_to(get_parent().global_position)
		if distance > interaction_range:
			interaction_failed.emit("Too far away")
			return false
	
	interaction_started.emit(self)
	
	# Call interaction-specific handler on parent
	if get_parent().has_method("on_interact"):
		get_parent().on_interact(actor, self)
	
	last_interaction_time = Time.get_ticks_msec() / 1000.0
	interaction_completed.emit(self)
	
	EventBus.hud_updated.emit()
	
	return true

func set_active(active: bool) -> void:
	is_active = active

func get_interaction_data() -> Dictionary:
	return {
		"type": interaction_type,
		"prompt": interaction_prompt,
		"range": interaction_range
	}

func _on_area_entered(area: Area2D) -> void:
	# Show prompt when player enters range
	if area.get_parent().name == "Player":
		InteractPromptController.show_prompt(self, get_parent().global_position)

func _on_area_exited(area: Area2D) -> void:
	# Hide prompt when player leaves range
	if area.get_parent().name == "Player":
		InteractPromptController.hide_prompt()
