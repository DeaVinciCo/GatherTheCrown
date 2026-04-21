extends Node
## Manages Sync meter and Sync mode activation

var sync_meter: float = 0.0
var max_sync_meter: float = 100.0
var is_synced: bool = false
var sync_duration: float = 10.0  # seconds
var sync_timer: float = 0.0

var sync_bonuses: Dictionary = {
	"damage_multiplier": 1.5,
	"creat_attack_rate": 2.0,
	"speed_multiplier": 1.3
}

func _ready() -> void:
	print("SyncSystem initialized")

func _process(delta: float) -> void:
	if is_synced:
		sync_timer -= delta
		if sync_timer <= 0.0:
			deactivate_sync()

func gain_sync(amount: float) -> void:
	var old_meter = sync_meter
	sync_meter = clamp(sync_meter + amount, 0.0, max_sync_meter)
	
	if sync_meter != old_meter:
		EventBus.sync_meter_changed.emit(sync_meter, max_sync_meter)

func activate_sync() -> void:
	if is_synced:
		return
	
	is_synced = true
	sync_timer = sync_duration
	sync_meter = 0.0  # reset meter on activation
	
	EventBus.sync_activated.emit(null, null)
	print("SYNC MODE ACTIVATED!")

func deactivate_sync() -> void:
	is_synced = false
	sync_timer = 0.0
	
	EventBus.sync_deactivated.emit(null)
	print("Sync mode ended")

func get_sync_damage_multiplier() -> float:
	return sync_bonuses["damage_multiplier"] if is_synced else 1.0

func get_sync_speed_multiplier() -> float:
	return sync_bonuses["speed_multiplier"] if is_synced else 1.0
