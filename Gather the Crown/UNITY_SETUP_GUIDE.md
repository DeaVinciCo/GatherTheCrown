# 🎮 Unity Setup Guide - Gather the Crown: Creats and Foes

## ✅ Scripts Created

All C# scripts are now in `Assets/Scripts/`:

### Core Systems
- `Core/Creat.cs` - Creat system with elements, evolution, stats
- `Core/Kingdom.cs` - Kingdom restoration system
- `Systems/QuestSystem.cs` - Quest management with Forest Trials
- `UI/QuestUI.cs` - Quest display UI
- `GameManager.cs` - Main game controller

## 🚀 Quick Setup (5 minutes)

### Step 1: Create GameManager
1. In Unity Hierarchy, right-click → Create Empty
2. Name it "GameManager"
3. Add Component → Search "GameManager" → Add it
4. The GameManager will auto-create a QuestManager

### Step 2: Setup Camera
1. Select Main Camera in Hierarchy
2. Set Position: (0, 2, -10)
3. Set Rotation: (0, 0, 0)

### Step 3: Add Lighting
1. GameObject → Light → Directional Light (if not already present)
2. Set Rotation: (50, -30, 0)

### Step 4: Test the Game
Press Play! You should see:
- A Fire creat spawned in front of camera
- Console messages about game initialization

## 🎮 Test Controls

While playing:
- **Q** - Start the first available quest
- **E** - Update current quest objective
- **L** - Level up your creat
- **B** - Increase bond with creat

## 📋 Quest Flow

The game includes these quests:
1. **main_001** - "The Egg" (Find the mysterious egg)
2. **main_002** - "The Hatching" (Hatch and bond with creat)
3. **main_003** - "Village Under Attack" (Defend village)
4. **forest_trial_001** - "Forest Trials: Movement" (Obstacle course)
5. **forest_trial_002** - "Forest Trials: Combat" (Defeat dummies)
6. **forest_trial_003** - "Forest Trials: Bonding" (Care for creat)
7. **choice_home_or_sylvara** - "The Path Forward" (Choose your path)

## 🎨 Optional: Add Quest UI

### Create Canvas
1. GameObject → UI → Canvas
2. Canvas Scaler → UI Scale Mode → Scale With Screen Size
3. Reference Resolution: 1920 x 1080

### Add Text Elements (using TextMeshPro)
1. Right-click Canvas → UI → Text - TextMeshPro
2. Create 4 text objects:
   - "QuestTitle" (Top left, large font)
   - "QuestDescription" (Below title)
   - "Objectives" (Below description)
   - "Stats" (Bottom right, small font)

### Connect UI
1. Create Empty GameObject under Canvas, name it "QuestUIManager"
2. Add Component → QuestUI script
3. Drag the 4 text objects into the script's fields

## 🐉 Creat Elements

Your creat can be one of 8 elements:
- **Fire** - High attack, fast (Red/Orange)
- **Water** - Balanced, defensive (Blue)
- **Air** - Fastest, low defense (Light Blue)
- **Earth** - Tanky, slow (Brown)
- **Ice** - Fast, moderate defense (Cyan)
- **Poison** - High attack, moderate (Purple)
- **Light** - Fast, balanced (Gold)
- **Shadow** - Highest attack, moderate (Dark Purple)

## 🔄 Creat Evolution Stages

1. **Egg** - 0.5x stats
2. **Hatchling** - 1x stats (Starting stage)
3. **Juvenile** - 1.5x stats
4. **Adult** - 2x stats
5. **Elder** - 3x stats

## 📝 Next Steps

1. Create actual game scenes (Forest, Village, Trials)
2. Add enemy AI and combat system
3. Implement racing mechanics
4. Create kingdom vaults
5. Add save/load system
6. Build UI menus and HUD

## 🎯 Current Features

✅ Quest system with prerequisites and chains
✅ Creat stats and element system
✅ Kingdom restoration tracking
✅ Forest Trials quests
✅ Choice system (Home Base vs Sylvara)
✅ Level up and bond mechanics
✅ Visual creat generation

## 🔧 Troubleshooting

**Scripts won't compile?**
- Make sure you have TextMeshPro installed (Window → Package Manager → TextMeshPro)
- If QuestUI errors, you can delete it and use Debug.Log for now

**Creat not visible?**
- Check camera position
- Make sure GameManager is in the scene
- Look at Scene view to find the creat

**No quests starting?**
- Check Console for messages
- Make sure QuestManager initialized
- Try pressing Q multiple times

## 💡 Tips

- Open Console (Window → General → Console) to see all debug messages
- Use Scene view to position objects
- Save your scene (Ctrl+S)
- Test frequently with Play button

---

**Ready to build your game!** 🎮👑🐉
