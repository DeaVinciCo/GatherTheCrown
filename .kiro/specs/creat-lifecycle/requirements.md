# Requirements Document

## Introduction

The Creat Lifecycle System governs the full lifespan of a creat — from egg discovery during the Forest
Trials through hatching, growth, bonding, and role maturation (mount, protector, fighter). It expands the
existing bond meter and evolution stage systems into a cohesive lifecycle with meaningful player
responsibilities and real consequences for neglect, including the permanent loss of a creat.

The Rider (the player's character) discovers a creat egg during the Forest Trials (early-game
tutorial/exploration). From that moment, every interaction — feeding, training, battling, and simply
spending time together — shapes the creat's development. A creat that is cared for grows into a loyal,
powerful companion. A creat that is neglected may go feral, flee, be claimed by a rival Rider, or die.

## Glossary

- **Creat_Lifecycle_System**: The subsystem managing all creat states from egg to Elder, including care
  mechanics, bond tracking, and neglect consequences.
- **Rider**: The player's character; the sole caretaker and bond-partner of the creat.
- **Egg**: The initial pre-hatch state of a creat discovered in the Forest Trials.
- **Forest_Trials**: The early-game tutorial and exploration zone where the Rider discovers the creat egg.
- **Hatchling**: Stage 1 of creat development (Level 1–10); creat is newly born and fully dependent on the
  Rider.
- **Adolescent**: Stage 2 of creat development (Level 11–25); creat begins to develop combat and bonding
  capabilities.
- **Mature**: Stage 3 of creat development (Level 26–45); creat is battle-ready and mountable.
- **Elder**: Stage 4 of creat development (Level 46+); creat is at maximum power with legendary abilities.
- **Bond_Meter**: A 0–100% metric representing the strength of the Rider–creat relationship.
- **Care_Action**: Any Rider action that contributes to creat wellbeing: feeding, training, petting,
  battling together, or interacting.
- **Neglect_Timer**: An internal countdown that tracks how long since the last Care_Action was performed.
- **Feral_State**: A creat behavioral mode triggered when Bond_Meter drops below 20%; the creat disobeys
  commands and attacks randomly.
- **Critical_Neglect**: A severe neglect condition reached when Bond_Meter drops to 0% and the
  Neglect_Timer exceeds the maximum threshold.
- **Sync_Mode**: A special combat mode requiring 100% sync meter, unlocked at Mature stage.
- **Elemental_Food**: Stage- and element-specific food items (e.g. Ember Fruit for Fire creats) used to
  feed and evolve creats.
- **Racing_Mode**: A gameplay mode in which the Rider mounts a Mature or Elder creat for competitive
  racing.
- **Rival_Rider**: Another player character (in multiplayer) whose proximity and actions can influence a
  neglected creat.
- **Permanent_Loss**: An irreversible creat removal event caused by Critical_Neglect; the creat cannot be
  recovered.
- **Egg_Care_Action**: A subset of Care_Actions valid during the egg phase: warming, turning, singing/
  humming, elemental exposure.
- **Hatch_Condition**: The set of care thresholds and time requirements that trigger egg hatching.
- **Mount_State**: The condition in which the Rider is physically riding the creat for travel or racing.
- **Auto_Protect**: A passive creat ability unlocked at 75% Bond_Meter that automatically blocks one fatal
  hit per battle.
- **Combo_Attack**: A joint offensive move between Rider and creat, unlocked at 50% Bond_Meter.

---

## Requirements

---

### Requirement 1: Egg Discovery in the Forest Trials

**User Story:** As a Rider, I want to discover a creat egg during the Forest Trials, so that I have a
meaningful introduction to the creat bond and understand from the start that my creat depends on me.

#### Acceptance Criteria

1. WHEN the Rider enters the designated egg-discovery area of the Forest_Trials for the first time, THE
   Creat_Lifecycle_System SHALL spawn a creat egg appropriate to the Rider's chosen elemental affinity.
2. WHEN the egg is discovered, THE Creat_Lifecycle_System SHALL display a tutorial prompt explaining that
   the egg requires care and will hatch under specific conditions.
3. THE Creat_Lifecycle_System SHALL place the discovered egg in the Rider's inventory and begin tracking
   the Neglect_Timer from the moment of discovery.
4. IF the Rider exits the Forest_Trials without interacting with the egg at least once, THEN THE
   Creat_Lifecycle_System SHALL display a warning notification indicating the egg needs attention.
5. THE Creat_Lifecycle_System SHALL ensure that each Rider account can discover exactly one first creat
   egg through the Forest_Trials, and that egg is flagged as the permanent first creat.

---

### Requirement 2: Egg Care Phase

**User Story:** As a Rider, I want to care for my creat egg through specific actions, so that my choices
during the egg phase meaningfully affect the creat's development and hatching.

#### Acceptance Criteria

1. WHILE the creat is in the Egg state, THE Creat_Lifecycle_System SHALL accept the following
   Egg_Care_Actions: warming (holding near heat source), turning (rotating the egg), singing or humming
   (proximity interaction), and elemental exposure (placing egg near element-matching environment).
2. WHEN the Rider performs an Egg_Care_Action, THE Creat_Lifecycle_System SHALL increment a hidden
   Hatch_Progress value by an amount specific to that action type.
3. THE Creat_Lifecycle_System SHALL require a minimum cumulative Hatch_Progress threshold before the egg
   is eligible to hatch.
4. WHEN the Rider performs an elemental exposure Egg_Care_Action matching the egg's element, THE
   Creat_Lifecycle_System SHALL increment Hatch_Progress by 5 points; all other valid Egg_Care_Actions
   SHALL increment Hatch_Progress by 1 point per interaction (once per in-game day per action type).
5. IF the Rider does not perform any Egg_Care_Action for 3 consecutive in-game days, THEN THE
   Creat_Lifecycle_System SHALL decrement Hatch_Progress by 3 points and display a warning notification
   to the Rider.
6. WHERE the game is running in multiplayer mode, THE Creat_Lifecycle_System SHALL allow a second Rider
   to assist with Egg_Care_Actions, granting 50% of the normal Hatch_Progress increment to the egg owner.

---

### Requirement 3: Egg Hatching

**User Story:** As a Rider, I want my creat egg to hatch into a Hatchling after sufficient care, so that
my investment in the egg phase is rewarded with a living creat.

#### Acceptance Criteria

1. WHEN the Hatch_Progress meets or exceeds the required threshold and the minimum egg age of 3 in-game
   days has passed, THE Creat_Lifecycle_System SHALL trigger the hatching sequence.
2. WHEN the hatching sequence begins, THE Creat_Lifecycle_System SHALL play an element-specific hatching
   animation lasting no more than 5 seconds (skippable by the Rider).
3. WHEN the hatching sequence completes, THE Creat_Lifecycle_System SHALL transition the creat from the
   Egg state to the Hatchling stage, initialize the Bond_Meter to 10%, and set the creat's level to 1.
4. WHEN the creat hatches, THE Creat_Lifecycle_System SHALL assign the creat's elemental affinity,
   base stats, and body type based on the egg's element and the Rider's care pattern during the egg phase.
5. WHEN the creat hatches, THE Creat_Lifecycle_System SHALL display the creat's name-entry prompt,
   allowing the Rider to assign a name of 2–20 characters.
6. IF the Hatch_Progress drops to 0 at any time before hatching, THEN THE Creat_Lifecycle_System SHALL
   display a critical warning that the egg is at risk, and reduce the minimum egg age requirement by 1
   in-game day to allow immediate corrective care.

---

### Requirement 4: Ongoing Care — Feeding

**User Story:** As a Rider, I want to feed my creat with element-specific foods, so that the creat grows
stronger and our bond deepens.

#### Acceptance Criteria

1. THE Creat_Lifecycle_System SHALL accept feeding of Elemental_Food items matched to the creat's
   elemental affinity, granting +1% Bond_Meter per feeding interaction (once per in-game day).
2. WHEN the Rider feeds the creat a favorite food item (highest-tier Elemental_Food for the creat's
   element), THE Creat_Lifecycle_System SHALL grant +2% Bond_Meter instead of +1%.
3. WHEN the Rider feeds the creat a food item that does not match the creat's elemental affinity, THE
   Creat_Lifecycle_System SHALL accept the food but grant 0% Bond_Meter increase and display a
   notification that the creat prefers element-matched food.
4. IF the Rider does not feed the creat for 3 consecutive in-game days, THEN THE Creat_Lifecycle_System
   SHALL reduce the Bond_Meter by 5% and display a hunger warning notification.
5. THE Creat_Lifecycle_System SHALL track feeding history per creat and expose a "Days Since Last Fed"
   counter visible in the creat status panel.
6. WHILE the creat is in the Hatchling stage, THE Creat_Lifecycle_System SHALL require a minimum of 1
   feeding per in-game day to prevent accelerated bond loss, displaying a daily reminder if the feeding
   has not occurred by the in-game evening.

---

### Requirement 5: Ongoing Care — Bonding

**User Story:** As a Rider, I want to build my bond with the creat through daily interactions and battles,
so that the creat becomes more capable and loyal over time.

#### Acceptance Criteria

1. WHEN the Rider and creat win a battle together, THE Creat_Lifecycle_System SHALL increase the
   Bond_Meter by 2%.
2. WHEN the Rider and creat complete a Sync_Mode victory, THE Creat_Lifecycle_System SHALL increase the
   Bond_Meter by 5%.
3. WHEN the Rider pets or interacts with the creat (once per in-game day), THE Creat_Lifecycle_System
   SHALL increase the Bond_Meter by 0.5%.
4. WHEN the Rider completes a training session with the creat, THE Creat_Lifecycle_System SHALL increase
   the Bond_Meter by 1%.
5. WHEN the creat faints in battle, THE Creat_Lifecycle_System SHALL decrease the Bond_Meter by 3%.
6. WHEN the Rider applies an attack of the creat's opposing element directly to the creat, THE
   Creat_Lifecycle_System SHALL decrease the Bond_Meter by 10%.
7. THE Creat_Lifecycle_System SHALL enforce Bond_Meter bounds of 0% minimum and 100% maximum at all times.
8. WHEN the Bond_Meter reaches each milestone, THE Creat_Lifecycle_System SHALL unlock the corresponding
   capability and notify the Rider:
   - 25%: creat recognizes the Rider's name (dialogue changes)
   - 50%: Combo_Attack unlocked
   - 75%: Auto_Protect unlocked (blocks 1 fatal hit per battle)
   - 100%: Perfect Bond (stat boost + unique cosmetic aura)

---

### Requirement 6: Ongoing Care — Training

**User Story:** As a Rider, I want to run training sessions with my creat, so that the creat's stats and
combat proficiency improve over time.

#### Acceptance Criteria

1. WHEN the Rider initiates a training session with the creat, THE Creat_Lifecycle_System SHALL present
   a selection of available training exercises appropriate to the creat's current lifecycle stage.
2. WHEN a training session completes successfully, THE Creat_Lifecycle_System SHALL grant the creat
   experience points toward the next level and increase the Bond_Meter by 1%.
3. THE Creat_Lifecycle_System SHALL limit training sessions to a maximum of 3 per in-game day to prevent
   stat exploitation.
4. WHILE the creat is in the Feral_State, THE Creat_Lifecycle_System SHALL block the Rider from
   initiating training sessions and display a message that the creat must be calmed first.
5. WHERE training mode offers combat exercises, THE Creat_Lifecycle_System SHALL scale enemy difficulty
   to the creat's current level and stage, ensuring training remains challenging but completable.

---

### Requirement 7: Lifecycle Stage Progression

**User Story:** As a Rider, I want my creat to grow through defined lifecycle stages, so that continued
care and play are rewarded with visible development and new capabilities.

#### Acceptance Criteria

1. THE Creat_Lifecycle_System SHALL define four creat lifecycle stages in order: Hatchling (Level 1–10),
   Adolescent (Level 11–25), Mature (Level 26–45), and Elder (Level 46+).
2. WHEN the creat meets the level threshold and Bond_Meter requirement for the next stage, THE
   Creat_Lifecycle_System SHALL display an evolution-ready prompt to the Rider.
3. WHEN the Rider confirms evolution and provides the required Elemental_Food items and gold, THE
   Creat_Lifecycle_System SHALL play the evolution animation, update the creat's stage, size, and visual
   appearance, and unlock stage-specific abilities.
4. THE Creat_Lifecycle_System SHALL enforce the following minimum Bond_Meter values for evolution:
   - Hatchling → Adolescent: 40% Bond_Meter, 10 Elemental_Fruits, 500 GC
   - Adolescent → Mature: 70% Bond_Meter, 5 Rare Elemental Crystals, 5,000 GC
   - Mature → Elder: 95% Bond_Meter, 1 Primal Essence, 50,000 GC
5. WHEN the Rider chooses to delay evolution after the prompt appears, THE
   Creat_Lifecycle_System SHALL preserve the creat at its current stage until the Rider manually triggers
   evolution, with no penalty to stats or bond.
6. THE Creat_Lifecycle_System SHALL prevent stage regression; once a creat reaches a stage, it SHALL NOT
   return to a previous stage under any circumstance.

---

### Requirement 8: Mount Capability

**User Story:** As a Rider, I want to ride my creat once it reaches the Mature stage, so that I can
travel the world faster and compete in Racing Mode.

#### Acceptance Criteria

1. WHEN the creat reaches the Mature stage, THE Creat_Lifecycle_System SHALL unlock the Mount_State for
   that creat, allowing the Rider to mount and dismount at will outside of active combat.
2. WHEN the Rider is in Mount_State, THE Creat_Lifecycle_System SHALL apply the creat's movement speed
   to the Rider's travel speed, replacing the Rider's base movement.
3. WHEN the creat is in Mount_State, THE Creat_Lifecycle_System SHALL prevent the creat from using active
   combat abilities until the Rider dismounts.
4. WHEN Racing_Mode is initiated, THE Creat_Lifecycle_System SHALL require the creat to be in Mount_State
   and at Mature or Elder stage before the Rider can participate.
5. IF the creat enters the Feral_State while the Rider is mounted, THEN THE Creat_Lifecycle_System SHALL
   forcibly dismount the Rider, deal 10 HP of fall damage to the Rider, and transition the creat to
   Feral_State behavior.

---

### Requirement 9: Protector Role (Auto-Protect)

**User Story:** As a Rider, I want my creat to automatically protect me from fatal hits at high bond,
so that a strong bond translates to meaningful combat survivability.

#### Acceptance Criteria

1. WHEN the Rider's HP would be reduced to 0 by a single attack and the Bond_Meter is at 75% or above,
   THE Creat_Lifecycle_System SHALL trigger Auto_Protect, causing the creat to intercept and negate the
   fatal hit.
2. THE Creat_Lifecycle_System SHALL allow Auto_Protect to trigger a maximum of once per battle encounter,
   regardless of how many fatal hits occur in that encounter.
3. WHEN Auto_Protect triggers, THE Creat_Lifecycle_System SHALL reduce the creat's HP by 20% of the
   intercepted damage and play an element-specific shield animation.
4. WHEN Auto_Protect triggers, THE Creat_Lifecycle_System SHALL display a notification (e.g., "[Creat
   Name] protected you!") visible to the Rider.
5. IF the creat's HP is below 10% at the moment a fatal hit would occur, THEN THE
   Creat_Lifecycle_System SHALL NOT trigger Auto_Protect, as the creat lacks the strength to intercept.

---

### Requirement 10: Fighter Role (AI Companion in Combat)

**User Story:** As a Rider, I want my creat to act as an AI combat companion with abilities that scale
with its evolution stage, so that investing in my creat's growth makes combat more effective.

#### Acceptance Criteria

1. THE Creat_Lifecycle_System SHALL make the creat available as an active AI combat companion in all
   non-training combat encounters once it has hatched.
2. WHEN the creat's lifecycle stage advances, THE Creat_Lifecycle_System SHALL unlock new combat
   abilities proportional to the new stage (Hatchling: basic elemental attack; Adolescent: secondary
   ability; Mature: Sync_Mode compatibility; Elder: ultimate ability).
3. THE Creat_Lifecycle_System SHALL scale the creat's combat stats (HP, Attack, Defense, Speed) in
   accordance with the defined stat multipliers per stage (50% at Hatchling, 75% at Adolescent, 100% at
   Mature, 125% at Elder).
4. WHEN the Rider issues a creat command (attack, defend, special ability, retreat) during combat, THE
   Creat_Lifecycle_System SHALL execute the command within 0.5 seconds of the input.
5. WHILE the creat is in the Feral_State, THE Creat_Lifecycle_System SHALL override the Rider's combat
   commands, causing the creat to attack random targets including the Rider.

---

### Requirement 11: Neglect and Bond Decay

**User Story:** As a Rider, I want neglecting my creat to have progressive and visible consequences, so
that the bond system feels real and I'm motivated to maintain ongoing care.

#### Acceptance Criteria

1. THE Creat_Lifecycle_System SHALL track elapsed in-game days since each Care_Action type was last
   performed and expose this data in the creat status panel.
2. WHEN the Bond_Meter drops below 20%, THE Creat_Lifecycle_System SHALL transition the creat to
   Feral_State, displaying a warning to the Rider and applying Feral_State behavioral overrides.
3. WHILE the creat is in Feral_State, THE Creat_Lifecycle_System SHALL display a visual degradation effect
   on the creat sprite (desaturated colors, visual corruption) to communicate the creat's distress.
4. WHEN the creat is in Feral_State and the Rider restores the Bond_Meter to 30% or above through feeding
   and care interactions, THE Creat_Lifecycle_System SHALL remove Feral_State and restore normal creat
   behavior.
5. IF the Bond_Meter reaches 0% and the Neglect_Timer exceeds 7 consecutive in-game days without a
   Care_Action, THEN THE Creat_Lifecycle_System SHALL enter the Critical_Neglect state.

---

### Requirement 12: Creat Abandonment (Bond Reaches Zero)

**User Story:** As a Rider, I want a neglected creat to eventually run off on its own, so that the
consequences of abandonment feel natural and emotionally impactful.

#### Acceptance Criteria

1. WHEN Critical_Neglect is reached and the creat is in the Hatchling or Adolescent stage, THE
   Creat_Lifecycle_System SHALL trigger a "creat has run off" event: remove the creat from the Rider's
   roster, display a farewell cutscene, and mark the creat slot as vacant.
2. WHEN Critical_Neglect is reached and the creat is in the Mature or Elder stage, THE
   Creat_Lifecycle_System SHALL not immediately trigger abandonment; instead, the Neglect_Timer SHALL
   continue for an additional 3 in-game days as a final warning period before the creat runs off.
3. WHEN the "run off" event fires, THE Creat_Lifecycle_System SHALL log the event in the Rider's journal
   with the creat's name, stage, and the date the creat departed.
4. IF the run-off event fires for the Rider's first (permanent) creat, THEN THE Creat_Lifecycle_System
   SHALL NOT remove the creat; instead, the creat SHALL enter a locked Feral_State requiring a special
   in-game reconciliation quest to restore the bond.

---

### Requirement 13: Creat Claimed by Rival Rider (Multiplayer)

**User Story:** As a Rider, I want a severely neglected creat to be claimable by a nearby Rival_Rider in
multiplayer, so that neglect carries social consequences and feels meaningful.

#### Acceptance Criteria

1. WHERE the game is running in multiplayer mode, WHEN the Rider's creat Bond_Meter is at or below 5%
   and a Rival_Rider is within a 10-tile proximity for at least 60 in-game seconds, THE
   Creat_Lifecycle_System SHALL make the creat eligible for claiming by that Rival_Rider.
2. WHEN a creat becomes claimable, THE Creat_Lifecycle_System SHALL display a visible notification to
   the original Rider that a Rival_Rider is influencing their creat and they have 30 in-game seconds to
   perform a Care_Action to prevent the claim.
3. WHEN the Rival_Rider initiates a claim on an eligible creat and the original Rider does not perform a
   Care_Action within the 30-second window, THE Creat_Lifecycle_System SHALL transfer creat ownership to
   the Rival_Rider, reset the Bond_Meter to 10%, and remove the creat from the original Rider's roster.
4. IF the creat subject to a claim is the original Rider's first (permanent) creat, THEN THE
   Creat_Lifecycle_System SHALL block the ownership transfer and instead trigger the reconciliation quest
   as described in Requirement 12.4.
5. THE Creat_Lifecycle_System SHALL record all claiming events in a server-side log for moderation review,
   including the original Rider ID, the Rival_Rider ID, the creat ID, and the timestamp.

---

### Requirement 14: Creat Death (Permanent Loss)

**User Story:** As a Rider, I want extreme and prolonged neglect to risk permanent creat death, so that
the stakes of the bond system feel real and the emotional weight of carelessness is understood.

#### Acceptance Criteria

1. IF the creat is in Critical_Neglect state and remains unclaimed by a Rival_Rider for 5 additional
   in-game days after the run-off window, THEN THE Creat_Lifecycle_System SHALL trigger the creat death
   event.
2. WHEN the creat death event fires, THE Creat_Lifecycle_System SHALL permanently remove the creat from
   the game world, display a memorial notification to the Rider, and mark the creat slot as permanently
   vacant until a new creat is bonded.
3. THE Creat_Lifecycle_System SHALL preserve a memorial entry in the Rider's journal for a deceased creat,
   recording the creat's name, element, stage reached, bond peak, and date of death.
4. IF the creat subject to the death event is the original Rider's first (permanent) creat, THEN THE
   Creat_Lifecycle_System SHALL NOT trigger creat death; instead, the creat SHALL remain in a locked
   Feral_State and the reconciliation quest SHALL be the only path to restoration.
5. THE Creat_Lifecycle_System SHALL provide a single in-game warning notification at the 3-day mark
   before creat death would occur, clearly stating the creat is in grave danger and the time remaining.

---

### Requirement 15: Care State Visibility

**User Story:** As a Rider, I want a clear and accessible view of my creat's current care state, so that
I can act before bond decay becomes irreversible.

#### Acceptance Criteria

1. THE Creat_Lifecycle_System SHALL maintain and display a creat status panel containing: current
   lifecycle stage, Bond_Meter percentage, Neglect_Timer countdown, days since last fed, days since last
   trained, and current health.
2. WHEN the Bond_Meter drops below 30%, THE Creat_Lifecycle_System SHALL change the Bond_Meter UI
   indicator color to amber to signal approaching Feral_State.
3. WHEN the Bond_Meter drops below 20%, THE Creat_Lifecycle_System SHALL change the Bond_Meter UI
   indicator color to red and display a persistent on-screen warning icon.
4. THE Creat_Lifecycle_System SHALL send push notification summaries to the Rider (if notifications are
   enabled) when the creat has not been fed for 2 in-game days or the bond has dropped below 30%.
5. WHEN the Rider opens the creat status panel, THE Creat_Lifecycle_System SHALL display a simple
   recommended care action (e.g., "Feed your creat today" or "Run a training session") based on the
   longest-neglected Care_Action type.
