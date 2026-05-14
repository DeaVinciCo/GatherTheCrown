import Phaser from 'phaser';
import HeroSprite from '../actors/HeroSprite';
import { updateAchievementRegistryFlags } from '../progression/achievements';
import { InventoryMenu, InventoryItem } from '../ui/InventoryMenu';
import AchievementPanel from '../ui/AchievementPanel';
import { getAchievementsFromRegistry } from '../progression/achievements';
import { openGameChatOverlay } from '../ui/GameChatOverlay';
import { routeToCreatInventory } from '../systems/CreatInventoryRouting';
import { getLootPool } from '../systems/GameplayDataTables';
import { applyNeedsRewards, assessHeroCreatNeeds, type NeedsAssessment } from '../systems/HeroCreatNeedsTracker';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';
import { canOpenKingdomPortal } from '../systems/KingdomAccessControl';
import type { FourKingdomId } from '@game/shared';

type VolcanoEnemy = 'emberling' | 'lava-hound';
interface VEnemy {
  kind: VolcanoEnemy;
  label: string;
  sprite: Phaser.GameObjects.Sprite;
  hp: number; maxHp: number;
  hpBg: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Image;
  speed: number;
  touchDamage: number;
  rewardGold: number;
  patrolPoints: Array<{ x: number; y: number }>;
  patrolIndex: number;
}

interface VPickup {
  label: string;
  texture: string;
  sprite: Phaser.GameObjects.Sprite;
}

export default class VolcanoZone extends Phaser.Scene {
  private hero!: HeroSprite;
  private creatSprite?: Phaser.GameObjects.Sprite;
  private bondGemRing!: Phaser.GameObjects.Graphics;
  private bondGemPercentText!: Phaser.GameObjects.Text;
  private bondGemLabelText!: Phaser.GameObjects.Text;
  private enemies: VEnemy[] = [];
  private kills = 0;
  private runGold = 0;
  private heroHp = 100;
  private heroMaxHp = 100;
  private heroHpBar!: Phaser.GameObjects.Image;
  private heroHpText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private attackCooldown = 0;
  private creatAttackCooldown = 0;
  private hurtFlashTimer = 0;
  private attackEffect!: Phaser.GameObjects.Sprite;
  private portal!: Phaser.GameObjects.Sprite;
  private portalOpen = false;
  private pickups: VPickup[] = [];
  private healingTrees: Phaser.GameObjects.Sprite[] = [];
  private healingGroveCenters: Array<{ x: number; y: number }> = [];
  private groveHealTick = 0;
  private achievementsPanel?: AchievementPanel;
  private prepAssessment?: NeedsAssessment;
  private prepSummaryText?: Phaser.GameObjects.Text;
  private prepRewardClaimed = false;
  private readonly volcanoLootPool = getLootPool('volcano');
  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'VolcanoZone', {
    onMap: () => this.openMapMenu(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu(),
    onAchievements: () => this.openAchievements()
  });

  constructor() { super('VolcanoZone'); }

  create() {
    this.enemies = [];
    this.pickups = [];
    this.kills = 0;
    this.runGold = 0;
    this.heroHp = this.heroMaxHp;
    this.attackCooldown = 0;
    this.creatAttackCooldown = 0;
    this.hurtFlashTimer = 0;
    this.groveHealTick = 0;
    this.healingTrees = [];
    this.prepAssessment = assessHeroCreatNeeds(
      this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
      'arena'
    );
    this.prepRewardClaimed = false;

    const { width, height } = this.scale;

    // ── Lava tile floor ───────────────────────────────────────────────────
    for (let tx = 0; tx < width; tx += 32)
      for (let ty = 32; ty < height; ty += 32)
        this.add.image(tx + 16, ty + 16, 'lava-tile').setDepth(0);

    // Glowing lava veins overlay
    const veins = this.add.graphics().setDepth(1);
    veins.lineStyle(3, 0xf97316, 0.35);
    for (let i = 0; i < 6; i++) {
      const sx = Phaser.Math.Between(40, width - 40);
      veins.beginPath(); veins.moveTo(sx, 40);
      veins.lineTo(sx + Phaser.Math.Between(-60, 60), height - 40);
      veins.strokePath();
    }
    this.tweens.add({ targets: veins, alpha: 0.3, yoyo: true, repeat: -1, duration: 1800 });

    // Dark sky overlay
    this.add.rectangle(width / 2, 0, width, 60, 0x0a0000, 0.8).setDepth(2).setOrigin(0.5, 0);

    // Title banner
    this.add.text(width / 2, 8, '🔥  VOLCANO ZONE  — Infernal Kin Territory', {
      color: '#fca5a5', fontSize: '13px', fontStyle: 'bold', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(3);

    // Ash trees decoration
    const ashPositions = [[36, 80], [100, 74], [700, 70], [760, 90], [34, 520], [770, 500], [400, 80]];
    for (const [ax, ay] of ashPositions)
      this.add.image(ax, ay, 'ash-tree').setDepth(2).setTint(0x7c2d12);

    // Outdoor healing grove: gradual regeneration while standing inside.
    this.spawnHealingGrove(110, 470);
    this.spawnHealingGrove(360, 240);
    this.spawnHealingGrove(680, 380);

    // Spawn enemies
    this.spawnEnemy('emberling', 260, 180, [{x:220,y:180},{x:340,y:200}]);
    this.spawnEnemy('emberling', 540, 260, [{x:500,y:260},{x:620,y:280}]);
    this.spawnEnemy('emberling', 340, 420, [{x:300,y:400},{x:420,y:440}]);
    this.spawnEnemy('lava-hound', 620, 180, [{x:580,y:160},{x:700,y:220}]);
    this.spawnEnemy('lava-hound', 200, 460, [{x:160,y:440},{x:280,y:480}]);

    // Pickups: red gems + fire shards
    this.spawnPickup(380, 180, 'gem-red',    '#fca5a5', 'Red Gem');
    this.spawnPickup(640, 420, 'fire-shard', '#f97316', 'Fire Shard');
    this.spawnPickup(180, 340, 'ember-fruit','#fbbf24', 'Ember Fruit');
    this.spawnPickup(560, 480, 'gem-red',    '#fca5a5', 'Red Gem');

    // Portal (hidden until cleared)
    this.portal = this.add.sprite(720, 110, 'portal').setDepth(3).setVisible(false).setScale(1.6).setTint(0xef4444);
    this.tweens.add({ targets: this.portal, angle: 360, duration: 2800, repeat: -1 });

    // Hero
    this.hero = new HeroSprite(this, 80, 310);
    this.hero.setDepth(6).setTint(0xfca5a5); // fire tint in volcano zone

    // Creat companion (only after hatch)
    if (this.registry.get('hasHatchedCreat')) {
      const element = (this.registry.get('heroElement') as string) || 'Fire';
      this.creatSprite = this.add.sprite(this.hero.x - 34, this.hero.y + 12, `creat-${element.toLowerCase()}`).setScale(1.3).setDepth(6);
      this.tweens.add({ targets: this.creatSprite, y: this.creatSprite.y - 4, yoyo: true, repeat: -1, duration: 760 });
    }

    // Attack effect
    this.attackEffect = this.add.sprite(0, 0, 'slash').setDepth(8).setVisible(false).setTint(0xef4444);

    // HUD
    this.add.rectangle(width / 2, 18, width, 36, 0x000000, 0.68).setDepth(10);
    this.add.image(width - 165, 18, 'hpbg').setDepth(10).setDisplaySize(100, 10);
    this.heroHpBar = this.add.image(width - 215, 18, 'hpfill').setDepth(11).setDisplaySize(100, 10).setOrigin(0, 0.5).setTint(0xef4444);
    this.heroHpText = this.add.text(width - 215, 6, 'HP 100/100', { color: '#f87171', fontSize: '12px' }).setDepth(11);

    // Circular bond tracker gem near HUD bars/menu hints
    const hasHatchedCreat = !!this.registry.get('hasHatchedCreat');
    const bond = Math.max(0, Math.min(100, Math.round((this.registry.get('creatBond') as number) || 0)));
    const gemX = width - 46;
    const gemY = 18;
    this.add.circle(gemX, gemY, 15, 0x2e1065, 0.92).setDepth(12).setStrokeStyle(2, 0xa855f7, 0.95);
    this.bondGemRing = this.add.graphics().setDepth(13);
    this.bondGemPercentText = this.add.text(gemX, gemY - 1, '--', {
      color: '#f5d0fe', fontSize: '9px', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(14);
    this.bondGemLabelText = this.add.text(gemX, gemY + 16, 'BOND', {
      color: '#c084fc', fontSize: '8px', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(14);
    this.updateBondGemHud(bond, hasHatchedCreat);
    this.killText = this.add.text(10, height - 40, 'Foes: 0 / 5', { color: '#fca5a5', fontSize: '13px' }).setDepth(11);
    this.goldText = this.add.text(10, height - 24, 'Gold: 0', { color: '#fbbf24', fontSize: '13px' }).setDepth(11);
    this.promptText = this.add.text(width - 10, height - 24, 'SPACE/Click=Attack  •  Watch the lava!', {
      color: '#93c5fd', fontSize: '11px'
    }).setOrigin(1, 0).setDepth(11);
    this.prepSummaryText = this.add.text(width / 2, 42, '', {
      color: '#fde68a',
      fontSize: '10px',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(11);
    this.add.text(width / 2, height - 8, 'M=Map  I=Inventory  Shift=Chat  A=Achievements', {
      color: '#475569', fontSize: '11px'
    }).setOrigin(0.5, 1).setDepth(11);

    // Back button
    const backBtn = this.add.text(8, 38, '← Haven', {
      color: '#d1d5db', fontSize: '13px', backgroundColor: '#1f2937', stroke: '#000', strokeThickness: 2
    }).setPadding(6, 3).setDepth(15).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('HavenGrounds'));

    // Controls
    this.input.keyboard?.on('keydown-SPACE', () => this.doAttack());
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.portalOpen && Phaser.Math.Distance.Between(ptr.x, ptr.y, this.portal.x, this.portal.y) < 44) {
        if (this.canUsePortal()) {
          return this.scene.start('HavenGrounds');
        }
        return;
      }
      this.doAttack();
    });

    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    this.updatePrepSummary();
  }

  private updatePrepSummary() {
    if (!this.prepAssessment || !this.prepSummaryText) return;
    const missing = this.prepAssessment.missingCritical;
    const color = missing.length === 0 ? '#86efac' : '#fde68a';
    const text = missing.length === 0
      ? `Prep Ready ${this.prepAssessment.readinessScore}% · healing groves keep the lane survivable.`
      : `Prep Ready ${this.prepAssessment.readinessScore}% · missing: ${this.prepAssessment.missingCritical.map((item) => item.label).join(', ')}`;
    this.prepSummaryText.setText(text).setColor(color);
  }

  private updateBondGemHud(bond: number, hasHatchedCreat: boolean) {
    const safeBond = Math.max(0, Math.min(100, Math.round(bond)));
    const progress = safeBond / 100;
    const ringRadius = 12;
    const gemX = this.scale.width - 46;
    const gemY = 18;

    this.bondGemRing.clear();
    this.bondGemRing.lineStyle(2, 0x312e81, 0.95);
    this.bondGemRing.strokeCircle(gemX, gemY, ringRadius);

    if (hasHatchedCreat && safeBond > 0) {
      this.bondGemRing.lineStyle(3, 0xd946ef, 1);
      this.bondGemRing.beginPath();
      this.bondGemRing.arc(gemX, gemY, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress, false);
      this.bondGemRing.strokePath();
    }

    this.bondGemPercentText.setText(hasHatchedCreat ? `${safeBond}%` : '--');
    this.bondGemLabelText.setColor(hasHatchedCreat ? '#c084fc' : '#64748b');
  }

  private spawnHealingGrove(cx: number, cy: number) {
    const points: Array<[number, number]> = [
      [cx - 28, cy - 14],
      [cx + 0, cy - 24],
      [cx + 28, cy - 14],
      [cx - 34, cy + 16],
      [cx + 0, cy + 24],
      [cx + 34, cy + 16]
    ];
    for (const [x, y] of points) {
      const tree = this.add.sprite(x, y, 'heal-tree').setDepth(4).setScale(0.9).setTint(0xfca5a5);
      this.tweens.add({ targets: tree, y: y - 3, yoyo: true, repeat: -1, duration: 1600 });
      this.healingTrees.push(tree);
    }
    this.add.circle(cx, cy, 46, 0xf97316, 0.08).setDepth(2);
    this.add.text(cx, cy + 50, 'Healing Grove', { color: '#fdba74', fontSize: '10px' }).setOrigin(0.5).setDepth(5);
    this.healingGroveCenters.push({ x: cx, y: cy });
  }

  private spawnEnemy(kind: VolcanoEnemy, x: number, y: number, patrol: Array<{x:number;y:number}>) {
    const cfg = kind === 'emberling'
      ? { texture: 'emberling', label: 'Emberling', hp: 22, speed: 88, touchDamage: 7, rewardGold: 8 }
      : { texture: 'lava-hound', label: 'Lava Hound', hp: 58, speed: 36, touchDamage: 15, rewardGold: 20 };
    const sprite = this.add.sprite(x, y, cfg.texture).setDepth(5).setTint(0xfca5a5);
    const hpBg = this.add.image(x, y - 22, 'hpbg').setDepth(5).setDisplaySize(46, 7);
    const hpBar = this.add.image(x - 23, y - 22, 'hpfill').setDepth(6).setDisplaySize(46, 7).setOrigin(0, 0.5).setTint(0xef4444);
    this.enemies.push({ kind, label: cfg.label, sprite, hp: cfg.hp, maxHp: cfg.hp, hpBg, hpBar, speed: cfg.speed, touchDamage: cfg.touchDamage, rewardGold: cfg.rewardGold, patrolPoints: patrol, patrolIndex: 0 });
  }

  private spawnPickup(x: number, y: number, texture: string, color: string, label: string) {
    const sprite = this.add.sprite(x, y, texture).setDepth(5);
    this.tweens.add({ targets: sprite, y: y - 7, yoyo: true, repeat: -1, duration: 950 });
    this.add.text(x, y - 16, label, { color, fontSize: '9px' }).setOrigin(0.5).setDepth(5);
    sprite.setInteractive();
    const pickup: VPickup = { label, texture, sprite };
    this.pickups.push(pickup);
    sprite.on('pointerdown', () => this.collectPickup(pickup));
  }

  private collectPickup(pickup: VPickup) {
    if (!pickup.sprite.active) return;
    pickup.sprite.destroy();
    const { label, texture } = pickup;
    if (texture === 'gem-red') {
      this.registry.set('redGems', (this.registry.get('redGems') as number || 0) + 1);
      this.showMessage(`${label} collected! Fire power stored.`, '#fca5a5');
    } else if (texture === 'fire-shard') {
      this.registry.set('soulshards', (this.registry.get('soulshards') as number || 0) + 1);
      this.showMessage(`${label} gathered — useful at the Crown Forge.`, '#f97316');
    } else if (texture === 'ember-fruit') {
      const routed = routeToCreatInventory(this.registry, {
        id: `ember-fruit-${Date.now()}`,
        name: 'Ember Fruit',
        quantity: 1,
        type: 'food'
      });

      if (routed) {
        this.showMessage(`Ember Fruit sent to creat inventory. Prompt: ${routed.prompt.label}.`, '#f0abfc');
        this.promptText.setText(`Creat action available: ${routed.prompt.message}`);
      } else {
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 18);
        this.updateHeroHp();
        this.registry.set('emberFruit', (this.registry.get('emberFruit') as number || 0) + 1);
        this.showMessage('Ember Fruit — vitality restored!', '#fbbf24');
      }
    }
  }

  private openInventory() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.inventory-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const items: InventoryItem[] = this.registry.get('inventory') || [
      { id: 'iron-sword', name: 'Iron Sword', equipped: true },
      { id: 'tower-shield', name: 'Tower Shield', equipped: false },
    ];
    const playerLevel = Number(this.registry.get('currentCrownLevel') || this.registry.get('playerLevel') || this.registry.get('level') || 1);
    new InventoryMenu(items, (updated) => this.registry.set('inventory', updated), { playerLevel }).attach(container);
  }

  private canUsePortal(): boolean {
    const enforcePortalKey = !!this.registry.get('requireRoyalPortalKey');
    if (!enforcePortalKey) return true;

    const inventory = (this.registry.get('inventory') as InventoryItem[]) || [];
    const kingdomId = this.getCurrentMainlandKingdom();
    const access = canOpenKingdomPortal(inventory, kingdomId);
    if (!access.granted) {
      this.showMessage(`Portal locked: ${access.lockLabel}. Royal key and sigil required.`, '#fca5a5');
      return false;
    }

    return true;
  }

  private getCurrentMainlandKingdom(): FourKingdomId {
    const raw = String(this.registry.get('activeMainlandKingdom') ?? 'aldermarch').toLowerCase();
    if (raw === 'stormrage' || raw === 'vastmalaise' || raw === 'sunward') return raw;
    return 'aldermarch';
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
    title.innerText = 'World Map - Quick Travel';
    Object.assign(title.style, { color: '#fbbf24', fontWeight: 'bold', marginBottom: '10px' });
    root.appendChild(title);

    const spots: Array<{ label: string; scene: string }> = [
      { label: 'Haven', scene: 'Haven' },
      { label: 'Forest Run', scene: 'ForestZone' },
      { label: 'Volcano Zone', scene: 'VolcanoZone' },
      { label: 'Crown Trial I', scene: 'CrownTrial01' },
      { label: 'Crown Forge', scene: 'CrownForge' },
      { label: 'Battle Arena', scene: 'BattleArena' },
      { label: 'Race Circuit', scene: 'RaceCircuit' },
      { label: 'District 01', scene: 'District01' },
      { label: 'Story: Awakening', scene: 'StoryIntro' },
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
      sceneLabel: 'Volcano',
      scopeKey: 'volcano-zone',
      registry: this.registry,
    });
    input.focus();
  }

  private openAchievements() {
    const container = document.getElementById('game');
    if (!container) return;

    if (!this.achievementsPanel) {
      container.querySelectorAll('.achievement-panel').forEach((node) => node.remove());
      this.achievementsPanel = new AchievementPanel(() => getAchievementsFromRegistry(this.registry));
      this.achievementsPanel.attach(container);
    }
    this.achievementsPanel.show();
  }

  private doAttack() {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 400;
    this.attackEffect.setPosition(this.hero.x + 22, this.hero.y - 8).setVisible(true).setAlpha(1).setScale(1);
    this.tweens.add({ targets: this.attackEffect, alpha: 0, scaleX: 2, scaleY: 2, duration: 260, onComplete: () => this.attackEffect.setVisible(false) });

    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      const d = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      if (d >= 90) continue;
      const dmg = enemy.kind === 'lava-hound' ? 12 : 16;
      enemy.hp = Math.max(0, enemy.hp - dmg);
      this.showDamageNumber(enemy.sprite.x, enemy.sprite.y - 22, dmg, '#fde68a');
      this.updateEnemyHp(enemy);
      const ang = Phaser.Math.Angle.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      enemy.sprite.x += Math.cos(ang) * 18; enemy.sprite.y += Math.sin(ang) * 18;
      if (enemy.hp <= 0) this.killEnemy(enemy);
    }
  }

  private updateEnemyHp(enemy: VEnemy) {
    const p = enemy.hp / enemy.maxHp;
    enemy.hpBar.setDisplaySize(Math.max(1, 46 * p), 7);
    enemy.hpBar.setTint(p > 0.5 ? 0xf97316 : p > 0.25 ? 0xfbbf24 : 0xef4444);
  }

  private killEnemy(enemy: VEnemy) {
    this.kills += 1;
    this.runGold += enemy.rewardGold;
    this.registry.set('gold', (this.registry.get('gold') as number || 0) + enemy.rewardGold);
    this.registry.set('totalKills', (this.registry.get('totalKills') as number || 0) + 1);
    this.spawnVolcanoLootFromDataTable(enemy.sprite.x, enemy.sprite.y);
    // Bond only grows after the egg has hatched.
    if (this.registry.get('hasHatchedCreat')) {
      const bond = Math.min(100, (this.registry.get('creatBond') as number || 0) + 2);
      this.registry.set('creatBond', bond);
    }

    enemy.sprite.destroy(); enemy.hpBg.destroy(); enemy.hpBar.destroy();
    this.killText.setText(`Foes: ${this.kills} / 5`);
    this.goldText.setText(`Gold: ${this.runGold}`);
    this.showMessage(`${enemy.label} burned away. Keep pushing!`, '#f97316');

    if (this.enemies.filter((e) => e.sprite.active).length === 0) {
      this.portalOpen = true;
      this.registry.set('volcanoClears', (this.registry.get('volcanoClears') || 0) + 1);
      if (!this.prepRewardClaimed && this.prepAssessment) {
        const reward = applyNeedsRewards(
          this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
          this.prepAssessment,
          'volcano_zone_start'
        );
        if (reward.granted) {
          this.prepRewardClaimed = true;
          this.showMessage(`Prep Reward: +${reward.prepXpGained} Prep XP, +${reward.goldGained} Gold`, '#a7f3d0');
        }
      }
      updateAchievementRegistryFlags(this.registry);
      this.portal.setVisible(true);
      this.showMessage('Volcano route cleared! Portal back to Haven is open.', '#22c55e');
    }
  }

  private pickVolcanoLootEntry() {
    if (!this.volcanoLootPool.length) return null;

    const totalWeight = this.volcanoLootPool.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight <= 0) return this.volcanoLootPool[0];

    let roll = Phaser.Math.Between(1, totalWeight);
    for (const entry of this.volcanoLootPool) {
      roll -= entry.weight;
      if (roll <= 0) return entry;
    }
    return this.volcanoLootPool[0];
  }

  private spawnVolcanoLootFromDataTable(x: number, y: number) {
    const entry = this.pickVolcanoLootEntry();
    if (!entry) return;

    const qty = Phaser.Math.Between(entry.minQty, entry.maxQty);
    const mapByItemId: Record<string, { texture: string; color: string; label: string }> = {
      'mat-essence-fire': { texture: 'fire-shard', color: '#f97316', label: 'Fire Essence' },
      'mat-iron-ore': { texture: 'gem-red', color: '#fca5a5', label: 'Iron Ore' },
      'food-ember-fruit': { texture: 'ember-fruit', color: '#fbbf24', label: 'Ember Fruit' }
    };

    const mapped = mapByItemId[entry.itemId] ?? { texture: 'fire-shard', color: '#f97316', label: 'Volcanic Drop' };
    for (let i = 0; i < Math.max(1, qty); i += 1) {
      this.spawnPickup(
        x + Phaser.Math.Between(-14, 14),
        y + Phaser.Math.Between(-10, 10),
        mapped.texture,
        mapped.color,
        mapped.label
      );
    }
  }

  private updateHeroHp() {
    const p = this.heroHp / this.heroMaxHp;
    this.heroHpBar.setDisplaySize(100 * p, 10);
    this.heroHpBar.setTint(p > 0.5 ? 0xef4444 : p > 0.25 ? 0xfbbf24 : 0xff0000);
    this.heroHpText.setText(`HP ${this.heroHp}/${this.heroMaxHp}`);
  }

  private showDamageNumber(x: number, y: number, val: number, color: string) {
    const t = this.add.text(x, y, `-${val}`, { color, fontSize: '16px', fontStyle: 'bold' }).setDepth(12);
    this.tweens.add({ targets: t, y: y - 36, alpha: 0, duration: 850, onComplete: () => t.destroy() });
  }

  private showMessage(msg: string, color: string) {
    const t = this.add.text(this.scale.width / 2, this.scale.height / 2 - 70, msg, {
      color, fontSize: '17px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: this.scale.height / 2 - 110, alpha: 0, duration: 2100, onComplete: () => t.destroy() });
  }

  update(time: number, delta: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.creatAttackCooldown > 0) this.creatAttackCooldown -= delta;
    this.hero.update(time, delta);
    this.updatePrepSummary();

    const { width, height } = this.scale;

    for (const pickup of this.pickups) {
      if (!pickup.sprite.active) continue;
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, pickup.sprite.x, pickup.sprite.y) < 32) {
        this.collectPickup(pickup);
      }
    }
    this.pickups = this.pickups.filter((pickup) => pickup.sprite.active);

    let inHealingGrove = false;
    for (const grove of this.healingGroveCenters) {
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, grove.x, grove.y) < 70) {
        inHealingGrove = true;
        break;
      }
    }

    if (inHealingGrove && this.heroHp < this.heroMaxHp) {
      this.groveHealTick += delta;
      if (this.groveHealTick >= 240) {
        this.groveHealTick = 0;
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 1);
        this.updateHeroHp();
      }
      this.promptText.setText('Healing Grove active: HP regenerating over time.');
    } else if (this.promptText.text.startsWith('Healing Grove active')) {
      this.groveHealTick = 0;
      this.promptText.setText('SPACE/Click=Attack  •  Watch the lava!');
    }

    // Creat companion follows
    if (this.creatSprite?.active) {
      this.creatSprite.x += ((this.hero.x - 34) - this.creatSprite.x) * 0.12;
      // Creat auto-attack
      if (this.creatAttackCooldown <= 0) {
        let nearest: VEnemy | null = null; let nearDist = Infinity;
        for (const e of this.enemies) {
          if (!e.sprite.active) continue;
          const d = Phaser.Math.Distance.Between(this.creatSprite.x, this.creatSprite.y, e.sprite.x, e.sprite.y);
          if (d < nearDist) { nearDist = d; nearest = e; }
        }
        if (nearest && nearDist < 200) {
          this.creatAttackCooldown = 1800;
          const cdmg = 10;
          nearest.hp = Math.max(0, nearest.hp - cdmg);
          this.showDamageNumber(nearest.sprite.x, nearest.sprite.y - 28, cdmg, '#f0abfc');
          this.updateEnemyHp(nearest);
          this.creatSprite.setTint(0xf0abfc);
          this.time.delayedCall(180, () => this.creatSprite?.clearTint());
          if (nearest.hp <= 0) this.killEnemy(nearest);
        }
      }
    }

    // Enemy AI
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      const d = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      if (d < 200) {
        const ang = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, this.hero.x, this.hero.y);
        enemy.sprite.x += Math.cos(ang) * enemy.speed * delta / 1000;
        enemy.sprite.y += Math.sin(ang) * enemy.speed * delta / 1000;
        if (d < 28 && this.hurtFlashTimer <= 0) {
          this.heroHp -= enemy.touchDamage;
          this.hurtFlashTimer = 500;
          this.showDamageNumber(this.hero.x, this.hero.y - 30, enemy.touchDamage, '#f87171');
          this.cameras.main.shake(100, 0.01);
          if (this.heroHp <= 0) {
            this.heroHp = 0; this.updateHeroHp();
            this.showMessage('The volcano consumed your discernment this time. Returning to Haven...', '#f59e0b');
            this.time.delayedCall(1800, () => this.scene.start('HavenGrounds'));
          } else { this.updateHeroHp(); }
        }
      } else {
        const t = enemy.patrolPoints[enemy.patrolIndex];
        const pa = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, t.x, t.y);
        enemy.sprite.x += Math.cos(pa) * enemy.speed * 0.45 * delta / 1000;
        enemy.sprite.y += Math.sin(pa) * enemy.speed * 0.45 * delta / 1000;
        if (Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, t.x, t.y) < 10)
          enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPoints.length;
      }
      enemy.sprite.x = Phaser.Math.Clamp(enemy.sprite.x, 28, width - 28);
      enemy.sprite.y = Phaser.Math.Clamp(enemy.sprite.y, 52, height - 48);
      enemy.hpBg.setPosition(enemy.sprite.x, enemy.sprite.y - 22);
      enemy.hpBar.setPosition(enemy.sprite.x - 23, enemy.sprite.y - 22);
    }
    this.enemies = this.enemies.filter((e) => e.sprite.active);

    if (this.hurtFlashTimer > 0) { this.hurtFlashTimer -= delta; this.hero.setTint(0xff2222); }
    else this.hero.setTint(0xfca5a5);

    this.hero.x = Phaser.Math.Clamp(this.hero.x, 20, width - 20);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, 44, height - 40);
  }
}
