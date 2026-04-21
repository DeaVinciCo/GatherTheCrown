extends Node
## Interactable - Base class for interactive world objects
## Inherit from this and override on_interact() for custom behavior

class_name Interactable

@export var display_name: String = "Object"
@export var is_one_time: bool = false  # Can only interact once
@export var interaction_type: String = "generic"

var has_interacted: bool = false
var interaction_component: InteractionComponent

signal interacted(actor: Node)

func _ready() -> void:
	interaction_component = $InteractionComponent
	if interaction_component:
		interaction_component.interaction_started.connect(_on_interaction_started)
		interaction_component.interaction_completed.connect(_on_interaction_completed)

func on_interact(actor: Node, component: InteractionComponent) -> void:
	if is_one_time and has_interacted:
		component.interaction_failed.emit("Already used")
		return
	
	has_interacted = true
	interacted.emit(actor)
	
	print("%s interacted with %s" % [actor.name, display_name])

func _on_interaction_started(_component: InteractionComponent) -> void:
	# Called when interaction starts (can be used for visual feedback)
	pass

func _on_interaction_completed(_component: InteractionComponent) -> void:
	# Called when interaction completes
	EventBus.hud_updated.emit()

func reset() -> void:
	has_interacted = false
