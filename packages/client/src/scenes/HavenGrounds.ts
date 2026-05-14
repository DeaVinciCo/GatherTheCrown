import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import HeroSprite from '../actors/HeroSprite';
import { DISPLAY_NAME_MAX_CHARS, DISPLAY_NAME_MAX_WORDS, HERO_RENAME_COST_GC, CREAT_RENAME_UNLOCK_LEVEL } from '../constants/GameConstants';
import { normalizeDisplayName, validateDisplayName } from '../utils/nameValidation';
import { getCreatSpecies, getCreatSpeciesByName, type CreatSpeciesEntry } from '../systems/CreatSpecies';
import { InventoryMenu, InventoryItem } from '../ui/InventoryMenu';
import AchievementPanel from '../ui/AchievementPanel';
import { openGameChatOverlay } from '../ui/GameChatOverlay';
import { getAchievementsFromRegistry, updateAchievementRegistryFlags } from '../progression/achievements';
import { getBondTier, getNeglectStage, COMPATIBILITY, calculatePassiveDecay, calculateHungerDecay, getPreferredFoods, getUniversalFoods, applyFeeding, getOffenseTier, getRelationshipEffects, type BondCompatibility } from '../systems/CreatBondSystem';
import { SANCTUARY_NAMESETS } from '../data/SanctuaryLocationReference';
import AudioManager from '../audio/AudioManager';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';

interface HavenEnemy {
  sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  maxHp: number;
  speed: number;
  touchDamage: number;
  rewardGold: number;
  hpBar: Phaser.GameObjects.Image;
  hpFill: Phaser.GameObjects.Image;
  spawnTime: number;
  patrolTarget?: { x: number; y: number };
}

interface HavenPickup {
  sprite: Phaser.Physics.Arcade.Sprite;
  kind: 'gold-cache' | 'green-gem' | 'soulshard' | 'ember-fruit';
  amount: number;
  spawnTime: number;
}

interface PathGate {
  sprite: Phaser.GameObjects.Sprite;
  label: string;
  targetScene: string;
  description: string;
}

export default class HavenGrounds extends Phaser.Scene {
  private hero!: HeroSprite;
  private cameraZoom = 1.26;
  private readonly cameraZoomMin = 1.14;
  private readonly cameraZoomMax = 1.6;
  private creatSprite?: Phaser.GameObjects.Sprite;
  private enemies: HavenEnemy[] = [];
  private pickups: HavenPickup[] = [];
  private pathGates: PathGate[] = [];
  private healingTreeCenters: Array<{ x: number; y: number }> = [];
  private heroMaxHp: number = 100;
  private heroHp: number = 100;
  private heroHpBar!: Phaser.GameObjects.Image;
  private heroHpText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private gemsText!: Phaser.GameObjects.Text;
  private shardsText!: Phaser.GameObjects.Text;
  private fruitText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private creatBondPanel?: Phaser.GameObjects.Container;
  private achievementsPanel?: AchievementPanel;
  private prevHeroX = 0;
  private prevHeroY = 0;

  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'HavenGrounds', {
    onMap: () => this.openMapMenu(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu(),
    onAchievements: () => this.openAchievements(),
    extraHandlers: {
      b: () => this.openCreatBondPanel(),
      v: () => this.scene.start('CameraShowcase')
    }
  });

  constructor() {
    super('HavenGrounds');
  }

  private setCameraZoom(nextZoom: number) {
    this.cameraZoom = Phaser.Math.Clamp(nextZoom, this.cameraZoomMin, this.cameraZoomMax);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  create() {
    const { width, height } = this.scale;
    gameRegistry.loadFromLocalStorage();
    gameRegistry.setHavenUnlocked(true);
    this.registry.set('havenUnlocked', true);
    const restDays = gameRegistry.homeBaseRestDays || 0;
    const storyReady = !!gameRegistry.homeBaseStoryReady || restDays >= 2;
    this.heroHp = 100;
    this.heroMaxHp = 100;
    AudioManager.attachScene(this);
    AudioManager.playAmbientLoop('day');

    // ── Terrain ─────────────────────────────────────────────────────────
    for (let tx = 0; tx < width; tx += 32)
      for (let ty = 0; ty < height; ty += 32)
        this.add.image(tx + 16, ty + 16, 'stone').setDepth(0).setAlpha(0.4);
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a3a1a, 0.3).setDepth(0);

    // Grass patches for walkable area
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(40, width - 40);
      const y = Phaser.Math.Between(100, height - 80);
      this.add.circle(x, y, Phaser.Math.Between(12, 24), 0x22c55e, 0.12).setDepth(1);
    }

    // ── Healing Groves ──────────────────────────────────────────────────
    this.spawnHealingGrove(140, 180);
    this.spawnHealingGrove(width - 140, 200);
    this.spawnHealingGrove(width / 2, height - 120);

    // ── Spawn small enemies ──────────────────────────────────────────────
    this.spawnEnemy(240, 120, 'venom-spider');
    this.spawnEnemy(width - 240, height - 100, 'root-beast');
    this.spawnEnemy(width / 2 - 100, height / 2, 'venom-spider');

    // ── Spawn initial pickups ───────────────────────────────────────────
    this.spawnPickup(320, 260, 'gold-cache', 1);
    this.spawnPickup(width - 320, 280, 'green-gem', 1);
    this.spawnPickup(240, height - 180, 'soulshard', 1);
    this.spawnPickup(width - 200, 120, 'ember-fruit', 1);

    // ── Path Gates ──────────────────────────────────────────────────────
    this.spawnPathGate(120, height / 2 - 80, 'ForestTrialsGate', '🌲 Forest Trials Path', 'Guided route · stronger combat · faster leveling');
    this.spawnPathGate(width - 120, height / 2 + 60, 'SanctuaryIsleOverworld', '⛵ Sanctuary Dock Route', 'Boat arrival · island roads · home base travel');

    // ── Hero ─────────────────────────────────────────────────────────────
    this.hero = new HeroSprite(this, width / 2, height / 2);
    this.hero.setDepth(5);
    this.prevHeroX = this.hero.x;
    this.prevHeroY = this.hero.y;

    const camera = this.cameras.main;
    camera.setBounds(0, 0, width, height);
    camera.startFollow(this.hero, true, 0.14, 0.14, -12, 72);
    this.setCameraZoom(1.26);
    camera.roundPixels = true;

    // Creat companion if hatched
    const hasHatchedCreat = !!this.registry.get('hasHatchedCreat');
    const heroElement = (this.registry.get('heroElement') as string) || 'Fire';
    const creatElement = (this.registry.get('creatElement') as string) || heroElement;
    if (hasHatchedCreat && creatElement) {
      const creatKey = `creat-${creatElement.toLowerCase()}`;
      this.creatSprite = this.add.sprite(this.hero.x - 40, this.hero.y + 16, creatKey).setScale(1.2).setDepth(5);
      this.tweens.add({ targets: this.creatSprite, y: this.creatSprite.y - 4, yoyo: true, repeat: -1, duration: 800 });
    }

    // ── HUD ──────────────────────────────────────────────────────────────
    this.add.rectangle(width / 2, 24, width, 48, 0x000000, 0.7).setDepth(10);

    const heroName = (this.registry.get('heroName') as string) || 'Hero';
    const heroClass = (this.registry.get('heroClass') as string) || 'Knight';
    this.add.text(16, 12, `${heroName}  |  ${heroClass}  Lv.1`, { color: '#fbbf24', fontSize: '13px', fontStyle: 'bold' }).setDepth(11);

    this.add.image(width - 165, 24, 'hpbg').setDepth(10).setDisplaySize(100, 10);
    this.heroHpBar = this.add.image(width - 215, 24, 'hpfill').setDepth(11).setDisplaySize(100, 10).setOrigin(0, 0.5).setTint(0x22c55e);
    this.heroHpText = this.add.text(width - 215, 12, 'HP 100/100', { color: '#86efac', fontSize: '12px' }).setDepth(11);
    this.updateHeroHp();

    // Currencies HUD
    const gold = this.registry.get('gold') as number || 0;
    const gems = this.registry.get('greenGems') as number || 0;
    const shards = this.registry.get('soulshards') as number || 0;
    const fruit = this.registry.get('emberFruit') as number || 0;

    this.goldText = this.add.text(16, height - 40, `💰 Gold: ${gold}`, { color: '#fbbf24', fontSize: '12px' }).setDepth(11);
    this.gemsText = this.add.text(16, height - 24, `◈ Gems: ${gems}`, { color: '#86efac', fontSize: '12px' }).setDepth(11);
    this.shardsText = this.add.text(width / 2 - 80, height - 40, `✦ Shards: ${shards}`, { color: '#d8b4fe', fontSize: '12px' }).setDepth(11);
    this.fruitText = this.add.text(width / 2 - 80, height - 24, `🍊 Fruit: ${fruit}`, { color: '#fbbf24', fontSize: '12px' }).setDepth(11);

    this.statusText = this.add.text(width / 2, height - 52, storyReady
      ? 'Home Base readiness complete. Forest Trials and Story Work lanes are open.'
      : `Choose your beginning loop: Forest Trials for guided action, or Sanctuary for Day ${restDays + 1} prep tasks. Story Work opens after 2 completed prep days.`, {
      color: '#cbd5e1', fontSize: '10px', wordWrap: { width: 560 }, align: 'center'
    }).setOrigin(0.5, 1).setDepth(11);

    // ── Control hints ───────────────────────────────────────────────────
    this.add.text(width - 10, 56, 'Arrow Keys/WASD=Move  Space/Click=Attack', { color: '#64748b', fontSize: '10px' }).setOrigin(1, 0).setDepth(11).setScrollFactor(0);
    this.add.text(width - 10, 70, 'M=Map  I=Inventory  A=Achievements  B=Bond  V=Cam Lab  Shift=Chat', { color: '#64748b', fontSize: '10px' }).setOrigin(1, 0).setDepth(11).setScrollFactor(0);
    this.add.text(width - 10, 84, 'Wheel=Zoom  [ ]=Cam +/-', { color: '#64748b', fontSize: '10px' }).setOrigin(1, 0).setDepth(11).setScrollFactor(0);

    // ── Button panel ─────────────────────────────────────────────────────
    const bondBtn = this.add.text(10, height - 60, '🩶 Bond', {
      color: '#c4b5fd', fontSize: '11px', backgroundColor: '#1f2937'
    }).setOrigin(0, 1).setDepth(11).setInteractive({ useHandCursor: true }).setPadding(6, 3);
    bondBtn.on('pointerdown', () => this.openCreatBondPanel());

    const invBtn = this.add.text(10, height - 40, '🎒 Inventory', {
      color: '#d1d5db', fontSize: '11px', backgroundColor: '#1f2937'
    }).setOrigin(0, 1).setDepth(11).setInteractive({ useHandCursor: true }).setPadding(6, 3);
    invBtn.on('pointerdown', () => this.openInventory());

    const achBtn = this.add.text(10, height - 20, `🏅 Achievements`, {
      color: '#fcd34d', fontSize: '11px', backgroundColor: '#111827'
    }).setOrigin(0, 1).setDepth(11).setInteractive({ useHandCursor: true }).setPadding(6, 3);
    achBtn.on('pointerdown', () => this.openAchievements());

    // ── Combat ───────────────────────────────────────────────────────────
    this.input.keyboard?.on('keydown-SPACE', () => this.doAttack());
    this.input.keyboard?.on('keydown-ONE', () => this.setCameraZoom(1.14));
    this.input.keyboard?.on('keydown-TWO', () => this.setCameraZoom(1.26));
    this.input.keyboard?.on('keydown-THREE', () => this.setCameraZoom(1.36));
    this.input.keyboard?.on('keydown-OPEN_BRACKET', () => this.setCameraZoom(this.cameraZoom - 0.05));
    this.input.keyboard?.on('keydown-CLOSED_BRACKET', () => this.setCameraZoom(this.cameraZoom + 0.05));
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _over: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      const step = dy > 0 ? -0.035 : 0.035;
      this.setCameraZoom(this.cameraZoom + step);
    });
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (this.pathGates.some(g => Phaser.Math.Distance.Between(ptr.x, ptr.y, g.sprite.x, g.sprite.y) < 50)) return;
      this.doAttack();
    });

    // ── Respawn enemies after 30s ────────────────────────────────────────
    this.time.addEvent({
      delay: 30000,
      callback: () => {
        for (const enemy of this.enemies) {
          if (!enemy.sprite.active) {
            const newX = Phaser.Math.Between(100, width - 100);
            const newY = Phaser.Math.Between(100, height - 100);
            enemy.sprite.setPosition(newX, newY).setActive(true).setVisible(true);
            enemy.hp = enemy.maxHp;
            this.updateEnemyHp(enemy);
          }
        }
      },
      repeat: -1
    });

    // ── Passive healing in groves ────────────────────────────────────────
    this.time.addEvent({
      delay: 1000,
      callback: () => this.checkHealingGroves(),
      repeat: -1
    });

    // ── Keyboard/window cleanup ──────────────────────────────────────────
    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    // ── Startup confirmation ─────────────────────────────────────────────
    this.add.text(width / 2, 20, '✨ Camera V2 Live: Zoom & Camera Controls Active ✨', {
      color: '#ecfdf5',
      fontSize: '14px',
      fontStyle: 'bold',
      backgroundColor: '#065f46',
      align: 'center'
    }).setOrigin(0.5).setDepth(999).setScrollFactor(0).setPadding(8, 4);
  }

  update() {
    if (!this.hero) return;
    const { width, height } = this.scale;

    // ── Hero movement ───────────────────────────────────────────────────
    const speed = 140;
    let vx = 0, vy = 0;
    if (this.input.keyboard?.isDown('UP') || this.input.keyboard?.isDown('W')) vy -= speed;
    if (this.input.keyboard?.isDown('DOWN') || this.input.keyboard?.isDown('S')) vy += speed;
    if (this.input.keyboard?.isDown('LEFT') || this.input.keyboard?.isDown('A')) vx -= speed;
    if (this.input.keyboard?.isDown('RIGHT') || this.input.keyboard?.isDown('D')) vx += speed;

    const newX = Phaser.Math.Clamp(this.hero.x + (vx * this.game.loop.delta / 1000), 30, width - 30);
    const newY = Phaser.Math.Clamp(this.hero.y + (vy * this.game.loop.delta / 1000), 60, height - 60);
    this.hero.setPosition(newX, newY);
    const movedDist = Phaser.Math.Distance.Between(this.prevHeroX, this.prevHeroY, newX, newY);
    if (movedDist > 1.5 && (vx !== 0 || vy !== 0)) {
      AudioManager.playFootstep('path');
    }
    this.prevHeroX = newX;
    this.prevHeroY = newY;

    if (this.creatSprite) {
      this.creatSprite.setPosition(this.hero.x - 40, this.hero.y + 16);
    }

    // ── Enemy AI: wander and patrol ──────────────────────────────────────
    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;

      const dx = this.hero.x - enemy.sprite.x;
      const dy = this.hero.y - enemy.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 180) {
        // Chase hero
        enemy.sprite.setVelocity((dx / dist) * enemy.speed, (dy / dist) * enemy.speed);
      } else {
        // Wander
        if (!enemy.patrolTarget || Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, enemy.patrolTarget.x, enemy.patrolTarget.y) < 20) {
          enemy.patrolTarget = {
            x: Phaser.Math.Between(60, width - 60),
            y: Phaser.Math.Between(80, height - 60)
          };
        }
        const targetDx = enemy.patrolTarget.x - enemy.sprite.x;
        const targetDy = enemy.patrolTarget.y - enemy.sprite.y;
        const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        enemy.sprite.setVelocity((targetDx / targetDist) * enemy.speed * 0.6, (targetDy / targetDist) * enemy.speed * 0.6);
      }

      // Keep in bounds
      enemy.sprite.x = Phaser.Math.Clamp(enemy.sprite.x, 30, width - 30);
      enemy.sprite.y = Phaser.Math.Clamp(enemy.sprite.y, 60, height - 60);

      // Touch damage
      const heroEnemyDist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      if (heroEnemyDist < 28) {
        this.heroHp = Math.max(0, this.heroHp - (enemy.touchDamage * this.game.loop.delta / 1000));
        this.updateHeroHp();
      }
    }

    // ── Pickup collection ────────────────────────────────────────────────
    for (const pickup of this.pickups) {
      if (!pickup.sprite.active) continue;
      const pickupDist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, pickup.sprite.x, pickup.sprite.y);
      if (pickupDist < 24) {
        this.collectPickup(pickup);
      }
    }

    // ── Path gate activation ─────────────────────────────────────────────
    for (const gate of this.pathGates) {
      const gateDist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, gate.sprite.x, gate.sprite.y);
      if (gateDist < 50) {
        this.statusText.setText(`Press SPACE or click to enter: ${gate.label}`);
        gate.sprite.setTint(0x44ff44);
      } else {
        gate.sprite.setTint(0xffffff);
      }
    }
  }

  private spawnHealingGrove(cx: number, cy: number) {
    const points: Array<[number, number]> = [
      [cx - 28, cy - 14], [cx, cy - 24], [cx + 28, cy - 14],
      [cx - 34, cy + 16], [cx, cy + 24], [cx + 34, cy + 16]
    ];
    for (const [x, y] of points) {
      const tree = this.add.sprite(x, y, 'heal-tree').setDepth(4).setScale(0.85).setTint(0x22c55e);
      this.tweens.add({ targets: tree, y: y - 3, yoyo: true, repeat: -1, duration: 1600 });
    }
    this.add.circle(cx, cy, 46, 0x22c55e, 0.08).setDepth(2);
    this.add.text(cx, cy + 50, 'Healing Grove', { color: '#86efac', fontSize: '10px' }).setOrigin(0.5).setDepth(5);
    this.healingTreeCenters.push({ x: cx, y: cy });
  }

  private spawnEnemy(x: number, y: number, kind: 'venom-spider' | 'root-beast') {
    const cfg = kind === 'venom-spider'
      ? { texture: 'venom-spider', hp: 15, speed: 70, touchDamage: 4, rewardGold: 6 }
      : { texture: 'root-beast', hp: 25, speed: 50, touchDamage: 6, rewardGold: 10 };

    const sprite = this.physics.add.sprite(x, y, cfg.texture).setDepth(5);
    const hpBg = this.add.image(x, y - 18, 'hpbg').setDepth(5).setDisplaySize(40, 7);
    const hpFill = this.add.image(x - 20, y - 18, 'hpfill').setDepth(6).setDisplaySize(40, 7).setOrigin(0, 0.5).setTint(0x22c55e);

    const enemy: HavenEnemy = {
      sprite, hp: cfg.hp, maxHp: cfg.hp, speed: cfg.speed, touchDamage: cfg.touchDamage,
      rewardGold: cfg.rewardGold, hpBar: hpBg, hpFill, spawnTime: Date.now()
    };

    this.enemies.push(enemy);
  }

  private spawnPickup(x: number, y: number, kind: 'gold-cache' | 'green-gem' | 'soulshard' | 'ember-fruit', amount: number) {
    const colors: Record<string, string> = {
      'gold-cache': '#fbbf24', 'green-gem': '#86efac', 'soulshard': '#d8b4fe', 'ember-fruit': '#f97316'
    };
    const labels: Record<string, string> = {
      'gold-cache': 'Gold Cache', 'green-gem': 'Green Gem', 'soulshard': 'Soulshard', 'ember-fruit': 'Ember Fruit'
    };

    const sprite = this.physics.add.sprite(x, y, kind).setDepth(5);
    this.tweens.add({ targets: sprite, y: y - 8, yoyo: true, repeat: -1, duration: 950 });
    this.add.text(x, y - 16, labels[kind], { color: colors[kind], fontSize: '9px' }).setOrigin(0.5).setDepth(5);

    this.pickups.push({ sprite, kind, amount, spawnTime: Date.now() });
  }

  private spawnPathGate(x: number, y: number, targetScene: string, label: string, description: string) {
    const sprite = this.add.sprite(x, y, 'portal').setDepth(4).setScale(1.4).setTint(0x0ea5e9);
    this.tweens.add({ targets: sprite, angle: 360, duration: 3000, repeat: -1 });
    
    this.add.text(x, y - 50, label, { color: '#0ea5e9', fontSize: '12px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(4);
    this.add.text(x, y + 50, description, { color: '#64748b', fontSize: '9px', wordWrap: { width: 120 } }).setOrigin(0.5).setDepth(4);

    sprite.setInteractive();
    sprite.on('pointerdown', () => this.scene.start(targetScene));

    this.pathGates.push({ sprite, label, targetScene, description });
  }

  private doAttack() {
    const { width, height } = this.scale;
    let hitAny = false;

    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;
      const dist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      if (dist < 50) {
        enemy.hp -= 12;
        this.updateEnemyHp(enemy);
        hitAny = true;

        if (enemy.hp <= 0) {
          this.registry.set('gold', (this.registry.get('gold') as number || 0) + enemy.rewardGold);
          gameRegistry.setGold(gameRegistry.gold + enemy.rewardGold);
          this.goldText.setText(`💰 Gold: ${this.registry.get('gold')}`);
          enemy.sprite.setActive(false).setVisible(false);
          AudioManager.playCombatHit('heavy');
          this.showMessage(`Defeated! +${enemy.rewardGold} gold`, '#86efac');
        } else {
          AudioManager.playCombatHit('light');
          this.showMessage(`Hit! ${enemy.hp}/${enemy.maxHp} HP`, '#fca5a5');
        }
      }
    }

    if (hitAny) {
      const slash = this.add.sprite(this.hero.x + 30, this.hero.y, 'slash').setDepth(8).setTint(0x22c55e);
      this.tweens.add({
        targets: slash, alpha: 0, duration: 150, onComplete: () => slash.destroy()
      });
    }
  }

  private updateEnemyHp(enemy: HavenEnemy) {
    const barWidth = (40 * enemy.hp) / enemy.maxHp;
    enemy.hpFill.setDisplaySize(barWidth, 7);
    enemy.hpFill.x = enemy.sprite.x - 20 + barWidth / 2;
  }

  private updateHeroHp() {
    const barWidth = (100 * this.heroHp) / this.heroMaxHp;
    this.heroHpBar.setDisplaySize(barWidth, 10);
    this.heroHpBar.x = this.scale.width - 215 + barWidth / 2;
    this.heroHpText.setText(`HP ${Math.ceil(this.heroHp)}/${this.heroMaxHp}`);

    if (this.heroHp > 0 && this.heroHp <= this.heroMaxHp * 0.3) {
      AudioManager.playDangerCue('low');
    }

    if (this.heroHp <= 0) {
      this.hero.setTint(0x555555);
      this.statusText.setText('You have fallen. Return to Haven.');
      this.time.delayedCall(2000, () => this.scene.start('HavenGrounds'));
    }
  }

  private collectPickup(pickup: HavenPickup) {
    if (!pickup.sprite.active) return;
    pickup.sprite.destroy();

    const { kind, amount } = pickup;
    if (kind === 'gold-cache') {
      AudioManager.playPickup('coin');
      this.registry.set('gold', (this.registry.get('gold') as number || 0) + amount);
      gameRegistry.setGold(gameRegistry.gold + amount);
      this.goldText.setText(`💰 Gold: ${this.registry.get('gold')}`);
      this.showMessage('Gold Cache found!', '#fbbf24');
    } else if (kind === 'green-gem') {
      AudioManager.playPickup('material');
      this.registry.set('greenGems', (this.registry.get('greenGems') as number || 0) + amount);
      gameRegistry.setGreenGems(gameRegistry.greenGems + amount);
      this.gemsText.setText(`◈ Gems: ${this.registry.get('greenGems')}`);
      this.showMessage('Green Gem collected!', '#86efac');
    } else if (kind === 'soulshard') {
      AudioManager.playPickup('material');
      this.registry.set('soulshards', (this.registry.get('soulshards') as number || 0) + amount);
      gameRegistry.setSoulshards(gameRegistry.soulshards + amount);
      this.shardsText.setText(`✦ Shards: ${this.registry.get('soulshards')}`);
      this.showMessage('Soulshard gathered!', '#d8b4fe');
    } else if (kind === 'ember-fruit') {
      AudioManager.playPickup('item');
      this.registry.set('emberFruit', (this.registry.get('emberFruit') as number || 0) + amount);
      gameRegistry.setEmberFruit(gameRegistry.emberFruit + amount);
      this.fruitText.setText(`🍊 Fruit: ${this.registry.get('emberFruit')}`);
      this.showMessage('Ember Fruit — restores vitality!', '#fbbf24');
      this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 15);
      this.updateHeroHp();
    }
  }

  private checkHealingGroves() {
    for (const grove of this.healingTreeCenters) {
      const dist = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, grove.x, grove.y);
      if (dist < 50) {
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 8);
        this.updateHeroHp();
        if (this.heroHp < this.heroMaxHp) {
          this.showMessage('Healing...', '#86efac');
        }
      }
    }
  }

  private showMessage(text: string, color: string) {
    const msg = this.add.text(this.hero.x, this.hero.y - 40, text, { color, fontSize: '12px', fontStyle: 'bold' }).setDepth(10);
    this.tweens.add({
      targets: msg, y: msg.y - 30, alpha: 0, duration: 1200,
      onComplete: () => msg.destroy()
    });
  }

  private openCreatBondPanel() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.creat-bond-panel') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const hasHatchedCreat = !!this.registry.get('hasHatchedCreat');
    const creatName = (this.registry.get('creatName') as string) || 'Creat';
    const creatBond = (this.registry.get('creatBond') as number) || 0;
    const creatHunger = (this.registry.get('creatHunger') as number) ?? 100;
    const creatCompat = ((this.registry.get('creatCompatibility') as string) || 'match') as BondCompatibility;
    const creatElement = (this.registry.get('creatElement') as string) || '';

    const root = document.createElement('div');
    root.className = 'creat-bond-panel';
    Object.assign(root.style, {
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: 'rgba(10, 15, 30, 0.95)', border: '2px solid #c4b5fd', borderRadius: '12px',
      minWidth: '340px', padding: '16px', zIndex: '999', boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
      color: '#e2e8f0'
    });

    const title = document.createElement('div');
    title.innerText = `${creatName} - Bond Status`;
    Object.assign(title.style, { color: '#c4b5fd', fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' });
    root.appendChild(title);

    if (hasHatchedCreat) {
      const bondLabel = document.createElement('div');
      bondLabel.innerText = `Bond: ${Math.round(creatBond)}% | Hunger: ${Math.round(creatHunger)}%`;
      Object.assign(bondLabel.style, { marginBottom: '8px', fontSize: '13px', color: '#fbbf24' });
      root.appendChild(bondLabel);

      const compLabel = document.createElement('div');
      compLabel.innerText = `Compatibility: ${creatCompat === 'match' ? 'Match ✓' : 'Diverge ⚠'}`;
      Object.assign(compLabel.style, { marginBottom: '12px', fontSize: '12px', color: creatCompat === 'match' ? '#86efac' : '#f97316' });
      root.appendChild(compLabel);
    } else {
      const eggLabel = document.createElement('div');
      eggLabel.innerText = 'No Creat hatched yet. Find an egg through Forest Trials or Sanctuary Trail scouting.';
      Object.assign(eggLabel.style, { color: '#94a3b8', marginBottom: '12px' });
      root.appendChild(eggLabel);
    }

    const close = document.createElement('button');
    close.innerText = 'Close [B]';
    Object.assign(close.style, {
      width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #475569',
      background: '#1f2937', color: '#cbd5e1', cursor: 'pointer'
    });
    close.onclick = () => root.remove();
    root.appendChild(close);

    container.appendChild(root);
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
      { id: 'tower-shield', name: 'Tower Shield', equipped: false }
    ];
    const playerLevel = Number(this.registry.get('currentCrownLevel') || this.registry.get('playerLevel') || this.registry.get('level') || 1);
    new InventoryMenu(items, (updated) => this.registry.set('inventory', updated), { playerLevel }).attach(container);
  }

  private openAchievements() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.achievement-panel') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    updateAchievementRegistryFlags(this.registry);
    this.achievementsPanel = new AchievementPanel(getAchievementsFromRegistry(this.registry));
    this.achievementsPanel.attach(container);
  }

  private openMapMenu() {
    const container = document.getElementById('game');
    if (!container) return;
    const canTravelHomeNow = this.canInstantTravelHome();

    const existing = container.querySelector('.map-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const root = document.createElement('div');
    root.className = 'map-menu';
    Object.assign(root.style, {
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: 'rgba(10, 15, 30, 0.72)', color: '#d1d5db', border: '1px solid #334155',
      backdropFilter: 'blur(4px)',
      borderRadius: '10px', minWidth: '320px', padding: '12px', zIndex: '99',
      boxShadow: '0 12px 30px rgba(0,0,0,0.45)'
    });

    const title = document.createElement('div');
    title.innerText = 'World Map';
    Object.assign(title.style, { color: '#fbbf24', fontWeight: 'bold', marginBottom: '10px' });
    root.appendChild(title);

    const travelRule = document.createElement('div');
    travelRule.innerText = canTravelHomeNow
      ? 'Safe marker detected: Home Base travel is available.'
      : 'Find a Sanctuary Portal or safe marker to return home.';
    Object.assign(travelRule.style, {
      color: canTravelHomeNow ? '#86efac' : '#fca5a5',
      fontSize: '12px',
      marginBottom: '10px'
    });
    root.appendChild(travelRule);

    const restDays = gameRegistry.homeBaseRestDays || 0;
    const storyReady = !!gameRegistry.homeBaseStoryReady || restDays >= 2;

    const spots: Array<{ label: string; scene: string; requiresSafeMarker?: boolean; requiresStoryReady?: boolean }> = [
      { label: 'Haven Grounds', scene: 'HavenGrounds' },
      { label: 'Forest Trials Gate', scene: 'ForestTrialsGate' },
      { label: SANCTUARY_NAMESETS.townCasual, scene: 'SanctuaryTown', requiresSafeMarker: true },
      { label: `${SANCTUARY_NAMESETS.regionCasual} SouthFerry Dock`, scene: 'SanctuaryIsleOverworld', requiresSafeMarker: true },
      { label: 'Volcano Zone', scene: 'VolcanoZone', requiresStoryReady: true },
      { label: 'Crown Trial I', scene: 'CrownTrial01', requiresStoryReady: true },
      { label: 'District 01', scene: 'District01', requiresStoryReady: true }
    ];

    for (const spot of spots) {
      const btn = document.createElement('button');
      btn.innerText = spot.label;
      Object.assign(btn.style, {
        display: 'block', width: '100%', marginBottom: '6px', padding: '8px', borderRadius: '6px',
        border: '1px solid #374151', background: '#111827', color: '#e5e7eb', cursor: 'pointer', opacity: '1'
      });

      if (spot.requiresSafeMarker && !canTravelHomeNow) {
        btn.disabled = true;
        btn.title = 'Find a Sanctuary Portal or safe marker to return home.';
        btn.style.opacity = '0.45';
        btn.style.cursor = 'not-allowed';
      }

      if (spot.requiresStoryReady && !storyReady) {
        btn.disabled = true;
        btn.title = `Locked: Spend 2 Home Base days in Sanctuary first (${restDays}/2 complete).`;
        btn.style.opacity = '0.45';
        btn.style.cursor = 'not-allowed';
      }

      btn.onclick = () => {
        if (spot.requiresSafeMarker && !canTravelHomeNow) return;
        if (spot.requiresStoryReady && !storyReady) return;
        root.remove();
        this.scene.start(spot.scene);
      };
      root.appendChild(btn);
    }

    const close = document.createElement('button');
    close.innerText = 'Close [M]';
    Object.assign(close.style, {
      marginTop: '4px', width: '100%', padding: '8px', borderRadius: '6px',
      border: '1px solid #475569', background: '#1f2937', color: '#cbd5e1', cursor: 'pointer'
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
      sceneLabel: 'Haven Grounds',
      scopeKey: 'haven-grounds',
      registry: this.registry,
    });
  }

  private canInstantTravelHome(): boolean {
    const nearPathGate = this.pathGates.some((gate) =>
      Phaser.Math.Distance.Between(this.hero.x, this.hero.y, gate.sprite.x, gate.sprite.y) <= 110
    );
    if (nearPathGate) return true;

    return this.healingTreeCenters.some((tree) =>
      Phaser.Math.Distance.Between(this.hero.x, this.hero.y, tree.x, tree.y) <= 75
    );
  }
}
