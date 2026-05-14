"""
UI system - HUD, menus, and overlays
"""

import pygame

class UI:
    """Game UI manager"""
    
    def __init__(self, width, height, player, creat, crown_system):
        self.width = width
        self.height = height
        self.player = player
        self.creat = creat
        self.crown_system = crown_system
        
        # UI state
        self.inventory_open = False
        self.map_open = False
        self.crown_forge_open = False
        
        # Fonts
        self.font_large = pygame.font.Font(None, 48)
        self.font_medium = pygame.font.Font(None, 32)
        self.font_small = pygame.font.Font(None, 24)
        
        # Colors
        self.bg_color = (40, 30, 20, 200)  # Parchment-like
        self.border_color = (100, 80, 60)
        self.text_color = (255, 255, 255)
        self.gold_color = (255, 215, 0)
    
    def handle_event(self, event):
        """Handle UI events"""
        if event.type == pygame.MOUSEBUTTONDOWN and self.crown_forge_open:
            # Check crown forge buttons
            mouse_pos = event.pos
            self.check_forge_buttons(mouse_pos)
    
    def toggle_inventory(self):
        """Toggle inventory display"""
        self.inventory_open = not self.inventory_open
        if self.inventory_open:
            self.map_open = False
            self.crown_forge_open = False
    
    def toggle_map(self):
        """Toggle map display"""
        self.map_open = not self.map_open
        if self.map_open:
            self.inventory_open = False
            self.crown_forge_open = False
    
    def toggle_crown_forge(self):
        """Toggle crown forge display"""
        self.crown_forge_open = not self.crown_forge_open
        if self.crown_forge_open:
            self.inventory_open = False
            self.map_open = False
    
    def render(self, screen):
        """Render all UI elements"""
        # Always render HUD
        self.render_hud(screen)
        
        # Render open menus
        if self.inventory_open:
            self.render_inventory(screen)
        elif self.map_open:
            self.render_map(screen)
        elif self.crown_forge_open:
            self.render_crown_forge(screen)
    
    def render_hud(self, screen):
        """Render HUD (health, stamina, gold, etc.)"""
        padding = 20
        
        # Player health bar
        self.draw_bar(screen, padding, padding, 200, 20, 
                     self.player.health, self.player.max_health,
                     (255, 0, 0), "Health")
        
        # Player stamina bar
        self.draw_bar(screen, padding, padding + 30, 200, 15,
                     self.player.stamina, self.player.max_stamina,
                     (100, 255, 100), "Stamina")
        
        # Creat health bar
        self.draw_bar(screen, padding, padding + 55, 200, 15,
                     self.creat.health, self.creat.max_health,
                     (255, 100, 50), f"{self.creat.name}")
        
        # Creat bond meter
        self.draw_bar(screen, padding, padding + 80, 200, 10,
                     self.creat.bond_level, 100,
                     (255, 215, 0), "Bond")
        
        # Gold counter (top right)
        gold_text = f"Gold: {self.player.gold}"
        text_surf = self.font_small.render(gold_text, True, self.gold_color)
        screen.blit(text_surf, (self.width - text_surf.get_width() - padding, padding))
        
        # Crown fragment counter (top right, below gold)
        y_offset = padding + 30
        for fragment_type, count in self.crown_system.fragments.items():
            if count > 0:
                frag_text = f"{fragment_type}: {count}"
                text_surf = self.font_small.render(frag_text, True, (200, 200, 200))
                screen.blit(text_surf, (self.width - text_surf.get_width() - padding, y_offset))
                y_offset += 25
        
        # Controls hint (bottom left)
        hints = [
            "WASD - Move",
            "LEFT CLICK - Attack",
            "Space - Dodge Roll",
            "1 - Creat Attack",
            "I - Inventory",
            "C - Crown Forge"
        ]
        y_offset = self.height - padding - (len(hints) * 20)
        for hint in hints:
            text_surf = self.font_small.render(hint, True, (150, 150, 150))
            screen.blit(text_surf, (padding, y_offset))
            y_offset += 20
    
    def draw_bar(self, screen, x, y, width, height, current, maximum, color, label=None):
        """Draw a stat bar"""
        # Background
        pygame.draw.rect(screen, (50, 50, 50), (x, y, width, height))
        
        # Fill
        fill_width = int(width * (current / maximum)) if maximum > 0 else 0
        pygame.draw.rect(screen, color, (x, y, fill_width, height))
        
        # Border
        pygame.draw.rect(screen, (200, 200, 200), (x, y, width, height), 2)
        
        # Label
        if label:
            text_surf = self.font_small.render(label, True, self.text_color)
            screen.blit(text_surf, (x, y - 18))
        
        # Value text
        value_text = f"{int(current)}/{int(maximum)}"
        text_surf = self.font_small.render(value_text, True, self.text_color)
        text_x = x + width // 2 - text_surf.get_width() // 2
        text_y = y + height // 2 - text_surf.get_height() // 2
        screen.blit(text_surf, (text_x, text_y))
    
    def render_inventory(self, screen):
        """Render inventory screen"""
        # Semi-transparent overlay
        overlay = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        screen.blit(overlay, (0, 0))
        
        # Inventory panel
        panel_width = 600
        panel_height = 500
        panel_x = (self.width - panel_width) // 2
        panel_y = (self.height - panel_height) // 2
        
        # Panel background
        panel_surf = pygame.Surface((panel_width, panel_height), pygame.SRCALPHA)
        panel_surf.fill(self.bg_color)
        pygame.draw.rect(panel_surf, self.border_color, (0, 0, panel_width, panel_height), 3)
        screen.blit(panel_surf, (panel_x, panel_y))
        
        # Title
        title = self.font_large.render("INVENTORY", True, self.text_color)
        title_rect = title.get_rect(center=(self.width // 2, panel_y + 40))
        screen.blit(title, title_rect)
        
        # Content
        content_y = panel_y + 100
        
        # Gold
        gold_text = self.font_medium.render(f"Gold: {self.player.gold} GC", True, self.gold_color)
        screen.blit(gold_text, (panel_x + 50, content_y))
        content_y += 50
        
        # Fragments
        frag_title = self.font_medium.render("Crown Fragments:", True, self.text_color)
        screen.blit(frag_title, (panel_x + 50, content_y))
        content_y += 40
        
        for fragment_type, count in self.crown_system.fragments.items():
            frag_text = self.font_small.render(f"  {fragment_type}: {count}", True, (200, 200, 200))
            screen.blit(frag_text, (panel_x + 70, content_y))
            content_y += 30
        
        # Close instruction
        close_text = self.font_small.render("Press I to close", True, (150, 150, 150))
        close_rect = close_text.get_rect(center=(self.width // 2, panel_y + panel_height - 30))
        screen.blit(close_text, close_rect)
    
    def render_map(self, screen):
        """Render map screen"""
        # Semi-transparent overlay
        overlay = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        screen.blit(overlay, (0, 0))
        
        # Map panel
        panel_width = 700
        panel_height = 600
        panel_x = (self.width - panel_width) // 2
        panel_y = (self.height - panel_height) // 2
        
        # Panel background
        panel_surf = pygame.Surface((panel_width, panel_height), pygame.SRCALPHA)
        panel_surf.fill(self.bg_color)
        pygame.draw.rect(panel_surf, self.border_color, (0, 0, panel_width, panel_height), 3)
        screen.blit(panel_surf, (panel_x, panel_y))
        
        # Title
        title = self.font_large.render("MAP", True, self.text_color)
        title_rect = title.get_rect(center=(self.width // 2, panel_y + 40))
        screen.blit(title, title_rect)
        
        # Simplified map (placeholder)
        map_area_x = panel_x + 50
        map_area_y = panel_y + 100
        map_area_width = panel_width - 100
        map_area_height = panel_height - 150
        
        pygame.draw.rect(screen, (50, 80, 50), 
                        (map_area_x, map_area_y, map_area_width, map_area_height))
        
        # Player position indicator
        player_map_x = map_area_x + map_area_width // 2
        player_map_y = map_area_y + map_area_height // 2
        pygame.draw.circle(screen, (70, 130, 220), (player_map_x, player_map_y), 8)
        
        # Close instruction
        close_text = self.font_small.render("Press M to close", True, (150, 150, 150))
        close_rect = close_text.get_rect(center=(self.width // 2, panel_y + panel_height - 30))
        screen.blit(close_text, close_rect)
    
    def render_crown_forge(self, screen):
        """Render crown forge screen"""
        # Semi-transparent overlay
        overlay = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))
        screen.blit(overlay, (0, 0))
        
        # Forge panel
        panel_width = 800
        panel_height = 600
        panel_x = (self.width - panel_width) // 2
        panel_y = (self.height - panel_height) // 2
        
        # Panel background
        panel_surf = pygame.Surface((panel_width, panel_height), pygame.SRCALPHA)
        panel_surf.fill(self.bg_color)
        pygame.draw.rect(panel_surf, self.border_color, (0, 0, panel_width, panel_height), 3)
        screen.blit(panel_surf, (panel_x, panel_y))
        
        # Title
        title = self.font_large.render("CROWN FORGE", True, self.gold_color)
        title_rect = title.get_rect(center=(self.width // 2, panel_y + 40))
        screen.blit(title, title_rect)
        
        # Crown recipes
        content_y = panel_y + 100
        
        for crown_name, recipe in self.crown_system.recipes.items():
            # Crown name
            name_text = self.font_medium.render(crown_name, True, self.text_color)
            screen.blit(name_text, (panel_x + 50, content_y))
            
            # Requirements
            req_y = content_y + 35
            can_forge = self.crown_system.can_forge_crown(crown_name)
            
            for fragment_type, required_count in recipe.items():
                current_count = self.crown_system.fragments.get(fragment_type, 0)
                color = (0, 255, 0) if current_count >= required_count else (255, 100, 100)
                req_text = self.font_small.render(
                    f"  {fragment_type}: {current_count}/{required_count}",
                    True, color
                )
                screen.blit(req_text, (panel_x + 70, req_y))
                req_y += 25
            
            # Forge button
            button_x = panel_x + 500
            button_y = content_y + 10
            button_width = 150
            button_height = 40
            
            button_color = (100, 200, 100) if can_forge else (100, 100, 100)
            pygame.draw.rect(screen, button_color, 
                           (button_x, button_y, button_width, button_height))
            pygame.draw.rect(screen, (200, 200, 200), 
                           (button_x, button_y, button_width, button_height), 2)
            
            button_text = "FORGE" if can_forge else "LOCKED"
            text_surf = self.font_small.render(button_text, True, self.text_color)
            text_rect = text_surf.get_rect(center=(button_x + button_width // 2, 
                                                   button_y + button_height // 2))
            screen.blit(text_surf, text_rect)
            
            # Store button rect for click detection
            if not hasattr(self, 'forge_buttons'):
                self.forge_buttons = {}
            self.forge_buttons[crown_name] = pygame.Rect(button_x, button_y, 
                                                         button_width, button_height)
            
            content_y += 120
        
        # Close instruction
        close_text = self.font_small.render("Press C to close", True, (150, 150, 150))
        close_rect = close_text.get_rect(center=(self.width // 2, panel_y + panel_height - 30))
        screen.blit(close_text, close_rect)
    
    def check_forge_buttons(self, mouse_pos):
        """Check if forge button was clicked"""
        if not hasattr(self, 'forge_buttons'):
            return
        
        for crown_name, button_rect in self.forge_buttons.items():
            if button_rect.collidepoint(mouse_pos):
                if self.crown_system.can_forge_crown(crown_name):
                    if self.crown_system.forge_crown(crown_name):
                        print(f"Forged {crown_name}!")
                        # TODO: Add visual/audio feedback
