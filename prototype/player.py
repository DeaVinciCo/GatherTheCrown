"""
Player character class
"""

import pygame
import math

class Player:
    """Player character"""
    
    def __init__(self, x, y, sprite_manager):
        self.x = x
        self.y = y
        self.width = 64  # Bumped from 48
        self.height = 64
        self.sprite_manager = sprite_manager
        
        # Stats
        self.max_health = 100
        self.health = self.max_health
        self.max_stamina = 100
        self.stamina = self.max_stamina
        self.speed = 200  # pixels per second
        self.sprint_multiplier = 1.5
        
        # Combat
        self.attack_damage = 20
        self.attack_cooldown = 0.5
        self.attack_timer = 0
        self.attack_range = 80  # Increased from 50 for better hit detection
        
        # Dodge
        self.dodge_cooldown = 1.0
        self.dodge_timer = 0
        self.is_dodging = False
        self.dodge_duration = 0.5
        self.dodge_time = 0
        self.dodge_distance = 100
        self.dodge_dir_x = 0
        self.dodge_dir_y = 0
        
        # Inventory
        self.gold = 0
        self.inventory = {
            "weapons": [],
            "items": [],
            "gems": [],
            "shards": []
        }
        
        # Visual
        self.color = (70, 130, 220)  # Blue
        self.facing_angle = 0
    
    def update(self, dt, keys, mouse_buttons, mouse_pos):
        """Update player state"""
        # Update timers
        if self.attack_timer > 0:
            self.attack_timer -= dt
        if self.dodge_timer > 0:
            self.dodge_timer -= dt
        
        # Regenerate stamina
        if self.stamina < self.max_stamina:
            self.stamina = min(self.max_stamina, self.stamina + 20 * dt)
        
        # Handle dodge
        if self.is_dodging:
            self.dodge_time += dt
            if self.dodge_time >= self.dodge_duration:
                self.is_dodging = False
                self.dodge_time = 0
            else:
                # Move during dodge
                progress = self.dodge_time / self.dodge_duration
                speed = self.dodge_distance / self.dodge_duration
                self.x += self.dodge_dir_x * speed * dt
                self.y += self.dodge_dir_y * speed * dt
            return  # Can't do anything else while dodging
        
        # Movement input (always calculate direction first)
        dx = 0
        dy = 0
        if keys[pygame.K_w] or keys[pygame.K_UP]:
            dy -= 1
        if keys[pygame.K_s] or keys[pygame.K_DOWN]:
            dy += 1
        if keys[pygame.K_a] or keys[pygame.K_LEFT]:
            dx -= 1
        if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
            dx += 1
        
        # Normalize diagonal movement
        if dx != 0 and dy != 0:
            dx *= 0.707
            dy *= 0.707
        
        # Sprint
        is_sprinting = keys[pygame.K_LSHIFT] and self.stamina > 0
        speed = self.speed * (self.sprint_multiplier if is_sprinting else 1.0)
        
        # Drain stamina while sprinting
        if is_sprinting and (dx != 0 or dy != 0):
            self.stamina = max(0, self.stamina - 10 * dt)
        
        # Dodge (Space key)
        if keys[pygame.K_SPACE] and self.dodge_timer <= 0 and self.stamina >= 20:
            self.start_dodge(dx, dy)
            return
        
        # Attack (Left mouse button)
        if mouse_buttons[0] and self.attack_timer <= 0 and self.stamina >= 5:
            self.attack(mouse_pos)
        
        # Prevent movement while attacking
        can_move = self.attack_timer <= 0
        
        if can_move:
            self.x += dx * speed * dt
            self.y += dy * speed * dt
        
        # Update facing direction after movement
        if mouse_pos:
            angle = math.atan2(mouse_pos[1] - self.y, mouse_pos[0] - self.x)
            self.facing_angle = angle
    
    def start_dodge(self, dx, dy):
        """Start dodge roll"""
        # Use movement direction, or forward if not moving
        if dx == 0 and dy == 0:
            dx = math.cos(self.facing_angle)
            dy = math.sin(self.facing_angle)
        
        self.dodge_dir_x = dx
        self.dodge_dir_y = dy
        self.is_dodging = True
        self.dodge_time = 0
        self.dodge_timer = self.dodge_cooldown
        self.stamina -= 20
    
    def attack(self, target_pos):
        """Perform attack"""
        self.attack_timer = self.attack_cooldown
        self.stamina -= 5
        print(f"Player attacking! Range: {self.attack_range}, Damage: {self.attack_damage}")
        # Attack logic handled in game.py collision detection
    
    def take_damage(self, amount):
        """Take damage"""
        if not self.is_dodging:  # Invincible during dodge
            self.health = max(0, self.health - amount)
    
    def render(self, screen, camera_x, camera_y):
        """Render player"""
        screen_x = self.x - camera_x
        screen_y = self.y - camera_y
        
        # Get appropriate sprite
        if self.attack_timer > 0:
            sprite = self.sprite_manager.get_sprite('player_attack')
        else:
            sprite = self.sprite_manager.get_sprite('player')
        
        # Apply dodge effect (transparency)
        if self.is_dodging:
            sprite = sprite.copy()
            sprite.set_alpha(128)
        
        # Draw sprite centered on position
        sprite_rect = sprite.get_rect(center=(int(screen_x), int(screen_y)))
        screen.blit(sprite, sprite_rect)
        
        # Draw attack range (when attacking)
        if self.attack_timer > 0:
            pygame.draw.circle(screen, (255, 100, 100), (int(screen_x), int(screen_y)), 
                             self.attack_range, 2)
