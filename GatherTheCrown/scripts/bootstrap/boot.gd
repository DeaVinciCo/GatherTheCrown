extends Node
## Bootstrap script
## Initializes game systems and routes to first zone

const SMOKE_TEST_SCENE: String = "res://scenes/test/RuntimeSmokeTest.tscn"
const CHARACTER_CREATION_SCENE: String = "res://scenes/ui/CharacterCreation.tscn"
const DEFAULT_WORLD_SCENE: String = "res://scenes/world/ForestTrialsEntrance.tscn"

const ZONE_SCENE_BY_ID: Dictionary = {
	"greenwood_clearing": "res://scenes/world/GreenwoodClearing.tscn",
	"wooded_trail": "res://scenes/world/WoodedTrail.tscn",
	"forest_trials_entrance": "res://scenes/world/ForestTrialsEntrance.tscn",
	"forest_trials_sproutbound": "res://scenes/world/ForestTrials_Sproutbound.tscn",
	"forest_trials_emberroot": "res://scenes/world/ForestTrials_Emberroot.tscn",
	"forest_trials_crownfire": "res://scenes/world/ForestTrials_Crownfire.tscn",
	"crownride_circuit": "res://scenes/world/CrownrideCircuit.tscn",
	# Legacy save value from earlier builds.
	"forest_trials_path": "res://scenes/world/ForestTrials_Sproutbound.tscn"
}

func _ready() -> void:
	var args := OS.get_cmdline_args()
	if args.has("--smoke-test"):
		await get_tree().process_frame
		SceneRouter.go_to_zone(SMOKE_TEST_SCENE)
		return
	
	# Wait one frame to ensure all autoloads are fully initialized.
	await get_tree().process_frame
	
	if SaveManager.has_save():
		SaveManager.load_game()
	
	if not GameState.has_hero_profile():
		SceneRouter.go_to_zone(CHARACTER_CREATION_SCENE)
		return

	var start_scene := _resolve_start_scene()
	SceneRouter.go_to_zone(start_scene)

func _resolve_start_scene() -> String:
	var saved_zone := String(GameState.current_zone).strip_edges()
	if saved_zone != "":
		var zone_id := saved_zone.to_snake_case().to_lower()
		if ZONE_SCENE_BY_ID.has(zone_id):
			var candidate_scene := String(ZONE_SCENE_BY_ID[zone_id])
			if ResourceLoader.exists(candidate_scene):
				return candidate_scene

	if ResourceLoader.exists(DEFAULT_WORLD_SCENE):
		return DEFAULT_WORLD_SCENE

	# Emergency fallback if default scene was moved/renamed.
	return "res://scenes/world/GreenwoodClearing.tscn"
