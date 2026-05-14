# How to Play Gather The Crown

## 🎮 You Have 3 Ways to Play:

---

## Option 1: Python Prototype (Simplest)

**What it is:** Basic 2D prototype with core gameplay
**Best for:** Quick testing, seeing the game concept

### Requirements:
- Python 3.7+
- Pygame

### Install:
```bash
pip install pygame
```

### Launch:
```bash
cd prototype
python main.py
```

### Controls:
- **WASD** - Move
- **Shift** - Sprint
- **Space** - Dodge roll
- **Left Click** - Attack
- **1** - Command creat to attack
- **2** - Command creat to defend
- **I** - Inventory
- **C** - Crown Forge
- **M** - Map
- **ESC** - Pause

---

## Option 2: Unity Project #1

**What it is:** Full Unity development version
**Best for:** Full game development, advanced features

### Requirements:
- Unity Hub
- Unity Editor (version in ProjectSettings/ProjectVersion.txt)

### Launch:
1. Open Unity Hub
2. Click "Add" → Select folder: `Gather the Crown`
3. Click on the project to open
4. Press Play button in Unity Editor

### Location:
```
Gather the Crown/
```

---

## Option 3: Unity Project #2

**What it is:** Alternative Unity version
**Best for:** Testing different implementations

### Requirements:
- Unity Hub
- Unity Editor

### Launch:
1. Open Unity Hub
2. Click "Add" → Select folder: `Gather the Crown Creats and Foes`
3. Click on the project to open
4. Press Play button in Unity Editor

### Location:
```
Gather the Crown Creats and Foes/
```

---

## 🌐 Web Version (If Available)

If you have a web build:

### Launch:
1. Double-click `PLAY_NOW.bat`
   OR
2. Open `PLAY_GAME.html` in a web browser

---

## 🛠️ Development Tools

### Asset Validator
Checks if your assets are correct:
```bash
python tools/asset_validator.py
```

### Crown Calculator
Shows crown stats and rewards:
```bash
python tools/crown_calculator.py
```

### Content Tracker
Shows development progress:
```bash
python tools/content_tracker.py
```

---

## 📚 Documentation

### Quick References:
- **MASTER_INDEX.md** - Index of all files
- **QUICKSTART.md** - Getting started guide
- **PROJECT_STATUS.md** - Current status
- **ROADMAP.md** - Development timeline

### Design Docs:
- **01-18 .txt files** - Core game design
- **Markdown files** - Detailed systems

---

## ❓ Troubleshooting

### Python Prototype Won't Run:
```bash
# Make sure pygame is installed
pip install pygame

# Check Python version
python --version  # Should be 3.7+

# Try running from prototype folder
cd prototype
python main.py
```

### Unity Project Won't Open:
1. Check Unity version matches project
2. Let Unity import assets (first time takes a while)
3. Check console for errors

### Missing Files:
- Check `MASTER_INDEX.md` for file locations
- All design docs should be in root folder
- Unity projects in their own folders

---

## 🎯 What to Play First?

**Just want to see the game?**
→ Python Prototype (fastest to launch)

**Want to develop/modify?**
→ Unity Projects (full development environment)

**Want to understand the design?**
→ Read design documents (01-18.txt files)

---

## 📞 Need Help?

1. Check `MASTER_INDEX.md` for file locations
2. Check `QUICKSTART.md` for setup instructions
3. Check `PROJECT_STATUS.md` for current status
4. Check specific system .md files for details

---

**Recommended:** Start with Python prototype to see the core gameplay, then move to Unity for full development.
