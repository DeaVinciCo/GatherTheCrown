# 🎮 Unity Setup Guide - Gather the Crown: Creats & Foes

**Quick Start:** Get the game running in Unity in 30 minutes!

---

## 📦 Step 1: Install Unity (10 minutes)

1. **Download Unity Hub**
   - Go to: https://unity.com/download
   - Download and install Unity Hub
   - Create a free Unity account

2. **Install Unity Editor**
   - Open Unity Hub
   - Click "Installs" → "Install Editor"
   - Choose: **Unity 2022.3 LTS**
   - Click "Install"

3. **Create New Project**
   - Unity Hub → "Projects" → "New Project"
   - Template: **3D Core**
   - Project Name: `GatherTheCrown`
   - Location: Choose your folder
   - Click "Create Project"

---

## 📁 Step 2: Set Up Project Structure (5 minutes)

In Unity, create these folders in the Project window:

```
Assets/
├── Scripts/
│   ├── Core/
│   ├── Managers/
│   └── UI/
├── Scenes/
├── Prefabs/
├── Materials/
└── Resources/
    └── Sounds/
        └── Creat/
```

**How to create folders:**
- Right-click in Project window → Create → Folder

---

## 📝 Step 3: Add the Scripts (5 minutes)

Copy all the C# scripts I created into your Unity project:

1. **Core Scripts** (put in `Assets/Scripts/Core/`):
   - `Creat.cs`
   - `Player.cs`

2. **Manager Scripts** (put in `Assets/Scripts/Managers/`):
   - `GameManager.cs`
   - `QuestManager.cs`
   - `KingdomManager.cs`

3. **UI Scripts** (put in `Assets/Scripts/UI/`):
   - `UIManager.cs`

**How to add scripts:**
- Drag and drop the `.cs` files into the correct folders in Unity
- OR: Right-click folder → Create → C# Script → paste code

---

## 🎮 Step 4: Create the Game Scene (10 minutes)

### A. Create Player

1. **Create Player GameObject**
   - Hierarchy → Right-click → Create Empty
   - Name it: `Player`
   - Add Component → Character Controller
   - Add Component → Player (your script)

2. **Add Camera**
   - Hierarchy → Right-click → Camera
   - Drag it onto Player (make it a child)
   - Position: (0, 2, -5)
   - Rotation: (10, 0, 0)

### B. Create Creat

1. **Create Creat GameObject**
   - Hierarchy → Right-click → 3D Object → Capsule
   - Name it: `PlayerCreat`
   - Scale: (0.5, 0.5, 0.5)
   - Position: (2, 0.5, 0)
   - Add Component → Creat (your script)

2. **Configure Creat**
   - In Inspector, set:
     - Creat Name: "Ember"
     - Element: FIRE
     - Stage: HATCHLING

### C. Create Managers

1. **Create GameManager**
   - Hierarchy → Right-click → Create Empty
   - Name it: `GameManager`
   - Add Component → Game Manager (your script)
   - In Inspector:
     - Drag Player into "Player" slot
     - Drag PlayerCreat into "Player Creat" slot

2. **Create QuestManager**
   - Hierarchy → Right-click → Create Empty
   - Name it: `QuestManager`
   - Add Component → Quest Manager (your script)
   - Drag into GameManager's "Quest Manager" slot

3. **Create KingdomManager**
   - Hierarchy → Right-click → Create Empty
   - Name it: `KingdomManager`
   - Add Component → Kingdom Manager (your script)
   - Drag into GameManager's "Kingdom Manager" slot

### D. Create UI

1. **Create Canvas**
   - Hierarchy → Right-click → UI → Canvas
   - Name it: `GameUI`

2. **Create HUD**
   - Right-click Canvas → UI → Panel
   - Name it: `HUD`
   - Add Component → UI Manager (your script)
   - Drag into GameManager's "UI Manager" slot

3. **Add Text Elements** (inside HUD):
   - Right-click HUD → UI → Text - TextMeshPro
   - Create these texts:
     - `PlayerHPText` (top-left)
     - `CreatHPText` (top-left, below player HP)
     - `GoldText` (top-right)
     - `ShardsText` (top-right, below gold)
     - `LevelText` (top-left, above HP)

4. **Link UI Elements**
   - Select HUD
   - In Inspector (UI Manager component):
     - Drag each text element into corresponding slot

### E. Create Ground

1. **Create Plane**
   - Hierarchy → Right-click → 3D Object → Plane
   - Name it: `Ground`
   - Scale: (10, 1, 10)
   - Position: (0, 0, 0)

2. **Add Material**
   - Assets → Right-click → Create → Material
   - Name it: `GroundMaterial`
   - Set color to green
   - Drag onto Ground plane

---

## ▶️ Step 5: Test the Game!

1. **Save the Scene**
   - File → Save As
   - Name: `MainGame`
   - Save in `Assets/Scenes/`

2. **Press Play!**
   - Click the Play button (▶️) at top
   - You should see:
     - Player can move (WASD)
     - Creat is visible
     - HUD shows stats
     - Console shows "Game Initialized!"

3. **Test Controls**
   - **WASD** - Move player
   - **Shift** - Sprint
   - **Space** - Jump
   - **P** - Pet creat
   - **F** - Feed creat
   - **Tab** - Show stats
   - **Esc** - Pause

---

## 🎨 Step 6: Make It Look Better (Optional)

### Add Colors to Creat

1. **Create Material**
   - Assets → Create → Material
   - Name: `FireCreatMaterial`
   - Set color to red/orange
   - Drag onto PlayerCreat capsule

### Add Lighting

1. **Add Directional Light**
   - Already exists in scene
   - Adjust rotation for better shadows

2. **Add Skybox**
   - Window → Rendering → Lighting
   - Environment → Skybox Material
   - Choose a skybox or leave default

---

## 🐛 Troubleshooting

### "Script can't be loaded"
- Make sure script names match file names exactly
- Check for compilation errors in Console

### "NullReferenceException"
- Make sure all references in Inspector are assigned
- Check GameManager has Player and Creat assigned

### "Character Controller not moving"
- Make sure Player has Character Controller component
- Check Ground has a collider

### "UI not showing"
- Make sure Canvas is in scene
- Check UI Manager has text elements assigned
- Make sure TextMeshPro is imported (Window → TextMeshPro → Import TMP Essentials)

---

## 🎮 What You Can Do Now

### Test Creat Bonding
1. Press **P** to pet your creat
2. Press **F** to feed your creat
3. Watch bond level increase in console
4. Watch hunger/happiness change

### Test Quests
1. Press **Tab** to see stats
2. Quest "The Egg" should be active
3. Check console for quest updates

### Test Kingdoms
1. Press **Tab** to see kingdom stats
2. All 8 kingdoms are initialized
3. Ready to be discovered

---

## 📚 Next Steps

### Add More Creats
1. Duplicate PlayerCreat
2. Change element and colors
3. Create different types

### Add Combat
1. Create enemy GameObject
2. Add Creat script
3. Make it attack player

### Add Racing
1. Create race track
2. Add checkpoints
3. Add speed boost zones

### Add Vaults
1. Create vault scene
2. Add treasure chests
3. Add coins to collect

---

## 💾 Save Your Work!

**Important:** Unity doesn't auto-save!

1. **Save Scene:** Ctrl+S (Cmd+S on Mac)
2. **Save Project:** File → Save Project
3. **Use Version Control:** 
   - Initialize Git repository
   - Add `.gitignore` for Unity
   - Commit regularly

---

## 🚀 You're Ready!

You now have:
- ✅ Working player character
- ✅ Bonded creat with stats
- ✅ Quest system
- ✅ Kingdom system
- ✅ UI with HUD
- ✅ Save/Load system

**Press Play and start your adventure!** 👑🐉✨

---

## 📞 Need Help?

- **Unity Learn:** https://learn.unity.com
- **Unity Manual:** https://docs.unity3d.com
- **Unity Forums:** https://forum.unity.com
- **Discord:** Join Unity game dev communities

---

**Time to build Gather the Crown: Creats & Foes!** 🎮
