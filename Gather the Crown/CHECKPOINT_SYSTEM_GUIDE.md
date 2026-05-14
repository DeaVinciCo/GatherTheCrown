# 💾 Checkpoint & Preparation System Guide

## 🎯 Overview

Your game now has a comprehensive checkpoint system that auto-saves at key moments so players never lose progress!

## ✅ What's Been Added

### New Systems
1. **CheckpointSystem** - Auto-saves at 14 different trigger points
2. **PlayerNeedsSystem** - Hunger, thirst, energy, health tracking
3. **TimeSystem** - Day/night cycle with warnings
4. **PreparationSystem** - Rest, eat, craft, care for creat before quests

### New Scripts Created
- `Systems/CheckpointSystem.cs`
- `Systems/PlayerNeedsSystem.cs`
- `Systems/TimeSystem.cs`
- `Systems/PreparationSystem.cs`

## 🔄 Auto-Checkpoint Triggers

The game automatically saves at these moments:

1. **BeforeQuest** - Right before starting any quest
2. **BeforeCutscene** - Before cutscenes play
3. **QuestComplete** - After completing a quest
4. **AreaDiscovered** - When entering new areas
5. **BeforeBoss** - Before boss fights
6. **AfterBoss** - After defeating bosses
7. **KingdomCleared** - After clearing kingdom vaults
8. **LevelUp** - When player levels up
9. **Evolution** - When creat evolves
10. **RestPoint** - At camps, inns, home base
11. **ShopVisit** - After shopping
12. **CraftingComplete** - After crafting items
13. **ImportantChoice** - Before major story choices
14. **Manual** - Every 5 minutes (auto-save)

## 🎮 Controls

### Quest Controls
- **Q** - Start available quest
- **E** - Update quest objective
- **L** - Level up creat
- **B** - Increase bond with creat

### Preparation Controls
- **P** - Open Preparation Menu
- **1** - Eat bread (restore hunger)
- **2** - Drink water (restore thirst)
- **3** - Rest for 1 hour (restore energy)
- **4** - Feed creat (restore creat hunger)
- **5** - Pet creat (increase happiness & bond)

### Save/Load Controls
- **F5** - Quick Save (manual checkpoint)
- **F9** - Quick Load (load last checkpoint)

### Info Controls
- **Tab** - Show full status (player, creat, inventory, time)
- **T** - Show current time
- **N** - Rest until morning (skip to 8 AM)

## 📊 Player Needs System

### Player Stats (Deplete Over Time)
- **Health** - 100% (damaged in combat, low hunger/thirst)
- **Energy** - 100% (depletes 2%/min, restored by rest)
- **Hunger** - 100% (depletes 1.5%/min, restored by food)
- **Thirst** - 100% (depletes 2.5%/min, restored by drinks)

### Creat Stats (Deplete Over Time)
- **Health** - 100% (damaged in combat, low hunger)
- **Energy** - 100% (depletes 1.5%/min, restored by rest)
- **Hunger** - 100% (depletes 1%/min, restored by feeding)
- **Happiness** - 100% (increases with care, decreases if neglected)

### Warning Thresholds
- **Low** - 25% (yellow warning)
- **Critical** - 15% (red warning, blocks quest start)

### Quest Start Requirements
You CANNOT start a quest if:
- Player energy < 20%
- Player hunger < 20%
- Creat energy < 20%

The game will warn you to prepare first!

## 🌙 Day/Night Cycle

### Time System
- **1 real second = 1 game minute** (adjustable)
- **Day starts**: 6:00 AM
- **Dusk starts**: 6:00 PM
- **Night starts**: 8:00 PM
- **Dawn starts**: 5:00 AM

### Time of Day Effects
- **Morning** (6 AM - 12 PM) - Bright, full energy
- **Afternoon** (12 PM - 6 PM) - Bright, normal
- **Dusk** (6 PM - 8 PM) - Orange lighting, warning to rest
- **Night** (8 PM - 5 AM) - Dark, low visibility, rest recommended

### Night Warnings
When dusk arrives (6 PM), the game checks:
- If player energy < 50% → Suggests rest
- If creat energy < 50% → Suggests rest
- Warns: "Night is approaching! Consider finding shelter."

## 🏕️ Preparation Phase

### When to Prepare
- Before starting quests
- After completing quests
- When stats are low
- Before nightfall
- At camps, inns, home base

### Preparation Actions

#### Eating & Drinking
- **Bread** - Restores 20% hunger
- **Cooked Meat** - Restores 40% hunger
- **Fruit** - Restores 15% hunger
- **Stew** - Restores 50% hunger
- **Water** - Restores 30% thirst

#### Potions
- **Health Potion** - Restores 50% health
- **Energy Potion** - Restores 50% energy
- **Full Restore** - Restores 100% health & energy

#### Resting
- **Rest 1 hour** - Restores 20% energy
- **Rest 5 hours** - Restores 100% energy (full)
- **Rest until morning** - Skips to 8 AM, full restore

#### Creat Care
- **Feed Creat** - Restores 40% hunger, +2 bond
- **Pet Creat** - +3% happiness, +1 bond
- **Play with Creat** - +2% happiness/min, +5 bond

#### Crafting
- **Health Potion** - 3 herbs + 50g
- **Energy Potion** - 2 herbs + 1 honey + 50g
- **Basic Sword** - 5 iron ore + 2 wood + 200g

## 💡 Best Practices

### Before Starting a Quest
1. Press **Tab** to check status
2. If energy < 50%, press **3** to rest
3. If hunger < 50%, press **1** to eat
4. If creat needs care, press **4** and **5**
5. Press **F5** to manual save
6. Press **Q** to start quest

### During Quests
- Game auto-saves before quest starts
- Game auto-saves after quest completes
- Focus on objectives
- Don't worry about losing progress!

### After Quests
- Game auto-saves completion
- Check rewards and loot
- Prepare for next quest
- Rest if needed

### At Night
- Press **N** to rest until morning
- Restores all stats
- Advances to next day
- Auto-saves after rest

## 🎯 Quest Flow with Checkpoints

```
1. Player at camp
   ↓
2. Press P - Enter Preparation
   ↓
3. Eat, drink, rest, care for creat
   ↓
4. Press Tab - Check all stats are good
   ↓
5. Press Q - Start quest
   ↓ [AUTO-CHECKPOINT: BeforeQuest]
6. Complete quest objectives
   ↓
7. Quest completes
   ↓ [AUTO-CHECKPOINT: QuestComplete]
8. Receive rewards
   ↓
9. Return to camp/rest point
   ↓ [AUTO-CHECKPOINT: RestPoint]
10. Repeat!
```

## 📁 Save File Location

Checkpoints are saved to:
```
Windows: C:/Users/[YourName]/AppData/LocalLow/DefaultCompany/Gather the Crown/
Mac: ~/Library/Application Support/DefaultCompany/Gather the Crown/
```

Each checkpoint is saved as: `checkpoint_[ID].json`

## 🔧 Customization

### In CheckpointSystem
- `autoSaveInterval` - How often auto-save happens (default: 300s = 5 min)
- `maxCheckpoints` - Max checkpoints to keep (default: 10)

### In PlayerNeedsSystem
- `energyDepletionRate` - How fast energy depletes (default: 2%/min)
- `hungerDepletionRate` - How fast hunger depletes (default: 1.5%/min)
- `lowEnergyThreshold` - When to warn (default: 25%)

### In TimeSystem
- `timeScale` - Game time speed (default: 60 = 1 real sec = 1 game min)
- `dayStartTime` - When day starts (default: 360 = 6 AM)
- `nightStartTime` - When night starts (default: 1200 = 8 PM)

## 🎮 Example Play Session

```
[8:00 AM, Day 1]
Player: "Let's start!"
Press Tab → All stats at 100%
Press Q → Start "The Egg" quest
[AUTO-SAVE: BeforeQuest]

[9:30 AM]
Quest objective complete!
[AUTO-SAVE: QuestComplete]
Rewards: 500 XP, 100g

[10:00 AM]
Energy: 70%, Hunger: 80%
Press 1 → Eat bread
Press 3 → Rest 1 hour

[11:00 AM]
Energy: 90%, Hunger: 100%
Press Q → Start "The Hatching" quest
[AUTO-SAVE: BeforeQuest]

[6:00 PM - Dusk]
Warning: "Night is approaching!"
Energy: 40%, Creat Energy: 35%
Press N → Rest until morning
[AUTO-SAVE: RestPoint]

[8:00 AM, Day 2]
Fully restored!
Ready for next quest!
```

## ✨ Benefits

1. **Never lose progress** - Auto-saves at 14 key moments
2. **Realistic survival** - Manage hunger, energy, rest
3. **Creat bonding** - Care for your creat regularly
4. **Time management** - Plan around day/night cycle
5. **Strategic preparation** - Get ready before challenges
6. **Peace of mind** - F5 to save anytime

---

**Your players will never rage-quit from losing progress again!** 💾✨
