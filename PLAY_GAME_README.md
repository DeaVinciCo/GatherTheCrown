# 🎮 PLAY GATHER THE CROWN RIGHT NOW!

**No Unity needed! Play in your browser!**

---

## 🚀 Quick Start (2 Steps)

### Step 1: Install Node.js (If you don't have it)

**Check if you have it:**
1. Open Command Prompt (search "cmd" in Windows)
2. Type: `node --version`
3. If you see a version number (like v18.0.0), you're good! Skip to Step 2.
4. If you see an error, install Node.js:

**Install Node.js:**
1. Go to: https://nodejs.org
2. Download the **LTS version** (left button)
3. Run the installer
4. Click "Next" through everything
5. Restart your computer

### Step 2: Play the Game!

**Option A: Double-click the launcher (Easiest)**
1. Find the file: `PLAY_NOW.bat`
2. Double-click it
3. Wait for browser to open
4. Play!

**Option B: Manual start**
1. Open Command Prompt
2. Navigate to your game folder:
   ```
   cd C:\Users\deanz\Downloads\GTC_C&F World Build--Pt 3_files
   ```
3. Go to prototypes folder:
   ```
   cd prototypes
   ```
4. Install dependencies (first time only):
   ```
   npm install
   ```
5. Start the game:
   ```
   npm run dev
   ```
6. Open browser to: http://localhost:5173

---

## 🎮 Game Controls

### Main Menu
- Click buttons to choose mode:
  - 🏁 **Start Race** - Racing mode
  - ⚔️ **Combat Arena** - Battle mode
  - 🐉 **Creat Bonding** - Pet and care for your creat
  - 🏛️ **Vault Exploration** - Explore treasure vaults
  - 🏰 **Kingdom Stats** - See your progress

### Race Mode
- **W or ↑** - Accelerate
- **A or ←** - Turn left
- **D or →** - Turn right
- **Shift** - Boost (when available)

### Combat Mode
- **Click** enemy to attack
- **Space** - Special attack
- Watch HP bars

### Creat Bonding Mode
- **P** - Pet your creat (+5 bond)
- **F** - Feed your creat (+3 bond)
- **Space** - Play with creat (+8 bond)
- Watch bond level increase!

### Vault Exploration
- **WASD** - Move around
- **E** - Collect treasure (when near chest)
- Walk near coins to collect them

---

## 🎯 What You Can Do

### Try All 4 Modes
1. **Race Mode** - High-speed racing with boost
2. **Combat Mode** - Turn-based battles
3. **Bonding Mode** - Care for your creat
4. **Vault Mode** - Explore and collect treasure

### Check Your Progress
- Click **Kingdom Stats** button
- See in console (F12):
  - Kingdoms discovered
  - Vaults cleared
  - Quests completed
  - Story progress

### Test the Systems
- Bond with your creat
- Complete quests
- Discover kingdoms
- Collect loot

---

## 🐛 Troubleshooting

### "Node.js not found"
- Install Node.js from https://nodejs.org
- Restart computer
- Try again

### "npm not found"
- Node.js includes npm
- Reinstall Node.js
- Make sure to restart computer

### "Port already in use"
- Close other programs using port 5173
- Or change port in `vite.config.ts`

### Browser doesn't open
- Manually go to: http://localhost:5173
- Make sure the server is running (command prompt shows "Local: http://localhost:5173")

### Game won't load
- Check console for errors (F12 in browser)
- Make sure `npm install` completed successfully
- Try closing and reopening browser

---

## 💾 Your Progress

**Good News:** The prototype saves some progress!
- Bond levels are tracked
- Quest progress is logged
- Kingdom discoveries are recorded

**Note:** Full save/load system is in the Unity version

---

## 🎉 Have Fun!

You're playing the actual prototype of **Gather the Crown: Creats & Foes**!

This is the same game that will become the full mobile/PC game, just in early prototype form.

**Enjoy exploring the kingdoms and bonding with your creat!** 👑🐉✨

---

## 📞 Issues?

If something doesn't work, let me know and I'll help you fix it!

**Now go play!** 🎮
