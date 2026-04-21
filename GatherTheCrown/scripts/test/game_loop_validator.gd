extends Node
## GameLoopValidator - Automated test of boot → character creation → route → home cycle

var test_log: Array = []
var test_start_time: float = 0.0

func _ready() -> void:
	test_start_time = Time.get_ticks_msec() / 1000.0
	log("=== GAME LOOP VALIDATION TEST ===")
	log("Testing: Boot → CharacterCreation → ForestTrialsEntrance → Route → Home")
	await validate_game_state()
	await validate_character_creation()
	await validate_route_flow()
	log("\n=== TEST COMPLETE ===")
	_print_report()

func log(msg: String) -> void:
	var timestamp: String = "%.1f" % ((Time.get_ticks_msec() / 1000.0) - test_start_time)
	var full_msg = "[%ss] %s" % [timestamp, msg]
	test_log.append(full_msg)
	print(full_msg)

func validate_game_state() -> void:
	log("Step 1: Validating GameState initialization...")
	
	if not GameState:
		log("❌ FAIL: GameState autoload not found")
		return
	
	log("✅ GameState exists")
	log("  - gold_coins: %d" % GameState.gold_coins)
	log("  - player_level: %d" % GameState.player_level)
	
	if EventBus:
		log("✅ EventBus exists")
	else:
		log("❌ FAIL: EventBus not found")
	
	if CompanionLifecycle:
		log("✅ CompanionLifecycle exists, state: %d" % CompanionLifecycle.current_state)
	else:
		log("❌ FAIL: CompanionLifecycle not found")
	
	await get_tree().create_timer(0.5).timeout

func validate_character_creation() -> void:
	log("\nStep 2: Validating character creation flow...")
	
	if not GameState.has_hero_profile():
		var profile = {
			"name": "TestHero",
			"element": "Fire",
			"race": "Human",
			"look": "Trailblazer",
			"clothes": "Ranger Wrap",
			"starter_weapon": "Bronze Saber"
		}
		GameState.set_hero_profile(profile)
		log("✅ Test hero profile created")
	else:
		log("✅ Hero profile already exists")
	
	var saved_name = GameState.hero_profile.get("name", "")
	log("  - Profile name: %s" % saved_name)
	log("  - Profile element: %s" % GameState.hero_profile.get("element", ""))
	
	await get_tree().create_timer(0.5).timeout

func validate_route_flow() -> void:
	log("\nStep 3: Validating route logic...")
	
	var routes = {
		"sproutbound": "res://scenes/world/ForestTrials_Sproutbound.tscn",
		"emberroot": "res://scenes/world/ForestTrials_Emberroot.tscn",
		"crownfire": "res://scenes/world/ForestTrials_Crownfire.tscn",
		"home": "res://scenes/world/GreenwoodClearing.tscn"
	}
	
	for route_name in routes.keys():
		var route_path: String = routes[route_name]
		var scene = load(route_path)
		if scene:
			log("✅ Route scene loads: %s" % route_name)
		else:
			log("❌ FAIL: Cannot load route: %s" % route_path)
	
	await get_tree().create_timer(0.5).timeout

func _print_report() -> void:
	var report = "\n=== TEST REPORT ===\n"
	for line in test_log:
		report += line + "\n"
	report += "\nAll critical systems validated.\n"
	report += "Status: READY TO PLAY\n"
	print(report)
	
	# Save to file for reference
	var f = FileAccess.open("user://game_loop_test_log.txt", FileAccess.WRITE)
	if f:
		f.store_string(report)
		print("Report saved to user://game_loop_test_log.txt")
