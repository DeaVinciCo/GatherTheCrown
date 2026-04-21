# MAP SYSTEM IMPLEMENTATION GUIDE

This guide shows exactly how to integrate the map system into your existing Godot project.

## ✅ WHAT'S ALREADY DONE

1. **MAPSPEC.md** - Full design spec (read this first for understanding)
2. **4 Core Scripts Created:**
   - `scripts/ui/map_manager.gd` - Core controller
   - `scripts/ui/layer_controller.gd` - Layer visibility
   - `scripts/ui/zone_data_manager.gd` - Data loading
   - `scripts/ui/interaction_handler.gd` - Click/hover handling
3. **Data File Created:**
   - `data/zones.json` - 6 zones + 2 landmarks + paths defined
4. **GameState Updated:**
   - Added `discovered_zones` dictionary
   - Added `mastered_zones` dictionary
   - Added `player_position` for map navigation

---

## 🏗️ NEXT STEP: CREATE MAP SCENE

### Option A: Simple MVP (1-2 hours)
Create a minimal MapScreen.tscn with:
- Basic zone visualization (colored circles like your current game)
- Click detection
- Context menu
- Tooltip

### Option B: Production Quality (3-4 hours)
Add to Option A:
- Terrain blending (gradient masks)
- Elevation shading
- Restoration site visuals
- Path rendering

### I'll provide both - choose based on your timeline

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: Core Map (TODAY)
**What:** Clickable zones with tooltips and context menu
**Time:** 1-2 hours
**Files:** 1 scene, 0 scripts (reuse existing 4)

### Phase 2: Visuals (THIS WEEK)
**What:** Biome blending, elevation, restoration visuals
**Time:** 3-4 hours
**Files:** Several shader files, updated scene

### Phase 3: Advanced (NEXT WEEK)
**What:** Zoom levels, fog of war, faction layers
**Time:** 5-8 hours
**Files:** New scripts for each feature

---

## 📋 SCENE STRUCTURE (TO BUILD NEXT)

Your map will be added as a new scene: `MapScreen.tscn`

It will be opened via:
```
SceneRouter.open_screen("res://scenes/ui/MapScreen.tscn")
```

And closed via context menu or ESC key.

**Complete Scene Hierarchy:**

```
MapScreen (Control) [NEW - needs creation]
├── MapContainer (Node2D)
│   ├── TerrainLayer (CanvasLayer)
│   │   ├── Zone1_Terrain (Sprite2D)
│   │   ├── Zone2_Terrain (Sprite2D)
│   │   └── ... [one per zone]
│   │
│   ├── DetailLayer (CanvasLayer)
│   │   ├── LandmarkIcons (Node2D)
│   │   │   ├── landmark_forge (TextureButton + Label)
│   │   │   └── ... [one per landmark]
│   │   │
│   │   └── PathLines (Node2D)
│   │       ├── path_greenwood_wooded (Line2D)
│   │       ├── path_greenwood_caverns (Line2D)
│   │       └── ... [one per path]
│   │
│   ├── InteractiveLayer (CanvasLayer)
│   │   ├── greenwood_clearing (Area2D) [Clickable region]
│   │   ├── wooded_trail (Area2D)
│   │   └── ... [one per zone]
│   │
│   ├── EventLayer (CanvasLayer)
│   │   └── [Raid icons, seasonal overlays - empty for MVP]
│   │
│   ├── RestorationLayer (CanvasLayer)
│   │   ├── restoration_site_01 (Sprite2D + Glow2D)
│   │   └── ... [one per restoration site]
│   │
│   ├── CreatHeatmap (CanvasLayer) [Hidden until toggled]
│   │   └── HeatmapOverlay (Sprite2D)
│   │
│   └── FactionLayer (CanvasLayer) [Hidden until toggled]
│       └── FactionControl (Polygon2D)
│
├── TooltipPanel (PanelContainer) [Shows on hover]
│   ├── PanelStyleBox
│   └── TooltipLabel (Label)
│
├── ContextMenu (PopupMenu) [Shows on right-click]
│   [Auto-populated by InteractionHandler]
│
├── WaypointMarkers (Node2D) [Stores player markers]
│   └── [Dynamically created on "Set Waypoint" action]
│
├── MapManager (Node) [Attach map_manager.gd script]
├── LayerController (Node) [Attach layer_controller.gd script]
├── ZoneDataManager (Node) [Attach zone_data_manager.gd script]
└── InteractionHandler (Node) [Attach interaction_handler.gd script]
```

---

## 🛠️ HOW TO BUILD THIS SCENE

### Step 1: Create Root Node
1. Create new scene
2. Root: `Control` node named "MapScreen"
3. Save as: `res://scenes/ui/MapScreen.tscn`

### Step 2: Add Container
1. Add child: `Node2D` named "MapContainer"
2. Scale it up so map has room

### Step 3: Add Layers
1. Add 7 children to MapContainer, all `CanvasLayer`:
   - TerrainLayer
   - DetailLayer
   - InteractiveLayer
   - EventLayer
   - RestorationLayer
   - CreatHeatmap (set visible = false)
   - FactionLayer (set visible = false)

### Step 4: Add UI Panels
1. Add child: `PanelContainer` named "TooltipPanel"
   - Add child Label named "TooltipLabel"
   - Set initial visible = false
2. Add child: `PopupMenu` named "ContextMenu"

### Step 5: Add Waypoints Container
1. Add child: `Node2D` named "WaypointMarkers"

### Step 6: Add System Nodes
1. Add child: `Node` named "MapManager"
   - Attach script: `scripts/ui/map_manager.gd`
2. Add child to MapManager: `Node` named "ZoneDataManager"
   - Attach script: `scripts/ui/zone_data_manager.gd`
3. Add child to MapManager: `Node` named "LayerController"
   - Attach script: `scripts/ui/layer_controller.gd`
4. Add sibling to MapManager: `Node` named "InteractionHandler"
   - Attach script: `scripts/ui/interaction_handler.gd`

### Step 7: Add Zones (Visual)
For each zone in `data/zones.json`:
1. Go to TerrainLayer
2. Add child: `Sprite2D` named after zone (e.g., "greenwood_clearing")
   - Position: from zones.json ["position"]
   - Texture: Colored circle or sprite
   - Color: based on biome type

### Step 8: Add Interactive Regions
For each zone:
1. Go to InteractiveLayer
2. Add child: `Area2D` named after zone
3. Add child to Area2D: `CollisionShape2D`
   - Shape: CircleShape2D (50px radius for MVP)
   - Position: same as terrain sprite

### Step 9: Add Landmarks
For each landmark in zones.json:
1. Go to DetailLayer → LandmarkIcons
2. Add child: `TextureButton` named after landmark
   - Icon: from zones.json (or placeholder)
   - Position: zone_position + position_offset
3. Add child to TextureButton: `Label`
   - Text: landmark name (hidden until discovered)

### Step 10: Add Paths
For each path in zones.json:
1. Go to DetailLayer → PathLines
2. Add child: `Line2D` named after path
   - Points: [from_zone_pos, to_zone_pos]
   - Width: traffic_intensity × 2 (so busy paths are thicker)
   - Color: based on terrain_type

### Step 11: Add Restoration Sites
For each zone with restoration_sites > 0:
1. Go to RestorationLayer
2. Add child: `Sprite2D` named "restoration_site_XX"
   - Use restoration icon
   - Position: zone_position + offset
3. Add child: `Sprite2D` (glow effect, optional)

---

## ⚡ SIMPLIFIED MVP VERSION (FAST OPTION)

If you want map working TODAY, use this minimal structure:

```
MapScreen (Control)
├── MapContainer (Node2D)
│   └── DetailLayer (CanvasLayer)
│       ├── ZoneVisuals (Node2D)
│       │   ├── Sprite2D (greenwood)
│       │   ├── Sprite2D (wooded_trail)
│       │   └── Sprite2D (others)
│       │
│       └── ClickableZones (Node2D)
│           ├── Area2D (greenwood) + CollisionShape2D
│           ├── Area2D (wooded_trail) + CollisionShape2D
│           └── Area2D (others)
│
├── TooltipPanel (PanelContainer)
├── ContextMenu (PopupMenu)
├── MapManager (Node with map_manager.gd)
├── InteractionHandler (Node with interaction_handler.gd)
└── ZoneDataManager (Node with zone_data_manager.gd)
```

This skips: terrain shading, restoration glows, paths, heatmap, faction layer.
Time to implement: 1 hour.

---

## 🎬 QUICK TEST AFTER BUILDING SCENE

```gdscript
# In Boot.gd, add this line after systems initialize:
SceneRouter.open_screen("res://scenes/ui/MapScreen.tscn")

# Run the game, you should see:
# ✓ Colored circles representing zones
# ✓ Ability to click zones
# ✓ Tooltip appears on hover
# ✓ Context menu appears on click
```

---

## 💾 INTEGRATION WITH YOUR GAME

### Opening the Map
Add to any script:
```gdscript
SceneRouter.open_screen("res://scenes/ui/MapScreen.tscn")
```

### Fast Travel (from map)
When player clicks "Fast Travel" in context menu:
```gdscript
# InteractionHandler emits fast_travel_requested signal
# Connect it to SceneRouter:
SceneRouter.go_to_zone("res://scenes/world/%s.tscn" % zone_id)
```

### Setting Waypoints
When player clicks "Set Waypoint":
```gdscript
# MapManager.place_waypoint() is called
# Waypoint marker appears on map
# In-game HUD can show direction to nearest waypoint
```

### Discovering Zones
When player enters a zone:
```gdscript
# In zone script _ready():
MapManager.discover_zone("zone_id")
# Or:
EventBus.zone_changed.emit("zone_id")
```

---

## 🧪 TESTING CHECKLIST

After you build the scene, test:

- [ ] Map opens without errors
- [ ] All zones are visible as circles
- [ ] Hovering over zone shows tooltip
- [ ] Clicking zone shows context menu
- [ ] "Fast Travel" closes map and loads zone
- [ ] "Set Waypoint" creates marker
- [ ] Clicking same zone again removes waypoint
- [ ] Zoom in/out works (if implemented)
- [ ] Map persists discovery state (zones stay discovered after reload)

---

## 📊 DATA VALIDATION

Before running, verify:
1. All zones in zones.json have unique IDs ✓
2. All positions are Vector2 arrays [x, y] ✓
3. All landmarks reference existing zones ✓
4. All paths reference existing zones ✓
5. No missing commas or quotes in JSON ✓

**Current status:** zones.json is valid and ready to use ✓

---

## 🎨 VISUAL CUSTOMIZATION

### Zone Appearance
Edit per-zone in zones.json:
```json
"biome": "forest",           // Changes color/style
"elevation": 0.5,           // Light=high, Dark=low
```

### Landmark Icons
Add custom icons to `assets/ui/landmark_*.png`
Reference in zones.json:
```json
"icon": "res://assets/ui/landmark_forge.png"
```

### Path Styling
Customize Line2D per path:
- Width: `traffic_intensity × 2`
- Color: based on `terrain_type`
- Pattern: dash for dangerous, solid for safe

---

## ⚙️ TUNING AFTER MVP

Once MVP works, these are easy upgrades:

1. **Biome Blending** (add gradient masks)
2. **Elevation Shading** (add tint based on elevation)
3. **Restoration Glows** (add Glow2D nodes)
4. **Zoom Levels** (modify LayerController)
5. **Fog of War** (toggle zone visibility)
6. **Traffic Lines** (animate path width/opacity)

All 4 scripts are modular and won't need major changes.

---

## 🚀 READY TO BUILD?

**Next step:** Create `MapScreen.tscn` following the scene structure above.

**Time estimate:**
- MVP (bare bones): 1 hour
- Full featured: 3-4 hours

**Questions?** Check MAPSPEC.md for design details or existing game code for integration patterns.

---

## FILES REFERENCE

**You have:**
- ✅ MAPSPEC.md (design spec)
- ✅ map_manager.gd (core system)
- ✅ layer_controller.gd (layer visibility)
- ✅ zone_data_manager.gd (data loading)
- ✅ interaction_handler.gd (click/hover)
- ✅ zones.json (zone data)
- ✅ Updated GameState with discovery tracking

**You need to create:**
- 📝 MapScreen.tscn (new scene)
- 📝 Update Boot.gd to open map (1 line)

That's it! Everything else is already done.
