# 👑 Gather the Crown: Creats & Foes - Unity Build

**Ready-to-use Unity C# scripts for your game!**

---

## 🎯 What's Included

### Core Scripts (6 files)
1. **Creat.cs** - Your bonded companion creature
   - Bonding system (pet, feed, play)
   - Evolution (5 stages)
   - Combat (attack, take damage)
   - Stats (HP, attack, defense, speed)
   - 8 elemental types

2. **Player.cs** - The rider character
   - Movement (walk, sprint, jump)
   - Stats (HP, stamina, level)
   - Currency (gold, crown shards)
   - Creat interaction

3. **GameManager.cs** - Central game controller
   - Singleton pattern
   - Scene management
   - Save/Load system
   - Pause menu
   - Game modes

4. **QuestManager.cs** - Quest system
   - Main quests
   - Side quests
   - Objectives tracking
   - Rewards
   - 3 starter quests included

5. **KingdomManager.cs** - Kingdom restoration
   - 8 kingdoms
   - Discovery system
   - Vault clearing
   - Restoration progress

6. **UIManager.cs** - User interface
   - HUD (health, gold, stats)
   - Notifications
   - Quest log
   - Pause menu

---

## 🚀 Quick Start (30 Minutes)

### 1. Install Unity
- Download Unity Hub: https://unity.com/download
- Install Unity 2022.3 LTS
- Create new 3D project

### 2. Add Scripts
- Copy all `.cs` files to your Unity project
- Organize in folders: Core/, Managers/, UI/

### 3. Set Up Scene
- Create Player with Character Controller
- Create Creat (capsule for now)
- Create GameManager, QuestManager, KingdomManager
- Create UI Canvas with HUD

### 4. Press Play!
- Test movement (WASD)
- Test creat bonding (P, F, Space)
- Check console for quest updates

**Full setup guide:** See `UNITY_SETUP_GUIDE.md`

---

## 🎮 Controls

### Player Movement
- **WASD** - Move
- **Shift** - Sprint
- **Space** - Jump
- **Mouse** - Look around

### Creat Interaction
- **P** - Pet creat (+5 bond)
- **F** - Feed creat (+3 bond, restore hunger)
- **Space** (on ground) - Play with creat (+8 bond)

### Game Controls
- **Tab** - Show stats
- **Esc** - Pause menu
- **H** - Use health potion

---

## 📊 Features Implemented

### ✅ Working Now
- Player movement and controls
- Creat bonding system
- Stats and progression
- Quest system (3 quests)
- Kingdom system (8 kingdoms)
- Save/Load system
- UI and HUD
- Combat basics

### 🔄 Ready to Expand
- Add more quests
- Create kingdom scenes
- Add 3D models
- Add animations
- Add sound effects
- Add multiplayer
- Add racing mechanics
- Add vault exploration

---

## 🏗️ Project Structure

```
Assets/
├── Scripts/
│   ├── Core/
│   │   ├── Creat.cs          ← Creat companion
│   │   └── Player.cs         ← Player character
│   ├── Managers/
│   │   ├── GameManager.cs    ← Central controller
│   │   ├── QuestManager.cs   ← Quest system
│   │   └── KingdomManager.cs ← Kingdom system
│   └── UI/
│       └── UIManager.cs      ← UI controller
├── Scenes/
│   └── MainGame.unity        ← Your game scene
├── Prefabs/
├── Materials/
└── Resources/
    └── Sounds/
        └── Creat/
```

---

## 🎨 Customization

### Change Creat Stats
```csharp
// In Creat.cs, modify Start() method:
maxHp = 200;  // More HP
attack = 20;  // More damage
speed = 15;   // Faster
```

### Add New Quest
```csharp
// In QuestManager.cs, add to InitializeQuests():
allQuests.Add(new Quest
{
    id = "my_quest",
    name = "My Quest Name",
    description = "Quest description",
    type = QuestType.SIDE,
    status = QuestStatus.AVAILABLE,
    objectives = new List<QuestObjective>
    {
        new QuestObjective { 
            id = "obj1", 
            description = "Do something", 
            current = 0, 
            required = 1 
        }
    },
    rewards = new QuestReward
    {
        xp = 1000,
        gold = 500
    }
});
```

### Change Kingdom Colors
```csharp
// In Kingdom.cs, modify GetColor() method:
case KingdomElement.FIRE: 
    return new Color(1f, 0f, 0f); // Pure red
```

---

## 🐛 Common Issues

### Scripts Won't Compile
- Check for typos in script names
- Make sure all scripts are in correct folders
- Check Console for error messages

### Player Won't Move
- Add Character Controller component
- Make sure Ground has collider
- Check Player script is attached

### UI Not Showing
- Import TextMeshPro (Window → TextMeshPro → Import TMP Essentials)
- Make sure Canvas exists
- Check UI Manager references are assigned

### Creat Not Responding
- Make sure Creat script is attached
- Check GameManager has Creat reference
- Look for errors in Console

---

## 📚 Learning Resources

### Unity Basics
- Unity Essentials: https://learn.unity.com/pathway/unity-essentials
- C# Fundamentals: https://learn.unity.com/course/programming-basics-in-c

### Game Development
- Character Controllers: https://learn.unity.com/tutorial/character-controllers
- UI System: https://learn.unity.com/tutorial/ui-components
- Save Systems: https://learn.unity.com/tutorial/persistence-saving-and-loading-data

---

## 🎯 Next Steps

### Week 1: Learn Unity Basics
- Complete Unity Essentials course
- Learn C# basics
- Understand Unity Editor

### Week 2: Enhance Visuals
- Add 3D models for creats
- Create materials and textures
- Add particle effects
- Implement animations

### Week 3: Add Content
- Create 8 kingdom scenes
- Add more quests
- Implement combat system
- Add racing mechanics

### Week 4: Polish
- Add sound effects and music
- Optimize performance
- Test on mobile device
- Fix bugs

---

## 💡 Tips

### Development
- **Save Often:** Ctrl+S (Cmd+S on Mac)
- **Test Frequently:** Press Play regularly
- **Use Console:** Check for errors and debug messages
- **Version Control:** Use Git to track changes

### Performance
- **Object Pooling:** Reuse objects instead of creating new ones
- **LOD:** Use Level of Detail for distant objects
- **Occlusion Culling:** Don't render what player can't see
- **Texture Compression:** Compress textures for mobile

### Best Practices
- **Comment Your Code:** Explain what code does
- **Use Prefabs:** Create reusable game objects
- **Organize Hierarchy:** Keep scene organized
- **Name Things Clearly:** Use descriptive names

---

## 🤝 Contributing

Want to add features?

1. **Fork the project**
2. **Create your feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit changes** (`git commit -m 'Add AmazingFeature'`)
4. **Push to branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

---

## 📞 Support

**Developer:** crashoutmommy  
**Email:** crashoutmommy@gmail.com  
**Instagram:** @crashoutmommy

**Issues:** Report bugs or request features

---

## 📄 License

This project is for **Gather the Crown: Creats & Foes**

All rights reserved © 2026

---

## 🎉 You're Ready to Build!

You have:
- ✅ Complete Unity C# scripts
- ✅ Working game systems
- ✅ Setup guide
- ✅ Documentation

**Time to create your game!** 👑🐉✨

---

**"Restore the kingdoms. Reunite the Crown. Become the legend."**

🏰 8 Kingdoms | 🐉 Infinite Creats | 👑 One Destiny
