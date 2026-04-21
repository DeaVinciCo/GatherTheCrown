# Advanced Inventory System

Complete reference for the tabbed, scaled inventory system.

---

## Overview

Smart inventory that doesn't rely on raw slot inflation to handle growth.

**Key Design Principles:**
- Player carries 100–200 slots (scales by level)
- Stack sizes do the heavy lifting (common items stack to 99–999)
- Home base storage is unlimited for bulk materials
- Tabs + categories = clarity, not scrolling hell
- Keys don't take slots (separate keyring UI)

---

## Inventory Structure

### Main Tabs (8 Categories)

| Tab | Purpose | Examples | Max Per Tab |
|-----|---------|----------|-------------|
| **GEAR** | Clothing/wearables | Helmets, tunics, cloaks, boots | ~20–30 items |
| **PROVISIONS** | Food & drink | Bread, meat, water, honey | ~50–100 items |
| **ARMORY** | Weapons & tools | Swords, axes, pickaxe | ~20–30 items |
| **ARCANA** | Magic items | Scrolls, potions, runes | ~25–40 items |
| **MATERIALS** | Crafting & restoration | Wood, glass shards, hinges | ~100+ items |
| **TRADE** | Sellables & loot | Gems, gold, artifacts | ~30–50 items |
| **CREAT** | Companion items | Eggs, food, care items | ~20–30 items |
| **QUEST** | Story & keys | Quest items, locked items | ~15–25 items |

### Subcategories (Detailed)

#### 1. GEAR (Clothing)

**Head:** Hoods, helms, circlets, crowns
**Upper:** Tunics, armor tops, shirts
**Lower:** Pants, greaves, leggings
**Hands:** Gloves, gauntlets, mitts
**Feet:** Boots, sandals, greaves
**Outerwear:** Cloaks, jackets, capes (your "jacket" category)
**Accessories:** Rings, charms, necklaces

Max stack: **1 per item** (equippable, not consumable)

#### 2. PROVISIONS (Food)

**Meals:** Cooked food, bread, prepared dishes (buffs)
- Stack: 20–30
- Use: Eat before battle, restore mid-battle

**Raw:** Meat, fish, vegetables (ingredients)
- Stack: 30–50
- Use: Cooking, crafting

**Fruits:** Berries, apples, orchard items
- Stack: 30–50
- Use: Quick energy

**Liquids:** Water, mead, potions, tonics
- Stack: 10–20
- Use: Drinking, buff effects

**Treats:** Sweets, special foods (rare, bond-boosting)
- Stack: 5–10
- Use: Creat bonding, special buffs

**Special:** Rare foods (event items, kingdom discoveries)
- Stack: 3–5
- Use: One-time effects, story moments

#### 3. ARMORY (Weapons)

**Blades:** Swords, daggers, cutlasses
- Stack: 1–2
- Use: Primary combat

**Polearms:** Spears, halberds, pikes
- Stack: 1
- Use: Combat (future)

**Blunt:** Hammers, maces, clubs
- Stack: 1–2
- Use: Combat alternatives

**Ranged:** Bows, crossbows
- Stack: 1
- Use: Future combat

**Tools:** Pickaxe, hatchet, crowbar
- Stack: 1–2
- Use: Exploration, gathering, dual-purpose (pickaxe = both tool and weapon)

**Special:** Boss weapons, elemental weapons, unique items
- Stack: 1
- Use: Rare, powerful

#### 4. ARCANA (Magic)

**Scrolls:** Castable spells, tomes
- Stack: 2–5
- Use: Cast spell once or multiple uses

**Runes:** Passive effects, enhancements, wards
- Stack: 5–10
- Use: Permanent or temporary effects

**Relics:** Rare magical items, artifacts
- Stack: 1
- Use: Special effects, collectibles

**Charms:** Buff items, equipment-like magic
- Stack: 3–10
- Use: Equip for passive bonuses

**Consumables:** Mana potions, spell components
- Stack: 5–20
- Use: Fuel spells, enhance magic

#### 5. MATERIALS (Crafting & Restoration)

This is your **largest category** because of restoration + kingdom findings.

**Common:** Wood, stone, clay, sand
- Stack: 99
- Use: Basic crafting, building

**Refined:** Ingots, processed materials, leather
- Stack: 50–99
- Use: Intermediate crafting

**Elemental:** Fire shards, ice crystals, lightning cores
- Stack: 50–100
- Use: Elemental crafting, crown materials

**Organic:** Bark, herbs, fibers, silk
- Stack: 50–99
- Use: Potions, cloth, nature items

**Structural:** Hinges, glass shards, nails, rope, beams (your restoration items!)
- Stack: 50–250 (high! These stack heavily)
- Use: Restore buildings, NPCs request

**Rare:** Boss materials, special finds, crystalline
- Stack: 10–50
- Use: High-tier crafting, kingdom items

#### 6. TRADE (Sellables)

**Valuables:** Gems, coins, jewelry
- Stack: 20–999 (coins stack very high)
- Use: Sell for gold, trade

**Artifacts:** Lore items, collectibles, oddities
- Stack: 5–20
- Use: Complete collections, story

**Bulk Goods:** Trade stacks (grain, fish, lumber crates)
- Stack: 10–50
- Use: Trade with merchants

**Curiosities:** Weird finds, flavor items
- Stack: 5–10
- Use: Collect, display, trade

#### 7. CREAT (Companion)

**Eggs:** Discovered eggs
- Stack: 1 per egg (important early game!)
- Use: Take home, care for

**Food:** Creat-specific meals
- Stack: 30–50
- Use: Feed companion

**Care Items:** Bond tonics, grooming kits
- Stack: 3–10
- Use: Improve bond, care

**Accessories:** Cosmetics, flower crowns, collars
- Stack: 1–3
- Use: Customize companion

**Training:** Items that boost abilities or bond
- Stack: 2–10
- Use: Creat development

#### 8. QUEST (Story & Keys)

**Main:** Story quest items, critical path items
- Stack: 1
- Use: Non-droppable

**Side:** Side quest items
- Stack: 1–3
- Use: Non-droppable

**Lore:** Lore scraps, books, records
- Stack: 5–20
- Use: Collect for story

**Keys:** Quest keys (or better: use keyring system)
- Stack: N/A (use keyring instead)
- Use: Unlock doors

---

## Stack Sizes (Smart Scaling)

### By Player Level

**Level 1–10:**
- Common materials: 50
- Food: 15
- Special items: 3

**Level 11–20:**
- Common materials: 75
- Food: 20
- Special items: 5

**Level 21–30:**
- Common materials: 99
- Food: 30
- Special items: 8

**Level 31+:**
- Common materials: 250+
- Food: 50
- Special items: 10+

**Note:** Stack size grows every 10 levels, meaning inventory feels much bigger without actually adding slots.

---

## Inventory Capacity Scaling

### Player Inventory (What you carry)

| Level | Slots |
|-------|-------|
| 1 | 100 |
| 10 | 125 |
| 20 | 150 |
| 30 | 175 |
| 40+ | 200 |

**Design:** Caps at 200. You're not meant to carry everything.

### Home Base Storage (Warehouse)

| Level | Capacity |
|-------|----------|
| 1 | 300 |
| 10 | 400 |
| 20 | 500 |
| 30 | 800 |
| 40+ | 1200+ |

**Expanded by:**
- Restoration rewards (fix storage house → +100 slots)
- Kingdom findings (find "Storage Ledger" → +150 slots)
- Blacksmith (craft reinforced chests → +50 per craft)
- Guild upgrades (future)

---

## Keyring System (No Slots!)

Keys don't take inventory space. Separate UI shows:

```
Keys:
┌─────────────────────────┐
│ Trail Keys      (x3)    │
│ Town Keys       (x2)    │
│ Kingdom Keys    (x1)    │
│ Special Keys    (x0)    │
└─────────────────────────┘
```

**Key Types:**

| Key | For What | Used By |
|-----|----------|---------|
| Trail Key | Side paths, hidden caches, loot rooms | Rider exploration |
| Town Key | Homes, inns, shops, storerooms | Community restoration |
| Kingdom Key | Gates, archives, towers, vaults | Major progression |
| Special Keys | Bosses, rare vaults, crown trials | Critical unlocks |

**Add keys:**
```gdscript
AdvancedInventorySystem.add_key("trail_key", 1)
```

**Check keys:**
```gdscript
if AdvancedInventorySystem.has_key("town_key"):
	print("Can enter town buildings!")
```

---

## Using the System

### Basic Operations

**Add item:**
```gdscript
AdvancedInventorySystem.add_item("bread_loaf", 5)
```

**Remove item:**
```gdscript
AdvancedInventorySystem.remove_item("bread_loaf", 2)
```

**Get item count:**
```gdscript
var count = AdvancedInventorySystem.get_item_count("bread_loaf")
print("Have %d bread" % count)
```

### Browsing Inventory

**Get all items in a tab:**
```gdscript
var gear_items = AdvancedInventorySystem.get_items_in_tab(
	AdvancedInventorySystem.InventoryTab.GEAR
)
for item in gear_items:
	print("%s (x%d)" % [item.id, item.quantity])
```

**Get items in a category:**
```gdscript
var meals = AdvancedInventorySystem.get_items_in_category(
	AdvancedInventorySystem.ItemCategory.MEALS
)
```

**Get recently acquired (highlights in UI):**
```gdscript
var recent = AdvancedInventorySystem.get_recently_acquired("player", 60.0)
for item in recent:
	print("NEW: %s" % item.id)
	# UI shows these items glowing
```

### Storage Queries

**Check how full inventory is:**
```gdscript
var used = AdvancedInventorySystem.get_used_slots("player")
var available = AdvancedInventorySystem.get_available_slots("player")
var percent = AdvancedInventorySystem.get_storage_percent("player")
print("Inventory: %d/%d used (%.0f%%)" % [used, max_slots, percent * 100])
```

**Open home storage:**
```gdscript
AdvancedInventorySystem.storage_opened.emit("home")
# UI switches to home storage view
```

---

## Signals

Listen for inventory changes:

```gdscript
AdvancedInventorySystem.inventory_changed.connect(_on_inventory_changed)
AdvancedInventorySystem.item_added.connect(_on_item_added)
AdvancedInventorySystem.item_removed.connect(_on_item_removed)
AdvancedInventorySystem.inventory_full.connect(_on_inventory_full)
AdvancedInventorySystem.stack_limit_hit.connect(_on_stack_limit_hit)
AdvancedInventorySystem.key_added.connect(_on_key_added)
```

---

## UI Structure (Recommended)

```
┌─ INVENTORY ─────────────────────────────────┐
│                                             │
│  [GEAR] [PROVISIONS] [ARMORY] [ARCANA]     │
│  [MATERIALS] [TRADE] [CREAT] [QUEST]       │
│                                             │
├─ SEARCH ────────────────────────────────────┤
│ 🔍 Recently acquired | Sellable | All      │
│                                             │
├─ ITEMS LIST ────────────────────────────────┤
│                                             │
│ [NEW] Bread Loaf           (20)  (📌 Quest)│
│ ✨ Honey Jar                 (2)            │
│       Cooked Meat           (8)             │
│ 📌 Town Key (Keyring)                      │
│                                             │
│ Inventory: 42 / 100 slots (42%)            │
│ [SWAP TO HOME STORAGE]                     │
│                                             │
└─────────────────────────────────────────────┘
```

**Features:**
- Tab navigation at top
- Quick filters (Recently acquired, sellables)
- Item list shows count
- Icons for quest items, new items (glow)
- Key indicator shows it's in keyring
- Storage status + swap button

---

## Integration with Other Systems

### Pre-Battle Prep

```gdscript
var meals = AdvancedInventorySystem.get_items_in_category(
	AdvancedInventorySystem.ItemCategory.MEALS
)
var potions = AdvancedInventorySystem.get_items_in_category(
	AdvancedInventorySystem.ItemCategory.MAGIC_CONSUMABLES
)
# Show what player can bring into battle
```

### Restoration Quest

```gdscript
var needed_materials = ["glass_shard", "door_hinge", "timber_beam"]
for mat in needed_materials:
	var count = AdvancedInventorySystem.get_item_count(mat)
	print("%s: %d / 50 needed" % [mat, count])
```

### Home Base

```gdscript
AdvancedInventorySystem.storage_opened.emit("home")
# Player can move items between player inventory and home storage
# Home storage holds unlimited bulk materials
```

### Creat Care

```gdscript
var creat_food = AdvancedInventorySystem.get_items_in_category(
	AdvancedInventorySystem.ItemCategory.CREAT_FOOD
)
var care_items = AdvancedInventorySystem.get_items_in_category(
	AdvancedInventorySystem.ItemCategory.CARE_ITEMS
)
# Show available care options
```

---

## Why This Works

**Instead of 1000 slots:** Smart categories + high stacks = feels spacious
**Instead of scrolling hell:** Tabs organize naturally + filters
**Instead of indecision:** Each item has a purpose + clear category
**Instead of hoarding:** Home storage for bulk, player carries only essentials
**Instead of keys cluttering:** Separate keyring UI
**Scales naturally:** Leveling up increases stacks AND slots gradually

---

## Checklist

- [x] Create AdvancedInventorySystem with tabs & categories
- [x] Implement scaling by player level
- [x] Home storage separate from player inventory
- [x] Keyring system (no slots)
- [ ] Create UI that shows tabs + categories
- [ ] Add search/filter functionality
- [ ] Implement drag-drop between player/home storage
- [ ] Add visual highlights for recent items
- [ ] Connect to pre-battle prep screens
- [ ] Test save/load flow
- [ ] Create item database with all 100+ items
