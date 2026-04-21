#!/usr/bin/env python3
"""
Complete Ultimate Medieval Game - All features working including map
- Clean grass (not busy)
- 85% transparent chat (no background)
- Working inventory (I key)
- Proper loot drops and combat
- Arm swing animation
- Hover-only tooltips
- Working map system (M key)
- Detailed 48x48 medieval knight sprites
"""

import pygame
import sys
import os
import random
import math
import time
from typing import Dict, List, Optional, Tuple

# Initialize Pygame
pygame.init()

# Screen settings
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("🏰 Gather The Crown: Creats & Foes")

# Colors - Clean Medieval Theme
DARK_GREEN = (34, 100, 34)
LIGHT_GREEN = (50, 120, 50)
BROWN = (101, 67, 33)
DARK_BROWN = (62, 39, 35)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GOLD = (255, 215, 0)
STONE_GRAY = (128, 128, 128)
DARK_STONE = (64, 64, 64)
PARCHMENT = (245, 235, 215)
IRON_GRAY = (105, 105, 105)
LEATHER_BROWN = (139, 69, 19)
STEEL_BLUE = (70, 130, 180)

class LootDrop:
    """Loot that drops from enemies"""
    def __init__(self, x, y, loot_type, value, name="Loot"):
        self.x = x
        self.y = y
        self.loot_type = loot_type  # 'gold', 'item'
        self.value = value
        self.name = name
        self.collected = False
        self.spawn_time = time.time()
        self.bob_offset = 0
    
    def update(self, dt):
        """Update loot animation"""
        self.bob_offset = math.sin((time.time() - self.spawn_time) * 3) * 3
    
    def draw(self, surface):
        """Draw the loot drop"""
        if self.collected:
            return
        
        draw_y = self.y + self.bob_offset
        
        if self.loot_type == 'gold':
            # Gold coin with shine
            pygame.draw.circle(surface, GOLD, (int(self.x), int(draw_y)), 6)
            pygame.draw.circle(surface, (255, 255, 0), (int(self.x), int(draw_y)), 6, 2)
            pygame.draw.circle(surface, WHITE, (int(self.x - 2), int(draw_y - 2)), 2)
        else:
            # Item drop
            pygame.draw.rect(surface, (100, 100, 255), (self.x - 4, draw_y - 4, 8, 8))
            pygame.draw.rect(surface, WHITE, (self.x - 4, draw_y - 4, 8, 8), 1)

class MapSystem:
    """Interactive map system with multiple view levels"""
    
    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.is_visible = False
        self.view_mode = "local"  # "local", "regional", "world"
        self.zoom_level = 1.0  # 1.0 = normal, 2.0 = zoomed in, 0.5 = zoomed out
        self.map_scale = 0.7  # Larger map scale (70% of screen)
        self.map_width = int(screen_width * self.map_scale)
        self.map_height = int(screen_height * self.map_scale)
        
        # Try to load parchment background
        self.parchment_bg = None
        try:
            self.parchment_bg = pygame.image.load("assets/ui/parchment_map.png").convert_alpha()
            print("📜 Loaded parchment background successfully!")
        except:
            print("📜 Parchment background not found, using enhanced procedural background")
            # Create a procedural parchment background that looks like the image
            self.parchment_bg = self.create_procedural_parchment()
        
        # Pan/drag state
        self.is_dragging = False
        self.drag_start_x = 0
        self.drag_start_y = 0
        self.pan_offset_x = 0
        self.pan_offset_y = 0
        
        # Route highlighting
        self.selected_destination = None
        self.route_path = []
        
        # Map position (center of screen)
        self.map_x = (screen_width - self.map_width) // 2
        self.map_y = (screen_height - self.map_height) // 2
        
        # Dragging state
        self.is_dragging = False
        self.drag_offset_x = 0
        self.drag_offset_y = 0
        
        # Map areas (clickable regions) - repositioned for larger map
        self.map_areas = [
            {"name": "Whispering Woods", "x": 0.15, "y": 0.25, "world_x": 200, "world_y": 200},
            {"name": "Ancient Ruins", "x": 0.75, "y": 0.15, "world_x": 900, "world_y": 150},
            {"name": "Dark Hollow", "x": 0.1, "y": 0.75, "world_x": 150, "world_y": 500},
            {"name": "Crystal Caverns", "x": 0.85, "y": 0.8, "world_x": 1000, "world_y": 550},
            {"name": "Crown Keep", "x": 0.5, "y": 0.45, "world_x": 640, "world_y": 360},
            {"name": "Moonlit Glade", "x": 0.3, "y": 0.6, "world_x": 350, "world_y": 420},
            {"name": "Shadowmere Lake", "x": 0.65, "y": 0.55, "world_x": 800, "world_y": 400}
        ]
        
        # Font for map
        try:
            self.font = pygame.font.Font(None, 18)
            self.title_font = pygame.font.Font(None, 32)
            self.area_font = pygame.font.Font(None, 16)
        except:
            self.font = pygame.font.SysFont("arial", 14)
            self.title_font = pygame.font.SysFont("arial", 24)
            self.area_font = pygame.font.SysFont("arial", 12)
        
        # Animation elements
        self.area_pulse_timer = 0
        self.hovered_area = None
        self.discovered_areas = set()  # Track discovered areas
        
        # Fast travel system
        self.fast_travel_enabled = True
        self.travel_confirmation = None  # Area to travel to
        self.travel_timer = 0
        
        # Minimap settings
        self.minimap_enabled = True
        self.minimap_size = 150
        self.minimap_x = screen_width - self.minimap_size - 20
        self.minimap_y = 20
    
    def create_procedural_parchment(self):
        """Create a procedural parchment background that looks like aged paper"""
        # Create a surface for the parchment
        parchment = pygame.Surface((self.map_width, self.map_height), pygame.SRCALPHA)
        
        # Base parchment colors - aged paper look
        base_color = (245, 235, 215)  # Light cream
        aged_color = (220, 200, 170)  # Darker aged areas
        edge_color = (180, 150, 120)  # Dark edges
        
        # Fill with base color
        parchment.fill(base_color)
        
        # Add aged gradient from edges
        for i in range(30):
            alpha = int(255 * (30 - i) / 30 * 0.2)  # Fade from edges
            edge_surf = pygame.Surface((self.map_width, self.map_height), pygame.SRCALPHA)
            
            # Top and bottom edges
            pygame.draw.rect(edge_surf, (*aged_color, alpha), (0, 0, self.map_width, i))
            pygame.draw.rect(edge_surf, (*aged_color, alpha), (0, self.map_height - i, self.map_width, i))
            
            # Left and right edges
            pygame.draw.rect(edge_surf, (*aged_color, alpha), (0, 0, i, self.map_height))
            pygame.draw.rect(edge_surf, (*aged_color, alpha), (self.map_width - i, 0, i, self.map_height))
            
            parchment.blit(edge_surf, (0, 0))
        
        # Add some burn marks and age spots like in the image
        import random
        random.seed(42)  # Consistent random for same look each time
        
        age_spots = [
            (self.map_width * 0.2, self.map_height * 0.3, 20),
            (self.map_width * 0.7, self.map_height * 0.6, 15),
            (self.map_width * 0.4, self.map_height * 0.8, 18),
            (self.map_width * 0.8, self.map_height * 0.2, 12),
            (self.map_width * 0.1, self.map_height * 0.7, 25)
        ]
        
        for spot_x, spot_y, spot_size in age_spots:
            # Create gradient spot
            for r in range(spot_size, 0, -2):
                alpha = int(255 * (spot_size - r) / spot_size * 0.3)
                spot_surf = pygame.Surface((r * 2, r * 2), pygame.SRCALPHA)
                pygame.draw.circle(spot_surf, (*aged_color, alpha), (r, r), r)
                parchment.blit(spot_surf, (spot_x - r, spot_y - r))
        
        # Add fold lines like in the image
        fold_color = (200, 180, 150)
        # Horizontal fold
        pygame.draw.line(parchment, fold_color, 
                        (20, self.map_height * 0.6), 
                        (self.map_width - 20, self.map_height * 0.6), 3)
        # Vertical fold
        pygame.draw.line(parchment, fold_color, 
                        (self.map_width * 0.3, 20), 
                        (self.map_width * 0.3, self.map_height - 20), 3)
        
        # Add more realistic aging effects
        # Coffee stains
        stain_color = (180, 160, 130)
        coffee_stains = [
            (self.map_width * 0.8, self.map_height * 0.3, 15),
            (self.map_width * 0.2, self.map_height * 0.8, 12),
            (self.map_width * 0.6, self.map_height * 0.1, 8)
        ]
        
        for stain_x, stain_y, stain_size in coffee_stains:
            for r in range(stain_size, 0, -1):
                alpha = int(255 * (stain_size - r) / stain_size * 0.4)
                stain_surf = pygame.Surface((r * 2, r * 2), pygame.SRCALPHA)
                pygame.draw.circle(stain_surf, (*stain_color, alpha), (r, r), r)
                parchment.blit(stain_surf, (stain_x - r, stain_y - r))
        
        # Ink blots and smudges
        ink_color = (120, 100, 80)
        ink_spots = [
            (self.map_width * 0.9, self.map_height * 0.7, 6),
            (self.map_width * 0.1, self.map_height * 0.2, 4),
            (self.map_width * 0.7, self.map_height * 0.9, 5)
        ]
        
        for ink_x, ink_y, ink_size in ink_spots:
            pygame.draw.circle(parchment, ink_color, (int(ink_x), int(ink_y)), ink_size)
            # Add small splatter around main blot
            for i in range(3):
                splatter_x = ink_x + random.randint(-ink_size*2, ink_size*2)
                splatter_y = ink_y + random.randint(-ink_size*2, ink_size*2)
                pygame.draw.circle(parchment, ink_color, (int(splatter_x), int(splatter_y)), 1)
        
        # Worn edges with irregular tears
        edge_wear_color = (160, 140, 110)
        # Top edge wear
        for i in range(0, self.map_width, 20):
            wear_height = random.randint(2, 8)
            pygame.draw.rect(parchment, edge_wear_color, (i, 0, 15, wear_height))
        
        # Bottom edge wear  
        for i in range(0, self.map_width, 25):
            wear_height = random.randint(2, 6)
            pygame.draw.rect(parchment, edge_wear_color, (i, self.map_height - wear_height, 18, wear_height))
        
        # Add subtle texture with tiny dots
        texture_color = (210, 190, 160)
        for _ in range(200):
            dot_x = random.randint(0, self.map_width)
            dot_y = random.randint(0, self.map_height)
            pygame.draw.circle(parchment, texture_color, (dot_x, dot_y), 1)
        
        return parchment
    
    def draw_roads_and_landmarks(self, surface):
        """Draw roads connecting areas and landmark details"""
        # Road color - subtle worn dirt path
        road_color = (180, 160, 130)
        road_width = 2  # Thinner roads
        
        # Define road connections (from area index to area index)
        roads = [
            (0, 4),  # Whispering Woods to Crown Keep
            (4, 1),  # Crown Keep to Ancient Ruins  
            (4, 5),  # Crown Keep to Moonlit Glade
            (5, 6),  # Moonlit Glade to Shadowmere Lake
            (6, 3),  # Shadowmere Lake to Crystal Caverns
            (2, 5),  # Dark Hollow to Moonlit Glade
            (0, 2),  # Whispering Woods to Dark Hollow
        ]
        
        # Draw roads
        for start_idx, end_idx in roads:
            if start_idx < len(self.map_areas) and end_idx < len(self.map_areas):
                start_area = self.map_areas[start_idx]
                end_area = self.map_areas[end_idx]
                
                start_x = self.map_x + int(start_area["x"] * self.map_width)
                start_y = self.map_y + int(start_area["y"] * self.map_height)
                end_x = self.map_x + int(end_area["x"] * self.map_width)
                end_y = self.map_y + int(end_area["y"] * self.map_height)
                
                # Draw road with slight curve for realism (using consistent seed for roads)
                road_seed = hash((start_idx, end_idx)) % 1000
                random.seed(road_seed)
                mid_x = (start_x + end_x) // 2 + random.randint(-20, 20)
                mid_y = (start_y + end_y) // 2 + random.randint(-20, 20)
                random.seed()  # Reset to random
                
                # Draw road segments
                pygame.draw.line(surface, road_color, (start_x, start_y), (mid_x, mid_y), road_width)
                pygame.draw.line(surface, road_color, (mid_x, mid_y), (end_x, end_y), road_width)
                
                # Add road markers (small stones)
                for i in range(3):
                    marker_x = start_x + (mid_x - start_x) * (i + 1) // 4
                    marker_y = start_y + (mid_y - start_y) * (i + 1) // 4
                    pygame.draw.circle(surface, (120, 100, 80), (marker_x, marker_y), 2)
        
        # Draw landmarks
        landmark_color = (100, 80, 60)
        
        # Add some scattered landmarks
        landmarks = [
            {"x": 0.3, "y": 0.4, "type": "tower", "name": "Watchtower"},
            {"x": 0.6, "y": 0.3, "type": "bridge", "name": "Stone Bridge"},
            {"x": 0.4, "y": 0.7, "type": "shrine", "name": "Ancient Shrine"},
            {"x": 0.8, "y": 0.5, "type": "camp", "name": "Traveler's Rest"},
        ]
        
        for landmark in landmarks:
            x = self.map_x + int(landmark["x"] * self.map_width)
            y = self.map_y + int(landmark["y"] * self.map_height)
            
            if landmark["type"] == "tower":
                # Draw tower
                pygame.draw.rect(surface, landmark_color, (x-3, y-8, 6, 12))
                pygame.draw.polygon(surface, landmark_color, [(x-4, y-8), (x, y-12), (x+4, y-8)])
            elif landmark["type"] == "bridge":
                # Draw bridge
                pygame.draw.rect(surface, landmark_color, (x-8, y-2, 16, 4))
                pygame.draw.circle(surface, (100, 150, 200), (x, y+8), 12, 2)  # River
            elif landmark["type"] == "shrine":
                # Draw shrine
                pygame.draw.circle(surface, landmark_color, (x, y), 4)
                pygame.draw.line(surface, landmark_color, (x, y-8), (x, y+8), 2)
            elif landmark["type"] == "camp":
                # Draw campfire
                pygame.draw.circle(surface, (80, 40, 20), (x, y), 3)
                pygame.draw.circle(surface, (200, 100, 50), (x, y), 2)
    
    def update(self, dt):
        """Update map animations"""
        self.area_pulse_timer += dt * 2  # Pulse speed
        if self.area_pulse_timer > 2 * math.pi:
            self.area_pulse_timer = 0
        
        # Update travel timer
        if self.travel_timer > 0:
            self.travel_timer -= dt
    
    def initiate_fast_travel(self, destination):
        """Initiate fast travel to a destination"""
        self.travel_confirmation = destination
        self.travel_timer = 3.0  # 3 second confirmation window
        return f"Fast travel to {destination['name']}? Click again to confirm (3s)"
    
    def execute_fast_travel(self, game_instance):
        """Execute the fast travel"""
        if self.travel_confirmation:
            # Move player to destination
            game_instance.player_x = self.travel_confirmation["x"]
            game_instance.player_y = self.travel_confirmation["y"]
            
            # Add area to discovered if not already
            self.discovered_areas.add(self.travel_confirmation["name"])
            
            # Clear confirmation
            destination_name = self.travel_confirmation["name"]
            self.travel_confirmation = None
            self.travel_timer = 0
            
            return f"Traveled to {destination_name}!"
        return None
    
    def draw_minimap(self, surface, player_x, player_y, trees, creatures, treasures):
        """Draw a small minimap in the corner during gameplay"""
        if not self.minimap_enabled or self.is_visible:
            return
        
        # Minimap background
        minimap_rect = pygame.Rect(self.minimap_x, self.minimap_y, self.minimap_size, self.minimap_size)
        
        # Semi-transparent background
        minimap_bg = pygame.Surface((self.minimap_size, self.minimap_size), pygame.SRCALPHA)
        minimap_bg.fill((0, 0, 0, 120))
        surface.blit(minimap_bg, (self.minimap_x, self.minimap_y))
        
        # Border
        pygame.draw.rect(surface, (101, 67, 33), minimap_rect, 2)
        
        # Scale factor for minimap
        world_size = 1280  # Assume world is 1280x720
        scale = self.minimap_size / world_size
        
        # Draw areas on minimap
        for area in self.map_areas:
            mini_x = self.minimap_x + area["world_x"] * scale
            mini_y = self.minimap_y + area["world_y"] * scale
            
            # Small area marker
            pygame.draw.circle(surface, (255, 215, 0), (int(mini_x), int(mini_y)), 3)
            pygame.draw.circle(surface, (101, 67, 33), (int(mini_x), int(mini_y)), 3, 1)
        
        # Draw player position
        player_mini_x = self.minimap_x + player_x * scale
        player_mini_y = self.minimap_y + player_y * scale
        
        # Ensure player dot stays within minimap bounds
        player_mini_x = max(self.minimap_x + 2, min(self.minimap_x + self.minimap_size - 2, player_mini_x))
        player_mini_y = max(self.minimap_y + 2, min(self.minimap_y + self.minimap_size - 2, player_mini_y))
        
        pygame.draw.circle(surface, (0, 150, 255), (int(player_mini_x), int(player_mini_y)), 4)
        pygame.draw.circle(surface, WHITE, (int(player_mini_x), int(player_mini_y)), 4, 1)
        
        # Draw nearby enemies on minimap
        for creature in creatures:
            if creature.get('health', 0) > 0:  # Only living creatures
                creature_mini_x = self.minimap_x + creature['x'] * scale
                creature_mini_y = self.minimap_y + creature['y'] * scale
                
                # Check if within minimap bounds
                if (self.minimap_x <= creature_mini_x <= self.minimap_x + self.minimap_size and
                    self.minimap_y <= creature_mini_y <= self.minimap_y + self.minimap_size):
                    pygame.draw.circle(surface, (255, 100, 100), (int(creature_mini_x), int(creature_mini_y)), 2)
        
        # Minimap title
        title_text = self.area_font.render("Map", True, WHITE)
        surface.blit(title_text, (self.minimap_x + 5, self.minimap_y - 18))
    
    def toggle(self):
        """Toggle map visibility"""
        self.is_visible = not self.is_visible
    
    def change_view(self, view_mode):
        """Change map view mode"""
        if view_mode in ["local", "regional", "world"]:
            self.view_mode = view_mode
    
    def world_to_map(self, world_x, world_y):
        """Convert world coordinates to map coordinates"""
        map_local_x = (world_x / self.screen_width) * self.map_width
        map_local_y = (world_y / self.screen_height) * self.map_height
        return (self.map_x + map_local_x, self.map_y + map_local_y)
    
    def map_to_world(self, map_x, map_y):
        """Convert map coordinates to world coordinates"""
        local_x = map_x - self.map_x
        local_y = map_y - self.map_y
        world_x = (local_x / self.map_width) * self.screen_width
        world_y = (local_y / self.map_height) * self.screen_height
        return (world_x, world_y)
    
    def handle_click(self, pos, button=1):
        """Handle map clicks for route selection and dragging"""
        if not self.is_visible:
            return None
        
        mouse_x, mouse_y = pos
        map_rect = pygame.Rect(self.map_x, self.map_y, self.map_width, self.map_height)
        
        if map_rect.collidepoint(mouse_x, mouse_y):
            if button == 1:  # Left click
                # Only allow clicking on marked locations based on view mode
                if self.view_mode == "local":
                    # Check named areas in local view
                    for area in self.map_areas:
                        area_x = self.map_x + area["x"] * self.map_width
                        area_y = self.map_y + area["y"] * self.map_height
                        
                        if abs(mouse_x - area_x) < 30 and abs(mouse_y - area_y) < 30:
                            # Check if fast travel is enabled and area is discovered
                            if self.fast_travel_enabled and (area["name"] in self.discovered_areas or len(self.discovered_areas) == 0):
                                return {"type": "fast_travel", "x": area["world_x"], "y": area["world_y"], "name": area["name"]}
                            else:
                                return {"type": "route", "x": area["world_x"], "y": area["world_y"], "name": area["name"]}
                
                elif self.view_mode == "regional":
                    # Check kingdoms in regional view
                    kingdoms = [
                        {"name": "Northern Realm", "x": 0.25, "y": 0.25, "world_x": 320, "world_y": 180},
                        {"name": "Eastern Lands", "x": 0.75, "y": 0.35, "world_x": 960, "world_y": 252},
                        {"name": "Southern Wastes", "x": 0.55, "y": 0.75, "world_x": 704, "world_y": 540},
                        {"name": "Western Forests", "x": 0.2, "y": 0.65, "world_x": 256, "world_y": 468},
                        {"name": "Central Kingdom", "x": 0.5, "y": 0.5, "world_x": 640, "world_y": 360}
                    ]
                    
                    for kingdom in kingdoms:
                        kingdom_x = self.map_x + kingdom["x"] * self.map_width
                        kingdom_y = self.map_y + kingdom["y"] * self.map_height
                        
                        if abs(mouse_x - kingdom_x) < 25 and abs(mouse_y - kingdom_y) < 25:
                            return {"type": "route", "x": kingdom["world_x"], "y": kingdom["world_y"], "name": kingdom["name"]}
                
                elif self.view_mode == "world":
                    # Check continents in world view
                    continents = [
                        {"name": "Frostlands", "x": 0.25, "y": 0.15, "world_x": 320, "world_y": 108},
                        {"name": "Eastern Empire", "x": 0.8, "y": 0.35, "world_x": 1024, "world_y": 252},
                        {"name": "Volcanic Isles", "x": 0.7, "y": 0.75, "world_x": 896, "world_y": 540},
                        {"name": "Emerald Coast", "x": 0.15, "y": 0.65, "world_x": 192, "world_y": 468},
                        {"name": "The Crown Realm", "x": 0.5, "y": 0.45, "world_x": 640, "world_y": 324}
                    ]
                    
                    for continent in continents:
                        cont_x = self.map_x + continent["x"] * self.map_width
                        cont_y = self.map_y + continent["y"] * self.map_height
                        
                        if abs(mouse_x - cont_x) < 40 and abs(mouse_y - cont_y) < 40:
                            return {"type": "route", "x": continent["world_x"], "y": continent["world_y"], "name": continent["name"]}
                
                # If no marked location was clicked, return None (no route)
                return None
        
        return None
    
    def start_drag(self, pos):
        """Start dragging the map"""
        if self.is_visible:
            self.is_dragging = True
            self.drag_start_x, self.drag_start_y = pos
    
    def end_drag(self):
        """End dragging the map"""
        self.is_dragging = False
    
    def update_drag(self, pos):
        """Update map position during drag"""
        if self.is_dragging:
            mouse_x, mouse_y = pos
            dx = mouse_x - self.drag_start_x
            dy = mouse_y - self.drag_start_y
            
            # Update pan offset
            self.pan_offset_x += dx
            self.pan_offset_y += dy
            
            # Update drag start position
            self.drag_start_x, self.drag_start_y = pos
    
    def update_zoom(self):
        """Update map dimensions based on zoom level"""
        base_width = int(self.screen_width * self.map_scale)
        base_height = int(self.screen_height * self.map_scale)
        
        self.map_width = int(base_width * self.zoom_level)
        self.map_height = int(base_height * self.zoom_level)
        
        # Keep map centered
        self.map_x = (self.screen_width - self.map_width) // 2
        self.map_y = (self.screen_height - self.map_height) // 2
    
    def draw_local_view(self, surface, player_x, player_y, trees, creatures, treasures):
        """Draw local area view with immediate surroundings"""
        # Draw named areas with special markers and animations
        for i, area in enumerate(self.map_areas):
            area_x = self.map_x + area["x"] * self.map_width
            area_y = self.map_y + area["y"] * self.map_height
            
            # Check if area is discovered (for now, all are discovered)
            is_discovered = True
            
            # Pulse effect for discovered areas
            pulse_factor = 1.0
            if is_discovered:
                pulse_factor = 1.0 + 0.2 * math.sin(self.area_pulse_timer + i * 0.5)
            
            # Area marker with pulse - much smaller and cleaner
            base_radius = 6  # Reduced from 12
            pulse_radius = int(base_radius * pulse_factor)
            
            # Subtle outer glow for discovered areas
            if is_discovered:
                glow_radius = int(pulse_radius + 2)
                glow_surface = pygame.Surface((glow_radius * 2, glow_radius * 2), pygame.SRCALPHA)
                pygame.draw.circle(glow_surface, (255, 215, 0, 40), (glow_radius, glow_radius), glow_radius)
                surface.blit(glow_surface, (int(area_x) - glow_radius, int(area_y) - glow_radius))
            
            # Main area marker - smaller and cleaner
            pygame.draw.circle(surface, (200, 150, 50), (int(area_x), int(area_y)), pulse_radius)
            pygame.draw.circle(surface, (255, 215, 0), (int(area_x), int(area_y)), max(1, int(pulse_radius * 0.5)))
            pygame.draw.circle(surface, (101, 67, 33), (int(area_x), int(area_y)), pulse_radius, 1)
            
            # Special marker for important areas - smaller crown
            if "Keep" in area["name"] or "Crown" in area["name"]:
                # Small crown symbol
                crown_points = [
                    (int(area_x), int(area_y) - 2),
                    (int(area_x) - 2, int(area_y)),
                    (int(area_x) + 2, int(area_y)),
                    (int(area_x) - 1, int(area_y) + 1),
                    (int(area_x) + 1, int(area_y) + 1)
                ]
                pygame.draw.polygon(surface, GOLD, crown_points)
            
            # Area name - ensure it stays within map bounds
            name_text = self.area_font.render(area["name"], True, (101, 67, 33))
            text_rect = name_text.get_rect()
            text_rect.centerx = int(area_x)
            text_rect.y = int(area_y) + 12  # Closer to marker
            
            # Keep text within map bounds
            if text_rect.right > self.map_x + self.map_width - 5:
                text_rect.right = self.map_x + self.map_width - 5
            if text_rect.left < self.map_x + 5:
                text_rect.left = self.map_x + 5
            if text_rect.bottom > self.map_y + self.map_height - 5:
                text_rect.y = int(area_y) - 20  # Put above marker instead
            
            # Text background with slight transparency
            bg_rect = text_rect.inflate(4, 2)
            bg_surface = pygame.Surface((bg_rect.width, bg_rect.height), pygame.SRCALPHA)
            bg_surface.fill((240, 230, 210, 180))
            surface.blit(bg_surface, bg_rect)
            surface.blit(name_text, text_rect)
        
        # Draw local paths between areas using predefined connections
        # Define specific connections to avoid routes going off the map
        local_connections = [
            (0, 4),  # Whispering Woods to Crown Keep
            (4, 1),  # Crown Keep to Ancient Ruins  
            (4, 5),  # Crown Keep to Moonlit Glade
            (5, 6),  # Moonlit Glade to Shadowmere Lake
            (6, 3),  # Shadowmere Lake to Crystal Caverns
            (2, 5),  # Dark Hollow to Moonlit Glade
            (0, 2),  # Whispering Woods to Dark Hollow
        ]
        
        for start_idx, end_idx in local_connections:
            if start_idx < len(self.map_areas) and end_idx < len(self.map_areas):
                area1 = self.map_areas[start_idx]
                area2 = self.map_areas[end_idx]
                
                area1_x = self.map_x + area1["x"] * self.map_width
                area1_y = self.map_y + area1["y"] * self.map_height
                area2_x = self.map_x + area2["x"] * self.map_width
                area2_y = self.map_y + area2["y"] * self.map_height
                
                # Ensure both points are within map bounds
                if (self.map_x <= area1_x <= self.map_x + self.map_width and
                    self.map_y <= area1_y <= self.map_y + self.map_height and
                    self.map_x <= area2_x <= self.map_x + self.map_width and
                    self.map_y <= area2_y <= self.map_y + self.map_height):
                    
                    # Calculate distance for path styling
                    distance = math.sqrt((area2_x - area1_x)**2 + (area2_y - area1_y)**2)
                    
                    if distance < self.map_width * 0.3:  # Close areas - thick path
                        width = 4
                        color = (139, 69, 19)
                    else:  # Distant areas - medium path
                        width = 3
                        color = (160, 82, 45)
                    
                    # Draw path with slight curve for realism
                    mid_x = (area1_x + area2_x) // 2
                    mid_y = (area1_y + area2_y) // 2
                    
                    # Add slight curve based on connection index for variety
                    curve_offset = (start_idx + end_idx) % 3 - 1  # -1, 0, or 1
                    mid_x += curve_offset * 15
                    mid_y += curve_offset * 10
                    
                    # Draw curved path in two segments
                    pygame.draw.line(surface, color, (area1_x, area1_y), (mid_x, mid_y), width)
                    pygame.draw.line(surface, color, (mid_x, mid_y), (area2_x, area2_y), width)
        
        # Draw trees on map
        for tree in trees:
            map_pos = self.world_to_map(tree['x'], tree['y'])
            if self.map_x <= map_pos[0] <= self.map_x + self.map_width and self.map_y <= map_pos[1] <= self.map_y + self.map_height:
                pygame.draw.circle(surface, (20, 80, 20), (int(map_pos[0]), int(map_pos[1])), 3)
        
        # Draw creatures on map
        for creature in creatures:
            if creature['alive']:
                map_pos = self.world_to_map(creature['x'], creature['y'])
                if self.map_x <= map_pos[0] <= self.map_x + self.map_width and self.map_y <= map_pos[1] <= self.map_y + self.map_height:
                    pygame.draw.circle(surface, (255, 100, 100), (int(map_pos[0]), int(map_pos[1])), 4)
                    pygame.draw.circle(surface, (150, 50, 50), (int(map_pos[0]), int(map_pos[1])), 4, 1)
        
        # Draw treasures on map
        for treasure in treasures:
            if not treasure['collected']:
                map_pos = self.world_to_map(treasure['x'], treasure['y'])
                if self.map_x <= map_pos[0] <= self.map_x + self.map_width and self.map_y <= map_pos[1] <= self.map_y + self.map_height:
                    pygame.draw.circle(surface, GOLD, (int(map_pos[0]), int(map_pos[1])), 3)
                    pygame.draw.circle(surface, (255, 255, 0), (int(map_pos[0]), int(map_pos[1])), 3, 1)
    
    def draw_regional_view(self, surface, player_x, player_y):
        """Draw regional view showing kingdoms with detailed roads and landmarks like Local view"""
        
        # Define the 10 kingdoms with their connections
        kingdoms = [
            {"name": "Spawn Flatlands", "x": 0.5, "y": 0.8, "world_x": 640, "world_y": 576, "type": "spawn"},
            {"name": "Crown Keep (Home Base)", "x": 0.5, "y": 0.3, "world_x": 640, "world_y": 216, "type": "home"},
            {"name": "Forest Trial Grounds", "x": 0.8, "y": 0.5, "world_x": 1024, "world_y": 360, "type": "trials"},
            {"name": "Northern Frostlands", "x": 0.3, "y": 0.1, "world_x": 384, "world_y": 72, "type": "kingdom"},
            {"name": "Eastern Highlands", "x": 0.9, "y": 0.2, "world_x": 1152, "world_y": 144, "type": "kingdom"},
            {"name": "Southern Marshes", "x": 0.7, "y": 0.9, "world_x": 896, "world_y": 648, "type": "kingdom"},
            {"name": "Western Valleys", "x": 0.1, "y": 0.6, "world_x": 128, "world_y": 432, "type": "kingdom"},
            {"name": "Crystal Mountains", "x": 0.2, "y": 0.3, "world_x": 256, "world_y": 216, "type": "kingdom"},
            {"name": "Shadow Realm", "x": 0.8, "y": 0.8, "world_x": 1024, "world_y": 576, "type": "kingdom"},
            {"name": "Golden Plains", "x": 0.4, "y": 0.6, "world_x": 512, "world_y": 432, "type": "kingdom"}
        ]
        
        # Draw roads connecting kingdoms (similar to Local view style)
        road_color = (140, 120, 80)
        road_width = 6
        
        # Main path network based on your design
        kingdom_roads = [
            (0, 1),  # Spawn to Home Base (UP path)
            (0, 2),  # Spawn to Forest Trials (RIGHT path) 
            (2, 1),  # Forest Trials to Home Base (complete the triangle)
            (1, 3),  # Home Base to Northern Frostlands
            (1, 7),  # Home Base to Crystal Mountains
            (2, 4),  # Forest Trials to Eastern Highlands
            (2, 8),  # Forest Trials to Shadow Realm
            (0, 9),  # Spawn to Golden Plains
            (9, 6),  # Golden Plains to Western Valleys
            (5, 8),  # Southern Marshes to Shadow Realm
            (3, 7),  # Northern Frostlands to Crystal Mountains
            (4, 5),  # Eastern Highlands to Southern Marshes
        ]
        
        # Draw roads with curves
        for start_idx, end_idx in kingdom_roads:
            if start_idx < len(kingdoms) and end_idx < len(kingdoms):
                start_kingdom = kingdoms[start_idx]
                end_kingdom = kingdoms[end_idx]
                
                start_x = self.map_x + start_kingdom["x"] * self.map_width
                start_y = self.map_y + start_kingdom["y"] * self.map_height
                end_x = self.map_x + end_kingdom["x"] * self.map_width
                end_y = self.map_y + end_kingdom["y"] * self.map_height
                
                # Curved roads for realism
                road_seed = hash((start_idx, end_idx)) % 1000
                random.seed(road_seed)
                mid_x = (start_x + end_x) // 2 + random.randint(-30, 30)
                mid_y = (start_y + end_y) // 2 + random.randint(-30, 30)
                random.seed()
                
                # Draw road segments
                pygame.draw.line(surface, road_color, (start_x, start_y), (mid_x, mid_y), road_width)
                pygame.draw.line(surface, road_color, (mid_x, mid_y), (end_x, end_y), road_width)
                
                # Road markers
                for i in range(4):
                    marker_x = start_x + (mid_x - start_x) * (i + 1) // 5
                    marker_y = start_y + (mid_y - start_y) * (i + 1) // 5
                    pygame.draw.circle(surface, (100, 80, 60), (marker_x, marker_y), 3)
        
        # Draw kingdoms with detailed markers like Local view
        for i, kingdom in enumerate(kingdoms):
            kingdom_x = self.map_x + kingdom["x"] * self.map_width
            kingdom_y = self.map_y + kingdom["y"] * self.map_height
            
            # Pulse effect
            pulse_factor = 1.0 + 0.15 * math.sin(self.area_pulse_timer + i * 0.7)
            base_radius = 18
            pulse_radius = int(base_radius * pulse_factor)
            
            # Kingdom-specific colors and markers
            if kingdom["type"] == "spawn":
                color = (100, 200, 100)  # Green for spawn
                symbol_color = (50, 150, 50)
            elif kingdom["type"] == "home":
                color = GOLD  # Gold for home base
                symbol_color = (180, 140, 30)
            elif kingdom["type"] == "trials":
                color = (200, 100, 50)  # Orange for trials
                symbol_color = (150, 70, 30)
            else:
                color = (150, 120, 200)  # Purple for other kingdoms
                symbol_color = (100, 80, 150)
            
            # Outer glow
            glow_radius = int(pulse_radius + 6)
            glow_surface = pygame.Surface((glow_radius * 2, glow_radius * 2), pygame.SRCALPHA)
            pygame.draw.circle(glow_surface, (*color, 80), (glow_radius, glow_radius), glow_radius)
            surface.blit(glow_surface, (int(kingdom_x) - glow_radius, int(kingdom_y) - glow_radius))
            
            # Main kingdom marker
            pygame.draw.circle(surface, color, (int(kingdom_x), int(kingdom_y)), pulse_radius)
            pygame.draw.circle(surface, symbol_color, (int(kingdom_x), int(kingdom_y)), int(pulse_radius * 0.7))
            pygame.draw.circle(surface, (101, 67, 33), (int(kingdom_x), int(kingdom_y)), pulse_radius, 3)
            
            # Special symbols
            if kingdom["type"] == "home":
                # Castle symbol
                castle_points = [
                    (int(kingdom_x) - 6, int(kingdom_y) + 4),
                    (int(kingdom_x) - 6, int(kingdom_y) - 2),
                    (int(kingdom_x) - 3, int(kingdom_y) - 5),
                    (int(kingdom_x), int(kingdom_y) - 2),
                    (int(kingdom_x) + 3, int(kingdom_y) - 5),
                    (int(kingdom_x) + 6, int(kingdom_y) - 2),
                    (int(kingdom_x) + 6, int(kingdom_y) + 4)
                ]
                pygame.draw.polygon(surface, WHITE, castle_points)
            elif kingdom["type"] == "spawn":
                # Crossed swords for spawn
                pygame.draw.line(surface, WHITE, 
                               (int(kingdom_x) - 4, int(kingdom_y) - 4), 
                               (int(kingdom_x) + 4, int(kingdom_y) + 4), 3)
                pygame.draw.line(surface, WHITE, 
                               (int(kingdom_x) + 4, int(kingdom_y) - 4), 
                               (int(kingdom_x) - 4, int(kingdom_y) + 4), 3)
            elif kingdom["type"] == "trials":
                # Tree symbol for forest trials
                pygame.draw.line(surface, WHITE, 
                               (int(kingdom_x), int(kingdom_y) - 6), 
                               (int(kingdom_x), int(kingdom_y) + 4), 3)
                pygame.draw.circle(surface, WHITE, (int(kingdom_x), int(kingdom_y) - 3), 4, 2)
            
            # Kingdom name
            name_text = self.area_font.render(kingdom["name"], True, (101, 67, 33))
            text_rect = name_text.get_rect()
            text_rect.center = (kingdom_x, kingdom_y + 25)
            
            # Text background
            bg_rect = text_rect.inflate(8, 4)
            bg_surface = pygame.Surface((bg_rect.width, bg_rect.height), pygame.SRCALPHA)
            bg_surface.fill((240, 230, 210, 220))
            surface.blit(bg_surface, bg_rect)
            surface.blit(name_text, text_rect)
        
        # Add regional landmarks
        regional_landmarks = [
            {"x": 0.6, "y": 0.4, "type": "mountain", "name": "Dragon Peak"},
            {"x": 0.3, "y": 0.7, "type": "lake", "name": "Mirror Lake"},
            {"x": 0.7, "y": 0.3, "type": "forest", "name": "Whispering Woods"},
            {"x": 0.4, "y": 0.2, "type": "ruins", "name": "Ancient Ruins"}
        ]
        
        for landmark in regional_landmarks:
            lm_x = self.map_x + landmark["x"] * self.map_width
            lm_y = self.map_y + landmark["y"] * self.map_height
            
            if landmark["type"] == "mountain":
                # Mountain peak
                peak_points = [(lm_x, lm_y - 8), (lm_x - 6, lm_y + 4), (lm_x + 6, lm_y + 4)]
                pygame.draw.polygon(surface, (120, 100, 80), peak_points)
            elif landmark["type"] == "lake":
                # Lake
                pygame.draw.circle(surface, (100, 150, 200), (int(lm_x), int(lm_y)), 8)
                pygame.draw.circle(surface, (80, 120, 180), (int(lm_x), int(lm_y)), 6)
            elif landmark["type"] == "forest":
                # Forest cluster
                for offset in [(-3, -2), (0, -4), (3, -2), (-2, 2), (2, 2)]:
                    tree_x, tree_y = lm_x + offset[0], lm_y + offset[1]
                    pygame.draw.circle(surface, (50, 100, 50), (int(tree_x), int(tree_y)), 3)
            elif landmark["type"] == "ruins":
                # Ruins
                pygame.draw.rect(surface, (100, 80, 60), (lm_x - 4, lm_y - 3, 8, 6))
                pygame.draw.rect(surface, (80, 60, 40), (lm_x - 2, lm_y - 6, 4, 3))
        mountains = [
            {"name": "Frostpeak Mountains", "x": 0.2, "y": 0.1, "width": 0.3, "height": 0.15},
            {"name": "Dragonspine Ridge", "x": 0.7, "y": 0.2, "width": 0.25, "height": 0.2},
            {"name": "Southern Peaks", "x": 0.4, "y": 0.8, "width": 0.35, "height": 0.12}
        ]
        
        for mountain in mountains:
            # Mountain range area
            mountain_rect = pygame.Rect(
                self.map_x + mountain["x"] * self.map_width,
                self.map_y + mountain["y"] * self.map_height,
                mountain["width"] * self.map_width,
                mountain["height"] * self.map_height
            )
            pygame.draw.rect(surface, (120, 100, 80), mountain_rect)
            
            # Mountain peaks
            for i in range(int(mountain["width"] * 8)):
                peak_x = mountain_rect.x + i * (mountain_rect.width / 8) + random.randint(-5, 5)
                peak_y = mountain_rect.y + random.randint(0, mountain_rect.height // 2)
                peak_height = random.randint(15, 25)
                
                # Draw triangular peak
                pygame.draw.polygon(surface, (140, 120, 100), [
                    (peak_x, peak_y + peak_height),
                    (peak_x - 8, peak_y + peak_height),
                    (peak_x - 4, peak_y)
                ])
                # Snow cap
                pygame.draw.polygon(surface, (240, 240, 240), [
                    (peak_x - 4, peak_y),
                    (peak_x - 6, peak_y + 5),
                    (peak_x - 2, peak_y + 5)
                ])
        
        # Water bodies
        water_bodies = [
            {"name": "Crystal Lake", "x": 0.15, "y": 0.4, "radius": 35, "type": "lake"},
            {"name": "Moonwater Bay", "x": 0.8, "y": 0.6, "radius": 40, "type": "bay"},
            {"name": "Silverflow River", "x": 0.5, "y": 0.3, "width": 0.4, "height": 0.05, "type": "river"}
        ]
        
        for water in water_bodies:
            if water["type"] == "river":
                # Draw winding river
                river_rect = pygame.Rect(
                    self.map_x + water["x"] * self.map_width - water["width"] * self.map_width / 2,
                    self.map_y + water["y"] * self.map_height,
                    water["width"] * self.map_width,
                    water["height"] * self.map_height
                )
                pygame.draw.rect(surface, (100, 150, 200), river_rect)
            else:
                # Draw lake or bay
                water_x = self.map_x + water["x"] * self.map_width
                water_y = self.map_y + water["y"] * self.map_height
                pygame.draw.circle(surface, (100, 150, 200), (int(water_x), int(water_y)), water["radius"])
        
        # Forest regions
        forests = [
            {"name": "Elderwood", "x": 0.1, "y": 0.6, "radius": 45},
            {"name": "Thornwood", "x": 0.6, "y": 0.4, "radius": 35},
            {"name": "Whisperleaf Grove", "x": 0.3, "y": 0.7, "radius": 30}
        ]
        
        for forest in forests:
            forest_x = self.map_x + forest["x"] * self.map_width
            forest_y = self.map_y + forest["y"] * self.map_height
            
            # Forest area
            pygame.draw.circle(surface, (60, 120, 60), (int(forest_x), int(forest_y)), forest["radius"], 3)
            
            # Tree symbols
            for i in range(8):
                angle = (i / 8) * 2 * math.pi
                tree_x = forest_x + math.cos(angle) * (forest["radius"] - 10)
                tree_y = forest_y + math.sin(angle) * (forest["radius"] - 10)
                pygame.draw.circle(surface, (40, 100, 40), (int(tree_x), int(tree_y)), 3)
        
        # Regional kingdoms
        kingdoms = [
            {"name": "Northern Realm", "x": 0.25, "y": 0.25, "color": (100, 150, 255)},
            {"name": "Eastern Lands", "x": 0.75, "y": 0.35, "color": (255, 150, 100)},
            {"name": "Southern Wastes", "x": 0.55, "y": 0.75, "color": (200, 100, 50)},
            {"name": "Western Forests", "x": 0.2, "y": 0.65, "color": (100, 200, 100)},
            {"name": "Central Kingdom", "x": 0.5, "y": 0.5, "color": (200, 200, 100)}
        ]
        
        # Draw regional trade routes (thicker for longer distances)
        trade_routes = [
            # Major routes (thick lines)
            {"from": kingdoms[0], "to": kingdoms[4], "width": 4, "color": (139, 69, 19)},  # North to Central
            {"from": kingdoms[1], "to": kingdoms[4], "width": 4, "color": (139, 69, 19)},  # East to Central
            {"from": kingdoms[3], "to": kingdoms[4], "width": 3, "color": (160, 82, 45)},  # West to Central
            # Secondary routes (thinner lines)
            {"from": kingdoms[0], "to": kingdoms[1], "width": 2, "color": (160, 82, 45)},  # North to East
            {"from": kingdoms[2], "to": kingdoms[4], "width": 3, "color": (160, 82, 45)},  # South to Central
            {"from": kingdoms[3], "to": kingdoms[0], "width": 2, "color": (160, 82, 45)},  # West to North
        ]
        
        for route in trade_routes:
            start_x = self.map_x + route["from"]["x"] * self.map_width
            start_y = self.map_y + route["from"]["y"] * self.map_height
            end_x = self.map_x + route["to"]["x"] * self.map_width
            end_y = self.map_y + route["to"]["y"] * self.map_height
            pygame.draw.line(surface, route["color"], (start_x, start_y), (end_x, end_y), route["width"])
        
        for kingdom in kingdoms:
            kingdom_x = self.map_x + kingdom["x"] * self.map_width
            kingdom_y = self.map_y + kingdom["y"] * self.map_height
            
            # Kingdom territory
            pygame.draw.circle(surface, kingdom["color"], (int(kingdom_x), int(kingdom_y)), 25, 2)
            
            # Kingdom castle
            pygame.draw.rect(surface, (150, 150, 150), (kingdom_x - 4, kingdom_y - 4, 8, 8))
            pygame.draw.polygon(surface, (100, 100, 100), [
                (kingdom_x, kingdom_y - 8), (kingdom_x - 3, kingdom_y - 4), (kingdom_x + 3, kingdom_y - 4)
            ])
            
            # Kingdom name
            name_text = self.area_font.render(kingdom["name"], True, (101, 67, 33))
            text_rect = name_text.get_rect(center=(kingdom_x, kingdom_y + 18))
            bg_rect = text_rect.inflate(4, 2)
            pygame.draw.rect(surface, (240, 230, 210, 180), bg_rect)
            surface.blit(name_text, text_rect)
    
    def draw_world_view(self, surface, player_x, player_y):
        """Draw world view showing entire realm with continents, oceans, and major features"""
        # Draw ocean background
        ocean_color = (70, 130, 180)
        pygame.draw.rect(surface, ocean_color, (self.map_x, self.map_y, self.map_width, self.map_height))
        
        # Major continents with detailed features
        continents = [
            {"name": "Frostlands", "x": 0.25, "y": 0.15, "size": 65, "color": (200, 220, 255), "type": "ice"},
            {"name": "Eastern Empire", "x": 0.8, "y": 0.35, "size": 55, "color": (255, 200, 150), "type": "desert"},
            {"name": "Volcanic Isles", "x": 0.7, "y": 0.75, "size": 40, "color": (200, 100, 50), "type": "volcanic"},
            {"name": "Emerald Coast", "x": 0.15, "y": 0.65, "size": 60, "color": (150, 255, 150), "type": "forest"},
            {"name": "The Crown Realm", "x": 0.5, "y": 0.45, "size": 80, "color": (255, 215, 0), "type": "kingdom"}
        ]
        
        for continent in continents:
            cont_x = self.map_x + continent["x"] * self.map_width
            cont_y = self.map_y + continent["y"] * self.map_height
            
            # Continent landmass
            pygame.draw.circle(surface, continent["color"], (int(cont_x), int(cont_y)), continent["size"])
            pygame.draw.circle(surface, (100, 100, 100), (int(cont_x), int(cont_y)), continent["size"], 2)
            
            # Continent-specific features
            if continent["type"] == "ice":
                # Ice caps
                for i in range(4):
                    ice_x = cont_x + random.randint(-20, 20)
                    ice_y = cont_y + random.randint(-20, 20)
                    pygame.draw.circle(surface, (240, 248, 255), (int(ice_x), int(ice_y)), 8)
            elif continent["type"] == "desert":
                # Sand dunes
                for i in range(3):
                    dune_x = cont_x + random.randint(-25, 25)
                    dune_y = cont_y + random.randint(-25, 25)
                    pygame.draw.ellipse(surface, (255, 218, 185), (dune_x - 12, dune_y - 6, 24, 12))
            elif continent["type"] == "volcanic":
                # Volcanoes
                pygame.draw.circle(surface, (139, 69, 19), (int(cont_x), int(cont_y)), 12)
                pygame.draw.circle(surface, (255, 69, 0), (int(cont_x), int(cont_y)), 6)
            elif continent["type"] == "forest":
                # Forest symbols
                for i in range(6):
                    angle = (i / 6) * 2 * math.pi
                    tree_x = cont_x + math.cos(angle) * 20
                    tree_y = cont_y + math.sin(angle) * 20
                    pygame.draw.circle(surface, (34, 139, 34), (int(tree_x), int(tree_y)), 4)
            elif continent["type"] == "kingdom":
                # Crown symbol
                crown_points = [
                    (cont_x - 10, cont_y + 5), (cont_x - 5, cont_y - 5), (cont_x, cont_y + 2),
                    (cont_x + 5, cont_y - 5), (cont_x + 10, cont_y + 5), (cont_x + 8, cont_y + 8),
                    (cont_x - 8, cont_y + 8)
                ]
                pygame.draw.polygon(surface, (255, 215, 0), crown_points)
                pygame.draw.polygon(surface, (184, 134, 11), crown_points, 2)
            
            # Major city
            city_color = (200, 200, 200) if continent["type"] != "volcanic" else (100, 100, 100)
            pygame.draw.circle(surface, city_color, (int(cont_x), int(cont_y)), 6)
            pygame.draw.circle(surface, (50, 50, 50), (int(cont_x), int(cont_y)), 6, 1)
            
            # Continent name
            name_text = self.area_font.render(continent["name"], True, (101, 67, 33))
            text_rect = name_text.get_rect(center=(cont_x, cont_y + continent["size"] + 15))
            bg_rect = text_rect.inflate(6, 2)
            pygame.draw.rect(surface, (240, 230, 210, 200), bg_rect)
            surface.blit(name_text, text_rect)
        
        # Draw major shipping routes between continents (thick lines for long distances)
        shipping_routes = [
            # Major intercontinental routes (very thick)
            {"from": continents[0], "to": continents[4], "width": 5, "color": (101, 67, 33)},  # Frostlands to Crown Realm
            {"from": continents[1], "to": continents[4], "width": 5, "color": (101, 67, 33)},  # Eastern Empire to Crown Realm
            {"from": continents[3], "to": continents[4], "width": 4, "color": (139, 69, 19)},  # Emerald Coast to Crown Realm
            # Secondary routes (medium thickness)
            {"from": continents[0], "to": continents[1], "width": 3, "color": (160, 82, 45)},  # Frostlands to Eastern Empire
            {"from": continents[2], "to": continents[4], "width": 3, "color": (160, 82, 45)},  # Volcanic Isles to Crown Realm
            # Local routes (thin)
            {"from": continents[2], "to": continents[1], "width": 2, "color": (160, 82, 45)},  # Volcanic to Eastern
        ]
        
        for route in shipping_routes:
            start_x = self.map_x + route["from"]["x"] * self.map_width
            start_y = self.map_y + route["from"]["y"] * self.map_height
            end_x = self.map_x + route["to"]["x"] * self.map_width
            end_y = self.map_y + route["to"]["y"] * self.map_height
            pygame.draw.line(surface, route["color"], (start_x, start_y), (end_x, end_y), route["width"])
        
        # Ocean features - Sea monsters (smaller and darker to be less prominent)
        sea_monsters = [(0.4, 0.2), (0.6, 0.8)]  # Removed the bottom one that was causing issues
        for monster_pos in sea_monsters:
            monster_x = self.map_x + monster_pos[0] * self.map_width
            monster_y = self.map_y + monster_pos[1] * self.map_height
            pygame.draw.circle(surface, (0, 80, 0), (int(monster_x), int(monster_y)), 6)  # Smaller and darker
            pygame.draw.circle(surface, (0, 120, 0), (int(monster_x), int(monster_y)), 6, 1)
        
        # Trade routes
        trade_routes = [
            ((0.25, 0.15), (0.5, 0.45)),  # North to Crown
            ((0.8, 0.35), (0.5, 0.45)),   # East to Crown
            ((0.7, 0.75), (0.5, 0.45)),   # Volcanic to Crown
            ((0.15, 0.65), (0.5, 0.45)),  # West to Crown
            ((0.25, 0.15), (0.8, 0.35)),  # North to East
            ((0.15, 0.65), (0.7, 0.75))   # West to Volcanic
        ]
        
        for route in trade_routes:
            start_x = self.map_x + route[0][0] * self.map_width
            start_y = self.map_y + route[0][1] * self.map_height
            end_x = self.map_x + route[1][0] * self.map_width
            end_y = self.map_y + route[1][1] * self.map_height
            
            # Dashed trade route
            steps = 10
            for i in range(0, steps, 2):
                t1 = i / steps
                t2 = min((i + 1) / steps, 1.0)
                line_start_x = start_x + (end_x - start_x) * t1
                line_start_y = start_y + (end_y - start_y) * t1
                line_end_x = start_x + (end_x - start_x) * t2
                line_end_y = start_y + (end_y - start_y) * t2
                pygame.draw.line(surface, (255, 255, 255), 
                               (line_start_x, line_start_y), (line_end_x, line_end_y), 2)
    
    def draw_weathered_parchment(self, surface, rect):
        """Draw parchment background - use image if available, otherwise procedural"""
        if self.parchment_bg:
            # Use the loaded parchment image, scaled to fit the rect
            scaled_parchment = pygame.transform.scale(self.parchment_bg, (rect.width, rect.height))
            surface.blit(scaled_parchment, (rect.x, rect.y))
        else:
            # Fallback to procedural parchment
            # Base parchment color
            pygame.draw.rect(surface, (240, 230, 210), rect)
            
            # Add weathered edges with darker brown
            edge_color = (200, 180, 140)
            pygame.draw.rect(surface, edge_color, rect, 8)
            
            # Add static aging spots (same positions each time)
            aging_spots = [
                (rect.x + 50, rect.y + 30, 4),
                (rect.x + rect.width - 80, rect.y + 60, 3),
                (rect.x + 120, rect.y + rect.height - 90, 5),
                (rect.x + rect.width - 150, rect.y + rect.height - 40, 3),
                (rect.x + 200, rect.y + 100, 4),
                (rect.x + rect.width - 200, rect.y + 150, 3)
            ]
            
            for spot_x, spot_y, spot_size in aging_spots:
                spot_color = (210, 190, 160)
                pygame.draw.circle(surface, spot_color, (spot_x, spot_y), spot_size)
            
            # Add static torn edges effect
            torn_edges = [
                (rect.x + 20, rect.y, 3, 6),
                (rect.x + 60, rect.y, 2, 4),
                (rect.x + 100, rect.y, 4, 7),
                (rect.x + rect.width - 80, rect.y, 3, 5),
                (rect.x + 40, rect.y + rect.height, 3, -6),
                (rect.x + 120, rect.y + rect.height, 2, -4)
            ]
            
            for tear_x, tear_y, tear_width, tear_height in torn_edges:
                if tear_height < 0:
                    tear_y += tear_height
                    tear_height = abs(tear_height)
                pygame.draw.rect(surface, edge_color, (tear_x, tear_y, tear_width, tear_height))
    
    def draw(self, surface, player_x, player_y, trees, creatures, treasures):
        """Draw the interactive map overlay"""
        if not self.is_visible:
            return
        
        # Semi-transparent background
        overlay = pygame.Surface((self.screen_width, self.screen_height))
        overlay.set_alpha(200)
        overlay.fill((0, 0, 0))
        surface.blit(overlay, (0, 0))
        
        # Map background with weathered parchment
        map_rect = pygame.Rect(self.map_x - 20, self.map_y - 40, self.map_width + 40, self.map_height + 80)
        self.draw_weathered_parchment(surface, map_rect)
        
        # Map title with view mode
        view_names = {"local": "Local Area", "regional": "Regional Map", "world": "World View"}
        title_text = self.title_font.render(f"🗺️ {view_names[self.view_mode]}", True, (101, 67, 33))
        title_shadow = self.title_font.render(f"🗺️ {view_names[self.view_mode]}", True, (50, 30, 15))
        surface.blit(title_shadow, (self.map_x - 18, self.map_y - 32))
        surface.blit(title_text, (self.map_x - 20, self.map_y - 35))
        
        # Map area with terrain colors
        map_area = pygame.Rect(self.map_x, self.map_y, self.map_width, self.map_height)
        
        # Draw terrain base
        pygame.draw.rect(surface, (60, 120, 60), map_area)  # Forest green base
        
        # Draw roads and landmarks on the map
        self.draw_roads_and_landmarks(surface)
        
        # Draw content based on view mode
        if self.view_mode == "local":
            # Local view - show immediate area details
            self.draw_local_view(surface, player_x, player_y, trees, creatures, treasures)
        elif self.view_mode == "regional":
            # Regional view - show broader area with kingdoms
            self.draw_regional_view(surface, player_x, player_y)
        else:  # world view
            # World view - show entire realm overview
            self.draw_world_view(surface, player_x, player_y)
        
        # Draw route path if selected
        if self.selected_destination and self.route_path:
            route_color = (255, 215, 0)  # Gold route line
            for i in range(len(self.route_path) - 1):
                start_pos = self.world_to_map(self.route_path[i][0], self.route_path[i][1])
                end_pos = self.world_to_map(self.route_path[i + 1][0], self.route_path[i + 1][1])
                pygame.draw.line(surface, route_color, start_pos, end_pos, 3)
            
            # Draw destination marker
            dest_pos = self.world_to_map(self.selected_destination[0], self.selected_destination[1])
            pygame.draw.circle(surface, (255, 100, 100), (int(dest_pos[0]), int(dest_pos[1])), 10)
            pygame.draw.circle(surface, WHITE, (int(dest_pos[0]), int(dest_pos[1])), 10, 2)
            pygame.draw.circle(surface, (200, 50, 50), (int(dest_pos[0]), int(dest_pos[1])), 6)
        
        # Draw player on map with special indicator
        player_map_pos = self.world_to_map(player_x, player_y)
        pygame.draw.circle(surface, (0, 150, 255), (int(player_map_pos[0]), int(player_map_pos[1])), 8)
        pygame.draw.circle(surface, WHITE, (int(player_map_pos[0]), int(player_map_pos[1])), 8, 2)
        pygame.draw.circle(surface, (0, 100, 200), (int(player_map_pos[0]), int(player_map_pos[1])), 4)
        
        # Legend with medieval styling
        legend_y = self.map_y + self.map_height + 15
        legend_items = [
            ("🔵 Your Location", (0, 150, 255)),
            ("🔴 Enemies", (255, 100, 100)),
            ("🟡 Treasures", GOLD),
            ("🟢 Trees", (20, 80, 20)),
            ("⭐ Special Areas", (200, 150, 50))
        ]
        
        for i, (text, color) in enumerate(legend_items):
            legend_text = self.font.render(text, True, (101, 67, 33))
            surface.blit(legend_text, (self.map_x + (i % 3) * 180, legend_y + (i // 3) * 20))
        
        # Instructions based on view mode
        if self.view_mode == "local":
            inst_lines = [
                "Local View - Click to set route | Drag to pan | Z/X to zoom | L/R/W to change view"
            ]
        elif self.view_mode == "regional":
            inst_lines = [
                "Regional View - Click to set route | Drag to pan | L/R/W to change view"
            ]
        else:  # world
            inst_lines = [
                "World View - Click to set route | Drag to pan | L/R/W to change view"
            ]
        for i, line in enumerate(inst_lines):
            inst_text = self.font.render(line, True, (101, 67, 33))
            surface.blit(inst_text, (self.map_x, legend_y + 45 + i * 18))

class SlidingChat:
    """85% transparent sliding chat from bottom right"""
    
    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.messages = []
        self.max_messages = 8
        self.is_visible = False
        self.slide_progress = 0.0
        self.auto_hide_timer = 0.0
        self.auto_hide_delay = 4.5
        
        # Chat dimensions
        self.chat_width = 400
        self.chat_height = 200
        
        # Font - at least 11px
        try:
            self.font = pygame.font.Font(None, 16)
            self.username_font = pygame.font.Font(None, 16)
            self.username_font.set_bold(True)
        except:
            self.font = pygame.font.SysFont("arial", 11)
            self.username_font = pygame.font.SysFont("arial", 11, bold=True)
        
        # Position (bottom right)
        self.target_x = screen_width - self.chat_width - 20
        self.target_y = screen_height - self.chat_height - 20
        self.hidden_x = screen_width
        
        # Player info for chat formatting
        self.username = "Player"
        self.hero_name = "Sir Knight"
        self.faction = "⚔️"
        
        # Text input
        self.input_text = ""
        self.input_active = False
        self.cursor_timer = 0
        self.cursor_visible = True
    
    def toggle(self):
        """Toggle chat visibility"""
        self.is_visible = not self.is_visible
        if self.is_visible:
            self.auto_hide_timer = self.auto_hide_delay
            self.input_active = True  # Activate input when chat opens
        else:
            self.input_active = False
    
    def handle_input(self, event):
        """Handle text input for chat"""
        if not self.is_visible or not self.input_active:
            return False
        
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                if self.input_text.strip():
                    self.add_message(self.input_text.strip())
                    self.input_text = ""
                return True
            elif event.key == pygame.K_BACKSPACE:
                if self.input_text:
                    self.input_text = self.input_text[:-1]
                return True
            elif event.key == pygame.K_ESCAPE:
                self.input_active = False
                return True
        elif event.type == pygame.TEXTINPUT:
            if len(self.input_text) < 100:  # Max message length
                self.input_text += event.text
            return True
        
        return False
    
    def add_message(self, message, auto_show=False):
        """Add message with proper formatting"""
        timestamp = time.strftime("%H:%M")
        # Format: username | (Hero name) [crest]: message
        formatted_msg = {
            'timestamp': timestamp,
            'username': self.username,
            'hero_name': self.hero_name,
            'crest': self.faction,
            'message': message
        }
        
        self.messages.append(formatted_msg)
        
        if len(self.messages) > self.max_messages:
            self.messages.pop(0)
        
        if auto_show:
            self.is_visible = True
            self.auto_hide_timer = self.auto_hide_delay
    
    def update(self, dt):
        """Update chat animation"""
        target_progress = 1.0 if self.is_visible else 0.0
        slide_speed = 4.0
        
        if self.slide_progress < target_progress:
            self.slide_progress = min(target_progress, self.slide_progress + slide_speed * dt)
        elif self.slide_progress > target_progress:
            self.slide_progress = max(target_progress, self.slide_progress - slide_speed * dt)
        
        # Don't auto-hide if input is active
        if self.is_visible and self.auto_hide_timer > 0 and not self.input_active:
            self.auto_hide_timer -= dt
            if self.auto_hide_timer <= 0:
                self.is_visible = False
        
        # Update cursor
        if self.input_active:
            self.cursor_timer += dt
            if self.cursor_timer >= 0.5:
                self.cursor_timer = 0
                self.cursor_visible = not self.cursor_visible
    
    def draw(self, surface):
        """Draw chat with 15% opacity white background"""
        if self.slide_progress <= 0:
            return
        
        current_x = self.hidden_x + (self.target_x - self.hidden_x) * self.slide_progress
        current_y = self.target_y
        
        # Draw 15% opacity white background
        chat_bg = pygame.Surface((self.chat_width, self.chat_height))
        chat_bg.fill(WHITE)
        chat_bg.set_alpha(int(255 * 0.15))  # 15% opacity
        surface.blit(chat_bg, (current_x, current_y))
        
        # Draw border
        chat_rect = pygame.Rect(current_x, current_y, self.chat_width, self.chat_height)
        pygame.draw.rect(surface, (200, 200, 200), chat_rect, 2)
        
        # Draw messages
        y_offset = 10
        for msg_data in self.messages[-8:]:
            if isinstance(msg_data, dict):
                # Format: username | (Hero name) [crest]: message
                username_text = f"{msg_data['username']}"
                if msg_data['hero_name']:
                    username_text += f" | ({msg_data['hero_name']})"
                if msg_data['crest']:
                    username_text += f" [{msg_data['crest']}]"
                username_text += ": "
                
                # Draw username in blue, bold
                username_surface = self.username_font.render(username_text, True, (0, 0, 255))
                surface.blit(username_surface, (current_x + 5, current_y + y_offset))
                
                # Draw message in black
                username_width = username_surface.get_width()
                message_surface = self.font.render(msg_data['message'], True, BLACK)
                surface.blit(message_surface, (current_x + 5 + username_width, current_y + y_offset))
            else:
                # Legacy string format
                text_surface = self.font.render(str(msg_data), True, BLACK)
                surface.blit(text_surface, (current_x + 5, current_y + y_offset))
            
            y_offset += 22
        
        # Draw input field if active
        if self.input_active:
            input_y = current_y + self.chat_height - 25
            input_rect = pygame.Rect(current_x + 5, input_y, self.chat_width - 10, 20)
            
            # Input background
            pygame.draw.rect(surface, (240, 240, 240), input_rect)
            pygame.draw.rect(surface, (100, 100, 100), input_rect, 1)
            
            # Input text
            if self.input_text:
                input_surface = self.font.render(self.input_text, True, BLACK)
                surface.blit(input_surface, (input_rect.x + 3, input_rect.y + 2))
            
            # Cursor
            if self.cursor_visible:
                cursor_x = input_rect.x + 3 + self.font.size(self.input_text)[0]
                pygame.draw.line(surface, BLACK, (cursor_x, input_rect.y + 2), (cursor_x, input_rect.bottom - 2), 1)
            
            # Input prompt
            prompt_text = self.font.render("Type message, Enter to send, Esc to close", True, (100, 100, 100))
            surface.blit(prompt_text, (current_x + 5, input_y - 15))

class WorkingInventory:
    """Working inventory system"""
    
    def __init__(self):
        self.is_visible = False
        self.items = []
        self.selected_item = None
        self.font = pygame.font.Font(None, 20)
        self.title_font = pygame.font.Font(None, 28)
        self.small_font = pygame.font.Font(None, 16)
    
    def toggle(self):
        """Toggle inventory visibility"""
        self.is_visible = not self.is_visible
    
    def add_item(self, item_name, item_type="misc", description=""):
        """Add item to inventory"""
        # Check if item already exists and stack it
        for item in self.items:
            if item['name'] == item_name:
                item['quantity'] += 1
                return
        
        # Add new item
        self.items.append({
            "name": item_name, 
            "type": item_type, 
            "description": description,
            "quantity": 1
        })
    
    def handle_click(self, pos):
        """Handle clicks in inventory"""
        if not self.is_visible:
            return
        
        # Check item clicks
        inv_rect = pygame.Rect(100, 100, 500, 400)
        if inv_rect.collidepoint(pos):
            item_start_y = 150
            for i, item in enumerate(self.items):
                item_rect = pygame.Rect(120, item_start_y + i * 30, 300, 25)
                if item_rect.collidepoint(pos):
                    self.selected_item = item
                    return True
        return False
    
    def draw(self, surface):
        """Draw inventory panel"""
        if not self.is_visible:
            return
        
        # Inventory background
        inv_rect = pygame.Rect(100, 100, 500, 400)
        pygame.draw.rect(surface, PARCHMENT, inv_rect)
        pygame.draw.rect(surface, DARK_BROWN, inv_rect, 3)
        
        # Title
        title_text = self.title_font.render("📦 Inventory", True, DARK_BROWN)
        surface.blit(title_text, (110, 110))
        
        # Items
        item_start_y = 150
        for i, item in enumerate(self.items):
            item_rect = pygame.Rect(120, item_start_y + i * 30, 300, 25)
            
            # Highlight selected item
            if item == self.selected_item:
                pygame.draw.rect(surface, (255, 255, 200), item_rect)
            
            pygame.draw.rect(surface, WHITE, item_rect, 1)
            
            # Item text
            item_text = self.font.render(f"• {item['name']} ({item['quantity']})", True, BLACK)
            surface.blit(item_text, (125, item_start_y + i * 30 + 5))
        
        # Item details
        if self.selected_item:
            detail_rect = pygame.Rect(420, 150, 170, 200)
            pygame.draw.rect(surface, (240, 240, 240), detail_rect)
            pygame.draw.rect(surface, IRON_GRAY, detail_rect, 2)
            
            # Item name
            name_text = self.font.render(self.selected_item['name'], True, DARK_BROWN)
            surface.blit(name_text, (425, 160))
            
            # Item type
            type_text = self.small_font.render(f"Type: {self.selected_item['type']}", True, DARK_BROWN)
            surface.blit(type_text, (425, 185))
            
            # Description
            if self.selected_item.get('description'):
                desc_text = self.small_font.render("Description:", True, DARK_BROWN)
                surface.blit(desc_text, (425, 210))
                
                # Wrap description text
                desc_lines = self.wrap_text(self.selected_item['description'], self.small_font, 160)
                for j, line in enumerate(desc_lines[:6]):  # Max 6 lines
                    line_text = self.small_font.render(line, True, DARK_BROWN)
                    surface.blit(line_text, (425, 230 + j * 15))
        
        # Instructions
        inst_text = self.small_font.render("Click items to select | I to close", True, DARK_BROWN)
        surface.blit(inst_text, (110, 470))
    
    def wrap_text(self, text, font, max_width):
        """Wrap text to fit within max_width"""
        words = text.split(' ')
        lines = []
        current_line = []
        
        for word in words:
            test_line = ' '.join(current_line + [word])
            if font.size(test_line)[0] <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines

class CompleteUltimateGame:
    """Complete ultimate medieval game with all features working including map"""
    
    def __init__(self):
        self.screen = screen
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Initialize systems
        self.chat = SlidingChat(SCREEN_WIDTH, SCREEN_HEIGHT)
        self.inventory = WorkingInventory()
        self.map_system = MapSystem(SCREEN_WIDTH, SCREEN_HEIGHT)
        
        # Import and initialize hero info display
        from hero_info_display import HeroInfoDisplay
        self.hero_info = HeroInfoDisplay(SCREEN_WIDTH, SCREEN_HEIGHT)
        
        # Game state
        self.player_x = SCREEN_WIDTH // 2
        self.player_y = SCREEN_HEIGHT // 2
        self.player_speed = 200
        self.player_health = 100
        self.player_max_health = 100
        self.player_gold = 0
        self.player_level = 1
        
        # Combat and animation
        self.attack_animation = 0
        self.attack_cooldown = 0
        self.arm_swing_angle = 0
        self.attack_requested = False
        
        # World elements
        self.trees = []
        self.creatures = []
        self.treasures = []
        self.loot_drops = []
        
        # UI state
        self.tooltip_text = ""
        self.tooltip_pos = (0, 0)
        self.show_tooltip = False
        
        # Fonts
        self.font = pygame.font.Font(None, 28)
        self.small_font = pygame.font.Font(None, 18)
        self.tooltip_font = pygame.font.Font(None, 16)
        
        self.initialize_world()
    
    def initialize_world(self):
        """Initialize the game world"""
        print("🎮 Initializing Complete Ultimate Medieval Game...")
        
        # Simple static cobblestone paths - no complex generation needed
        self.cobblestone_paths = []
        
        # Generate safe zones for health regeneration
        self.safe_zones = []
        safe_zone_locations = [
            {'x': 150, 'y': 150, 'radius': 60, 'name': 'Ancient Grove'},
            {'x': SCREEN_WIDTH - 150, 'y': 150, 'radius': 50, 'name': 'Sacred Spring'},
            {'x': SCREEN_WIDTH // 2, 'y': SCREEN_HEIGHT - 120, 'radius': 55, 'name': 'Healing Circle'},
            {'x': 200, 'y': SCREEN_HEIGHT - 200, 'radius': 45, 'name': 'Sanctuary Stone'}
        ]
        
        for zone_data in safe_zone_locations:
            self.safe_zones.append({
                'x': zone_data['x'],
                'y': zone_data['y'],
                'radius': zone_data['radius'],
                'name': zone_data['name'],
                'heal_rate': 15  # HP per second
            })
        
        # Generate organized tree placement
        
        # First, add tall guardian trees around safe zones
        for zone in self.safe_zones:
            zone_x, zone_y = zone['x'], zone['y']
            zone_radius = zone['radius']
            
            # Place 6-8 tall trees in a circle around each safe zone
            num_guardian_trees = 8
            for i in range(num_guardian_trees):
                angle = (i / num_guardian_trees) * 2 * math.pi
                tree_distance = zone_radius + 40  # Trees outside the safe zone
                tree_x = zone_x + math.cos(angle) * tree_distance
                tree_y = zone_y + math.sin(angle) * tree_distance
                
                # Make sure trees are within screen bounds
                if 50 <= tree_x <= SCREEN_WIDTH - 50 and 50 <= tree_y <= SCREEN_HEIGHT - 50:
                    self.trees.append({
                        'x': tree_x, 'y': tree_y,
                        'type': 'Guardian Pine', 'size': 30, 'height': 80,  # 60x60 size (30 radius)
                        'guardian': True  # Mark as guardian tree
                    })
        
        # Add aesthetically placed forest areas
        forest_areas = [
            # Northern Forest (top edge) - More spread out
            {'center_x': SCREEN_WIDTH // 4, 'center_y': 100, 'radius': 120, 'tree_count': 8, 'type': 'northern_pines'},
            {'center_x': 3 * SCREEN_WIDTH // 4, 'center_y': 120, 'radius': 110, 'tree_count': 6, 'type': 'northern_pines'},
            
            # Western Forest (left edge) - More spread out
            {'center_x': 100, 'center_y': SCREEN_HEIGHT // 3, 'radius': 100, 'tree_count': 5, 'type': 'mixed_forest'},
            {'center_x': 120, 'center_y': 2 * SCREEN_HEIGHT // 3, 'radius': 105, 'tree_count': 6, 'type': 'mixed_forest'},
            
            # Eastern Forest (right edge) - More spread out
            {'center_x': SCREEN_WIDTH - 100, 'center_y': SCREEN_HEIGHT // 4, 'radius': 95, 'tree_count': 5, 'type': 'ancient_oaks'},
            {'center_x': SCREEN_WIDTH - 120, 'center_y': 3 * SCREEN_HEIGHT // 4, 'radius': 100, 'tree_count': 6, 'type': 'ancient_oaks'},
            
            # Southern Groves (bottom edge) - More spread out
            {'center_x': SCREEN_WIDTH // 3, 'center_y': SCREEN_HEIGHT - 100, 'radius': 90, 'tree_count': 4, 'type': 'ancient_oaks'},
            {'center_x': 2 * SCREEN_WIDTH // 3, 'center_y': SCREEN_HEIGHT - 120, 'radius': 95, 'tree_count': 5, 'type': 'ancient_oaks'},
            
            # Scattered individual trees for natural look - Fewer trees
            {'center_x': SCREEN_WIDTH // 2 + 100, 'center_y': SCREEN_HEIGHT // 3, 'radius': 50, 'tree_count': 2, 'type': 'scattered'},
            {'center_x': SCREEN_WIDTH // 2 - 150, 'center_y': 2 * SCREEN_HEIGHT // 3, 'radius': 45, 'tree_count': 1, 'type': 'scattered'},
            {'center_x': SCREEN_WIDTH // 3 + 80, 'center_y': SCREEN_HEIGHT // 2 + 80, 'radius': 55, 'tree_count': 2, 'type': 'scattered'}
        ]
        
        for area in forest_areas:
            for i in range(area['tree_count']):
                # Place trees in natural formation
                angle = random.uniform(0, 2 * math.pi)
                distance = random.uniform(15, area['radius'])
                tree_x = area['center_x'] + math.cos(angle) * distance
                tree_y = area['center_y'] + math.sin(angle) * distance
                
                # Avoid placing on paths and safe zones
                valid_placement = True
                
                # Check safe zones (avoid guardian tree areas)
                for zone in self.safe_zones:
                    zone_dist = math.sqrt((tree_x - zone['x'])**2 + (tree_y - zone['y'])**2)
                    if zone_dist < zone['radius'] + 50:  # Larger buffer
                        valid_placement = False
                        break
                
                # Check screen bounds
                if not (70 <= tree_x <= SCREEN_WIDTH - 70 and 70 <= tree_y <= SCREEN_HEIGHT - 70):
                    valid_placement = False
                
                # Check cobblestone path areas - MUCH more aggressive collision detection
                # Horizontal cobblestone path (runs across entire screen width)
                cobblestone_y = SCREEN_HEIGHT // 2
                if abs(tree_y - cobblestone_y) < 100:  # Much wider buffer for horizontal path
                    valid_placement = False
                
                # Vertical cobblestone path (runs across entire screen height)
                cobblestone_x = SCREEN_WIDTH // 3
                if abs(tree_x - cobblestone_x) < 100:  # Much wider buffer for vertical path
                    valid_placement = False
                
                # Additional path intersection area (where paths cross)
                if (abs(tree_x - cobblestone_x) < 120 and abs(tree_y - cobblestone_y) < 120):
                    valid_placement = False
                
                # Check distance from other trees (avoid clustering) - More spread out
                for existing_tree in self.trees:
                    tree_dist = math.sqrt((tree_x - existing_tree['x'])**2 + (tree_y - existing_tree['y'])**2)
                    if tree_dist < 80:  # Increased minimum distance between trees
                        valid_placement = False
                        break
                
                if valid_placement:
                    # Choose tree type based on area type (48x48 for regular trees)
                    if area['type'] == 'northern_pines':
                        tree_type = random.choice(['Tall Pine', 'Pine'])
                        tree_size = 24  # Fixed 48x48 size
                        tree_height = random.randint(35, 50)
                    elif area['type'] == 'ancient_oaks':
                        tree_type = 'Ancient Oak'  # Only Ancient Oak, no regular Oak
                        tree_size = 24  # Fixed 48x48 size
                        tree_height = random.randint(40, 55)
                    # birch_grove type removed - now handled by ancient_oaks case above
                    elif area['type'] == 'mixed_forest':
                        tree_type = random.choice(['Pine', 'Ancient Oak'])  # No Birch, no regular Oak
                        tree_size = 24  # Fixed 48x48 size
                        tree_height = random.randint(35, 50)
                    else:  # scattered
                        tree_type = random.choice(['Pine', 'Ancient Oak'])  # No regular Oak
                        tree_size = 24  # Fixed 48x48 size
                        tree_height = random.randint(40, 55)
                    
                    self.trees.append({
                        'x': tree_x, 'y': tree_y,
                        'type': tree_type, 'size': tree_size, 'height': tree_height,
                        'guardian': False
                    })
        
        # Add pine trees along dirt paths
        dirt_path_trees = [
            # Along water path (right side)
            {'x': SCREEN_WIDTH // 2 + 60, 'y': SCREEN_HEIGHT // 4 - 30},
            {'x': SCREEN_WIDTH // 2 + 120, 'y': SCREEN_HEIGHT // 4 + 20},
            {'x': SCREEN_WIDTH // 2 + 180, 'y': SCREEN_HEIGHT // 4 - 10},
            {'x': SCREEN_WIDTH // 2 + 240, 'y': SCREEN_HEIGHT // 4 + 30},
            
            # Along forest path (top)
            {'x': 2 * SCREEN_WIDTH // 3 - 40, 'y': 80},
            {'x': 2 * SCREEN_WIDTH // 3 + 30, 'y': 120},
            {'x': 2 * SCREEN_WIDTH // 3 - 20, 'y': 160},
            {'x': 2 * SCREEN_WIDTH // 3 + 40, 'y': 200}
        ]
        
        for tree_pos in dirt_path_trees:
            if (50 <= tree_pos['x'] <= SCREEN_WIDTH - 50 and 
                50 <= tree_pos['y'] <= SCREEN_HEIGHT - 50):
                self.trees.append({
                    'x': tree_pos['x'], 'y': tree_pos['y'],
                    'type': 'Pine', 'size': random.randint(16, 22), 'height': random.randint(30, 45),
                    'guardian': False
                })
        
        # Cobblestone path trees removed - no trees on paths!
        
        # Generate creatures with realistic AI behaviors
        creature_types = [
            {'name': 'Orc Warrior', 'health': 50, 'gold_reward': 20, 'item_chance': 0.4, 'behavior': 'ground_chase', 'speed': 80},
            {'name': 'Goblin Scout', 'health': 30, 'gold_reward': 12, 'item_chance': 0.3, 'behavior': 'ground_chase', 'speed': 120},
            {'name': 'Skeleton Guard', 'health': 40, 'gold_reward': 15, 'item_chance': 0.35, 'behavior': 'ground_patrol', 'speed': 60},
            {'name': 'Bandit Rogue', 'health': 35, 'gold_reward': 18, 'item_chance': 0.3, 'behavior': 'ground_chase', 'speed': 100},
            {'name': 'Forest Bat', 'health': 20, 'gold_reward': 8, 'item_chance': 0.2, 'behavior': 'flying', 'speed': 150},
            {'name': 'Cave Bat', 'health': 15, 'gold_reward': 5, 'item_chance': 0.15, 'behavior': 'flying', 'speed': 180}
        ]
        
        for i in range(12):
            creature_data = random.choice(creature_types)
            start_x = random.randint(100, SCREEN_WIDTH - 100)
            start_y = random.randint(100, SCREEN_HEIGHT - 100)
            
            # Avoid spawning on paths
            on_path = False
            for path in self.cobblestone_paths:
                if abs(start_x - path['x']) < 50 and abs(start_y - path['y']) < 50:
                    on_path = True
                    break
            
            if not on_path:
                self.creatures.append({
                    'x': start_x, 'y': start_y,
                    'name': creature_data['name'],
                    'health': creature_data['health'],
                    'max_health': creature_data['health'],
                    'gold_reward': creature_data['gold_reward'],
                    'item_chance': creature_data['item_chance'],
                    'behavior': creature_data['behavior'],
                    'speed': creature_data['speed'],
                    'alive': True,
                    'last_damage_time': 0,
                    'chase_range': 120,
                    'attack_range': 40,
                    'is_chasing': False,
                    'patrol_center_x': start_x,
                    'patrol_center_y': start_y,
                    'patrol_radius': 80,
                    'patrol_angle': random.random() * 2 * math.pi,
                    'move_timer': 0,
                    'direction': random.uniform(0, 2 * math.pi),
                    'wing_flap': 0,
                    'flight_bob': 0
                })
        
        # Generate treasures
        treasure_types = [
            {'name': 'Ancient Gold', 'value': 50, 'rarity': 'rare', 'desc': 'Old coins from a forgotten age'},
            {'name': 'Crown Fragment', 'value': 100, 'rarity': 'epic', 'desc': 'A piece of the legendary crown'},
            {'name': 'Magic Crystal', 'value': 75, 'rarity': 'uncommon', 'desc': 'Glows with inner light'},
            {'name': 'Dragon Gem', 'value': 200, 'rarity': 'legendary', 'desc': 'Radiates ancient power'}
        ]
        
        for i in range(12):
            treasure_data = random.choice(treasure_types)
            self.treasures.append({
                'x': random.randint(60, SCREEN_WIDTH - 60),
                'y': random.randint(60, SCREEN_HEIGHT - 60),
                'name': treasure_data['name'],
                'value': treasure_data['value'],
                'rarity': treasure_data['rarity'],
                'description': treasure_data['desc'],
                'collected': False
            })
        
        # Add starting items to inventory
        self.inventory.add_item("Iron Sword", "weapon", "A sturdy blade for combat")
        self.inventory.add_item("Health Potion", "consumable", "Restores 50 health points")
        
        # Add initial chat messages to test the system
        self.chat.add_message("Welcome to the realm!", auto_show=True)
        self.chat.add_message("Press Shift to toggle chat, M for map")
        self.chat.add_message("Your quest begins now...")
        
        print("✅ Complete Ultimate Medieval Game initialized!")
    
    def handle_events(self):
        """Handle all game events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            # Let chat handle input first
            elif self.chat.handle_input(event):
                continue  # Chat consumed the event
            elif event.type == pygame.KEYDOWN:
                self.handle_keydown(event.key)
            elif event.type == pygame.MOUSEBUTTONDOWN:
                self.handle_mouse_click(event.pos, event.button)
                if event.button == 1 and self.map_system.is_visible:
                    self.map_system.start_drag(event.pos)
            elif event.type == pygame.MOUSEBUTTONUP:
                if event.button == 1 and self.map_system.is_visible:
                    self.map_system.end_drag()
            elif event.type == pygame.MOUSEMOTION:
                self.handle_mouse_motion(event.pos)
                if self.map_system.is_visible and self.map_system.is_dragging:
                    self.map_system.update_drag(event.pos)
    
    def handle_keydown(self, key):
        """Handle keyboard input"""
        if key == pygame.K_ESCAPE:
            if self.inventory.is_visible:
                self.inventory.toggle()
            elif self.map_system.is_visible:
                self.map_system.toggle()
            else:
                self.running = False
        elif key == pygame.K_LSHIFT or key == pygame.K_RSHIFT:
            self.chat.toggle()
        elif key == pygame.K_i:
            self.inventory.toggle()
        elif key == pygame.K_m:
            # Don't open map if chat input is active
            if not self.chat.input_active:
                self.map_system.toggle()
        elif key == pygame.K_l:
            # Don't change map view if chat input is active
            if not self.chat.input_active:
                self.map_system.change_view("local")
                if not self.map_system.is_visible:
                    self.map_system.toggle()
        elif key == pygame.K_r:
            # Don't change map view if chat input is active
            if not self.chat.input_active:
                self.map_system.change_view("regional")
                if not self.map_system.is_visible:
                    self.map_system.toggle()
        elif key == pygame.K_w:
            # Don't change map view if chat input is active
            if not self.chat.input_active:
                # Check if map is open to switch view, otherwise it's movement
                if self.map_system.is_visible:
                    self.map_system.change_view("world")
                else:
                    # Only change to world view if map is not open (to avoid conflict with movement)
                    self.map_system.change_view("world")
                    self.map_system.toggle()
        elif key == pygame.K_z:
            # Zoom in
            if self.map_system.is_visible:
                self.map_system.zoom_level = min(3.0, self.map_system.zoom_level * 1.5)
                self.map_system.update_zoom()
        elif key == pygame.K_x:
            # Zoom out
            if self.map_system.is_visible:
                self.map_system.zoom_level = max(0.3, self.map_system.zoom_level / 1.5)
                self.map_system.update_zoom()
        elif key == pygame.K_h:
            self.hero_info.toggle()
    
    def handle_mouse_click(self, pos, button):
        """Handle mouse clicks"""
        if button == 1:  # Left click
            # Check map clicks first (highest priority when map is open)
            if self.map_system.is_visible:
                map_action = self.map_system.handle_click(pos, button)
                if map_action:
                    if map_action["type"] == "route":
                        # Set route destination
                        self.map_system.selected_destination = (map_action["x"], map_action["y"])
                        self.map_system.route_path = self.calculate_route(self.player_x, self.player_y, map_action["x"], map_action["y"])
                        self.chat.add_message(f"Route set to {map_action.get('name', 'destination')}")
                        return
                    elif map_action["type"] == "drag_start":
                        return
                return  # Don't process other clicks when map is open
            
            # Check inventory clicks
            if self.inventory.handle_click(pos):
                return

            # Register attack input for the next game update
            self.attack_requested = True
    
    def handle_mouse_motion(self, pos):
        """Handle mouse movement for tooltips (hover only)"""
        mouse_x, mouse_y = pos
        self.show_tooltip = False
        
        # Only show tooltips when not in inventory, map, or hero info
        if self.inventory.is_visible or self.map_system.is_visible or self.hero_info.is_visible:
            return
        
        # Check for creature tooltips
        for creature in self.creatures:
            if creature['alive']:
                distance = math.sqrt((mouse_x - creature['x'])**2 + (mouse_y - creature['y'])**2)
                if distance < 25:
                    self.tooltip_text = f"{creature['name']} - {creature['health']}/{creature['max_health']} HP"
                    self.tooltip_pos = (mouse_x + 10, mouse_y - 10)
                    self.show_tooltip = True
                    return
        
        # Check for treasure tooltips
        for treasure in self.treasures:
            if not treasure['collected']:
                distance = math.sqrt((mouse_x - treasure['x'])**2 + (mouse_y - treasure['y'])**2)
                if distance < 15:
                    self.tooltip_text = f"{treasure['name']} ({treasure['rarity']}) - {treasure['value']} gold"
                    self.tooltip_pos = (mouse_x + 10, mouse_y - 10)
                    self.show_tooltip = True
                    return
        
        # Check for loot tooltips
        for loot in self.loot_drops:
            if not loot.collected:
                distance = math.sqrt((mouse_x - loot.x)**2 + (mouse_y - loot.y)**2)
                if distance < 15:
                    if loot.loot_type == 'gold':
                        self.tooltip_text = f"{loot.value} Gold"
                    else:
                        self.tooltip_text = f"{loot.name}"
                    self.tooltip_pos = (mouse_x + 10, mouse_y - 10)
                    self.show_tooltip = True
                    return
    
    def update_game(self, dt):
        """Update game logic"""
        # Update systems
        self.chat.update(dt)
        
        # Update attack animation and arm swing
        if self.attack_animation > 0:
            self.attack_animation -= dt * 3
            self.arm_swing_angle = self.attack_animation * math.pi * 0.5
        else:
            self.arm_swing_angle = 0
        
        if self.attack_cooldown > 0:
            self.attack_cooldown -= dt
        
        # Handle player movement (not when inventory or map is open)
        if not self.inventory.is_visible and not self.map_system.is_visible and self.attack_animation <= 0:
            keys = pygame.key.get_pressed()
            move_speed = self.player_speed * dt
            
            if keys[pygame.K_w] or keys[pygame.K_UP]:
                self.player_y = max(24, self.player_y - move_speed)
            if keys[pygame.K_s] or keys[pygame.K_DOWN]:
                self.player_y = min(SCREEN_HEIGHT - 24, self.player_y + move_speed)
            if keys[pygame.K_a] or keys[pygame.K_LEFT]:
                self.player_x = max(24, self.player_x - move_speed)
            if keys[pygame.K_d] or keys[pygame.K_RIGHT]:
                self.player_x = min(SCREEN_WIDTH - 24, self.player_x + move_speed)
        
        # Track the next attack target, if any
        attack_target = None
        if self.attack_requested and self.attack_cooldown <= 0 and not self.is_in_safe_zone():
            in_range = [(
                creature,
                math.sqrt((self.player_x - creature['x'])**2 + (self.player_y - creature['y'])**2)
            ) for creature in self.creatures if creature['alive']]
            in_range = [pair for pair in in_range if pair[1] <= 50]
            if in_range:
                attack_target = min(in_range, key=lambda pair: pair[1])[0]
        self.attack_requested = False

        # Check treasure collection
        for treasure in self.treasures:
            if not treasure['collected']:
                distance = math.sqrt((self.player_x - treasure['x'])**2 + (self.player_y - treasure['y'])**2)
                if distance < 25:
                    self.collect_treasure(treasure)
        
        # Check loot collection
        for loot in self.loot_drops[:]:
            if not loot.collected:
                distance = math.sqrt((self.player_x - loot.x)**2 + (self.player_y - loot.y)**2)
                if distance < 20:
                    self.collect_loot(loot)
        
        # Update loot drops
        for loot in self.loot_drops:
            loot.update(dt)
        
        # Update creature movement and AI
        self.update_creature_movement(dt)
        
        # Check safe zone healing
        self.check_safe_zone_healing(dt)
        
        # Check if player reached destination
        self.check_route_completion()
        
        # Combat with proper mechanics (disabled in safe zones)
        if not self.is_in_safe_zone():
            for creature in self.creatures:
                if creature['alive']:
                    distance = math.sqrt((self.player_x - creature['x'])**2 + (self.player_y - creature['y'])**2)
                    if distance < 50:
                            self.handle_combat(creature, dt, player_attack=(attack_target is creature))
        treasure['collected'] = True
        self.player_gold += treasure['value']
        self.inventory.add_item(treasure['name'], "treasure", treasure['description'])
        self.chat.add_message(f"Found {treasure['name']}! +{treasure['value']} gold")
    
    def collect_loot(self, loot):
        """Handle loot collection"""
        loot.collected = True
        if loot.loot_type == 'gold':
            self.player_gold += loot.value
            self.chat.add_message(f"Picked up {loot.value} gold!")
        else:
            self.inventory.add_item(loot.name, "loot", "Trophy from battle")
            self.chat.add_message(f"Found {loot.name}!")
        
        # Remove collected loot
        if loot in self.loot_drops:
            self.loot_drops.remove(loot)
    
    def handle_combat(self, creature, dt, player_attack=False):
        """Handle combat with proper damage and loot drops"""
        current_time = time.time()
        
        # Player attack only if explicitly requested and the creature is in range
        if player_attack and self.attack_cooldown <= 0:
            damage = random.randint(8, 14)
            creature['health'] -= damage
            creature['last_damage_time'] = current_time
            self.attack_animation = 1.0
            self.attack_cooldown = 0.8  # Cooldown between attacks
            self.chat.add_message(f"You strike {creature['name']} for {damage} damage!")
            
            if creature['health'] <= 0:
                creature['alive'] = False
                
                # Drop gold
                gold_amount = creature['gold_reward']
                self.drop_loot(creature['x'], creature['y'], 'gold', gold_amount)
                
                # Chance for item drop
                if random.random() < creature['item_chance']:
                    item_names = ["Battle Trophy", "Enemy Weapon", "Armor Piece", "Magic Trinket"]
                    item_name = random.choice(item_names)
                    self.drop_loot(creature['x'] + 15, creature['y'] + 15, 'item', 1, item_name)
                
                self.chat.add_message(f"Defeated {creature['name']}!")
        
        # Enemy attacks back if the player has been in contact for a while
        if current_time - creature.get('last_damage_time', 0) > 2.0 and random.random() < 0.015:
            damage = random.randint(3, 8)
            self.player_health = max(0, self.player_health - damage)
            self.chat.add_message(f"{creature['name']} attacks for {damage} damage!")
    
    def drop_loot(self, x, y, loot_type, value, name="Loot"):
        """Drop loot at location"""
        # Add randomness to loot position
        loot_x = x + random.randint(-15, 15)
        loot_y = y + random.randint(-15, 15)
        
        loot = LootDrop(loot_x, loot_y, loot_type, value, name)
        self.loot_drops.append(loot)
    
    def is_in_safe_zone(self):
        """Check if player is in any safe zone"""
        for zone in self.safe_zones:
            distance = math.sqrt((self.player_x - zone['x'])**2 + (self.player_y - zone['y'])**2)
            if distance <= zone['radius']:
                return True
        return False
    
    def check_safe_zone_healing(self, dt):
        """Handle healing in safe zones"""
        for zone in self.safe_zones:
            distance = math.sqrt((self.player_x - zone['x'])**2 + (self.player_y - zone['y'])**2)
            if distance <= zone['radius'] and self.player_health < self.player_max_health:
                # Heal player
                heal_amount = zone['heal_rate'] * dt
                old_health = self.player_health
                self.player_health = min(self.player_max_health, self.player_health + heal_amount)
                
                # Show healing message occasionally
                if int(old_health) != int(self.player_health) and random.random() < 0.1:
                    self.chat.add_message(f"Healing in {zone['name']}...")
                break
    
    def calculate_route(self, start_x, start_y, end_x, end_y):
        """Calculate simple route between two points"""
        # Simple straight line route for now
        steps = 20
        route = []
        for i in range(steps + 1):
            t = i / steps
            x = start_x + (end_x - start_x) * t
            y = start_y + (end_y - start_y) * t
            route.append((x, y))
        return route
    
    def check_route_completion(self):
        """Check if player has reached their destination"""
        if self.map_system.selected_destination:
            dest_x, dest_y = self.map_system.selected_destination
            distance = math.sqrt((self.player_x - dest_x)**2 + (self.player_y - dest_y)**2)
            
            if distance < 50:  # Within 50 pixels of destination
                self.chat.add_message("Destination reached!")
                self.map_system.selected_destination = None
                self.map_system.route_path = []
    
    def update_creature_movement(self, dt):
        """Update creature movement and AI behaviors"""
        for creature in self.creatures:
            if not creature['alive']:
                continue
            
            creature['move_timer'] += dt
            creature['wing_flap'] += dt * 10  # For flying creatures
            
            # Different movement patterns based on behavior
            if creature['behavior'] == 'fly':
                # Flying creatures (bats) - controlled flight pattern
                if creature['move_timer'] > 2.0:  # Change direction every 2 seconds (less erratic)
                    creature['direction'] += random.uniform(-0.5, 0.5)  # Smaller direction changes
                    creature['move_timer'] = 0
                
                # Fly in current direction at reduced speed
                speed = creature['speed'] * dt * 0.4  # Much slower flight
                creature['x'] += speed * math.cos(creature['direction'])
                creature['y'] += speed * math.sin(creature['direction'])
                
                # Keep bats in bounds with bouncing instead of wrapping
                if creature['x'] < 80:
                    creature['x'] = 80
                    creature['direction'] = math.pi - creature['direction']  # Bounce off left wall
                elif creature['x'] > SCREEN_WIDTH - 80:
                    creature['x'] = SCREEN_WIDTH - 80
                    creature['direction'] = math.pi - creature['direction']  # Bounce off right wall
                if creature['y'] < 80:
                    creature['y'] = 80
                    creature['direction'] = -creature['direction']  # Bounce off top wall
                elif creature['y'] > SCREEN_HEIGHT - 80:
                    creature['y'] = SCREEN_HEIGHT - 80
                    creature['direction'] = -creature['direction']  # Bounce off bottom wall
            
            elif creature['behavior'] == 'ground_chase':
                # Ground creatures that chase player when nearby
                distance_to_player = math.sqrt((self.player_x - creature['x'])**2 + (self.player_y - creature['y'])**2)
                
                if distance_to_player < 120:  # Reduced chase range
                    # Move toward player at controlled speed
                    angle_to_player = math.atan2(self.player_y - creature['y'], self.player_x - creature['x'])
                    speed = creature['speed'] * dt * 0.5  # Slower chase speed
                    creature['x'] += speed * math.cos(angle_to_player)
                    creature['y'] += speed * math.sin(angle_to_player)
                else:
                    # Slow wandering
                    if creature['move_timer'] > 3.0:  # Change direction less frequently
                        creature['direction'] = random.uniform(0, 2 * math.pi)
                        creature['move_timer'] = 0
                    
                    speed = creature['speed'] * dt * 0.15  # Much slower wandering
                    creature['x'] += speed * math.cos(creature['direction'])
                    creature['y'] += speed * math.sin(creature['direction'])
            
            elif creature['behavior'] == 'ground_patrol':
                # Patrol around a center point slowly
                center_x = creature.get('patrol_center_x', creature['x'])
                center_y = creature.get('patrol_center_y', creature['y'])
                
                # Move in a slow circle around patrol center
                patrol_radius = 60  # Smaller patrol radius
                patrol_speed = 0.2  # Much slower patrol speed
                angle = time.time() * patrol_speed + creature.get('patrol_offset', 0)
                
                creature['x'] = center_x + patrol_radius * math.cos(angle)
                creature['y'] = center_y + patrol_radius * math.sin(angle)
            
            # Keep ground creatures in bounds
            if creature['behavior'] != 'fly':
                creature['x'] = max(50, min(SCREEN_WIDTH - 50, creature['x']))
                creature['y'] = max(50, min(SCREEN_HEIGHT - 50, creature['y']))
    
    def draw_world(self):
        """Draw clean medieval world with subtle grass"""
        # Base grass color
        self.screen.fill(DARK_GREEN)
        
        # Simple grass blades - no noise
        self.draw_simple_grass_blades()
        
        # Add cobblestone and dirt paths
        self.draw_paths()
        
        # Draw detailed medieval trees
        for tree in self.trees:
            self.draw_detailed_tree(tree)
        
        # Draw treasures as actual items
        for treasure in self.treasures:
            if not treasure['collected']:
                self.draw_treasure_item(treasure)
        
        # Draw loot drops
        for loot in self.loot_drops:
            if not loot.collected:
                loot.draw(self.screen)
        
        # Draw safe zones with enhanced visuals
        self.draw_safe_zones()
        
        # Draw creatures as detailed beasts
        for creature in self.creatures:
            if creature['alive']:
                self.draw_creature_beast(creature)
                
                # Health bar
                bar_width = 36
                bar_height = 5
                health_ratio = creature['health'] / creature['max_health']
                
                # Background
                pygame.draw.rect(self.screen, (100, 100, 100), 
                               (creature['x'] - bar_width//2, creature['y'] - 28, bar_width, bar_height))
                
                # Health with color based on ratio
                if health_ratio > 0.6:
                    health_color = (0, 200, 0)
                elif health_ratio > 0.3:
                    health_color = (255, 165, 0)
                else:
                    health_color = (255, 0, 0)
                
                pygame.draw.rect(self.screen, health_color, 
                               (creature['x'] - bar_width//2, creature['y'] - 28, 
                                bar_width * health_ratio, bar_height))
                
                # Border
                pygame.draw.rect(self.screen, WHITE, 
                               (creature['x'] - bar_width//2, creature['y'] - 28, bar_width, bar_height), 1)
        
        # Draw player knight with arm swing animation
        self.draw_animated_knight()
        
        # Draw player health bar
        self.draw_player_health_bar()
    
    def draw_simple_grass_blades(self):
        """Draw simple, clean grass blades without noise"""
        # Sparse, subtle grass blades
        for y in range(0, SCREEN_HEIGHT, 40):
            for x in range(0, SCREEN_WIDTH, 40):
                if random.random() < 0.3:  # 30% chance for grass blade
                    # Simple grass blade
                    blade_x = x + random.randint(-15, 15)
                    blade_y = y + random.randint(-15, 15)
                    blade_height = random.randint(3, 8)
                    
                    # Draw grass blade as simple line
                    pygame.draw.line(self.screen, LIGHT_GREEN, 
                                   (blade_x, blade_y), 
                                   (blade_x + random.randint(-1, 1), blade_y - blade_height), 2)
    
    def draw_safe_zones(self):
        """Draw safe zones with text indicators only (trees mark the zones)"""
        for zone in self.safe_zones:
            zone_x, zone_y = int(zone['x']), int(zone['y'])
            zone_radius = zone['radius']
            
            # Show healing rate when player is in zone
            distance = math.sqrt((self.player_x - zone_x)**2 + (self.player_y - zone_y)**2)
            if distance <= zone_radius:
                # Zone name
                name_text = self.small_font.render(zone['name'], True, (200, 255, 200))
                name_rect = name_text.get_rect(center=(zone_x, zone_y - 20))
                
                # Text background for readability
                bg_rect = name_rect.inflate(6, 2)
                pygame.draw.rect(self.screen, (0, 0, 0, 128), bg_rect)
                self.screen.blit(name_text, name_rect)
                
                # Healing indicator
                heal_text = self.small_font.render(f"Healing +{zone['heal_rate']}/sec", True, (150, 255, 150))
                heal_rect = heal_text.get_rect(center=(zone_x, zone_y + 5))
                
                heal_bg_rect = heal_rect.inflate(6, 2)
                pygame.draw.rect(self.screen, (0, 0, 0, 128), heal_bg_rect)
                self.screen.blit(heal_text, heal_rect)
    
    def draw_paths(self):
        """Draw simple static cobblestone paths"""
        # Main horizontal cobblestone path
        path_y = SCREEN_HEIGHT // 2
        path_width = 40
        
        for x in range(0, SCREEN_WIDTH, 12):
            for y_offset in range(-path_width//2, path_width//2, 8):
                # Use position-based seed for consistent placement
                seed = (x * 7 + (path_y + y_offset) * 13) % 100
                if seed < 70:  # 70% coverage
                    stone_x = x + (seed % 6) - 3
                    stone_y = path_y + y_offset + ((seed // 6) % 6) - 3
                    stone_size = 4 + (seed % 3)
                    
                    pygame.draw.circle(self.screen, STONE_GRAY, (stone_x, stone_y), stone_size)
                    pygame.draw.circle(self.screen, DARK_STONE, (stone_x, stone_y), stone_size, 1)
        
        # Vertical cobblestone path
        path_x = SCREEN_WIDTH // 3
        
        for y in range(0, SCREEN_HEIGHT, 12):
            for x_offset in range(-path_width//2, path_width//2, 8):
                # Use position-based seed for consistent placement
                seed = ((path_x + x_offset) * 11 + y * 17) % 100
                if seed < 70:  # 70% coverage
                    stone_x = path_x + x_offset + (seed % 6) - 3
                    stone_y = y + ((seed // 6) % 6) - 3
                    stone_size = 4 + (seed % 3)
                    
                    pygame.draw.circle(self.screen, STONE_GRAY, (stone_x, stone_y), stone_size)
                    pygame.draw.circle(self.screen, DARK_STONE, (stone_x, stone_y), stone_size, 1)
        
        # Enhanced dirt paths with better visibility
        
        # Dirt path to water (leading off-screen right)
        water_path_y = SCREEN_HEIGHT // 4
        for x in range(SCREEN_WIDTH // 2, SCREEN_WIDTH + 50, 10):
            path_width = 35
            for i in range(path_width):
                # Use position-based seed for static dirt placement
                seed = (x * 3 + (water_path_y + i) * 7) % 100
                dirt_x = x + (seed % 12) - 6
                dirt_y = water_path_y + i - path_width//2 + ((seed // 12) % 8) - 4
                if 0 <= dirt_y < SCREEN_HEIGHT:
                    dirt_size = 3 + (seed % 4)  # Larger dirt patches
                    dirt_color = (101, 67, 33) if seed % 3 == 0 else (139, 69, 19)
                    pygame.draw.circle(self.screen, dirt_color, (dirt_x, dirt_y), dirt_size)
        
        # Dirt path to forest (leading off-screen top)
        forest_path_x = 2 * SCREEN_WIDTH // 3
        for y in range(-50, SCREEN_HEIGHT // 3, 10):
            path_width = 40
            for i in range(path_width):
                # Use position-based seed for static dirt placement
                seed = ((forest_path_x + i) * 5 + y * 9) % 100
                dirt_x = forest_path_x + i - path_width//2 + (seed % 12) - 6
                dirt_y = y + ((seed // 12) % 12) - 6
                if 0 <= dirt_x < SCREEN_WIDTH and dirt_y >= 0:
                    dirt_size = 3 + (seed % 4)  # Larger dirt patches
                    dirt_color = (139, 69, 19) if seed % 3 == 0 else (160, 82, 45)
                    pygame.draw.circle(self.screen, dirt_color, (dirt_x, dirt_y), dirt_size)
        
        # Additional winding dirt path from bottom-left, avoiding cobblestone path
        cobblestone_y = SCREEN_HEIGHT // 2
        for t in range(100):
            progress = t / 100.0
            # Curved path using sine wave, but avoid cobblestone area
            base_x = 100 + progress * (SCREEN_WIDTH // 3 - 100)
            base_y = SCREEN_HEIGHT - 100 - progress * (SCREEN_HEIGHT // 2.5)  # Adjusted to avoid center
            curve_offset = math.sin(progress * math.pi * 1.5) * 25  # Reduced curve
            
            path_x = base_x + curve_offset
            path_y = base_y
            
            # Skip if too close to cobblestone path
            if abs(path_y - cobblestone_y) < 50:
                continue
            
            # Draw dirt patches along the curved path
            for i in range(20):  # Reduced path width
                seed = (int(path_x) * 7 + int(path_y) * 11 + i * 3) % 100
                dirt_x = path_x + (seed % 16) - 8
                dirt_y = path_y + i - 10 + ((seed // 16) % 6) - 3
                
                # Double-check we're not on cobblestone
                if (0 <= dirt_x < SCREEN_WIDTH and 0 <= dirt_y < SCREEN_HEIGHT and 
                    abs(dirt_y - cobblestone_y) > 30):
                    dirt_size = 2 + (seed % 3)
                    dirt_color = (120, 80, 40) if seed % 4 == 0 else (101, 67, 33)
                    pygame.draw.circle(self.screen, dirt_color, (int(dirt_x), int(dirt_y)), dirt_size)
    
    def draw_creature_beast(self, creature):
        """Draw detailed 24x24 beast-like creatures"""
        cx, cy = int(creature['x']), int(creature['y'])
        
        # All creatures fit within 24x24 bounds (12 pixels from center)
        if 'Orc' in creature['name']:
            # Orc Warrior - 24x24 size
            # Body
            pygame.draw.ellipse(self.screen, (80, 120, 80), (cx - 10, cy - 6, 20, 14))
            pygame.draw.ellipse(self.screen, (60, 100, 60), (cx - 10, cy - 6, 20, 14), 1)
            
            # Arms
            pygame.draw.ellipse(self.screen, (70, 110, 70), (cx - 12, cy - 3, 6, 10))
            pygame.draw.ellipse(self.screen, (70, 110, 70), (cx + 6, cy - 3, 6, 10))
            
            # Head
            pygame.draw.circle(self.screen, (85, 125, 85), (cx, cy - 8), 5)
            pygame.draw.circle(self.screen, (65, 105, 65), (cx, cy - 8), 5, 1)
            
            # Tusks
            pygame.draw.polygon(self.screen, (255, 255, 200), [(cx - 2, cy - 6), (cx - 3, cy - 3), (cx - 1, cy - 4)])
            pygame.draw.polygon(self.screen, (255, 255, 200), [(cx + 2, cy - 6), (cx + 3, cy - 3), (cx + 1, cy - 4)])
            
            # Red eyes
            pygame.draw.circle(self.screen, (255, 50, 50), (cx - 2, cy - 9), 1)
            pygame.draw.circle(self.screen, (255, 50, 50), (cx + 2, cy - 9), 1)
            
            # Weapon
            pygame.draw.line(self.screen, (101, 67, 33), (cx + 9, cy - 6), (cx + 9, cy + 3), 1)
            pygame.draw.polygon(self.screen, (128, 128, 128), [(cx + 8, cy - 7), (cx + 10, cy - 4), (cx + 8, cy - 1)])
            
        elif 'Goblin' in creature['name']:
            # Goblin Scout - 24x24 size
            # Body
            pygame.draw.ellipse(self.screen, (100, 120, 60), (cx - 8, cy - 3, 16, 10))
            pygame.draw.ellipse(self.screen, (80, 100, 40), (cx - 8, cy - 3, 16, 10), 1)
            
            # Arms
            pygame.draw.ellipse(self.screen, (90, 110, 50), (cx - 10, cy - 1, 5, 8))
            pygame.draw.ellipse(self.screen, (90, 110, 50), (cx + 5, cy - 1, 5, 8))
            
            # Head
            pygame.draw.ellipse(self.screen, (105, 125, 65), (cx - 4, cy - 10, 8, 6))
            pygame.draw.ellipse(self.screen, (85, 105, 45), (cx - 4, cy - 10, 8, 6), 1)
            
            # Ears
            pygame.draw.polygon(self.screen, (95, 115, 55), [(cx - 5, cy - 8), (cx - 8, cy - 10), (cx - 4, cy - 6)])
            pygame.draw.polygon(self.screen, (95, 115, 55), [(cx + 5, cy - 8), (cx + 8, cy - 10), (cx + 4, cy - 6)])
            
            # Eyes
            pygame.draw.circle(self.screen, (255, 255, 100), (cx - 1, cy - 8), 1)
            pygame.draw.circle(self.screen, (255, 255, 100), (cx + 1, cy - 8), 1)
            
            # Dagger
            pygame.draw.line(self.screen, (101, 67, 33), (cx + 8, cy - 3), (cx + 8, cy + 1), 1)
            pygame.draw.polygon(self.screen, (150, 150, 150), [(cx + 7, cy - 4), (cx + 9, cy - 4), (cx + 8, cy - 3)])
            
        elif 'Skeleton' in creature['name']:
            # Skeleton Guard - 36x36 size
            # Ribcage
            pygame.draw.ellipse(self.screen, (220, 220, 220), (cx - 12, cy - 6, 24, 16))
            for i in range(3):
                pygame.draw.line(self.screen, (180, 180, 180), (cx - 10, cy - 4 + i * 3), (cx + 10, cy - 4 + i * 3), 1)
            
            # Spine
            pygame.draw.line(self.screen, (200, 200, 200), (cx, cy - 6), (cx, cy + 10), 2)
            
            # Arms
            pygame.draw.line(self.screen, (210, 210, 210), (cx - 12, cy - 4), (cx - 16, cy + 4), 3)
            pygame.draw.line(self.screen, (210, 210, 210), (cx + 12, cy - 4), (cx + 16, cy + 4), 3)
            
            # Skull
            pygame.draw.circle(self.screen, (230, 230, 230), (cx, cy - 14), 8)
            pygame.draw.circle(self.screen, (200, 200, 200), (cx, cy - 14), 8, 2)
            
            # Eye sockets
            pygame.draw.circle(self.screen, (50, 50, 50), (cx - 3, cy - 15), 2)
            pygame.draw.circle(self.screen, (50, 50, 50), (cx + 3, cy - 15), 2)
            
            # Glowing eyes
            pygame.draw.circle(self.screen, (255, 100, 100), (cx - 3, cy - 15), 1)
            pygame.draw.circle(self.screen, (255, 100, 100), (cx + 3, cy - 15), 1)
            
            # Sword
            pygame.draw.line(self.screen, (139, 69, 19), (cx + 14, cy - 8), (cx + 14, cy + 6), 2)
            pygame.draw.polygon(self.screen, (160, 82, 45), [(cx + 13, cy - 10), (cx + 15, cy - 10), (cx + 14, cy - 8)])
            
        elif 'Shadow Bat' in creature['name']:
            # Shadow Bat - 36x36 size with controlled wing flapping
            wing_angle = math.sin(creature.get('wing_flap', 0)) * 0.3  # Reduced flapping
            
            # Body
            pygame.draw.ellipse(self.screen, (40, 40, 60), (cx - 6, cy - 3, 12, 8))
            pygame.draw.ellipse(self.screen, (20, 20, 40), (cx - 6, cy - 3, 12, 8), 1)
            
            # Wings (controlled size)
            left_wing_points = [
                (cx - 6, cy),
                (cx - 14 + wing_angle * 3, cy - 6 + wing_angle * 2),
                (cx - 10 + wing_angle * 2, cy + 2),
                (cx - 6, cy + 2)
            ]
            right_wing_points = [
                (cx + 6, cy),
                (cx + 14 - wing_angle * 3, cy - 6 + wing_angle * 2),
                (cx + 10 - wing_angle * 2, cy + 2),
                (cx + 6, cy + 2)
            ]
            
            pygame.draw.polygon(self.screen, (60, 60, 80), left_wing_points)
            pygame.draw.polygon(self.screen, (60, 60, 80), right_wing_points)
            pygame.draw.polygon(self.screen, (30, 30, 50), left_wing_points, 1)
            pygame.draw.polygon(self.screen, (30, 30, 50), right_wing_points, 1)
            
            # Head
            pygame.draw.circle(self.screen, (45, 45, 65), (cx, cy - 5), 3)
            
            # Eyes
            pygame.draw.circle(self.screen, (255, 100, 100), (cx - 1, cy - 6), 1)
            pygame.draw.circle(self.screen, (255, 100, 100), (cx + 1, cy - 6), 1)
            
        else:  # Bandit Rogue
            # Bandit - 36x36 size
            # Body
            pygame.draw.ellipse(self.screen, (60, 40, 20), (cx - 12, cy - 5, 24, 16))
            pygame.draw.ellipse(self.screen, (40, 20, 10), (cx - 12, cy - 5, 24, 16), 2)
            
            # Arms
            pygame.draw.ellipse(self.screen, (80, 60, 40), (cx - 16, cy - 2, 8, 12))
            pygame.draw.ellipse(self.screen, (80, 60, 40), (cx + 8, cy - 2, 8, 12))
            
            # Hooded head
            pygame.draw.circle(self.screen, (120, 100, 80), (cx, cy - 12), 6)
            pygame.draw.ellipse(self.screen, (40, 20, 10), (cx - 8, cy - 16, 16, 10))
            pygame.draw.ellipse(self.screen, (20, 10, 5), (cx - 8, cy - 16, 16, 10), 2)
            
            # Eyes
            pygame.draw.circle(self.screen, (255, 255, 100), (cx - 2, cy - 13), 1)
            pygame.draw.circle(self.screen, (255, 255, 100), (cx + 2, cy - 13), 1)
            
            # Dagger
            pygame.draw.line(self.screen, (101, 67, 33), (cx + 12, cy - 2), (cx + 12, cy + 4), 2)
            pygame.draw.arc(self.screen, (150, 150, 150), (cx + 10, cy - 6, 6, 6), 0, 3.14, 2)
        
        # Health bar for all creatures
        bar_width = 36
        bar_height = 5
        health_ratio = creature['health'] / creature['max_health']
        
        # Background
        pygame.draw.rect(self.screen, (100, 100, 100), 
                       (creature['x'] - bar_width//2, creature['y'] - 28, bar_width, bar_height))
        
        # Health with color based on ratio
        if health_ratio > 0.6:
            health_color = (0, 200, 0)
        elif health_ratio > 0.3:
            health_color = (255, 165, 0)
        else:
            health_color = (255, 0, 0)
        
        pygame.draw.rect(self.screen, health_color, 
                       (creature['x'] - bar_width//2, creature['y'] - 28, 
                        bar_width * health_ratio, bar_height))
        
        # Border
        pygame.draw.rect(self.screen, WHITE, 
                       (creature['x'] - bar_width//2, creature['y'] - 28, bar_width, bar_height), 1)
    
    def draw_treasure_item(self, treasure):
        """Draw treasures as actual recognizable items without background shapes"""
        tx, ty = int(treasure['x']), int(treasure['y'])
        
        # Draw specific item based on name
        if 'Gold' in treasure['name']:
            # Ancient Gold - Stack of coins
            for i in range(3):
                coin_y = ty + i * 2
                pygame.draw.circle(self.screen, GOLD, (tx, coin_y), 6)
                pygame.draw.circle(self.screen, (255, 255, 0), (tx, coin_y), 6, 2)
                pygame.draw.circle(self.screen, (255, 255, 200), (tx - 2, coin_y - 2), 2)
        
        elif 'Crown Fragment' in treasure['name']:
            # Crown Fragment - Ornate piece
            # Base
            pygame.draw.polygon(self.screen, GOLD, [
                (tx - 8, ty + 4), (tx + 8, ty + 4), (tx + 6, ty - 2), (tx - 6, ty - 2)
            ])
            # Spikes
            pygame.draw.polygon(self.screen, GOLD, [(tx - 4, ty - 2), (tx - 2, ty - 8), (tx, ty - 2)])
            pygame.draw.polygon(self.screen, GOLD, [(tx, ty - 2), (tx + 2, ty - 10), (tx + 4, ty - 2)])
            # Gems
            pygame.draw.circle(self.screen, (255, 100, 100), (tx - 2, ty), 2)
            pygame.draw.circle(self.screen, (100, 100, 255), (tx + 2, ty), 2)
        
        elif 'Magic Crystal' in treasure['name']:
            # Magic Crystal - Glowing crystal
            # Crystal shape
            crystal_points = [
                (tx, ty - 8), (tx + 4, ty - 2), (tx + 2, ty + 6), 
                (tx - 2, ty + 6), (tx - 4, ty - 2)
            ]
            pygame.draw.polygon(self.screen, (150, 200, 255), crystal_points)
            pygame.draw.polygon(self.screen, (100, 150, 255), crystal_points, 2)
            
            # Inner glow
            pygame.draw.polygon(self.screen, (200, 230, 255), [
                (tx, ty - 4), (tx + 2, ty), (tx, ty + 3), (tx - 2, ty)
            ])
        
        elif 'Dragon Gem' in treasure['name']:
            # Dragon Gem - Large ornate gem
            # Gem base
            pygame.draw.ellipse(self.screen, (255, 100, 100), (tx - 6, ty - 4, 12, 8))
            pygame.draw.ellipse(self.screen, (200, 50, 50), (tx - 6, ty - 4, 12, 8), 2)
            
            # Facets
            pygame.draw.polygon(self.screen, (255, 150, 150), [
                (tx, ty - 4), (tx + 3, ty - 1), (tx, ty + 2), (tx - 3, ty - 1)
            ])
            
            # Dragon scale pattern
            for i in range(3):
                for j in range(2):
                    scale_x = tx - 4 + i * 3
                    scale_y = ty - 2 + j * 2
                    pygame.draw.circle(self.screen, (180, 80, 80), (scale_x, scale_y), 1)
        
        else:
            # Default treasure - Ornate chest
            # Chest base
            pygame.draw.rect(self.screen, (139, 69, 19), (tx - 6, ty - 2, 12, 8))
            pygame.draw.rect(self.screen, (101, 67, 33), (tx - 6, ty - 2, 12, 8), 2)
            
            # Chest lid
            pygame.draw.ellipse(self.screen, (160, 82, 45), (tx - 6, ty - 6, 12, 8))
            pygame.draw.ellipse(self.screen, (120, 60, 30), (tx - 6, ty - 6, 12, 8), 2)
            
            # Lock
            pygame.draw.rect(self.screen, GOLD, (tx - 1, ty - 2, 2, 3))
            pygame.draw.circle(self.screen, GOLD, (tx, ty - 3), 2, 1)
    
    def draw_detailed_grass_texture(self):
        """Draw rich, layered grass texture"""
        # Layer 1: Base grass blades (dense)
        for y in range(0, SCREEN_HEIGHT, 8):
            for x in range(0, SCREEN_WIDTH, 8):
                if random.random() < 0.4:  # 40% coverage
                    grass_color = random.choice([
                        (30, 90, 30), (35, 95, 35), (25, 85, 25), (40, 100, 40)
                    ])
                    # Small grass blades
                    blade_height = random.randint(2, 5)
                    pygame.draw.line(self.screen, grass_color, 
                                   (x, y), (x, y - blade_height), 1)
        
        # Layer 2: Clover patches
        for i in range(50):
            patch_x = random.randint(20, SCREEN_WIDTH - 20)
            patch_y = random.randint(20, SCREEN_HEIGHT - 20)
            patch_size = random.randint(8, 15)
            
            # Clover patch base
            pygame.draw.circle(self.screen, (40, 110, 40), 
                             (patch_x, patch_y), patch_size)
            
            # Individual clover leaves
            for j in range(random.randint(3, 7)):
                leaf_x = patch_x + random.randint(-patch_size//2, patch_size//2)
                leaf_y = patch_y + random.randint(-patch_size//2, patch_size//2)
                pygame.draw.circle(self.screen, (45, 120, 45), 
                                 (leaf_x, leaf_y), 2)
        
        # Layer 3: Wildflowers
        for i in range(30):
            flower_x = random.randint(30, SCREEN_WIDTH - 30)
            flower_y = random.randint(30, SCREEN_HEIGHT - 30)
            
            # Flower colors
            flower_colors = [
                (255, 255, 100),  # Yellow
                (255, 150, 150),  # Pink
                (150, 150, 255),  # Blue
                (255, 255, 255),  # White
            ]
            flower_color = random.choice(flower_colors)
            
            # Flower stem
            pygame.draw.line(self.screen, (50, 120, 50), 
                           (flower_x, flower_y), (flower_x, flower_y - 8), 1)
            
            # Flower petals
            for petal in range(5):
                angle = (petal * 2 * math.pi) / 5
                petal_x = flower_x + 3 * math.cos(angle)
                petal_y = flower_y - 8 + 3 * math.sin(angle)
                pygame.draw.circle(self.screen, flower_color, 
                                 (int(petal_x), int(petal_y)), 2)
            
            # Flower center
            pygame.draw.circle(self.screen, (255, 200, 0), 
                             (flower_x, flower_y - 8), 1)
        
        # Layer 4: Moss patches
        for i in range(25):
            moss_x = random.randint(40, SCREEN_WIDTH - 40)
            moss_y = random.randint(40, SCREEN_HEIGHT - 40)
            moss_size = random.randint(12, 25)
            
            # Moss base
            pygame.draw.ellipse(self.screen, (60, 100, 60), 
                              (moss_x - moss_size//2, moss_y - moss_size//3, 
                               moss_size, moss_size//2))
            
            # Moss texture
            for j in range(moss_size // 3):
                spot_x = moss_x + random.randint(-moss_size//3, moss_size//3)
                spot_y = moss_y + random.randint(-moss_size//4, moss_size//4)
                pygame.draw.circle(self.screen, (70, 110, 70), 
                                 (spot_x, spot_y), 1)
    
    def draw_dirt_paths(self):
        """Draw worn dirt paths through the grass"""
        # Main path from left to right
        path_points = []
        for x in range(0, SCREEN_WIDTH, 50):
            y_offset = 20 * math.sin(x * 0.01) + SCREEN_HEIGHT // 2
            path_points.append((x, int(y_offset)))
        
        # Draw path segments
        for i in range(len(path_points) - 1):
            start_point = path_points[i]
            end_point = path_points[i + 1]
            
            # Path width varies
            path_width = random.randint(15, 25)
            
            # Draw path segment
            for w in range(-path_width//2, path_width//2, 2):
                pygame.draw.line(self.screen, (101, 67, 33), 
                               (start_point[0], start_point[1] + w),
                               (end_point[0], end_point[1] + w), 1)
            
            # Add path texture (stones, worn areas)
            for j in range(5):
                stone_x = start_point[0] + random.randint(-10, 10)
                stone_y = start_point[1] + random.randint(-path_width//2, path_width//2)
                stone_size = random.randint(2, 4)
                pygame.draw.circle(self.screen, (120, 80, 50), 
                                 (stone_x, stone_y), stone_size)
    
    def draw_detailed_tree(self, tree):
        """Draw detailed medieval trees with bark texture and realistic canopies"""
        tx, ty = tree['x'], tree['y']
        tree_type = tree['type']
        size = tree['size']
        is_guardian = tree.get('guardian', False)
        
        if tree_type == 'Guardian Pine':
            # Guardian Pine - Tall, majestic trees around safe zones
            trunk_width = 10
            trunk_height = 50  # Much taller
            
            # Thick, ancient trunk
            pygame.draw.rect(self.screen, (70, 45, 25), 
                           (tx - trunk_width//2, ty + 15, trunk_width, trunk_height))
            
            # Ancient bark texture
            for i in range(trunk_height // 3):
                bark_y = ty + 18 + i * 3
                pygame.draw.line(self.screen, (50, 30, 15), 
                               (tx - trunk_width//2, bark_y), 
                               (tx + trunk_width//2, bark_y), 1)
            
            # Massive pine layers (taller and wider)
            layer_colors = [(10, 50, 10), (20, 70, 20), (15, 60, 15)]
            for layer in range(5):  # More layers for height
                layer_y = ty - layer * 12
                layer_size = size + 5 - layer * 4
                
                # Triangular pine shape
                points = [
                    (tx, layer_y - layer_size),
                    (tx - layer_size, layer_y + 8),
                    (tx + layer_size, layer_y + 8)
                ]
                pygame.draw.polygon(self.screen, layer_colors[layer % 3], points)
            
            # Guardian glow effect
            if is_guardian:
                glow_color = (100, 255, 100, 50)  # Soft green glow
                for i in range(3):
                    glow_radius = size + 10 + i * 5
                    glow_surface = pygame.Surface((glow_radius * 2, glow_radius * 2), pygame.SRCALPHA)
                    pygame.draw.circle(glow_surface, (100, 255, 100, 30 - i * 10), 
                                     (glow_radius, glow_radius), glow_radius)
                    self.screen.blit(glow_surface, (tx - glow_radius, ty - glow_radius))
        
        elif tree_type == 'Ancient Oak':
            # Ancient Oak - Massive, gnarled, mystical
            # Thick, textured trunk
            trunk_width = 12
            trunk_height = 35
            
            # Main trunk with bark texture
            trunk_rect = pygame.Rect(tx - trunk_width//2, ty + 5, trunk_width, trunk_height)
            pygame.draw.rect(self.screen, (80, 50, 30), trunk_rect)
            
            # Bark texture lines
            for i in range(trunk_height // 3):
                bark_y = ty + 8 + i * 3
                pygame.draw.line(self.screen, (60, 35, 20), 
                               (tx - trunk_width//2, bark_y), 
                               (tx + trunk_width//2, bark_y), 1)
            
            # Gnarled roots
            for root in range(4):
                root_angle = (root * math.pi) / 2
                root_end_x = tx + 20 * math.cos(root_angle)
                root_end_y = ty + 40 + 8 * math.sin(root_angle)
                pygame.draw.line(self.screen, (70, 45, 25), 
                               (tx, ty + 35), (int(root_end_x), int(root_end_y)), 4)
            
            # Massive canopy with multiple layers
            # Layer 1 - Base
            pygame.draw.circle(self.screen, (15, 60, 15), (tx, ty - 5), size + 8)
            # Layer 2 - Mid
            pygame.draw.circle(self.screen, (25, 80, 25), (tx - 5, ty - 10), size)
            pygame.draw.circle(self.screen, (25, 80, 25), (tx + 8, ty - 8), size - 5)
            # Layer 3 - Highlights
            pygame.draw.circle(self.screen, (35, 100, 35), (tx - 3, ty - 12), size - 8)
            
            # Ancient mystical glow
            pygame.draw.circle(self.screen, (100, 255, 100), (tx, ty - 10), 3)
            
        elif tree_type in ['Pine', 'Tall Pine', 'Ancient Pine']:
            # Pine Tree - Tall, conical, evergreen
            if tree_type == 'Tall Pine':
                trunk_width = 8
                trunk_height = 35
                layer_count = 4
            elif tree_type == 'Ancient Pine':
                trunk_width = 10
                trunk_height = 40
                layer_count = 5
            else:
                trunk_width = 6
                trunk_height = 25
                layer_count = 3
            
            # Straight trunk
            pygame.draw.rect(self.screen, (90, 60, 40), 
                           (tx - trunk_width//2, ty + 10, trunk_width, trunk_height))
            
            # Pine needle layers (conical)
            layer_colors = [(20, 70, 20), (30, 90, 30), (25, 80, 25)]
            for layer in range(layer_count):
                layer_y = ty - layer * 8
                layer_size = size - layer * 4
                
                # Triangular pine shape
                points = [
                    (tx, layer_y - layer_size),
                    (tx - layer_size, layer_y + 5),
                    (tx + layer_size, layer_y + 5)
                ]
                pygame.draw.polygon(self.screen, layer_colors[layer % 3], points)
                
                # Pine needle texture
                for needle in range(layer_size // 2):
                    needle_x = tx + random.randint(-layer_size, layer_size)
                    needle_y = layer_y + random.randint(-5, 5)
                    pygame.draw.line(self.screen, (40, 100, 40), 
                                   (needle_x, needle_y), (needle_x, needle_y - 2), 1)
        

    
    def draw_animated_knight(self):
        """Draw detailed 48x48 medieval knight with arm swing animation"""
        px, py = int(self.player_x), int(self.player_y)
        
        # 48x48 knight - scale everything properly
        scale = 1.0  # Base scale for 48x48
        
        # Legs (armored, behind body)
        leg_width = int(8 * scale)
        leg_height = int(18 * scale)
        
        # Left leg with armor
        left_leg_rect = pygame.Rect(px - leg_width, py + 6, leg_width - 1, leg_height)
        pygame.draw.rect(self.screen, LEATHER_BROWN, left_leg_rect)  # Brown leather
        pygame.draw.rect(self.screen, IRON_GRAY, left_leg_rect, 1)  # Metal trim
        
        # Right leg with armor
        right_leg_rect = pygame.Rect(px + 1, py + 6, leg_width - 1, leg_height)
        pygame.draw.rect(self.screen, LEATHER_BROWN, right_leg_rect)
        pygame.draw.rect(self.screen, IRON_GRAY, right_leg_rect, 1)
        
        # Boots (detailed)
        boot_height = int(8 * scale)
        left_boot = pygame.Rect(px - leg_width, py + 18, leg_width - 1, boot_height)
        right_boot = pygame.Rect(px + 1, py + 18, leg_width - 1, boot_height)
        
        pygame.draw.rect(self.screen, DARK_BROWN, left_boot)
        pygame.draw.rect(self.screen, DARK_BROWN, right_boot)
        pygame.draw.rect(self.screen, IRON_GRAY, left_boot, 1)
        pygame.draw.rect(self.screen, IRON_GRAY, right_boot, 1)
        
        # Main body (chainmail and armor)
        body_width = int(16 * scale)
        body_height = int(20 * scale)
        body_rect = pygame.Rect(px - body_width//2, py - 6, body_width, body_height)
        
        # Chainmail base
        pygame.draw.rect(self.screen, IRON_GRAY, body_rect)
        
        # Armor plates
        chest_plate = pygame.Rect(px - 6, py - 4, 12, 8)
        pygame.draw.rect(self.screen, STEEL_BLUE, chest_plate)
        pygame.draw.rect(self.screen, WHITE, chest_plate, 1)
        
        # Belt
        belt_rect = pygame.Rect(px - 8, py + 8, 16, 3)
        pygame.draw.rect(self.screen, DARK_BROWN, belt_rect)
        
        # Arms with swing animation
        arm_length = int(12 * scale)
        
        # Calculate arm positions with swing
        left_arm_angle = -0.3 + self.arm_swing_angle * 0.5
        right_arm_angle = 0.3 - self.arm_swing_angle * 0.8  # More swing for sword arm
        
        # Left arm (shield arm)
        left_shoulder = (px - 8, py - 2)
        left_arm_end = (
            left_shoulder[0] + arm_length * math.cos(left_arm_angle),
            left_shoulder[1] + arm_length * math.sin(left_arm_angle)
        )
        pygame.draw.line(self.screen, IRON_GRAY, left_shoulder, left_arm_end, 4)
        
        # Right arm (sword arm) with more dramatic swing
        right_shoulder = (px + 8, py - 2)
        right_arm_end = (
            right_shoulder[0] + arm_length * math.cos(right_arm_angle),
            right_shoulder[1] + arm_length * math.sin(right_arm_angle)
        )
        pygame.draw.line(self.screen, IRON_GRAY, right_shoulder, right_arm_end, 4)
        
        # Sword (follows right arm)
        if self.attack_animation > 0:
            sword_length = 16
            sword_end = (
                right_arm_end[0] + sword_length * math.cos(right_arm_angle),
                right_arm_end[1] + sword_length * math.sin(right_arm_angle)
            )
            pygame.draw.line(self.screen, STEEL_BLUE, right_arm_end, sword_end, 3)
            pygame.draw.circle(self.screen, GOLD, (int(right_arm_end[0]), int(right_arm_end[1])), 3)
        
        # Head and helmet
        head_size = int(8 * scale)
        pygame.draw.circle(self.screen, (220, 180, 140), (px, py - 12), head_size)  # Face
        
        # Helmet
        helmet_rect = pygame.Rect(px - 10, py - 20, 20, 12)
        pygame.draw.ellipse(self.screen, IRON_GRAY, helmet_rect)
        pygame.draw.ellipse(self.screen, STEEL_BLUE, helmet_rect, 2)
        
        # Visor
        visor_rect = pygame.Rect(px - 8, py - 16, 16, 6)
        pygame.draw.rect(self.screen, (50, 50, 50), visor_rect)
        
        # Eye slits
        pygame.draw.line(self.screen, (255, 100, 100), (px - 4, py - 13), (px - 2, py - 13), 1)
        pygame.draw.line(self.screen, (255, 100, 100), (px + 2, py - 13), (px + 4, py - 13), 1)
        
        # Shoulder guards
        left_shoulder_guard = (px - 12, py - 8)
        right_shoulder_guard = (px + 12, py - 8)
        pygame.draw.circle(self.screen, STEEL_BLUE, left_shoulder_guard, 6)
        pygame.draw.circle(self.screen, STEEL_BLUE, right_shoulder_guard, 6)
    
    def draw_player_health_bar(self):
        """Draw health bar above the player"""
        bar_width = 40
        bar_height = 6
        bar_x = self.player_x - bar_width // 2
        bar_y = self.player_y - 45  # Above the knight
        
        # Health ratio
        health_ratio = self.player_health / self.player_max_health
        
        # Background (dark red)
        pygame.draw.rect(self.screen, (100, 20, 20), (bar_x, bar_y, bar_width, bar_height))
        
        # Health bar with color based on health level
        if health_ratio > 0.6:
            health_color = (0, 200, 0)  # Green
        elif health_ratio > 0.3:
            health_color = (255, 165, 0)  # Orange
        else:
            health_color = (255, 50, 50)  # Red
        
        # Current health
        current_width = int(bar_width * health_ratio)
        if current_width > 0:
            pygame.draw.rect(self.screen, health_color, (bar_x, bar_y, current_width, bar_height))
        
        # Border
        pygame.draw.rect(self.screen, WHITE, (bar_x, bar_y, bar_width, bar_height), 1)
        
        # Health text (small)
        health_text = f"{int(self.player_health)}/{self.player_max_health}"
        text_surface = self.small_font.render(health_text, True, WHITE)
        text_rect = text_surface.get_rect(center=(self.player_x, bar_y - 8))
        
        # Text background for readability
        bg_rect = text_rect.inflate(4, 2)
        pygame.draw.rect(self.screen, (0, 0, 0, 128), bg_rect)
        self.screen.blit(text_surface, text_rect)
    
    def draw_ui(self):
        """Draw clean UI"""
        # Title
        title_text = self.font.render("🏰 Gather The Crown: Complete Ultimate Edition", True, GOLD)
        self.screen.blit(title_text, (20, 20))
        
        # Player stats
        health_text = self.small_font.render(f"❤️ Health: {self.player_health}/{self.player_max_health}", True, WHITE)
        self.screen.blit(health_text, (20, 60))
        
        gold_text = self.small_font.render(f"💰 Gold: {self.player_gold}", True, GOLD)
        self.screen.blit(gold_text, (20, 85))
        
        level_text = self.small_font.render(f"⭐ Level: {self.player_level}", True, (200, 200, 255))
        self.screen.blit(level_text, (20, 110))
        
        # Game status
        alive_creatures = sum(1 for c in self.creatures if c['alive'])
        uncollected_treasures = sum(1 for t in self.treasures if not t['collected'])
        status_text = self.small_font.render(f"🎮 Creatures: {alive_creatures} | Treasures: {uncollected_treasures}", True, WHITE)
        self.screen.blit(status_text, (20, 135))
        
        # Controls
        controls = [
            "WASD: Move | Shift: Chat | I: Inventory | M: Map | L/R/W: Local/Regional/World View | ESC: Exit"
        ]
        for i, control in enumerate(controls):
            control_text = self.tooltip_font.render(control, True, WHITE)
            self.screen.blit(control_text, (20, SCREEN_HEIGHT - 30 + i * 15))
        
        # Draw tooltip (only on hover)
        if self.show_tooltip:
            tooltip_surface = self.tooltip_font.render(self.tooltip_text, True, WHITE)
            tooltip_rect = tooltip_surface.get_rect()
            tooltip_rect.topleft = self.tooltip_pos
            
            # Background
            bg_rect = tooltip_rect.inflate(8, 4)
            pygame.draw.rect(self.screen, (0, 0, 0, 200), bg_rect)
            pygame.draw.rect(self.screen, WHITE, bg_rect, 1)
            
            self.screen.blit(tooltip_surface, tooltip_rect)
    
    def run(self):
        """Main game loop"""
        print("🎮 Starting Complete Ultimate Medieval Game...")
        print("🎮 Controls:")
        print("   WASD: Move")
        print("   Left click: Attack")
        print("   Shift: Toggle sliding chat")
        print("   I: Toggle inventory")
        print("   M: Toggle map")
        print("   Mouse hover: Show tooltips")
        print("   ESC: Exit")
        
        frame_count = 0
        while self.running:
            dt = self.clock.tick(60) / 1000.0
            frame_count += 1
            
            if frame_count == 1:
                print("🎮 First frame rendered")
            
            try:
                self.handle_events()
                self.update_game(dt)
                
                # Update map animations
                self.map_system.update(dt)
                
                # Draw everything
                self.draw_world()
                self.draw_ui()
                
                # Draw systems
                self.inventory.draw(self.screen)
                self.chat.draw(self.screen)
                self.hero_info.draw(self.screen, self.player_health, self.player_max_health, self.player_gold, self.player_level)
                self.map_system.draw(self.screen, self.player_x, self.player_y, 
                                   self.trees, self.creatures, self.treasures)
                
                # Draw minimap when main map is not visible
                self.map_system.draw_minimap(self.screen, self.player_x, self.player_y,
                                           self.trees, self.creatures, self.treasures)
                
                pygame.display.flip()
                
            except Exception as e:
                print(f"🚫 Error in game loop: {e}")
                import traceback
                traceback.print_exc()
                break
        
        print("🎮 Complete Ultimate Medieval Game ended")
        pygame.quit()
        sys.exit()

def main():
    """Main entry point"""
    game = CompleteUltimateGame()
    game.run()

if __name__ == "__main__":
    main()