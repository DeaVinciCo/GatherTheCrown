extends Control

const PASS_COLOR := Color(0.55, 0.92, 0.60)
const FAIL_COLOR := Color(1.0, 0.45, 0.45)
const INFO_COLOR := Color(0.85, 0.88, 0.95)

@onready var output_label: RichTextLabel = $Panel/MarginContainer/Output

var _failures: Array[String] = []
var _phase_events: Array[String] = []
var _night_started_count: int = 0
var _day_started_count: int = 0

func _ready() -> void:
	_run_async()

func _run_async() -> void:
	await get_tree().process_frame
	_log("Runtime smoke test started", INFO_COLOR)
	_prepare_clean_state()
	_connect_day_night_signals()
	_run_inventory_smoke()
	_run_checkpoint_smoke()
	_run_findings_smoke()
	_run_day_night_smoke()
	_finish()

func _prepare_clean_state() -> void:
	SaveManager.delete_save()
	GameState.reset()
	GameState.set_hero_profile({
		"name": "Smoke Tester",
		"element": "Fire",
		"race": "Human",
		"look": "Trailblazer",
		"clothes": "Ranger Wrap",
		"starter_weapon": "Bronze Saber"
	})
	GameState.discovered_zones = {"greenwood_clearing": true}
	GameState.flags = {
		"completed_tutorial": false,
		"defeated_first_boss": false,
		"visited_restoration_site": false
	}
	GameState.selected_crown = ""
	GameState.player_position = Vector2(640, 300)
	GameState.current_zone = "GreenwoodClearing"

	AdvancedInventorySystem.player_inventory.clear()
	AdvancedInventorySystem.home_storage.clear()
	AdvancedInventorySystem.keyring = {
		"trail_key": 0,
		"town_key": 0,
		"kingdom_key": 0
	}
	AdvancedInventorySystem._update_capacity_for_level(1)

	CheckpointSystem.checkpoints.clear()
	CheckpointSystem.current_checkpoint = ""
	CheckpointSystem.checkpoint_history.clear()

	KingdomFindingsSystem.discovered_findings.clear()
	KingdomFindingsSystem.pending_deliveries.clear()
	KingdomFindingsSystem.completed_deliveries.clear()
	for finding_id in KingdomFindingsSystem.findings:
		var finding = KingdomFindingsSystem.findings[finding_id]
		finding.discovered = false
		finding.found_date = 0.0

	RestorationSystem.load_restoration_state()
	DayNightCycle.elapsed = 0.0
	DayNightCycle._prev_phase = ""
	DayNightCycle.phase_name = "day"
	DayNightCycle.is_day = true

	_log("State reset complete", INFO_COLOR)

func _connect_day_night_signals() -> void:
	if not DayNightCycle.phase_changed.is_connected(_on_phase_changed):
		DayNightCycle.phase_changed.connect(_on_phase_changed)
	if not DayNightCycle.night_started.is_connected(_on_night_started):
		DayNightCycle.night_started.connect(_on_night_started)
	if not DayNightCycle.day_started.is_connected(_on_day_started):
		DayNightCycle.day_started.connect(_on_day_started)

func _run_inventory_smoke() -> void:
	_log("Inventory smoke", INFO_COLOR)
	_expect(AdvancedInventorySystem.add_item("bread_loaf", 5), "add bread_loaf to player inventory")
	_expect(AdvancedInventorySystem.remove_item("bread_loaf", 2), "remove two bread_loaf")
	_expect(AdvancedInventorySystem.add_item("glass_shard", 40, "home"), "add glass_shard to home storage")
	_expect(AdvancedInventorySystem.add_item("key_town", 1), "route key_town into keyring")
	AdvancedInventorySystem._update_capacity_for_level(10)
	_expect_eq(AdvancedInventorySystem.get_item_count("bread_loaf"), 3, "bread_loaf stack count after add/remove")
	_expect_eq(AdvancedInventorySystem.get_item_count("glass_shard", "home"), 40, "home storage glass_shard count")
	_expect_eq(AdvancedInventorySystem.get_key_count("town_key"), 1, "town_key keyring count")
	_expect_eq(AdvancedInventorySystem.max_slots, 125, "player inventory slots at level 10")
	_expect_eq(AdvancedInventorySystem.max_home_slots, 400, "home storage slots at level 10")

	SaveManager.save_game()

	AdvancedInventorySystem.player_inventory.clear()
	AdvancedInventorySystem.home_storage.clear()
	AdvancedInventorySystem.keyring = {
		"trail_key": 0,
		"town_key": 0,
		"kingdom_key": 0
	}
	AdvancedInventorySystem._update_capacity_for_level(1)
	SaveManager.load_game()

	_expect_eq(AdvancedInventorySystem.get_item_count("bread_loaf"), 3, "bread_loaf persists after reload")
	_expect_eq(AdvancedInventorySystem.get_item_count("glass_shard", "home"), 40, "home storage persists after reload")
	_expect_eq(AdvancedInventorySystem.get_key_count("town_key"), 1, "keyring persists after reload")
	_expect_eq(AdvancedInventorySystem.max_slots, 125, "inventory capacity persists after reload")

func _run_checkpoint_smoke() -> void:
	_log("Checkpoint smoke", INFO_COLOR)
	CheckpointSystem.create_journey_checkpoint(
		"smoke_journey",
		"ForestTrialsEntrance",
		Vector2(100, 200),
		{"progress": "smoke_start", "paths": ["hidden_trail"], "quest_stage": "journey_1"}
	)
	CheckpointSystem.create_battle_checkpoint(
		"smoke_battle",
		"BossPrepSpace",
		Vector2(200, 300),
		{"boss_id": "forest_alpha", "boss_name": "Forest Alpha", "equipped_crown": "ember_crown", "loadout": {"bread_loaf": 3}, "consumables": {"potion_health": 1}}
	)
	CheckpointSystem.create_restoration_checkpoint(
		"smoke_restoration",
		"RestorationSite_01",
		Vector2(300, 400),
		{"site_id": "restoration_site_01", "cleared": true, "structures": ["lamp", "bridge"], "tier": 2}
	)
	_expect_eq(CheckpointSystem.checkpoints.size(), 3, "three checkpoint types created")

	SaveManager.save_game()
	CheckpointSystem.checkpoints.clear()
	CheckpointSystem.current_checkpoint = ""
	CheckpointSystem.checkpoint_history.clear()
	GameState.discovered_zones.erase("hidden_trail")
	GameState.selected_crown = ""
	RestorationSystem.load_restoration_state()
	SaveManager.load_game()

	_expect_eq(CheckpointSystem.checkpoints.size(), 3, "checkpoints persist after reload")
	_expect(CheckpointSystem.load_checkpoint("smoke_journey"), "load journey checkpoint")
	_expect(GameState.discovered_zones.get("hidden_trail", false), "journey checkpoint restores discovered path")
	_expect(CheckpointSystem.load_checkpoint("smoke_battle"), "load battle checkpoint")
	_expect_eq(GameState.selected_crown, "ember_crown", "battle checkpoint restores equipped crown")
	_expect(CheckpointSystem.load_checkpoint("smoke_restoration"), "load restoration checkpoint")
	_expect_eq(RestorationSystem.restoration_sites["restoration_site_01"]["state"], "restored", "restoration checkpoint restores site state")

func _run_findings_smoke() -> void:
	_log("Kingdom findings smoke", INFO_COLOR)
	_expect(KingdomFindingsSystem.discover_finding("rider_food_cache"), "discover Rider finding")
	_expect(KingdomFindingsSystem.discover_finding("town_lamp_oil"), "discover Town finding")
	_expect(KingdomFindingsSystem.discover_finding("kingdom_gate_key"), "discover Kingdom finding")
	_expect(KingdomFindingsSystem.deliver_finding_to_npc("town_lamp_oil", "innkeeper_main"), "deliver Town finding to requested NPC")
	_expect_eq(KingdomFindingsSystem.get_delivery_count_for_npc("innkeeper_main"), 1, "NPC delivery count before reload")
	_expect_eq(KingdomFindingsSystem.get_total_kingdom_restoration_value(), 15, "restoration value counts delivered finding")

	SaveManager.save_game()

	KingdomFindingsSystem.discovered_findings.clear()
	KingdomFindingsSystem.pending_deliveries.clear()
	KingdomFindingsSystem.completed_deliveries.clear()
	for finding_id in KingdomFindingsSystem.findings:
		var finding = KingdomFindingsSystem.findings[finding_id]
		finding.discovered = false
		finding.found_date = 0.0
	SaveManager.load_game()

	_expect_eq(KingdomFindingsSystem.discovered_findings.get("rider_food_cache", 0), 1, "Rider finding persists after reload")
	_expect_eq(KingdomFindingsSystem.discovered_findings.get("kingdom_gate_key", 0), 1, "Kingdom finding persists after reload")
	_expect_eq(KingdomFindingsSystem.get_delivery_count_for_npc("innkeeper_main"), 1, "delivered Town finding persists after reload")
	_expect_eq(KingdomFindingsSystem.get_total_kingdom_restoration_value(), 15, "restoration value persists after reload")

func _run_day_night_smoke() -> void:
	_log("Day/night smoke", INFO_COLOR)
	_phase_events.clear()
	_night_started_count = 0
	_day_started_count = 0
	DayNightCycle._prev_phase = ""

	DayNightCycle.elapsed = 600.0
	DayNightCycle._process(0.0)
	_expect_eq(DayNightCycle.phase_name, "day", "day phase can be entered in-scene")

	DayNightCycle.elapsed = DayNightCycle.DAY_DURATION - (DayNightCycle.TRANSITION_WINDOW / 2.0)
	DayNightCycle._process(0.0)
	_expect_eq(DayNightCycle.phase_name, "dusk", "dusk phase can be entered in-scene")
	_expect(DayNightCycle.get_overlay_color().a > 0.0, "dusk overlay alpha is visible")
	_expect(String(DayNightCycle.get_time_label()).begins_with(" Day"), "day label renders during dusk segment")

	DayNightCycle.elapsed = DayNightCycle.DAY_DURATION - 0.1
	DayNightCycle._process(0.2)
	_expect_eq(DayNightCycle.phase_name, "night", "night phase reached after day boundary")
	_expect(_night_started_count > 0, "night_started signal fired")
	_expect(_phase_events.has("day") and _phase_events.has("dusk") and _phase_events.has("night"), "phase_changed fired for day, dusk, and night")
	_expect(DayNightCycle.get_overlay_color().a >= 0.42, "night overlay alpha is strong enough")
	_expect(String(DayNightCycle.get_time_label()).begins_with(" Night"), "night label renders")

func _expect(condition: bool, label: String) -> void:
	if condition:
		_log("PASS  " + label, PASS_COLOR)
	else:
		_failures.append(label)
		_log("FAIL  " + label, FAIL_COLOR)

func _expect_eq(actual, expected, label: String) -> void:
	_expect(actual == expected, "%s | expected=%s actual=%s" % [label, str(expected), str(actual)])

func _log(message: String, color: Color = INFO_COLOR) -> void:
	var bbcode := "[color=#%s]%s[/color]" % [color.to_html(false), message]
	if is_instance_valid(output_label):
		output_label.append_text(bbcode + "\n")
	print("[SmokeTest] %s" % message)

func _finish() -> void:
	if _failures.is_empty():
		_log("Smoke test complete: PASS", PASS_COLOR)
		_log("Run this scene directly or start the project with --smoke-test.", INFO_COLOR)
	else:
		_log("Smoke test complete: FAIL (%d issues)" % _failures.size(), FAIL_COLOR)
		for failure in _failures:
			_log("  - " + failure, FAIL_COLOR)

func _on_phase_changed(new_phase: String) -> void:
	_phase_events.append(new_phase)

func _on_night_started() -> void:
	_night_started_count += 1

func _on_day_started() -> void:
	_day_started_count += 1
