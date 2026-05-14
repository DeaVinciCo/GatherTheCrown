"""
Game class - Main game loop and state management
"""

import pygame
from player import Player
from creat import Creat
from enemy import Enemy, MiniBoss
from crown import CrownSystem
from ui import UI
from sprites import SpriteManager
import random

class Game:
    """Main game class"""
    
    def __init__(self, screen, width, height):
        self.screen = screen
        self.width = width
        self.height = height
        
        # Load sprites
        self.sprite_manager = SpriteManager()
        
        # Game state
        self.state = "playing"  # playing, paused, inventory, game_over
        self.paused = False
        
        # Create player
        self.player = Player(width // 2, height // 2, self.sprite_manager)
        
        # Create creat companion (starts hidden, will appear after tutorial)
        self.creat = Creat("Fire Drake", "fire", self.player, self.sprite_manager)
        self.creat.visible = True  # Set to False for tutorial mode
        
        # Create crown system
        self.crown_system = CrownSystem()
        
        # Create UI
        self.ui = UI(width, height, self.player, self.creat, self.crown_system)
        
        # World bounds (define BEFORE generating environment)
        self.world_width = 2000
        self.world_height = 2000
        
        # Camera offset
        self.camera_x = 0
        self.camera_y = 0
        
        # Create test enemies
        self.enemies = [
            Enemy(400, 300, "Emberling", self.sprite_manager),
            Enemy(600, 400, "Emberling", self.sprite_manager),
            MiniBoss(800, 350, "Twistroot", self.sprite_manager)
        ]
        
        # Environment objects
        self.trees = self.generate_trees()
        self.berry_trees = self.generate_berry_trees()
        self.grass_tufts = self.generate_grass()
        self.bushes = self.generate_bushes()
        self.pathways = self.generate_pathways()
        
        # Town features
        self.direction_sign = {
            "x": self.world_width // 4 + 50,  # Just past the left cobblestone road
            "y": self.world_height // 6 - 20   # At the brick path junction
        }
        
        # Background color (forest green)
        self.bg_color = (34, 93, 49)
        
        # Crown fragments in world
        self.fragments = [
            {"x": 500, "y": 300, "type": "bronze_shard", "collected": False},
            {"x": 900, "y": 500, "type": "bronze_shard", "collected": False},
            {"x": 700, "y": 200, "type": "quartz_gem", "collected": False}
        ]
    
    def handle_event(self, event):
        """Handle input events"""
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                self.paused = not self.paused
            elif event.key == pygame.K_i:
                self.ui.toggle_inventory()
            elif event.key == pygame.K_m:
                self.ui.toggle_map()
            elif event.key == pygame.K_c:
                self.ui.toggle_crown_forge()
        
        # Pass events to UI
        self.ui.handle_event(event)
    
    def update(self, dt):
        """Update game state"""
        if self.paused or self.ui.inventory_open or self.ui.crown_forge_open:
            return
        
        # Get input
        keys = pygame.key.get_pressed()
        mouse_buttons = pygame.mouse.get_pressed()
        mouse_pos = pygame.mouse.get_pos()
        
        # Adjust mouse position for camera
        world_mouse_x = mouse_pos[0] + self.camera_x
        world_mouse_y = mouse_pos[1] + self.camera_y
        
        # Update player
        self.player.update(dt, keys, mouse_buttons, (world_mouse_x, world_mouse_y))
        
        # Update creat
        self.creat.update(dt, keys, self.enemies)
        
        # Update enemies
        for enemy in self.enemies[:]:
            enemy.update(dt, self.player, self.creat)
            
            # Check if player is attacking and in range
            if self.player.attack_timer > 0:
                dx = enemy.x - self.player.x
                dy = enemy.y - self.player.y
                distance = (dx**2 + dy**2)**0.5
                
                if distance <= self.player.attack_range:
                    # Deal damage (only once per attack)
                    if not hasattr(self.player, '_hit_enemies'):
                        self.player._hit_enemies = set()
                    
                    if enemy not in self.player._hit_enemies:
                        enemy.take_damage(self.player.attack_damage)
                        self.player._hit_enemies.add(enemy)
                        print(f"Hit {enemy.type} for {self.player.attack_damage} damage! HP: {enemy.health}/{enemy.max_health}")
            else:
                # Reset hit tracking when not attacking
                if hasattr(self.player, '_hit_enemies'):
                    self.player._hit_enemies.clear()
            
            # Remove dead enemies
            if enemy.health <= 0:
                self.enemies.remove(enemy)
                # Drop loot
                self.player.gold += enemy.gold_drop
        
        # Check fragment collection
        for fragment in self.fragments:
            if not fragment["collected"]:
                dx = self.player.x - fragment["x"]
                dy = self.player.y - fragment["y"]
                distance = (dx**2 + dy**2)**0.5
                
                if distance < 30:  # Collection radius
                    fragment["collected"] = True
                    self.crown_system.add_fragment(fragment["type"])
        
        # Check berry collection from bushes (player walks by)
        for bush in self.bushes:
            if bush["has_berries"]:
                dx = self.player.x - bush["x"]
                dy = self.player.y - bush["y"]
                distance = (dx**2 + dy**2)**0.5
                
                if distance < 40:  # Collection radius
                    bush["has_berries"] = False
                    bush["regrow_timer"] = 30.0  # Regrow in 30 seconds
                    # Restore small amount of health
                    self.player.health = min(self.player.max_health, self.player.health + 10)
                    print(f"Collected berries from bush! +10 HP")
        
        # Check berry collection from berry trees (player walks by)
        for berry_tree in self.berry_trees:
            if berry_tree["has_berries"]:
                dx = self.player.x - berry_tree["x"]
                dy = self.player.y - berry_tree["y"]
                distance = (dx**2 + dy**2)**0.5
                
                if distance < 50:  # Collection radius
                    berry_tree["has_berries"] = False
                    berry_tree["regrow_timer"] = 45.0  # Regrow in 45 seconds
                    # Element-specific effects
                    self.apply_berry_effect(berry_tree["element"])
        
        # Creat can eat berries from bushes
        for bush in self.bushes:
            if bush["has_berries"] and self.creat.visible:
                dx = self.creat.x - bush["x"]
                dy = self.creat.y - bush["y"]
                distance = (dx**2 + dy**2)**0.5
                
                if distance < 40 and self.creat.health < self.creat.max_health:
                    bush["has_berries"] = False
                    bush["regrow_timer"] = 30.0
                    self.creat.health = min(self.creat.max_health, self.creat.health + 15)
                    self.creat.bond_level = min(100, self.creat.bond_level + 2)
                    print(f"{self.creat.name} ate berries from bush! +15 HP, +2 Bond")
        
        # Creat can eat berries from berry trees
        for berry_tree in self.berry_trees:
            if berry_tree["has_berries"] and self.creat.visible:
                dx = self.creat.x - berry_tree["x"]
                dy = self.creat.y - berry_tree["y"]
                distance = (dx**2 + dy**2)**0.5
                
                if distance < 50 and self.creat.health < self.creat.max_health:
                    berry_tree["has_berries"] = False
                    berry_tree["regrow_timer"] = 45.0
                    self.creat.health = min(self.creat.max_health, self.creat.health + 20)
                    self.creat.bond_level = min(100, self.creat.bond_level + 5)
                    print(f"{self.creat.name} ate berries from {berry_tree['element']} tree! +20 HP, +5 Bond")
        
        # Update berry regrowth timers
        for bush in self.bushes:
            if not bush["has_berries"] and bush["regrow_timer"] > 0:
                bush["regrow_timer"] -= dt
                if bush["regrow_timer"] <= 0:
                    bush["has_berries"] = True
                    print("Bush berries regrew!")
        
        for berry_tree in self.berry_trees:
            if not berry_tree["has_berries"] and berry_tree["regrow_timer"] > 0:
                berry_tree["regrow_timer"] -= dt
                if berry_tree["regrow_timer"] <= 0:
                    berry_tree["has_berries"] = True
                    print(f"{berry_tree['element'].capitalize()} tree berries regrew!")
        
        # Update camera to follow player
        self.camera_x = self.player.x - self.width // 2
        self.camera_y = self.player.y - self.height // 2
        
        # Clamp camera to world bounds
        self.camera_x = max(0, min(self.camera_x, self.world_width - self.width))
        self.camera_y = max(0, min(self.camera_y, self.world_height - self.height))
    
    def apply_berry_effect(self, element):
        """Apply element-specific berry effects to player"""
        effects = {
            'fire': {'health': 15, 'stamina': 10, 'msg': 'Fire berries! +15 HP, +10 Stamina'},
            'water': {'health': 20, 'stamina': 5, 'msg': 'Water berries! +20 HP, +5 Stamina'},
            'earth': {'health': 25, 'stamina': 0, 'msg': 'Earth berries! +25 HP'},
            'storm': {'health': 10, 'stamina': 20, 'msg': 'Storm berries! +10 HP, +20 Stamina'},
            'light': {'health': 30, 'stamina': 0, 'msg': 'Light berries! +30 HP (Blessed!)'},
            'shadow': {'health': 15, 'stamina': 15, 'msg': 'Shadow berries! +15 HP, +15 Stamina'}
        }
        
        effect = effects.get(element, {'health': 10, 'stamina': 10, 'msg': 'Berries! +10 HP, +10 Stamina'})
        
        self.player.health = min(self.player.max_health, self.player.health + effect['health'])
        self.player.stamina = min(self.player.max_stamina, self.player.stamina + effect['stamina'])
        print(effect['msg'])
    
    def generate_trees(self):
        """Generate regular trees in the world, avoiding pathways and overlaps"""
        trees = []
        attempts = 0
        max_attempts = 400
        
        while len(trees) < 25 and attempts < max_attempts:  # More trees!
            x = random.randint(200, self.world_width - 200)
            y = random.randint(200, self.world_height - 200)
            
            # Check if on pathway
            if self.is_on_pathway(x, y):
                attempts += 1
                continue
            
            # Check if too close to other trees
            too_close = False
            for tree in trees:
                dx = tree["x"] - x
                dy = tree["y"] - y
                distance = (dx**2 + dy**2)**0.5
                if distance < 140:  # Reasonable spacing
                    too_close = True
                    break
            
            if not too_close:
                trees.append({"x": x, "y": y})
            
            attempts += 1
        
        return trees
    
    def generate_berry_trees(self):
        """Generate berry trees based on creat element, avoiding pathways and overlaps"""
        berry_trees = []
        element = self.creat.element
        attempts = 0
        max_attempts = 500
        
        # Combine all existing trees for collision checking
        all_trees = self.trees[:]
        
        while len(berry_trees) < 18 and attempts < max_attempts:  # More berry trees!
            x = random.randint(200, self.world_width - 200)
            y = random.randint(200, self.world_height - 200)
            
            # Check if on pathway
            if self.is_on_pathway(x, y):
                attempts += 1
                continue
            
            # Check if too close to other trees
            too_close = False
            for tree in all_trees + berry_trees:
                dx = tree["x"] - x
                dy = tree["y"] - y
                distance = (dx**2 + dy**2)**0.5
                if distance < 140:  # Reasonable spacing
                    too_close = True
                    break
            
            if not too_close:
                berry_trees.append({
                    "x": x, 
                    "y": y, 
                    "element": element,
                    "has_berries": True,
                    "regrow_timer": 0
                })
            
            attempts += 1
        
        return berry_trees
    
    def generate_grass(self):
        """Generate grass tufts"""
        grass = []
        for _ in range(100):
            x = random.randint(0, self.world_width)
            y = random.randint(0, self.world_height)
            grass.append({"x": x, "y": y})
        return grass
    
    def generate_bushes(self):
        """Generate bushes, avoiding pathways and overlaps"""
        bushes = []
        attempts = 0
        max_attempts = 400
        
        # Get all trees for collision checking
        all_obstacles = self.trees[:] + self.berry_trees[:]
        
        while len(bushes) < 30 and attempts < max_attempts:  # More bushes!
            x = random.randint(150, self.world_width - 150)
            y = random.randint(150, self.world_height - 150)
            
            # Check if on pathway (larger buffer for bushes)
            if self.is_on_pathway(x, y, buffer=100):
                attempts += 1
                continue
            
            # Check if too close to trees or other bushes
            too_close = False
            for obstacle in all_obstacles + bushes:
                dx = obstacle["x"] - x
                dy = obstacle["y"] - y
                distance = (dx**2 + dy**2)**0.5
                if distance < 100:  # Reasonable spacing
                    too_close = True
                    break
            
            if not too_close:
                bushes.append({
                    "x": x, 
                    "y": y,
                    "has_berries": True,
                    "regrow_timer": 0
                })
            
            attempts += 1
        
        return bushes
    
    def generate_pathways(self):
        """Generate town-style roads - cobblestone main roads, brick side paths (no mixing)"""
        pathways = []
        
        # COBBLESTONE MAIN ROADS - Major streets that form a grid
        # These can intersect with each other
        
        # Main horizontal cobblestone road through center
        main_road_y = self.world_height // 2 - 32
        for x in range(0, self.world_width, 64):
            pathways.append({"x": x, "y": main_road_y, "type": "cobblestone"})
            pathways.append({"x": x, "y": main_road_y + 64, "type": "cobblestone"})
        
        # Main vertical cobblestone road through center
        main_road_x = self.world_width // 2 - 32
        for y in range(0, self.world_height, 64):
            pathways.append({"x": main_road_x, "y": y, "type": "cobblestone"})
            pathways.append({"x": main_road_x + 64, "y": y, "type": "cobblestone"})
        
        # Secondary cobblestone roads (parallel to main roads, don't cross brick)
        # Left vertical road
        left_road_x = self.world_width // 4 - 32
        for y in range(0, self.world_height, 64):
            pathways.append({"x": left_road_x, "y": y, "type": "cobblestone"})
            pathways.append({"x": left_road_x + 64, "y": y, "type": "cobblestone"})
        
        # Right vertical road
        right_road_x = (self.world_width * 3) // 4 - 32
        for y in range(0, self.world_height, 64):
            pathways.append({"x": right_road_x, "y": y, "type": "cobblestone"})
            pathways.append({"x": right_road_x + 64, "y": y, "type": "cobblestone"})
        
        # BRICK SIDE PATHS - Smaller paths in areas away from cobblestone
        # These can intersect with each other but avoid cobblestone roads
        
        # Brick paths in top-left quadrant
        brick_y_top = self.world_height // 6
        for x in range(64, self.world_width // 4 - 150, 64):
            pathways.append({"x": x, "y": brick_y_top, "type": "brick_path"})
        
        brick_x_left = self.world_width // 8
        for y in range(64, self.world_height // 2 - 150, 64):
            pathways.append({"x": brick_x_left, "y": y, "type": "brick_path"})
        
        # Brick paths in top-right quadrant
        brick_y_top_right = self.world_height // 6
        for x in range((self.world_width * 3) // 4 + 150, self.world_width - 64, 64):
            pathways.append({"x": x, "y": brick_y_top_right, "type": "brick_path"})
        
        brick_x_right = (self.world_width * 7) // 8
        for y in range(64, self.world_height // 2 - 150, 64):
            pathways.append({"x": brick_x_right, "y": y, "type": "brick_path"})
        
        # Brick paths in bottom-left quadrant
        brick_y_bottom = (self.world_height * 5) // 6
        for x in range(64, self.world_width // 4 - 150, 64):
            pathways.append({"x": x, "y": brick_y_bottom, "type": "brick_path"})
        
        for y in range(self.world_height // 2 + 150, self.world_height - 64, 64):
            pathways.append({"x": brick_x_left, "y": y, "type": "brick_path"})
        
        # Brick paths in bottom-right quadrant
        for x in range((self.world_width * 3) // 4 + 150, self.world_width - 64, 64):
            pathways.append({"x": x, "y": brick_y_bottom, "type": "brick_path"})
        
        for y in range(self.world_height // 2 + 150, self.world_height - 64, 64):
            pathways.append({"x": brick_x_right, "y": y, "type": "brick_path"})
        
        return pathways
    
    def is_on_pathway(self, x, y, buffer=100):
        """Check if position is on or near a pathway"""
        # Cobblestone main roads
        main_road_y = self.world_height // 2 - 32
        if main_road_y - buffer < y < main_road_y + 128 + buffer:
            return True
        
        main_road_x = self.world_width // 2 - 32
        if main_road_x - buffer < x < main_road_x + 128 + buffer:
            return True
        
        # Left vertical cobblestone
        left_road_x = self.world_width // 4 - 32
        if left_road_x - buffer < x < left_road_x + 128 + buffer:
            return True
        
        # Right vertical cobblestone
        right_road_x = (self.world_width * 3) // 4 - 32
        if right_road_x - buffer < x < right_road_x + 128 + buffer:
            return True
        
        # Brick paths (approximate areas)
        brick_y_top = self.world_height // 6
        if brick_y_top - buffer < y < brick_y_top + 64 + buffer:
            return True
        
        brick_y_bottom = (self.world_height * 5) // 6
        if brick_y_bottom - buffer < y < brick_y_bottom + 64 + buffer:
            return True
        
        brick_x_left = self.world_width // 8
        if brick_x_left - buffer < x < brick_x_left + 64 + buffer:
            return True
        
        brick_x_right = (self.world_width * 7) // 8
        if brick_x_right - buffer < x < brick_x_right + 64 + buffer:
            return True
        
        return False
        
        return pathways
    
    def render(self):
        """Render game"""
        # Clear screen
        self.screen.fill(self.bg_color)
        
        # Draw world grid (for reference)
        self.draw_grid()
        
        # Draw pathways (ground layer - before grass)
        for pathway in self.pathways:
            screen_x = pathway["x"] - self.camera_x
            screen_y = pathway["y"] - self.camera_y
            if -64 < screen_x < self.width and -64 < screen_y < self.height:
                sprite = self.sprite_manager.get_sprite(pathway["type"])
                self.screen.blit(sprite, (screen_x, screen_y))
        
        # Draw grass (background layer)
        for grass in self.grass_tufts:
            screen_x = grass["x"] - self.camera_x
            screen_y = grass["y"] - self.camera_y
            if -24 < screen_x < self.width and -24 < screen_y < self.height:
                sprite = self.sprite_manager.get_sprite('grass')
                self.screen.blit(sprite, (screen_x - 12, screen_y - 12))
        
        # Draw bushes
        for bush in self.bushes:
            screen_x = bush["x"] - self.camera_x
            screen_y = bush["y"] - self.camera_y
            if -56 < screen_x < self.width and -56 < screen_y < self.height:
                sprite_name = 'bush' if bush["has_berries"] else 'bush_no_berries'
                sprite = self.sprite_manager.get_sprite(sprite_name)
                self.screen.blit(sprite, (screen_x - 28, screen_y - 28))
        
        # Draw fragments
        for fragment in self.fragments:
            if not fragment["collected"]:
                screen_x = fragment["x"] - self.camera_x
                screen_y = fragment["y"] - self.camera_y
                
                # Draw fragment sprite
                if "gem" in fragment["type"]:
                    sprite = self.sprite_manager.get_sprite('gem')
                    self.screen.blit(sprite, (screen_x - 10, screen_y - 10))
                else:
                    sprite = self.sprite_manager.get_sprite('crown_shard')
                    self.screen.blit(sprite, (screen_x - 12, screen_y - 12))
                
                # Glow effect
                glow_surf = pygame.Surface((30, 30), pygame.SRCALPHA)
                pygame.draw.circle(glow_surf, (255, 215, 0, 50), (15, 15), 15)
                self.screen.blit(glow_surf, (screen_x - 15, screen_y - 15))
        
        # Draw enemies
        for enemy in self.enemies:
            enemy.render(self.screen, self.camera_x, self.camera_y)
        
        # Draw creat (if visible)
        if self.creat.visible:
            self.creat.render(self.screen, self.camera_x, self.camera_y)
        
        # Draw player
        self.player.render(self.screen, self.camera_x, self.camera_y)
        
        # Draw trees (foreground layer)
        for tree in self.trees:
            screen_x = tree["x"] - self.camera_x
            screen_y = tree["y"] - self.camera_y
            if -80 < screen_x < self.width and -80 < screen_y < self.height:
                sprite = self.sprite_manager.get_sprite('tree')
                self.screen.blit(sprite, (screen_x - 40, screen_y - 40))
        
        # Draw berry trees (foreground layer)
        for berry_tree in self.berry_trees:
            screen_x = berry_tree["x"] - self.camera_x
            screen_y = berry_tree["y"] - self.camera_y
            if -80 < screen_x < self.width and -80 < screen_y < self.height:
                suffix = '' if berry_tree["has_berries"] else '_empty'
                sprite_name = f'berry_tree_{berry_tree["element"]}{suffix}'
                sprite = self.sprite_manager.get_sprite(sprite_name)
                self.screen.blit(sprite, (screen_x - 40, screen_y - 40))
        
        # Draw direction sign
        sign_x = self.direction_sign["x"] - self.camera_x
        sign_y = self.direction_sign["y"] - self.camera_y
        if -96 < sign_x < self.width and -96 < sign_y < self.height:
            sign_sprite = self.sprite_manager.get_sprite('direction_sign')
            self.screen.blit(sign_sprite, (sign_x - 48, sign_y - 48))
        
        # Draw UI (always on top)
        self.ui.render(self.screen)
        
        # Draw pause overlay
        if self.paused:
            self.draw_pause_overlay()
    
    def draw_grid(self):
        """Draw reference grid"""
        grid_size = 64
        
        # Vertical lines
        start_x = -(self.camera_x % grid_size)
        for x in range(int(start_x), self.width, grid_size):
            pygame.draw.line(self.screen, (40, 100, 55), (x, 0), (x, self.height), 1)
        
        # Horizontal lines
        start_y = -(self.camera_y % grid_size)
        for y in range(int(start_y), self.height, grid_size):
            pygame.draw.line(self.screen, (40, 100, 55), (0, y), (self.width, y), 1)
    
    def draw_pause_overlay(self):
        """Draw pause menu overlay"""
        # Semi-transparent overlay
        overlay = pygame.Surface((self.width, self.height))
        overlay.set_alpha(128)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        # Pause text
        font = pygame.font.Font(None, 72)
        text = font.render("PAUSED", True, (255, 255, 255))
        text_rect = text.get_rect(center=(self.width // 2, self.height // 2))
        self.screen.blit(text, text_rect)
        
        # Instructions
        font_small = pygame.font.Font(None, 36)
        instructions = [
            "ESC - Resume",
            "I - Inventory",
            "C - Crown Forge",
            "M - Map"
        ]
        
        y_offset = self.height // 2 + 60
        for instruction in instructions:
            text = font_small.render(instruction, True, (200, 200, 200))
            text_rect = text.get_rect(center=(self.width // 2, y_offset))
            self.screen.blit(text, text_rect)
            y_offset += 40
