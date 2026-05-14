import Phaser from 'phaser';
import { updateAchievementRegistryFlags } from '../progression/achievements';

interface GemSlot {
  kind: string;
  color: number;
  textColor: string;
  label: string;
  key: string;
}

const GEMS: GemSlot[] = [
  { kind: 'red',    color: 0xdc2626, textColor: '#fca5a5', label: '🔴 Red Gem (Fire)',    key: 'gem-red' },
  { kind: 'green',  color: 0x16a34a, textColor: '#86efac', label: '🟢 Green Gem (Earth)', key: 'gem-green' },
  { kind: 'blue',   color: 0x1d4ed8, textColor: '#93c5fd', label: '🔵 Blue Gem (Water)',  key: 'soulshard' },
  { kind: 'purple', color: 0x7c3aed, textColor: '#d8b4fe', label: '🟣 Soulshard (Shadow)',key: 'soulshard' },
  { kind: 'clear',  color: 0xfbbf24, textColor: '#fef9c3', label: '✨ Clear (Storm)',      key: 'gem-green' },
];

const CROWN_NAMES: Record<string, string> = {
  red:    "Infernal Diadem",
  green:  "Earthwarden Circlet",
  blue:   "Tidecrown",
  purple: "Eclipse Crown",
  clear:  "Stormhalo",
};

const CROWN_BONUSES: Record<string, string> = {
  red:    "+25% Attack, Fire crit. Duration: 5 battles",
  green:  "+30% Defense, Earth resist. Duration: 6 battles",
  blue:   "+20% Healing, Water regen. Duration: 5 battles",
  purple: "+20% Stealth, Lifesteal. Duration: 4 battles",
  clear:  "+15% Speed, Lightning crit. Duration: 5 battles",
};

export default class CrownForge extends Phaser.Scene {
  private selectedGem = '';
  private gemButtons: Map<string, { box: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }> = new Map();
  private statusText!: Phaser.GameObjects.Text;
  private crownPreview!: Phaser.GameObjects.Sprite;
  private forgeBtn!: Phaser.GameObjects.Rectangle;
  private forgeBtnLabel!: Phaser.GameObjects.Text;

  constructor() { super('CrownForge'); }

  create() {
    const { width, height } = this.scale;
    const fragments = (this.registry.get('crownFragments') as number) || 0;
    const crownsForged = (this.registry.get('crownsForged') as number) || 0;

    // ── Background ───────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1c0a00, 0x0f0a1e, 0x0a0310, 0x1c0a00, 1);
    bg.fillRect(0, 0, width, height);

    // Glowing forge center
    const glow = this.add.graphics();
    glow.fillStyle(0xfbbf24, 0.04); glow.fillCircle(width / 2, height / 2 - 30, 180);
    glow.fillStyle(0xfbbf24, 0.07); glow.fillCircle(width / 2, height / 2 - 30, 100);
    this.tweens.add({ targets: glow, alpha: 0.4, yoyo: true, repeat: -1, duration: 1600 });

    // Title
    this.add.text(width / 2, 24, '⚜  CROWN FORGE  ⚜', {
      color: '#fbbf24', fontSize: '22px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(3);
    this.add.text(width / 2, 46, 'Forge crowns from fragments and elemental gems', {
      color: '#78716c', fontSize: '12px'
    }).setOrigin(0.5).setDepth(3);

    // Fragment counter
    const fragColor = fragments >= 3 ? '#fde68a' : '#ef4444';
    this.add.text(width / 2, 68, `Crown Fragments: ${fragments} / 3 required`, {
      color: fragColor, fontSize: '14px', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);

    // Fragment icons
    for (let i = 0; i < 3; i++) {
      const fx = width / 2 - 24 + i * 24;
      const filled = i < fragments;
      const fragG = this.add.graphics().setDepth(3);
      fragG.fillStyle(filled ? 0xfbbf24 : 0x44403c, 1);
      fragG.fillTriangle(fx, 84, fx + 10, 96, fx - 2, 96);
      if (filled) this.tweens.add({ targets: fragG, alpha: 0.5, yoyo: true, repeat: -1, duration: 700 + i * 200 });
    }

    // Crown preview
    this.crownPreview = this.add.sprite(width / 2, height / 2 - 60, 'crown-icon')
      .setScale(2.5).setDepth(5).setAlpha(0.4);
    this.tweens.add({ targets: this.crownPreview, y: height / 2 - 66, yoyo: true, repeat: -1, duration: 1400 });

    // Gem selection header
    this.add.text(width / 2, height / 2 + 20, 'Select a Gem to socket into the Crown:', {
      color: '#94a3b8', fontSize: '13px'
    }).setOrigin(0.5).setDepth(3);

    // Gem buttons
    const gemW = (width - 60) / GEMS.length;
    GEMS.forEach((gem, i) => {
      const bx = 30 + gemW * i + gemW / 2;
      const by = height / 2 + 60;
      const box = this.add.rectangle(bx, by, gemW - 8, 46, 0x1c1917, 0.8)
        .setStrokeStyle(2, gem.color, 0.5).setDepth(5).setInteractive({ useHandCursor: true });
      const label = this.add.text(bx, by, gem.label, {
        color: '#6b7280', fontSize: '11px', align: 'center', wordWrap: { width: gemW - 12 }
      }).setOrigin(0.5).setDepth(6);

      box.on('pointerdown', () => this.selectGem(gem.kind));
      box.on('pointerover', () => { if (this.selectedGem !== gem.kind) box.setStrokeStyle(2, gem.color, 1); });
      box.on('pointerout',  () => { if (this.selectedGem !== gem.kind) box.setStrokeStyle(2, gem.color, 0.5); });
      this.gemButtons.set(gem.kind, { box, label });
    });

    // Status / bonus text
    this.statusText = this.add.text(width / 2, height / 2 + 108, 'Choose a gem to see the crown bonus', {
      color: '#475569', fontSize: '12px', align: 'center'
    }).setOrigin(0.5).setDepth(5);

    // Forge button
    this.forgeBtn = this.add.rectangle(width / 2, height / 2 + 148, 220, 44, 0x44403c, 0.6)
      .setStrokeStyle(2, 0x78716c, 0.5).setDepth(5).setInteractive({ useHandCursor: true });
    this.forgeBtnLabel = this.add.text(width / 2, height / 2 + 148, fragments >= 3 ? '⚒  FORGE CROWN' : 'Need 3 Fragments', {
      color: fragments >= 3 ? '#d6d3d1' : '#57534e', fontSize: '16px', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);

    this.forgeBtn.on('pointerdown', () => this.doForge());
    this.forgeBtn.on('pointerover', () => {
      if (fragments >= 3 && this.selectedGem) this.forgeBtn.setAlpha(1);
    });
    this.forgeBtn.on('pointerout', () => this.forgeBtn.setAlpha(0.85));

    // Crowns forged counter
    this.add.text(width - 10, height - 48, `Crowns Forged: ${crownsForged}`, {
      color: '#57534e', fontSize: '12px'
    }).setOrigin(1, 0).setDepth(5);

    // Back button
    const backBtn = this.add.text(10, height - 34, '← Haven', {
      color: '#d1d5db', fontSize: '14px', backgroundColor: '#1f2937',
      stroke: '#000', strokeThickness: 2
    }).setPadding(6, 3).setDepth(10).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('HavenGrounds'));
    backBtn.on('pointerover', () => backBtn.setColor('#fff'));
    backBtn.on('pointerout',  () => backBtn.setColor('#d1d5db'));

    // How-to text
    this.add.text(width / 2, height - 22, '3 Crown Fragments + 1 Gem = Forged Crown  •  Crowns shatter after 5 battles — no recovery', {
      color: '#374151', fontSize: '10px'
    }).setOrigin(0.5).setDepth(5);
  }

  private selectGem(kind: string) {
    this.selectedGem = kind;
    const found = GEMS.find((g) => g.kind === kind)!;
    const fragments = (this.registry.get('crownFragments') as number) || 0;

    this.gemButtons.forEach((btn, k) => {
      const g = GEMS.find((x) => x.kind === k)!;
      if (k === kind) {
        btn.box.setStrokeStyle(3, g.color, 1).setFillStyle(g.color, 0.2);
        btn.label.setColor(g.textColor);
      } else {
        btn.box.setStrokeStyle(1, g.color, 0.4).setFillStyle(0x1c1917, 0.8);
        btn.label.setColor('#6b7280');
      }
    });

    const crownName = CROWN_NAMES[kind] || 'Crown';
    const bonus = CROWN_BONUSES[kind] || '';
    this.statusText.setText(`${crownName}\n${bonus}`).setColor(found.textColor);
    this.crownPreview.setTint(found.color).setAlpha(fragments >= 3 ? 1.0 : 0.5);

    if (fragments >= 3) {
      this.forgeBtnLabel.setText('⚒  FORGE CROWN').setColor('#fde68a');
      this.forgeBtn.setFillStyle(0x78350f, 0.85).setStrokeStyle(2, 0xfbbf24, 0.9);
    }
  }

  private doForge() {
    const fragments = (this.registry.get('crownFragments') as number) || 0;
    if (fragments < 3 || !this.selectedGem) {
      this.statusText.setText(fragments < 3 ? 'Need 3 Crown Fragments! Defeat the Crown Trial boss.' : 'Select a Gem first!').setColor('#ef4444');
      return;
    }

    const crownName = CROWN_NAMES[this.selectedGem] || 'Crown';
    const bonus = CROWN_BONUSES[this.selectedGem] || '';
    const found = GEMS.find((g) => g.kind === this.selectedGem)!;

    // Deduct fragments, track crowns forged
    this.registry.set('crownFragments', fragments - 3);
    this.registry.set('crownsForged', (this.registry.get('crownsForged') as number || 0) + 1);
    this.registry.set('activeCrown', crownName);
    this.registry.set('activeCrownBonus', bonus);
    this.registry.set('totalKills', (this.registry.get('totalKills') as number || 0)); // quest trigger
    updateAchievementRegistryFlags(this.registry);

    // Forge animation
    const { width, height } = this.scale;
    this.cameras.main.flash(400, 255, 200, 0);
    this.cameras.main.shake(300, 0.018);
    this.crownPreview.setTint(found.color).setScale(4);
    this.tweens.add({ targets: this.crownPreview, scaleX: 2.5, scaleY: 2.5, duration: 600 });

    // Success overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0).setDepth(20);
    this.tweens.add({ targets: overlay, alpha: 0.7, duration: 300, onComplete: () => {
      this.add.text(width / 2, height / 2 - 40, '⚜ CROWN FORGED ⚜', {
        color: '#fbbf24', fontSize: '28px', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(21);
      this.add.text(width / 2, height / 2 + 4, crownName, {
        color: found.textColor, fontSize: '20px', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(21);
      this.add.text(width / 2, height / 2 + 30, bonus, {
        color: '#94a3b8', fontSize: '13px', align: 'center', wordWrap: { width: 400 }
      }).setOrigin(0.5).setDepth(21);
      this.add.text(width / 2, height / 2 + 68, '"Wear it with purpose. It will not last forever."', {
        color: '#6b7280', fontSize: '12px', fontStyle: 'italic'
      }).setOrigin(0.5).setDepth(21);

      const cont = this.add.text(width / 2, height / 2 + 100, '[ Click to return to Haven ]', {
        color: '#475569', fontSize: '13px'
      }).setOrigin(0.5).setDepth(21);
      this.tweens.add({ targets: cont, alpha: 0.3, yoyo: true, repeat: -1, duration: 800 });
      this.input.once('pointerdown', () => this.scene.start('HavenGrounds'));
    }});
  }
}
