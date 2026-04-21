extends Node
## CompanionLifecycle - Manages creat egg  hatching  active companion states
## Tracks: No Creat  Egg Acquired  Egg Care  Egg Hatched  Creat Active
##
## The creat's element is NOT predetermined  the player chooses it when the egg
## is found via EggElementPicker. egg_type is set at that moment.

enum LifecycleState {
	NO_CREAT,           # Game start - no companion
	EGG_ACQUIRED,       # Found egg but not in care yet
	EGG_IN_CARE,        # Egg acquired, care begins, neglect timer active
	EGG_HATCHING,       # Egg near hatch, showing visual signs
	CREAT_ACTIVE        # Creat fully hatched, always-present companion
}

## Scene paths keyed by creat element id.
## Non-fire types fall back to FireCreat.tscn until their own scenes are built.
const ELEMENT_SCENE_PATHS: Dictionary = {
	"fire_creat":   "res://scenes/actors/companion/FireCreat.tscn",
	"ice_creat":    "res://scenes/actors/companion/FireCreat.tscn",
	"earth_creat":  "res://scenes/actors/companion/FireCreat.tscn",
	"storm_creat":  "res://scenes/actors/companion/FireCreat.tscn",
	"shadow_creat": "res://scenes/actors/companion/FireCreat.tscn",
}

static func get_creat_scene_path(creat_type: String) -> String:
	return ELEMENT_SCENE_PATHS.get(creat_type, "res://scenes/actors/companion/FireCreat.tscn")

var current_state: LifecycleState = LifecycleState.NO_CREAT
var egg_type: String = ""  # Set by player choice via EggElementPicker when egg is found
var care_start_time: float = 0.0
var neglect_timer: float = 0.0  # Increases if egg not cared for
var hatch_progress: float = 0.0  # 0.0 to 1.0

@export var neglect_threshold: float = 100.0  # Egg dies if neglect > this
@export var hatch_duration: float = 300.0  # Seconds to hatch from acquire
@export var feed_reduces_neglect: float = 20.0  # How much feed reduces neglect

signal state_changed(new_state: LifecycleState)
signal egg_acquired(egg_type: String)
signal egg_hatched(creat_type: String)
signal egg_neglected()  # Warning signal
signal egg_died()  # Egg dies from neglect

func _ready() -> void:
	print("CompanionLifecycle initialized: %s" % LifecycleState.keys()[current_state])
	if GameState.has_creat:
		current_state = LifecycleState.CREAT_ACTIVE
		print("Creat already active (loaded from save)")

func _process(delta: float) -> void:
	match current_state:
		LifecycleState.EGG_IN_CARE:
			# Egg in care - increase neglect over time
			neglect_timer += delta * 0.5  # Slow neglect increase
			hatch_progress = min(1.0, hatch_progress + delta / hatch_duration)
			
			# Check if egg dies from neglect
			if neglect_timer > neglect_threshold:
				die_from_neglect()
			
			# Check if egg is ready to hatch
			if hatch_progress >= 1.0 and current_state == LifecycleState.EGG_IN_CARE:
				begin_hatching()
		
		LifecycleState.EGG_HATCHING:
			# Auto-complete hatch when in hatching state (immediate for MVP)
			complete_hatch()
func acquire_egg(egg_type_param: String) -> void:
	"""Player found an egg during exploration"""
	if current_state != LifecycleState.NO_CREAT:
		print("ERROR: Already have egg or creat!")
		return
	
	egg_type = egg_type_param
	current_state = LifecycleState.EGG_ACQUIRED
	state_changed.emit(current_state)
	egg_acquired.emit(egg_type)
	
	print("Egg acquired: %s" % egg_type)
	EventBus.hud_updated.emit()

func begin_care() -> void:
	"""Player brings egg home and begins care"""
	if current_state != LifecycleState.EGG_ACQUIRED:
		print("ERROR: Egg not acquired yet!")
		return
	
	current_state = LifecycleState.EGG_IN_CARE
	care_start_time = Time.get_ticks_msec() / 1000.0
	neglect_timer = 0.0
	state_changed.emit(current_state)
	
	print("Beginning egg care: %s" % egg_type)
	EventBus.hud_updated.emit()

func feed_egg() -> void:
	"""Player feeds the egg - reduces neglect"""
	if current_state != LifecycleState.EGG_IN_CARE:
		print("Cannot feed egg in current state: %s" % LifecycleState.keys()[current_state])
		return
	
	neglect_timer = max(0.0, neglect_timer - feed_reduces_neglect)
	BondSystem.add_bond_xp(10)  # Bonding through care
	
	print("Fed egg. Neglect reduced to: %.1f" % neglect_timer)
	EventBus.hud_updated.emit()

func begin_hatching() -> void:
	"""Egg is ready to hatch - visual signs appear"""
	if current_state != LifecycleState.EGG_IN_CARE:
		return
	
	current_state = LifecycleState.EGG_HATCHING
	state_changed.emit(current_state)
	
	print("Egg is hatching!")
	EventBus.hud_updated.emit()

func complete_hatch() -> void:
	"""Egg completes hatch - creat becomes active companion"""
	if current_state != LifecycleState.EGG_HATCHING:
		return
	
	current_state = LifecycleState.CREAT_ACTIVE
	GameState.has_creat = true
	GameState.record_first_creat_if_needed(egg_type)
	state_changed.emit(current_state)
	egg_hatched.emit(egg_type)
	
	# Spawn creat into scene
	_spawn_creat_companion()
	
	print("Creat hatched and active: %s" % egg_type)
	EventBus.hud_updated.emit()

func die_from_neglect() -> void:
	"""Egg dies from lack of care"""
	current_state = LifecycleState.NO_CREAT
	egg_type = ""
	state_changed.emit(current_state)
	egg_died.emit()
	
	print("ERROR: Egg died from neglect!")
	EventBus.hud_updated.emit()

func _spawn_creat_companion() -> void:
	"""Spawn the creat into the current scene"""
	var scene_path = "res://scenes/actors/companion/FireCreat.tscn"
	if egg_type == "fire_creat":
		scene_path = "res://scenes/actors/companion/FireCreat.tscn"
	
	var creat_scene = load(scene_path)
	if creat_scene:
		var creat = creat_scene.instantiate()
		# Add to current scene root (get the scene that owns Player)
		var current_scene = get_tree().root.get_child(get_tree().root.get_child_count() - 1)
		current_scene.add_child(creat)
		# Spawn offset from player
		var player = current_scene.get_node_or_null("Player")
		if player:
			creat.global_position = player.global_position + Vector2(50, 0)
		else:
			creat.global_position = GameState.player_position + Vector2(50, 0)
		print("Creat spawned at: %s" % creat.global_position)
	else:
		print("ERROR: Could not load FireCreat scene")

func get_state_name() -> String:
	return LifecycleState.keys()[current_state]

func get_hatch_time_remaining() -> float:
	"""Returns seconds until hatch (for UI)"""
	return max(0.0, hatch_duration - (hatch_progress * hatch_duration))

func get_neglect_percentage() -> float:
	"""Returns neglect as 0-100% (for UI)"""
	return (neglect_timer / neglect_threshold) * 100.0



