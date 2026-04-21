#!/usr/bin/env python3
"""
Gather The Crown - Login Screen
Beautiful startup window with simple login functionality
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
pygame.display.set_caption("🏰 Gather The Crown - Login")

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
        if os.path.exists(path):
            return pygame.font.Font(path, size)
        else:
            print(f"Font not found: {path}, using system font")
            return pygame.font.Font(None, size)
    except Exception as e:
        print(f"Font loading error: {e}, using system font")
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
            if self.rect.collidepoint(event.pos):
                self.active = True
            else:
                self.active = False
        elif event.type == pygame.KEYDOWN and self.active:
            if event.key == pygame.K_BACKSPACE:
                if len(self.text) > 0:
                    self.text = self.text[:-1]
            elif event.key == pygame.K_DELETE:
                # Clear entire field with Delete key
                self.text = ""
            elif event.key == pygame.K_TAB:
                return "TAB"
            elif event.key == pygame.K_RETURN or event.key == pygame.K_KP_ENTER:
                return "ENTER"
        elif event.type == pygame.TEXTINPUT and self.active:
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
        
        # Center text vertically
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

class Checkbox:
    def __init__(self, x, y, text, checked=False):
        self.rect = pygame.Rect(x, y, 20, 20)
        self.text = text
        self.checked = checked
        self.text_rect = pygame.Rect(x + 30, y - 2, 200, 24)
        
    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            if self.rect.collidepoint(event.pos) or self.text_rect.collidepoint(event.pos):
                self.checked = not self.checked
                return True
        return False
    
    def draw(self, surface):
        # Checkbox
        color = PARCHMENT if self.checked else PARCHMENT_DARK
        pygame.draw.rect(surface, color, self.rect, border_radius=4)
        pygame.draw.rect(surface, UMBER, self.rect, 2, border_radius=4)
        
        # Checkmark
        if self.checked:
            pygame.draw.line(surface, DARK_STONE, 
                           (self.rect.x + 4, self.rect.y + 10),
                           (self.rect.x + 8, self.rect.y + 14), 3)
            pygame.draw.line(surface, DARK_STONE,
                           (self.rect.x + 8, self.rect.y + 14),
                           (self.rect.x + 16, self.rect.y + 6), 3)
        
        # Text
        text_surface = BODY_FONT.render(self.text, True, WHITE)
        surface.blit(text_surface, (self.text_rect.x, self.text_rect.y))

class LoginScreen:
    def __init__(self):
        # Simple login fields only
        self.username_field = InputField(540, 390, 200, 40, "Username")
        self.password_field = InputField(540, 450, 200, 40, "Password", password=True)
        
        # Buttons - moved down to avoid overlap with password field
        self.login_button = Button(540, 520, 100, 40, "Login")
        self.register_button = Button(650, 520, 90, 40, "Register", "secondary")
        self.remember_checkbox = Checkbox(540, 580, "Keep me logged in")
        
        self.error_message = ""
        self.success_message = ""
        
        # User database (simple file-based for demo)
        self.users_file = "users.json"
        self.load_users()
        
        # Load saved credentials
        self.load_saved_login()
        
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
    
    def load_saved_login(self):
        """Load saved login credentials if available"""
        try:
            if os.path.exists("user_data.json"):
                with open("user_data.json", "r") as f:
                    data = json.load(f)
                    if data.get("remember_login", False):
                        self.username_field.text = data.get("username", "")
                        self.remember_checkbox.checked = True
        except:
            pass
    
    def save_login(self, username, remember):
        """Save login credentials if remember is checked"""
        try:
            data = {
                "username": username if remember else "",
                "remember_login": remember,
                "last_login": datetime.now().isoformat()
            }
            with open("user_data.json", "w") as f:
                json.dump(data, f, indent=2)
        except:
            pass
    
    def validate_login(self, username, password):
        """Validate login credentials"""
        if not username or not password:
            return False, "Please enter both username and password"
        
        if len(username) < 3:
            return False, "Username must be at least 3 characters"
        
        if len(password) < 6:
            return False, "Password must be at least 6 characters"
        
        # Check if user exists and password matches
        if username not in self.users:
            return False, "Username not found. Please register first."
        
        if self.users[username]["password"] != password:
            return False, "Incorrect password"
        
        return True, "Login successful!"
    
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
        password_result = self.password_field.handle_event(event)
        
        # Tab navigation
        if username_result == "TAB":
            self.username_field.set_active(False)
            self.password_field.set_active(True)
        elif password_result == "TAB":
            self.password_field.set_active(False)
            self.username_field.set_active(True)
        elif username_result == "ENTER" or password_result == "ENTER":
            return self.attempt_login()
        
        # Handle buttons
        if self.login_button.handle_event(event):
            return self.attempt_login()
        
        if self.register_button.handle_event(event):
            return "SHOW_REGISTER"
        
        # Handle checkbox
        self.remember_checkbox.handle_event(event)
        
        return None
    

    
    def attempt_login(self):
        """Attempt to log in with current credentials"""
        username = self.username_field.text.strip()
        password = self.password_field.text.strip()
        
        success, message = self.validate_login(username, password)
        
        if success:
            self.success_message = message
            self.error_message = ""
            # Update last login
            self.users[username]["last_login"] = datetime.now().isoformat()
            self.save_users()
            self.save_login(username, self.remember_checkbox.checked)
            
            # Check if user has created a character
            has_character = False
            try:
                if os.path.exists("user_data.json"):
                    with open("user_data.json", "r") as f:
                        data = json.load(f)
                        has_character = data.get("character", {}).get("created", False)
            except:
                pass
            
            # Write login success to temp file for launcher
            try:
                with open("login_status.tmp", "w") as f:
                    json.dump({
                        "success": True, 
                        "username": username,
                        "has_character": has_character
                    }, f)
            except:
                pass
                
            print("LOGIN_SUCCESS")
            print(f"LOGGED_IN_USER:{username}")
            return "LOGIN_SUCCESS"
        else:
            self.error_message = message
            self.success_message = ""
            return None
            return None
    

    
    def update(self, dt):
        self.username_field.update(dt)
        self.password_field.update(dt)
        self.torch_flicker += dt * 3  # Torch animation speed
    
    def draw(self, surface):
        # Background gradient
        for y in range(SCREEN_HEIGHT):
            ratio = y / SCREEN_HEIGHT
            r = int(DARK_STONE[0] * (1 - ratio) + WARM_STONE[0] * ratio)
            g = int(DARK_STONE[1] * (1 - ratio) + WARM_STONE[1] * ratio)
            b = int(DARK_STONE[2] * (1 - ratio) + WARM_STONE[2] * ratio)
            pygame.draw.line(surface, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Animated torches (decorative)
        torch_positions = [(200, 150), (SCREEN_WIDTH - 200, 150)]
        for tx, ty in torch_positions:
            flicker_offset = int(3 * (0.5 + 0.5 * pygame.math.Vector2(1, 0).rotate(self.torch_flicker * 60).x))
            flame_color = (255, 140 + flicker_offset * 10, 0)
            pygame.draw.circle(surface, flame_color, (tx, ty), 8 + flicker_offset)
            pygame.draw.circle(surface, (200, 100, 0), (tx, ty), 5)
            pygame.draw.rect(surface, UMBER, (tx - 3, ty, 6, 30))
        
        # Title
        title_surface = TITLE_FONT.render("Gather The Crown", True, GOLD)
        title_rect = title_surface.get_rect(center=(SCREEN_WIDTH // 2, 120))
        surface.blit(title_surface, title_rect)
        
        # Subtitle
        subtitle_surface = SUBTITLE_FONT.render("Creats & Foes", True, WHITE)
        subtitle_rect = subtitle_surface.get_rect(center=(SCREEN_WIDTH // 2, 170))
        surface.blit(subtitle_surface, subtitle_rect)
        
        # Game description
        lore_lines = [
            "In a realm where ancient magic flows through mystical creatures,",
            "brave riders forge bonds with powerful Creats to gather the",
            "legendary Crown Shards and restore balance to the kingdom.",
            "",
            "Choose your path, tame your companions, and become legend."
        ]
        
        y_offset = 220
        for line in lore_lines:
            if line:  # Skip empty lines
                text_surface = BODY_FONT.render(line, True, WHITE)
                text_rect = text_surface.get_rect(center=(SCREEN_WIDTH // 2, y_offset))
                surface.blit(text_surface, text_rect)
            y_offset += 25
        
        # Login form - moved down to avoid overlap
        form_title = SUBTITLE_FONT.render("Enter the Realm", True, GOLD)
        form_rect = form_title.get_rect(center=(SCREEN_WIDTH // 2, 360))
        surface.blit(form_title, form_rect)
        
        # Input fields
        self.username_field.draw(surface)
        self.password_field.draw(surface)
        
        # Buttons
        self.login_button.draw(surface)
        self.register_button.draw(surface)
        
        # Checkbox
        self.remember_checkbox.draw(surface)
        
        # Messages - moved down to accommodate new button positions
        if self.error_message:
            error_surface = BODY_FONT.render(self.error_message, True, RED)
            error_rect = error_surface.get_rect(center=(SCREEN_WIDTH // 2, 620))
            surface.blit(error_surface, error_rect)
        
        if self.success_message:
            success_surface = BODY_FONT.render(self.success_message, True, GREEN)
            success_rect = success_surface.get_rect(center=(SCREEN_WIDTH // 2, 620))
            surface.blit(success_surface, success_rect)
        
        # Footer
        footer_text = "Press ESC to exit • Tab to navigate fields"
        footer_surface = SMALL_FONT.render(footer_text, True, (150, 150, 150))
        footer_rect = footer_surface.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 30))
        surface.blit(footer_surface, footer_rect)

def main():
    print("🎮 Starting login screen...")
    clock = pygame.time.Clock()
    login_screen = LoginScreen()
    print("✅ Login screen initialized")
    
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
                result = login_screen.handle_event(event)
                if result == "LOGIN_SUCCESS":
                    print("Login successful!")
                    # Just exit cleanly - let the launcher handle the next step
                    running = False
                elif result == "SHOW_REGISTER":
                    print("🎮 Opening registration screen...")
                    # Launch registration screen
                    import subprocess
                    try:
                        subprocess.run([sys.executable, "registration_screen.py"])
                    except:
                        print("Could not launch registration screen")
        
        login_screen.update(dt)
        login_screen.draw(screen)
        pygame.display.flip()
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()