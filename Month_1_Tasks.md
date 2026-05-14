# Month 1 Development Tasks
## July 2025 - Foundation Setup

**Goal:** Get Unity running, create basic character movement, and implement simple Creat following behavior.

---

## 🎯 Week 1: Setup & Planning

### Tasks:
- [ ] Download and install Unity Hub
- [ ] Create new Unity project (3D Core template)
- [ ] Setup version control (GitHub or Unity Collaborate)
- [ ] Create project folder structure:
  ```
  Assets/
    ├── Scripts/
    ├── Scenes/
    ├── Prefabs/
    ├── Materials/
    ├── Models/
    ├── UI/
    └── Audio/
  ```
- [ ] Import free starter assets (character controller, terrain)
- [ ] Create first scene: "TestGrounds"

### Resources Needed:
- Unity Hub: https://unity.com/download
- Free character controller asset
- Basic terrain textures

---

## 🎯 Week 2: Character Movement

### Tasks:
- [ ] Create player character GameObject
- [ ] Implement basic movement script:
  - Walk (WASD or Arrow keys)
  - Run (Hold Shift)
  - Jump (Spacebar)
  - Camera follow
- [ ] Add simple capsule collider
- [ ] Test movement on flat terrain
- [ ] Add basic animation (walk/run/idle) - can use free Mixamo

### Code Needed:
- `PlayerMovement.cs`
- `CameraFollow.cs`

---

## 🎯 Week 3: Creat Following System

### Tasks:
- [ ] Create Creat GameObject (simple cube or sphere for now)
- [ ] Implement follow AI:
  - Creat follows player at set distance
  - Stops when player stops
  - Catches up when player moves
- [ ] Add simple collision avoidance
- [ ] Test with obstacles

### Code Needed:
- `CreatFollow.cs`
- `CreatAI.cs` (basic)

---

## 🎯 Week 4: Basic Interaction

### Tasks:
- [ ] Add interaction system:
  - Press E to "pet" Creat (test interaction)
  - Simple UI popup when near Creat
- [ ] Create basic health bar UI for player
- [ ] Add simple stamina system for running
- [ ] Test all systems together
- [ ] Document what works and what needs fixing

### Code Needed:
- `InteractionSystem.cs`
- `UIManager.cs` (basic)
- `PlayerStats.cs`

---

## 📊 Month 1 Success Metrics

By end of Month 1, you should have:
- ✅ Unity project setup and organized
- ✅ Character that can walk, run, jump
- ✅ Camera that follows character smoothly
- ✅ Creat that follows player around
- ✅ Basic UI showing health/stamina
- ✅ Simple interaction system working

---

## 🆘 If You Get Stuck

**Common Issues:**
1. **Character falls through floor** → Check colliders on both character and ground
2. **Camera is jerky** → Use LateUpdate() for camera movement
3. **Creat doesn't follow** → Check NavMesh setup or use simple Vector3.MoveTowards
4. **Scripts won't compile** → Check for typos, missing semicolons, or wrong namespaces

**Resources:**
- Unity Learn: https://learn.unity.com
- Brackeys YouTube tutorials
- Unity Forums
- Ask me! I can debug code or explain concepts

---

## 💬 Questions to Answer This Month

- What art style do you want? (Low poly, realistic, stylized?)
- What's the camera angle? (Third-person, top-down, side-scroller?)
- How fast should the character move?
- How close should the Creat follow?

---

## 🎮 Playtest Goals

By end of month, you should be able to:
1. Start the game
2. Move your character around a test area
3. See your Creat following you
4. Jump over a simple obstacle
5. Interact with your Creat

**If you can do all that → Month 1 = SUCCESS** 🎉

---

## 📅 Next Month Preview

Month 2 will add:
- Mounting system (ride your Creat)
- Basic attack/combat
- Simple enemy AI
- Health/damage system

---

**Let's build this foundation strong.** 💪🔥

Need help with any specific task? Just ask and I'll provide:
- Step-by-step Unity instructions
- Complete code scripts
- Troubleshooting help
- Asset recommendations
