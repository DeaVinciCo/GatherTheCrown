#!/usr/bin/env python3
"""
Gather The Crown - Registration Screen
Separate screen for creating new accounts
"""

import pygame
import sys
import json
import os
from datetime import datetime

# Initialize Pygame
pygame.init()

# Screen settings
SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("🏰 Gather The Crown - Create Account")

# Colors - Medieval Theme
DARK_STONE = (25, 25, 30)
LIGHT_STONE = (45, 45, 50)
WARM_STONE = (60, 55, 45)
PARCHMENT = (225, 213, 187)
PARCHMENT_DARK = (190, 175, 145)
GOLD = (212, 175, 55)
GOLD_DARK = (180, 140, 30)
WHITE = (245, 245, 245)
UMBER = (104, 86, 64)
RED = (180, 50, 50)
GREEN = (50, 150, 50)

# Fonts
def load_font(path, size):
    try:
        return pygame.font.Font(path, size)
    except:
        return pygame.font.Font(None, size)

TITLE_FONT = load_font("fonts/CloisterBlack.ttf", 72)
SUBTITLE_FONT = load_font("fonts/Cinzel-Regular.ttf", 28)
BODY_FONT = load_font("fonts/Cinzel-Regular.ttf", 20)
INPUT_FONT = load_font("fonts/Cinzel-Regular.ttf", 24)
SMALL_FONT = load_font("fonts/Cinzel-Regular.ttf", 16)

class InputField:
    def __init__(self, x, y, width, height, placeholder="", password=False):
        self.rect = pygame.Rect(x, y, width, height)
        self.text = ""
        self.placeholder = placeholder
        self.password = password
        self.active = False
        self.cursor_timer = 0
        self.cursor_visible = True
        
    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            # Only change active state, don't return anything that would interfere
            was_active = self.active
            if self.rect.collidepoint(event.pos):
                self.active = True
            else:
                self.active = False
        elif event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_BACKSPACE:
                if self.text:  # Only backspace if there's text
                    self.text = self.text[:-1]
            elif event.key == pygame.K_TAB:
                return "TAB"
            elif event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                return "ENTER"
        elif event.type == pygame.TEXTINPUT and self.active:
            # Handle text input properly
            if len(self.text) < 30:  # Max length
                # Filter out control characters
                if ord(event.text) >= 32:  # Printable characters only
                    self.text += event.text
        return None
    
    def set_active(self, active):
        """Manually set field active state"""
        self.active = active
    
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
        display_text = self.text
        if self.password and self.text:
            display_text = "●" * len(self.text)
        elif not self.text and not self.active:
            display_text = self.placeholder
        
        text_color = DARK_STONE if self.text or self.active else (100, 100, 100)
        text_surface = INPUT_FONT.render(display_text, True, text_color)
        
        # Center text vertically with proper padding
        text_y = self.rect.y + (self.rect.height - text_surface.get_height()) // 2
        surface.blit(text_surface, (self.rect.x + 12, text_y))
        
        # Cursor
        if self.active and self.cursor_visible:
            cursor_x = self.rect.x + 12 + INPUT_FONT.size(self.text if not self.password else "●" * len(self.text))[0]
            pygame.draw.line(surface, DARK_STONE, 
                           (cursor_x, self.rect.y + 8), 
                           (cursor_x, self.rect.bottom - 8), 2)

class Button:
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
        # Colors based on style and state
        if self.style == "primary":
            base_color = GOLD
            hover_color = GOLD_DARK
            text_color = DARK_STONE
        else:  # secondary
            base_color = LIGHT_STONE
            hover_color = (60, 60, 65)
            text_color = WHITE
        
        color = hover_color if self.hovered else base_color
        if self.pressed:
            color = tuple(max(0, c - 20) for c in color)
        
        # Draw button
        pygame.draw.rect(surface, color, self.rect, border_radius=8)
        pygame.draw.rect(surface, UMBER, self.rect, 2, border_radius=8)
        
        # Draw text
        text_surface = INPUT_FONT.render(self.text, True, text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        surface.blit(text_surface, text_rect)

class RegistrationScreen:
    def __init__(self):
        # Registration fields - centered and properly sized, closer to instructions
        center_x = SCREEN_WIDTH // 2
        field_width = 280
        field_height = 45
        
        self.username_field = InputField(center_x - field_width//2, 270, field_width, field_height, "Username")
        self.email_field = InputField(center_x - field_width//2, 325, field_width, field_height, "Email")
        self.password_field = InputField(center_x - field_width//2, 380, field_width, field_height, "Password", password=True)
        self.confirm_password_field = InputField(center_x - field_width//2, 435, field_width, field_height, "Confirm Password", password=True)
        
        # Buttons - centered and properly spaced, moved down slightly
        button_y = 500
        self.register_button = Button(center_x - 100, button_y, 140, 45, "Create Account")
        self.back_button = Button(center_x + 50, button_y, 80, 45, "Back", "secondary")
        
        self.error_message = ""
        self.success_message = ""
        
        # User database (simple file-based for demo)
        self.users_file = "users.json"
        self.load_users()
        
        # Animation elements
        self.torch_flicker = 0
        
    def load_users(self):
        """Load user database"""
        try:
            if os.path.exists(self.users_file):
                with open(self.users_file, "r") as f:
                    self.users = json.load(f)
            else:
                self.users = {}
        except:
            self.users = {}
    
    def save_users(self):
        """Save user database"""
        try:
            with open(self.users_file, "w") as f:
                json.dump(self.users, f, indent=2)
        except Exception as e:
            print(f"Error saving users: {e}")
    
    def validate_registration(self, username, email, password, confirm_password):
        """Validate registration data"""
        if not username or not email or not password or not confirm_password:
            return False, "Please fill in all fields"
        
        if len(username) < 3:
            return False, "Username must be at least 3 characters"
        
        if len(password) < 6:
            return False, "Password must be at least 6 characters"
        
        if password != confirm_password:
            return False, "Passwords do not match"
        
        if username in self.users:
            return False, "Username already exists"
        
        if "@" not in email or "." not in email:
            return False, "Please enter a valid email address"
        
        # Check if email already exists
        for user_data in self.users.values():
            if user_data.get("email") == email:
                return False, "Email already registered"
        
        return True, "Registration successful!"
    
    def register_user(self, username, email, password):
        """Register a new user"""
        self.users[username] = {
            "password": password,
            "email": email,
            "created": datetime.now().isoformat(),
            "last_login": None
        }
        self.save_users()
        return True
    
    def handle_event(self, event):
        # Handle input fields
        username_result = self.username_field.handle_event(event)
        email_result = self.email_field.handle_event(event)
        password_result = self.password_field.handle_event(event)
        confirm_password_result = self.confirm_password_field.handle_event(event)
        
        # Tab navigation
        if username_result == "TAB":
            self.username_field.set_active(False)
            self.email_field.set_active(True)
        elif email_result == "TAB":
            self.email_field.set_active(False)
            self.password_field.set_active(True)
        elif password_result == "TAB":
            self.password_field.set_active(False)
            self.confirm_password_field.set_active(True)
        elif confirm_password_result == "TAB":
            self.confirm_password_field.set_active(False)
            self.username_field.set_active(True)
        
        # Enter key handling
        if (username_result == "ENTER" or email_result == "ENTER" or 
            password_result == "ENTER" or confirm_password_result == "ENTER"):
            return self.attempt_registration()
        
        # Handle buttons
        if self.register_button.handle_event(event):
            return self.attempt_registration()
        
        if self.back_button.handle_event(event):
            return "BACK_TO_LOGIN"
        
        return None
    
    def attempt_registration(self):
        """Attempt to register a new user"""
        username = self.username_field.text.strip()
        email = self.email_field.text.strip()
        password = self.password_field.text.strip()
        confirm_password = self.confirm_password_field.text.strip()
        
        success, message = self.validate_registration(username, email, password, confirm_password)
        
        if success:
            if self.register_user(username, email, password):
                self.success_message = "Account created successfully!"
                self.error_message = ""
                return "REGISTRATION_SUCCESS"
            else:
                self.error_message = "Failed to create account. Please try again."
                self.success_message = ""
                return None
        else:
            self.error_message = message
            self.success_message = ""
            return None
    
    def update(self, dt):
        self.username_field.update(dt)
        self.email_field.update(dt)
        self.password_field.update(dt)
        self.confirm_password_field.update(dt)
        self.torch_flicker += dt * 3  # Torch animation speed
    
    def draw(self, surface):
        # Background gradient
        for y in range(SCREEN_HEIGHT):
            ratio = y / SCREEN_HEIGHT
            r = int(DARK_STONE[0] * (1 - ratio) + WARM_STONE[0] * ratio)
            g = int(DARK_STONE[1] * (1 - ratio) + WARM_STONE[1] * ratio)
            b = int(DARK_STONE[2] * (1 - ratio) + WARM_STONE[2] * ratio)
            pygame.draw.line(surface, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Subtle decorative elements (removed excess torches)
        # Just add a simple border decoration - adjusted for new layout
        border_color = (80, 70, 60)
        pygame.draw.rect(surface, border_color, (SCREEN_WIDTH//2 - 200, 250, 400, 310), 2, border_radius=12)
        
        # Title
        title_surface = TITLE_FONT.render("Join the Realm", True, GOLD)
        title_rect = title_surface.get_rect(center=(SCREEN_WIDTH // 2, 120))
        surface.blit(title_surface, title_rect)
        
        # Subtitle
        subtitle_surface = SUBTITLE_FONT.render("Create Your Account", True, WHITE)
        subtitle_rect = subtitle_surface.get_rect(center=(SCREEN_WIDTH // 2, 170))
        surface.blit(subtitle_surface, subtitle_rect)
        
        # Instructions - moved closer to input fields
        instruction_lines = [
            "Choose a unique username and secure password",
            "Your email will be used for account recovery"
        ]
        
        y_offset = 210
        for line in instruction_lines:
            text_surface = BODY_FONT.render(line, True, WHITE)
            text_rect = text_surface.get_rect(center=(SCREEN_WIDTH // 2, y_offset))
            surface.blit(text_surface, text_rect)
            y_offset += 22
        
        # Input fields
        self.username_field.draw(surface)
        self.email_field.draw(surface)
        self.password_field.draw(surface)
        self.confirm_password_field.draw(surface)
        
        # Buttons
        self.register_button.draw(surface)
        self.back_button.draw(surface)
        
        # Messages - positioned properly within the form area, moved up
        if self.error_message:
            error_surface = BODY_FONT.render(self.error_message, True, RED)
            error_rect = error_surface.get_rect(center=(SCREEN_WIDTH // 2, 570))
            surface.blit(error_surface, error_rect)
        
        if self.success_message:
            success_surface = BODY_FONT.render(self.success_message, True, GREEN)
            success_rect = success_surface.get_rect(center=(SCREEN_WIDTH // 2, 570))
            surface.blit(success_surface, success_rect)
        
        # Footer
        footer_text = "Press ESC to go back • Tab to navigate fields"
        footer_surface = SMALL_FONT.render(footer_text, True, (150, 150, 150))
        footer_rect = footer_surface.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 30))
        surface.blit(footer_surface, footer_rect)

def main():
    clock = pygame.time.Clock()
    registration_screen = RegistrationScreen()
    
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
                result = registration_screen.handle_event(event)
                if result == "REGISTRATION_SUCCESS":
                    print("Account created successfully!")
                    pygame.time.wait(1500)  # Show success message
                    
                    # Automatically proceed to character creation
                    print("Account created! Proceeding to character creation...")
                    pygame.time.wait(1500)  # Show success message briefly
                    running = False
                    
                    # Close this window and launch character creation
                    pygame.quit()
                    
                    # Launch character creation screen which will then launch the game
                    try:
                        subprocess.Popen([sys.executable, "character_creation_screen.py"])
                        sys.exit(0)
                    except Exception as e:
                        print(f"Error launching character creation: {e}")
                        # Fallback to main game
                        subprocess.Popen([sys.executable, "complete_ultimate_game.py"])
                        sys.exit(1)
                        
                elif result == "BACK_TO_LOGIN":
                    print("Returning to login screen...")
                    running = False
        
        registration_screen.update(dt)
        registration_screen.draw(screen)
        pygame.display.flip()
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()