#!/usr/bin/env python3
"""
Gather The Crown: Creats & Foes - Main Launcher
Epic main launch screen with game imagery and proper flow routing
"""

import pygame
import sys
import os
import json
import subprocess
import random
import math

# Initialize Pygame
pygame.init()

# Screen settings
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Gather The Crown: Creats & Foes")

# Colors - Medieval Theme
DARK_STONE = (15, 15, 20)
LIGHT_STONE = (45, 45, 50)
WARM_STONE = (60, 55, 45)
PARCHMENT = (225, 213, 187)
PARCHMENT_DARK = (190, 175, 145)
GOLD = (212, 175, 55)
GOLD_BRIGHT = (255, 215, 85)
GOLD_DARK = (180, 140, 30)
WHITE = (245, 245, 245)
UMBER = (104, 86, 64)
RED = (180, 50, 50)
GREEN = (50, 150, 50)
BLUE = (70, 120, 220)
PURPLE = (120, 70, 180)

# Fonts
def load_font(path, size):
    try:
        return pygame.font.Font(path, size)
    except:
        return pygame.font.Font(None, size)

TITLE_FONT = load_font("fonts/CloisterBlack.ttf", 84)
SUBTITLE_FONT = load_font("fonts/Cinzel-Regular.ttf", 32)
BODY_FONT = load_font("fonts/Cinzel-Regular.ttf", 22)
BUTTON_FONT = load_font("fonts/Cinzel-Regular.ttf", 28)
SMALL_FONT = load_font("fonts/Cinzel-Regular.ttf", 18)

class ParticleEffect:
    def __init__(self):
        self.particles = []
        
    def add_particle(self, x, y, color, velocity, life):
        self.particles.append({
            'x': x, 'y': y, 'color': color,
            'vx': velocity[0], 'vy': velocity[1],
            'life': life, 'max_life': life
        })
    
    def update(self, dt):
        for particle in self.particles[:]:
            particle['x'] += particle['vx'] * dt
            particle['y'] += particle['vy'] * dt
            particle['life'] -= dt
            
            if particle['life'] <= 0:
                self.particles.remove(particle)
    
    def draw(self, surface):
        for particle in self.particles:
            alpha = int(255 * (particle['life'] / particle['max_life']))
            color = (*particle['color'], alpha)
            size = max(1, int(3 * (particle['life'] / particle['max_life'])))
            
            # Create a surface with per-pixel alpha
            particle_surf = pygame.Surface((size*2, size*2), pygame.SRCALPHA)
            pygame.draw.circle(particle_surf, color, (size, size), size)
            surface.blit(particle_surf, (int(particle['x']-size), int(particle['y']-size)))

class AnimatedButton:
    def __init__(self, x, y, width, height, text, style="primary"):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.style = style
        self.hovered = False
        self.pressed = False
        self.glow_intensity = 0
        self.pulse_timer = 0
        
    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                self.pressed = True
        elif event.type == pygame.MOUSEBUTTONUP:
            if self.pressed and self.rect.collidepoint(event.pos):
                self.pressed = False
                return True
            self.pressed = False
        return False
    
    def update(self, dt):
        self.pulse_timer += dt * 2
        if self.hovered:
            self.glow_intensity = min(1.0, self.glow_intensity + dt * 3)
        else:
            self.glow_intensity = max(0.0, self.glow_intensity - dt * 2)
    
    def draw(self, surface):
        # Glow effect
        if self.glow_intensity > 0:
            glow_size = int(10 * self.glow_intensity)
            glow_rect = self.rect.inflate(glow_size, glow_size)
            glow_color = (*GOLD_BRIGHT, int(50 * self.glow_intensity))
            
            # Create glow surface
            glow_surf = pygame.Surface((glow_rect.width, glow_rect.height), pygame.SRCALPHA)
            pygame.draw.rect(glow_surf, glow_color, (0, 0, glow_rect.width, glow_rect.height), border_radius=15)
            surface.blit(glow_surf, glow_rect.topleft)
        
        # Button colors
        if self.style == "primary":
            base_color = GOLD
            hover_color = GOLD_BRIGHT
            text_color = DARK_STONE
        else:  # secondary
            base_color = LIGHT_STONE
            hover_color = (70, 70, 80)
            text_color = WHITE
        
        # Pulse effect for primary buttons
        pulse_offset = 0
        if self.style == "primary":
            pulse_offset = int(5 * math.sin(self.pulse_timer) * self.glow_intensity)
        
        color = hover_color if self.hovered else base_color
        if self.pressed:
            color = tuple(max(0, c - 30) for c in color)
        
        # Add pulse brightness
        if pulse_offset > 0:
            color = tuple(min(255, c + pulse_offset) for c in color)
        
        # Draw button
        pygame.draw.rect(surface, color, self.rect, border_radius=12)
        pygame.draw.rect(surface, UMBER, self.rect, 3, border_radius=12)
        
        # Inner highlight
        highlight_rect = pygame.Rect(self.rect.x + 3, self.rect.y + 3, 
                                   self.rect.width - 6, self.rect.height - 6)
        pygame.draw.rect(surface, tuple(min(255, c + 20) for c in color), 
                        highlight_rect, 2, border_radius=10)
        
        # Draw text with shadow
        shadow_surface = BUTTON_FONT.render(self.text, True, (0, 0, 0))
        shadow_rect = shadow_surface.get_rect(center=(self.rect.centerx + 2, self.rect.centery + 2))
        surface.blit(shadow_surface, shadow_rect)
        
        text_surface = BUTTON_FONT.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        surface.blit(text_surface, text_rect)

class MainLauncher:
    def __init__(self):
        self.particles = ParticleEffect()
        self.animation_timer = 0
        self.torch_flicker = 0
        self.crown_rotation = 0
        
        # Check if user has existing save data
        self.has_save_data = self.check_save_data()
        
        # Create buttons based on save data
        if self.has_save_data:
            # Returning player - show Play and New Game options
            self.play_button = AnimatedButton(SCREEN_WIDTH//2 - 100, 400, 200, 60, "Continue Adventure")
            self.new_game_button = AnimatedButton(SCREEN_WIDTH//2 - 100, 480, 200, 60, "New Game", "secondary")
            self.buttons = [self.play_button, self.new_game_button]
        else:
            # New player - show Play button only
            self.play_button = AnimatedButton(SCREEN_WIDTH//2 - 100, 440, 200, 60, "Begin Adventure")
            self.buttons = [self.play_button]
        
        # Settings and exit buttons
        self.settings_button = AnimatedButton(50, SCREEN_HEIGHT - 100, 120, 50, "Settings", "secondary")
        self.exit_button = AnimatedButton(SCREEN_WIDTH - 170, SCREEN_HEIGHT - 100, 120, 50, "Exit", "secondary")
        self.buttons.extend([self.settings_button, self.exit_button])
        
        # Initialize particle effects
        self.spawn_initial_particles()
    
    def check_save_data(self):
        """Check if user has existing save data or login credentials"""
        # Check for user data file
        if os.path.exists("user_data.json"):
            try:
                with open("user_data.json", "r") as f:
                    data = json.load(f)
                    if data.get("username") and data.get("remember_login"):
                        return True
            except:
                pass
        
        # Check for users database
        if os.path.exists("users.json"):
            try:
                with open("users.json", "r") as f:
                    users = json.load(f)
                    if users:  # Has registered users
                        return True
            except:
                pass
        
        return False
    
    def spawn_initial_particles(self):
        """Spawn magical particles around the screen"""
        for _ in range(20):
            x = random.randint(0, SCREEN_WIDTH)
            y = random.randint(0, SCREEN_HEIGHT)
            color = random.choice([GOLD, PURPLE, BLUE])
            velocity = (random.uniform(-20, 20), random.uniform(-20, 20))
            life = random.uniform(3, 6)
            self.particles.add_particle(x, y, color, velocity, life)
    
    def handle_event(self, event):
        for button in self.buttons:
            if button.handle_event(event):
                if button == self.play_button:
                    if self.has_save_data:
                        return "CONTINUE_GAME"
                    else:
                        return "NEW_GAME"
                elif button == self.new_game_button:
                    return "NEW_GAME"
                elif button == self.settings_button:
                    return "SETTINGS"
                elif button == self.exit_button:
                    return "EXIT"
        return None
    
    def update(self, dt):
        self.animation_timer += dt
        self.torch_flicker += dt * 3
        self.crown_rotation += dt * 30  # Slow rotation
        
        # Update buttons
        for button in self.buttons:
            button.update(dt)
        
        # Update particles
        self.particles.update(dt)
        
        # Spawn new particles occasionally
        if random.random() < 0.1:  # 10% chance per frame
            x = random.randint(0, SCREEN_WIDTH)
            y = random.randint(0, SCREEN_HEIGHT)
            color = random.choice([GOLD, PURPLE, BLUE])
            velocity = (random.uniform(-30, 30), random.uniform(-30, 30))
            life = random.uniform(2, 4)
            self.particles.add_particle(x, y, color, velocity, life)
    
    def draw_background_imagery(self, surface):
        """Draw epic medieval background imagery"""
        # Gradient background
        for y in range(SCREEN_HEIGHT):
            ratio = y / SCREEN_HEIGHT
            r = int(DARK_STONE[0] * (1 - ratio) + WARM_STONE[0] * ratio)
            g = int(DARK_STONE[1] * (1 - ratio) + WARM_STONE[1] * ratio)
            b = int(DARK_STONE[2] * (1 - ratio) + WARM_STONE[2] * ratio)
            pygame.draw.line(surface, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Animated torches
        torch_positions = [(150, 120), (SCREEN_WIDTH - 150, 120)]
        for tx, ty in torch_positions:
            flicker_offset = int(4 * (0.5 + 0.5 * math.sin(self.torch_flicker + tx/100)))
            flame_color = (255, 140 + flicker_offset * 15, 0)
            
            # Torch base
            pygame.draw.rect(surface, UMBER, (tx - 4, ty, 8, 40))
            
            # Flame with flicker
            flame_points = [
                (tx, ty - 5 - flicker_offset),
                (tx - 8, ty + 5),
                (tx + 8, ty + 5)
            ]
            pygame.draw.polygon(surface, flame_color, flame_points)
            
            # Inner flame
            inner_flame_points = [
                (tx, ty - 2 - flicker_offset//2),
                (tx - 4, ty + 3),
                (tx + 4, ty + 3)
            ]
            pygame.draw.polygon(surface, (255, 200, 50), inner_flame_points)
        
        # Mystical crown symbol (rotating)
        crown_center = (SCREEN_WIDTH // 2, 200)
        crown_size = 40
        
        # Crown base
        crown_points = []
        for i in range(5):
            angle = (i * 72 + self.crown_rotation) * math.pi / 180
            x = crown_center[0] + crown_size * math.cos(angle)
            y = crown_center[1] + crown_size * math.sin(angle)
            crown_points.append((x, y))
        
        # Draw crown with glow
        glow_surf = pygame.Surface((crown_size*3, crown_size*3), pygame.SRCALPHA)
        pygame.draw.polygon(glow_surf, (*GOLD, 30), 
                          [(p[0] - crown_center[0] + crown_size*1.5, 
                            p[1] - crown_center[1] + crown_size*1.5) for p in crown_points])
        surface.blit(glow_surf, (crown_center[0] - crown_size*1.5, crown_center[1] - crown_size*1.5))
        
        pygame.draw.polygon(surface, GOLD_BRIGHT, crown_points)
        pygame.draw.polygon(surface, GOLD_DARK, crown_points, 3)
        
        # Crown gems
        for i, point in enumerate(crown_points):
            gem_color = [RED, BLUE, GREEN, PURPLE, GOLD][i]
            pygame.draw.circle(surface, gem_color, (int(point[0]), int(point[1])), 6)
            pygame.draw.circle(surface, WHITE, (int(point[0]), int(point[1])), 3)
        
        # Mystical creatures silhouettes
        creature_positions = [(100, 300), (SCREEN_WIDTH - 100, 350), (200, 500), (SCREEN_WIDTH - 200, 480)]
        for cx, cy in creature_positions:
            # Dragon silhouette
            bob_offset = int(10 * math.sin(self.animation_timer * 2 + cx/100))
            creature_y = cy + bob_offset
            
            # Body
            pygame.draw.ellipse(surface, (30, 30, 40), (cx - 25, creature_y - 10, 50, 20))
            # Head
            pygame.draw.circle(surface, (30, 30, 40), (cx + 20, creature_y - 5), 12)
            # Wings
            wing_points = [(cx - 15, creature_y - 5), (cx - 35, creature_y - 20), (cx - 20, creature_y + 5)]
            pygame.draw.polygon(surface, (25, 25, 35), wing_points)
            # Tail
            pygame.draw.polygon(surface, (30, 30, 40), [(cx - 25, creature_y), (cx - 45, creature_y - 8), (cx - 40, creature_y + 8)])
    
    def draw(self, surface):
        # Draw background imagery
        self.draw_background_imagery(surface)
        
        # Draw particles
        self.particles.draw(surface)
        
        # Main title with glow effect
        title_glow = TITLE_FONT.render("Gather The Crown", True, (*GOLD_BRIGHT, 100))
        title_glow_rect = title_glow.get_rect(center=(SCREEN_WIDTH // 2 + 3, 83))
        surface.blit(title_glow, title_glow_rect)
        
        title_surface = TITLE_FONT.render("Gather The Crown", True, GOLD_BRIGHT)
        title_rect = title_surface.get_rect(center=(SCREEN_WIDTH // 2, 80))
        surface.blit(title_surface, title_rect)
        
        # Subtitle with mystical effect
        subtitle_surface = SUBTITLE_FONT.render("Creats & Foes", True, WHITE)
        subtitle_rect = subtitle_surface.get_rect(center=(SCREEN_WIDTH // 2, 130))
        surface.blit(subtitle_surface, subtitle_rect)
        
        # Epic tagline
        tagline_lines = [
            "Forge bonds with mystical creatures",
            "Gather the legendary Crown Shards",
            "Restore balance to the realm"
        ]
        
        y_offset = 280
        for i, line in enumerate(tagline_lines):
            # Animated text appearance
            alpha = min(255, int(255 * max(0, (self.animation_timer - i * 0.5))))
            if alpha > 0:
                text_surf = pygame.Surface(BODY_FONT.size(line), pygame.SRCALPHA)
                text_render = BODY_FONT.render(line, True, (*WHITE, alpha))
                text_surf.blit(text_render, (0, 0))
                
                text_rect = text_surf.get_rect(center=(SCREEN_WIDTH // 2, y_offset))
                surface.blit(text_surf, text_rect)
            y_offset += 30
        
        # Draw buttons
        for button in self.buttons:
            button.draw(surface)
        
        # Status text for returning players
        if self.has_save_data:
            status_text = "Welcome back, adventurer!"
            status_surface = SMALL_FONT.render(status_text, True, GREEN)
            status_rect = status_surface.get_rect(center=(SCREEN_WIDTH // 2, 370))
            surface.blit(status_surface, status_rect)
        
        # Version info
        version_text = "v1.0 - Medieval Adventure Awaits"
        version_surface = SMALL_FONT.render(version_text, True, (150, 150, 150))
        version_rect = version_surface.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 30))
        surface.blit(version_surface, version_rect)

def launch_login_screen():
    """Launch the login screen and wait for result"""
    try:
        result = subprocess.run([sys.executable, "login_screen.py"], 
                              capture_output=True, text=True)
        
        # Check if login was successful
        if os.path.exists("login_status.tmp"):
            try:
                with open("login_status.tmp", "r") as f:
                    status = json.load(f)
                    if status.get("success"):
                        os.remove("login_status.tmp")  # Clean up
                        return True, status.get("username"), status.get("has_character", False)
            except:
                pass
        
        return False, None, False
    except Exception as e:
        print(f"Error launching login screen: {e}")
        return False, None, False

def launch_character_creation():
    """Launch character creation screen"""
    try:
        subprocess.run([sys.executable, "character_creation_screen.py"])
        return True
    except Exception as e:
        print(f"Error launching character creation: {e}")
        return False

def launch_main_game():
    """Launch the main game"""
    try:
        subprocess.Popen([sys.executable, "complete_ultimate_game.py"])
        return True
    except Exception as e:
        print(f"Error launching main game: {e}")
        return False

def main():
    clock = pygame.time.Clock()
    launcher = MainLauncher()
    
    running = True
    while running:
        dt = clock.tick(60) / 1000.0
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif event.key == pygame.K_F11:
                    pygame.display.toggle_fullscreen()
            else:
                result = launcher.handle_event(event)
                if result:
                    if result == "CONTINUE_GAME":
                        # Check if user is logged in, if not show login
                        success, username, has_character = launch_login_screen()
                        if success:
                            if has_character:
                                print(f"Welcome back, {username}!")
                                if launch_main_game():
                                    running = False
                            else:
                                print(f"Welcome {username}! Let's create your character...")
                                if launch_character_creation():
                                    running = False
                        else:
                            print("Login failed or cancelled")
                    
                    elif result == "NEW_GAME":
                        # For new game, always go through login/register flow
                        success, username, has_character = launch_login_screen()
                        if success:
                            # Always create new character for new game
                            print(f"Starting new adventure for {username}!")
                            if launch_character_creation():
                                running = False
                        else:
                            print("Login/registration cancelled")
                    
                    elif result == "SETTINGS":
                        print("Settings menu coming soon!")
                    
                    elif result == "EXIT":
                        running = False
        
        launcher.update(dt)
        launcher.draw(screen)
        pygame.display.flip()
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()