# HUD Direction Spec

Status:

- This file is the current source of truth for HUD direction.
- Current Godot HUD implementation is placeholder only.
- Do not finalize HUD visuals until layout is confirmed against the intended design.

Locked Direction:

1. The overall UI/UX vibe should follow the gem-circle / artifact-frame look.
2. The main gameplay screen should be framed by a large outer HUD frame.
3. Thin border across the top.
4. Thin border on the left that visually ties into the main stat cluster.
5. Thin border on the right that ties into the top border and supports chat / utility panels.
6. Chat should live bottom-right and slide in from the right when Shift is pressed.

Main Stat Module:

- Do not use gem-circle as the final main gauge module.
- Use gem-square as the main stat display module.
- Gem-square is the correct main gauge layout reference.
- The gauge bars/fills should curve to fit the curved spaces in the square design.

Main Gauge Rules:

1. One stat module per stat group.
2. The square HUD cluster is the main stat display.
3. Do not redesign this into plain bars or a square dashboard with generic rectangles.
4. Keep current implementation only as placeholder until layout matches the intended design.

Gauge Behavior:

1. Health should be segmented.
2. XP should be a slow smooth fill.
3. Spells should use fill gauges.
4. Potions should use fill gauges.
5. Normal and boosted/extended values can use a second larger or outer fill when needed.

Intended Quadrant Layout in the Gem-Square Module:

1. Top-left: hero / rider health.
2. Top-right: mana / potion levels.
3. Bottom-right: creat health / creat XP / creat food.
4. Bottom-left or lower cluster: hero / creat attack info, cooldowns, and attack count.

Combat Readout Expectations:

1. Hero / creat attack level should be visible.
2. Cooldown state should be visible.
3. Number of attacks should be visible.
4. Default attack count starts at 1.
5. Additional attacks should expand to 2, 3, 4, 5 as unlocked.

Asset Roles:

1. Gem-square: main gauges, menus, options, button and panel elements.
2. Gem-circle: overall vibe, frame language, ornament anchors, and supporting motif.
3. Gem nodes embedded on the gem-square should function as menu buttons for rider/creat and core in-game utility menus.
4. Heart / jewel / weapon art can be incorporated later during polish.

Health Icon Rules:

1. Red heart icon represents hero/rider health.
2. Blue heart icon represents creat health.
3. Heart icons should sit next to their corresponding health bars/gauges.
4. Keep hearts as part of the square-module language, not a separate UI style.

Current Placeholder Mapping in Godot:

- The existing HUD draws placeholder stat gauges in code.
- These placeholders are temporary and should not be treated as final placement or final count.
- Keep them only until the square-module layout is implemented.

Art Direction Notes from User:

1. Weapon style should follow the fantasy reference set: swords, axes, staffs, hammers, spears, bows, and more.
2. Map direction should support both provided aesthetics:
	- polished fantasy atlas style with saturated terrain, region badges, and framed labels;
	- parchment exploration style with hand-drawn landmasses and vintage cartography treatment.
3. World / local / regional maps should preserve clear labels for forests, kingdoms, water, and landmarks.
4. Roads/routes should remain readable as gameplay guidance, not only decorative lines.

Brand / Title Direction:

1. The provided Gather the Crown key art/logo can be used as the current game logo treatment.
2. A new logo can be produced later, but current implementation should assume this is the active branding reference.
3. Do not block HUD/layout work waiting on final logo redesign.

Implementation Order:

1. Confirm exact square-module placement sketch.
2. Lock number of gauges and which stats occupy which curved slots.
3. Decide segmented vs smooth per gauge.
4. Implement the gem-square module in Godot.
5. Only after layout is correct, begin visual polish.
