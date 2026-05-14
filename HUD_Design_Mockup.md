# 🎮 HUD Design Mockup - Gather the Crown: Creats & Foes

**Style:** Circular/radial design with Biblical faction colors  
**Platform:** Optimized for both mobile and PC  
**Created:** February 24, 2026

---

## 📐 FULL SCREEN LAYOUT (ASCII Mockup)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [FACTION]     ╔═══════════════════════════════════╗      [MINIMAP]   │
│   EMBLEM       ║                                   ║      ┌─────────┐  │
│   🔵           ║                                   ║      │    ▲    │  │
│                ║                                   ║      │  ┌─┼─┐  │  │
│  HP: ████░░    ║                                   ║      │  │ ● │  │  │
│  [100/100]     ║         GAMEPLAY AREA             ║      │  └─┼─┘  │  │
│                ║                                   ║      │    │    │  │
│  CREAT HP:     ║                                   ║      │   YOU   │  │
│  ████████░     ║                                   ║      └─────────┘  │
│  [180/200]     ║                                   ║                   │
│                ║                                   ║      [POSITION]   │
│  STAMINA:      ║                                   ║       1st / 8     │
│  ⚡⚡⚡⚡⚡░░    ║                                   ║                   │
│                ║                                   ║      [LAP]        │
│                ╚═══════════════════════════════════╝       2 / 3      │
│                                                                         │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────┐          │
│  │          CIRCULAR ATTACK WHEEL (CENTER BOTTOM)          │          │
│  │                                                          │          │
│  │                    [ATTACK 2]                            │          │
│  │                        ◆                                 │          │
│  │                       ╱ ╲                                │          │
│  │                      ╱   ╲                               │          │
│  │         [ATTACK 1]  ◆     ◆  [ATTACK 3]                 │          │
│  │              ╲      │  🎯  │      ╱                      │          │
│  │               ╲     │ CORE │     ╱                       │          │
│  │                ◆────┤ATTACK├────◆                        │          │
│  │                     │  ⚔️  │                             │          │
│  │         [ATTACK 5]  │     │  [ATTACK 4]                 │          │
│  │                     ╲     ╱                              │          │
│  │                      ╲   ╱                               │          │
│  │                       ╲ ╱                                │          │
│  │                        ◆                                 │          │
│  │                                                          │          │
│  │  [1] Flame Lash (3/5)    [CORE] Shield Bash            │          │
│  │  [2] Wind Surge (2/3)    [3] Ice Spike (4/4)           │          │
│  │  [4] Heal (1/2)          [5] Empty Slot                │          │
│  └─────────────────────────────────────────────────────────┘          │
│                                                                         │
│  [SPEED]  ▓▓▓▓▓▓▓▓▓▓░░░░░░  [185 km/h]        [GOLD: 1,247g]         │
│  [BOOST]  ████░░░░░░░░░░░░  [Ready in 3s]      [CROWN SHARDS: 12]    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 DETAILED HUD ELEMENTS

### TOP LEFT - Player & Creat Status

```
┌──────────────────────┐
│  [FACTION EMBLEM]    │  ← Glows with faction color
│      🔵 WATCHER      │
│                      │
│  RIDER HP            │
│  ████████░░ 80/100   │  ← Red bar, decreases from right
│                      │
│  CREAT HP            │
│  ██████████ 180/200  │  ← Green bar, larger than rider
│                      │
│  STAMINA             │
│  ⚡⚡⚡⚡⚡░░ 5/7      │  ← Lightning bolts, used for attacks
│                      │
│  [BUFFS/DEBUFFS]     │
│  🔥 +20% Fire DMG    │  ← Active effects with timers
│  ❄️ Slowed (3s)      │
└──────────────────────┘
```

**Features:**
- Faction emblem pulses when faction ability is ready
- HP bars have damage flash effect (white flash on hit)
- Creat HP shows species icon (dragon, wolf, etc.)
- Stamina bolts fill from left to right
- Buffs show icon + timer countdown
- Critical HP (below 25%) makes bars pulse red

---

### TOP RIGHT - Navigation & Race Info

```
┌──────────────────────┐
│    [MINIMAP]         │
│   ┌──────────┐       │
│   │    ▲N    │       │  ← Rotates with player direction
│   │  ╱─┼─╲   │       │
│   │ │  ●  │  │       │  ← You (blue dot)
│   │  ╲─┼─╱   │       │
│   │ ◆  │  ◆  │       │  ← Enemies (red), Items (gold)
│   │    ▼     │       │
│   └──────────┘       │
│                      │
│  POSITION: 1st / 8   │  ← Large, easy to read
│                      │
│  LAP: 2 / 3          │
│                      │
│  CHECKPOINT ✓        │  ← Shows next objective
│  Next: 250m →        │
│                      │
│  [QUEST TRACKER]     │
│  • Collect 3 Gems    │  ← Active objectives
│    [2/3] ◆◆░         │
└──────────────────────┘
```

**Features:**
- Minimap shows terrain elevation (darker = lower)
- Enemy dots show health (full red = healthy, dark red = low)
- Checkpoint arrow points to next objective
- Quest tracker collapses when not in story mode
- Distance to next checkpoint updates in real-time

---

### CENTER BOTTOM - Circular Attack Wheel

```
                    [ATTACK 2]
                   🌪️ Wind Surge
                        ◆ (2/3)
                       ╱ ╲
                      ╱   ╲
                     ╱     ╲
    [ATTACK 1]      ◆       ◆      [ATTACK 3]
   🔥 Flame Lash    │       │    ❄️ Ice Spike
      (3/5)         │  🎯   │       (4/4)
                    │ CORE  │
         ╲          │   ⚔️  │          ╱
          ╲         │SHIELD │         ╱
           ◆────────┤ BASH  ├────────◆
                    │ (∞)   │
    [ATTACK 5]      │       │      [ATTACK 4]
      Empty         │       │    💚 Heal Vine
       Slot         ╲       ╱       (1/2)
                     ╲     ╱
                      ╲   ╱
                       ╲ ╱
                        ◆
```

**Features:**
- **Center (Core Attack):** Always available, no cooldown
  - Glows brighter when ready to use
  - Shows attack name and icon
  
- **5 Outer Slots:** Swappable attacks
  - Each shows: Icon, Name, Uses remaining
  - Grayed out when depleted
  - Glows when selected
  - Number key (1-5) or controller button to activate

- **Visual Feedback:**
  - Selected attack pulses with faction color
  - Cooldown shows as circular fill animation
  - Empty slots show "+" icon to add new attack
  - Forbidden attacks (shatnez cursed) show red X

- **Mobile Touch Controls:**
  - Tap slot to select
  - Swipe from slot toward enemy to cast
  - Hold slot to see attack details

---

### BOTTOM LEFT - Speed & Boost

```
┌─────────────────────────┐
│  SPEED                  │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░       │  ← Fills based on current speed
│  185 km/h               │  ← Large numbers, easy to read
│                         │
│  BOOST                  │
│  ████░░░░░░░░░░░        │  ← Charges over time
│  Ready in 3s            │  ← Shows cooldown or "READY!"
│                         │
│  [DRIFT COMBO]          │  ← Appears during drifting
│  ×3 MULTIPLIER 🔥       │
└─────────────────────────┘
```

**Features:**
- Speed bar changes color based on speed tier:
  - Green (0-100 km/h) = slow
  - Yellow (100-200 km/h) = medium
  - Orange (200-300 km/h) = fast
  - Red (300+ km/h) = max speed
- Boost bar pulses when full
- Drift combo shows multiplier for tricks/stunts
- Speedometer shows both metric and imperial (toggle in settings)

---

### BOTTOM RIGHT - Economy & Resources

```
┌─────────────────────────┐
│  💰 GOLD: 1,247g        │  ← Current gold
│  👑 CROWN SHARDS: 12    │  ← Premium currency
│                         │
│  [ROYAL CURRENCY]       │  ← Shows current kingdom's currency
│  🌲 Emerald Leaves: 5   │
│                         │
│  [ITEMS COLLECTED]      │  ← Race objectives
│  ◆ Gems: 2/3            │
│  🔑 Keys: 1/1 ✓         │
└─────────────────────────┘
```

**Features:**
- Gold counter animates when collecting coins
- Crown Shards glow with rainbow effect
- Royal currency shows kingdom icon
- Collected items show checkmark when complete
- Flashes when picking up new items

---

## 🎨 FACTION COLOR THEMES

Each faction has unique HUD color scheme:

### 🔵 The Watchers (Blue)
- Primary: Deep blue (#1E3A8A)
- Accent: Silver (#C0C0C0)
- Glow: Bright blue (#3B82F6)
- HP bars: Blue tint
- Attack wheel: Blue energy rings

### 🟣 The Sovereigns (Purple)
- Primary: Royal purple (#7C3AED)
- Accent: Bronze (#CD7F32)
- Glow: Bright purple (#A78BFA)
- HP bars: Purple tint
- Attack wheel: Purple energy rings

### 🔴 The Purifiers (Scarlet)
- Primary: Deep red (#991B1B)
- Accent: Iron gray (#6B7280)
- Glow: Bright red (#EF4444)
- HP bars: Red tint
- Attack wheel: Fire effect rings

### ⚪ The Sanctified (White)
- Primary: Pure white (#FFFFFF)
- Accent: Light silver (#E5E7EB)
- Glow: Golden white (#FEF3C7)
- HP bars: White/gold tint
- Attack wheel: Light energy rings

### 🟡 The Anointed (Gold)
- Primary: Rich gold (#F59E0B)
- Accent: Deep gold (#B45309)
- Glow: Bright gold (#FCD34D)
- HP bars: Gold tint
- Attack wheel: Golden energy rings

### ⚫ The Penitents (Black)
- Primary: Deep black (#1F2937)
- Accent: Dark gray (#4B5563)
- Glow: Shadow purple (#6B21A8)
- HP bars: Dark tint
- Attack wheel: Shadow energy rings

---

## 📱 MOBILE OPTIMIZATION

### Simplified Mobile HUD

```
┌─────────────────────────────────────┐
│ HP:████░ CREAT:████████░  [MAP]    │  ← Condensed top bar
│                                     │
│                                     │
│         GAMEPLAY AREA               │
│                                     │
│                                     │
│                                     │
│    ┌─────────────────────┐         │
│    │   ATTACK WHEEL      │         │  ← Larger for touch
│    │      (Radial)       │         │
│    └─────────────────────┘         │
│                                     │
│ [BOOST]  1st/8  185km/h  💰1,247g  │  ← Condensed bottom
└─────────────────────────────────────┘
```

**Mobile-Specific Features:**
- Larger touch targets (minimum 44x44px)
- Swipe gestures for attacks
- Auto-hide non-essential info during races
- Haptic feedback on attacks and hits
- Simplified minimap (corner only)

---

## 🎮 PC/CONSOLE OPTIMIZATION

### Full PC HUD (Keyboard + Mouse)

**Additional Elements:**
- Keybind hints (1-5 for attacks, Space for boost)
- Mouse cursor for menu navigation
- Chat box (bottom left, collapsible)
- FPS counter (optional, top right corner)
- Ping indicator (multiplayer)

### Controller Layout

```
[LT] - Brake/Reverse       [RT] - Accelerate
[LB] - Previous Attack     [RB] - Next Attack
[A]  - Use Selected Attack [B]  - Boost
[X]  - Jump/Trick          [Y]  - Interact
[D-Pad] - Quick Item Use   [Sticks] - Movement/Camera
```

---

## ✨ SPECIAL EFFECTS & ANIMATIONS

### Attack Wheel Animations
- **Selection:** Slot glows and pulses
- **Activation:** Energy burst from slot to center
- **Cooldown:** Circular fill animation (clockwise)
- **Depleted:** Slot fades to gray, cracks appear
- **Recharge:** Sparkle effect when uses refill

### Damage Feedback
- **Hit Taken:** Screen edge flashes red, HP bar shakes
- **Critical Hit:** Slow-motion for 0.5s, bright flash
- **Healing:** Green particles flow into HP bar
- **Shield Break:** Glass shatter effect

### Speed Effects
- **Boost Activation:** Screen edges blur, speed lines
- **Max Speed:** Chromatic aberration, intense motion blur
- **Drift:** Tire smoke particles, drift sparks
- **Airborne:** Wind rush sound, altitude indicator

### Faction Ability Ready
- **Visual:** Faction emblem glows intensely
- **Audio:** Faction-specific sound cue
- **Particle:** Energy swirls around emblem
- **Screen:** Subtle faction color vignette

---

## 🔧 CUSTOMIZATION OPTIONS

### HUD Settings (Pause Menu)
- **HUD Scale:** 50% - 150%
- **Opacity:** 50% - 100%
- **Position:** Preset layouts (Default, Compact, Minimal, Pro)
- **Color Blind Mode:** Adjust colors for accessibility
- **Motion:** Enable/disable screen shake and blur
- **Minimap:** Size, rotation, zoom level
- **Damage Numbers:** Show/hide floating damage text

### Preset Layouts

**Default:** All elements visible, balanced
**Compact:** Smaller elements, more screen space
**Minimal:** Only essential info (HP, speed, attacks)
**Pro:** Optimized for competitive play, minimal clutter

---

## 🎯 CONTEXTUAL HUD CHANGES

### Race Mode
- Show: Position, lap, speed, boost, attacks
- Hide: Quest tracker, detailed buffs

### Story Mode
- Show: Quest tracker, dialogue box, objective markers
- Hide: Position, lap counter

### Combat Arena
- Show: HP, stamina, attacks, enemy HP bars
- Hide: Speed, boost, minimap

### Exploration/Free Roam
- Show: Minimap, quest tracker, resources
- Hide: Position, lap, speed (unless mounted)

### Vault Raid
- Show: HP, attacks, loot counter, boss HP bar
- Hide: Speed, position, race info

---

## 📊 BOSS FIGHT HUD ADDITIONS

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  👹 SHADOW KING - PHASE 2                            ║ │
│  ║  ████████████████████████████████░░░░░░░░░░░░░░░░░░  ║ │
│  ║  HP: 12,450 / 25,000                                 ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│                    [GAMEPLAY AREA]                          │
│                                                             │
│  [PHASE INDICATOR]                                          │
│  ● ● ○ ○  (Phase 2 of 4)                                   │
│                                                             │
│  [BOSS MECHANICS]                                           │
│  ⚠️ VOID RIFT OPENING - DODGE! (3s)                        │
└─────────────────────────────────────────────────────────────┘
```

**Boss-Specific Elements:**
- Large boss HP bar at top
- Phase indicators (dots or segments)
- Mechanic warnings (telegraphed attacks)
- Weak point indicators (glowing spots)
- Enrage timer (if applicable)

---

## 🌟 VICTORY/DEFEAT SCREENS

### Victory Screen

```
┌─────────────────────────────────────────┐
│                                         │
│         🏆 VICTORY! 🏆                  │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  RACE RESULTS                 │     │
│  │                               │     │
│  │  Position: 1st / 8            │     │
│  │  Time: 2:34.56                │     │
│  │  Best Lap: 0:48.23            │     │
│  │                               │     │
│  │  REWARDS:                     │     │
│  │  💰 Gold: +450g               │     │
│  │  ⭐ XP: +1,200                │     │
│  │  🎁 Items: 3                  │     │
│  │                               │     │
│  │  [CONTINUE]  [REPLAY]         │     │
│  └───────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

### Defeat Screen

```
┌─────────────────────────────────────────┐
│                                         │
│         💀 DEFEATED 💀                  │
│                                         │
│  "The Shadow King has claimed another   │
│   soul. Will you rise again?"           │
│                                         │
│  [RETRY]  [CHANGE LOADOUT]  [QUIT]     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎨 VISUAL MOCKUP SUMMARY

**Key Design Principles:**
1. **Clarity:** All info readable at a glance
2. **Faction Identity:** Colors reflect player's chosen faction
3. **Minimal Clutter:** Only show what's needed for current mode
4. **Responsive:** Adapts to mobile, PC, and console
5. **Immersive:** Doesn't block gameplay view
6. **Accessible:** Color-blind modes, scalable text

**Next Steps for Implementation:**
- Create high-fidelity mockups in Figma/Photoshop
- Prototype interactive HUD in game engine
- User testing for readability and usability
- Iterate based on feedback

---

**This HUD design balances information density with visual clarity, ensuring players can focus on the action while having all necessary data at their fingertips.**

🎮👑✨
