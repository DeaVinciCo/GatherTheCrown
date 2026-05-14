# Hybrid Hero Tattoo System - Implementation Guide

## Overview
Element-branded tattoos have been implemented for hybrid heroes, providing permanent visible markings on the forehead that display the hero's elemental nature. This creates instant visual distinction for hybrid players, similar to Harry Potter's lightning bolt scar.

## Key Features

### 1. Tattoo Textures (Boot.ts, Lines 320-396)
Seven distinct 14x14 pixel tattoo designs, one per element:

| Element | Texture Name | Design |
|---------|-------------|--------|
| Fire | `tattoo-fire` | Upward-pointing flame shape (orange) |
| Water | `tattoo-water` | Concentric water ripples (blue) |
| Earth | `tattoo-earth` | Tree/root branching pattern (green) |
| Storm | `tattoo-storm` | Lightning bolt (yellow, Harry Potter style) |
| Light | `tattoo-light` | Six-pointed radiant star (gold) |
| Shadow | `tattoo-shadow` | Crescent moon (purple) |
| Arcane | `tattoo-arcane` | Mystical rune circle with points (cyan) |

### 2. Hero Preview Display (ForgeHero.ts, Line 47)
```typescript
const previewTattoo = this.add.sprite(previewX - 3, previewY - 63, 'tattoo-fire')
  .setScale(2).setDepth(6).setVisible(false);
```
- Positioned on forehead of hero preview sprite
- Starts hidden, shows only for Hybrid heroes
- Updates when element changes

### 3. Hybrid-Specific Logic (ForgeHero.ts)

#### When Race = "Hybrid" is selected (Line 288-297):
- Tattoo sprite becomes visible
- Element-mapped tattoo texture is assigned
- Example: Select Hybrid → Fire element → Shows flame tattoo

#### When Element changes (Line 641-651):
- For Hybrid heroes, tattoo texture updates automatically
- Each element maps to its distinctive tattoo design

#### Tattoo Persistence (Line 881):
- Tattoo is saved with hero creation data
- Tattoo value = Element name for Hybrids, empty string for Humans
- Example: `tattoo: 'Fire'` or `tattoo: 'Water'`

### 4. Data Storage

#### Database (Prisma, schema.prisma, Line 31):
```prisma
heroTattoo  String  @default("")
```
- Stores element name as tattoo identifier
- Empty string for non-hybrid heroes

#### GameRegistry (GameRegistry.ts):
- `heroTattoo: string = ''` (Line 21)
- Stored in localStorage for offline persistence
- Updated when hero is created/loaded

#### Backend API (auth.ts, Line 80):
```typescript
heroTattoo: heroData.tattoo || '',
```
- Server receives tattoo from client
- Saves to database on hero creation
- Returns tattoo when hero is loaded

## User Flow

1. **Hero Creation**
   - User selects "Hybrid" race
   - Tattoo sprite appears showing Fire element tattoo by default
   - User selects element (e.g., Water)
   - Tattoo updates in real-time to water ripple design
   - Hero is forged with `tattoo: 'Water'`

2. **Hero Loading**
   - Backend retrieves hero with `heroTattoo: 'Water'`
   - Client displays tattoo sprite on hero in game scenes
   - Tattoo remains visible on hybrid heroes throughout gameplay

## Technical Integration

### Boot.ts (Texture Generation)
- Lines 320-396: All 7 tattoo textures generated as part of texture preload
- Uses Graphics API to draw each tattoo design
- Textures persist in memory for quick sprite creation

### ForgeHero.ts (UI & Preview)
- Line 47: Tattoo sprite created and added to preview
- Lines 288-303: Race selector updates tattoo visibility
- Lines 641-651: Element selector updates tattoo texture
- Line 881: Tattoo included in hero creation payload

### GameRegistry.ts (State Management)
- Lines 21, 73, 109, 136: Tattoo field initialization, setting, clearing, persisting

### Backend (auth.ts)
- Line 80: Tattoo saved to database on hero creation

### Database (schema.prisma)
- Line 31: Tattoo field added to Hero model

## Visual Design Rationale

- **Size**: 14x14 pixels, scaled 2x in preview = small but visible
- **Position**: Forehead area (previewY - 63) = prominent location
- **Depth**: 6 = rendered on top of hero sprite and hair
- **Color Coding**: Each element uses thematic color (Fire=orange, Water=blue, etc.)
- **Distinctiveness**: Unique shape per element = instant recognition at a glance

## Future Enhancements

- Tattoo placement options (forehead, arm, foot)
- Tattoo visibility toggleable in settings
- Tattoo rendering in other game scenes (Haven, battle arenas, etc.)
- Tattoo animation effects (glow, shimmer)
- Tattoo color customization within element palette

## Testing Checklist

✅ Boot.ts generates all 7 tattoo textures
✅ ForgeHero preview shows tattoo only for Hybrid heroes
✅ Tattoo updates when element changes
✅ Tattoo hides when switching to Human race
✅ Tattoo persists to database on hero creation
✅ Tattoo loads from database when hero is retrieved
✅ Build completes with no errors
✅ All 7 element tattoos are distinct and recognizable
