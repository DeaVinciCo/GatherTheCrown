# 👑 Gather the Crown: Creats & Foes - Prototypes

Interactive prototypes for Gather the Crown: Creats & Foes game mechanics built with Three.js and TypeScript.

## 🎮 Features

### 1. Race Mode 🏁
- Control your creat with WASD/Arrow keys
- Accelerate, brake, and turn
- Boost with spacebar
- Dynamic camera following
- Speed tracking

### 2. Combat Mode ⚔️
- Turn-based combat system
- Attack with spacebar
- Damage calculations based on stats
- Simple AI opponent
- Health tracking

### 3. Creat Bonding Mode 💝
- Pet your creat (P key) - +3 bond
- Feed your creat (F key) - +5 bond, heals
- Play with creat (Space) - +10 bond
- Evolution system (evolve at bond 25)
- Heart particle effects

## 🚀 Setup

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

```bash
# Navigate to prototypes folder
cd prototypes

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

### Build for Production

```bash
npm run build
# or
pnpm build
```

## 🎯 Controls

### Race Mode
- **W / ↑** - Accelerate
- **S / ↓** - Brake/Reverse
- **A / ←** - Turn Left
- **D / →** - Turn Right
- **Space** - Boost

### Combat Mode
- **Space** - Attack enemy

### Creat Bonding Mode
- **P** - Pet creat (+3 bond)
- **F** - Feed creat (+5 bond, heals)
- **Space** - Play with creat (+10 bond)

## 📁 Project Structure

```
prototypes/
├── src/
│   ├── core/
│   │   └── Creat.ts          # Creat class with stats and evolution
│   ├── engine/
│   │   ├── GameEngine.ts     # Main game engine (Three.js)
│   │   └── GameMode.ts       # Base game mode class
│   ├── modes/
│   │   ├── RaceMode.ts       # Racing gameplay
│   │   ├── CombatMode.ts     # Combat gameplay
│   │   └── CreatBondingMode.ts # Bonding gameplay
│   └── main.ts               # Entry point
├── index.html                # HTML template
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

## 🎨 Creat System

### Elements
- 🔥 Fire - High attack, fast speed
- 💧 Water - Balanced, high defense
- 🌪️ Air - Fastest speed, low defense
- 🪨 Earth - Highest defense, slow speed
- ❄️ Ice - Balanced stats
- ☠️ Poison - High attack, medium speed
- ☀️ Light - Fast, high attack
- 🌑 Shadow - Highest attack, medium speed

### Evolution Stages
1. **Egg** - Not yet hatched
2. **Hatchling** - Baby form (1x stats)
3. **Juvenile** - Teen form (1.5x stats)
4. **Adult** - Mature form (2x stats)
5. **Elder** - Final form (3x stats)

### Stats
- **HP** - Health points
- **Attack** - Damage dealt
- **Defense** - Damage reduction
- **Speed** - Movement speed (km/h)
- **Stamina** - Ability usage
- **Element Power** - Elemental damage bonus

### Bond System
- **0-20**: Stranger - May disobey
- **21-40**: Acquaintance - Basic commands
- **41-60**: Friend - Trusts player
- **61-80**: Companion - Deep bond
- **81-95**: Soulmate - Unbreakable
- **96-100**: Legendary Bond - One mind

## 🔧 Technical Details

### Technologies
- **Three.js** - 3D rendering
- **TypeScript** - Type-safe code
- **Vite** - Fast build tool
- **Cannon-es** - Physics (future)

### Performance
- Target: 60 FPS
- Optimized rendering
- Shadow mapping enabled
- Anti-aliasing enabled

## 🎯 Next Steps

### Planned Features
1. **Physics System** - Collision detection with Cannon-es
2. **Attack System** - 15 different attacks
3. **Multiplayer** - WebSocket-based networking
4. **Faction System** - 6 Biblical factions
5. **Kingdom Vaults** - 8 explorable kingdoms
6. **Advanced AI** - Smarter opponents
7. **Sound Effects** - Audio system
8. **Particle Effects** - Enhanced visuals
9. **Mobile Controls** - Touch support
10. **Save System** - LocalStorage persistence

### Code Improvements
- Add unit tests (Vitest)
- Implement state management
- Add input manager
- Create asset loader
- Optimize rendering pipeline

## 📝 Development Notes

### Adding New Modes
1. Create new class extending `GameMode`
2. Implement `init()`, `update()`, and `cleanup()`
3. Add button in `index.html`
4. Register in `main.ts`

### Adding New Creats
1. Add element to `CreatElement` enum
2. Update `getElementColor()` in Creat class
3. Add stats to `calculateStats()` method
4. Create custom mesh in `createMesh()` (optional)

### Debugging
- Open browser console (F12)
- Check for TypeScript errors
- Use `console.log()` for debugging
- Monitor FPS in browser DevTools

## 🐛 Known Issues

- Camera can clip through objects
- No collision detection yet
- AI is very basic
- No sound effects
- Mobile controls not implemented

## 📄 License

This is a prototype for Gather the Crown: Creats & Foes game design documentation.  
All rights reserved © 2026

## 👥 Credits

- **Game Design**: Deanza (Crash Out Mommy)
- **Prototype Development**: AI Assistant
- **Three.js**: Three.js Contributors
- **TypeScript**: Microsoft

## 📞 Contact

- **Email**: crashoutmommy@gmail.com
- **Instagram**: @crashoutmommy

---

**Have fun testing the prototypes! 🎮👑🐉**
