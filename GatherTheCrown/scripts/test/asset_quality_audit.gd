extends Node
## Static asset quality audit helper for character, pet, enemy, and item visuals.
## Run via an in-editor script execution or attach to a one-off test scene.

const AUDIT_TARGETS := [
	"res://scenes/actors/player/Player.tscn",
	"res://scenes/actors/companion/FireCreat.tscn",
	"res://scenes/actors/enemies/Enemy.tscn",
	"res://scenes/actors/enemies/Boss.tscn",
	"res://scenes/world/MaterialGatherPoint.tscn"
]

func _ready() -> void:
	run_audit()

func run_audit() -> void:
	var failed := false
	for scene_path in AUDIT_TARGETS:
		var packed := load(scene_path) as PackedScene
		if packed == null:
			push_error("[AssetAudit] Missing scene: %s" % scene_path)
			failed = true
			continue

		var node := packed.instantiate()
		var missing := _collect_missing_requirements(node)
		if missing.size() > 0:
			push_warning("[AssetAudit] %s missing: %s" % [scene_path, ", ".join(missing)])
			failed = true
		node.queue_free()

	if failed:
		push_warning("[AssetAudit] Quality audit failed. Review warnings above.")
	else:
		print("[AssetAudit] All audited scenes pass baseline visual quality checks.")

func _collect_missing_requirements(node: Node) -> Array[String]:
	var missing: Array[String] = []

	if node is CharacterBody2D:
		if not node.has_node("Avatar") and not node.has_node("Sprite2D"):
			missing.append("avatar or sprite")
		if not node.has_node("Health"):
			missing.append("Health node")

	if node.name == "MaterialGatherPoint":
		if not node.has_node("Sprite2D") and not node.has_node("Model"):
			missing.append("item model")

	return missing
