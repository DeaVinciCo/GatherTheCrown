#!/usr/bin/env python3
"""
Gather The Crown: Creats & Foes - Prototype
Main entry point
"""

import pygame
import sys
from game import Game

def main():
    """Initialize and run the game"""
    pygame.init()
    
    # Game configuration
    SCREEN_WIDTH = 1280
    SCREEN_HEIGHT = 720
    FPS = 60
    
    # Create window
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Gather The Crown: Creats & Foes - Prototype")
    
    # Create clock for FPS control
    clock = pygame.time.Clock()
    
    # Create game instance
    game = Game(screen, SCREEN_WIDTH, SCREEN_HEIGHT)
    
    # Main game loop
    running = True
    while running:
        # Calculate delta time
        dt = clock.tick(FPS) / 1000.0  # Convert to seconds
        
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            game.handle_event(event)
        
        # Update game state
        game.update(dt)
        
        # Render
        game.render()
        pygame.display.flip()
    
    # Cleanup
    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()
