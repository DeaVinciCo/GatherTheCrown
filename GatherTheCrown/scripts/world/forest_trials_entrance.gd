extends Node2D
## ForestTrialsEntrance - Opening scene where player chooses their early path
## Trial route, direct home, or forage route

var player: Node
var selected_route: String = ""

const ROUTES := {
	"sproutbound": {
		"scene": "res://scenes/world/ForestTrials_Sproutbound.tscn",
		"label": "Sproutbound Trail",
		"time": "6-9 min",
		"encounters": "3-4 encounters"
	},
	"emberroot": {
		"scene": "res://scenes/world/ForestTrials_Emberroot.tscn",
		"label": "Emberroot Passage",
		"time": "10-14 min",
		"encounters": "4-5 encounters"
	},
	"crownfire": {
		"scene": "res://scenes/world/ForestTrials_Crownfire.tscn",
		"label": "Crownfire Gauntlet",
		"time": "14-18 min",
		"encounters": "6 encounters"
	},
	"forage": {
		"scene": "res://scenes/world/WoodedTrail.tscn",
		"label": "Whispergrove Forage",
		"time": "10-15 min",
		"encounters": "2-4 light encounters + scavenging"
	},
	"home": {
		"scene": "res://scenes/world/GreenwoodClearing.tscn",
		"label": "Sanctuary Return",
		"time": "instant",
		"encounters": "no trials"
	}
}

func _ready() -> void:
	print("=== Forest Trials Entrance ===")
	# Spawn player without creat
	var player_scene = load("res://scenes/actors/player/Player.tscn")
	if player_scene:
		player = player_scene.instantiate()
		add_child(player)
		player.global_position = Vector2(640, 300)
		player.add_to_group("player")
		print("Player spawned (no creat yet)")
	
	# Listen for route selection
	CompanionLifecycle.state_changed.connect(_on_lifecycle_changed)
	CompanionLifecycle.egg_acquired.connect(_on_egg_found)

func _process(_delta: float) -> void:
	if Input.is_key_pressed(KEY_ESCAPE):
		SceneRouter.go_to_zone("res://scenes/world/GreenwoodClearing.tscn")

func _unhandled_input(event: InputEvent) -> void:
	if selected_route != "":
		return

	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_1:
			select_route("sproutbound")
			get_viewport().set_input_as_handled()
		elif event.keycode == KEY_2:
			select_route("emberroot")
			get_viewport().set_input_as_handled()
		elif event.keycode == KEY_3:
			select_route("crownfire")
			get_viewport().set_input_as_handled()
		elif event.keycode == KEY_4:
			select_route("forage")
			get_viewport().set_input_as_handled()
		elif event.keycode == KEY_5:
			select_route("home")
			get_viewport().set_input_as_handled()

func select_route(route: String) -> void:
	if selected_route != "":
		return  # Already selected
	if not ROUTES.has(route):
		return
	
	selected_route = route
	var route_scene := String(ROUTES[route]["scene"])
	print("[ForestTrialsEntrance] Route selected: %s" % route)
	print("[ForestTrialsEntrance] Route destination path: %s" % route_scene)
	await get_tree().create_timer(0.35).timeout
	SceneRouter.go_to_zone(route_scene)

func _on_lifecycle_changed(new_state: int) -> void:
	# When egg is hatched, auto-route to home base
	if new_state == CompanionLifecycle.LifecycleState.CREAT_ACTIVE:
		print("Creat active! Routing to home base...")
		await get_tree().create_timer(1.0).timeout
		SceneRouter.go_to_zone("res://scenes/world/GreenwoodClearing.tscn")

func _on_egg_found(egg_type: String) -> void:
	print("Egg found: %s" % egg_type)
	# Show visual feedback
	EventBus.hud_updated.emit()
