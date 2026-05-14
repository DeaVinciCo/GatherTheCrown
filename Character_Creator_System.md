# Character Creation System

## 🎮 Overview

The Character Creator is the player's first interaction with the game world. It sets the foundation for their journey, their bond with their Creat, and their playstyle.

---

## 💇🏽 Character Customization Options

### Basic Identity
| Feature | Options |
|---------|---------|
| Gender | Male / Female |
| Name | Player input (max 16 characters) |

### Appearance
| Feature | Options | Notes |
|---------|---------|-------|
| Skin Tone | 20 tones | From palest frost to deepest obsidian |
| Hair Type | 40 styles | Straight, wavy, curly, coily, fantasy |
| Hair Color | Natural + Fantasy | Black, brown, blonde, red, white, blue, purple, etc |
| Eye Shape | 8-10 options | Narrow, round, tilted, heavy-lidded |
| Eye Color | 12+ colors | Including fantasy (glow, mirror, stormy) |
| Face Shape | 6 templates | With sculpting sliders |
| Body Type | 5 options | Slim, lean, muscular, bulky, curvy |
| Height | 3 ranges | Short, average, tall |

### Customization Details
- Scars (6 options)
- Birthmarks (4 options)
- Tattoos (8 base designs)
- Face paint (10 patterns)
- Glowing runes (unlockable through quests)

---

## 🧥 Starting Gear

Player picks **1 of 3 starting sets** based on fighting style:

| Style | Armor | Weapon | Stat Perk |
|-------|-------|--------|-----------|
| 🗡️ Rogue | Light leathers | Dagger or sling | +5% speed |
| 🏹 Scout | Cloth + bracers | Bow & arrows | +5% vision range |
| 🔨 Brawler | Thick hide gear | Blunt club | +5% knockback resistance |

### Starting Inventory
- 1 Creat bonding item (small egg, broken horn fragment, or glowing feather)
- 1 basic healing potion
- 1 random fruit
- 50 gold

---

## 🧠 Background Traits (Pick 1–2)

Adds depth and gameplay effects:

| Trait | Perk |
|-------|------|
| Nomadic | Can travel faster on foot |
| Scholar | +10% XP from knowledge-based quests |
| Outlaw | Starts with stealth cloak |
| Artisan | Crafts gear with extra durability |
| Beastborn | Faster Creat bonding time |
| Twinblade | Learns dual wielding earlier |
| Lighttouched | Starts with minor elemental resistance |
| Crownseeker | Finds more gold in chests |

---

## 🔥 Elemental Bond Selection

Choose your primary elemental affinity (affects Creat compatibility):

| Element | Color Theme | Starting Bonus |
|---------|-------------|----------------|
| Fire 🔥 | Crimson/Orange | +5% burn damage |
| Ice 🧊 | Pale Blue/Cyan | +5% freeze duration |
| Lightning ⚡ | Gold/Yellow | +5% stun chance |
| Earth 🌱 | Brown/Green | +5% defense |
| Shadow 🕳️ | Purple/Black | +5% stealth |
| Light ✨ | White/Silver | +5% healing |
| Water 🌊 | Aqua/Blue | +5% in water zones |
| Wind 🌪️ | Teal/Sky | +5% speed |

---

## 🐾 Starter Creat Selection

After character creation, player chooses **1 of 3 offered Creats**:

### Option 1: Fyra
- **Type:** Fox-lizard hybrid
- **Element:** Fire
- **Role:** DPS / Agile
- **Personality:** Brave, energetic
- **Food Preference:** Meat, Emberfruit
- **Description:** "A quick-footed flame dancer with a mischievous streak."

### Option 2: Glidra
- **Type:** Moth-owl hybrid
- **Element:** Air
- **Role:** Support / Speed
- **Personality:** Calm, observant
- **Food Preference:** Nectar, Galevine
- **Description:** "Silent wings carry wisdom and wind."

### Option 3: Dromba
- **Type:** Mini mammoth
- **Element:** Earth
- **Role:** Tank / Shield
- **Personality:** Loyal, stubborn
- **Food Preference:** Herbs, Bloomseed
- **Description:** "Small now, but destined to shake mountains."

---

## 🎬 Bonding Moment Cutscene

After selection, a short cutscene plays:

**Scene:**
- Camera pans to chosen Creat
- Creat approaches character slowly
- Character kneels, extends hand
- Creat sniffs, then nuzzles hand
- Soft glow appears between them
- Text appears: "A bond has been forged."

**UI Update:**
- Bond meter appears (starts at 10%)
- Creat name input prompt (or keep default)
- Creat follows player as pet
- Tutorial prompt: "Feed and care for your Creat to strengthen your bond."

---

## 🎮 UI Layout Concept

```
┌─────────────────────────────────────────────────┐
│  CHARACTER CREATION                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐         ┌─────────────┐      │
│  │             │         │             │      │
│  │  Character  │         │   Preview   │      │
│  │   Options   │         │    Model    │      │
│  │             │         │             │      │
│  └─────────────┘         └─────────────┘      │
│                                                 │
│  Skin Tone: [████████████████████]             │
│  Hair Type: [Dropdown ▼]                       │
│  Eye Color: [Color Picker]                     │
│                                                 │
│  Starting Class:                                │
│  ○ Rogue  ○ Scout  ○ Brawler                  │
│                                                 │
│  Elemental Bond:                                │
│  ○ Fire  ○ Ice  ○ Lightning  ○ Earth          │
│                                                 │
│  [Back]              [Next: Choose Creat →]    │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Implementation Notes

### Unity Components Needed:
- Character customization UI (Canvas + Panels)
- Character model with swappable parts (hair, clothes, etc)
- Color picker system
- Save/load character data (PlayerPrefs or JSON)
- Creat selection scene
- Cutscene trigger system

### Scripts Needed:
- `CharacterCreator.cs` - Main controller
- `AppearanceManager.cs` - Handles visual changes
- `CreatSelector.cs` - Creat choice logic
- `BondingCutscene.cs` - Cutscene trigger
- `PlayerData.cs` - Save character info

---

## 📝 Next Steps

1. Create character model base (or use Unity asset)
2. Build UI layout in Unity Canvas
3. Implement appearance customization logic
4. Create 3 starter Creat models
5. Script bonding cutscene
6. Test character creation flow
7. Add save/load functionality

---

**This is where legends begin.** 🐾👑🔥
