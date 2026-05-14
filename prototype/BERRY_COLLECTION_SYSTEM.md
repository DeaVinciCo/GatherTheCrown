# Berry Collection System

## Overview
Berries can now be collected from bushes and berry trees by walking near them. Both the player and creat companion can collect berries for health restoration and bonuses.

## Collection Mechanics

### Player Collection

**Bushes (Regular Berries)**
- Collection radius: 40 pixels (walk nearby)
- Effect: +10 HP
- Regrow time: 30 seconds
- Visual: Berries disappear from bush sprite

**Berry Trees (Element-Specific)**
- Collection radius: 50 pixels (walk nearby)
- Effects vary by element:
  - **Fire**: +15 HP, +10 Stamina
  - **Water**: +20 HP, +5 Stamina
  - **Earth**: +25 HP (best healing)
  - **Storm**: +10 HP, +20 Stamina (best stamina)
  - **Light**: +30 HP (blessed healing)
  - **Shadow**: +15 HP, +15 Stamina (balanced)
- Regrow time: 45 seconds
- Visual: Berries disappear from tree sprite

### Creat Collection

**Bushes**
- Collection radius: 40 pixels
- Effect: +15 HP, +2 Bond
- Only eats when health < max health
- Regrow time: 30 seconds

**Berry Trees**
- Collection radius: 50 pixels
- Effect: +20 HP, +5 Bond
- Only eats when health < max health
- Regrow time: 45 seconds
- Increases bond level with player

## Visual Feedback

**With Berries:**
- Bushes show red berries with highlights
- Berry trees show glowing element-colored berries with aura

**Without Berries (Picked):**
- Bushes appear as green foliage only
- Berry trees show foliage without berries or glow

**Console Messages:**
- "Collected berries from bush! +10 HP"
- "Fire berries! +15 HP, +10 Stamina"
- "Fire Drake ate berries from bush! +15 HP, +2 Bond"
- "Fire Drake ate berries from fire tree! +20 HP, +5 Bond"
- "Bush berries regrew!"
- "Fire tree berries regrew!"

## Strategic Use

### For Players:
- Walk near bushes for quick HP top-ups
- Seek element-specific trees for specialized effects
- Earth trees for maximum healing
- Storm trees for stamina recovery
- Light trees for blessed healing

### For Creats:
- Automatically eat berries when injured
- Builds bond level while healing
- Helps keep companion healthy during exploration

## Regrowth System

Berries automatically regrow after their timer expires:
- Bushes: 30 seconds
- Berry trees: 45 seconds

You can return to the same location to collect berries again after they regrow.

## Tips

1. **Exploration**: Berry trees spawn based on your creat's element (Fire Drake = fire berries)
2. **Combat**: Retreat to berry-rich areas when low on health
3. **Bond Building**: Let your creat eat berries to increase bond level
4. **Stamina Management**: Fire and storm berries restore stamina for sprinting/dodging
5. **Path Planning**: Remember berry locations for quick healing routes

## Future Enhancements

Potential additions:
- Berry inventory (pick and store for later)
- Crafting with berries (potions, buffs)
- Rare golden berries with special effects
- Berry-based quests
- Trading berries for items
- Different berry types per biome
