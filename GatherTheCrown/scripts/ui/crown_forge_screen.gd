extends Control
## Crown Forge Screen UI
## Allows player to craft and equip crowns

func _ready() -> void:
	print("Crown Forge Screen opened")
	EventBus.screen_opened.emit("CrownForge")

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		SceneRouter.close_screen(self)

func craft_crown(components: Array) -> void:
	print("Crafting crown with components: ", components)

	if components.is_empty():
		print("No crown selected for craft.")
		return

	var crown_id := String(components[0])
	if not CrownProgressionSystem.can_complete_crown(crown_id):
		print("Crown cannot be crafted yet: %s" % crown_id)
		return

	if CrownProgressionSystem.complete_crown(crown_id):
		print("Crown crafted: %s" % crown_id)

func equip_crown(crown_id: String) -> void:
	if not InventorySystem.has_item(crown_id, 1):
		print("Cannot equip crown not in inventory: %s" % crown_id)
		return

	print("Equipping crown: ", crown_id)
	GameState.selected_crown = crown_id
	EventBus.hud_updated.emit()
