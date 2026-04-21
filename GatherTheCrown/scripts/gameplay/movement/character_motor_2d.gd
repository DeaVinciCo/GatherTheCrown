extends CharacterBody2D
## Base character motor for 2D movement.

class_name CharacterMotor2D

var movement_speed: float = 200.0
var acceleration: float = 900.0
var friction: float = 1200.0
var current_direction: Vector2 = Vector2.DOWN
var gravity: float = 0.0

func _physics_process(delta: float) -> void:
	apply_gravity(delta)
	handle_movement(delta)
	move_and_slide()

func handle_movement(delta: float) -> void:
	var input_direction := _resolve_input_direction()

	if input_direction != Vector2.ZERO:
		current_direction = input_direction
		var target_velocity := input_direction * movement_speed
		velocity = velocity.move_toward(target_velocity, acceleration * delta)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, friction * delta)

func _resolve_input_direction() -> Vector2:
	var use_actions := InputMap.has_action("move_left") \
		and InputMap.has_action("move_right") \
		and InputMap.has_action("move_up") \
		and InputMap.has_action("move_down")

	if use_actions:
		return Input.get_vector("move_left", "move_right", "move_up", "move_down")

	var fallback := Vector2.ZERO
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		fallback.y -= 1.0
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		fallback.y += 1.0
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		fallback.x -= 1.0
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		fallback.x += 1.0

	return fallback.normalized()

func apply_gravity(delta: float) -> void:
	if gravity > 0.0 and not is_on_floor():
		velocity.y += gravity * delta

func set_movement_speed(new_speed: float) -> void:
	movement_speed = new_speed

func get_current_direction() -> Vector2:
	return current_direction