extends Node2D
## Generic stub for game modes not yet fully implemented.
## Shows a placeholder message and returns to GreenwoodClearing on Escape.

@export var mode_name: String = "Game Mode"
@export var unlock_condition: String = ""  # e.g. "story_completed_once"

func _ready() -> void:
	print("%s stub loaded" % mode_name)
	# Unlock check
	if unlock_condition == "story_completed_once" and not GameState.story_completed_once:
		_show_locked()

func _process(_delta: float) -> void:
	if Input.is_action_just_pressed("ui_cancel"):
		SceneRouter.go_to_zone("res://scenes/world/GreenwoodClearing.tscn")

func _show_locked() -> void:
	var lbl = get_node_or_null("LockedLabel")
	if lbl:
		lbl.text = "[LOCKED] Complete Story Mode once to unlock %s." % mode_name
