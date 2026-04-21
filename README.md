# Gather The Crown - Godot Only

This repository now contains only the Godot version of Gather The Crown.

## Project

- Godot project root: `GatherTheCrown/`
- Godot config: `GatherTheCrown/project.godot`
- Netlify publish folder: `godot-web-export/`

## Play Godot In Browser (Local)

1. Export from Godot editor to:

   `../godot-web-export/index.html`

2. From repository root, run:

   ```bash
   pnpm dev
   ```

3. Open:

   `http://localhost:5173/`

The local command validates that Godot export artifacts (`.js`, `.wasm`, `.pck`) exist before serving.

## Netlify

Netlify is configured to publish `godot-web-export/`.
Ensure Godot web export files are present in that folder before deploy.
