extends Node


func _ready() -> void:
	print("=== DEBUG CHECKS START ===")

	# --- INVENTORY SYSTEM ---
	print("\n[Inventory]")
	print(
		"Total STRUCTURAL items:",
		AdvancedInventorySystem.get_items_in_category(
			AdvancedInventorySystem.ItemCategory.STRUCTURAL
		).size()
	)

	print(
		"Total MEALS items:",
		AdvancedInventorySystem.get_items_in_category(
			AdvancedInventorySystem.ItemCategory.MEALS
		).size()
	)

	print("Inventory capacity:", AdvancedInventorySystem.max_slots)
	print("Storage capacity:", AdvancedInventorySystem.max_home_slots)
	print("Used inventory slots:", AdvancedInventorySystem.get_used_slots("player"))
	print("Used storage slots:", AdvancedInventorySystem.get_used_slots("home"))

	# --- KEYRING ---
	print("\n[Keyring]")
	print("Trail keys:", AdvancedInventorySystem.get_key_count("trail"))
	print("Town keys:", AdvancedInventorySystem.get_key_count("town"))
	print("Kingdom keys:", AdvancedInventorySystem.get_key_count("kingdom"))

	# --- KINGDOM FINDINGS ---
	print("\n[Kingdom Findings]")
	print(
		"Rider findings:",
		KingdomFindingsSystem.get_findings_by_category(
			KingdomFindingsSystem.FindingCategory.RIDER
		).size()
	)

	print(
		"Town findings:",
		KingdomFindingsSystem.get_findings_by_category(
			KingdomFindingsSystem.FindingCategory.TOWN
		).size()
	)

	print(
		"Kingdom findings:",
		KingdomFindingsSystem.get_findings_by_category(
			KingdomFindingsSystem.FindingCategory.KINGDOM
		).size()
	)
	print("Total restoration value:", KingdomFindingsSystem.get_total_kingdom_restoration_value())

	# --- CHECKPOINT SYSTEM ---
	print("\n[Checkpoints]")
	print("Current checkpoint:", CheckpointSystem.get_current_checkpoint())
	print("Checkpoint history size:", CheckpointSystem.get_checkpoint_history().size())

	# --- DAY/NIGHT ---
	print("\n[Day/Night]")
	print("Current time label:", DayNightCycle.get_time_label())
	print("Current phase:", DayNightCycle.phase_name)
	print("Is daytime:", DayNightCycle.is_day)

	# --- GAME STATE ---
	print("\n[GameState]")
	print("Has creat:", GameState.has_creat)
	print("Inventory player level:", AdvancedInventorySystem.player_level)
	print("Current zone:", GameState.current_zone)
	print("Hero profile set:", GameState.has_hero_profile())

	print("\n=== DEBUG CHECKS END ===")

	queue_free()
