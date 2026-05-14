# 📜 Quest System - Gather the Crown: Creats & Foes

**System:** Dynamic quest generation and tracking  
**Purpose:** Provide engaging objectives and rewards  
**Created:** February 25, 2026

---

## 🎯 QUEST TYPES

### Main Story Quests
- **Purpose:** Progress the main narrative
- **Structure:** Linear, chapter-based
- **Rewards:** Major XP, unique items, story progression
- **Tracking:** Always visible, cannot abandon
- **Example:** "Restore the Fire Kingdom"

### Side Quests
- **Purpose:** Explore lore, earn rewards
- **Structure:** Optional, can be done anytime
- **Rewards:** Moderate XP, gold, items
- **Tracking:** Up to 20 active at once
- **Example:** "Help the Blacksmith Find Materials"

### Daily Quests
- **Purpose:** Encourage daily play
- **Structure:** Reset every 24 hours
- **Rewards:** Gold, XP, Crown Shards
- **Tracking:** 4 daily quests available
- **Example:** "Win 3 Races"

### Weekly Quests
- **Purpose:** Long-term goals
- **Structure:** Reset every 7 days
- **Rewards:** Large gold, rare items
- **Tracking:** 4 weekly quests available
- **Example:** "Defeat 10 Bosses"

### Faction Quests
- **Purpose:** Build faction reputation
- **Structure:** Repeatable, faction-specific
- **Rewards:** Reputation, faction currency, exclusive items
- **Tracking:** Unlimited active
- **Example:** "Purify 5 Corrupted Zones (Purifiers)"

### World Events
- **Purpose:** Limited-time community events
- **Structure:** Server-wide, time-limited
- **Rewards:** Exclusive cosmetics, titles
- **Tracking:** Event tracker (separate UI)
- **Example:** "Defend the Crown Convergence"

---

## 📊 QUEST STRUCTURE

### Quest Template
```
QUEST: The Lost Crown Fragment
├─ Type: Main Story
├─ Level: 25
├─ Difficulty: 🟣 Epic
├─ Giver: Elder Sage (Luminaris)
├─ Location: Crystal Temple
├─ Prerequisites: Complete "Restore Luminaris"
├─ Objectives:
│  ├─ 1. Explore the Forgotten Vault (0/1)
│  ├─ 2. Defeat the Vault Guardian (0/1)
│  └─ 3. Retrieve the Crown Fragment (0/1)
├─ Rewards:
│  ├─ XP: 5,000
│  ├─ Gold: 1,500g
│  ├─ Item: Crown Fragment (quest item)
│  └─ Choice: Pick 1 of 3 epic items
├─ Time Limit: None
├─ Shareable: No (story quest)
└─ Lore: "The Crown was shattered long ago..."
```

---

## 🎲 DYNAMIC QUEST GENERATION

### Quest Generator System
Based on the Codex implementation, quests are dynamically generated based on:

**Player Level:**
- Scales difficulty and rewards
- Higher level = more objectives
- Formula: `objectiveCount = min(4, max(2, ceil(playerLevel / 8)))`

**Area/Region:**
- Each area has unique quest profiles
- Different objective types per area
- Themed rewards

**Quest Difficulty Tiers:**
```
DIFFICULTY SCALING:
┌────────────────────────────────────────┐
│ Normal (Level 1-14)                    │
│ - 2-3 objectives                       │
│ - Base rewards                         │
│                                        │
│ Veteran (Level 15-34)                  │
│ - 3-4 objectives                       │
│ - 1.5x rewards                         │
│                                        │
│ Elite (Level 35+)                      │
│ - 4+ objectives                        │
│ - 2x rewards                           │
└────────────────────────────────────────┘
```

### Area Quest Profiles

**Forest (Sylvara):**
```
Title: "Verdant Patrol"
Objective Types: Eliminate, Collect, Explore
Pace: 1.0x (standard)
Reward Multiplier: 1.0x
Example: "Defeat 15 hostiles in Sylvara"
```

**Ruins (Ancient Sites):**
```
Title: "Relic Recovery"
Objective Types: Explore, Collect, Eliminate
Pace: 1.15x (slightly harder)
Reward Multiplier: 1.1x
Example: "Survey 8 landmarks in Ancient Ruins"
```

**Desert (Zerath Dunes):**
```
Title: "Dune Endurance Trial"
Objective Types: Survive, Collect, Eliminate
Pace: 1.2x (harder)
Reward Multiplier: 1.2x
Example: "Survive 4 waves in Zerath Dunes"
```

**Caverns (Underground):**
```
Title: "Cavern Sweep"
Objective Types: Eliminate, Explore, Collect
Pace: 1.1x
Reward Multiplier: 1.05x
Example: "Collect 12 resources from Caverns"
```

---

## 🎯 OBJECTIVE TYPES

### Eliminate Objectives
- **Task:** Defeat X enemies
- **Target Calculation:** `baseTarget + 2` (scales with level)
- **Examples:**
  - "Defeat 15 hostiles in Sylvara"
  - "Kill 20 corrupted creatures"
  - "Eliminate 10 shadow beasts"

### Collect Objectives
- **Task:** Gather X items/resources
- **Target Calculation:** `max(3, round(baseTarget * 0.75))`
- **Examples:**
  - "Collect 12 resources from Zerath Dunes"
  - "Gather 8 Crown Fragments"
  - "Find 15 ancient relics"

### Explore Objectives
- **Task:** Discover X locations
- **Target Calculation:** `max(2, round(baseTarget * 0.5))`
- **Examples:**
  - "Survey 5 landmarks in Frostvale"
  - "Discover 3 hidden caves"
  - "Explore 8 ruins"

### Survive Objectives
- **Task:** Survive X waves/time
- **Target Calculation:** `max(1, round(baseTarget * 0.35))`
- **Examples:**
  - "Survive 3 waves in the Arena"
  - "Endure 5 minutes in the Void"
  - "Withstand 2 boss phases"

### Escort Objectives
- **Task:** Protect NPC to destination
- **Failure:** NPC dies
- **Examples:**
  - "Escort the Merchant to Luminaris"
  - "Protect the Elder during ritual"

### Delivery Objectives
- **Task:** Bring item to NPC
- **Examples:**
  - "Deliver supplies to the Outpost"
  - "Return the stolen artifact"

---

## 💰 REWARD CALCULATION

### XP Rewards
```
Formula:
baseXP = 75 + (playerLevel * 18)
finalXP = baseXP * rewardMultiplier * (1 + objectiveCount * 0.2)

Example (Level 20, Forest, 3 objectives):
baseXP = 75 + (20 * 18) = 435
finalXP = 435 * 1.0 * (1 + 3 * 0.2) = 696 XP
```

### Gold Rewards
```
Formula:
baseGold = 25 + (playerLevel * 7)
finalGold = baseGold * rewardMultiplier * (1 + objectiveCount * 0.2)

Example (Level 20, Forest, 3 objectives):
baseGold = 25 + (20 * 7) = 165
finalGold = 165 * 1.0 * (1 + 3 * 0.2) = 264 gold
```

### Bonus Rewards
- **Speed Bonus:** Complete 50% faster = +25% rewards
- **Perfect Bonus:** No deaths = +50% rewards
- **Style Bonus:** High combat rating = +20% rewards
- **Faction Bonus:** Faction-aligned quest = +10% reputation

---

## 📋 QUEST TRACKING

### Quest Log UI
```
┌─────────────────────────────────────────────────┐
│  QUEST LOG                          [X] Close   │
├─────────────────────────────────────────────────┤
│  [Main] [Side] [Daily] [Weekly] [Faction]      │
├──────────────────────┬──────────────────────────┤
│  ACTIVE QUESTS (5)   │  QUEST DETAILS           │
│                      │                          │
│  📜 The Lost Fragment│  The Lost Crown Fragment │
│     Level 25 🟣      │  Level: 25 (Epic)        │
│                      │                          │
│  📜 Help the Smith   │  Objectives:             │
│     Level 15 🔵      │  ☑ Explore Vault (1/1)   │
│                      │  ☐ Defeat Guardian (0/1) │
│  📜 Daily: Win Races │  ☐ Get Fragment (0/1)    │
│     ●●●○             │                          │
│                      │  Rewards:                │
│  [Track] [Abandon]   │  • 5,000 XP              │
│                      │  • 1,500 Gold            │
│                      │  • Crown Fragment        │
│                      │  • Choice of Epic Item   │
│                      │                          │
│                      │  [Track] [Abandon]       │
└──────────────────────┴──────────────────────────┘
```

### On-Screen Tracker
```
┌─────────────────────────┐
│ 📜 The Lost Fragment    │
│ ☑ Explore Vault         │
│ ☐ Defeat Guardian (0/1) │
│ ☐ Get Fragment (0/1)    │
└─────────────────────────┘
```

### Minimap Markers
- 🎯 Quest Objective
- ❗ Quest Giver (new quest)
- ❓ Quest Giver (in progress)
- ✅ Quest Turn-in

---

## 🎁 QUEST REWARDS

### Reward Types

**Guaranteed Rewards:**
- XP (always)
- Gold (always)
- Reputation (faction quests)

**Item Rewards:**
- Fixed item (specific quest reward)
- Choice (pick 1 of 2-3 items)
- Random (loot table roll)

**Special Rewards:**
- Titles
- Cosmetics
- Mounts/Pets
- Abilities/Attacks
- Recipes
- Access to new areas

### Reward Scaling
```
QUEST DIFFICULTY → REWARD QUALITY
┌────────────────────────────────────────┐
│ Normal:    Common-Uncommon items       │
│ Veteran:   Uncommon-Rare items         │
│ Elite:     Rare-Epic items             │
│ Legendary: Epic-Legendary items        │
│ Mythic:    Legendary-Mythic items      │
└────────────────────────────────────────┘
```

---

## 🔄 REPEATABLE QUESTS

### Daily Quest Examples
```
DAILY QUEST: Win 3 Races
├─ Objective: Win any 3 races
├─ Progress: 0/3
├─ Rewards:
│  ├─ 500 Gold
│  ├─ 1,000 XP
│  └─ 1 Crown Shard (if all 4 dailies done)
└─ Reset: 24 hours
```

```
DAILY QUEST: Complete 5 Quests
├─ Objective: Complete any 5 quests
├─ Progress: 0/5
├─ Rewards:
│  ├─ 750 Gold
│  └─ 1,500 XP
└─ Reset: 24 hours
```

### Weekly Quest Examples
```
WEEKLY QUEST: Win 25 Races
├─ Objective: Win 25 races
├─ Progress: 0/25
├─ Rewards:
│  ├─ 5,000 Gold
│  ├─ 10,000 XP
│  └─ 5 Crown Shards (if all 4 weeklies done)
└─ Reset: 7 days
```

---

## 🏆 QUEST CHAINS

### Multi-Part Quests
```
QUEST CHAIN: Restore the Fire Kingdom
├─ Part 1: "Investigate the Corruption"
│  └─ Rewards: 1,000 XP, 500g
├─ Part 2: "Cleanse the Temple"
│  └─ Rewards: 2,000 XP, 1,000g
├─ Part 3: "Defeat the Fire Lord"
│  └─ Rewards: 5,000 XP, 2,500g, Legendary Item
└─ Chain Completion Bonus:
   ├─ Title: "Savior of Pyrrathia"
   ├─ Mount: Fire Phoenix
   └─ Achievement: "Kingdom Restored"
```

---

## 🎮 UNITY IMPLEMENTATION

### Scripts Needed
```csharp
// Core quest system
QuestManager.cs
QuestData.cs
QuestObjective.cs
QuestGenerator.cs

// UI components
QuestLogUI.cs
QuestTrackerUI.cs
QuestNotification.cs

// Quest givers
QuestGiver.cs
QuestTurnIn.cs

// Objective tracking
ObjectiveTracker.cs
KillTracker.cs
CollectTracker.cs
ExploreTracker.cs
```

### Key Features
1. Dynamic quest generation based on player level
2. Area-specific quest profiles
3. Objective tracking with progress bars
4. Quest marker system (minimap + world)
5. Quest notification system
6. Daily/weekly reset timers
7. Reward calculation and distribution
8. Quest chain progression

---

**This quest system provides endless content through dynamic generation while maintaining meaningful story progression and rewarding player engagement.**

📜🎯👑
