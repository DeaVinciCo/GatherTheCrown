import Phaser from 'phaser';
import HeroSprite from '../actors/HeroSprite';
import { gameRegistry } from '../registry/GameRegistry';
import { ProgressiveSkillLessonSystem } from '../systems/ProgressiveSkillLessonSystem';
import { createInventoryEntries, getItemById } from '../systems/MasterItemCatalog';
import { InventoryMenu, type InventoryItem } from '../ui/InventoryMenu';
import { openGameChatOverlay } from '../ui/GameChatOverlay';
import { SettingsPanel } from '../ui/SettingsPanel';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';

type IntroEnemyKind = 'venom-spider' | 'root-beast';
type IntroPickupKind = 'green-gem' | 'soulshard' | 'ember-fruit' | 'gold-cache';

interface IntroEnemy {
  kind: IntroEnemyKind;
  label: string;
  sprite: Phaser.GameObjects.Sprite;
  hp: number;
  maxHp: number;
  hpBg: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Image;
  speed: number;
  touchDamage: number;
  rewardGold: number;
  patrolPoints: Array<{ x: number; y: number }>;
  patrolIndex: number;
}

interface IntroPickup {
  kind: IntroPickupKind;
  label: string;
  sprite: Phaser.GameObjects.Sprite;
  amount: number;
  required: boolean;
  glow?: Phaser.GameObjects.Arc;
}

interface FirstMark {
  id: string;
  title: string;
  description: string;
}

interface FishSpot {
  zone: Phaser.GameObjects.Zone;
  ripple: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  isFishing: boolean;
  nextReadyAt: number;
}

export default class HavenIntro extends Phaser.Scene {
  private settingsPanel?: SettingsPanel;
  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'HavenIntro', {
    onMap: () => this.openMapMenu(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu(),
    onSettings: () => this.openSettings()
  });
  private hero!: HeroSprite;
  private enemies: IntroEnemy[] = [];
  private pickups: IntroPickup[] = [];
  private heroHp = 100;
  private heroHpBar!: Phaser.GameObjects.Image;
  private heroHpText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private shardText!: Phaser.GameObjects.Text;
  private gemText!: Phaser.GameObjects.Text;
  private fruitText!: Phaser.GameObjects.Text;
  private attackEffect!: Phaser.GameObjects.Sprite;
  private attackCooldown = 0;
  private hurtFlashTimer = 0;
  private introComplete = false;
  private totalGold = 0;
  private totalShards = 0;
  private totalGems = 0;
  private totalFruit = 0;
  private collectedCount = 0;
  private requiredCollectedCount = 0;
  private readonly totalRequiredPickups = 4;
  private readonly totalRequiredKills = 2;
  private readonly firstMarks: FirstMark[] = [
    { id: 'first-steps', title: 'First Steps', description: 'Walk your first stretch through Haven.' },
    { id: 'keen-eye', title: 'Keen Eye', description: 'Recover your first supply cache.' },
    { id: 'first-clash', title: 'First Clash', description: 'Land your first strike on a foe.' },
    { id: 'first-fall', title: 'Fallen Foe', description: 'Defeat your first Haven intruder.' },
    { id: 'shardfinder', title: 'Shardfinder', description: 'Collect your first soulshard.' },
    { id: 'grove-rest', title: 'Grove Rest', description: 'Recover at the healing grove.' },
    { id: 'pathwatcher', title: 'Pathwatcher', description: 'Discover both Haven route markers.' },
    { id: 'campfire-soul', title: 'Campfire Soul', description: 'Build your first fire beneath Haven sky.' },
    { id: 'haven-gatherer', title: 'Haven Gatherer', description: 'Gather 4 supply caches.' },
    { id: 'trialbound', title: 'Trialbound', description: 'Approach the Forest Trials marker.' },
  ];
  private unlockedMarks = new Set<string>();
  private heroStartX = 120;
  private heroStartY = 360;
  private groveTouched = false;
  private seenForestMarker = false;
  private seenSanctuaryMarker = false;
  private campfireBuilt = false;
  private campfireZone!: Phaser.GameObjects.Zone;
  private campfireSprite!: Phaser.GameObjects.Sprite;
  private fishSpots: FishSpot[] = [];
  private trapZone!: Phaser.GameObjects.Zone;
  private trapMarker!: Phaser.GameObjects.Arc;
  private trapActive = false;
  private trapReadyAt = 0;
  private trapCollects = 0;
  private treeNodeZone!: Phaser.GameObjects.Zone;
  private treeNodeSprite!: Phaser.GameObjects.Image;
  private treeHarvests = 0;
  private treeNextReadyAt = 0;
  private bonusWaymarks = new Set<string>();
  private introXp = 0;
  private skillLessons!: ProgressiveSkillLessonSystem;
  private selectingHeroGender = false;
  private genderOverlay?: Phaser.GameObjects.Container;
  private readonly markOrder: string[] = [
    'first-steps',
    'keen-eye',
    'first-clash',
    'first-fall',
    'shardfinder',
    'grove-rest',
    'campfire-soul',
    'trialbound',
    'pathwatcher',
    'haven-gatherer',
  ];
  private readonly markGuidance: Record<string, string> = {
    'first-steps': 'Step forward and follow the nearest glow.',
    'keen-eye': 'Walk over a glowing supply cache to gather it.',
    'first-clash': 'Engage a nearby foe and strike with SPACE or tap.',
    'first-fall': 'Finish off one intruder to secure the yard.',
    'shardfinder': 'Head toward the purple shard and collect it.',
    'grove-rest': 'Move through the Healing Grove to feel its restoration.',
    'campfire-soul': 'Visit the camp spot after gathering and watch the fire kindle.',
    'trialbound': 'Approach the Forest Trials marker to scout your path.',
    'pathwatcher': 'Discover both route markers: Forest Trials and Sanctuary.',
    'haven-gatherer': 'Recover all 4 supply caches to complete your prep.',
  };

  constructor() {
    super('HavenIntro');
  }

  create() {
    if (gameRegistry.isLoggedIn() || gameRegistry.isHeroForged()) {
      this.scene.start('HavenGrounds');
      return;
    }

    const { width, height } = this.scale;

    for (let tx = 0; tx < width; tx += 32) {
      for (let ty = 0; ty < height; ty += 32) {
        this.add.image(tx + 16, ty + 16, 'stone').setDepth(0).setAlpha(0.62);
      }
    }
    const sky = this.add.graphics().setDepth(0.4);
    sky.fillGradientStyle(0x10263d, 0x0f2f49, 0x0a1e2f, 0x0a1e2f, 1);
    sky.fillRect(0, 0, width, height);
    this.add.rectangle(width / 2, height / 2, width, height, 0x052e16, 0.22).setDepth(1);
    this.add.rectangle(width / 2, 28, width, 52, 0x0a0f1e, 0.95).setDepth(2);
    this.add.text(width / 2, 16, 'Haven Approach', {
      color: '#fbbf24',
      fontSize: '24px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);
    this.add.text(width / 2, 36, 'A free introduction to the kingdom. Gather supplies, defeat a few threats, then claim your path.', {
      color: '#cbd5e1',
      fontSize: '12px'
    }).setOrigin(0.5).setDepth(3);

    this.decorateGrounds();
    this.buildPhaseOneResourceNodes();

    this.hero = new HeroSprite(this, 120, 360);
    this.hero.setDepth(6);
    this.heroStartX = this.hero.x;
    this.heroStartY = this.hero.y;

    this.ensureHeroGenderSelection();

    this.spawnEnemy('venom-spider', 406, 240, [{ x: 370, y: 220 }, { x: 458, y: 260 }]);
    this.spawnEnemy('root-beast', 598, 370, [{ x: 560, y: 350 }, { x: 660, y: 395 }]);

    this.spawnPickup('gold-cache', 210, 184, 10, true);
    this.spawnPickup('ember-fruit', 252, 442, 2, true);
    this.spawnPickup('soulshard', 520, 180, 2, true);
    this.spawnPickup('green-gem', 676, 472, 1, true);

    this.attackEffect = this.add.sprite(0, 0, 'slash').setDepth(8).setVisible(false);
    this.skillLessons = new ProgressiveSkillLessonSystem(this);
    this.buildHud(width, height);

    this.input.keyboard?.on('keydown-SPACE', () => this.doAttack());
    this.input.on('pointerdown', () => this.doAttack());
    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    this.showMessage('Use your discernment. Gather what you can. Haven rewards those who see clearly.', '#a5f3fc');
    this.updateGuidance();
  }

  private ensureHeroGenderSelection() {
    const currentGender = gameRegistry.heroGender;
    if (currentGender === 'male' || currentGender === 'female') {
      this.applyHeroGenderStyle(currentGender);
      this.registry.set('heroGender', currentGender);
      return;
    }

    this.selectingHeroGender = true;
    const { width, height } = this.scale;
    const overlay = this.add.container(width / 2, height / 2).setDepth(80);
    overlay.add(this.add.rectangle(0, 0, width, height, 0x020617, 0.65));

    const panel = this.add.rectangle(0, 0, 420, 230, 0x0f172a, 0.95).setStrokeStyle(2, 0x7dd3fc, 0.7);
    overlay.add(panel);

    const title = this.add.text(0, -86, 'Choose Your Rider', {
      color: '#f8fafc',
      fontSize: '24px',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    overlay.add(title);

    const subtitle = this.add.text(0, -58, 'Pick a style before entering Haven training.', {
      color: '#cbd5e1',
      fontSize: '12px'
    }).setOrigin(0.5);
    overlay.add(subtitle);

    const makeChoice = (gender: 'male' | 'female') => {
      gameRegistry.setHeroGender(gender);
      this.registry.set('heroGender', gender);
      this.applyHeroGenderStyle(gender);
      this.selectingHeroGender = false;
      this.showMessage(gender === 'male' ? 'Rider style set: Masculine.' : 'Rider style set: Feminine.', '#93c5fd');
      overlay.destroy(true);
      this.genderOverlay = undefined;
      this.updateGuidance();
    };

    const maleBtn = this.add.rectangle(-92, 24, 120, 74, 0x1d4ed8, 0.42)
      .setStrokeStyle(2, 0x93c5fd, 0.85)
      .setInteractive({ useHandCursor: true });
    const maleText = this.add.text(-92, 24, '♂', {
      color: '#e0f2fe',
      fontSize: '36px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    maleBtn.on('pointerdown', () => makeChoice('male'));
    maleText.on('pointerdown', () => makeChoice('male'));
    overlay.add([maleBtn, maleText]);

    const femaleBtn = this.add.rectangle(92, 24, 120, 74, 0xdb2777, 0.36)
      .setStrokeStyle(2, 0xf9a8d4, 0.85)
      .setInteractive({ useHandCursor: true });
    const femaleText = this.add.text(92, 24, '♀', {
      color: '#fdf2f8',
      fontSize: '36px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    femaleBtn.on('pointerdown', () => makeChoice('female'));
    femaleText.on('pointerdown', () => makeChoice('female'));
    overlay.add([femaleBtn, femaleText]);

    const helper = this.add.text(0, 86, 'You can refine everything later in Hero Forge.', {
      color: '#94a3b8',
      fontSize: '11px'
    }).setOrigin(0.5);
    overlay.add(helper);

    this.genderOverlay = overlay;
  }

  private applyHeroGenderStyle(gender: 'male' | 'female') {
    if (gender === 'female') {
      this.hero.setScale(0.94);
      this.hero.setTint(0xfda4af);
      return;
    }
    this.hero.setScale(1);
    this.hero.setTint(0x93c5fd);
  }

  private decorateGrounds() {
    const treePositions = [
      [54, 104], [126, 82], [720, 94], [740, 500], [86, 504], [410, 84], [648, 212], [230, 526]
    ];
    for (const [x, y] of treePositions) {
      this.add.image(x, y, 'tree').setDepth(2).setScale(0.72);
    }

    this.add.rectangle(414, 310, 540, 270, 0x0f172a, 0.32).setDepth(2).setStrokeStyle(2, 0x334155, 0.7);
    this.add.text(414, 168, 'Training Yard', { color: '#93c5fd', fontSize: '12px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);
    this.add.text(414, 188, 'Gather the loose supplies, defeat the intruders, and prove you are ready to step into the deeper kingdom.', {
      color: '#94a3b8',
      fontSize: '12px',
      wordWrap: { width: 420 },
      align: 'center'
    }).setOrigin(0.5).setDepth(3);

    this.add.text(668, 116, 'Forest Trials ahead', { color: '#fde68a', fontSize: '10px' }).setOrigin(0.5).setDepth(3);
    this.add.text(150, 118, 'Sanctuary grounds', { color: '#a5f3fc', fontSize: '10px' }).setOrigin(0.5).setDepth(3);

    this.add.circle(152, 308, 36, 0x34d399, 0.16).setDepth(2).setStrokeStyle(2, 0x86efac, 0.55);
    const healingTreePoints: Array<[number, number]> = [
      [124, 298], [152, 284], [180, 298], [136, 326], [168, 326]
    ];
    for (const [x, y] of healingTreePoints) {
      this.add.image(x, y, 'heal-tree').setDepth(3).setScale(0.88);
    }
    this.add.text(152, 350, 'Healing Grove', { color: '#86efac', fontSize: '11px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(3);

    this.add.circle(412, 472, 26, 0xf97316, 0.12).setDepth(2).setStrokeStyle(2, 0xfb923c, 0.5);
    this.add.text(412, 508, 'Camp Spot', { color: '#fdba74', fontSize: '10px' }).setOrigin(0.5).setDepth(3);

    this.campfireZone = this.add.zone(412, 472, 64, 64).setDepth(2);
    this.campfireSprite = this.add.sprite(412, 472, 'ember-fruit').setDepth(4).setScale(0.8).setAlpha(0.35);
  }

  private buildPhaseOneResourceNodes() {
    const fishSpotA = this.createFishSpot(704, 322, 'River Bend');
    const fishSpotB = this.createFishSpot(596, 502, 'Quiet Pool');
    this.fishSpots = [fishSpotA, fishSpotB];

    this.trapZone = this.add.zone(250, 524, 70, 60).setDepth(2);
    this.trapMarker = this.add.circle(250, 524, 12, 0x94a3b8, 0.16).setDepth(3).setStrokeStyle(1, 0xcbd5e1, 0.4);
    this.add.text(250, 548, 'Lure Station', { color: '#cbd5e1', fontSize: '10px' }).setOrigin(0.5).setDepth(3);

    this.treeNodeZone = this.add.zone(560, 126, 58, 58).setDepth(2);
    this.treeNodeSprite = this.add.image(560, 126, 'tree').setScale(0.84).setDepth(3).setTint(0xb7f0a6);
    this.add.text(560, 160, 'Harvest Tree', { color: '#bbf7d0', fontSize: '10px' }).setOrigin(0.5).setDepth(3);
  }

  private createFishSpot(x: number, y: number, label: string): FishSpot {
    const ripple = this.add.circle(x, y, 18, 0x38bdf8, 0.08).setDepth(2).setStrokeStyle(1, 0x7dd3fc, 0.35);
    this.tweens.add({
      targets: ripple,
      scale: { from: 0.96, to: 1.1 },
      alpha: { from: 0.05, to: 0.13 },
      duration: 1200,
      yoyo: true,
      repeat: -1
    });
    const text = this.add.text(x, y + 28, label, { color: '#bae6fd', fontSize: '10px' }).setOrigin(0.5).setDepth(3);
    const zone = this.add.zone(x, y, 68, 62).setDepth(2);
    return { zone, ripple, label: text, isFishing: false, nextReadyAt: 0 };
  }

  private buildHud(width: number, height: number) {
    this.add.image(width - 165, 18, 'hpbg').setDepth(10).setDisplaySize(100, 10);
    this.heroHpBar = this.add.image(width - 215, 18, 'hpfill').setDepth(11).setDisplaySize(100, 10).setOrigin(0, 0.5);
    this.heroHpText = this.add.text(width - 215, 6, 'HP 100/100', { color: '#f87171', fontSize: '12px' }).setDepth(11);

    this.goldText = this.add.text(10, height - 68, 'Gold: 0', { color: '#fbbf24', fontSize: '13px' }).setDepth(11);
    this.shardText = this.add.text(120, height - 68, 'Soulshards: 0', { color: '#d8b4fe', fontSize: '13px' }).setDepth(11);
    this.gemText = this.add.text(292, height - 68, 'Green Gems: 0', { color: '#86efac', fontSize: '13px' }).setDepth(11);
    this.fruitText = this.add.text(468, height - 68, 'Ember Fruit: 0', { color: '#fb923c', fontSize: '13px' }).setDepth(11);

    this.objectiveText = this.add.text(10, height - 44, 'Objectives: clear 2 intruders, gather 4 caches, and claim 10 First Marks.', {
      color: '#fef3c7',
      fontSize: '13px'
    }).setDepth(11);

    this.promptText = this.add.text(width - 10, height - 24, 'Follow your next step and keep moving through Haven.', {
      color: '#93c5fd',
      fontSize: '11px'
    }).setOrigin(1, 0).setDepth(11);

    this.add.text(width - 10, 54, 'M=Map  I=Inventory  Shift=Chat  O=Settings', {
      color: '#94a3b8',
      fontSize: '11px'
    }).setOrigin(1, 0).setDepth(11);
  }

  private openInventory() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.inventory-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const items: InventoryItem[] = this.registry.get('inventory') || gameRegistry.inventory || [];
    const playerLevel = Number(this.registry.get('currentCrownLevel') || this.registry.get('playerLevel') || this.registry.get('level') || 1);
    new InventoryMenu(items, (updated) => this.registry.set('inventory', updated), { playerLevel }).attach(container);
  }

  private openMapMenu() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.map-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const root = document.createElement('div');
    root.className = 'map-menu';
    Object.assign(root.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(10, 15, 30, 0.72)',
      backdropFilter: 'blur(4px)',
      color: '#d1d5db',
      border: '1px solid #334155',
      borderRadius: '10px',
      minWidth: '320px',
      padding: '12px',
      zIndex: '99',
      boxShadow: '0 12px 30px rgba(0,0,0,0.45)'
    });

    const title = document.createElement('div');
    title.innerText = 'Haven Intro Map';
    Object.assign(title.style, { color: '#fbbf24', fontWeight: 'bold', marginBottom: '10px' });
    root.appendChild(title);

    const spots: Array<{ label: string; scene: string }> = [
      { label: 'Main Menu', scene: 'MainMenu' },
      { label: 'Haven Intro', scene: 'HavenIntro' },
      { label: 'Guide', scene: 'PlayerGuide' }
    ];

    for (const spot of spots) {
      const btn = document.createElement('button');
      btn.innerText = spot.label;
      Object.assign(btn.style, {
        width: '100%',
        marginBottom: '6px',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #374151',
        background: '#111827',
        color: '#e5e7eb',
        cursor: 'pointer'
      });
      btn.onclick = () => {
        root.remove();
        this.scene.start(spot.scene);
      };
      root.appendChild(btn);
    }

    const close = document.createElement('button');
    close.innerText = 'Close [M]';
    Object.assign(close.style, {
      marginTop: '4px',
      width: '100%',
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #475569',
      background: '#1f2937',
      color: '#cbd5e1',
      cursor: 'pointer'
    });
    close.onclick = () => root.remove();
    root.appendChild(close);

    container.appendChild(root);
  }

  private openChatMenu() {
    const container = document.getElementById('game');
    if (!container) return;

    openGameChatOverlay({
      container,
      sceneLabel: 'Haven Intro',
      scopeKey: 'haven-intro',
      registry: this.registry,
    });
  }

  private openSettings() {
    const container = document.getElementById('game');
    if (!container) return;
    if (!this.settingsPanel) this.settingsPanel = new SettingsPanel(container);
    if (this.settingsPanel.isOpen()) this.settingsPanel.close();
    else this.settingsPanel.open();
  }

  private spawnEnemy(kind: IntroEnemyKind, x: number, y: number, patrolPoints: Array<{ x: number; y: number }>) {
    const config = kind === 'venom-spider'
      ? { texture: 'spider', label: 'Venom Spider', hp: 24, speed: 62, touchDamage: 5, rewardGold: 8 }
      : { texture: 'root-beast', label: 'Root Beast', hp: 38, speed: 40, touchDamage: 8, rewardGold: 14 };

    const sprite = this.add.sprite(x, y, config.texture).setDepth(5);
    const hpBg = this.add.image(x, y - 24, 'hpbg').setDepth(5).setDisplaySize(46, 7);
    const hpBar = this.add.image(x - 23, y - 24, 'hpfill').setDepth(6).setDisplaySize(46, 7).setOrigin(0, 0.5);

    this.enemies.push({
      kind,
      label: config.label,
      sprite,
      hp: config.hp,
      maxHp: config.hp,
      hpBg,
      hpBar,
      speed: config.speed,
      touchDamage: config.touchDamage,
      rewardGold: config.rewardGold,
      patrolPoints,
      patrolIndex: 0
    });
  }

  private spawnPickup(kind: IntroPickupKind, x: number, y: number, amount: number, required: boolean = false) {
    const texture = kind === 'green-gem'
      ? 'gem-green'
      : kind === 'soulshard'
        ? 'soulshard'
        : kind === 'gold-cache'
          ? 'coin'
          : 'ember-fruit';
    const label = kind === 'green-gem'
      ? 'Green Gem'
      : kind === 'soulshard'
        ? 'Soulshard'
        : kind === 'gold-cache'
          ? 'Gold Cache'
          : 'Ember Fruit';

    const sprite = this.add.sprite(x, y, texture).setDepth(5);
    this.tweens.add({ targets: sprite, y: y - 4, yoyo: true, repeat: -1, duration: 900 });

    let glow: Phaser.GameObjects.Arc | undefined;
    if (required) {
      glow = this.add.circle(x, y, 18, 0xfef08a, 0.12).setDepth(4);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.08, to: 0.24 },
        scale: { from: 0.92, to: 1.08 },
        duration: 950,
        yoyo: true,
        repeat: -1
      });
    }

    this.pickups.push({ kind, label, sprite, amount, required, glow });
  }

  private doAttack() {
    if (this.attackCooldown > 0 || this.introComplete || this.selectingHeroGender) return;
    this.attackCooldown = 420;

    this.attackEffect.setPosition(this.hero.x + 24, this.hero.y - 8).setVisible(true).setAlpha(1).setScale(1);
    this.tweens.add({
      targets: this.attackEffect,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 240,
      onComplete: () => this.attackEffect.setVisible(false)
    });

    let landedHit = false;
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      const distance = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      if (distance >= 86) continue;

      const damage = enemy.kind === 'root-beast' ? 16 : 18;
      landedHit = true;
      enemy.hp = Math.max(0, enemy.hp - damage);
      this.showDamageNumber(enemy.sprite.x, enemy.sprite.y - 24, damage, '#fcd34d');
      this.updateEnemyHp(enemy);

      const angle = Phaser.Math.Angle.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      enemy.sprite.x += Math.cos(angle) * 18;
      enemy.sprite.y += Math.sin(angle) * 18;

      if (enemy.hp <= 0) {
        this.killEnemy(enemy);
      }
    }

    if (landedHit) {
      this.unlockFirstMark('first-clash', '#fca5a5');
    }
  }

  private updateEnemyHp(enemy: IntroEnemy) {
    const percentage = enemy.hp / enemy.maxHp;
    enemy.hpBar.setDisplaySize(Math.max(1, 46 * percentage), 7);
    enemy.hpBar.setTint(percentage > 0.5 ? 0x22c55e : percentage > 0.25 ? 0xfbbf24 : 0xef4444);
  }

  private killEnemy(enemy: IntroEnemy) {
    this.totalGold += enemy.rewardGold;
    gameRegistry.setGold(gameRegistry.gold + enemy.rewardGold);
    this.goldText.setText(`Gold: ${this.totalGold}`);
    this.showMessage(`${enemy.label} defeated. Supplies dropped into the yard.`, '#fde68a');

    if (enemy.kind === 'venom-spider') {
      this.spawnPickup('gold-cache', enemy.sprite.x + 12, enemy.sprite.y - 8, 6, false);
    } else {
      this.spawnPickup('ember-fruit', enemy.sprite.x + 10, enemy.sprite.y - 8, 1, false);
    }

    enemy.sprite.destroy();
    enemy.hpBg.destroy();
    enemy.hpBar.destroy();

    this.unlockFirstMark('first-fall', '#fcd34d');

    this.updateObjectives();
    this.checkCompletion();
  }

  private collectPickup(pickup: IntroPickup) {
    if (!pickup.sprite.active) return;

    if (pickup.kind === 'green-gem') {
      this.totalGems += pickup.amount;
      this.registry.set('greenGems', (this.registry.get('greenGems') as number || 0) + pickup.amount);
      gameRegistry.setGreenGems(gameRegistry.greenGems + pickup.amount);
      this.gemText.setText(`Green Gems: ${this.totalGems}`);
      this.showMessage('Green gems recovered from the yard.', '#86efac');
    } else if (pickup.kind === 'soulshard') {
      this.totalShards += pickup.amount;
      this.registry.set('soulshards', (this.registry.get('soulshards') as number || 0) + pickup.amount);
      gameRegistry.setSoulshards(gameRegistry.soulshards + pickup.amount);
      this.shardText.setText(`Soulshards: ${this.totalShards}`);
      this.showMessage('Soulshards gathered for future crafting.', '#d8b4fe');
      this.unlockFirstMark('shardfinder', '#d8b4fe');
    } else if (pickup.kind === 'ember-fruit') {
      this.totalFruit += pickup.amount;
      this.registry.set('emberFruit', (this.registry.get('emberFruit') as number || 0) + pickup.amount);
      gameRegistry.setEmberFruit(gameRegistry.emberFruit + pickup.amount);
      this.fruitText.setText(`Ember Fruit: ${this.totalFruit}`);
      const inventory = [...gameRegistry.inventory, ...createInventoryEntries('food-ember-fruit', 1)];
      gameRegistry.inventory = inventory;
      gameRegistry.saveToLocalStorage();
      this.showMessage('Ember Fruit added to your travel stock.', '#fb923c');
    } else {
      this.totalGold += pickup.amount;
      gameRegistry.setGold(gameRegistry.gold + pickup.amount);
      this.goldText.setText(`Gold: ${this.totalGold}`);
      this.showMessage(`Recovered ${pickup.amount} gold for the road ahead.`, '#fbbf24');
    }

    this.collectedCount += 1;
    if (pickup.required) {
      this.requiredCollectedCount += 1;
    }
    this.unlockFirstMark('keen-eye', '#93c5fd');
    if (this.requiredCollectedCount >= this.totalRequiredPickups) {
      this.unlockFirstMark('haven-gatherer', '#86efac');
    }
    pickup.glow?.destroy();
    pickup.sprite.destroy();
    this.updateObjectives();
    this.checkCompletion();
  }

  private updateObjectives() {
    const aliveEnemies = this.enemies.filter((enemy) => enemy.sprite.active).length;
    const cleared = this.totalRequiredKills - aliveEnemies;
    this.objectiveText.setText(`Objectives: intruders ${Math.min(this.totalRequiredKills, cleared)}/${this.totalRequiredKills} · supplies ${Math.min(this.totalRequiredPickups, this.requiredCollectedCount)}/${this.totalRequiredPickups} · first marks ${this.unlockedMarks.size}/${this.firstMarks.length}`);
  }

  private checkCompletion() {
    const aliveEnemies = this.enemies.filter((enemy) => enemy.sprite.active).length;
    if (this.introComplete || aliveEnemies > 0 || this.requiredCollectedCount < this.totalRequiredPickups || this.unlockedMarks.size < this.firstMarks.length) {
      return;
    }

    this.introComplete = true;
    gameRegistry.setGuestIntroCompleted(true);
    this.showMessage('You have taken your first steps through Haven. Create your account to continue your journey.', '#22c55e');
    this.promptText.setText('Intro cleared. Taking you to account creation...');
    this.time.delayedCall(1800, () => this.scene.start('CreateAccountScreen'));
  }

  private unlockFirstMark(id: string, color: string) {
    if (this.unlockedMarks.has(id)) {
      return;
    }

    const mark = this.firstMarks.find((entry) => entry.id === id);
    if (!mark) {
      return;
    }

    this.unlockedMarks.add(id);
    const completedMarks = [...this.unlockedMarks];
    this.registry.set('havenFirstMarks', completedMarks);
    gameRegistry.saveToLocalStorage();
    this.showMessage(`Waymark: ${mark.title}\n${mark.description}`, color);
    this.updateObjectives();
    this.updateGuidance();
  }

  private buildCampfire() {
    if (this.campfireBuilt || this.introComplete) {
      return;
    }

    if (this.collectedCount < 2) {
      return;
    }

    this.campfireBuilt = true;
    this.skillLessons.onSkillUnlocked('campfire');
    this.campfireSprite.setTexture('ember-fruit').setAlpha(1);
    this.campfireSprite.setTint(0xfb923c);
    this.tweens.add({ targets: this.campfireSprite, scaleX: 1.05, scaleY: 1.05, yoyo: true, repeat: -1, duration: 600 });
    this.showMessage('Skill Learned: Campfire\nYou built warmth beneath the Haven sky.', '#fdba74');
    this.unlockFirstMark('campfire-soul', '#fdba74');
    this.checkCompletion();
  }

  private awardIntroXp(amount: number) {
    this.introXp += amount;
    this.registry.set('introXp', this.introXp);
  }

  private addInventoryItem(itemId: string, quantity: number = 1) {
    const additions = createInventoryEntries(itemId, quantity);
    gameRegistry.inventory = [...gameRegistry.inventory, ...additions];
    gameRegistry.saveToLocalStorage();
  }

  private unlockBonusWaymark(id: string, title: string, description: string, color: string) {
    if (this.bonusWaymarks.has(id)) {
      return;
    }
    this.bonusWaymarks.add(id);
    this.registry.set('havenBonusWaymarks', [...this.bonusWaymarks]);
    this.showMessage(`Waymark Bonus: ${title}\n${description}`, color);
  }

  private handleFishingSpots(time: number) {
    for (const spot of this.fishSpots) {
      if (spot.isFishing || time < spot.nextReadyAt) {
        continue;
      }

      const nearSpot = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, spot.zone.x, spot.zone.y) < 40;
      if (!nearSpot) {
        continue;
      }

      spot.isFishing = true;
      spot.ripple.setStrokeStyle(1, 0xfde68a, 0.55);
      this.showMessage(`You cast into ${spot.label.text}.`, '#7dd3fc');
      this.skillLessons.onSkillRelevant('fishing');

      this.time.delayedCall(1100, () => {
        const roll = Phaser.Math.Between(1, 100);
        const rewards: string[] = [];

        this.addInventoryItem('food-river-fish', 1);
        rewards.push(getItemById('food-river-fish')?.name ?? 'River Fish');

        if (roll <= 70) {
          this.addInventoryItem('mat-water-clean', 1);
          rewards.push(getItemById('mat-water-clean')?.name ?? 'Clean Water');
        }

        if (roll >= 68) {
          const sideItemId = roll > 86 ? 'mat-drift-scale' : 'mat-reed-root';
          this.addInventoryItem(sideItemId, 1);
          rewards.push(getItemById(sideItemId)?.name ?? sideItemId);
        }

        this.awardIntroXp(6);
        this.showMessage(`Catch secured: ${rewards.join(', ')} (+6 XP)`, '#93c5fd');
        this.unlockBonusWaymark('river-hand', 'River Hand', 'You learned the rhythm of Haven waters.', '#7dd3fc');

        spot.isFishing = false;
        spot.nextReadyAt = time + 12000;
        spot.ripple.setStrokeStyle(1, 0x7dd3fc, 0.35);
      });
    }
  }

  private handleTrapStation(time: number) {
    if (this.trapCollects >= 2) {
      this.trapMarker.setAlpha(0.08);
      return;
    }

    const nearTrap = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.trapZone.x, this.trapZone.y) < 42;
    if (nearTrap && !this.trapActive && time >= this.trapReadyAt) {
      this.trapActive = true;
      this.trapReadyAt = time + 2400;
      this.showMessage('You set a gentle lure station. Wildlife will pass and leave traces.', '#cbd5e1');
      this.skillLessons.onSkillRelevant('shed-trap');
      this.tweens.add({ targets: this.trapMarker, alpha: { from: 0.16, to: 0.28 }, duration: 450, yoyo: true, repeat: 3 });
    }

    if (!this.trapActive || time < this.trapReadyAt) {
      return;
    }

    this.trapActive = false;
    this.trapCollects += 1;

    const materials = ['mat-hide-fiber', 'mat-fur-tuft', 'mat-scale-flake', 'mat-feather-tuft'];
    const rewardItemId = Phaser.Utils.Array.GetRandom(materials);
    const rewardName = getItemById(rewardItemId)?.name ?? rewardItemId;
    this.addInventoryItem(rewardItemId, 1);
    this.awardIntroXp(5);
    this.showMessage(`Lure station yield: ${rewardName} (+5 XP)`, '#d1d5db');
    this.unlockBonusWaymark('gentle-trapper', 'Gentle Trapper', 'You gathered wildlife materials without harm.', '#cbd5e1');

    this.trapReadyAt = time + 14000;
  }

  private handleHarvestTree(time: number) {
    if (this.treeHarvests >= 2 || time < this.treeNextReadyAt) {
      return;
    }

    const nearTree = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.treeNodeZone.x, this.treeNodeZone.y) < 40;
    if (!nearTree) {
      return;
    }

    this.treeHarvests += 1;
    this.treeNextReadyAt = this.treeHarvests >= 2 ? Number.MAX_SAFE_INTEGER : time + 18000;

    this.addInventoryItem('mat-timber', 1);
    this.addInventoryItem('mat-tree-bark', 1);
    if (Phaser.Math.Between(1, 100) > 58) {
      this.addInventoryItem('mat-tree-resin', 1);
    } else {
      this.addInventoryItem('mat-sap', 1);
    }

    this.awardIntroXp(7);
    this.showMessage('Harvested node: Timber, Tree Bark, and sap-resin stock (+7 XP)', '#bbf7d0');
    this.unlockBonusWaymark('wild-forester', 'Wild Forester', 'You learned to harvest a living node with intent.', '#86efac');

    this.tweens.add({
      targets: this.treeNodeSprite,
      angle: { from: -2, to: 2 },
      duration: 120,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.treeNodeSprite.setAngle(0)
    });

    if (this.treeHarvests >= 2) {
      this.treeNodeSprite.setAlpha(0.72);
    }
  }

  private updateGuidance() {
    if (this.selectingHeroGender) {
      this.promptText.setText('Choose a rider silhouette to begin Haven training.');
      return;
    }

    if (this.introComplete) {
      this.promptText.setText('Intro complete. Transitioning to account creation...');
      return;
    }

    const nextMark = this.markOrder.find((id) => !this.unlockedMarks.has(id));
    if (!nextMark) {
      this.promptText.setText('Final checks complete. Prepare to continue your journey.');
      return;
    }

    const guidance = this.markGuidance[nextMark] ?? 'Keep exploring and follow the glow.';
    this.promptText.setText(`Next: ${guidance}`);
  }

  private handleIntroWaymarks(time: number, delta: number) {
    const distanceFromStart = Phaser.Math.Distance.Between(this.heroStartX, this.heroStartY, this.hero.x, this.hero.y);
    if (distanceFromStart > 70) {
      this.unlockFirstMark('first-steps', '#86efac');
    }

    if (!this.seenForestMarker && Phaser.Math.Distance.Between(this.hero.x, this.hero.y, 668, 116) < 70) {
      this.seenForestMarker = true;
      this.unlockFirstMark('trialbound', '#fde68a');
    }

    if (!this.seenSanctuaryMarker && Phaser.Math.Distance.Between(this.hero.x, this.hero.y, 150, 118) < 70) {
      this.seenSanctuaryMarker = true;
    }

    if (this.seenForestMarker && this.seenSanctuaryMarker) {
      this.unlockFirstMark('pathwatcher', '#a5f3fc');
    }

    const nearGrove = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, 152, 308) < 34;
    if (nearGrove && !this.groveTouched) {
      this.groveTouched = true;
      this.unlockFirstMark('grove-rest', '#34d399');
      this.showMessage('The grove restores the weary.', '#86efac');
    }
    if (nearGrove && this.heroHp < 100) {
      this.heroHp = Math.min(100, this.heroHp + (8 * delta) / 1000);
      this.updateHeroHp();
    }

    if (this.campfireBuilt && Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.campfireZone.x, this.campfireZone.y) < 48 && this.heroHp < 100) {
      this.heroHp = Math.min(100, this.heroHp + (10 * delta) / 1000);
      this.updateHeroHp();
    }

    const nearCamp = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.campfireZone.x, this.campfireZone.y) < 44;
    if (nearCamp && this.collectedCount >= 2 && !this.campfireBuilt) {
      this.buildCampfire();
    }

    this.handleFishingSpots(time);
    this.handleTrapStation(time);
    this.handleHarvestTree(time);
  }

  private showDamageNumber(x: number, y: number, value: number, color: string) {
    const text = this.add.text(x, y, `-${value}`, { color, fontSize: '16px', fontStyle: 'bold' }).setDepth(12);
    this.tweens.add({ targets: text, y: y - 36, alpha: 0, duration: 800, onComplete: () => text.destroy() });
  }

  private showMessage(message: string, color: string) {
    const width = this.scale.width;
    const height = this.scale.height;
    const text = this.add.text(width / 2, height / 2 - 86, message, {
      color,
      fontSize: '18px',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
      wordWrap: { width: 560 },
      align: 'center'
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({ targets: text, y: height / 2 - 120, alpha: 0, duration: 2200, onComplete: () => text.destroy() });
  }

  private updateHeroHp() {
    const percentage = this.heroHp / 100;
    this.heroHpBar.setDisplaySize(100 * percentage, 10);
    this.heroHpBar.setTint(percentage > 0.5 ? 0x22c55e : percentage > 0.25 ? 0xfbbf24 : 0xef4444);
    this.heroHpText.setText(`HP ${Math.round(this.heroHp)}/100`);
  }

  update(time: number, delta: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    if (this.selectingHeroGender) {
      this.hero.setPosition(this.heroStartX, this.heroStartY);
      return;
    }

    this.hero.update(time, delta);
    this.handleIntroWaymarks(time, delta);

    const width = this.scale.width;
    const height = this.scale.height;

    for (const pickup of this.pickups) {
      if (!pickup.sprite.active) continue;
      if (pickup.glow?.active) {
        pickup.glow.setPosition(pickup.sprite.x, pickup.sprite.y);
      }
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, pickup.sprite.x, pickup.sprite.y) < 22) {
        this.collectPickup(pickup);
      }
    }
    this.pickups = this.pickups.filter((pickup) => pickup.sprite.active);

    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;

      const distanceToHero = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      if (distanceToHero < 180) {
        const chaseAngle = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, this.hero.x, this.hero.y);
        enemy.sprite.x += Math.cos(chaseAngle) * enemy.speed * delta / 1000;
        enemy.sprite.y += Math.sin(chaseAngle) * enemy.speed * delta / 1000;
        enemy.sprite.setTint(enemy.kind === 'venom-spider' ? 0xef4444 : 0x65a30d);

        if (distanceToHero < 28 && this.hurtFlashTimer <= 0 && !this.introComplete) {
          this.heroHp = Math.max(0, this.heroHp - enemy.touchDamage);
          this.hurtFlashTimer = 520;
          this.showDamageNumber(this.hero.x, this.hero.y - 30, enemy.touchDamage, '#f87171');
          this.cameras.main.shake(120, 0.008);
          if (this.heroHp <= 0) {
            this.heroHp = 100;
            this.hero.setPosition(120, 360);
            this.showMessage('Your discernment failed that moment. The Haven still shelters you. Choose your path more carefully.', '#f59e0b');
          }
          this.updateHeroHp();
        }
      } else {
        const target = enemy.patrolPoints[enemy.patrolIndex];
        const patrolAngle = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, target.x, target.y);
        enemy.sprite.x += Math.cos(patrolAngle) * enemy.speed * 0.45 * delta / 1000;
        enemy.sprite.y += Math.sin(patrolAngle) * enemy.speed * 0.45 * delta / 1000;
        if (Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, target.x, target.y) < 10) {
          enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPoints.length;
        }
        enemy.sprite.clearTint();
      }

      enemy.sprite.x = Phaser.Math.Clamp(enemy.sprite.x, 60, width - 60);
      enemy.sprite.y = Phaser.Math.Clamp(enemy.sprite.y, 72, height - 70);
      enemy.hpBg.setPosition(enemy.sprite.x, enemy.sprite.y - 24);
      enemy.hpBar.setPosition(enemy.sprite.x - 23, enemy.sprite.y - 24);
    }

    this.enemies = this.enemies.filter((enemy) => enemy.sprite.active);

    if (this.hurtFlashTimer > 0) {
      this.hurtFlashTimer -= delta;
      this.hero.setTint(0xff4444);
    } else {
      this.hero.clearTint();
    }

    this.hero.x = Phaser.Math.Clamp(this.hero.x, 36, width - 36);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 60, height - 48);
  }
}
