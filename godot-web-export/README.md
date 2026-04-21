# Godot Web Export Target

This folder is the Netlify publish target for the Godot browser build.

## Export destination

From Godot Editor, export the project to:

../godot-web-export/index.html

That export should place all generated files here (for example: .js, .wasm, .pck).

## Netlify behavior

Netlify is configured in the repo root netlify.toml to publish this folder.
