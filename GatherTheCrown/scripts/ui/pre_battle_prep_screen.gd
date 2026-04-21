extends Control
## Pre-Battle Prep Screen
## Shows before boss encounters
## Allows feeding creat, changing crown, setting sync focus

var can_confirm: bool = false

func _ready() -> void:
	print("Pre-Battle Prep opened")
	EventBus.screen_opened.emit("PreBattlePrep")

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		SceneRouter.close_screen(self)
	elif event is InputEventKey and event.pressed and event.keycode == KEY_ENTER:
		if can_confirm:
			begin_battle()

func feed_creat_for_battle() -> void:
	if InventorySystem.has_item("food_basic", 2):
		InventorySystem.remove_item("food_basic", 2)
		BondSystem.decrease_hunger(CompanionLifecycle.egg_type, 40)
		print("Creat fed before battle!")
		SyncSystem.gain_sync(10.0)
	else:
		print("Not enough food!")

func choose_crown(crown_id: String) -> void:
	GameState.selected_crown = crown_id
	print("Selected crown for battle: ", crown_id)

func set_sync_focus(focus: String) -> void:
	# focus: "damage", "defense", "speed"
	print("Sync focus set to: ", focus)

func begin_battle() -> void:
	print("Beginning boss battle!")
	EventBus.boss_started.emit("boss_name")
	SceneRouter.close_screen(self)
