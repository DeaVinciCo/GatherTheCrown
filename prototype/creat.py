"""
Creat companion class
"""

import pygame
import math

class Creat:
    """Creat companion creature"""
    
    def __init__(self, name, element, player, sprite_manager):
        self.name = name
        self.element = element
        self.player = player
        self.sprite_manager = sprite_manager
        
        # Position
        self.x = player.x - 50
        self.y = player.y
        self.width = 64  # Bumped from 48
        self.height = 64
        
        # Visibility (for tutorial mode)
        self.visible = True
        
        # Stats
        self.max_health = 80
        self.health = self.max_health
        self.attack_damage = 15
        self.speed = 180
        
        # AI state
        self.state = "follow"  # follow, attack, defend
        self.target = None
        
        # Combat
        self.attack_cooldown = 1.0
        self.attack_timer = 0
        self.attack_range = 60
        
        # Bond
        self.bond_level = 50  # 0-100
        
        # Visual
        self.color = self.get_element_color()
        self.aura_particles = []
    
    def get_element_color(self):
        """Get color based on element"""
        colors = {
            "fire": (255, 100, 50),
            "water": (90, 160, 255),
            "earth": (120, 180, 120),
            "storm": (180, 180, 255),
            "light": (255, 255, 210),
            "shadow": (170, 120, 200),
            "arcane": (190, 170, 255)
        }
        return colors.get(self.element, (200, 200, 200))
    
    def update(self, dt, keys, enemies):
        """Update creat state"""
        # Update attack timer
        if self.attack_timer > 0:
            self.attack_timer -= dt
        
        # Handle commands
        if keys[pygame.K_1]:  # Attack command
            self.state = "attack"
            if enemies:
                self.target = self.find_nearest_enemy(enemies)
        elif keys[pygame.K_2]:  # Defend command
            self.state = "defend"
            self.target = None
        
        # AI behavior
        if self.state == "follow" or self.state == "defend":
            self.follow_player(dt)
        elif self.state == "attack" and self.target:
            self.attack_enemy(dt, self.target)
            
            # Return to follow if target is dead
            if self.target.health <= 0:
                self.state = "follow"
                self.target = None
        
        # Update aura particles
        self.update_aura(dt)
    
    def follow_player(self, dt):
        """Follow the player"""
        # Maintain distance from player
        desired_distance = 60
        dx = self.player.x - self.x
        dy = self.player.y - self.y
        distance = math.sqrt(dx**2 + dy**2)
        
        if distance > desired_distance:
            # Move towards player
            if distance > 0:
                dx /= distance
                dy /= distance
                self.x += dx * self.speed * dt
                self.y += dy * self.speed * dt
    
    def attack_enemy(self, dt, enemy):
        """Attack an enemy"""
        dx = enemy.x - self.x
        dy = enemy.y - self.y
        distance = math.sqrt(dx**2 + dy**2)
        
        if distance > self.attack_range:
            # Move towards enemy
            if distance > 0:
                dx /= distance
                dy /= distance
                self.x += dx * self.speed * dt
                self.y += dy * self.speed * dt
        else:
            # In range, attack
            if self.attack_timer <= 0:
                enemy.take_damage(self.attack_damage)
                self.attack_timer = self.attack_cooldown
    
    def find_nearest_enemy(self, enemies):
        """Find nearest enemy"""
        if not enemies:
            return None
        
        nearest = None
        min_distance = float('inf')
        
        for enemy in enemies:
            dx = enemy.x - self.x
            dy = enemy.y - self.y
            distance = math.sqrt(dx**2 + dy**2)
            
            if distance < min_distance:
                min_distance = distance
                nearest = enemy
        
        return nearest
    
    def update_aura(self, dt):
        """Update elemental aura particles"""
        # Add new particles
        if len(self.aura_particles) < 10:
            import random
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(10, 30)
            self.aura_particles.append({
                "x": self.x,
                "y": self.y,
                "vx": math.cos(angle) * speed,
                "vy": math.sin(angle) * speed,
                "life": 1.0
            })
        
        # Update existing particles
        for particle in self.aura_particles[:]:
            particle["x"] += particle["vx"] * dt
            particle["y"] += particle["vy"] * dt
            particle["life"] -= dt
            
            if particle["life"] <= 0:
                self.aura_particles.remove(particle)
    
    def take_damage(self, amount):
        """Take damage"""
        self.health = max(0, self.health - amount)
        self.bond_level = max(0, self.bond_level - 3)
    
    def render(self, screen, camera_x, camera_y):
        """Render creat"""
        if not self.visible:
            return
        
        screen_x = self.x - camera_x
        screen_y = self.y - camera_y
        
        # Draw aura particles
        for particle in self.aura_particles:
            p_x = particle["x"] - camera_x
            p_y = particle["y"] - camera_y
            alpha = int(particle["life"] * 255)
            color = (*self.color, alpha)
            
            # Create surface for alpha blending
            particle_surf = pygame.Surface((6, 6), pygame.SRCALPHA)
            pygame.draw.circle(particle_surf, color, (3, 3), 3)
            screen.blit(particle_surf, (int(p_x) - 3, int(p_y) - 3))
        
        # Get creat sprite
        sprite = self.sprite_manager.get_sprite('creat_fire')
        
        # Draw sprite centered on position
        sprite_rect = sprite.get_rect(center=(int(screen_x), int(screen_y)))
        screen.blit(sprite, sprite_rect)
        
        # Draw state indicator
        if self.state == "attack":
            # Red outline when attacking
            pygame.draw.circle(screen, (255, 0, 0), (int(screen_x), int(screen_y)), 
                             self.width // 2 + 3, 2)
        elif self.state == "defend":
            # Blue outline when defending
            pygame.draw.circle(screen, (0, 100, 255), (int(screen_x), int(screen_y)), 
                             self.width // 2 + 3, 2)
        
        # Draw health bar
        bar_width = 50
        bar_height = 4
        bar_x = screen_x - bar_width // 2
        bar_y = screen_y - self.height // 2 - 10
        
        # Background
        pygame.draw.rect(screen, (100, 100, 100), 
                        (bar_x, bar_y, bar_width, bar_height))
        
        # Health
        health_width = int(bar_width * (self.health / self.max_health))
        pygame.draw.rect(screen, (0, 255, 0), 
                        (bar_x, bar_y, health_width, bar_height))
