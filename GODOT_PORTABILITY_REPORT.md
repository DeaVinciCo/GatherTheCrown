# Godot Portability Report — Gather The Crown: Creats & Foes
**Created by Dea Vinci Co.**

This document maps all code from the TypeScript monorepo, Phaser client, and Python prototype to equivalent Godot 4 patterns (GDScript or C#). Ranked by importance.

---

## 1. Combat System — `packages/server/src/sim/combat.ts` ★★★★★

**What it does:** Elemental weakness chart, crit rolls, status effects (burn/freeze/stun/silence/confuse), damage variance.

**Port to Godot as:** `res://systems/CombatResolver.gd`

```gdscript
# CombatResolver.gd
const ELEMENT_COUNTERS := {
    "Fire":   "Frost",
    "Frost":  "Fire",
    "Storm":  "Earth",
    "Shadow": "Light",
    "Light":  "Shadow",
}

const STATUS_FROM_COUNTER := {
    "Fire":   "burn",
    "Frost":  "freeze",
    "Storm":  "stun",
    "Shadow": "confuse",
    "Light":  "silence",
}

func resolve(base: int, attacker_element: String, defender_element: String, crit_chance: float = 0.1) -> Dictionary:
    var dmg := float(base)
    var counter := ELEMENT_COUNTERS.get(attacker_element, "")
    var status := ""
    if counter == defender_element:
        dmg *= 1.25
        status = STATUS_FROM_COUNTER.get(attacker_element, "")
    elif ELEMENT_COUNTERS.get(defender_element, "") == attacker_element:
        dmg *= 0.85
    var is_crit := randf() < crit_chance
    if is_crit:
        dmg *= 1.5
    dmg += randi() % 6  # 0–5 variance
    return { "damage": int(dmg), "crit": is_crit, "status": status }
```

---

## 2. Boss Tier & Phase System — `packages/server/src/sim/boss.ts` ★★★★★

**What it does:** 5 tiers (HP multipliers 1×–4×), phase transitions at HP thresholds, enrage on tier 4+ phase 3, elemental weakness triggers, raid scaling for tier 5.

**Port to Godot as:** `res://systems/BossEncounter.gd`

```gdscript
# BossEncounter.gd
const TIER_CONFIG := {
    1: { "hp_mult": 1.0,   "phases": 1, "enrage": false },
    2: { "hp_mult": 1.5,   "phases": 2, "enrage": false },
    3: { "hp_mult": 2.25,  "phases": 2, "enrage": false },
    4: { "hp_mult": 3.0,   "phases": 3, "enrage": true  },
    5: { "hp_mult": 4.0,   "phases": 3, "enrage": true  },
}

signal phase_changed(new_phase: int)
signal boss_enraged()
signal boss_defeated()

var tier: int
var current_hp: int
var max_hp: int
var current_phase := 1

func setup(base_hp: int, boss_tier: int, player_count: int = 1):
    tier = boss_tier
    var cfg = TIER_CONFIG[tier]
    var scale := 1.0
    if tier == 5:
        scale = max(1.0, player_count * 0.35)
    max_hp = int(base_hp * cfg["hp_mult"] * scale)
    current_hp = max_hp

func take_damage(amount: int) -> void:
    current_hp = max(0, current_hp - amount)
    _check_phase()
    if current_hp == 0:
        emit_signal("boss_defeated")

func _check_phase() -> void:
    var cfg = TIER_CONFIG[tier]
    var total_phases: int = cfg["phases"]
    var hp_pct := float(current_hp) / float(max_hp)
    var new_phase := 1
    if total_phases >= 3 and hp_pct <= 0.25:
        new_phase = 3
    elif total_phases >= 2 and hp_pct <= 0.60:
        new_phase = 2
    if new_phase > current_phase:
        current_phase = new_phase
        emit_signal("phase_changed", current_phase)
        if cfg["enrage"] and current_phase == 3:
            emit_signal("boss_enraged")
```

---

## 3. Crown Puzzle & Shatter System — `packages/server/src/sim/crown.ts` ★★★★★

**What it does:** Mode-specific slot requirements, wrong pieces rejected, durability loss, shatter at 0 durability (permanent unusable + 8-second pulse flash).

**Port to Godot as:** `res://systems/CrownPuzzle.gd`

```gdscript
# CrownPuzzle.gd
signal crown_completed()
signal crown_shattered(pulse_seconds: float)

const MODE_SLOTS := {
    "story":          ["Starforged", "Painite", "Core"],
    "melee":          ["Starforged", "Rubite", "Core"],
    "racing":         ["Starforged", "Fordite", "Core"],
    "pve_dungeon":    ["Starforged", "Sugilite", "Core"],
    "pvp_competitive":["Starforged", "Tanzanite", "Core"],
    "meta":           ["Starforged", "Jeremejevite", "Core"],
}

var mode: String
var durability: int
var max_durability: int
var slots := {}   # { slot_id: String → piece_id: String|null }
var shattered := false

func setup(crown_mode: String, max_dur: int = 100) -> void:
    mode = crown_mode
    max_durability = max_dur
    durability = max_dur
    slots.clear()
    for s in MODE_SLOTS.get(mode, []):
        slots[s] = null

func insert_piece(slot_id: String, piece_id: String) -> bool:
    if shattered or slot_id not in slots:
        return false
    var required_piece := slot_id  # slot name = required piece type
    if piece_id != required_piece:
        return false
    slots[slot_id] = piece_id
    if slots.values().all(func(v): return v != null):
        emit_signal("crown_completed")
    return true

func apply_durability_loss(amount: int) -> void:
    if shattered:
        return
    durability = max(0, durability - amount)
    if durability == 0:
        shattered = true
        for s in slots:
            slots[s] = null
        emit_signal("crown_shattered", 8.0)
```

---

## 4. Enemy AI State Machine — `packages/server/src/sim/ai.ts` ★★★★

**What it does:** Retreat when HP < 20, attack when distance < 2, chase when distance < 50, else idle.

**Port to Godot as:** `res://ai/EnemyAI.gd` (or an `@export` param in enemy scene)

```gdscript
# EnemyAI.gd
enum State { IDLE, CHASE, ATTACK, RETREAT }

func get_state(hp: int, distance: float) -> State:
    if hp < 20:
        return State.RETREAT
    if distance < 2.0:
        return State.ATTACK
    if distance < 50.0:
        return State.CHASE
    return State.IDLE
```

---

## 5. Weather & Day/Night System — `packages/client/src/environment/Weather.ts` ★★★★

**What it does:** Particle rain/snow, lightning flash overlay, day/night alpha overlay cycling. Used live in District01 scene.

**Port to Godot as:** `res://systems/WeatherManager.gd` + child nodes:
- `CPUParticles2D` (rain / snow)
- `ColorRect` (lightning flash, `modulate.a` tween)
- `CanvasModulate` or `WorldEnvironment` (day/night tint)

```gdscript
# WeatherManager.gd
@onready var rain_particles: CPUParticles2D = $RainParticles
@onready var snow_particles: CPUParticles2D = $SnowParticles
@onready var lightning_overlay: ColorRect = $LightningOverlay
@onready var day_night_overlay: ColorRect = $DayNightOverlay

func set_condition(condition: String) -> void:
    rain_particles.emitting = false
    snow_particles.emitting = false
    match condition:
        "rain":  rain_particles.emitting = true
        "snow":  snow_particles.emitting = true
        "lightning": _schedule_lightning()

func _schedule_lightning() -> void:
    await get_tree().create_timer(randf_range(2.0, 5.0)).timeout
    var tween := create_tween()
    tween.tween_property(lightning_overlay, "modulate:a", 1.0, 0.05)
    tween.tween_property(lightning_overlay, "modulate:a", 0.0, 0.2)
    _schedule_lightning()

func set_time_of_day(progress: float) -> void:
    # progress 0 = day, 1 = night
    day_night_overlay.modulate.a = clampf(0.6 * progress, 0.0, 0.6)
```

---

## 6. Cutscene Player — `packages/client/src/cutscenes/CutscenePlayer.ts` ★★★★

**What it does:** Sequential step-by-step text cutscene, auto-advance after duration.

**Port to Godot as:** `res://ui/CutscenePlayer.gd`

```gdscript
# CutscenePlayer.gd
signal cutscene_finished()

@onready var label: Label = $Label

func play(steps: Array[Dictionary]) -> void:
    for step in steps:
        match step.get("type", ""):
            "text":
                label.text = step["text"]
                label.visible = true
                await get_tree().create_timer(step.get("duration", 2.0)).timeout
                label.visible = false
    emit_signal("cutscene_finished")
```

---

## 7. Hero Movement — `packages/client/src/actors/HeroSprite.ts` ★★★★

**What it does:** WASD + arrow key movement at 200 px/s, walk animation.

**Port to Godot as:** `res://actors/HeroBody.gd` on a `CharacterBody2D`

```gdscript
# HeroBody.gd
extends CharacterBody2D

const SPEED := 200.0

func _physics_process(delta: float) -> void:
    var dir := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
    velocity = dir * SPEED
    move_and_slide()
    $AnimatedSprite2D.play("walk" if dir != Vector2.ZERO else "idle")
```

---

## 8. Economy / Drop Rates — `packages/server/src/sim/economy.ts` ★★★

**What it does:** `rollDrop(rarity)` with weighted random, `calculateReward(base, mult)`, inflation.

**Port to Godot as:** `res://systems/Economy.gd`

```gdscript
# Economy.gd
const DROP_RATES := { "COMMON": 0.60, "UNCOMMON": 0.25, "RARE": 0.10, "EPIC": 0.04, "LEGENDARY": 0.01 }

func roll_drop(rarity: String) -> bool:
    return randf() < DROP_RATES.get(rarity, 0.0)

func calculate_reward(base: int, multiplier: float) -> int:
    return int(base * multiplier)
```

---

## 9. Creat Bond & Evolution — `prototypes/src/core/Creat.ts` ★★★

**What it does:** Bond activities (battle/feed/groom/play), milestone unlocks at 25/50/75/100%, gated evolution by level + bond + inventory.

**Port to Godot as:** `res://entities/Creat.gd`

```gdscript
# Creat.gd (key sections)
const BOND_MILESTONES := {
    25: "name_unlocked",
    50: "combo_attacks",
    75: "auto_block_once",
    100: "perfect_bond",
}

const ACTIVITY_BOND_GAIN := {
    "battle": 3, "feed": 2, "groom": 1, "play": 2
}

func apply_bond_activity(activity: String) -> void:
    bond = min(100, bond + ACTIVITY_BOND_GAIN.get(activity, 0))

func can_evolve(inventory: Dictionary) -> bool:
    match stage:
        "hatchling":
            return level >= 11 and bond >= 40 \
                and inventory.get("fruits", 0) >= 10 \
                and inventory.get("gc", 0) >= 500
        "juvenile":
            return level >= 26 and bond >= 70 \
                and inventory.get("crystals", 0) >= 5 \
                and inventory.get("gc", 0) >= 5000
        "adult":
            return level >= 46 and bond >= 95 \
                and inventory.get("primalEssence", 0) >= 1 \
                and inventory.get("gc", 0) >= 50000
    return false
```

---

## 10. Crafting Recipes — `packages/server/src/sim/crafting.ts` ★★★

**Port to Godot as:** Godot `Resource` files (`.tres`) or a JSON loaded at startup:

```gdscript
# CraftingRecipes.gd (autoload)
const RECIPES := {
    "crown": { "metal": 5, "gem": 1, "shards": 0, "durability": 100 },
    "sword": { "metal": 20, "shards": 2, "durability": 80 },
}
```

---

## 11. Python Prototype — `prototype/*.py` ★★★

The Python prototype (`player.py`, `enemy.py`, `creat.py`, `crown.py`, `game.py`) uses class/method patterns that are the **closest syntactically** to GDScript. If starting a Godot build, the Python prototype is the fastest-to-port layer.

Key mappings:
| Python | GDScript Equivalent |
|---|---|
| `pygame.sprite.Sprite` | `CharacterBody2D` / `Node2D` |
| `self.rect.x += dx` | `position.x += dx` |
| `pygame.draw.rect(...)` | `draw_rect(...)` in `_draw()` |
| `clock.tick(60)` | `Engine.max_fps = 60` |
| `screen.blit(image, pos)` | `draw_texture(...)` |

---

## Summary Table

| System | Source File | Godot Node Type | Priority |
|---|---|---|---|
| Combat resolver | `sim/combat.ts` | Autoload `CombatResolver.gd` | 🔴 Critical |
| Boss tier/phase | `sim/boss.ts` | `Node` + signals | 🔴 Critical |
| Crown puzzle/shatter | `sim/crown.ts` | `Node` + signals | 🔴 Critical |
| Enemy AI | `sim/ai.ts` | Script on `CharacterBody2D` | 🟠 High |
| Weather + day/night | `environment/Weather.ts` | `CPUParticles2D` + `CanvasModulate` | 🟠 High |
| Cutscene player | `cutscenes/CutscenePlayer.ts` | `CanvasLayer` UI + timer | 🟠 High |
| Hero movement | `actors/HeroSprite.ts` | `CharacterBody2D` | 🟠 High |
| Economy/drops | `sim/economy.ts` | Autoload `Economy.gd` | 🟡 Medium |
| Creat bond/evolution | `prototypes/src/core/Creat.ts` | `Resource` or `Node` | 🟡 Medium |
| Crafting recipes | `sim/crafting.ts` | `.tres` resources or JSON | 🟡 Medium |
| Python prototype | `prototype/*.py` | Direct GDScript port | 🟡 Medium |

---

*Dea Vinci Co. — Gather The Crown: Creats & Foes*
