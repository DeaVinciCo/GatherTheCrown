# ART & AUDIO STYLE GUIDE
## Gather The Crown: Creats & Foes
**Version:** 0.2.0 | **Last Updated:** April 21, 2026

*This document defines the visual and audio identity of the game. All art and UI must adhere to these standards to ensure a cohesive look and feel.*

---

## TABLE OF CONTENTS

1. [Visual Identity Overview](#1-visual-identity-overview)
2. [Color Palettes](#2-color-palettes)
3. [Typography](#3-typography)
4. [UI Design System](#4-ui-design-system)
5. [HUD Specification](#5-hud-specification)
6. [Character & Creat Visual Design](#6-character--creat-visual-design)
7. [Environment & Zone Art Direction](#7-environment--zone-zone-art-direction)
8. [Enemy Visual Design](#8-enemy-visual-design)
9. [FX & Particles](#9-fx--particles)
10. [Audio Direction](#10-audio-direction)

---

## 1. VISUAL IDENTITY OVERVIEW

### Art Style
**Primary Style:** Medieval Fantasy — Art Deco meets Dark Academia
- Rich deep tones (navy, burgundy, forest green) balanced by gold and warm amber
- Architecture feels like a once-grand kingdom now weathered and worn
- Creats are vibrant and warm — they stand out against the darker world
- Combat is readable at a glance: enemies have distinct silhouettes, attacks have clear telegraphs

### Reference Aesthetic
- **World:** Dark medieval tone, NOT goofy fantasy (think Kingdom Come: Deliverance meets Hollow Knight in 2D)
- **UI:** Art-deco royal design (reference: the character creation screen's existing navy/gold palette)
- **Creats:** Bright elemental spirit feel — similar to how Pokémon creatures stand out in their environments
- **Combat:** Clean readable hitboxes (Hades-style) — you always know what hit you

### Key Visual Rules
1. **Dark world, bright companions** — The world is brooding; the Creat is vibrant
2. **Gold is sacred** — Gold accents mark importance: Crown forge, milestone rewards, UI borders
3. **Element colors are consistent** — Fire is always orange/red, Water is blue/teal, etc.
4. **Shapes communicate** — Round = safe/friendly. Sharp/angular = danger
5. **Readable at low res** — Everything must be recognizable at 1280×720

---

## 2. COLOR PALETTES

### Core UI Palette (Art-Deco Royal)
| Name | Hex | Godot Color | Use |
|------|-----|-------------|-----|
| Navy Dark | #0D1221 | Color(0.05, 0.07, 0.13) | Panel backgrounds, main UI bg |
| Navy Mid | #1A2540 | Color(0.10, 0.15, 0.25) | Secondary panels, hover bg |
| Gold | #EAB93D | Color(0.92, 0.74, 0.24) | Borders, headings, highlight text |
| Gold Bright | #FFD060 | Color(1.0, 0.82, 0.38) | Active selection, hover gold |
| White Text | #EBEEF5 | Color(0.92, 0.93, 0.96) | Primary text on dark backgrounds |
| Cream | #F5ECD5 | Color(0.96, 0.93, 0.84) | Secondary text, subheadings |
| Burgundy | #6B1A2C | Color(0.42, 0.10, 0.17) | Danger indicators, enemy health bars |
| Forest Green | #1A4A2A | Color(0.10, 0.29, 0.16) | Safe zones, nature UI elements |
| Stone Grey | #4A4A56 | Color(0.29, 0.29, 0.34) | Disabled buttons, inactive states |

### Element Colors (Player, Creat, Enemy identification)
| Element | Primary Color | Secondary | Hex Primary |
|---------|--------------|-----------|-------------|
| Fire | Orange-Red | Amber | #D45A0A |
| Water | Blue-Teal | Cyan | #1A6B8A |
| Earth | Brown-Green | Moss | #5A7A2A |
| Storm | Purple-White | Electric | #7A3DAA |
| Light | Yellow-White | Cream | #E8D845 |
| Shadow | Dark Purple | Void Black | #2D1A4A |
| Ice | Ice Blue | Crystal | #8AD4F5 |

### Status Colors
| Status | Color | Use |
|--------|-------|-----|
| Full Health | #2ECC71 (green) | HP bars above 75% |
| Mid Health | #F39C12 (orange) | HP bars 25-75% |
| Low Health | #E74C3C (red) | HP bars below 25% |
| Sync Active | #A855F7 (purple glow) | Sync mode active |
| I-frame | 0.5 alpha white flash | Hit invulnerability |
| Enemy Telegraph | #FF2222 (red) | Boss about to attack |

---

## 3. TYPOGRAPHY

### Font Hierarchy
| Role | Font | Size | Color | Weight |
|------|------|------|-------|--------|
| Game Title | CloisterBlack / Cinzel | 48–72px | Gold | Bold |
| Screen Title | Cinzel Decorative | 32–48px | Gold | Medium |
| Section Header | Cinzel | 20–28px | Gold or White | Medium |
| Body Text | Cinzel / Crimson Pro | 16–20px | White Text | Regular |
| Small Label | Cinzel | 12–14px | Cream | Regular |
| HUD Numbers | Cinzel Bold | 14–18px | White | Bold |
| Damage Numbers | Impact / Bold Sans | 16–24px | Red (enemy) / White (player) | Bold |

### Font Rules
- ALL CAPS is acceptable for titles and HUD labels (art-deco convention)
- Avoid mixing more than 2 font families per screen
- Minimum readable size: 12px
- All text on dark backgrounds should be minimum 4.5:1 contrast ratio

---

## 4. UI DESIGN SYSTEM

### Panel Design
Panels follow a consistent art-deco frame pattern:
- **Background:** Navy Dark (#0D1221)
- **Border:** Gold (#EAB93D) — 2px line, with corner decorations when space allows
- **Inner padding:** 16px minimum
- **Border radius:** 4px (subtle, not round)
- **Shadow:** Subtle drop shadow for layering

### Button States
| State | Background | Border | Text |
|-------|-----------|--------|------|
| Default | Navy Mid | Gold (1px) | White Text |
| Hover | Gold (15% alpha) | Gold Bright (2px) | Gold Bright |
| Active/Pressed | Gold (30% alpha) | Gold (2px) | Gold Bright |
| Disabled | Stone Grey | Stone Grey (1px) | Cream (60% alpha) |
| Selected | Gold (20% alpha) | Gold Bright (3px) | White |

### Layout Principles
1. **Quadrant-based HUD** — Four corners for HUD elements, center clear for gameplay
2. **Right-align text labels** in panel left columns; left-align values
3. **Consistent 16/24px grid** — UI elements snap to this grid
4. **Gold bars separate major sections** — Use a thin gold line (1px) between UI sections
5. **No clutter center** — Keep the gameplay viewport clear of UI

---

## 5. HUD SPECIFICATION

*Reference: GatherTheCrown/docs/HUD_GEM_GAUGE_SPEC.md for full detail. This is the summary.*

### Layout Overview (1280×720 viewport)
```
┌─────────────────────────────────────────────────────────┐
│ [TOP-LEFT]              [TOP-CENTER]          [TOP-RIGHT]│
│ Hero HP Widget          Day/Night Clock       Sync Meter │
│ ♥♥♥♥♥ [bar]            " Day  04:32"         [====   ]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    GAMEPLAY AREA                         │
│                    (clear of UI)                         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ [BOTTOM-LEFT]                           [BOTTOM-RIGHT]  │
│ Creat Status Widget                     Attack Widget    │
│ [🔥 Fire Creat]                         [⚔ ATK READY]   │
│ [HP ====    ]                           [COOLDOWN ===]  │
│ [Bond 80%   ]                           [SYNC   [////]  │
│ [Hunger 65% ]                                            │
│                [CENTER-BOTTOM: Gem Bar Slots]            │
│         [R] [C] [P] [?] [chr] [opt] [INV]               │
└─────────────────────────────────────────────────────────┘
```

### Gem Bar (Bottom Center)
Seven gem-shaped buttons in a row. Each uses the game's gem-square shape (flat-topped octagon):
- Rider (R) — Amber gem
- Creat (C) — Element-colored gem
- Potion (P) — Red gem
- Other (?) — Clear gem
- Character (Chr) — Blue gem
- Options (Opt) — Grey gem
- Inventory (INV) — Gold gem

### Health Widget
- **Segmented heart icons** (not a simple bar)
- 5 hearts for hero, each heart = 20 HP (100 HP = 5 full hearts)
- Hearts deplete from right to left
- At < 25% HP: hearts flash red
- Creat health: blue hearts below hero hearts

### XP Bar
- Smooth fill (not segmented)
- Gold bar on navy background
- Located above gem bar or integrated into bottom strip

### Combat Widget (Bottom-Right)
- Attack cooldown arc display
- Sync meter bar (purple fill)
- Shows "SYNC READY" label when meter ≥ 80

---

## 6. CHARACTER & CREAT VISUAL DESIGN

### Current Implementation (Polygon2D)
All characters are currently represented as Polygon2D shapes (MVP visual). Future art will replace these.

| Character | Shape | Color |
|-----------|-------|-------|
| Player Hero | Pentagon (5 points) | Blue (0.15, 0.45, 0.95) |
| FireCreat | Irregular blob / flame shape | Orange (0.9, 0.4, 0.1) |
| Goblin Scout | Diamond (4 points) | Green (0.2, 0.8, 0.2) |
| Bandit Rogue | Diamond (4 points) | Crimson (0.9, 0.2, 0.2) |
| Orc Warrior | Diamond (4 points) | Olive (0.4, 0.6, 0.1) |
| Skeleton Guard | Diamond (4 points) | Bone (0.9, 0.9, 0.8) |

### Future Art Specification (Spritesheet Target)
- **Player Sprites:** 48×48px per frame, 8-directional movement, 4 frames walk cycle
- **Creat Sprites:** 32×32px (hatchling), 48×48px (adult), 4 frames idle + 6 frames attack
- **Enemy Sprites:** 32×32px (scout), 48×48px (raider/knight)
- **Boss Sprites:** 96×96px or larger, full animation set

### Character Readability Rules
- Player must be identifiable at a glance: distinctive blue tone in a world of earthy enemies
- Creat must visually bond with player (complementary colors, similar warmth)
- Enemies must be immediately distinguishable by type (color-coded shapes)
- Boss must be clearly larger and more imposing than standard enemies

---

## 7. ENVIRONMENT & ZONE ART DIRECTION

### Tileset Style
- **Resolution:** 32×32px or 16×16px tiles
- **Palette per biome** — forest uses greens/browns, night uses blues/purples
- **Tile overlaps** — Trees and large objects overlap adjacent tiles for depth
- **Ground texture** — Subtle (not distracting), consistent grass pattern

### Forest / Greenwood Clearing
- Lush but wild — untended since the kingdom's fracture
- Colors: Forest green, moss, earthy brown, dappled sunlight gold
- Trees: Tall oaks with thick canopies (z-index 5 for depth)
- Clearings: Patches of warm light filtering through
- Restoration sites: Crumbling stone, moss-covered ruins

### Dark Forest / Wooded Trail
- Darker, denser — less sunlight
- Colors: Dark green, shadow-black, muted brown
- Atmosphere: Foreboding, with hints of corrupted fire from the boss area
- Ambient detail: Fallen trees, broken signs, scattered bandit camps

### Night Visual
- DayNightCycle overlay: Deep blue-purple tint at 60% opacity
- Stars (particle layer) visible at night
- Lanterns and torches in hub areas glow warmer at night

### Zone Borders / Transitions
- Entering a new zone: fade black transition (0.3 sec)
- Safe zone border: subtle green shimmer at edge
- Boss room entrance: brief red flash + music shift

---

## 8. ENEMY VISUAL DESIGN

### Future Sprite Art Direction

**Goblin Scout (Bramble Scavenger)**
- Small, hunched, ragged green leather armor
- Carries a crude knife or a thrown stone
- Bright yellow eyes

**Forest Bat (Dusk Shriek)**
- Large wings with sharp tips
- Leathery purple-black body
- White glowing eyes in darkness

**Bandit Rogue (Ashwood Cutthroat)**
- Hooded, face-wrapped, dark red and grey outfit
- Twin short blades or crossbow
- Athletic, dangerous-looking posture

**Orc Warrior (Thornback Brawler)**
- Massive build, thorn-covered pauldrons
- Olive skin, crude heavy club
- Low-set eyes, aggressive expression

**Skeleton Guard (Bonewarden)**
- Worn kingdom guard armor, bleached bone showing through gaps
- Carries a spear and dented shield
- Faint ghostly green glow in eye sockets

**Crown Knight (Shattered Sworn)**
- Full royal plate armor, golden trim now tarnished
- Cracked crown emblem on chest
- Carries a two-handed sword or halberd
- Trails corrupted golden light

### Boss Visual (Embercrown Champion)
- Size: 2–3× standard enemy size
- Flame-engulfed heavy armor
- Cracked crown on helmet, leaking fire
- Red glow during phase 2, pulsing
- Death animation: armor shatters, fire dissipates, gem falls

---

## 9. FX & PARTICLES

### Combat FX
| Effect | Visual | Duration |
|--------|--------|----------|
| Melee Hit | Orange/white spark burst, 6–8 particles | 0.2s |
| Critical Hit | Larger burst + screen shake (2px, 0.1s) | 0.3s |
| Player I-frame | White transparency flash (0.5 alpha) | 0.3s per iFrame |
| Sync Activation | Purple ring pulse expanding from player | 0.5s |
| Sync Active | Persistent purple glow aura on player + creat | Duration of sync |
| Enemy Death | Dissolve + particle scatter (element-colored) | 0.6s |
| Boss Telegraph | Red pulse on boss body | 1.0s |
| Creat Attack (Fire) | Fireball trail → explosion on target | 0.3s travel |

### World FX
| Effect | Visual | Notes |
|--------|--------|-------|
| Day/Night transition | Smooth color shift via overlay | 5 min transition window |
| Restoration complete | Gold shower of sparkles | On site restoration |
| Egg discovery | Glowing golden shimmer | On trigger entry |
| Egg hatching | Cracking light burst | On hatch complete |
| Rest Point heal | Green sparkle upward from player | On interact |
| Material gather | Brief sparkle at gather point | On interact |

### UI FX
| Effect | Visual | Trigger |
|--------|--------|---------|
| Gem button hover | Gold glow + slight scale (1.05×) | Mouse over |
| Crown forged | Full screen gold flash + fanfare | On forge complete |
| Level up | Brief star burst at player position | On level gain |
| Low health pulse | Health widget pulses red | < 25% HP |

---

## 10. AUDIO DIRECTION

*Audio is Phase 2. This section defines the direction so implementation is consistent when audio is added.*

### Musical Direction
- **Genre:** Medieval orchestral with ambient electronic undertones
- **Instrument palette:** Strings (cellos/violins), brass (french horn), percussion, ambient pads
- **Mood per area:**
  - Greenwood Clearing: Peaceful, warm, hopeful folk melody
  - Forest Trials (easy): Tense but light, picking up pace
  - Forest Trials (hard): Full tension, driving percussion
  - Boss fight: Epic orchestral with heavy percussion, theme echoes boss element
  - Night: Darker, minor key version of zone themes
  - Crown forge: Triumphant, bold brass moment

### SFX Design
| Category | Feel |
|----------|------|
| Footsteps | Soft grass step / stone step (by surface) |
| Attack swing | Whoosh + impact — weight matches weapon type |
| Hit receive | Grunt + impact thud |
| Enemy death | Creature-appropriate (bat shriek, orc thud) |
| Creat attack | Element-appropriate (crackle for fire, rumble for earth) |
| UI clicks | Crisp metallic click (art-deco coin sound) |
| Crown forged | Dramatic resonant chime + swell |
| Sync activate | Rising electrical pulse |
| Sync active loop | Subtle electric hum |
| Day start | Bird call + brightening chord |
| Night start | Cricket chirp + darkening string note |
| Egg discovery | Warm chime sequence |
| Egg hatch | Shell crack + triumphant flourish |

### Audio Volume Zones
- Music: default 70% volume
- SFX: default 85% volume
- UI: default 65% volume
- All settings exposed in Options menu

### Audio Implementation Notes (Godot)
- Use `AudioStreamPlayer2D` for spatial SFX (attached to enemies/player)
- Use `AudioStreamPlayer` (non-spatial) for UI and music
- Music transitions via crossfade (0.5–1.0 sec) between zones
- All audio buses: Master → Music bus, SFX bus, UI bus
