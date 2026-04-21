# GATHER THE CROWN — MAP SYSTEM (IMPLEMENTATION SPEC)

## ✔ WHAT'S STRONG (KEEP THESE)

### 1. Clickable World Integration
- **Why It Matters:** Players interact with the world, not UI. This is AAA-level thinking.
- **Keep:** All geography is interactive. No separate "map screen" — the world IS the map.
- **Already Right:** Context menu structure is perfect.

### 2. Layer-Based Architecture
- **Why It Matters:** Scales cleanly to multiplayer, seasonal changes, expansions.
- **Keep:** 7-layer system (terrain → detail → interactive → event → restoration → heatmap → faction).
- **Already Right:** Each layer toggles independently.

### 3. Restoration as Integrated Mechanic
- **Why It Matters:** Most games separate map from progression. You baked progression into visuals.
- **Keep:** Restoration state visible on map → reinforces long-term value.
- **Already Right:** Players see "restored = resource income" directly.

---

## ⚙️ IMPLEMENTATION PRIORITIES (Do This Order)

### PHASE 1: Core Map Foundation
1. **MapManager (Godot Script)**
   - Loads zone data
   - Manages layer visibility
   - Handles click detection
   - Emits zone selection events

2. **LayerController (Godot Script)**
   - Controls visibility of each layer
   - Handles transitions between zoom levels
   - Manages layer animations

3. **Location Data (JSON)**
   - Zone definitions (position, type, level, status)
   - Landmark definitions (icons, positions, discovery state)
   - Creat density data

### PHASE 2: Interaction System
1. **Clickable Region System**
   - Define clickable areas per zone
   - Detect hover state
   - Emit click events

2. **Tooltip System**
   - Show on hover: name, level, status
   - Hidden until discovered

3. **Context Menu**
   - Fast travel (if unlocked)
   - Set waypoint
   - Info panel
   - Active events

### PHASE 3: Visual Polish
1. **Biome Blending (Gradient Masks)**
   - Smooth transitions between terrain
   - Color bleeding between zones

2. **Elevation Shading**
   - Light = higher
   - Dark = lower
   - Subtle contour lines

3. **Discovery States**
   - Unknown: silhouette only
   - Discovered: icon + label
   - Completed: glow + faction color

### PHASE 4: Waypoint & Advanced Features
1. **Waypoint System**
   - Player-placed markers
   - Persist until removed
   - Show in-world direction indicator

2. **Zoom Levels (3 tiers)**
   - World View: kingdoms
   - Region View: zones + landmarks
   - Local View: paths + resources

3. **Fog of War / Discovery**
   - Hidden areas revealed on discovery
   - Track visited zones

---

## 🧩 MISSING PIECES (ONLY ESSENTIAL)

### A. Waypoint System (NEEDED)
```
Player places marker on map
Marker shows direction to nearest waypoint (compass/arrow)
Can remove marker from same context menu
Data persists in SaveManager
```

### B. Discovery States (NEEDED)
```
Every location: Unknown → Discovered → Mastered
Unknown: gray silhouette, no label
Discovered: full icon + name
Mastered: gold glow, faction color, resource indicator
```

### C. Zoom Levels (CRITICAL)
```
World View (1000px view):
  - Show kingdoms, major hubs only
  - Hide individual zones

Region View (default, 500px view):
  - Show all zones, landmarks
  - Show major paths

Local View (250px view):
  - Show paths, resource nodes
  - Show enemy density nodes
  - Show detailed terrain
```

### D. Travel Time Calculation (NICE)
```
Calculate based on:
  - distance (pixels → in-world units)
  - terrain difficulty (road vs forest vs mountain)
  - player speed (base, with creat/mount bonuses)
  - weather modifier (for later)

Display in context menu: "Travel Time: 3-5 minutes"
```

### E. Path Indicators with Traffic (UPGRADE)
```
Instead of just glowing paths:
  - Line thickness = traffic intensity
  - Opacity varies with usage frequency
  - Color = primary resource type on path
  - Optional toggle: "Show Recommended Routes"
```

---

## 🏗️ GODOT SCENE STRUCTURE

```
MapScreen (CanvasLayer)
├── MapContainer (Node2D)
│   ├── TerrainLayer (CanvasLayer)
│   │   ├── BiomeBlends (Sprite2D x6)
│   │   └── ElevationShading (Sprite2D)
│   │
│   ├── DetailLayer (CanvasLayer)
│   │   ├── LandmarkIcons (Node2D)
│   │   │   ├── Landmark (TextureButton + Label) x N
│   │   │   └── Landmark (TextureButton + Label) x N
│   │   │
│   │   └── PathLines (Node2D)
│   │       ├── Path (Line2D) x N
│   │       └── Path (Line2D) x N
│   │
│   ├── InteractiveLayer (CanvasLayer)
│   │   ├── ClickableRegion (Area2D) x N
│   │   └── ClickableRegion (Area2D) x N
│   │
│   ├── EventLayer (CanvasLayer)
│   │   ├── ActiveRaid (Sprite2D + Animation)
│   │   └── SeasonalOverlay (Sprite2D)
│   │
│   ├── RestorationLayer (CanvasLayer)
│   │   ├── RestorationSite (Sprite2D + Glow) x N
│   │   └── RestorationSite (Sprite2D + Glow) x N
│   │
│   ├── CreatHeatmap (CanvasLayer) [Hidden by default]
│   │   └── HeatmapGrid (Sprite2D)
│   │
│   └── FactionLayer (CanvasLayer) [Hidden by default]
│       └── FactionControl (Polygon2D) x N
│
├── TooltipPanel (PanelContainer) [Shows on hover]
│   └── TooltipLabel (Label)
│
├── ContextMenu (PopupMenu) [Shows on click]
│   ├── Fast Travel
│   ├── Set Waypoint
│   ├── Information
│   ├── Active Events
│   ├── Resources
│   ├── Quests
│   └── Travel Time
│
├── WaypointMarkers (Node2D) [Player-placed markers]
│   ├── WaypointMarker (Sprite2D + Label) x N
│   └── DirectionArrow (Sprite2D) [Points to nearest waypoint]
│
└── MapManager (Script attached to MapScreen)
    ├── LayerController (Script)
    ├── ZoneDataManager (Script)
    └── InteractionHandler (Script)
```

---

## 📋 CORE SCRIPTS (Pseudocode)

### MapManager.gd
```gdscript
extends Node

# Manages map state, layer visibility, click handling
var current_zoom_level: int = 1  # 0=World, 1=Region, 2=Local
var selected_zone: String = ""
var zones_discovered: Dictionary = {}  # zone_id → bool
var waypoints: Array = []  # Array of Vector2 positions

func _ready():
    load_zone_data("res://data/zones.json")
    update_layer_visibility()

func set_zoom_level(level: int):
    current_zoom_level = level
    update_layer_visibility()

func discover_zone(zone_id: String):
    zones_discovered[zone_id] = true
    update_discovery_visuals(zone_id)

func place_waypoint(position: Vector2):
    waypoints.append(position)
    update_waypoint_visuals()

func get_nearest_waypoint() -> Vector2:
    # Return closest waypoint to player
    pass
```

### LayerController.gd
```gdscript
extends Node

var terrain_layer: CanvasLayer
var detail_layer: CanvasLayer
var interactive_layer: CanvasLayer
var event_layer: CanvasLayer
var restoration_layer: CanvasLayer
var heatmap_layer: CanvasLayer
var faction_layer: CanvasLayer

func update_visibility(zoom_level: int):
    match zoom_level:
        0:  # World View
            show_only(["terrain"])
        1:  # Region View (default)
            show_only(["terrain", "detail", "interactive", "event", "restoration"])
        2:  # Local View
            show_only(["all"])

func toggle_layer(layer_name: String, enabled: bool):
    # Show/hide specific layer
    pass
```

### ZoneDataManager.gd
```gdscript
extends Node

var zones: Dictionary = {}  # zone_id → zone_data
var landmarks: Dictionary = {}  # landmark_id → landmark_data

func load_zone_data(path: String):
    var file = FileAccess.open(path, FileAccess.READ)
    zones = JSON.parse_string(file.get_as_text())

func get_zone(zone_id: String) -> Dictionary:
    return zones.get(zone_id, {})

func get_travel_time(from_zone: String, to_zone: String) -> String:
    # Calculate based on distance + terrain + weather
    var distance = calculate_distance(from_zone, to_zone)
    var terrain_difficulty = get_terrain_difficulty(from_zone, to_zone)
    var time_minutes = (distance / player_speed) * terrain_difficulty
    return "%d-%d minutes" % [time_minutes, time_minutes + 2]
```

### InteractionHandler.gd
```gdscript
extends Node

var context_menu: PopupMenu
var tooltip_panel: PanelContainer

func _input(event: InputEvent):
    if event is InputEventMouseButton:
        if event.pressed:
            var zone = detect_zone_click(event.position)
            if zone:
                show_context_menu(zone, event.position)
        else:
            hide_context_menu()

func show_tooltip(zone_data: Dictionary, position: Vector2):
    tooltip_panel.set_text(zone_data.name)
    tooltip_panel.global_position = position

func show_context_menu(zone_data: Dictionary, position: Vector2):
    context_menu.clear()
    context_menu.add_item("Fast Travel (if unlocked)")
    context_menu.add_item("Set Waypoint")
    context_menu.add_item("Information")
    context_menu.add_item("Active Events")
    context_menu.add_item("Resources")
    context_menu.add_item("Quests")
    context_menu.add_item("Travel Time")
    context_menu.popup_rect = Rect2(position, Vector2(200, 200))
```

---

## 📊 DATA FORMAT (zones.json)

```json
{
  "zones": {
    "greenwood_clearing": {
      "id": "greenwood_clearing",
      "name": "Greenwood Clearing",
      "type": "forest_hub",
      "level_range": [1, 5],
      "position": [640, 360],
      "discovered": true,
      "mastered": false,
      "biome": "forest",
      "elevation": 0.5,
      "restoration_sites": 3,
      "creat_density": {
        "fire": 0.8,
        "water": 0.2,
        "earth": 0.1
      },
      "resources": [
        {"type": "metal_fragment_bronze", "amount": 5, "respawn_days": 1}
      ],
      "active_events": [],
      "travel_times": {
        "wooded_trail": "3-5 minutes",
        "restoration_site_01": "2-3 minutes"
      }
    },
    "wooded_trail": {
      "id": "wooded_trail",
      "name": "Wooded Trail",
      "type": "combat_zone",
      "level_range": [5, 15],
      "position": [1100, 300],
      "discovered": false,
      "mastered": false,
      "biome": "forest",
      "elevation": 0.3,
      "boss": {
        "id": "fire_boss_001",
        "name": "Embercrown Champion",
        "status": "undefeated"
      },
      "creat_density": {
        "fire": 0.9,
        "water": 0.1
      }
    }
  },
  "landmarks": {
    "crown_forge_01": {
      "id": "crown_forge_01",
      "name": "Ancient Crown Forge",
      "type": "npc_hub",
      "zone": "greenwood_clearing",
      "icon": "res://assets/ui/landmark_forge.png",
      "discovered": true,
      "position_offset": [50, 50]
    }
  },
  "paths": [
    {
      "from_zone": "greenwood_clearing",
      "to_zone": "wooded_trail",
      "terrain_type": "forest_road",
      "difficulty": 1.0,
      "traffic_intensity": 0.8
    }
  ]
}
```

---

## ⌨️ INPUT HANDLING (Mouse + Keyboard)

### Current (Mouse-Only)
```
Mouse Move → Show tooltip
Mouse Hover → Highlight zone
Mouse Click → Show context menu
```

### Next (Add Controller Support)
```
DPad: Navigate between zones (snap to nearest)
A Button: Show context menu for current zone
Y Button: Toggle layer visibility
X Button: Set/remove waypoint
Radial Menu: Hold LT for quick actions
```

---

## 🎯 WHAT TO BUILD FIRST (Next Immediate Steps)

### Sprint 1: Core Map (1-2 days)
- [ ] MapManager.gd (basic functionality)
- [ ] zones.json (data structure)
- [ ] Simple terrain layer (single Sprite2D per zone)
- [ ] Clickable regions (Area2D per zone)
- [ ] Tooltip on hover (name, level, status)

### Sprint 2: Interactions (1-2 days)
- [ ] Context menu popup
- [ ] Fast travel trigger
- [ ] Set waypoint logic
- [ ] Waypoint visual indicator

### Sprint 3: Visual Polish (2-3 days)
- [ ] Biome blending (gradient masks)
- [ ] Elevation shading
- [ ] Discovery state visuals
- [ ] Restoration site glows

### Sprint 4: Advanced Features (3-5 days)
- [ ] Zoom levels (3-tier system)
- [ ] Fog of war / discovery
- [ ] Travel time calculation
- [ ] Creat density heatmap (toggleable)

### Sprint 5: Faction System (Future)
- [ ] Faction influence layer
- [ ] Control zones visualization
- [ ] Seasonal shifts

---

## ✅ SUCCESS CRITERIA FOR MVP

**When the map is "done" for MVP:**
- [ ] Player can click zones and see context menu
- [ ] Tooltips show zone info on hover
- [ ] Waypoint system works (set/remove/navigate)
- [ ] Discovery state changes visuals appropriately
- [ ] Travel time calculates and displays
- [ ] At least 5 zones fully connected
- [ ] Restoration sites show income on hover
- [ ] Smooth transitions between zones

**Not needed for MVP (save for later):**
- Fog of war
- Zoom levels
- Faction layers
- Controller support
- Creat heatmap
- Advanced path indicators

---

## 🔗 INTEGRATION POINTS

This map system connects to:
1. **SceneRouter** - Fast travel triggers zone loads
2. **GameState** - Tracks discovered zones, restoration progress
3. **EventBus** - Signals zone selection, waypoint changes
4. **SaveManager** - Persists discovered zones, waypoints, mastery

All connections are already in place from earlier MVP build.
