import pygame

class HeroInfoDisplay:
    """Simple hero information display panel"""

    def __init__(self, screen_width, screen_height):
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.is_visible = False
        self.font = pygame.font.Font(None, 24)
        self.title_font = pygame.font.Font(None, 32)

    def toggle(self):
        """Toggle hero info visibility"""
        self.is_visible = not self.is_visible

    def draw(self, surface, player_health, player_max_health, player_gold, player_level):
        """Draw hero info panel"""
        if not self.is_visible:
            return

        # Panel background
        panel_rect = pygame.Rect(200, 150, 400, 300)
        pygame.draw.rect(surface, (240, 230, 210), panel_rect)
        pygame.draw.rect(surface, (101, 67, 33), panel_rect, 3)

        # Title
        title_text = self.title_font.render("🏇 Hero Information", True, (101, 67, 33))
        surface.blit(title_text, (220, 170))

        # Hero stats
        stats = [
            f"❤️ Health: {player_health}/{player_max_health}",
            f"💰 Gold: {player_gold}",
            f"⭐ Level: {player_level}",
            "",
            "Equipment:",
            "• Iron Sword (Weapon)",
            "• Leather Armor (Body)",
            "",
            "Skills:",
            "• Combat Level 1",
            "• Exploration Level 1"
        ]

        y_offset = 210
        for stat in stats:
            if stat.startswith("•"):
                stat_text = self.font.render(stat, True, (80, 60, 40))
            elif stat == "":
                y_offset += 5
                continue
            else:
                stat_text = self.font.render(stat, True, (101, 67, 33))
            surface.blit(stat_text, (220, y_offset))
            y_offset += 25

        # Close instruction
        close_text = self.font.render("Press H to close", True, (150, 150, 150))
        surface.blit(close_text, (220, 420))