# 🚀 Quick Start Guide - Gather the Crown: Creats & Foes Prototypes

## ⚡ 5-Minute Setup

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Go to https://nodejs.org/
2. Download LTS version (recommended)
3. Install and restart your terminal

### Step 2: Install Dependencies
```bash
cd prototypes
npm install
```

### Step 3: Run the Prototype
```bash
npm run dev
```

Your browser will automatically open to `http://localhost:3000`

## 🎮 What to Try

### 1. Race Mode (5 minutes)
- Click "Start Race"
- Use **WASD** or **Arrow Keys** to drive
- Press **Space** to boost
- Try to stay on the track!

### 2. Combat Mode (3 minutes)
- Click "Combat Arena"
- Press **Space** to attack
- Watch the enemy's health bar
- Try to defeat the enemy!

### 3. Creat Bonding (5 minutes)
- Click "Creat Bonding"
- Press **P** to pet (watch for hearts!)
- Press **F** to feed
- Press **Space** to play
- Get bond to 25 to see evolution message!

## 🎯 Goals

- **Race Mode**: Reach 300 km/h speed
- **Combat Mode**: Defeat the enemy creat
- **Bonding Mode**: Evolve your creat (bond 25+)

## 💡 Tips

- Open browser console (F12) to see debug messages
- Each mode has different controls
- Watch the HUD for stats
- Experiment with different actions!

## ❓ Troubleshooting

**Port 3000 already in use?**
```bash
# Edit vite.config.ts and change port to 3001
```

**Dependencies not installing?**
```bash
# Try clearing cache
npm cache clean --force
npm install
```

**Black screen?**
- Check browser console for errors
- Make sure you're using a modern browser (Chrome, Firefox, Edge)
- Try refreshing the page

## 📊 What's Working

✅ 3D rendering with Three.js  
✅ Basic creat system  
✅ Three game modes  
✅ HUD display  
✅ Keyboard controls  
✅ Stats and calculations  
✅ Evolution system  
✅ Particle effects (hearts)  

## 🚧 What's Not Implemented Yet

❌ Collision detection  
❌ Advanced AI  
❌ Sound effects  
❌ Mobile controls  
❌ Multiplayer  
❌ Save system  
❌ Full attack system  
❌ Kingdom vaults  

## 🎨 Customization

Want to change creat colors? Edit `src/core/Creat.ts`:
```typescript
private getElementColor(): number {
  const colors: Record<CreatElement, number> = {
    [CreatElement.FIRE]: 0xff4500, // Change this!
    // ...
  };
}
```

Want to adjust stats? Edit `calculateStats()` in `Creat.ts`

## 📝 Next Steps

1. Play with all three modes
2. Check the code in `src/` folder
3. Read the full README.md
4. Experiment with modifications
5. Share feedback!

## 🎉 You're Ready!

The prototypes are simple but demonstrate core mechanics:
- **Creat system** with stats and evolution
- **Racing** with physics and controls
- **Combat** with damage calculations
- **Bonding** with emotional feedback

These are the building blocks for the full game!

---

**Enjoy the prototypes! 👑🐉**

**Game:** Gather the Crown: Creats & Foes
