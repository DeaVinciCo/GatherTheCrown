# ⚔️🏁 Combat & Racing Mechanics - Gather the Crown: Creats & Foes

**System:** Hybrid combat-racing gameplay with Biblical elements  
**Purpose:** Deep, skill-based mechanics for both racing and fighting  
**Created:** February 24, 2026

---

## 🏁 RACING MECHANICS

### Core Movement System

#### Creat-Based Movement
Each creat type has unique movement properties:

**Fire Creats (Lava Hound, Ember Hawk)**
- Base Speed: 180 km/h
- Acceleration: Fast (0-100 in 3s)
- Handling: Medium
- Special: Leave fire trails that damage followers
- Terrain Bonus: +50% speed in lava/fire zones
- Weakness: -30% speed in water/ice zones

**Water Creats (Reef Serpent, Aqua Tortoise)**
- Base Speed: 160 km/h
- Acceleration: Slow (0-100 in 5s)
- Handling: Excellent
- Special: Can swim through water shortcuts
- Terrain Bonus: +50% speed in water/rain
- Weakness: -20% speed in desert/heat

**Air Creats (Sky Strider, Storm Vulture)**
- Base Speed: 200 km/h
- Acceleration: Very Fast (0-100 in 2s)
- Handling: Sensitive
- Special: Can glide over gaps and obstacles
- Terrain Bonus: +30% speed at high altitude
- Weakness: -40% speed in heavy wind/storms

**Earth Creats (Stonehorn, Root Crawler)**
- Base Speed: 140 km/h
- Acceleration: Very Slow (0-100 in 6s)
- Handling: Poor
- Special: Can break through rock walls
- Terrain Bonus: +40% defense, immune to terrain damage
- Weakness: -50% speed on ice/slippery surfaces

---

### Speed Tiers & Physics

```
SPEED TIERS:
┌────────────────────────────────────────┐
│ Tier 1: 0-100 km/h    (Slow)          │
│ - Full control, tight turns            │
│ - Can use all attacks accurately       │
│                                        │
│ Tier 2: 100-200 km/h  (Medium)        │
│ - Good balance of speed and control    │
│ - Standard racing speed                │
│                                        │
│ Tier 3: 200-300 km/h  (Fast)          │
│ - Reduced turning, drift required      │
│ - Attack accuracy decreases            │
│                                        │
│ Tier 4: 300+ km/h     (Max Speed)     │
│ - Minimal control, high risk           │
│ - Attacks very difficult to aim        │
│ - Boost/special ability active         │
└────────────────────────────────────────┘
```

**Physics Properties:**
- **Momentum:** Maintains speed through turns (drift to control)
- **Gravity:** Affects jumps and aerial movement
- **Friction:** Different per terrain type
- **Collision:** Bounce off walls, lose speed on impact
- **Drafting:** Follow behind opponent for +10% speed boost

---

### Boost System

#### Boost Meter
- **Capacity:** 100 points
- **Recharge Rate:** 10 points/second (passive)
- **Boost Cost:** 50 points per activation
- **Duration:** 5 seconds of +100% speed

#### Ways to Gain Boost
1. **Drifting:** +5 points/second while drifting
2. **Tricks:** +20 points per successful trick (jumps, flips)
3. **Perfect Turns:** +10 points for hitting apex
4. **Attacking Enemies:** +15 points per hit
5. **Collecting Boost Pickups:** +50 points instant
6. **Slipstreaming:** +3 points/second while drafting

#### Boost Types
- **Standard Boost:** +100% speed, 5 seconds
- **Mega Boost:** +200% speed, 3 seconds (costs 100 points)
- **Faction Boost:** Unique effect per faction
  - Watchers: +Shield while boosting
  - Sovereigns: +Gold collection radius
  - Purifiers: +Fire trail damage
  - Sanctified: +Healing pulse
  - Anointed: +Blessing aura
  - Penitents: +Stealth (invisible on minimap)

---

### Drift Mechanics

#### Drift Initiation
- **Input:** Brake + Turn (or dedicated drift button)
- **Speed Requirement:** Must be above 80 km/h
- **Angle:** Sharper turn = longer drift

#### Drift Levels
```
LEVEL 1 (Blue Sparks)
- Duration: 1-2 seconds
- Boost Gain: +5 points/sec
- Speed Loss: -10%

LEVEL 2 (Orange Sparks)
- Duration: 2-4 seconds
- Boost Gain: +10 points/sec
- Speed Loss: -5%

LEVEL 3 (Purple Sparks)
- Duration: 4+ seconds
- Boost Gain: +20 points/sec
- Speed Loss: 0% (maintains speed!)
- Bonus: Perfect drift = instant mini-boost
```

#### Drift Combos
- Chain multiple drifts without straightening = multiplier
- x2 combo: 2 drifts in a row
- x3 combo: 3 drifts in a row
- x5 combo: 5+ drifts = "Drift Master" bonus (+100 boost points)

---

### Terrain Interactions

#### Surface Types

**Asphalt/Stone (Standard)**
- Friction: 1.0x (baseline)
- Speed: Normal
- Drift: Easy

**Grass/Dirt**
- Friction: 0.7x (slippery)
- Speed: -20%
- Drift: Harder to control

**Sand**
- Friction: 0.5x (very slippery)
- Speed: -30%
- Drift: Very difficult
- Special: Sand creats immune to penalty

**Ice**
- Friction: 0.3x (extremely slippery)
- Speed: +10% (less friction = faster)
- Drift: Nearly impossible
- Special: Ice creats immune to penalty

**Lava/Fire**
- Friction: 1.0x
- Speed: Normal
- Damage: 10 HP/second (unless fire creat)
- Special: Fire creats gain +50% speed

**Water/Swamp**
- Friction: 0.8x
- Speed: -40% (unless water creat)
- Drift: Sluggish
- Special: Water creats can swim (no penalty)

**Mud**
- Friction: 0.4x
- Speed: -50%
- Drift: Impossible
- Special: Slows all creats except earth types

---

### Obstacles & Hazards

#### Static Obstacles
- **Rocks/Boulders:** Block path, must avoid or destroy
- **Walls:** Bounce off, lose speed
- **Barriers:** Slow down, can be broken with attacks
- **Gates:** Must pass through checkpoints

#### Dynamic Hazards
- **Falling Rocks:** Random spawn, must dodge
- **Lava Bursts:** Erupt from ground, deal damage
- **Lightning Strikes:** Target random racers
- **Sandstorms:** Reduce visibility, slow movement
- **Tornados:** Suck racers off course
- **Ice Spikes:** Pop up from ground, damage tires

#### Environmental Events
- **Earthquake:** Track cracks open, new paths appear
- **Flood:** Water level rises, changes shortcuts
- **Blizzard:** Freezes track, reduces traction
- **Solar Flare:** Disables tech-based attacks temporarily
- **Shadow Rift:** Inverts controls for 5 seconds

---

## ⚔️ COMBAT MECHANICS

### Attack System Overview

#### Attack Categories (Detailed)

**🔺 DAMAGE ATTACKS**
- **Purpose:** Hurt opponents, reduce HP
- **Examples:**
  - Flame Lash: 25 damage, 3-second burn (5 damage/sec)
  - Rock Spike: 40 damage instant, knockback
  - Lightning Bolt: 30 damage, 2-second stun
  - Ice Shard: 20 damage, 4-second slow (-30% speed)

**🌀 UTILITY ATTACKS**
- **Purpose:** Disrupt, distract, steal
- **Examples:**
  - Mirage Field: Create 3 fake copies of yourself
  - Tracker Pulse: Reveal all enemies on minimap for 10s
  - Gold Siphon: Steal 50g from nearest opponent
  - Swap: Teleport positions with target racer

**⚡ SPEED ATTACKS**
- **Purpose:** Boost self, slow others
- **Examples:**
  - Wind Surge: +50% speed for 5 seconds
  - Lightning Glide: Instant teleport 100m forward
  - Time Warp: Slow all opponents by 50% for 3s
  - Dash Strike: Quick burst forward, damage on contact

**🛡️ DEFENSE ATTACKS**
- **Purpose:** Protect, heal, block
- **Examples:**
  - Stone Shell: +50% defense for 8 seconds
  - Life Vine: Heal 30 HP over 6 seconds
  - Mirror Shield: Reflect next attack back at attacker
  - Sanctuary: Create safe zone (no damage for 5s)

**💎 ECONOMY ATTACKS**
- **Purpose:** Steal/boost gold and resources
- **Examples:**
  - Gold Magnet: Attract all nearby coins
  - Gem Drain: Steal 1 gem from opponent
  - Coin Explosion: Drop 100g, opponents must collect
  - Royal Tax: Take 10% gold from all racers

**🧩 TERRAIN ATTACKS**
- **Purpose:** Create hazards, change environment
- **Examples:**
  - Quake Fissure: Crack opens in track behind you
  - Ice Wall: Block path with ice barrier
  - Fire Zone: Create burning area (10 damage/sec)
  - Vine Trap: Roots grab opponents, hold for 3s

---

### Attack Properties (Detailed)

#### Targeting Systems

**Auto-Target (Homing)**
- Locks onto nearest enemy
- Tracks movement
- Can be dodged with sharp turns
- Examples: Lightning Bolt, Ice Shard

**Skillshot (Manual Aim)**
- Player aims direction
- Requires prediction
- Higher damage if hit
- Examples: Rock Spike, Flame Lash

**AOE (Area of Effect)**
- Affects all in radius
- No aiming required
- Lower damage per target
- Examples: Quake Fissure, Fire Zone

**Self-Buff**
- Only affects caster
- Instant activation
- No targeting needed
- Examples: Wind Surge, Stone Shell

**Trap/Placed**
- Drops at location
- Triggers when enemy enters
- Can be avoided if seen
- Examples: Vine Trap, Ice Wall

---

#### Attack Stats Template

```
ATTACK NAME: Flame Lash
├─ Category: Damage
├─ Element: Fire
├─ Damage: 25 (initial) + 15 (burn over 3s)
├─ Range: 50 meters
├─ Targeting: Skillshot (manual aim)
├─ Uses: 5 per pickup
├─ Cooldown: 3 seconds between uses
├─ Mana Cost: 20 stamina
├─ Speed: Projectile travels at 100 km/h
├─ Counter: Water attacks, dodge roll
├─ Faction Bonus: Purifiers +20% damage
└─ Unlock: Found in Pyrrathia vault
```

---

### Combat Flow

#### Engagement Sequence

**1. APPROACH PHASE**
- Spot enemy on minimap or ahead
- Select appropriate attack from wheel
- Position for optimal angle

**2. ATTACK PHASE**
- Activate attack (button press or tap)
- Aim if skillshot (mouse/stick/swipe)
- Attack launches with visual effect

**3. IMPACT PHASE**
- Hit: Damage numbers appear, enemy reacts
- Miss: Attack dissipates or leaves residue
- Counter: Enemy blocks/dodges, attack fails

**4. FOLLOW-UP PHASE**
- Pursue if enemy slowed/damaged
- Retreat if low HP
- Switch to defensive attack if needed

---

### Combo System

#### Attack Chains
Certain attacks combo together for bonus effects:

**Fire + Wind = Inferno Tornado**
- Use Flame Lash, then Wind Surge within 2 seconds
- Creates spinning fire vortex
- 50 damage + knockback
- Lasts 5 seconds

**Ice + Water = Frozen Flood**
- Use Ice Spike, then Water Blast
- Freezes large area of track
- Opponents slip and crash
- Lasts 8 seconds

**Earth + Lightning = Magnetic Quake**
- Use Rock Spike, then Lightning Bolt
- Electrified rocks pull enemies in
- 40 damage + stun
- Lasts 4 seconds

**Light + Shadow = Eclipse Burst**
- Use Light Beam, then Shadow Veil
- Blinds all enemies on screen
- No damage, but 5-second blindness
- Rare combo, high skill

---

### Defense & Evasion

#### Dodge Mechanics

**Dodge Roll**
- Input: Double-tap direction or dedicated button
- Effect: 0.5-second invincibility
- Cooldown: 5 seconds
- Stamina Cost: 1 bolt
- Visual: Character glows briefly

**Shield Block**
- Input: Hold block button
- Effect: Reduce damage by 50%
- Duration: As long as button held
- Stamina Drain: 1 bolt per second
- Weakness: Can't attack while blocking

**Creat Ability (Defensive)**
- Each creat has unique defensive move
- Fire: Flame Shield (burn attackers)
- Water: Bubble Shield (absorb 1 hit)
- Air: Wind Dodge (auto-dodge next attack)
- Earth: Stone Skin (+100% defense for 3s)

---

### Damage Calculation

```
FORMULA:
Total Damage = (Base Attack DMG × Attacker's Power Stat × Crit Multiplier × Element Bonus) - (Defender's Defense Stat × Armor Value)

EXAMPLE:
Flame Lash (25 base) × 1.2 (power) × 2.0 (crit) × 1.5 (fire vs ice) = 90 damage
Minus: Defender Defense (50) × Armor (0.8) = 40 reduction
FINAL DAMAGE: 50 HP lost
```

**Damage Types:**
- **Physical:** Reduced by armor
- **Elemental:** Reduced by resistance
- **True:** Ignores all defense (rare)
- **DOT (Damage Over Time):** Ticks every second

**Critical Hits:**
- **Chance:** 10% base (increases with stats)
- **Multiplier:** 2x damage
- **Visual:** Yellow damage numbers, screen flash
- **Sound:** Distinct "critical" sound effect

---

### Status Effects

#### Buffs (Positive)

**Haste**
- +30% speed
- Duration: 5-10 seconds
- Source: Speed attacks, pickups

**Fortify**
- +50% defense
- Duration: 8 seconds
- Source: Defense attacks, faction abilities

**Regeneration**
- +5 HP/second
- Duration: 10 seconds
- Source: Healing attacks, rest zones

**Blessed**
- +20% all stats
- Duration: 15 seconds
- Source: Anointed faction ability, temples

**Invisible**
- Hidden from minimap
- Duration: 6 seconds
- Source: Penitent faction ability, stealth attacks

---

#### Debuffs (Negative)

**Burn** 🔥
- 5 damage/second
- Duration: 3-5 seconds
- Counter: Water attacks, healing

**Freeze** ❄️
- -50% speed, can't attack
- Duration: 2-4 seconds
- Counter: Fire attacks, button mash

**Poison** ☠️
- 3 damage/second, -20% healing
- Duration: 8 seconds
- Counter: Antidote potion, cleanse

**Stun** ⚡
- Can't move or attack
- Duration: 1-3 seconds
- Counter: None (must wait it out)

**Slow** 🌀
- -30% speed
- Duration: 4-6 seconds
- Counter: Speed boost, cleanse

**Blind** ☀️
- Screen darkens, can't see far
- Duration: 3-5 seconds
- Counter: Light attacks, wait

**Curse** 🌑
- -20% all stats, attracts enemies
- Duration: 10 seconds
- Counter: Blessing, temple visit

**Confusion** 💫
- Controls reversed
- Duration: 3 seconds
- Counter: None (adapt quickly!)

---

## 🎯 SKILL-BASED MECHANICS

### Perfect Timing Windows

#### Perfect Start
- **Window:** 0.2 seconds when race countdown hits "GO!"
- **Input:** Accelerate at exact moment
- **Reward:** Instant boost, +50 boost meter
- **Visual:** Green flash, tire smoke

#### Perfect Drift Exit
- **Window:** 0.3 seconds when exiting drift
- **Input:** Release drift at optimal angle
- **Reward:** Mini-boost, +20 boost meter
- **Visual:** Purple sparks, speed lines

#### Perfect Attack Timing
- **Window:** 0.5 seconds when enemy is vulnerable
- **Input:** Attack right after enemy uses ability
- **Reward:** +50% damage, guaranteed crit
- **Visual:** Slow-motion effect, red flash

#### Perfect Block
- **Window:** 0.4 seconds before attack hits
- **Input:** Block at last moment
- **Reward:** Reflect attack, no damage taken
- **Visual:** Shield flash, attack bounces back

---

### Advanced Techniques

#### Wave Dashing
- Rapidly chain mini-boosts by perfect drift exits
- Requires: High skill, precise timing
- Benefit: Maintain max speed through turns
- Risk: One mistake = crash

#### Attack Canceling
- Cancel attack animation with dodge
- Requires: Quick reflexes
- Benefit: Fake out opponents, bait dodges
- Risk: Waste attack use

#### Slipstream Slingshot
- Draft behind opponent, then boost at last second
- Requires: Patience, timing
- Benefit: Overtake with massive speed advantage
- Risk: Opponent can block or attack

#### Terrain Bouncing
- Use walls/obstacles to redirect momentum
- Requires: Map knowledge, angle calculation
- Benefit: Take shortcuts, surprise opponents
- Risk: Lose speed if angle wrong

---

## 🏆 RACE MODES & WIN CONDITIONS

### Standard Race
- **Objective:** Cross finish line first
- **Laps:** 3 (adjustable)
- **Players:** 4-16
- **Combat:** Allowed
- **Rewards:** Gold, XP, items based on placement

### Time Trial
- **Objective:** Beat target time
- **Laps:** 1-3
- **Players:** Solo
- **Combat:** None
- **Rewards:** Unlock ghosts, leaderboard rank

### Elimination Race
- **Objective:** Don't be last when timer expires
- **Laps:** Continuous until 1 player left
- **Players:** 8-16
- **Combat:** Heavily encouraged
- **Rewards:** Winner takes all (big payout)

### Collect-a-Thon
- **Objective:** Collect most items (gems, coins, keys)
- **Laps:** 3
- **Players:** 4-12
- **Combat:** Allowed (can steal items)
- **Rewards:** Bonus for each item type collected

### King of the Hill
- **Objective:** Hold "The Crown" longest
- **Laps:** Continuous (10 minutes)
- **Players:** 8-16
- **Combat:** Mandatory (must attack crown holder)
- **Rewards:** Time held = gold multiplier

### Gauntlet Run
- **Objective:** Survive hazard-filled track
- **Laps:** 1 (long track)
- **Players:** 4-8
- **Combat:** Environmental hazards only
- **Rewards:** Completion bonus, rare items

---

## 🎮 CONTROL SCHEMES

### Keyboard + Mouse (PC)

```
MOVEMENT:
W - Accelerate
S - Brake/Reverse
A - Turn Left
D - Turn Right
Space - Boost
Shift - Drift

COMBAT:
1-5 - Select Attack Slot
Mouse - Aim Attack (skillshots)
Left Click - Use Selected Attack
Right Click - Block/Defend
Q - Previous Attack
E - Next Attack

CAMERA:
Mouse Move - Free Look
Middle Mouse - Reset Camera
C - Change Camera View

MISC:
Tab - Scoreboard
M - Map
I - Inventory
Esc - Pause Menu
```

### Controller (Console/PC)

```
MOVEMENT:
RT - Accelerate
LT - Brake/Reverse
Left Stick - Steer
A/X - Boost
B/Circle - Drift

COMBAT:
RB/R1 - Next Attack
LB/L1 - Previous Attack
X/Square - Use Attack
Y/Triangle - Block/Defend

CAMERA:
Right Stick - Camera Control
Click Right Stick - Reset Camera
D-Pad Up - Change View

MISC:
Start/Options - Pause
Back/Share - Scoreboard
```

### Mobile Touch

```
MOVEMENT:
Left Side - Virtual Joystick (steer)
Right Side - Accelerate (hold)
Swipe Down - Brake
Double Tap - Boost
Swipe Left/Right - Drift

COMBAT:
Attack Wheel - Tap to select, swipe to cast
Shield Icon - Tap to block
Two-Finger Tap - Quick attack

CAMERA:
Pinch - Zoom
Swipe (empty space) - Rotate camera
```

---

## 📊 PERFORMANCE METRICS

### Tracked Stats (Per Race)

**Speed Stats:**
- Top Speed Reached
- Average Speed
- Time Spent Boosting
- Perfect Drifts Executed

**Combat Stats:**
- Attacks Landed
- Attacks Dodged
- Damage Dealt
- Damage Taken
- Kills/Knockouts

**Economy Stats:**
- Gold Collected
- Items Collected
- Resources Stolen
- Loot Found

**Skill Stats:**
- Perfect Starts
- Perfect Blocks
- Combo Chains
- Tricks Landed

### Post-Race Grades

```
OVERALL GRADE: S, A, B, C, D, F

S Rank Requirements:
- 1st Place
- 0 Deaths
- 90%+ Attack Accuracy
- 5+ Perfect Drifts
- Bonus: Style points

Rewards Scale:
S Rank: 3x gold, 2x XP, guaranteed rare item
A Rank: 2x gold, 1.5x XP, chance for rare
B Rank: 1.5x gold, 1.2x XP
C Rank: 1x gold, 1x XP
D Rank: 0.5x gold, 0.8x XP
F Rank: Minimal rewards
```

---

**This combat and racing system creates deep, skill-based gameplay where mastery of both speed and combat is required to dominate the tracks and vaults of Gather the Crown: Creats & Foes.**

⚔️🏁👑
