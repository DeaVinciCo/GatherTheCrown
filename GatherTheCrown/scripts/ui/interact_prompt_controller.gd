extends CanvasLayer
## InteractPromptController - Shows interaction prompts above interactive objects
## Should be an autoload for global access

var current_prompt: Label = null
var current_interaction: InteractionComponent = null
var prompt_scene: PackedScene = null

signal prompt_shown(interaction: InteractionComponent)
signal prompt_hidden

func _ready() -> void:
	# Create prompt UI (simple label)
	var label = Label.new()
	label.text = "[E] Interact"
	label.add_theme_font_size_override("font_size", 16)
	label.add_theme_color_override("font_color", Color.YELLOW)
	label.z_index = 100
	add_child(label)
	current_prompt = label
	current_prompt.hide()
	
	print("InteractPromptController initialized")

func _process(_delta: float) -> void:
	# Keep prompt above object
	if current_prompt and current_prompt.visible and current_interaction:
		var parent = current_interaction.get_parent()
		if parent:
			current_prompt.global_position = parent.global_position + Vector2(-30, -50)

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_E:
		if current_interaction:
			var player = get_tree().get_first_node_in_group("player")
			if player and current_interaction.interact(player):
				get_tree().root.set_input_as_handled()

func show_prompt(interaction: InteractionComponent, world_position: Vector2) -> void:
	current_interaction = interaction
	current_prompt.text = "[E] %s" % interaction.interaction_prompt
	current_prompt.global_position = world_position + Vector2(-30, -50)
	current_prompt.show()
	prompt_shown.emit(interaction)

func hide_prompt() -> void:
	current_prompt.hide()
	current_interaction = null
	prompt_hidden.emit()

func get_current_interaction() -> InteractionComponent:
	return current_interaction
