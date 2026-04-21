extends CharacterBody2D
## Base character motor for 2D movement

class_name CharacterMotor2D

var movement_speed: float = 200.0
var acceleration: float = 500.0
var friction: float = 400.0
var current_direction: Vector2 = Vector2.ZERO
var gravity: float = 0.0

func _physics_process(delta: float) -> void:
	apply_gravity(delta)
	handle_movement()
	move_and_slide()

func handle_movement() -> void:
	var input_direction = Vector2.ZERO
	
	# Use only direct key presses to avoid action map issues
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		input_direction.y -= 1
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		input_direction.y += 1
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		input_direction.x -= 1
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		input_direction.x += 1
	
	input_direction = input_direction.normalized()
	
	if input_direction != Vector2.ZERO:
		velocity.x = lerp(velocity.x, input_direction.x * movement_speed, 0.15)
		velocity.y = lerp(velocity.y, input_direction.y * movement_speed, 0.15)
		current_direction = input_direction
	else:
		velocity.x = lerp(velocity.x, 0.0, 0.15)
		velocity.y = lerp(velocity.y, 0.0, 0.15)

func apply_gravity(delta: float) -> void:
	if gravity > 0.0 and not is_on_floor():
		velocity.y += gravity * delta

func set_movement_speed(new_speed: float) -> void:
	movement_speed = new_speed

func get_current_direction() -> Vector2:
	return current_direction
