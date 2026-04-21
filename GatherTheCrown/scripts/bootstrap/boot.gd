extends Node
## Bootstrap script
## Initializes game systems and routes to first zone

func _ready() -> void:
	print("=== Gather The Crown Bootstrap ===")
	print("Initializing systems...")
	var args := OS.get_cmdline_args()
	if args.has("--smoke-test"):
		print("[Boot] Smoke test flag detected")
		await get_tree().process_frame
		SceneRouter.go_to_zone("res://scenes/test/RuntimeSmokeTest.tscn")
		return
	
	# Autoloads are already running
	print("[Boot] Waiting for process frame...")
	await get_tree().process_frame
	print("[Boot] Process frame complete")
	
	if SaveManager.has_save():
		print("[Boot] Save file found, loading...")
		SaveManager.load_game()
		print("[Boot] Save loaded successfully")
	else:
		print("[Boot] No save file found")
	
	print("[Boot] Checking hero profile...")
	if not GameState.has_hero_profile():
		print("[Boot] No hero profile found; loading character creation")
		await get_tree().create_timer(0.25).timeout
		print("[Boot] Routing to CharacterCreation...")
		SceneRouter.go_to_zone("res://scenes/ui/CharacterCreation.tscn")
		return

	# Route to Forest Trials Entrance as the default first playable world screen.
	print("[Boot] Hero profile found; loading ForestTrialsEntrance")
	await get_tree().create_timer(0.5).timeout
	print("[Boot] Routing to ForestTrialsEntrance...")
	SceneRouter.go_to_zone("res://scenes/world/ForestTrialsEntrance.tscn")
	print("[Boot] Scene routing initiated")
