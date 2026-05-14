# Visual Guide - Prototype Sprites

## What You'll See In-Game

### 🦸 HERO (Player Character)
- **Appearance:** Blue tunic, brown hair, skin tone
- **Label:** "HERO" text below
- **Size:** Medium (48x48 pixels)
- **Features:** 
  - Head with eyes
  - Arms and legs
  - When attacking: holds silver sword
  - When dodging: becomes semi-transparent

### 🐉 FIRE DRAKE (Creat Companion)
- **Appearance:** Red-orange dragon with wings
- **Label:** "FIRE DRAKE" text below
- **Size:** Slightly larger than hero (56x56 pixels)
- **Features:**
  - Glowing yellow/red eyes
  - Dark red horns
  - Wings on sides
  - Tail
  - Flame particles floating above
  - Elemental aura particles around it
- **States:**
  - Red outline when attacking
  - Blue outline when defending
  - Green health bar above

### 👹 ENEMIES

**Basic Enemy (Emberling):**
- **Appearance:** Dark red round creature
- **Label:** "ENEMY" text below
- **Size:** Small (40x40 pixels)
- **Features:**
  - Angry yellow/red eyes
  - Fangs
  - Spiky protrusions
  - Red health bar above

**Boss (Twistroot):**
- **Appearance:** Large purple creature with crown
- **Label:** "BOSS" text below
- **Size:** Large (80x80 pixels)
- **Features:**
  - Golden crown on head
  - Glowing red/yellow eyes
  - Large horns
  - Threatening arms with claws
  - Large health bar with boss name
  - Turns brighter purple when enraged

### 🌳 ENVIRONMENT

**Trees:**
- Brown trunk
- Green layered foliage
- Size: 64x64 pixels
- Scattered throughout forest

**Grass Tufts:**
- Multiple green blades
- Size: 32x32 pixels
- Covers ground everywhere

**Bushes:**
- Dark green rounded shape
- Red berries
- Size: 48x48 pixels
- Scattered around

### 💎 COLLECTIBLES

**Crown Shards:**
- Bronze/copper metallic color
- Irregular shard shape
- Label: "SHARD" text
- Golden glow effect around it
- Size: 24x24 pixels

**Gems:**
- Blue diamond shape
- Sparkle effect
- Faceted appearance
- Size: 20x20 pixels
- Golden glow effect around it

**Gold Coins:**
- Golden circular
- "G" symbol
- Size: 16x16 pixels

**Health Potions:**
- Glass bottle with cork
- Red liquid inside
- Size: 24x24 pixels

## Visual Hierarchy

**Rendering Order (back to front):**
1. Background color (forest green)
2. Grid lines (subtle)
3. Grass tufts (ground layer)
4. Bushes
5. Crown shards and gems (with glow)
6. Enemies
7. Creat companion (if visible)
8. Player/Hero
9. Trees (foreground layer)
10. UI elements (always on top)

## Color Coding

**Player/Allies:**
- Hero: Blue tunic
- Fire Drake: Red-orange with flame effects

**Enemies:**
- Basic: Dark red
- Boss: Purple (brighter when enraged)

**Environment:**
- Trees: Brown trunk, green leaves
- Grass: Various shades of green
- Bushes: Dark green with red berries

**Items:**
- Crown Shards: Bronze/copper metallic
- Gems: Blue diamond
- Gold: Yellow/gold
- Potions: Red liquid in glass

**UI Elements:**
- Health bars: Red (enemies), Green (allies)
- Stamina: Light green
- Bond meter: Gold
- Text: White with black outline

## Visibility Notes

- **Creat visibility** can be toggled (set `creat.visible = False` for tutorial mode)
- **Grid lines** are subtle reference lines (can be disabled)
- **Glow effects** on collectibles make them easy to spot
- **Labels** on sprites help identify what's what during testing
- **Health bars** appear above all characters
- **State indicators** (red/blue outlines) show creat behavior

## Testing Tips

1. **Can't see the hero?** Look for blue character with "HERO" label
2. **Where's the creat?** Look for red-orange dragon with flames, labeled "FIRE DRAKE"
3. **Finding enemies?** Red creatures with "ENEMY" or purple with "BOSS" label
4. **Looking for items?** Golden glowing objects on the ground
5. **Lost in the world?** Trees are tall green objects, grass covers the ground

## Performance Notes

- Sprites are pre-rendered at startup (fast)
- Grass tufts only render if on screen (optimization)
- Trees and bushes also culled when off-screen
- Particle effects are limited to prevent slowdown
- All sprites use alpha blending for smooth visuals

## Future Improvements

These are placeholder sprites. Future versions will have:
- Animated sprites (walking, attacking, idle)
- More detailed artwork
- Proper sprite sheets
- Multiple character/creat designs
- Biome-specific environment art
- Particle effect improvements
- Shadow effects
- Lighting system
