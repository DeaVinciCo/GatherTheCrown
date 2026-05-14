"""
Crown system - Fragment collection and forging
"""

import pygame

class CrownSystem:
    """Manages crown fragments and forging"""
    
    def __init__(self):
        # Fragment inventory
        self.fragments = {
            "bronze_shard": 0,
            "silver_shard": 0,
            "gold_shard": 0,
            "quartz_gem": 0,
            "topaz_gem": 0,
            "sapphire_gem": 0
        }
        
        # Crown recipes
        self.recipes = {
            "Starter Crown": {
                "bronze_shard": 3,
                "quartz_gem": 1
            },
            "Warrior Crown": {
                "silver_shard": 3,
                "topaz_gem": 2
            },
            "Royal Crown": {
                "gold_shard": 5,
                "sapphire_gem": 3
            }
        }
        
        # Completed crowns
        self.completed_crowns = []
    
    def add_fragment(self, fragment_type):
        """Add a fragment to inventory"""
        if fragment_type in self.fragments:
            self.fragments[fragment_type] += 1
            return True
        return False
    
    def can_forge_crown(self, crown_name):
        """Check if player has enough fragments to forge crown"""
        if crown_name not in self.recipes:
            return False
        
        recipe = self.recipes[crown_name]
        for fragment_type, required_count in recipe.items():
            if self.fragments.get(fragment_type, 0) < required_count:
                return False
        
        return True
    
    def forge_crown(self, crown_name):
        """Forge a crown if possible"""
        if not self.can_forge_crown(crown_name):
            return False
        
        # Consume fragments
        recipe = self.recipes[crown_name]
        for fragment_type, required_count in recipe.items():
            self.fragments[fragment_type] -= required_count
        
        # Add to completed crowns
        self.completed_crowns.append(crown_name)
        return True
    
    def get_crown_progress(self, crown_name):
        """Get progress towards forging a crown (0.0 to 1.0)"""
        if crown_name not in self.recipes:
            return 0.0
        
        recipe = self.recipes[crown_name]
        if not recipe:
            return 0.0
        
        total_progress = 0.0
        for fragment_type, required_count in recipe.items():
            current_count = self.fragments.get(fragment_type, 0)
            progress = min(1.0, current_count / required_count)
            total_progress += progress
        
        return total_progress / len(recipe)
