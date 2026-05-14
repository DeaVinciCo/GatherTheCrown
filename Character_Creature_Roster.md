# Character and Creat Roster

This file is the canonical roster reference for playable Creat species.

## Current Implemented Creat Species

Current total in playable code: 7

1. Fire: Emberdrake
2. Water: Tidewyrm
3. Earth: Stoneboar
4. Storm: Voltfang
5. Light: Solstag
6. Shadow: Voidpanther
7. Arcane: Starveilvox

Code source of truth:
- packages/client/src/systems/CreatSpecies.ts

## Ability Mapping

1. Emberdrake (Fire): Scorch Burst
2. Tidewyrm (Water): Hydro Surge
3. Stoneboar (Earth): Tremor Charge
4. Voltfang (Storm): Chain Lightning
5. Solstag (Light): Radiant Pulse
6. Voidpanther (Shadow): Shade Pounce
7. Starveilvox (Arcane): Arcane Rift

## Target Species Counts

Recommended production target for variety:
- 3 species per element x 7 elements = 21 playable Creat species

Suggested phased rollout:
1. Phase 1 (already live): 7 core species, one per element
2. Phase 2: add 7 variant species (two per element total)
3. Phase 3: add 7 apex species (three per element total)

## Variant Slots by Element (Design Placeholders)

Fire:
- Core: Emberdrake
- Variant A: Pyrogryph
	- Ability: Meteor Talon
	- Passive: Kindled Wings
- Variant B: open

Water:
- Core: Tidewyrm
- Variant A: Coralstag
	- Ability: Reef Cascade
	- Passive: Tidal Grace
- Variant B: open

Earth:
- Core: Stoneboar
- Variant A: Terragolem
	- Ability: Bastion Quake
	- Passive: Granite Core
- Variant B: open

Storm:
- Core: Voltfang
- Variant A: Stormroc
	- Ability: Skybreaker Dive
	- Passive: Tailwind Surge
- Variant B: open

Light:
- Core: Solstag
- Variant A: Dawnlion
	- Ability: Sunflare Roar
	- Passive: Radiant Guard
- Variant B: open

Shadow:
- Core: Voidpanther
- Variant A: Umbraven
	- Ability: Nightfall Spiral
	- Passive: Ebon Feathers
- Variant B: open

Arcane:
- Core: Starveilvox
- Variant A: Runeelk
	- Ability: Sigil Stampede
	- Passive: Leyline Channel
- Variant B: open

## Notes

- The file 11_Character_Creat_Roster.txt contains broad world roster and lore ideas.
- The playable runtime roster should stay synced with packages/client/src/systems/CreatSpecies.ts.

## Creat Combat Matrix By Element

Rule target per element:
- 3 Core Attacks
- 4 Powers
- 6 Abilities

### Fire Creat: Emberdrake

Core Attacks (3):
1. Ember Claw
2. Cinder Bite
3. Flame Lash

Powers (4):
1. Scorch Burst
2. Molten Roar
3. Searing Flight
4. Inferno Ward

Abilities (6):
1. Burn Stack
2. Heat Shield
3. Lava Step
4. Threat Roar
5. Ash Veil
6. Last Ember (low HP damage spike)

### Water Creat: Tidewyrm

Core Attacks (3):
1. Tidal Fang
2. Fin Slash
3. Jet Ram

Powers (4):
1. Hydro Surge
2. Undertow Pull
3. Mist Screen
4. Current Shell

Abilities (6):
1. Soak Stack
2. Cleanse Pulse
3. Wave Dash
4. Mana Rinse
5. Healing Mist
6. Deep Focus (cooldown reduction)

### Earth Creat: Stoneboar

Core Attacks (3):
1. Tusk Gore
2. Boulder Slam
3. Root Kick

Powers (4):
1. Tremor Charge
2. Quake Burst
3. Ironhide Guard
4. Briar Crush

Abilities (6):
1. Armor Up
2. Stagger Resist
3. Ground Anchor
4. Root Snare
5. Weight Shift
6. Bastion Call (party defense aura)

### Storm Creat: Voltfang

Core Attacks (3):
1. Volt Bite
2. Spark Pounce
3. Gale Swipe

Powers (4):
1. Chain Lightning
2. Tempest Leap
3. Cyclone Fang
4. Static Wall

Abilities (6):
1. Shock Stack
2. Arc Jump
3. Evasion Surge
4. Storm Trace
5. Disrupt Cast
6. Overcharge (speed + attack burst)

### Light Creat: Solstag

Core Attacks (3):
1. Radiant Horn
2. Dawn Kick
3. Halo Sweep

Powers (4):
1. Radiant Pulse
2. Sunbeam Arc
3. Blessing Circle
4. Beacon Rush

Abilities (6):
1. Blind Stack
2. Purify
3. Regeneration Aura
4. Ward Sigil
5. Resolve Gain
6. Grace Reprieve (death-prevention proc)

### Shadow Creat: Voidpanther

Core Attacks (3):
1. Shade Rake
2. Void Fang
3. Nightstep Strike

Powers (4):
1. Shade Pounce
2. Eclipse Claw
3. Terror Pulse
4. Umbral Gate

Abilities (6):
1. Fear Stack
2. Crit Ambush
3. Phase Step
4. Silence Bite
5. Veil Escape
6. Hunter Mark (targeted damage amp)

### Arcane Creat: Starveilvox

Core Attacks (3):
1. Rift Swipe
2. Star Bolt
3. Comet Tail

Powers (4):
1. Arcane Rift
2. Prism Barrage
3. Gravity Knot
4. Ethereal Nova

Abilities (6):
1. Mana Siphon
2. Spell Weave
3. Cooldown Shift
4. Warp Step
5. Arc Field
6. Fate Twist (randomized bonus effect)

## Rider Hero Combat Framework

Design target per hero element:
- 3 Attack Chains
- 4 Signature Powers
- 6 Utility Abilities
- 1 Primary Fighting Style

### Fire Rider

Attack Chains (3):
1. Ash Jab -> Flame Hook -> Cinder Uppercut
2. Ember Slash -> Dash Cross -> Burn Finisher
3. Vault Kick -> Flame Spin -> Ground Slam

Signature Powers (4):
1. Phoenix Lunge
2. Magma Breaker
3. Burning Guard
4. Infernal Rally

Utility Abilities (6):
1. Heat Vision
2. Burn Extend
3. Counter Flame
4. Rage Conversion
5. Armor Melt
6. Finisher Window

Fighting Style: Aggressive pressure brawler

### Water Rider

Attack Chains (3):
1. Flow Palm -> Tidal Sweep -> Undertow Throw
2. Spear Jab -> Spiral Cut -> Mist Break
3. Slide Kick -> Backstep Lash -> Ripple Strike

Signature Powers (4):
1. Maelstrom Guard
2. Torrent Pierce
3. Healing Current
4. Mirror Wave

Utility Abilities (6):
1. Status Cleanse
2. Cooldown Chill
3. Slow Field
4. Reposition Dash
5. Resource Regen
6. Ally Shield

Fighting Style: Control and sustain duelist

### Earth Rider

Attack Chains (3):
1. Hammer Bash -> Shoulder Ram -> Quake Drop
2. Shield Hook -> Tusk Thrust -> Crag Split
3. Grab Break -> Wall Pin -> Boulder Ender

Signature Powers (4):
1. Stone Bastion
2. Faultline Slam
3. Rooted Guard
4. Titan Advance

Utility Abilities (6):
1. Poise Gain
2. Knockback Immune
3. Taunt Field
4. Armor Spike
5. Crowd Brace
6. Last Stand

Fighting Style: Fortress bruiser

### Storm Rider

Attack Chains (3):
1. Dash Cut -> Volt Kick -> Sky Pierce
2. Twin Slash -> Flicker Step -> Arc Burst
3. Air Launch -> Cross Dive -> Thunder End

Signature Powers (4):
1. Lightning Rush
2. Storm Cage
3. Gale Counter
4. Tempest Drive

Utility Abilities (6):
1. Speed Surge
2. Cast Interrupt
3. Crit Window
4. Mobility Reset
5. Shock Spread
6. Chase Mark

Fighting Style: High-speed skirmisher

### Light Rider

Attack Chains (3):
1. Halo Slash -> Radiant Palm -> Dawn Rise
2. Guard Parry -> Light Thrust -> Purge Hit
3. Beam Kick -> Cross Guard -> Mercy End

Signature Powers (4):
1. Solar Aegis
2. Lumen Strike
3. Sanctuary Ring
4. Daybreak Lance

Utility Abilities (6):
1. Cleanse
2. Heal Pulse
3. Resolve Buff
4. Anti-Fear
5. Team Ward
6. Revive Spark

Fighting Style: Support paladin duelist

### Shadow Rider

Attack Chains (3):
1. Veil Jab -> Backstab Slice -> Dread End
2. Dash Feint -> Low Cut -> Reaper Cross
3. Blind Kick -> Shadow Hook -> Ambush Drop

Signature Powers (4):
1. Midnight Step
2. Dread Veil
3. Silence Brand
4. Execution Arc

Utility Abilities (6):
1. Cloak
2. Fear Pulse
3. Damage Amp Mark
4. Escape Blink
5. Enemy Debuff Strip
6. Critical Chain

Fighting Style: Assassin control

### Arcane Rider

Attack Chains (3):
1. Sigil Slash -> Rune Burst -> Rift Knockback
2. Staff Jab -> Arc Spiral -> Comet Cast
3. Warp Dash -> Focus Hit -> Prism End

Signature Powers (4):
1. Aether Lance
2. Chrono Lock
3. Arc Well
4. Nova Script

Utility Abilities (6):
1. Mana Flux
2. Cooldown Shift
3. Teleport Step
4. Spell Mirror
5. Debuff Convert
6. Surge Channel

Fighting Style: Tactical battlemage

## Hybrid Hero Rules

Hybrid heroes select one Primary element and one Secondary element.

Hybrid combat usage:
1. Keep 2 signature powers from Primary.
2. Borrow 1 signature power from Secondary.
3. Use 1 mixed combo finisher tagged as Hybrid.
4. Gain 2 utility abilities from Secondary.

Hybrid penalty and bonus:
1. Base output penalty: -8 percent until mastery rank 3.
2. Combo flexibility bonus: +1 extra swap cancel window.

## Armor and Riding Gear Needs

Hero armor sets needed:
1. Light, Medium, Heavy per element.
2. Hybrid-compatible mixed resist sets.

Creat armor sets needed:
1. Head plate
2. Neck collar focus
3. Chest barding
4. Leg guards
5. Tail guard or balance ribbon

Riding gear needed:
1. Elemental saddle
2. Rein set
3. Saddle bags
4. Stirrup kit
5. Crest banner slot

Gear stat tags:
1. Bond gain
2. Stamina drain reduction
3. Turn control
4. Sprint acceleration
5. Crash resistance
