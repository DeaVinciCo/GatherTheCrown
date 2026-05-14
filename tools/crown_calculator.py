#!/usr/bin/env python3
"""
Crown Calculator Tool
Calculates crown stats, requirements, and progression
"""

from dataclasses import dataclass
from typing import List, Dict
from enum import Enum

class Metal(Enum):
    """Crown base metals"""
    FLINTSTEEL = ("Flintsteel", 1, 100)
    BRONZE = ("Bronze", 2, 250)
    SILVER = ("Silver", 3, 500)
    GOLD = ("Gold", 4, 1000)
    PLATINUM = ("Platinum", 5, 2000)
    RHODIUM = ("Rhodium", 6, 3500)
    OSMIUM = ("Osmium", 7, 5000)
    BIXBITE = ("Bixbite Core", 8, 10000)
    SHADOWGLASS = ("Shadowglass", 9, 15000)
    STARFORGED = ("Starforged", 10, 25000)
    
    def __init__(self, display_name: str, tier: int, base_value: int):
        self.display_name = display_name
        self.tier = tier
        self.base_value = base_value


class Gem(Enum):
    """Crown gems"""
    QUARTZ = ("Quartz", "Common", 350, "Universal")
    TOPAZ = ("Topaz", "Uncommon", 500, "Fire")
    SAPPHIRE = ("Sapphire", "Rare", 1000, "Water/Ice")
    SPINEL = ("Spinel", "Rare", 1000, "Fire/Earth")
    ALEXANDRITE = ("Alexandrite", "Ultra-Rare", 3000, "Light/Shadow")
    JEREMEJEVITE = ("Jeremejevite", "Ultra-Rare", 5000, "Lightning")
    PAINITE = ("Painite", "Ultra-Rare", 7000, "Universal")
    BIXBITE = ("Bixbite", "Divine", 15000, "Mythic")
    
    def __init__(self, display_name: str, rarity: str, value: int, element: str):
        self.display_name = display_name
        self.rarity = rarity
        self.value = value
        self.element = element


@dataclass
class CrownStats:
    """Crown statistics"""
    name: str
    metal: Metal
    gems: List[Gem]
    attack_bonus: int
    defense_bonus: int
    speed_bonus: int
    crit_bonus: float
    durability: int  # Number of battles
    total_value: int
    
    def __str__(self):
        gem_names = ", ".join([g.display_name for g in self.gems])
        return f"""
╔══════════════════════════════════════════════════════════╗
║  {self.name:^54}  ║
╠══════════════════════════════════════════════════════════╣
║  Metal: {self.metal.display_name:<46} ║
║  Gems: {gem_names:<47} ║
╠══════════════════════════════════════════════════════════╣
║  STATS                                                   ║
║  • Attack Bonus:    +{self.attack_bonus:<3}                              ║
║  • Defense Bonus:   +{self.defense_bonus:<3}                              ║
║  • Speed Bonus:     +{self.speed_bonus:<3}                              ║
║  • Crit Bonus:      +{self.crit_bonus:.1f}%                             ║
║  • Durability:      {self.durability} battles                         ║
╠══════════════════════════════════════════════════════════╣
║  Total Value: {self.total_value:,} GC                              ║
╚══════════════════════════════════════════════════════════╝
"""


class CrownCalculator:
    """Calculate crown statistics and requirements"""
    
    @staticmethod
    def calculate_stats(name: str, metal: Metal, gems: List[Gem]) -> CrownStats:
        """Calculate crown stats based on metal and gems"""
        
        # Base stats from metal tier
        attack_bonus = metal.tier * 10
        defense_bonus = metal.tier * 8
        speed_bonus = metal.tier * 5
        crit_bonus = metal.tier * 2.5
        durability = 10 + (metal.tier * 5)
        
        # Gem bonuses
        for gem in gems:
            if gem.rarity == "Common":
                attack_bonus += 5
                defense_bonus += 5
            elif gem.rarity == "Uncommon":
                attack_bonus += 10
                defense_bonus += 8
            elif gem.rarity == "Rare":
                attack_bonus += 15
                defense_bonus += 12
                crit_bonus += 5
            elif gem.rarity == "Ultra-Rare":
                attack_bonus += 25
                defense_bonus += 20
                crit_bonus += 10
                speed_bonus += 10
            elif gem.rarity == "Divine":
                attack_bonus += 50
                defense_bonus += 40
                crit_bonus += 20
                speed_bonus += 20
                durability += 20
        
        # Calculate total value
        total_value = metal.base_value + sum(g.value for g in gems)
        
        return CrownStats(
            name=name,
            metal=metal,
            gems=gems,
            attack_bonus=attack_bonus,
            defense_bonus=defense_bonus,
            speed_bonus=speed_bonus,
            crit_bonus=crit_bonus,
            durability=durability,
            total_value=total_value
        )
    
    @staticmethod
    def calculate_completion_rewards(crown: CrownStats) -> Dict:
        """Calculate rewards for completing a crown"""
        
        # Base rewards scale with metal tier
        tier = crown.metal.tier
        
        gold_reward = 5000 * tier
        gem_count = 5 + (tier * 2)
        shard_count = 25 + (tier * 10)
        
        # Bonus for ultra-rare gems
        for gem in crown.gems:
            if gem.rarity in ["Ultra-Rare", "Divine"]:
                gold_reward += 5000
                gem_count += 5
        
        # Bixbite only for high-tier crowns
        bixbite_count = 0
        if tier >= 7:
            bixbite_count = tier - 6
        
        return {
            "gold": gold_reward,
            "gems": gem_count,
            "shards": shard_count,
            "bixbite": bixbite_count,
            "stat_boost": f"+{tier * 5}% mode-specific stats"
        }
    
    @staticmethod
    def list_all_crown_types():
        """List all crown types by game mode"""
        
        crowns = {
            "Story Mode - Sovereign's Diadem": (
                Metal.STARFORGED,
                [Gem.PAINITE, Gem.ALEXANDRITE, Gem.JEREMEJEVITE]
            ),
            "Melee Mode - Duelist's Crest": (
                Metal.GOLD,
                [Gem.SPINEL, Gem.TOPAZ, Gem.SAPPHIRE]
            ),
            "Racing Mode - Racer's Torque": (
                Metal.OSMIUM,
                [Gem.QUARTZ, Gem.SAPPHIRE, Gem.JEREMEJEVITE]
            ),
            "Mini-Games - Tactician's Band": (
                Metal.SILVER,
                [Gem.QUARTZ, Gem.TOPAZ]
            ),
            "PvE Dungeon - Warden's Circlet": (
                Metal.BIXBITE,
                [Gem.ALEXANDRITE, Gem.SPINEL, Gem.PAINITE]
            ),
            "PvP Competitive - Conqueror's Halo": (
                Metal.STARFORGED,
                [Gem.PAINITE, Gem.JEREMEJEVITE, Gem.ALEXANDRITE]
            ),
            "Side Quests - Seeker's Laurel": (
                Metal.SILVER,
                [Gem.QUARTZ, Gem.SPINEL, Gem.TOPAZ]
            )
        }
        
        print("\n" + "="*60)
        print("CROWN TYPES BY GAME MODE")
        print("="*60 + "\n")
        
        for crown_name, (metal, gems) in crowns.items():
            stats = CrownCalculator.calculate_stats(crown_name, metal, gems)
            print(stats)
            
            rewards = CrownCalculator.calculate_completion_rewards(stats)
            print("COMPLETION REWARDS:")
            print(f"  • Gold: {rewards['gold']:,} GC")
            print(f"  • Gems: {rewards['gems']}")
            print(f"  • Shards: {rewards['shards']}")
            if rewards['bixbite'] > 0:
                print(f"  • Bixbite: {rewards['bixbite']}")
            print(f"  • Stat Boost: {rewards['stat_boost']}")
            print("\n" + "-"*60 + "\n")


def main():
    """Run crown calculator"""
    print("👑 GATHER THE CROWN: Crown Calculator")
    
    # List all crown types
    CrownCalculator.list_all_crown_types()
    
    # Example: Calculate custom crown
    print("\n" + "="*60)
    print("CUSTOM CROWN EXAMPLE")
    print("="*60 + "\n")
    
    custom_crown = CrownCalculator.calculate_stats(
        name="Custom Test Crown",
        metal=Metal.PLATINUM,
        gems=[Gem.ALEXANDRITE, Gem.SAPPHIRE]
    )
    
    print(custom_crown)
    
    rewards = CrownCalculator.calculate_completion_rewards(custom_crown)
    print("COMPLETION REWARDS:")
    for key, value in rewards.items():
        print(f"  • {key.title()}: {value}")


if __name__ == "__main__":
    main()
