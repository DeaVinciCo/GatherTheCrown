# Town Features Plan

## Current Status
✅ Town-style road network complete
- 3x3 grid of main cobblestone roads
- Brick connecting paths between roads
- 9 distinct blocks/areas for buildings
- Trees and bushes avoiding pathways

## Next Features to Add

### Buildings

**Homes/Houses**
- Small cottages with roofs, doors, windows
- Different colors/styles for variety
- Placed in blocks between roads
- Maybe 8-12 houses total
- Chimneys with smoke particles?

**Inn**
- Larger building (2x size of house)
- Sign out front
- Special color scheme (warm/inviting)
- Near main intersection
- Maybe a "INN" sign sprite

**Shoppe/Store**
- Medium building
- Awning over entrance
- Display window
- "SHOP" sign
- Near main road for easy access

**Well(s)**
- Stone well with bucket
- 1-2 wells in town
- Near houses or in town square
- Water reflection effect?

### Ground Features

**Lawns/Grass Patches**
- Lighter green grass around houses
- Rectangular patches indicating yards
- Different grass texture/color
- Flowers in some yards?

**Ponds**
- Blue water with ripple effect
- Lily pads or reeds
- Maybe 1-2 small ponds
- Reflection shimmer

**Town Square**
- Central area with special ground texture
- Maybe fountain or statue
- Benches?
- Meeting area

### Decorative Elements

**Fences**
- Around some houses
- Wooden post style
- Define property boundaries

**Flower Beds**
- Colorful spots near houses
- Red, yellow, pink flowers
- Small decorative patches

**Street Lamps**
- Along main roads
- Wooden posts with lanterns
- Could glow at "night"

**Signs**
- Directional signs at intersections
- Building name signs
- Welcome to town sign

### Interactive Elements

**NPCs (Future)**
- Townspeople walking around
- Shop keeper
- Inn keeper
- Villagers

**Doors**
- Can enter buildings
- Different interiors

## Sprite Sizes

Following current pattern:
- Houses: 96x96 or 128x128
- Inn: 128x128 or 160x160
- Shop: 96x96 or 128x96
- Well: 64x64
- Pond: 128x128 or larger
- Lawn patches: Variable rectangles
- Flowers: 16x16 or 24x24
- Fences: 32x8 segments
- Lamps: 32x64

## Layout Strategy

**Block Usage:**
- Corner blocks: Houses with yards
- Center block: Town square with well/fountain
- Edge blocks: Inn, Shop, more houses
- Between paths: Small decorative elements

**Placement Rules:**
- Buildings face roads
- Lawns behind/beside houses
- Wells in accessible areas
- Ponds in quieter corners
- Keep some natural forest areas

## Color Palette

**Buildings:**
- Houses: Browns, grays, reds (roofs)
- Inn: Warm browns, yellow windows
- Shop: Bright colors, awning stripes

**Nature:**
- Lawns: Lighter green (#60, 160, 60)
- Ponds: Blue (#80, 150, 220)
- Flowers: Reds, yellows, pinks, purples

**Details:**
- Fences: Brown wood (#120, 80, 50)
- Lamps: Dark wood + yellow glow
- Signs: Wood with painted text

## Implementation Order

1. **First Pass** (After you review roads):
   - Create house sprites (2-3 styles)
   - Create inn sprite
   - Create shop sprite
   - Place buildings in blocks

2. **Second Pass**:
   - Add wells (1-2)
   - Add lawn patches around houses
   - Add ponds (1-2)

3. **Third Pass**:
   - Decorative elements (fences, flowers)
   - Street lamps
   - Signs

4. **Polish**:
   - Particle effects (smoke, water ripples)
   - Lighting effects
   - Shadows

## Notes

- Keep pathways clear
- Buildings should have clear entrances facing roads
- Balance natural (trees) with urban (buildings)
- Leave some open spaces
- Make it feel lived-in but not cluttered

Ready to implement once you've reviewed the current road layout!
