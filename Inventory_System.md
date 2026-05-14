# 🎒 Inventory System - Gather the Crown: Creats & Foes

**System:** Complete inventory management for items, equipment, and resources  
**Purpose:** Store, equip, and manage player items  
**Created:** February 25, 2026

---

## 📦 INVENTORY STRUCTURE

### Inventory Slots
- **Total Capacity:** 100 slots (expandable to 200)
- **Categories:**
  - Weapons (20 slots)
  - Armor (15 slots)
  - Consumables (30 slots)
  - Materials (25 slots)
  - Quest Items (10 slots, auto-expand)
  - Miscellaneous (unlimited, but weight-limited)

### Weight System
- **Max Weight:** 500 units (base)
- **Weight Bonuses:**
  - Backpack upgrades: +100 units each
  - Strength stat: +5 units per point
  - Mount saddle bags: +200 units
- **Over-encumbered:** -50% movement speed if exceeded

---

## 🗡️ EQUIPMENT SYSTEM

### Equipment Slots
```
CHARACTER EQUIPMENT:
┌────────────────────────────────────────┐
│ Head:     [Helmet/Crown]               │
│ Neck:     [Necklace/Amulet]            │
│ Chest:    [Armor/Robe]                 │
│ Back:     [Cloak/Cape]                 │
│ Hands:    [Gloves/Gauntlets]           │
│ Waist:    [Belt]                       │
│ Legs:     [Pants/Greaves]              │
│ Feet:     [Boots]                      │
│ Ring 1:   [Ring]                       │
│ Ring 2:   [Ring]                       │
│ Weapon 1: [Main Hand]                  │
│ Weapon 2: [Off Hand/Shield]            │
└────────────────────────────────────────┘

CREAT EQUIPMENT:
┌────────────────────────────────────────┐
│ Head:     [Helmet/Crown]               │
│ Body:     [Saddle/Armor]               │
│ Legs:     [Leg Armor]                  │
│ Tail:     [Tail Armor/Ribbon]          │
│ Collar:   [Collar/Necklace]            │
└────────────────────────────────────────┘
```

### Equip/Unequip Mechanics
- **Quick Equip:** Right-click item or drag to slot
- **Auto-Equip:** Option to auto-equip better items
- **Equip Sets:** Save and load equipment loadouts
- **Comparison:** Hover to compare with equipped item
- **Requirements:** Level, stats, faction restrictions

---

## 🎨 ITEM PROPERTIES

### Item Rarity
```
RARITY TIERS:
┌────────────────────────────────────────┐
│ ⚪ Common    - White   - Base stats    │
│ 🟢 Uncommon  - Green   - +10% stats    │
│ 🔵 Rare      - Blue    - +25% stats    │
│ 🟣 Epic      - Purple  - +50% stats    │
│ 🟡 Legendary - Gold    - +100% stats   │
│ 🔴 Mythic    - Red     - +200% stats   │
└────────────────────────────────────────┘
```

### Item Stats Template
```
ITEM: Flame Sword of the Purifier
├─ Type: Weapon (Sword)
├─ Rarity: 🟣 Epic
├─ Level Requirement: 35
├─ Damage: 45-60 (Physical)
├─ Element: Fire (+20 fire damage)
├─ Stats:
│  ├─ +15 Strength
│  ├─ +10 Fire Resistance
│  └─ +5% Critical Hit Chance
├─ Special Effect: "Purifying Flame"
│  └─ 15% chance to burn enemy (10 dmg/sec, 5s)
├─ Durability: 150/150
├─ Weight: 8 units
├─ Value: 2,500 gold
├─ Faction: Purifiers (bonus: +10% damage)
└─ Lore: "Forged in the sacred fires..."
```

---

## 🧪 CONSUMABLES

### Potions
**Health Potions:**
- Minor: +25 HP (50g)
- Standard: +50 HP (100g)
- Greater: +100 HP (250g)
- Superior: Full HP (500g)

**Stamina Potions:**
- Minor: +25 Stamina (40g)
- Standard: +50 Stamina (80g)
- Greater: +100 Stamina (200g)

**Buff Potions:**
- Strength Elixir: +20% damage (5 min) - 150g
- Speed Tonic: +30% speed (5 min) - 150g
- Defense Brew: +25% defense (5 min) - 150g
- Elemental Resistance: +50% element resist (10 min) - 200g

### Food
**Creat Food:**
- Emberfruit: Fire creats (+10 bond, +5 HP)
- Frostberry: Ice creats (+10 bond, +5 HP)
- Stormgrass: Air creats (+10 bond, +5 HP)
- Rootvine: Earth creats (+10 bond, +5 HP)

**Player Food:**
- Bread: +10 HP, -5 hunger
- Cooked Meat: +25 HP, -15 hunger
- Fruit: +5 HP, -10 hunger
- Feast: +50 HP, -50 hunger, +10% XP (1 hour)

---

## 🔨 CRAFTING MATERIALS

### Biblical Materials (from Biblical_Materials_and_Factions.md)
**Fibers:**
- Wool (Common) - 5 copper
- Linen (Common) - 8 copper
- Silk (Rare) - 50 copper
- Goat Hair (Uncommon) - 4 copper
- Cotton (Common) - 3 copper

**Metals:**
- Copper (Common) - 20 copper/lb
- Bronze (Uncommon) - 30 copper/lb
- Iron (Uncommon) - 15 copper/lb
- Silver (Rare) - 100 copper/oz
- Gold (Legendary) - 10,000 copper/oz

**Gems (Breastplate Stones):**
- Sardius/Ruby (Epic) - 2,000g
- Topaz (Epic) - 1,800g
- Emerald (Epic) - 2,200g
- Sapphire (Epic) - 2,500g
- Diamond (Legendary) - 5,000g
- Amethyst (Epic) - 1,900g
- Onyx (Rare) - 1,200g
- Jasper (Rare) - 1,000g

**Dyes:**
- Blue (Tekhelet) - Epic - 200 copper
- Purple (Argaman) - Legendary - 500 copper
- Scarlet (Shani) - Rare - 100 copper
- White - Common - 10 copper
- Gold - Legendary - 300 copper
- Black - Uncommon - 50 copper

---

## 🛠️ CRAFTING SYSTEM

### Crafting Stations
- **Forge:** Weapons, armor, tools
- **Loom:** Clothing, fabric items
- **Alchemy Table:** Potions, elixirs
- **Enchanting Altar:** Enchantments, blessings
- **Cooking Fire:** Food, buffs

### Crafting Mechanics
**Recipe Requirements:**
```
RECIPE: Iron Sword
├─ Materials:
│  ├─ Iron Ingot x3
│  ├─ Leather Grip x1
│  └─ Wood Handle x1
├─ Crafting Station: Forge
├─ Skill Level: Blacksmithing 15
├─ Time: 30 seconds
├─ Success Chance: 85%
└─ Output: Iron Sword (30-40 damage)
```

**Crafting Quality:**
- Normal: Base stats
- Fine: +10% stats (15% chance)
- Masterwork: +25% stats (5% chance)
- Legendary: +50% stats + special effect (1% chance)

**Durability System:**
- All crafted items have durability
- Durability decreases with use
- Repair at blacksmith or with repair kits
- Broken items: -50% stats until repaired

---

## 💰 ECONOMY & TRADING

### Currency Types
**Primary Currency:**
- Copper Coins (base)
- Silver Shekels (1 silver = 100 copper)
- Gold Talents (1 gold = 100 silver = 10,000 copper)

**Special Currency:**
- Crown Shards (premium, earned or purchased)
- Faction Tokens (earned through faction quests)
- Kingdom Seals (earned by restoring kingdoms)

### Vendor System
**Vendor Types:**
- General Merchant: Basic items, food, potions
- Blacksmith: Weapons, armor, repairs
- Alchemist: Potions, ingredients
- Stable Master: Creat food, saddles
- Faction Vendor: Faction-exclusive items

**Vendor Prices:**
- Base price × faction reputation modifier
- Rank 1: 95% price (5% discount)
- Rank 2: 90% price (10% discount)
- Rank 3: 85% price (15% discount)
- Rank 4: 80% price (20% discount)
- Rank 5: 75% price (25% discount)

### Player Trading
- **Direct Trade:** Face-to-face with other players
- **Auction House:** List items for sale (5% fee)
- **Mail System:** Send items/gold to friends
- **Guild Bank:** Shared storage for guild members

---

## 📊 INVENTORY UI

### Layout
```
┌─────────────────────────────────────────────────┐
│  INVENTORY                          [X] Close   │
├─────────────────────────────────────────────────┤
│  [All] [Weapons] [Armor] [Consumables] [Mats]  │
├──────────────────────┬──────────────────────────┤
│  ITEMS (50/100)      │  CHARACTER               │
│  ┌──┬──┬──┬──┬──┐   │   ┌────────┐            │
│  │🗡│🛡│🧪│🍖│💎│   │   │  HEAD  │            │
│  ├──┼──┼──┼──┼──┤   │   ├────────┤            │
│  │⚔│🏹│🔨│🍞│🪙│   │   │ CHEST  │            │
│  ├──┼──┼──┼──┼──┤   │   ├────────┤            │
│  │📜│🧵│🪵│⛏│🔧│   │   │  LEGS  │            │
│  └──┴──┴──┴──┴──┘   │   └────────┘            │
│                      │                          │
│  Weight: 245/500     │  Stats:                  │
│  Gold: 1,250g        │  Damage: 45-60          │
│                      │  Defense: 35            │
│  [Sort] [Search]     │  Speed: 180 km/h        │
└──────────────────────┴──────────────────────────┘
```

### Sorting Options
- By Name (A-Z)
- By Rarity (Mythic → Common)
- By Type (Weapons, Armor, etc.)
- By Level Requirement
- By Value (Highest → Lowest)
- By Weight (Lightest → Heaviest)

### Filters
- Show Equipped Only
- Show Unequipped Only
- Show Tradeable Only
- Show Quest Items Only
- Hide Junk Items

---

## 🎁 LOOT SYSTEM

### Loot Sources
**Enemy Drops:**
- Common enemies: 1-3 items (mostly common)
- Elite enemies: 3-5 items (uncommon-rare)
- Bosses: 5-10 items (rare-legendary)
- World Bosses: 10-15 items (legendary-mythic)

**Chests:**
- Wooden Chest: 50-100g, 2-4 common items
- Iron Chest: 100-250g, 3-5 uncommon items
- Gold Chest: 500-1,000g, 4-6 rare items
- Crown Chest: 2,000-5,000g, 5-8 epic-legendary items

**Quest Rewards:**
- Always guaranteed
- Scales with quest difficulty
- Choice of rewards (pick 1 of 3)

### Loot Tables
```
BOSS LOOT TABLE: Molten Crownling
├─ Guaranteed:
│  ├─ Gold: 1,000-2,100g
│  └─ Crown Fragment (quest item)
├─ Unique (100% drop 1):
│  ├─ Molten Crown Saddle (25%)
│  ├─ Crownling's Fang Spear (25%)
│  ├─ Volcanic Aura (25%)
│  └─ Evolution Stone: Fire (25%)
└─ Rare (25% each):
   ├─ Legendary Feed: Ember Nectar
   ├─ Attack Unlock: Meteor Call
   └─ Title: "Crownslayer"
```

---

## 🔒 ITEM BINDING

### Bind Types
**Bind on Pickup (BoP):**
- Cannot trade or sell
- Quest rewards, boss drops
- Marked with 🔒 icon

**Bind on Equip (BoE):**
- Can trade until equipped
- Once equipped, becomes BoP
- Most crafted items

**Unbound:**
- Can always trade/sell
- Materials, consumables
- Common items

---

## 🗑️ ITEM MANAGEMENT

### Selling Items
- Sell to vendors for 25% of value
- Bulk sell: "Sell All Junk" button
- Buyback: Last 10 sold items (1 hour)

### Salvaging Items
- Break down items into materials
- Get 50-75% of crafting materials back
- Chance for rare materials
- Salvage Kit required (100 uses, 50g)

### Destroying Items
- Permanently delete
- Confirmation required for rare+ items
- No refund or materials

---

## 📦 STORAGE SYSTEMS

### Bank Storage
- **Capacity:** 200 slots (expandable to 500)
- **Cost:** 100g per 50 slot expansion
- **Access:** Any major city
- **Shared:** Across all characters (account-wide)

### Guild Bank
- **Capacity:** 500 slots (guild-wide)
- **Tabs:** 5 tabs (permissions per tab)
- **Deposits:** All members can deposit
- **Withdrawals:** Based on rank permissions
- **Log:** Tracks all deposits/withdrawals

### Mount Storage
- **Capacity:** 50 slots (saddle bags)
- **Access:** Anywhere (if mount summoned)
- **Weight:** Doesn't count toward player weight
- **Upgrade:** Better saddles = more slots

---

## 🎮 UNITY IMPLEMENTATION

### Scripts Needed
```csharp
// Core inventory system
InventoryManager.cs
ItemData.cs
EquipmentSlot.cs
ItemTooltip.cs

// UI components
InventoryUI.cs
EquipmentUI.cs
ItemDragHandler.cs
ItemSlot.cs

// Crafting system
CraftingManager.cs
CraftingRecipe.cs
CraftingStation.cs

// Economy
VendorManager.cs
TradingSystem.cs
CurrencyManager.cs
```

### Key Features to Implement
1. Drag-and-drop item management
2. Equipment comparison tooltips
3. Auto-sort and filter options
4. Crafting interface with recipe book
5. Vendor buy/sell interface
6. Player-to-player trading window
7. Bank/storage access
8. Loot roll system (for multiplayer)

---

**This inventory system provides deep item management while remaining intuitive and accessible for all players.**

🎒💰👑

---

## Combat Itemization Matrix

This section defines what heroes and creats should use, sell, trade, craft, and loot in moment-to-moment play.

### Hero and Rider Weapons By Element

Fire:
1. Emberblade (sword)
2. Magma Spear
3. Cinder Gauntlets

Water:
1. Tide Trident
2. Reef Sabre
3. Flow Staff

Earth:
1. Granite Hammer
2. Root Halberd
3. Obsidian Shield Axe

Storm:
1. Volt Chakrams
2. Tempest Rapier
3. Thunder Pike

Light:
1. Dawnblade
2. Halo Mace
3. Solar Bow

Shadow:
1. Umbral Daggers
2. Dusk Scythe
3. Night Bow

Arcane:
1. Rune Staff
2. Star Glaive
3. Prism Wand

### Spells and Powers By Element (Hero)

Fire:
1. Flame Wall
2. Cinder Rain
3. Phoenix Rush

Water:
1. Healing Tide
2. Riptide Pull
3. Ice Mist

Earth:
1. Stone Skin
2. Quake Ring
3. Root Prison

Storm:
1. Chain Bolt
2. Wind Step
3. Tempest Cage

Light:
1. Purify Burst
2. Beacon Ward
3. Sun Lance

Shadow:
1. Fear Shroud
2. Veil Step
3. Soul Rend

Arcane:
1. Mana Rift
2. Prism Nova
3. Time Slip

### Potions Used and Needed

Core combat potions:
1. Healing Potion
2. Stamina Potion
3. Mana Potion
4. Antidote Potion

Elemental combat potions:
1. Fireguard Elixir
2. Tideskin Tonic
3. Earthroot Brew
4. Stormcharge Vial
5. Lightward Serum
6. Shadowveil Draught
7. Arcanefocus Phial

Creat care potions:
1. Bond Tonic
2. Hunger Relief Syrup
3. Stress Calm Drops
4. Recovery Salve

### Creat Armor and Rider Gear Items

Creat armor track:
1. Headguard
2. Chest Barding
3. Leg Plates
4. Tail Guard
5. Collar Focus

Rider gear track:
1. Element Saddle
2. Rein Harness
3. Saddle Bags
4. Trail Bedroll Kit
5. Crest Banner
6. Shock Absorber Stirrups

Hero armor track:
1. Helm
2. Chest
3. Arms
4. Legs
5. Boots
6. Cloak

### Crafting, Loot, Sell, and Trade Loops

Gathered crafting materials (field):
1. Fiber Bundle
2. Iron Ore
3. Ember Resin
4. Tide Pearl Dust
5. Root Sap
6. Storm Crystal Shard
7. Lumen Pollen
8. Night Veil Thread
9. Arcane Ink

Enemy drop materials:
1. Fang Fragment
2. Hide Scraps
3. Bone Splinter
4. Corrupted Core
5. Element Essence

Boss-only materials:
1. Crown Alloy Chunk
2. Mythic Scale
3. Ancient Sigil Plate

Vendor sell categories:
1. Common mats
2. Unused weapons
3. Duplicate armor
4. Extra consumables

Player trade priorities:
1. Rare element essences
2. Saddle and barding upgrades
3. High-rarity potions
4. Crafting catalysts

### Practical Economy Rules

1. Common materials should be sellable and tradable.
2. Core progression materials should be tradable but taxed in auction.
3. Boss soul materials should be bind-on-pickup or bind-on-equip depending on tier.
4. Creat evolution materials should stay scarce and region-specific.
5. Riding gear upgrades should use both race rewards and combat loot to keep both game loops relevant.
