extends Area2D
## Hitbox - Area that deals damage when it hits a Hurtbox

class_name Hitbox

var damage: float = 10.0
var owner_team: String = "player"  # "player", "enemy", "ally"
var knockback_force: float = 200.0
var hit_stop_duration: float = 0.1

var already_hit: Array = []  # Track what we've already hit this swing

func _ready() -> void:
	area_entered.connect(_on_area_entered)

func _on_area_entered(area: Area2D) -> void:
	if area is Hurtbox and area not in already_hit:
		# Check if we can hit this team
		if _can_hit(area.owner_team):
			already_hit.append(area)
			
			# Let the hurtbox handle damage
			area.area_entered.emit(self)
			
			# Apply knockback to target
			if area.get_parent() is CharacterBody2D:
				var knockback_dir = (area.global_position - global_position).normalized()
				area.get_parent().velocity = knockback_dir * knockback_force

func _can_hit(target_team: String) -> bool:
	# Player/ally can hit enemies
	if owner_team in ["player", "ally"] and target_team == "enemy":
		return true
	# Enemy can hit player/ally
	if owner_team == "enemy" and target_team in ["player", "ally"]:
		return true
	return false

func reset_hit_targets() -> void:
	already_hit.clear()

func set_damage(new_damage: float) -> void:
	damage = new_damage
