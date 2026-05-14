"""
Sprite manager - Creates and manages game sprites
"""

import pygame
import random
from pathlib import Path

class SpriteManager:
    """Manages all game sprites"""
    
    def __init__(self):
        self.sprites = {}
        self.create_all_sprites()
    
    def create_all_sprites(self):
        """Create all sprite surfaces"""
        # Player/Hero sprites
        self.sprites['player'] = self.create_player_sprite()
        self.sprites['player_attack'] = self.create_player_attack_sprite()
        
        # Creat sprites
        self.sprites['creat_fire'] = self.create_fire_creat_sprite()
        
        # Enemy sprites
        self.sprites['enemy_basic'] = self.create_basic_enemy_sprite()
        self.sprites['enemy_boss'] = self.create_boss_sprite()
        
        # Environment
        self.sprites['tree'] = self.create_tree_sprite()
        self.sprites['grass'] = self.create_grass_sprite()
        self.sprites['bush'] = self.create_bush_sprite()
        self.sprites['bush_no_berries'] = self.create_bush_sprite(has_berries=False)
        
        # Berry trees (element-based)
        self.sprites['berry_tree_fire'] = self.create_berry_tree_sprite('fire')
        self.sprites['berry_tree_water'] = self.create_berry_tree_sprite('water')
        self.sprites['berry_tree_earth'] = self.create_berry_tree_sprite('earth')
        self.sprites['berry_tree_storm'] = self.create_berry_tree_sprite('storm')
        self.sprites['berry_tree_light'] = self.create_berry_tree_sprite('light')
        self.sprites['berry_tree_shadow'] = self.create_berry_tree_sprite('shadow')
        
        # Berry trees without berries
        self.sprites['berry_tree_fire_empty'] = self.create_berry_tree_sprite('fire', has_berries=False)
        self.sprites['berry_tree_water_empty'] = self.create_berry_tree_sprite('water', has_berries=False)
        self.sprites['berry_tree_earth_empty'] = self.create_berry_tree_sprite('earth', has_berries=False)
        self.sprites['berry_tree_storm_empty'] = self.create_berry_tree_sprite('storm', has_berries=False)
        self.sprites['berry_tree_light_empty'] = self.create_berry_tree_sprite('light', has_berries=False)
        self.sprites['berry_tree_shadow_empty'] = self.create_berry_tree_sprite('shadow', has_berries=False)
        
        # Pathways
        self.sprites['cobblestone'] = self.create_cobblestone_sprite()
        self.sprites['brick_path'] = self.create_brick_path_sprite()
        
        # Town features
        self.sprites['direction_sign'] = self.create_direction_sign_sprite()
        
        # Items
        self.sprites['crown_shard'] = self.create_crown_shard_sprite()
        self.sprites['gem'] = self.create_gem_sprite()
        self.sprites['gold_coin'] = self.create_gold_coin_sprite()
        self.sprites['health_potion'] = self.create_health_potion_sprite()
    
    def create_player_sprite(self):
        """Create player/hero sprite - realistic adventurer"""
        size = 64
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Legs (dark pants with shading)
        pygame.draw.rect(surf, (45, 45, 50), (24, 46, 6, 12))
        pygame.draw.rect(surf, (45, 45, 50), (34, 46, 6, 12))
        # Leg highlights
        pygame.draw.line(surf, (60, 60, 65), (25, 47), (25, 56), 1)
        pygame.draw.line(surf, (60, 60, 65), (35, 47), (35, 56), 1)
        
        # Boots (brown leather)
        pygame.draw.rect(surf, (80, 50, 30), (23, 54, 7, 6))
        pygame.draw.rect(surf, (80, 50, 30), (34, 54, 7, 6))
        pygame.draw.line(surf, (100, 70, 40), (24, 55), (24, 58), 1)
        
        # Body (blue tunic with texture)
        pygame.draw.ellipse(surf, (60, 110, 190), (22, 28, 20, 24))
        # Tunic shading
        pygame.draw.ellipse(surf, (70, 130, 220), (23, 29, 18, 20))
        # Belt
        pygame.draw.rect(surf, (80, 50, 30), (22, 44, 20, 3))
        pygame.draw.circle(surf, (180, 150, 50), (32, 45), 2)  # Belt buckle
        
        # Arms (skin tone with shading)
        pygame.draw.rect(surf, (230, 200, 160), (16, 30, 5, 12))
        pygame.draw.rect(surf, (230, 200, 160), (43, 30, 5, 12))
        # Arm highlights
        pygame.draw.line(surf, (255, 220, 177), (17, 31), (17, 40), 1)
        pygame.draw.line(surf, (255, 220, 177), (44, 31), (44, 40), 1)
        
        # Hands
        pygame.draw.circle(surf, (255, 220, 177), (18, 42), 3)
        pygame.draw.circle(surf, (255, 220, 177), (45, 42), 3)
        
        # Head (skin tone with shading)
        pygame.draw.circle(surf, (230, 200, 160), (32, 20), 9)
        pygame.draw.circle(surf, (255, 220, 177), (31, 19), 8)
        
        # Hair (brown with texture)
        pygame.draw.arc(surf, (80, 50, 30), (23, 11, 18, 14), 0, 3.14, 5)
        pygame.draw.arc(surf, (101, 67, 33), (24, 12, 16, 12), 0, 3.14, 3)
        # Hair strands
        for i in range(3):
            pygame.draw.line(surf, (90, 60, 35), (26 + i*3, 13), (26 + i*3, 17), 1)
        
        # Eyes (detailed)
        pygame.draw.circle(surf, (255, 255, 255), (28, 20), 2)
        pygame.draw.circle(surf, (255, 255, 255), (36, 20), 2)
        pygame.draw.circle(surf, (70, 130, 180), (28, 20), 1)  # Blue eyes
        pygame.draw.circle(surf, (70, 130, 180), (36, 20), 1)
        
        # Nose and mouth
        pygame.draw.line(surf, (200, 170, 140), (32, 22), (32, 24), 1)
        pygame.draw.arc(surf, (180, 100, 100), (29, 24, 6, 4), 0, 3.14, 1)
        
        # SWORD (sheathed on side with detail)
        # Scabbard (leather with stitching)
        pygame.draw.rect(surf, (90, 60, 35), (43, 32, 5, 18))
        pygame.draw.rect(surf, (70, 45, 25), (44, 33, 3, 16))
        # Stitching
        for i in range(4):
            pygame.draw.circle(surf, (110, 80, 45), (45, 35 + i*4), 1)
        # Hilt (detailed)
        pygame.draw.circle(surf, (139, 69, 19), (45, 31), 3)
        pygame.draw.circle(surf, (218, 165, 32), (45, 31), 2)  # Gold pommel
        
        # Cape/cloak (flowing behind)
        pygame.draw.polygon(surf, (50, 90, 160), [(28, 30), (36, 30), (38, 48), (26, 48)])
        pygame.draw.polygon(surf, (60, 110, 190), [(29, 31), (35, 31), (36, 46), (28, 46)])
        
        # Outline for definition
        pygame.draw.circle(surf, (0, 0, 0), (32, 20), 9, 1)
        
        return surf
    
    def create_player_attack_sprite(self):
        """Create player attacking sprite with sword swing"""
        size = 64
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Body (blue tunic)
        pygame.draw.ellipse(surf, (70, 130, 220), (22, 28, 20, 22))
        
        # Head (skin tone)
        pygame.draw.circle(surf, (255, 220, 177), (32, 20), 9)
        
        # Hair (brown)
        pygame.draw.arc(surf, (101, 67, 33), (23, 11, 18, 14), 0, 3.14, 4)
        
        # Eyes
        pygame.draw.circle(surf, (0, 0, 0), (28, 20), 2)
        pygame.draw.circle(surf, (0, 0, 0), (36, 20), 2)
        
        # Arms (attacking pose)
        pygame.draw.rect(surf, (255, 220, 177), (16, 30, 5, 10))
        pygame.draw.rect(surf, (255, 220, 177), (38, 24, 5, 12))  # Extended arm
        
        # Legs
        pygame.draw.rect(surf, (60, 60, 60), (24, 46, 5, 10))
        pygame.draw.rect(surf, (60, 60, 60), (35, 46, 5, 10))
        
        # SWORD (drawn and swinging)
        # Blade (silver)
        pygame.draw.line(surf, (192, 192, 192), (43, 24), (56, 14), 5)
        # Edge highlight
        pygame.draw.line(surf, (220, 220, 220), (43, 23), (56, 13), 3)
        # Hilt (brown/gold)
        pygame.draw.circle(surf, (139, 69, 19), (43, 24), 4)
        pygame.draw.circle(surf, (218, 165, 32), (43, 24), 3)
        
        # Motion blur effect
        pygame.draw.line(surf, (192, 192, 192, 100), (45, 22), (54, 16), 3)
        
        # Outline
        pygame.draw.ellipse(surf, (0, 0, 0), (22, 28, 20, 22), 2)
        pygame.draw.circle(surf, (0, 0, 0), (32, 20), 9, 2)
        
        return surf
    
    def create_fire_creat_sprite(self):
        """Create fire drake creat - larger size"""
        size = 64
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Body (red-orange)
        pygame.draw.ellipse(surf, (255, 100, 50), (16, 24, 32, 20))
        
        # Head
        pygame.draw.circle(surf, (255, 100, 50), (40, 28), 10)
        
        # Eyes (glowing)
        pygame.draw.circle(surf, (255, 255, 0), (44, 27), 3)
        pygame.draw.circle(surf, (255, 0, 0), (44, 27), 2)
        
        # Horns
        pygame.draw.polygon(surf, (139, 0, 0), [(37, 20), (35, 14), (39, 18)])
        pygame.draw.polygon(surf, (139, 0, 0), [(45, 20), (47, 14), (43, 18)])
        
        # Wings
        pygame.draw.polygon(surf, (255, 150, 100), [(16, 28), (8, 22), (14, 32)])
        pygame.draw.polygon(surf, (255, 150, 100), [(48, 28), (56, 22), (50, 32)])
        
        # Tail
        pygame.draw.line(surf, (255, 100, 50), (16, 34), (8, 42), 4)
        
        # Flame particles
        for i in range(3):
            x = 42 + i * 4
            y = 20 - i * 2
            pygame.draw.circle(surf, (255, 200, 0), (x, y), 3)
        
        # Outline
        pygame.draw.ellipse(surf, (139, 0, 0), (16, 24, 32, 20), 2)
        pygame.draw.circle(surf, (139, 0, 0), (40, 28), 10, 2)
        
        return surf
    
    def create_basic_enemy_sprite(self):
        """Create basic enemy (Emberling) - realistic creature"""
        size = 48
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Body (dark red with texture)
        pygame.draw.circle(surf, (150, 40, 40), (24, 26), 17)
        pygame.draw.circle(surf, (180, 50, 50), (24, 24), 16)
        # Body shading
        pygame.draw.circle(surf, (200, 60, 60), (22, 22), 14)
        
        # Texture spots
        for i in range(6):
            x = 16 + (i % 3) * 6
            y = 18 + (i // 3) * 8
            pygame.draw.circle(surf, (130, 30, 30), (x, y), 2)
        
        # Eyes (menacing glow)
        # Eye sockets (dark)
        pygame.draw.circle(surf, (80, 20, 20), (18, 22), 4)
        pygame.draw.circle(surf, (80, 20, 20), (30, 22), 4)
        # Glowing eyes
        pygame.draw.circle(surf, (255, 200, 0), (18, 22), 3)
        pygame.draw.circle(surf, (255, 200, 0), (30, 22), 3)
        pygame.draw.circle(surf, (255, 100, 0), (18, 22), 2)
        pygame.draw.circle(surf, (255, 100, 0), (30, 22), 2)
        # Eye gleam
        pygame.draw.circle(surf, (255, 255, 200), (19, 21), 1)
        pygame.draw.circle(surf, (255, 255, 200), (31, 21), 1)
        
        # Mouth (fanged maw)
        pygame.draw.arc(surf, (100, 20, 20), (16, 26, 16, 12), 0, 3.14, 3)
        # Fangs (white with shading)
        pygame.draw.polygon(surf, (240, 240, 230), [(19, 30), (18, 35), (20, 34)])
        pygame.draw.polygon(surf, (240, 240, 230), [(29, 30), (28, 35), (30, 34)])
        pygame.draw.line(surf, (200, 200, 190), (19, 32), (19, 34), 1)
        
        # Spikes/horns (detailed)
        spikes = [
            [(24, 7), (22, 11), (26, 11)],
            [(12, 13), (10, 17), (14, 17)],
            [(36, 13), (34, 17), (38, 17)]
        ]
        for spike in spikes:
            pygame.draw.polygon(surf, (100, 20, 20), spike)
            pygame.draw.polygon(surf, (139, 30, 30), spike, 1)
        
        # Claws/arms
        pygame.draw.line(surf, (120, 30, 30), (10, 28), (6, 34), 3)
        pygame.draw.line(surf, (120, 30, 30), (38, 28), (42, 34), 3)
        
        # Outline for definition
        pygame.draw.circle(surf, (80, 20, 20), (24, 24), 16, 2)
        
        return surf
    
    def create_boss_sprite(self):
        """Create boss enemy - extra large"""
        size = 80
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Body (purple, larger)
        pygame.draw.ellipse(surf, (150, 50, 150), (18, 32, 44, 36))
        
        # Head
        pygame.draw.circle(surf, (150, 50, 150), (40, 28), 16)
        
        # Crown (boss indicator)
        pygame.draw.polygon(surf, (255, 215, 0), [
            (28, 14), (32, 6), (36, 14),
            (40, 6), (44, 14), (48, 6), (52, 14)
        ])
        
        # Eyes (glowing red)
        pygame.draw.circle(surf, (255, 0, 0), (34, 27), 4)
        pygame.draw.circle(surf, (255, 0, 0), (46, 27), 4)
        pygame.draw.circle(surf, (255, 255, 0), (34, 27), 2)
        pygame.draw.circle(surf, (255, 255, 0), (46, 27), 2)
        
        # Horns (large)
        pygame.draw.polygon(surf, (100, 0, 100), [(26, 16), (20, 6), (28, 12)])
        pygame.draw.polygon(surf, (100, 0, 100), [(54, 16), (60, 6), (52, 12)])
        
        # Arms (threatening)
        pygame.draw.rect(surf, (120, 40, 120), (10, 36, 10, 20))
        pygame.draw.rect(surf, (120, 40, 120), (60, 36, 10, 20))
        
        # Claws
        for i in range(3):
            pygame.draw.line(surf, (200, 200, 200), (12 + i*2, 56), (10 + i*2, 62), 2)
            pygame.draw.line(surf, (200, 200, 200), (62 + i*2, 56), (60 + i*2, 62), 2)
        
        # Outline
        pygame.draw.ellipse(surf, (80, 0, 80), (18, 32, 44, 36), 3)
        pygame.draw.circle(surf, (80, 0, 80), (40, 28), 16, 3)
        
        return surf
    
    def create_tree_sprite(self):
        """Create tree sprite - larger size"""
        size = 80
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Trunk (brown with texture)
        trunk_x = 34
        trunk_width = 14
        trunk_height = 38
        
        # Main trunk
        pygame.draw.rect(surf, (101, 67, 33), (trunk_x, 42, trunk_width, trunk_height))
        
        # Bark texture (vertical lines)
        for i in range(5):
            y = 46 + i * 7
            pygame.draw.line(surf, (80, 50, 25), (trunk_x + 2, y), (trunk_x + 2, y + 5), 1)
            pygame.draw.line(surf, (80, 50, 25), (trunk_x + trunk_width - 3, y + 1), 
                           (trunk_x + trunk_width - 3, y + 5), 1)
        
        # Trunk shading (right side darker)
        pygame.draw.rect(surf, (80, 50, 25), (trunk_x + trunk_width - 4, 42, 4, trunk_height))
        
        # Foliage (multiple layers for depth)
        # Bottom layer (darkest)
        pygame.draw.ellipse(surf, (34, 100, 34), (18, 26, 44, 30))
        
        # Middle layers
        pygame.draw.ellipse(surf, (46, 125, 50), (22, 22, 36, 26))
        pygame.draw.ellipse(surf, (50, 140, 60), (16, 28, 26, 20))
        pygame.draw.ellipse(surf, (50, 140, 60), (38, 28, 26, 20))
        
        # Top layer (lightest - sunlight)
        pygame.draw.ellipse(surf, (60, 179, 113), (26, 16, 28, 22))
        pygame.draw.ellipse(surf, (70, 190, 120), (30, 14, 20, 18))
        
        # Add some leaf detail
        for i in range(8):
            x = 22 + (i % 4) * 10
            y = 20 + (i // 4) * 10
            pygame.draw.circle(surf, (55, 150, 65), (x, y), 4)
        
        # Trunk outline
        pygame.draw.rect(surf, (70, 50, 20), (trunk_x, 42, trunk_width, trunk_height), 2)
        
        return surf
    
    def create_grass_sprite(self):
        """Create realistic grass tuft with depth"""
        size = 24
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Multiple grass blades with realistic colors and curves
        grass_blades = [
            # (x, height, base_color, bend, thickness)
            (3, 13, (35, 100, 35), -1.5, 2),
            (6, 15, (40, 115, 40), -0.5, 2),
            (9, 12, (45, 125, 45), 0.5, 2),
            (12, 16, (38, 110, 38), 0, 3),
            (15, 13, (42, 120, 42), 1, 2),
            (18, 14, (48, 130, 48), -0.5, 2),
            (21, 11, (50, 135, 50), 1.5, 2),
        ]
        
        for x, height, color, bend, thickness in grass_blades:
            base_y = 22
            top_y = base_y - height
            
            # Create curved blade with bezier-like effect
            points = [
                (x, base_y),
                (x + bend * 0.3, base_y - height * 0.25),
                (x + bend * 0.7, base_y - height * 0.6),
                (x + bend * 1.2, base_y - height * 0.85),
                (x + bend * 1.5, top_y)
            ]
            
            # Draw blade with thickness
            for i in range(len(points) - 1):
                pygame.draw.line(surf, color, points[i], points[i + 1], thickness)
            
            # Add highlight on sunny side
            highlight = (min(255, color[0] + 30), min(255, color[1] + 35), min(255, color[2] + 30))
            for i in range(len(points) - 1):
                offset_points = [(points[i][0] + 1, points[i][1]), (points[i + 1][0] + 1, points[i + 1][1])]
                pygame.draw.line(surf, highlight, offset_points[0], offset_points[1], 1)
            
            # Add shadow on other side
            shadow = (max(0, color[0] - 15), max(0, color[1] - 20), max(0, color[2] - 15))
            for i in range(len(points) - 1):
                offset_points = [(points[i][0] - 1, points[i][1]), (points[i + 1][0] - 1, points[i + 1][1])]
                pygame.draw.line(surf, shadow, offset_points[0], offset_points[1], 1)
        
        # Add some ground texture at base
        for i in range(5):
            x = 4 + i * 4
            pygame.draw.circle(surf, (60, 50, 30), (x, 23), 1)
        
        return surf
    
    def create_bush_sprite(self, has_berries=True):
        """Create bush sprite - more detailed"""
        size = 56
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Bush body with multiple clumps for texture
        # Bottom layer (darkest)
        pygame.draw.ellipse(surf, (30, 90, 30), (10, 24, 36, 28))
        
        # Middle clumps
        clumps = [
            (14, 22, 16, 18, (40, 110, 40)),
            (26, 20, 18, 20, (45, 120, 45)),
            (18, 28, 14, 16, (38, 105, 38)),
            (30, 26, 16, 18, (42, 115, 42)),
        ]
        
        for x, y, w, h, color in clumps:
            pygame.draw.ellipse(surf, color, (x, y, w, h))
        
        # Top highlights (sunlight)
        pygame.draw.ellipse(surf, (55, 140, 55), (20, 18, 16, 14))
        pygame.draw.ellipse(surf, (60, 150, 60), (24, 16, 12, 10))
        
        # Add texture with small circles
        for i in range(12):
            x = 12 + (i % 4) * 8
            y = 22 + (i // 4) * 6
            shade = (35 + i * 2, 100 + i * 3, 35 + i * 2)
            pygame.draw.circle(surf, shade, (x, y), 3)
        
        # Berries scattered (only if has_berries is True)
        if has_berries:
            berry_positions = [(16, 26), (22, 30), (32, 28), (28, 24), (38, 30)]
            for bx, by in berry_positions:
                # Berry with highlight
                pygame.draw.circle(surf, (180, 20, 50), (bx, by), 3)
                pygame.draw.circle(surf, (220, 60, 90), (bx - 1, by - 1), 1)
        
        return surf
    
    def create_crown_shard_sprite(self):
        """Create crown shard/fragment"""
        size = 24
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Shard shape (metallic bronze)
        points = [(12, 4), (18, 10), (16, 18), (8, 18), (6, 10)]
        pygame.draw.polygon(surf, (205, 127, 50), points)
        pygame.draw.polygon(surf, (139, 90, 43), points, 2)
        
        # Shine effect
        pygame.draw.line(surf, (255, 215, 0), (10, 8), (14, 12), 2)
        
        # Label
        font = pygame.font.Font(None, 10)
        text = font.render("SHARD", True, (255, 255, 255))
        text_rect = text.get_rect(center=(12, 22))
        surf.blit(text, text_rect)
        
        return surf
    
    def create_gem_sprite(self):
        """Create gem sprite"""
        size = 20
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Gem shape (diamond)
        points = [(10, 2), (16, 8), (10, 16), (4, 8)]
        pygame.draw.polygon(surf, (100, 200, 255), points)
        
        # Facets
        pygame.draw.line(surf, (150, 220, 255), (10, 2), (10, 16), 1)
        pygame.draw.line(surf, (150, 220, 255), (4, 8), (16, 8), 1)
        
        # Outline
        pygame.draw.polygon(surf, (50, 100, 200), points, 2)
        
        # Sparkle
        pygame.draw.circle(surf, (255, 255, 255), (12, 6), 1)
        
        return surf
    
    def create_gold_coin_sprite(self):
        """Create gold coin"""
        size = 16
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Coin
        pygame.draw.circle(surf, (255, 215, 0), (8, 8), 7)
        pygame.draw.circle(surf, (218, 165, 32), (8, 8), 7, 2)
        
        # Symbol
        font = pygame.font.Font(None, 14)
        text = font.render("G", True, (139, 90, 0))
        text_rect = text.get_rect(center=(8, 8))
        surf.blit(text, text_rect)
        
        return surf
    
    def create_health_potion_sprite(self):
        """Create health potion"""
        size = 24
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Bottle
        pygame.draw.rect(surf, (100, 100, 150), (8, 8, 8, 12))
        pygame.draw.rect(surf, (80, 80, 120), (10, 6, 4, 3))  # Cork
        
        # Liquid (red)
        pygame.draw.rect(surf, (220, 20, 60), (9, 10, 6, 9))
        
        # Shine
        pygame.draw.line(surf, (200, 200, 255), (9, 10), (9, 14), 1)
        
        # Outline
        pygame.draw.rect(surf, (60, 60, 100), (8, 8, 8, 12), 1)
        
        return surf
    
    def get_sprite(self, name):
        """Get a sprite by name"""
        return self.sprites.get(name)
    
    def create_berry_tree_sprite(self, element, has_berries=True):
        """Create berry tree based on element type"""
        size = 80
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Trunk (same as regular tree)
        trunk_x = 34
        trunk_width = 14
        trunk_height = 38
        pygame.draw.rect(surf, (101, 67, 33), (trunk_x, 42, trunk_width, trunk_height))
        
        # Bark texture
        for i in range(5):
            y = 46 + i * 7
            pygame.draw.line(surf, (80, 50, 25), (trunk_x + 2, y), (trunk_x + 2, y + 5), 1)
        pygame.draw.rect(surf, (80, 50, 25), (trunk_x + trunk_width - 4, 42, 4, trunk_height))
        
        # Element-specific foliage and berries
        element_data = {
            'fire': {
                'foliage': [(180, 50, 30), (200, 70, 40), (220, 90, 50)],
                'berry': (255, 100, 0),
                'glow': (255, 200, 0)
            },
            'water': {
                'foliage': [(40, 100, 140), (60, 120, 160), (80, 140, 180)],
                'berry': (100, 180, 255),
                'glow': (150, 220, 255)
            },
            'earth': {
                'foliage': [(60, 100, 40), (80, 120, 60), (100, 140, 80)],
                'berry': (139, 90, 43),
                'glow': (205, 133, 63)
            },
            'storm': {
                'foliage': [(80, 80, 120), (100, 100, 140), (120, 120, 160)],
                'berry': (200, 200, 255),
                'glow': (255, 255, 255)
            },
            'light': {
                'foliage': [(200, 200, 140), (220, 220, 160), (240, 240, 180)],
                'berry': (255, 255, 200),
                'glow': (255, 255, 255)
            },
            'shadow': {
                'foliage': [(80, 60, 100), (100, 80, 120), (120, 100, 140)],
                'berry': (140, 100, 180),
                'glow': (180, 140, 220)
            }
        }
        
        data = element_data.get(element, element_data['earth'])
        
        # Foliage layers
        pygame.draw.ellipse(surf, data['foliage'][0], (18, 26, 44, 30))
        pygame.draw.ellipse(surf, data['foliage'][1], (22, 22, 36, 26))
        pygame.draw.ellipse(surf, data['foliage'][2], (26, 16, 28, 22))
        
        # Berries scattered throughout foliage (only if has_berries is True)
        if has_berries:
            berry_positions = [
                (24, 28), (32, 26), (40, 30), (28, 34), (36, 32),
                (30, 24), (38, 26), (26, 30), (34, 28), (42, 28)
            ]
            
            for bx, by in berry_positions:
                # Berry with glow
                pygame.draw.circle(surf, data['berry'], (bx, by), 3)
                pygame.draw.circle(surf, data['glow'], (bx - 1, by - 1), 1)
                # Subtle glow aura
                glow_surf = pygame.Surface((10, 10), pygame.SRCALPHA)
                pygame.draw.circle(glow_surf, (*data['glow'], 40), (5, 5), 5)
                surf.blit(glow_surf, (bx - 5, by - 5))
        
        # Trunk outline
        pygame.draw.rect(surf, (70, 50, 20), (trunk_x, 42, trunk_width, trunk_height), 2)
        
        return surf
    
    def create_cobblestone_sprite(self):        
        # Trunk outline
        pygame.draw.rect(surf, (70, 50, 20), (trunk_x, 42, trunk_width, trunk_height), 2)
        
        return surf
    
    def create_cobblestone_sprite(self):
        """Create cobblestone path tile - main roads"""
        size = 64
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Base color (gray stone)
        surf.fill((120, 120, 130))
        
        # Individual cobblestones (irregular pattern)
        stones = [
            # (x, y, width, height, shade_variation)
            (2, 2, 18, 16, -10),
            (22, 2, 20, 18, 5),
            (44, 2, 18, 16, -5),
            (2, 20, 16, 20, 10),
            (20, 22, 22, 18, -8),
            (44, 20, 18, 20, 3),
            (2, 42, 20, 20, -3),
            (24, 42, 18, 20, 8),
            (44, 44, 18, 18, -12)
        ]
        
        for x, y, w, h, shade in stones:
            base_color = 120 + shade
            stone_color = (base_color, base_color, base_color + 10)
            pygame.draw.rect(surf, stone_color, (x, y, w, h))
            # Stone outline (darker)
            pygame.draw.rect(surf, (80, 80, 85), (x, y, w, h), 1)
            # Highlight on top-left
            pygame.draw.line(surf, (140, 140, 145), (x + 1, y + 1), (x + w - 2, y + 1), 1)
            pygame.draw.line(surf, (140, 140, 145), (x + 1, y + 1), (x + 1, y + h - 2), 1)
        
        # Mortar lines (darker gaps between stones)
        pygame.draw.line(surf, (90, 90, 95), (20, 0), (20, 64), 2)
        pygame.draw.line(surf, (90, 90, 95), (42, 0), (42, 64), 2)
        pygame.draw.line(surf, (90, 90, 95), (0, 20), (64, 20), 2)
        pygame.draw.line(surf, (90, 90, 95), (0, 42), (64, 42), 2)
        
        # Add some texture (small dots for weathering)
        for i in range(15):
            x = random.randint(4, 60)
            y = random.randint(4, 60)
            pygame.draw.circle(surf, (100, 100, 105), (x, y), 1)
        
        return surf
    
    def create_brick_path_sprite(self):
        """Create brick path tile - smaller paths"""
        size = 64
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Base color (reddish-brown brick)
        surf.fill((140, 80, 60))
        
        # Brick pattern (offset rows)
        brick_height = 12
        brick_width = 30
        
        for row in range(6):
            y = row * brick_height
            # Offset every other row
            offset = brick_width // 2 if row % 2 == 1 else 0
            
            for col in range(3):
                x = col * brick_width + offset - (brick_width // 2 if row % 2 == 1 else 0)
                
                if x < -brick_width or x > size:
                    continue
                
                # Brick color variation
                shade = random.randint(-15, 15)
                brick_color = (140 + shade, 80 + shade // 2, 60 + shade // 3)
                
                # Draw brick
                pygame.draw.rect(surf, brick_color, (x, y, brick_width - 2, brick_height - 2))
                
                # Brick texture (horizontal lines)
                pygame.draw.line(surf, (120 + shade, 70 + shade // 2, 50 + shade // 3), 
                               (x + 2, y + brick_height // 2), 
                               (x + brick_width - 4, y + brick_height // 2), 1)
                
                # Highlight on top
                pygame.draw.line(surf, (160, 100, 80), (x, y), (x + brick_width - 2, y), 1)
                
                # Shadow on bottom
                pygame.draw.line(surf, (100, 60, 40), 
                               (x, y + brick_height - 3), 
                               (x + brick_width - 2, y + brick_height - 3), 1)
        
        # Mortar (light gray between bricks)
        for row in range(6):
            y = row * brick_height
            pygame.draw.line(surf, (160, 150, 140), (0, y), (size, y), 2)
        
        return surf

    
    def create_direction_sign_sprite(self):
        """Create old-timey wooden direction sign pointing to Forest Trials and Home Base"""
        size = 96
        surf = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Wooden post (center)
        post_x = 44
        post_width = 8
        post_height = 70
        
        # Post with wood grain
        pygame.draw.rect(surf, (101, 67, 33), (post_x, 26, post_width, post_height))
        pygame.draw.rect(surf, (80, 50, 25), (post_x + 1, 26, 2, post_height))  # Dark grain
        pygame.draw.rect(surf, (120, 80, 40), (post_x + 5, 26, 2, post_height))  # Light grain
        
        # Post outline
        pygame.draw.rect(surf, (70, 45, 20), (post_x, 26, post_width, post_height), 1)
        
        # TOP SIGN - "Forest Trials" (pointing up-left)
        # Sign board (angled upward)
        sign1_points = [
            (20, 20),   # Left point
            (45, 15),   # Top right
            (45, 28),   # Bottom right
            (20, 33)    # Bottom left
        ]
        pygame.draw.polygon(surf, (139, 90, 43), sign1_points)
        pygame.draw.polygon(surf, (101, 67, 33), sign1_points, 2)
        
        # Arrow point (left side)
        arrow1_points = [(20, 20), (12, 26), (20, 33)]
        pygame.draw.polygon(surf, (120, 80, 40), arrow1_points)
        pygame.draw.polygon(surf, (80, 50, 25), arrow1_points, 1)
        
        # Wood grain on sign
        pygame.draw.line(surf, (120, 80, 40), (22, 22), (43, 18), 1)
        pygame.draw.line(surf, (90, 60, 30), (22, 28), (43, 24), 1)
        
        # Text "FOREST" on top sign
        font_small = pygame.font.Font(None, 12)
        text1 = font_small.render("FOREST", True, (240, 230, 210))
        text1_shadow = font_small.render("FOREST", True, (50, 30, 15))
        surf.blit(text1_shadow, (24, 18))
        surf.blit(text1, (23, 17))
        
        text2 = font_small.render("TRIALS", True, (240, 230, 210))
        text2_shadow = font_small.render("TRIALS", True, (50, 30, 15))
        surf.blit(text2_shadow, (24, 26))
        surf.blit(text2, (23, 25))
        
        # BOTTOM SIGN - "Home Base" (pointing right)
        # Sign board (horizontal, pointing right)
        sign2_points = [
            (52, 40),   # Left top
            (80, 40),   # Right top
            (80, 53),   # Right bottom
            (52, 53)    # Left bottom
        ]
        pygame.draw.polygon(surf, (139, 90, 43), sign2_points)
        pygame.draw.polygon(surf, (101, 67, 33), sign2_points, 2)
        
        # Arrow point (right side)
        arrow2_points = [(80, 40), (88, 46), (80, 53)]
        pygame.draw.polygon(surf, (120, 80, 40), arrow2_points)
        pygame.draw.polygon(surf, (80, 50, 25), arrow2_points, 1)
        
        # Wood grain on sign
        pygame.draw.line(surf, (120, 80, 40), (54, 42), (78, 42), 1)
        pygame.draw.line(surf, (90, 60, 30), (54, 48), (78, 48), 1)
        
        # Text "HOME BASE" on bottom sign
        text3 = font_small.render("HOME", True, (240, 230, 210))
        text3_shadow = font_small.render("HOME", True, (50, 30, 15))
        surf.blit(text3_shadow, (56, 41))
        surf.blit(text3, (55, 40))
        
        text4 = font_small.render("BASE", True, (240, 230, 210))
        text4_shadow = font_small.render("BASE", True, (50, 30, 15))
        surf.blit(text4_shadow, (56, 48))
        surf.blit(text4, (55, 47))
        
        # Nails/bolts on signs
        for nail_y in [18, 30]:
            pygame.draw.circle(surf, (60, 40, 20), (44, nail_y), 2)
            pygame.draw.circle(surf, (80, 50, 25), (44, nail_y), 1)
        
        for nail_y in [42, 51]:
            pygame.draw.circle(surf, (60, 40, 20), (52, nail_y), 2)
            pygame.draw.circle(surf, (80, 50, 25), (52, nail_y), 1)
        
        return surf
