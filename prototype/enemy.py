"""
Enemy and boss classes
"""

import pygame
import math
import random

class Enemy:
    """Basic enemy"""
    
    def __init__(self, x, y, enemy_type="Emberling", sprite_manager=None):
        self.x = x
        self.y = y
        self.type = enemy_type
        self.width = 48  # Bumped from 32
        self.height = 48
        self.sprite_manager = sprite_manager
        
        # Stats
        self.max_health = 50
        self.health = self.max_health
        self.attack_damage = 10
        self.speed = 100
        self.attack_range = 40
        self.aggro_range = 200
        
        # Combat
        self.attack_cooldown = 1.5
        self.attack_timer = 0
        
        # AI
        self.target = None
        self.state = "idle"  # idle, chase, attack
        
        # Loot
        self.gold_drop = random.randint(10, 30)
        
        # Visual
        self.color = (255, 80, 80)  # Red
        self.damage_flash = 0  # Flash timer when hit
    
    def update(self, dt, player, creat):
        """Update enemy"""
        # Update attack timer
        if self.attack_timer > 0:
            self.attack_timer -= dt
        
        # Update damage flash
        if self.damage_flash > 0:
            self.damage_flash -= dt
        
        # Find target (prioritize player)
        player_dist = self.distance_to(player.x, player.y)
        creat_dist = self.distance_to(creat.x, creat.y)
        
        if player_dist < self.aggro_range:
            self.target = player
            self.state = "chase"
        elif creat_dist < self.aggro_range:
            self.target = creat
            self.state = "chase"
        else:
            self.target = None
            self.state = "idle"
        
        # AI behavior
        if self.state == "chase" and self.target:
            self.chase_target(dt)
        elif self.state == "attack" and self.target:
            self.attack_target()
    
    def chase_target(self, dt):
        """Chase the target"""
        if not self.target:
            return
        
        dx = self.target.x - self.x
        dy = self.target.y - self.y
        distance = math.sqrt(dx**2 + dy**2)
        
        if distance <= self.attack_range:
            self.state = "attack"
        elif distance > 0:
            # Move towards target
            dx /= distance
            dy /= distance
            self.x += dx * self.speed * dt
            self.y += dy * self.speed * dt
    
    def attack_target(self):
        """Attack the target"""
        if not self.target:
            return
        
        if self.attack_timer <= 0:
            self.target.take_damage(self.attack_damage)
            self.attack_timer = self.attack_cooldown
            
            # Check if still in range
            distance = self.distance_to(self.target.x, self.target.y)
            if distance > self.attack_range:
                self.state = "chase"
    
    def distance_to(self, x, y):
        """Calculate distance to point"""
        dx = x - self.x
        dy = y - self.y
        return math.sqrt(dx**2 + dy**2)
    
    def take_damage(self, amount):
        """Take damage"""
        self.health = max(0, self.health - amount)
        # Flash effect
        self.damage_flash = 0.2  # Flash for 0.2 seconds
    
    def render(self, screen, camera_x, camera_y):
        """Render enemy"""
        screen_x = self.x - camera_x
        screen_y = self.y - camera_y
        
        # Get enemy sprite
        if self.sprite_manager:
            sprite = self.sprite_manager.get_sprite('enemy_basic')
            
            # Flash white when damaged
            if self.damage_flash > 0:
                sprite = sprite.copy()
                # Tint white
                white_overlay = pygame.Surface(sprite.get_size(), pygame.SRCALPHA)
                white_overlay.fill((255, 255, 255, 180))
                sprite.blit(white_overlay, (0, 0), special_flags=pygame.BLEND_RGBA_ADD)
            
            sprite_rect = sprite.get_rect(center=(int(screen_x), int(screen_y)))
            screen.blit(sprite, sprite_rect)
        else:
            # Fallback to circle
            color = (255, 255, 255) if self.damage_flash > 0 else self.color
            if self.state == "attack" and self.damage_flash <= 0:
                color = (255, 150, 150)
            pygame.draw.circle(screen, color, (int(screen_x), int(screen_y)), self.width // 2)
            pygame.draw.circle(screen, (150, 0, 0), (int(screen_x), int(screen_y)), 
                             self.width // 2, 2)
        
        # Draw health bar
        bar_width = 40
        bar_height = 4
        bar_x = screen_x - bar_width // 2
        bar_y = screen_y - self.height // 2 - 15
        
        # Background
        pygame.draw.rect(screen, (100, 100, 100), 
                        (bar_x, bar_y, bar_width, bar_height))
        
        # Health
        health_width = int(bar_width * (self.health / self.max_health))
        pygame.draw.rect(screen, (255, 0, 0), 
                        (bar_x, bar_y, health_width, bar_height))


class MiniBoss(Enemy):
    """Mini-boss enemy"""
    
    def __init__(self, x, y, boss_type="Twistroot", sprite_manager=None):
        super().__init__(x, y, boss_type, sprite_manager)
        
        # Enhanced stats
        self.max_health = 200
        self.health = self.max_health
        self.attack_damage = 20
        self.speed = 80
        self.attack_range = 60
        self.aggro_range = 300
        self.width = 80  # Bumped from 64
        self.height = 80
        
        # Boss mechanics
        self.phase = 1
        self.enrage_threshold = 0.5  # Enrage at 50% HP
        self.is_enraged = False
        
        # Special attack
        self.special_cooldown = 5.0
        self.special_timer = 0
        
        # Loot
        self.gold_drop = random.randint(100, 200)
        
        # Visual
        self.color = (150, 50, 150)  # Purple
        self.damage_flash = 0  # Flash timer when hit
    
    def update(self, dt, player, creat):
        """Update boss"""
        # Check for phase change
        if not self.is_enraged and self.health <= self.max_health * self.enrage_threshold:
            self.enter_enrage()
        
        # Update special timer
        if self.special_timer > 0:
            self.special_timer -= dt
        
        # Call parent update
        super().update(dt, player, creat)
        
        # Boss special attack
        if self.special_timer <= 0 and self.target:
            self.special_attack()
    
    def enter_enrage(self):
        """Enter enraged state"""
        self.is_enraged = True
        self.attack_damage = int(self.attack_damage * 1.5)
        self.speed = int(self.speed * 1.3)
        self.attack_cooldown *= 0.7
        self.color = (200, 50, 200)  # Brighter purple
    
    def special_attack(self):
        """Perform special attack"""
        # AoE attack around boss
        if self.target:
            distance = self.distance_to(self.target.x, self.target.y)
            if distance <= 100:  # AoE range
                self.target.take_damage(self.attack_damage * 2)
        
        self.special_timer = self.special_cooldown
    
    def render(self, screen, camera_x, camera_y):
        """Render boss"""
        screen_x = self.x - camera_x
        screen_y = self.y - camera_y
        
        # Get boss sprite
        if self.sprite_manager:
            sprite = self.sprite_manager.get_sprite('enemy_boss')
            
            # Flash white when damaged
            if self.damage_flash > 0:
                sprite = sprite.copy()
                white_overlay = pygame.Surface(sprite.get_size(), pygame.SRCALPHA)
                white_overlay.fill((255, 255, 255, 180))
                sprite.blit(white_overlay, (0, 0), special_flags=pygame.BLEND_RGBA_ADD)
            
            sprite_rect = sprite.get_rect(center=(int(screen_x), int(screen_y)))
            screen.blit(sprite, sprite_rect)
        else:
            # Fallback to circle
            color = (255, 255, 255) if self.damage_flash > 0 else self.color
            if self.state == "attack" and self.damage_flash <= 0:
                color = (255, 100, 255)
            pygame.draw.circle(screen, color, (int(screen_x), int(screen_y)), self.width // 2)
            pygame.draw.circle(screen, (100, 0, 100), (int(screen_x), int(screen_y)), 
                             self.width // 2, 3)
            
            # Draw crown icon (boss indicator)
            crown_y = screen_y - self.height // 2 - 20
            pygame.draw.polygon(screen, (255, 215, 0), [
                (screen_x - 8, crown_y),
                (screen_x - 5, crown_y - 8),
                (screen_x, crown_y),
                (screen_x + 5, crown_y - 8),
                (screen_x + 8, crown_y)
            ])
        
        # Draw health bar (larger)
        bar_width = 80
        bar_height = 6
        bar_x = screen_x - bar_width // 2
        bar_y = screen_y - self.height // 2 - 50
        
        # Background
        pygame.draw.rect(screen, (100, 100, 100), 
                        (bar_x, bar_y, bar_width, bar_height))
        
        # Health
        health_width = int(bar_width * (self.health / self.max_health))
        health_color = (255, 100, 0) if self.is_enraged else (255, 0, 0)
        pygame.draw.rect(screen, health_color, 
                        (bar_x, bar_y, health_width, bar_height))
        
        # Boss name
        font = pygame.font.Font(None, 20)
        name_text = font.render(self.type, True, (255, 255, 255))
        name_rect = name_text.get_rect(center=(screen_x, bar_y - 10))
        screen.blit(name_text, name_rect)
