extends Node
## Health component - tracks HP and death

class_name Health

signal health_changed(current: float, max_hp: float)
signal died

var current_hp: float = 100.0
var max_hp: float = 100.0
var is_dead: bool = false

func _ready() -> void:
	current_hp = max_hp

func take_damage(amount: float) -> void:
	if is_dead:
		return
	
	current_hp = max(0, current_hp - amount)
	health_changed.emit(current_hp, max_hp)
	
	if current_hp <= 0:
		is_dead = true
		died.emit()
		print(get_parent().name, " died!")

func heal(amount: float) -> void:
	if is_dead:
		return
	
	current_hp = min(max_hp, current_hp + amount)
	health_changed.emit(current_hp, max_hp)

func get_health_percent() -> float:
	if max_hp <= 0:
		return 0.0
	return current_hp / max_hp

func is_alive() -> bool:
	return not is_dead
