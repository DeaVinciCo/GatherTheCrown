import fs from 'node:fs';
import path from 'node:path';

const exportDir = path.resolve(process.cwd(), 'godot-web-export');

if (!fs.existsSync(exportDir)) {
  console.error('Missing folder: godot-web-export');
  console.error('Create a Godot web export to ../godot-web-export/index.html from the Godot editor.');
  process.exit(1);
}

const files = fs.readdirSync(exportDir);
const hasIndex = files.includes('index.html');
const hasWasm = files.some((name) => name.endsWith('.wasm'));
const hasPck = files.some((name) => name.endsWith('.pck'));
const hasGodotJs = files.some((name) => name.endsWith('.js') && name !== 'sw.js');

if (!hasIndex || !hasWasm || !hasPck || !hasGodotJs) {
  console.error('Godot web export is incomplete in godot-web-export/.');
  console.error('Required files: index.html + generated .js + .wasm + .pck');
  console.error('Open Godot editor and export to: ../godot-web-export/index.html');
  process.exit(1);
}

console.log('Godot web export detected. Starting local web server...');
