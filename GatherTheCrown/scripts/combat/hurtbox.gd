extends Area2D
## Hurtbox - Area that receives damage when hit by a Hitbox

class_name Hurtbox

var health: Health
var owner_team: String = "player"  # "player", "enemy", "ally"
var is_invulnerable: bool = false
var invuln_timer: float = 0.0

func _ready() -> void:
	health = get_parent().get_node_or_null("Health")
	if not health:
		print("WARNING: Hurtbox has no Health component!")
	
	area_entered.connect(_on_area_entered)

func _process(delta: float) -> void:
	if is_invulnerable:
		invuln_timer -= delta
		if invuln_timer <= 0.0:
			is_invulnerable = false
			modulate = Color.WHITE

func _on_area_entered(area: Area2D) -> void:
	if area is Hitbox and not is_invulnerable:
		var damage_amount = area.damage
		if health:
			health.take_damage(damage_amount)
			EventBus.damage_dealt.emit(area.owner_team, owner_team, damage_amount, {})
		
		# Apply invulnerability
		set_invulnerable(0.3)

func set_invulnerable(duration: float) -> void:
	is_invulnerable = true
	invuln_timer = duration
	modulate = Color(1, 1, 1, 0.5)  # semi-transparent

func get_owner_team() -> String:
	return owner_team
