# Quick Launch Guide

## 🚀 How to Run

### Step 1: Install Pygame
```bash
pip install pygame
```

### Step 2: Navigate to Prototype
```bash
cd prototype
```

### Step 3: Run the Game
```bash
python main.py
```

## 🎮 What You'll See

When the game launches, you'll see:

1. **Forest environment** - Green background with trees, grass, and bushes
2. **Your hero** - Blue tunic character in the center (labeled "HERO")
3. **Fire Drake** - Red-orange dragon companion following you (labeled "FIRE DRAKE")
4. **Enemies** - Red creatures and one purple boss scattered around
5. **Crown fragments** - Glowing golden items on the ground
6. **HUD** - Health, stamina, and bond meters in top-left
7. **Controls hint** - Bottom-left corner

## 🎯 What to Try

### Movement
- Walk around with **WASD** or arrow keys
- Hold **Shift** to sprint (uses stamina)
- Press **Space** to dodge roll (invincibility frames!)

### Combat
- **Left-click** near enemies to attack
- Watch your stamina bar (green)
- Press **1** to command your Fire Drake to attack
- Press **2** to make your Fire Drake defend you

### Collection
- Walk near glowing items to collect them
- Bronze shards and blue gems are crown fragments
- Check your collection by pressing **I**

### Crown System
- Press **C** to open the Crown Forge
- See what fragments you've collected
- Forge a crown when you have enough pieces

### Exploration
- The world is 2000x2000 pixels
- Camera follows you automatically
- Trees and bushes are decorative (no collision yet)
- Find all 3 crown fragments scattered around

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'pygame'"
```bash
pip install pygame
```

### "No module named 'sprites'"
Make sure you're in the `prototype/` directory:
```bash
cd prototype
python main.py
```

### Game runs but I see errors
Check that all files are present:
- main.py
- game.py
- player.py
- creat.py
- enemy.py
- crown.py
- ui.py
- sprites.py

### Can't see the hero
- Look for the blue character with "HERO" label
- Try moving with WASD - camera follows you
- Check that the window is in focus

### Fire Drake not visible
- It should be visible by default
- Look for red-orange dragon with flames
- If missing, check `game.py` line: `self.creat.visible = True`

### Performance issues
- Close other applications
- Reduce window size (edit main.py)
- Disable grass rendering (comment out grass loop in game.py)

## 📊 Testing Checklist

Try these to test all features:

- [ ] Move in all 4 directions
- [ ] Sprint and watch stamina drain
- [ ] Dodge roll and see transparency effect
- [ ] Attack an enemy
- [ ] Command Fire Drake to attack (press 1)
- [ ] Collect a crown shard (walk over glowing item)
- [ ] Open inventory (press I)
- [ ] Open crown forge (press C)
- [ ] Fight the purple boss
- [ ] Pause the game (press ESC)

## 🎨 Visual Reference

See `VISUAL_GUIDE.md` for detailed descriptions of all sprites and visual elements.

## ⚙️ Configuration

### Change Window Size
Edit `main.py`:
```python
SCREEN_WIDTH = 1280  # Change this
SCREEN_HEIGHT = 720  # Change this
```

### Change FPS
Edit `main.py`:
```python
FPS = 60  # Change this
```

### Hide Fire Drake (Tutorial Mode)
Edit `game.py`:
```python
self.creat.visible = False  # Change True to False
```

### Adjust Player Speed
Edit `player.py`:
```python
self.speed = 200  # Change this value
```

## 🎯 Next Steps

After testing the prototype:
1. Read `DESIGN_REVIEW.md` for design analysis
2. Check `PROJECT_STATUS.md` for development roadmap
3. Review design documents (01-18.txt files)
4. Explore Unity projects for full development

## 💡 Tips

- **Stamina management** is key - don't spam attacks
- **Dodge roll** has invincibility frames - use it!
- **Fire Drake** is powerful - use attack command often
- **Boss enrages** at 50% health - be ready!
- **Crown fragments** glow - easy to spot
- **Trees** are in foreground - they can hide you

## 🆘 Still Having Issues?

1. Check Python version: `python --version` (need 3.7+)
2. Reinstall pygame: `pip uninstall pygame` then `pip install pygame`
3. Try running from parent directory: `python prototype/main.py`
4. Check console for error messages
5. Verify all .py files are in prototype folder

---

**Enjoy the prototype!** This is just the beginning - full game coming soon! 🎮👑
