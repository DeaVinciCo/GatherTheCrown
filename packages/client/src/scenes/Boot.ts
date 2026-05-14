import Phaser from 'phaser';
import LayoutManager from '../ui/LayoutManager';
import AudioManager from '../audio/AudioManager';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const g = this.add.graphics();

    // --- HERO sprite (32x48): blue knight with helmet, body, legs ---
    g.clear();
    // legs
    g.fillStyle(0x1e40af, 1); g.fillRect(8, 34, 8, 14); g.fillRect(18, 34, 8, 14);
    // body / armor
    g.fillStyle(0x2563eb, 1); g.fillRect(6, 18, 20, 18);
    g.fillStyle(0x60a5fa, 1); g.fillRect(10, 20, 12, 8);
    // arms
    g.fillStyle(0x1d4ed8, 1); g.fillRect(1, 18, 6, 14); g.fillRect(25, 18, 6, 14);
    // head
    g.fillStyle(0xfbbf24, 1); g.fillRect(10, 6, 12, 12);
    // helmet
    g.fillStyle(0x1e3a8a, 1); g.fillRect(8, 2, 16, 8); g.fillRect(10, 0, 12, 4);
    // eyes
    g.fillStyle(0xffffff, 1); g.fillRect(12, 8, 3, 3); g.fillRect(17, 8, 3, 3);
    g.fillStyle(0x1e3a8a, 1); g.fillRect(13, 9, 2, 2); g.fillRect(18, 9, 2, 2);
    // sword
    g.fillStyle(0xc0c0c0, 1); g.fillRect(27, 10, 3, 22);
    g.fillStyle(0xd4a017, 1); g.fillRect(25, 18, 7, 3);
    g.generateTexture('hero', 32, 48);
    g.clear();

    // --- ENEMY (32x32): red goblin with horns ---
    g.fillStyle(0x7f1d1d, 1); g.fillRect(8, 20, 8, 12); g.fillRect(16, 20, 8, 12);
    g.fillStyle(0xdc2626, 1); g.fillRect(6, 8, 20, 16);
    g.fillStyle(0x991b1b, 1); g.fillRect(8, 2, 4, 8); g.fillRect(20, 2, 4, 8);
    g.fillStyle(0xfca5a5, 1); g.fillRect(10, 10, 12, 10);
    g.fillStyle(0xff0000, 1); g.fillRect(12, 13, 3, 4); g.fillRect(17, 13, 3, 4);
    g.fillStyle(0xfff, 1); g.fillRect(12, 17, 8, 2);
    g.generateTexture('enemy', 32, 32);
    g.clear();

    // --- BOSS (64x64): giant armored beast ---
    g.fillStyle(0x14532d, 1); g.fillRect(16, 40, 12, 24); g.fillRect(36, 40, 12, 24);
    g.fillStyle(0x166534, 1); g.fillRect(8, 16, 48, 32);
    g.fillStyle(0x4ade80, 1); g.fillRect(14, 20, 36, 18);
    g.fillStyle(0x15803d, 1);
    g.fillTriangle(4, 16, 0, 4, 14, 10);
    g.fillTriangle(60, 16, 64, 4, 50, 10);
    g.fillStyle(0x052e16, 1); g.fillRect(18, 8, 28, 16);
    g.fillStyle(0x22c55e, 1); g.fillRect(20, 10, 24, 12);
    g.fillStyle(0xff0000, 1); g.fillRect(22, 14, 6, 6); g.fillRect(36, 14, 6, 6);
    g.fillStyle(0xfff, 1); g.fillRect(22, 14, 6, 6); g.fillRect(36, 14, 6, 6);
    g.fillStyle(0xff0000, 1); g.fillRect(24, 15, 4, 4); g.fillRect(38, 15, 4, 4);
    g.fillStyle(0xffd700, 1); g.fillRect(26, 26, 12, 6);
    g.generateTexture('boss', 64, 64);
    g.clear();

    // --- GRASS tile (32x32) ---
    g.fillStyle(0x15803d, 1); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x166534, 1); g.fillRect(0, 0, 16, 16); g.fillRect(16, 16, 16, 16);
    g.fillStyle(0x14532d, 1);
    for (let i = 0; i < 6; i++) {
      const tx = (i * 7) % 28; const ty = (i * 11) % 28;
      g.fillRect(tx, ty, 2, 4);
    }
    g.generateTexture('grass', 32, 32);
    g.clear();

    // --- STONE tile (32x32) ---
    g.fillStyle(0x374151, 1); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x4b5563, 1); g.fillRect(0, 0, 15, 15); g.fillRect(17, 17, 15, 15);
    g.fillStyle(0x6b7280, 1); g.fillRect(0, 0, 15, 15);
    g.fillStyle(0x9ca3af, 1); g.fillRect(2, 2, 4, 2); g.fillRect(20, 18, 4, 2);
    g.generateTexture('stone', 32, 32);
    g.clear();

    // --- PORTAL (32x32): glowing golden ring ---
    g.fillStyle(0xfbbf24, 0.3); g.fillCircle(16, 16, 14);
    g.lineStyle(3, 0xfbbf24, 1); g.strokeCircle(16, 16, 13);
    g.lineStyle(2, 0xfde68a, 0.8); g.strokeCircle(16, 16, 10);
    g.fillStyle(0xfef08a, 0.6); g.fillCircle(16, 16, 6);
    g.generateTexture('portal', 32, 32);
    g.clear();

    // --- COIN (16x16) ---
    g.fillStyle(0xfbbf24, 1); g.fillCircle(8, 8, 7);
    g.fillStyle(0xfde68a, 1); g.fillCircle(7, 7, 3);
    g.generateTexture('coin', 16, 16);
    g.clear();

    // --- HP bar background ---
    g.fillStyle(0x1f2937, 1); g.fillRoundedRect(0, 0, 100, 10, 3);
    g.generateTexture('hpbg', 100, 10);
    g.clear();

    // --- HP bar fill (green→red based on tint) ---
    g.fillStyle(0x22c55e, 1); g.fillRoundedRect(0, 0, 100, 10, 3);
    g.generateTexture('hpfill', 100, 10);
    g.clear();

    // --- PROJECTILE: orange fireball ---
    g.fillStyle(0xf97316, 1); g.fillCircle(8, 8, 6);
    g.fillStyle(0xfef08a, 1); g.fillCircle(7, 7, 3);
    g.generateTexture('fireball', 16, 16);
    g.clear();

    // --- SLASH effect ---
    g.lineStyle(3, 0xfcd34d, 1);
    g.beginPath(); g.moveTo(0, 16); g.lineTo(16, 0); g.strokePath();
    g.lineStyle(2, 0xfde68a, 0.5);
    g.beginPath(); g.moveTo(0, 20); g.lineTo(20, 0); g.strokePath();
    g.generateTexture('slash', 20, 20);
    g.clear();

    // --- TREE (32x48) ---
    g.fillStyle(0x78350f, 1); g.fillRect(13, 32, 6, 16);
    g.fillStyle(0x15803d, 1); g.fillCircle(16, 16, 14);
    g.fillStyle(0x166534, 1); g.fillCircle(12, 20, 10); g.fillCircle(20, 20, 10);
    g.fillStyle(0x14532d, 1); g.fillCircle(16, 28, 8);
    g.generateTexture('tree', 32, 48);
    g.clear();

    // --- ROAD tile (32x32) ---
    g.fillStyle(0x8b6b45, 1); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xa17a4a, 1); g.fillRect(0, 0, 16, 16); g.fillRect(16, 16, 16, 16);
    g.fillStyle(0x6b4f2a, 1); g.fillRect(5, 6, 4, 2); g.fillRect(21, 12, 5, 2); g.fillRect(14, 22, 3, 2);
    g.generateTexture('road', 32, 32);
    g.clear();

    // --- HEALING TREE (32x48) ---
    g.fillStyle(0x6b3f1f, 1); g.fillRect(13, 28, 6, 20);
    g.fillStyle(0x22c55e, 1); g.fillCircle(16, 14, 14);
    g.fillStyle(0x86efac, 1); g.fillCircle(11, 18, 8); g.fillCircle(21, 18, 8);
    g.fillStyle(0xfde68a, 1); g.fillCircle(10, 11, 2); g.fillCircle(21, 11, 2); g.fillCircle(16, 20, 2);
    g.generateTexture('heal-tree', 32, 48);
    g.clear();

    // --- VENOM SPIDER (24x24) ---
    g.fillStyle(0x111827, 1); g.fillCircle(12, 12, 7); g.fillCircle(12, 7, 5);
    g.lineStyle(2, 0x374151, 1);
    g.beginPath(); g.moveTo(5, 10); g.lineTo(0, 6); g.moveTo(5, 14); g.lineTo(0, 18); g.moveTo(19, 10); g.lineTo(24, 6); g.moveTo(19, 14); g.lineTo(24, 18); g.strokePath();
    g.fillStyle(0xef4444, 1); g.fillCircle(10, 7, 1.5); g.fillCircle(14, 7, 1.5);
    g.generateTexture('spider', 24, 24);
    g.clear();

    // --- ROOT BEAST (32x32) ---
    g.fillStyle(0x3f6212, 1); g.fillRect(7, 12, 18, 14);
    g.fillStyle(0x65a30d, 1); g.fillRect(10, 8, 12, 8);
    g.fillStyle(0x78350f, 1); g.fillRect(6, 24, 6, 8); g.fillRect(20, 24, 6, 8);
    g.fillStyle(0x14532d, 1); g.fillRect(4, 14, 4, 10); g.fillRect(24, 14, 4, 10);
    g.fillStyle(0xfef08a, 1); g.fillRect(11, 12, 3, 3); g.fillRect(18, 12, 3, 3);
    g.generateTexture('root-beast', 32, 32);
    g.clear();

    // --- STONE SENTINEL (28x36) ---
    g.fillStyle(0x4b5563, 1); g.fillRect(6, 12, 16, 16);
    g.fillStyle(0x9ca3af, 1); g.fillRect(8, 4, 12, 10);
    g.fillStyle(0x6b7280, 1); g.fillRect(5, 28, 6, 8); g.fillRect(17, 28, 6, 8);
    g.fillStyle(0x22d3ee, 1); g.fillRect(10, 8, 2, 2); g.fillRect(16, 8, 2, 2);
    g.generateTexture('sentinel', 28, 36);
    g.clear();

    // --- GEM pickup (16x16) ---
    g.fillStyle(0x22c55e, 1);
    g.fillTriangle(8, 0, 16, 6, 8, 16);
    g.fillTriangle(8, 0, 0, 6, 8, 16);
    g.fillStyle(0x86efac, 1); g.fillTriangle(8, 2, 13, 6, 8, 11);
    g.generateTexture('gem-green', 16, 16);
    g.clear();

    // --- SOULSHARD pickup (16x16) ---
    g.fillStyle(0xa855f7, 1);
    g.fillTriangle(8, 0, 14, 8, 8, 16);
    g.fillTriangle(8, 0, 2, 8, 8, 16);
    g.fillStyle(0xe9d5ff, 1); g.fillRect(7, 4, 2, 8);
    g.generateTexture('soulshard', 16, 16);
    g.clear();

    // --- EMBER FRUIT pickup (16x16) ---
    g.fillStyle(0xf97316, 1); g.fillCircle(8, 9, 6);
    g.fillStyle(0x15803d, 1); g.fillRect(7, 1, 2, 4); g.fillTriangle(8, 3, 4, 6, 8, 7);
    g.fillStyle(0xfde68a, 1); g.fillCircle(6, 7, 2);
    g.generateTexture('ember-fruit', 16, 16);
    g.clear();

    // ─── CREAT COMPANION textures (one per element) ──────────────────────
    // FIRE CREAT: flame drake (24x28) — red/orange
    g.fillStyle(0x991b1b, 1); g.fillRect(6, 18, 8, 10); g.fillRect(14, 18, 8, 10);
    g.fillStyle(0xdc2626, 1); g.fillRect(4, 8, 16, 14);
    g.fillStyle(0xf97316, 1); g.fillRect(6, 2, 4, 8); g.fillRect(14, 2, 4, 8);
    g.fillStyle(0xfca5a5, 1); g.fillRect(6, 10, 12, 8);
    g.fillStyle(0xfbbf24, 1); g.fillRect(8, 12, 2, 2); g.fillRect(14, 12, 2, 2);
    g.fillStyle(0xf97316, 0.8); g.fillTriangle(22, 6, 24, 12, 20, 14);
    g.generateTexture('creat-fire', 24, 28);
    g.clear();

    // WATER CREAT: tide serpent (24x28) — deep blue
    g.fillStyle(0x1e40af, 1); g.fillRect(4, 10, 16, 18);
    g.fillStyle(0x3b82f6, 1); g.fillRect(6, 6, 12, 12);
    g.fillStyle(0x60a5fa, 1); g.fillRect(8, 8, 8, 6);
    g.fillStyle(0xbfdbfe, 1); g.fillRect(9, 10, 2, 2); g.fillRect(13, 10, 2, 2);
    g.fillStyle(0x3b82f6, 0.8); g.fillTriangle(0, 14, 5, 10, 5, 18); g.fillTriangle(24, 14, 19, 10, 19, 18);
    g.generateTexture('creat-water', 24, 28);
    g.clear();

    // EARTH CREAT: moss boar (28x26) — deep green/brown
    g.fillStyle(0x3f6212, 1); g.fillRect(4, 10, 20, 14);
    g.fillStyle(0x65a30d, 1); g.fillRect(6, 6, 16, 10);
    g.fillStyle(0x78350f, 1); g.fillRect(2, 8, 5, 3); g.fillRect(21, 8, 5, 3);
    g.fillStyle(0x4ade80, 1); g.fillRect(8, 8, 3, 3); g.fillRect(17, 8, 3, 3);
    g.fillStyle(0x166534, 1); g.fillRect(3, 22, 5, 4); g.fillRect(10, 22, 5, 4); g.fillRect(17, 22, 5, 4); g.fillRect(24, 22, 5, 4);
    g.generateTexture('creat-earth', 28, 26);
    g.clear();

    // STORM CREAT: thunder hound (26x24) — yellow/gold with sparks
    g.fillStyle(0x713f12, 1); g.fillRect(4, 16, 6, 8); g.fillRect(16, 16, 6, 8);
    g.fillStyle(0xca8a04, 1); g.fillRect(2, 8, 22, 14);
    g.fillStyle(0xfde68a, 1); g.fillRect(4, 6, 18, 8);
    g.fillStyle(0xeab308, 1); g.fillRect(8, 6, 3, 3); g.fillRect(15, 6, 3, 3);
    g.fillStyle(0xfbbf24, 0.7); g.fillTriangle(8, 2, 12, 8, 6, 8); g.fillTriangle(16, 2, 20, 8, 14, 8);
    g.generateTexture('creat-storm', 26, 24);
    g.clear();

    // LIGHT CREAT: radiant stag (28x32) — white/gold
    g.fillStyle(0xf3f4f6, 1); g.fillRect(6, 18, 6, 14); g.fillRect(18, 18, 6, 14);
    g.fillStyle(0xfafafa, 1); g.fillRect(4, 8, 20, 16);
    g.fillStyle(0xfde68a, 1); g.fillRect(6, 6, 16, 8);
    g.fillStyle(0xfbbf24, 1); g.fillRect(6, 0, 3, 8); g.fillRect(4, 0, 8, 3); g.fillRect(19, 0, 3, 8); g.fillRect(17, 0, 8, 3);
    g.fillStyle(0x6366f1, 1); g.fillRect(10, 9, 3, 3); g.fillRect(17, 9, 3, 3);
    g.generateTexture('creat-light', 28, 32);
    g.clear();

    // SHADOW CREAT: phantom panther (26x22) — deep purple/black
    g.fillStyle(0x1e1b4b, 1); g.fillRect(2, 10, 22, 12);
    g.fillStyle(0x4c1d95, 1); g.fillRect(4, 6, 18, 10);
    g.fillStyle(0x7c3aed, 1); g.fillRect(6, 8, 14, 6);
    g.fillStyle(0xc4b5fd, 1); g.fillRect(8, 10, 2, 2); g.fillRect(16, 10, 2, 2);
    g.fillStyle(0x4c1d95, 0.8); g.fillRect(2, 4, 4, 4); g.fillRect(20, 4, 4, 4);
    g.generateTexture('creat-shadow', 26, 22);
    g.clear();

    // ARCANE CREAT: cosmic fox (26x26) — teal/cyan with tails
    g.fillStyle(0x0e7490, 1); g.fillRect(4, 14, 6, 12); g.fillRect(16, 14, 6, 12);
    g.fillStyle(0x06b6d4, 1); g.fillRect(4, 6, 18, 14);
    g.fillStyle(0xa5f3fc, 1); g.fillRect(6, 8, 14, 8);
    g.fillStyle(0xe0f2fe, 1); g.fillRect(9, 10, 2, 2); g.fillRect(15, 10, 2, 2);
    g.fillStyle(0x0891b2, 1); g.fillTriangle(4, 6, 0, 0, 8, 4); g.fillTriangle(22, 6, 26, 0, 18, 4);
    g.fillStyle(0x67e8f9, 0.6); g.fillRect(20, 16, 4, 3); g.fillRect(22, 14, 4, 3); g.fillRect(20, 20, 6, 3);
    g.generateTexture('creat-arcane', 26, 26);
    g.clear();

    // ─── VOLCANO ZONE textures ────────────────────────────────────────────
    // LAVA TILE (32x32) — dark volcanic ground
    g.fillStyle(0x1c0a00, 1); g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x7f1d1d, 1); g.fillRect(0, 0, 14, 14); g.fillRect(18, 18, 14, 14);
    g.fillStyle(0xb45309, 1); g.fillRect(2, 2, 10, 10); g.fillRect(20, 20, 10, 10);
    g.fillStyle(0xf97316, 0.5); g.fillRect(5, 5, 4, 4); g.fillRect(23, 23, 4, 4);
    g.lineStyle(1, 0xef4444, 0.7);
    g.beginPath(); g.moveTo(14, 0); g.lineTo(16, 14); g.moveTo(0, 16); g.lineTo(14, 18); g.strokePath();
    g.generateTexture('lava-tile', 32, 32);
    g.clear();

    // EMBERLING (20x20) — small fire imp enemy
    g.fillStyle(0x7f1d1d, 1); g.fillRect(6, 12, 4, 8); g.fillRect(10, 12, 4, 8);
    g.fillStyle(0xdc2626, 1); g.fillRect(4, 6, 12, 10);
    g.fillStyle(0xf97316, 1); g.fillRect(4, 2, 4, 6); g.fillRect(12, 2, 4, 6);
    g.fillStyle(0xfbbf24, 1); g.fillRect(7, 9, 2, 2); g.fillRect(11, 9, 2, 2);
    g.generateTexture('emberling', 20, 20);
    g.clear();

    // LAVA HOUND (36x28) — large fire beast enemy
    g.fillStyle(0x7c2d12, 1); g.fillRect(4, 16, 8, 12); g.fillRect(24, 16, 8, 12);
    g.fillStyle(0xb45309, 1); g.fillRect(2, 6, 32, 18);
    g.fillStyle(0xf97316, 1); g.fillRect(4, 4, 24, 10);
    g.fillStyle(0xfde68a, 1); g.fillRect(8, 8, 3, 3); g.fillRect(18, 8, 3, 3);
    g.fillStyle(0xef4444, 0.7); g.fillTriangle(0, 6, 4, 0, 8, 8); g.fillTriangle(14, 2, 18, 8, 22, 2); g.fillTriangle(28, 6, 32, 8, 36, 0);
    g.generateTexture('lava-hound', 36, 28);
    g.clear();

    // RED GEM pickup (16x16) — fire zone drop
    g.fillStyle(0xdc2626, 1); g.fillTriangle(8, 0, 16, 6, 8, 16); g.fillTriangle(8, 0, 0, 6, 8, 16);
    g.fillStyle(0xfca5a5, 1); g.fillTriangle(8, 2, 13, 6, 8, 11);
    g.generateTexture('gem-red', 16, 16);
    g.clear();

    // FIRE SHARD pickup (16x16)
    g.fillStyle(0xb45309, 1); g.fillRect(4, 0, 8, 16);
    g.fillStyle(0xf97316, 1); g.fillRect(6, 2, 4, 12);
    g.fillStyle(0xfbbf24, 1); g.fillRect(7, 4, 2, 8);
    g.generateTexture('fire-shard', 16, 16);
    g.clear();

    // CROWN ICON (40x32) — used in CrownForge UI
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(4, 14, 32, 18);
    g.fillTriangle(4, 14, 8, 2, 14, 14);
    g.fillTriangle(16, 14, 20, 2, 26, 14);
    g.fillTriangle(28, 14, 32, 2, 38, 14);
    g.fillStyle(0xfef08a, 1); g.fillRect(6, 16, 28, 12);
    g.fillStyle(0x22c55e, 1); g.fillCircle(20, 6, 3);
    g.fillStyle(0xef4444, 1); g.fillCircle(10, 9, 2); g.fillCircle(30, 9, 2);
    g.generateTexture('crown-icon', 40, 32);
    g.clear();

    // ASH TREE (32x48) — dead volcanic tree
    g.fillStyle(0x44403c, 1); g.fillRect(13, 30, 6, 18);
    g.fillStyle(0x57534e, 1); g.fillRect(8, 4, 6, 26); g.fillRect(18, 8, 6, 20);
    g.fillStyle(0x78716c, 1); g.fillRect(4, 4, 5, 3); g.fillRect(23, 8, 5, 3); g.fillRect(22, 16, 5, 3);
    g.generateTexture('ash-tree', 32, 48);
    g.clear();

    // keep fallback textures too
    g.fillStyle(0xff4444, 1); g.fillRect(0, 0, 32, 32);
    g.generateTexture('red', 32, 32);
    g.clear();
    g.fillStyle(0x44ff44, 1); g.fillRect(0, 0, 32, 32);
    g.generateTexture('green', 32, 32);

      // ─── TATTOO TEXTURES (14x14) for Hybrid Heroes ────────────────────────
      // FIRE TATTOO: upward flame shape
      g.fillStyle(0xf97316, 1);
      g.fillTriangle(7, 12, 3, 6, 5, 2);
      g.fillTriangle(7, 12, 11, 6, 9, 2);
      g.fillStyle(0xfbbf24, 1);
      g.fillTriangle(7, 10, 5, 5, 6, 2);
      g.fillTriangle(7, 10, 9, 5, 8, 2);
      g.generateTexture('tattoo-fire', 14, 14);
      g.clear();

      // WATER TATTOO: ripple pattern
      g.lineStyle(1, 0x3b82f6, 1);
      g.strokeCircle(7, 7, 6);
      g.lineStyle(1, 0x60a5fa, 0.8);
      g.strokeCircle(7, 7, 4);
      g.fillStyle(0x60a5fa, 0.6);
      g.fillCircle(7, 7, 1);
      g.generateTexture('tattoo-water', 14, 14);
      g.clear();

      // EARTH TATTOO: tree/root pattern
      g.fillStyle(0x15803d, 1);
      g.fillRect(6, 8, 2, 4);
      g.fillStyle(0x22c55e, 1);
      g.fillCircle(7, 6, 3);
      g.fillStyle(0x4ade80, 1);
      g.fillCircle(4, 8, 2);
      g.fillCircle(10, 8, 2);
      g.generateTexture('tattoo-earth', 14, 14);
      g.clear();

      // STORM TATTOO: lightning bolt
      g.lineStyle(2, 0xfbbf24, 1);
      g.beginPath(); g.moveTo(7, 1); g.lineTo(4, 7); g.lineTo(7, 7); g.lineTo(5, 13); g.moveTo(9, 5); g.lineTo(11, 7); g.lineTo(8, 9); g.lineTo(12, 13); g.strokePath();
      g.fillStyle(0xfef08a, 0.8);
      g.fillTriangle(7, 2, 5, 6, 7, 6);
      g.generateTexture('tattoo-storm', 14, 14);
      g.clear();

      // LIGHT TATTOO: radiant star
      g.fillStyle(0xfef08a, 1);
      g.fillTriangle(7, 1, 9, 7, 14, 7);
      g.fillTriangle(14, 7, 9, 9, 11, 14);
      g.fillTriangle(11, 14, 7, 10, 7, 13);
      g.fillTriangle(7, 13, 5, 14, 3, 9);
      g.fillTriangle(3, 9, 5, 7, 0, 7);
      g.fillTriangle(0, 7, 5, 5, 7, 1);
      g.fillStyle(0xfbbf24, 0.9);
      g.fillCircle(7, 7, 2);
      g.generateTexture('tattoo-light', 14, 14);
      g.clear();

      // SHADOW TATTOO: crescent moon
      g.fillStyle(0x4c1d95, 1);
      g.fillCircle(7, 7, 5);
      g.fillStyle(0x000000, 1);
      g.fillCircle(9, 6, 5);
      g.fillStyle(0xc4b5fd, 0.6);
      g.fillCircle(6, 8, 1);
      g.generateTexture('tattoo-shadow', 14, 14);
      g.clear();

      // ARCANE TATTOO: mystical rune circle
      g.lineStyle(1.5, 0x06b6d4, 1);
      g.strokeCircle(7, 7, 5);
      g.fillStyle(0x0891b2, 1);
      g.fillTriangle(7, 3, 10, 5, 8, 7);
      g.fillTriangle(7, 3, 4, 5, 6, 7);
      g.fillTriangle(7, 11, 10, 9, 8, 7);
      g.fillTriangle(7, 11, 4, 9, 6, 7);
      g.fillStyle(0xa5f3fc, 0.8);
      g.fillCircle(7, 7, 1);
      g.generateTexture('tattoo-arcane', 14, 14);
      g.clear();

    g.destroy();

    AudioManager.preload(this);
  }

  create() {
    LayoutManager.init(this);
    AudioManager.init(this);
    AudioManager.playMusic(AudioManager.MENU_THEME);
    this.scene.start('Preload');
  }
}
