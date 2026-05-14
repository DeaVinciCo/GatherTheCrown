#!/usr/bin/env python3
"""
Content Tracker Tool
Tracks game content implementation progress
"""

import json
from pathlib import Path
from typing import Dict, List
from datetime import datetime

class ContentTracker:
    """Track implementation progress of game content"""
    
    def __init__(self, tracker_file: str = "content_progress.json"):
        self.tracker_file = Path(tracker_file)
        self.data = self.load_data()
    
    def load_data(self) -> Dict:
        """Load tracking data from file"""
        if self.tracker_file.exists():
            with open(self.tracker_file, 'r') as f:
                return json.load(f)
        return self.get_default_data()
    
    def save_data(self):
        """Save tracking data to file"""
        with open(self.tracker_file, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def get_default_data(self) -> Dict:
        """Get default tracking structure"""
        return {
            "last_updated": datetime.now().isoformat(),
            "characters": {
                "total": 48,
                "implemented": 0,
                "list": []
            },
            "creats": {
                "total": 56,
                "implemented": 0,
                "by_element": {
                    "fire": {"total": 8, "implemented": 0},
                    "water": {"total": 8, "implemented": 0},
                    "earth": {"total": 8, "implemented": 0},
                    "storm": {"total": 8, "implemented": 0},
                    "light": {"total": 8, "implemented": 0},
                    "shadow": {"total": 8, "implemented": 0},
                    "arcane": {"total": 8, "implemented": 0}
                }
            },
            "bosses": {
                "total": 20,
                "implemented": 0,
                "by_tier": {
                    "tier_1_mini": {"total": 3, "implemented": 0},
                    "tier_2_roaming": {"total": 3, "implemented": 0},
                    "tier_3_crown": {"total": 3, "implemented": 0},
                    "tier_4_story": {"total": 4, "implemented": 0},
                    "tier_5_faction": {"total": 1, "implemented": 0}
                }
            },
            "crowns": {
                "total": 7,
                "implemented": 0,
                "types": {
                    "story": {"implemented": False},
                    "melee": {"implemented": False},
                    "racing": {"implemented": False},
                    "minigames": {"implemented": False},
                    "pve_dungeon": {"implemented": False},
                    "pvp": {"implemented": False},
                    "side_quests": {"implemented": False}
                }
            },
            "biomes": {
                "total": 7,
                "implemented": 0,
                "list": {
                    "greenwood": {"implemented": False, "tilesets": 0, "props": 0},
                    "tideborn": {"implemented": False, "tilesets": 0, "props": 0},
                    "highlands": {"implemented": False, "tilesets": 0, "props": 0},
                    "sky_isles": {"implemented": False, "tilesets": 0, "props": 0},
                    "scribes": {"implemented": False, "tilesets": 0, "props": 0},
                    "shadowfolk": {"implemented": False, "tilesets": 0, "props": 0},
                    "infernal": {"implemented": False, "tilesets": 0, "props": 0}
                }
            },
            "weapons": {
                "total": 30,
                "implemented": 0,
                "categories": {
                    "starter": {"total": 7, "implemented": 0},
                    "basic": {"total": 8, "implemented": 0},
                    "elemental": {"total": 8, "implemented": 0},
                    "crown_tier": {"total": 7, "implemented": 0}
                }
            },
            "ui_screens": {
                "total": 15,
                "implemented": 0,
                "list": {
                    "title_screen": False,
                    "main_menu": False,
                    "character_creation": False,
                    "inventory": False,
                    "crown_forge": False,
                    "map": False,
                    "quest_journal": False,
                    "settings": False,
                    "chat": False,
                    "hud": False,
                    "pause_menu": False,
                    "shop": False,
                    "character_stats": False,
                    "creat_management": False,
                    "achievements": False
                }
            },
            "systems": {
                "total": 12,
                "implemented": 0,
                "list": {
                    "movement": False,
                    "combat": False,
                    "inventory": False,
                    "crown_collection": False,
                    "creat_bonding": False,
                    "creat_evolution": False,
                    "boss_ai": False,
                    "save_system": False,
                    "audio": False,
                    "multiplayer": False,
                    "chat": False,
                    "achievements": False
                }
            }
        }
    
    def update_progress(self, category: str, subcategory: str = None, count: int = 1):
        """Update implementation progress"""
        if category in self.data:
            if subcategory:
                if isinstance(self.data[category].get(subcategory), dict):
                    if "implemented" in self.data[category][subcategory]:
                        self.data[category][subcategory]["implemented"] += count
            else:
                if "implemented" in self.data[category]:
                    self.data[category]["implemented"] += count
        
        self.data["last_updated"] = datetime.now().isoformat()
        self.save_data()
    
    def mark_complete(self, category: str, item: str):
        """Mark an item as complete"""
        if category in self.data:
            if "list" in self.data[category]:
                if isinstance(self.data[category]["list"], dict):
                    if item in self.data[category]["list"]:
                        self.data[category]["list"][item] = True
                        self.data[category]["implemented"] += 1
            elif "types" in self.data[category]:
                if item in self.data[category]["types"]:
                    self.data[category]["types"][item]["implemented"] = True
                    self.data[category]["implemented"] += 1
        
        self.data["last_updated"] = datetime.now().isoformat()
        self.save_data()
    
    def generate_report(self):
        """Generate progress report"""
        print("\n" + "="*70)
        print("GATHER THE CROWN: Content Implementation Progress")
        print("="*70)
        print(f"Last Updated: {self.data['last_updated']}\n")
        
        # Overall progress
        total_items = 0
        completed_items = 0
        
        for category, data in self.data.items():
            if category == "last_updated":
                continue
            
            if isinstance(data, dict) and "total" in data and "implemented" in data:
                total_items += data["total"]
                completed_items += data["implemented"]
        
        overall_percent = (completed_items / total_items * 100) if total_items > 0 else 0
        
        print(f"📊 OVERALL PROGRESS: {completed_items}/{total_items} ({overall_percent:.1f}%)")
        print(self.progress_bar(completed_items, total_items))
        print()
        
        # Category breakdown
        categories = [
            ("Characters", "characters"),
            ("Creats", "creats"),
            ("Bosses", "bosses"),
            ("Crowns", "crowns"),
            ("Biomes", "biomes"),
            ("Weapons", "weapons"),
            ("UI Screens", "ui_screens"),
            ("Core Systems", "systems")
        ]
        
        for display_name, key in categories:
            if key in self.data:
                data = self.data[key]
                total = data.get("total", 0)
                implemented = data.get("implemented", 0)
                percent = (implemented / total * 100) if total > 0 else 0
                
                print(f"\n{display_name}: {implemented}/{total} ({percent:.1f}%)")
                print(self.progress_bar(implemented, total))
                
                # Show subcategories if available
                if "by_tier" in data:
                    for tier_name, tier_data in data["by_tier"].items():
                        tier_total = tier_data.get("total", 0)
                        tier_impl = tier_data.get("implemented", 0)
                        print(f"  • {tier_name}: {tier_impl}/{tier_total}")
                
                if "categories" in data:
                    for cat_name, cat_data in data["categories"].items():
                        cat_total = cat_data.get("total", 0)
                        cat_impl = cat_data.get("implemented", 0)
                        print(f"  • {cat_name}: {cat_impl}/{cat_total}")
        
        print("\n" + "="*70)
        
        # MVP Recommendation
        print("\n📋 MVP RECOMMENDATION (Phase 1):")
        print("  • 3 Characters (6% of total)")
        print("  • 6 Creats - 1 per element except arcane (11% of total)")
        print("  • 2 Biomes - Greenwood + 1 faction zone (29% of total)")
        print("  • 5 Bosses - 1 mini, 1 roaming, 1 crown, 2 story (25% of total)")
        print("  • 1 Crown Type - Story Mode crown (14% of total)")
        print("  • 10 Weapons - All starter + 3 basic (33% of total)")
        print("  • 8 UI Screens - Essential gameplay screens (53% of total)")
        print("  • 6 Core Systems - Movement, combat, inventory, crown, save, audio (50% of total)")
        print("\n  Estimated MVP Completion: ~20-25% of total content")
        print("="*70 + "\n")
    
    @staticmethod
    def progress_bar(current: int, total: int, width: int = 50) -> str:
        """Generate ASCII progress bar"""
        if total == 0:
            return "[" + " " * width + "] 0%"
        
        percent = current / total
        filled = int(width * percent)
        bar = "█" * filled + "░" * (width - filled)
        return f"[{bar}] {percent*100:.1f}%"


def main():
    """Run content tracker"""
    tracker = ContentTracker()
    
    # Generate initial report
    tracker.generate_report()
    
    # Example: Mark some items as complete
    # tracker.mark_complete("ui_screens", "title_screen")
    # tracker.mark_complete("systems", "movement")
    # tracker.update_progress("characters", count=3)
    # tracker.generate_report()


if __name__ == "__main__":
    main()
