# Gameplay Organization and Tooling Update (April 21, 2026)

## What was reorganized

Gameplay and presentation concerns are now separated:

- Gameplay movement core:
  - `scripts/gameplay/movement/character_motor_2d.gd`
- Gameplay player controller:
  - `scripts/gameplay/player/player_controller.gd`
- Presentation (graphics/avatar rendering):
  - `scripts/presentation/avatars/player_avatar_renderer.gd`
  - `scripts/presentation/avatars/fire_creat_avatar_renderer.gd`

Compatibility shims were kept so old paths continue to work:

- `scripts/actors/character_motor_2d.gd`
- `scripts/actors/player/player.gd`

Player scene now points to the new gameplay controller:

- `scenes/actors/player/Player.tscn`

## Gameplay movement fix (arrow keys)

The movement motor now uses action-based input first:

- `Input.get_vector("move_left", "move_right", "move_up", "move_down")`

This ensures arrow keys and WASD mappings from `project.godot` are respected consistently.
A fallback raw-key read is only used if action mappings are unavailable.

## Graphics and animation enhancements

- Player now has a custom procedural avatar (body/head/hair/crest/shadow).
- Fire Creat now has a custom procedural flame avatar.
- Both avatars animate in real time (bob, tilt, pulse/flicker) based on velocity/direction.

These updates are code-driven and do not require external texture assets.

## Internet research summary

References reviewed:

- Godot 2D sprite animation docs:
  - https://docs.godotengine.org/en/stable/tutorials/2d/2d_sprite_animation.html
- Godot input and InputMap docs:
  - https://docs.godotengine.org/en/stable/tutorials/inputs/inputevent.html
- Free game asset source:
  - https://www.kenney.nl/assets
- Sprite tooling references:
  - https://www.aseprite.org/
  - https://www.piskelapp.com/

## Tool installation status

Installed:

- `spright` via winget
  - Command used:
    - `winget install --id houmain.spright --exact --accept-package-agreements --accept-source-agreements`
  - Purpose:
    - Sprite sheet packing and annotation for game assets.

Attempted but failed:

- `Pixelorama` (`OramaInteractive.Pixelorama`) failed because of an installer hash mismatch returned by winget during this session.

Fallback options for Pixelorama:

1. Retry winget later:
   - `winget install --id OramaInteractive.Pixelorama --exact --accept-package-agreements --accept-source-agreements`
2. Download directly from official release page:
   - https://github.com/Orama-Interactive/Pixelorama/releases

## Recommended next art pipeline step

1. Create/export player and companion sprite sheets with Pixelorama or Piskel.
2. Pack and annotate sheets with `spright`.
3. Replace procedural avatars with `AnimatedSprite2D` assets when ready.
