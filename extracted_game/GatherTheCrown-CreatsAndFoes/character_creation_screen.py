#!/usr/bin/env python3
"""
Gather The Crown: Creats & Foes - Character Creation Screen
Create and customize your rider character
"""

import pygame
import sys
import json
import os
import subprocess
import random
import math

# Initialize Pygame
pygame.init()

# Screen settings
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("🏰 Gather The Crown - Create Your Rider")

# Colors - Medieval Theme
DARK_STONE = (25, 25, 30)
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
ORANGE = (255, 140, 0)

# Fonts
def load_font(path, size):
    try:
        return pygame.font.Font(path, size)
    except:
        return pygame.font.Font(None, size)

TITLE_FONT = load_font("fonts/CloisterBlack.ttf", 64)
SUBTITLE_FONT = load_font("fonts/Cinzel-Regular.ttf", 28)
BODY_FONT = load_font("fonts/Cinzel-Regular.ttf", 20)
INPUT_FONT = load_font("fonts/Cinzel-Regular.ttf", 24)
SMALL_FONT = load_font("fonts/Cinzel-Regular.ttf", 16)

class InputField:
    def __init__(self, x, y, width, height, placeholder="", max_length=20):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = ""
        self.placeholder = placeholder
        self.max_length = max_length
        self.active = False
        self.cursor_timer = 0
        self.cursor_visible = True
        
    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            self.active = self.rect.collidepoint(event.pos)
        elif event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_BACKSPACE:
                if self.text:
                    self.text = self.text[:-1]
            elif event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                return "ENTER"
        elif event.type == pygame.TEXTINPUT and self.active:
            if len(self.text) < self.max_length and ord(event.text) >= 32:
                self.text += event.text
        return None
    
    def update(self, dt):
        self.cursor_timer += dt
        if self.cursor_timer >= 0.5:
            self.cursor_timer = 0
            self.cursor_visible = not self.cursor_visible
    
    def draw(self, surface):
        # Background
        color = PARCHMENT if self.active else PARCHMENT_DARK
        pygame.draw.rect(surface, color, self.rect, border_radius=8)
        pygame.draw.rect(surface, UMBER, self.rect, 2, border_radius=8)
        
        # Text
        display_text = self.text if self.text else self.placeholder
        text_color = DARK_STONE if self.text else (120, 120, 120)
        text_surface = INPUT_FONT.render(display_text, True, text_color)
        
        text_y = self.rect.y + (self.rect.height - text_surface.get_height()) // 2
        surface.blit(text_surface, (self.rect.x + 12, text_y))
        
        # Cursor
        if self.active and self.cursor_visible and self.text:
            cursor_x = self.rect.x + 12 + INPUT_FONT.size(self.text)[0]
            pygame.draw.line(surface, DARK_STONE, 
                           (cursor_x, self.rect.y + 8), 
                           (cursor_x, self.rect.bottom - 8), 2)

class SelectionButton:
    def __init__(self, x, y, width, height, text, value, selected=False):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.value = value
        self.selected = selected
        self.hovered = False
        
    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos):
                return True
        return False
    
    def draw(self, surface):
        # Colors based on state
        if self.selected:
            bg_color = GOLD
            border_color = GOLD_BRIGHT
            text_color = DARK_STONE
        elif self.hovered:
            bg_color = LIGHT_STONE
            border_color = GOLD
            text_color = WHITE
        else:
            bg_color = DARK_STONE
            border_color = UMBER
            text_color = WHITE
        
        # Draw button
        pygame.draw.rect(surface, bg_color, self.rect, border_radius=8)
        pygame.draw.rect(surface, border_color, self.rect, 2, border_radius=8)
        
        # Draw text
        text_surface = BODY_FONT.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        surface.blit(text_surface, text_rect)

class ActionButton:
    def __init__(self, x, y, width, height, text, style="primary"):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = text
        self.style = style
        self.hovered = False
        self.pressed = False
        
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
    
    def draw(self, surface):
        if self.style == "primary":
            base_color = GOLD
            hover_color = GOLD_BRIGHT
            text_color = DARK_STONE
        else:
            base_color = LIGHT_STONE
            hover_color = (70, 70, 80)
            text_color = WHITE
        
        color = hover_color if self.hovered else base_color
        if self.pressed:
            color = tuple(max(0, c - 20) for c in color)
        
        pygame.draw.rect(surface, color, self.rect, border_radius=10)
        pygame.draw.rect(surface, UMBER, self.rect, 2, border_radius=10)
        
        text_surface = INPUT_FONT.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        surface.blit(text_surface, text_rect)

class CharacterCreationScreen:
    def __init__(self):
        # Character data
        self.character_name = ""
        self.selected_element = "fire"
        self.selected_weapon = "sword"
        
        # UI Elements
        self.name_field = InputField(540, 200, 200, 40, "Enter name...")
        
        # Element selection
        self.elements = [
            {"name": "Fire", "value": "fire", "color": RED, "desc": "Passionate and fierce"},
            {"name": "Water", "value": "water", "color": BLUE, "desc": "Calm and adaptive"},
            {"name": "Earth", "value": "earth", "color": GREEN, "desc": "Strong and steadfast"},
            {"name": "Air", "value": "air", "color": (200, 200, 255), "desc": "Swift and free"},
            {"name": "Light", "value": "light", "color": GOLD, "desc": "Pure and healing"},
            {"name": "Shadow", "value": "shadow", "color": PURPLE, "desc": "Mysterious and cunning"}
        ]
        
        self.element_buttons = []
        for i, element in enumerate(self.elements):
            x = 200 + (i % 3) * 160
            y = 300 + (i // 3) * 60
            selected = element["value"] == self.selected_element
            button = SelectionButton(x, y, 140, 50, element["name"], element["value"], selected)
            self.element_buttons.append(button)
        
        # Weapon selection
        self.weapons = [
            {"name": "Sword", "value": "sword", "desc": "Balanced offense and defense"},
            {"name": "Staff", "value": "staff", "desc": "Enhances magical abilities"},
            {"name": "Bow", "value": "bow", "desc": "Ranged attacks and precision"},
            {"name": "Axe", "value": "axe", "desc": "High damage, slower attacks"}
        ]
        
        self.weapon_buttons = []
        for i, weapon in enumerate(self.weapons):
            x = 200 + (i % 2) * 200
            y = 450 + (i // 2) * 60
            selected = weapon["value"] == self.selected_weapon
            button = SelectionButton(x, y, 180, 50, weapon["name"], weapon["value"], selected)
            self.weapon_buttons.append(button)
        
        # Action buttons
        self.create_button = ActionButton(450, 580, 150, 50, "Create Rider")
        self.random_button = ActionButton(620, 580, 120, 50, "Random", "secondary")
        self.back_button = ActionButton(50, 580, 100, 50, "Back", "secondary")
        
        # Animation
        self.animation_timer = 0
        self.element_glow = {}
        for element in self.elements:
            self.element_glow[element["value"]] = 0
        
        self.error_message = ""
    
    def handle_event(self, event):
        # Handle name input
        name_result = self.name_field.handle_event(event)
        if name_result == "ENTER":
            self.character_name = self.name_field.text.strip()
        
        # Handle element selection
        for i, button in enumerate(self.element_buttons):
            if button.handle_event(event):
                # Deselect all others
                for b in self.element_buttons:
                    b.selected = False
                # Select this one
                button.selected = True
                self.selected_element = button.value
        
        # Handle weapon selection
        for button in self.weapon_buttons:
            if button.handle_event(event):
                # Deselect all others
                for b in self.weapon_buttons:
                    b.selected = False
                # Select this one
                button.selected = True
                self.selected_weapon = button.value
        
        # Handle action buttons
        if self.create_button.handle_event(event):
            return self.create_character()
        
        if self.random_button.handle_event(event):
            self.randomize_character()
        
        if self.back_button.handle_event(event):
            return "BACK"
        
        return None
    
    def randomize_character(self):
        """Generate random character"""
        # Random name
        first_names = ["Kaelen", "Selora", "Drax", "Lyssan", "Orin", "Elaryn", "Thane", "Mira", "Gareth", "Zara"]
        last_names = ["Emberfall", "Stormwind", "Ironforge", "Shadowbane", "Lightbringer", "Earthshaker"]
        
        self.character_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        self.name_field.text = self.character_name
        
        # Random element
        self.selected_element = random.choice([e["value"] for e in self.elements])
        for button in self.element_buttons:
            button.selected = button.value == self.selected_element
        
        # Random weapon
        self.selected_weapon = random.choice([w["value"] for w in self.weapons])
        for button in self.weapon_buttons:
            button.selected = button.value == self.selected_weapon
        
        self.error_message = ""
    
    def create_character(self):
        """Create the character and save data"""
        name = self.name_field.text.strip()
        
        if not name:
            self.error_message = "Please enter a character name"
            return None
        
        if len(name) < 2:
            self.error_message = "Name must be at least 2 characters"
            return None
        
        # Save character data
        character_data = {
            "name": name,
            "element": self.selected_element,
            "weapon": self.selected_weapon,
            "created": True
        }
        
        try:
            # Update user data with character info
            user_data = {}
            if os.path.exists("user_data.json"):
                with open("user_data.json", "r") as f:
                    user_data = json.load(f)
            
            user_data["character"] = character_data
            
            with open("user_data.json", "w") as f:
                json.dump(user_data, f, indent=2)
            
            print(f"Character created: {name} ({self.selected_element} {self.selected_weapon})")
            return "CHARACTER_CREATED"
            
        except Exception as e:
            self.error_message = f"Error saving character: {e}"
            return None
    
    def update(self, dt):
        self.animation_timer += dt
        self.name_field.update(dt)
        
        # Update element glow effects
        for element in self.elements:
            if element["value"] == self.selected_element:
                self.element_glow[element["value"]] = min(1.0, self.element_glow[element["value"]] + dt * 3)
            else:
                self.element_glow[element["value"]] = max(0.0, self.element_glow[element["value"]] - dt * 2)
    
    def draw_character_preview(self, surface):
        """Draw a preview of the character"""
        preview_rect = pygame.Rect(850, 200, 200, 300)
        pygame.draw.rect(surface, DARK_STONE, preview_rect, border_radius=10)
        pygame.draw.rect(surface, GOLD, preview_rect, 2, border_radius=10)
        
        # Title
        title_surface = BODY_FONT.render("Preview", True, GOLD)
        title_rect = title_surface.get_rect(center=(preview_rect.centerx, preview_rect.y + 20))
        surface.blit(title_surface, title_rect)
        
        # Character representation (simple for now)
        char_center = (preview_rect.centerx, preview_rect.y + 100)
        
        # Element aura
        element_data = next(e for e in self.elements if e["value"] == self.selected_element)
        aura_color = (*element_data["color"], 50)
        aura_surf = pygame.Surface((80, 80), pygame.SRCALPHA)
        pygame.draw.circle(aura_surf, aura_color, (40, 40), 40)
        surface.blit(aura_surf, (char_center[0] - 40, char_center[1] - 40))
        
        # Character body (simple representation)
        pygame.draw.circle(surface, PARCHMENT, char_center, 25)  # Body
        pygame.draw.circle(surface, UMBER, char_center, 25, 2)   # Outline
        
        # Weapon indicator
        weapon_data = next(w for w in self.weapons if w["value"] == self.selected_weapon)
        weapon_text = weapon_data["name"][0]  # First letter
        weapon_surface = SUBTITLE_FONT.render(weapon_text, True, GOLD)
        weapon_rect = weapon_surface.get_rect(center=(char_center[0] + 30, char_center[1]))
        surface.blit(weapon_surface, weapon_rect)
        
        # Character info
        info_y = preview_rect.y + 150
        if self.name_field.text:
            name_surface = SMALL_FONT.render(self.name_field.text[:15], True, WHITE)
            name_rect = name_surface.get_rect(center=(preview_rect.centerx, info_y))
            surface.blit(name_surface, name_rect)
        
        element_surface = SMALL_FONT.render(f"Element: {element_data['name']}", True, element_data["color"])
        element_rect = element_surface.get_rect(center=(preview_rect.centerx, info_y + 25))
        surface.blit(element_surface, element_rect)
        
        weapon_surface = SMALL_FONT.render(f"Weapon: {weapon_data['name']}", True, WHITE)
        weapon_rect = weapon_surface.get_rect(center=(preview_rect.centerx, info_y + 45))
        surface.blit(weapon_surface, weapon_rect)
    
    def draw(self, surface):
        # Background gradient
        for y in range(SCREEN_HEIGHT):
            ratio = y / SCREEN_HEIGHT
            r = int(DARK_STONE[0] * (1 - ratio) + WARM_STONE[0] * ratio)
            g = int(DARK_STONE[1] * (1 - ratio) + WARM_STONE[1] * ratio)
            b = int(DARK_STONE[2] * (1 - ratio) + WARM_STONE[2] * ratio)
            pygame.draw.line(surface, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Title
        title_surface = TITLE_FONT.render("Create Your Rider", True, GOLD)
        title_rect = title_surface.get_rect(center=(SCREEN_WIDTH // 2, 60))
        surface.blit(title_surface, title_rect)
        
        # Subtitle
        subtitle_surface = SUBTITLE_FONT.render("Forge your legend in the realm", True, WHITE)
        subtitle_rect = subtitle_surface.get_rect(center=(SCREEN_WIDTH // 2, 110))
        surface.blit(subtitle_surface, subtitle_rect)
        
        # Name section
        name_label = BODY_FONT.render("Rider Name:", True, WHITE)
        surface.blit(name_label, (450, 170))
        self.name_field.draw(surface)
        
        # Element section
        element_label = BODY_FONT.render("Elemental Affinity:", True, WHITE)
        surface.blit(element_label, (200, 270))
        
        for i, (button, element) in enumerate(zip(self.element_buttons, self.elements)):
            button.draw(surface)
            
            # Element description
            if button.selected:
                desc_surface = SMALL_FONT.render(element["desc"], True, element["color"])
                desc_rect = desc_surface.get_rect(center=(button.rect.centerx, button.rect.bottom + 15))
                surface.blit(desc_surface, desc_rect)
        
        # Weapon section
        weapon_label = BODY_FONT.render("Preferred Weapon:", True, WHITE)
        surface.blit(weapon_label, (200, 420))
        
        for button, weapon in zip(self.weapon_buttons, self.weapons):
            button.draw(surface)
            
            # Weapon description
            if button.selected:
                desc_surface = SMALL_FONT.render(weapon["desc"], True, WHITE)
                desc_rect = desc_surface.get_rect(center=(button.rect.centerx, button.rect.bottom + 15))
                surface.blit(desc_surface, desc_rect)
        
        # Character preview
        self.draw_character_preview(surface)
        
        # Action buttons
        self.create_button.draw(surface)
        self.random_button.draw(surface)
        self.back_button.draw(surface)
        
        # Error message
        if self.error_message:
            error_surface = BODY_FONT.render(self.error_message, True, RED)
            error_rect = error_surface.get_rect(center=(SCREEN_WIDTH // 2, 650))
            surface.blit(error_surface, error_rect)
        
        # Instructions
        instructions = "Choose your element and weapon to define your playstyle"
        inst_surface = SMALL_FONT.render(instructions, True, (180, 180, 180))
        inst_rect = inst_surface.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 30))
        surface.blit(inst_surface, inst_rect)

def main():
    clock = pygame.time.Clock()
    character_screen = CharacterCreationScreen()
    
    running = True
    while running:
        dt = clock.tick(60) / 1000.0
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
            else:
                result = character_screen.handle_event(event)
                if result == "CHARACTER_CREATED":
                    print("Character created successfully! Launching game...")
                    pygame.time.wait(1000)  # Brief pause
                    
                    # Launch main game
                    try:
                        subprocess.Popen([sys.executable, "complete_ultimate_game.py"])
                        running = False
                    except Exception as e:
                        print(f"Error launching game: {e}")
                        character_screen.error_message = "Failed to launch game"
                
                elif result == "BACK":
                    print("Returning to previous screen...")
                    running = False
        
        character_screen.update(dt)
        character_screen.draw(screen)
        pygame.display.flip()
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()