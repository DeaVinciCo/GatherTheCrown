# Gather The Crown: Prototype

This is a minimal viable prototype (MVP) demonstrating core game mechanics with visual sprites.

## MVP Scope

**Phase 1 Prototype includes:**
- ✅ Basic player movement (WASD)
- ✅ Simple combat system (attack, dodge)
- ✅ Crown fragment collection
- ✅ Basic UI (HUD, inventory)
- ✅ Visual sprites for all game elements
- ✅ 1 playable character (Hero with blue tunic)
- ✅ 1 companion creat (Fire Drake with flames)
- ✅ 1 test biome (Greenwood Forest with trees, grass, bushes)
- ✅ 3 enemies (2 Emberlings + 1 Twistroot boss)
- ✅ Crown puzzle UI (simplified)
- ✅ Environment decoration (trees, grass, bushes)
- ✅ Collectible items (shards, gems)

**NOT included in Phase 1:**
- Multiplayer
- Full character creation
- Multiple biomes
- Story mode
- Advanced boss mechanics
- Audio system (placeholder only)

## Requirements

```bash
pip install pygame
```

## Running the Prototype

```bash
cd prototype
python main.py
```

## Controls

**Movement:**
- W/A/S/D or Arrow Keys: Move
- Shift: Sprint
- Space: Dodge roll

**Combat:**
- Left Click: Light attack
- Right Click: Heavy attack
- 1: Command creat to attack
- 2: Command creat to defend

**UI:**
- I: Toggle inventory
- M: Toggle map
- ESC: Pause menu

## File Structure

```
prototype/
├── main.py              # Entry point
├── game.py              # Main game loop
├── player.py            # Player character
├── creat.py             # Creat companion
├── enemy.py             # Enemy/boss classes
├── crown.py             # Crown system
├── ui.py                # UI elements
├── sprites.py           # Sprite manager (NEW!)
├── VISUAL_GUIDE.md      # Visual reference guide
└── README.md
```

## Visual Elements

All game elements now have visual sprites! See `VISUAL_GUIDE.md` for details.

**What you'll see:**
- Hero with blue tunic and brown hair
- Fire Drake with red-orange scales and flame particles
- Enemies with angry faces and spikes
- Boss with purple body and golden crown
- Trees with brown trunks and green foliage
- Grass tufts covering the ground
- Bushes with berries
- Crown shards (bronze metallic)
- Gems (blue diamonds)
- All with proper labels for testing

## Testing Checklist

- [ ] Player can move in all directions
- [ ] Player can attack enemies
- [ ] Player can dodge enemy attacks
- [ ] Creat follows player
- [ ] Creat attacks on command
- [ ] Crown fragments can be collected
- [ ] Crown puzzle UI displays correctly
- [ ] Inventory opens and closes
- [ ] Boss has multiple attack patterns
- [ ] Boss can be defeated
- [ ] Game doesn't crash during normal play

## Known Issues

- Sprites are simple placeholder art (but clearly identifiable!)
- No sound effects
- Limited enemy AI
- No save system yet
- Performance not optimized
- Creat is visible from start (should appear after tutorial)

## Next Steps (Phase 2)

1. Add character creation screen
2. Implement creat evolution system
3. Add 2 more biomes
4. Create 3 more bosses
5. Implement save/load system
6. Add basic audio
7. Polish UI with medieval theme
