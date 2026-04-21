# Gather The Crown - Play In Browser

This repository now serves the Godot web export as the default local browser version.

## 1) Export Godot to web folder (one-time per update)

From Godot editor, export the project to:

../godot-web-export/index.html

The export should generate files in `godot-web-export/`, including:
- `index.html`
- one `.js` file
- one `.wasm` file
- one `.pck` file

## 2) Run local browser server

From repo root:

```bash
pnpm dev
```

Then open:

http://localhost:5173/

## If You See A White Screen

This usually means the Godot export artifacts are missing or outdated.

Confirm these files exist in `godot-web-export/`:
- `index.html`
- exported `.js`
- exported `.wasm`
- exported `.pck`

Then re-export from Godot editor to:

`../godot-web-export/index.html`

After export, rerun:

```bash
pnpm dev
```
