import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import { SANCTUARY_NAMESETS } from '../data/SanctuaryLocationReference';
import { InventoryMenu, type InventoryItem } from '../ui/InventoryMenu';
import { openGameChatOverlay } from '../ui/GameChatOverlay';
import AudioManager from '../audio/AudioManager';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';

type EnemyType = 'crawler' | 'brute' | 'flyer';
type EnemyLeg  = 'outbound' | 'return';

interface TrailEnemy {
  sprite: Phaser.GameObjects.Arc;
  hp: number;
  maxHp: number;
  alive: boolean;
  type: EnemyType;
  leg: EnemyLeg;
  // patrol
  patrolCenterX: number;
  patrolCenterY: number;
  patrolRange: number;
  patrolDir: number;
  patrolSpeed: number;
  agroRange: number;
}

interface SupplyNode {
  x: number;
  y: number;
  lane: 'outbound' | 'return';
  kind: 'food' | 'water' | 'materials';
  collected: boolean;
  icon: Phaser.GameObjects.Arc;
}

export default class SanctuaryTrail extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key };

  private enemies: TrailEnemy[] = [];
  private supplies: SupplyNode[] = [];
  private eggIcon?: Phaser.GameObjects.Arc;

  private returning = false;
  private midpointReached = false;
  private eggFound = false;
  private returnEnemiesSpawned = false;
  private lastDangerAlert = 0;

  private foods = 0;
  private waters = 0;
  private materials = 0;
  private enemiesCleared = 0;

  private statusText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private cameraZoom = 1.26;
  private readonly cameraZoomMin = 1.14;
  private readonly cameraZoomMax = 1.38;
  private prevHeroX = 120;
  private prevHeroY = 380;
  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'SanctuaryTrail', {
    onMap: () => this.openMapMenu(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu()
  });

  private readonly laneY = 380;
  private readonly midpointX = 1380;
  private readonly homeStretchX = 430;

  constructor() {
    super('SanctuaryTrail');
  }

  private setCameraZoom(nextZoom: number) {
    this.cameraZoom = Phaser.Math.Clamp(nextZoom, this.cameraZoomMin, this.cameraZoomMax);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBounds(0, 0, 1700, 760);
    this.drawTrailWorld();
    AudioManager.attachScene(this);
    AudioManager.playAmbientLoop('day');

    this.hero = this.add.circle(120, this.laneY, 14, 0xeff6ff, 1).setDepth(9);
    this.prevHeroX = this.hero.x;
    this.prevHeroY = this.hero.y;

    this.cameras.main.startFollow(this.hero, true, 0.12, 0.12, -24, 56);
    this.setCameraZoom(this.cameraZoom);

    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,E') as { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key };

    this.spawnSupplies();
    this.spawnEnemies();
    this.createHud(width, height);

    this.input.keyboard?.on('keydown-SPACE', () => this.tryAttack());
    this.input.keyboard?.on('keydown-ONE', () => this.setCameraZoom(1.14));
    this.input.keyboard?.on('keydown-TWO', () => this.setCameraZoom(1.26));
    this.input.keyboard?.on('keydown-THREE', () => this.setCameraZoom(1.36));
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('SanctuaryHomeBase'));

    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    this.showStatus('Outbound leg: search upper side pockets, gather supplies, and push to midpoint.', '#a7f3d0');
  }

  update(_time: number, delta: number) {
    const speed = 170;
    const dt = delta / 1000;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || this.keys.a?.isDown) vx -= speed;
    if (this.cursors.right?.isDown || this.keys.d?.isDown) vx += speed;
    if (this.cursors.up?.isDown || this.keys.w?.isDown) vy -= speed;
    if (this.cursors.down?.isDown || this.keys.s?.isDown) vy += speed;

    const nextX = Phaser.Math.Clamp(this.hero.x + vx * dt, 40, 1660);
    const nextY = Phaser.Math.Clamp(this.hero.y + vy * dt, 240, 560);
    this.hero.setPosition(nextX, nextY);

    const movedDist = Phaser.Math.Distance.Between(this.prevHeroX, this.prevHeroY, nextX, nextY);
    if (movedDist > 1.5 && (vx !== 0 || vy !== 0)) {
      AudioManager.playFootstep('path');
    }
    this.prevHeroX = nextX;
    this.prevHeroY = nextY;

    this.updateEnemyMovement(_time, dt);
    this.tryCollectSupplies();
    this.tryTriggerMidpointTurn();
    this.trySpawnEgg();
    this.tryCollectEgg();
    this.tryReturnToSanctuary();

    this.refreshHud();
  }

  private drawTrailWorld() {
    const g = this.add.graphics();

    g.fillStyle(0x0b1326, 1);
    g.fillRect(0, 0, 1700, 760);

    g.fillStyle(0x1f2937, 0.95);
    g.fillRoundedRect(30, this.laneY - 48, 1640, 96, 16);

    g.fillStyle(0x14532d, 0.25);
    g.fillRoundedRect(120, this.laneY - 180, 1320, 120, 18);
    g.fillStyle(0x0f766e, 0.2);
    g.fillRoundedRect(240, this.laneY + 70, 1320, 120, 18);

    this.add.text(86, this.laneY - 92, 'Sanctuary Trailhead', { color: '#bae6fd', fontSize: '12px' }).setDepth(4);
    this.add.text(this.midpointX - 40, this.laneY - 92, 'Midpoint Turn Marker', { color: '#fef3c7', fontSize: '12px' }).setDepth(4);
    this.add.text(this.homeStretchX - 36, this.laneY + 124, 'Home Stretch (return lane)', { color: '#c4b5fd', fontSize: '11px' }).setDepth(4);

    for (let i = 0; i < 14; i += 1) {
      const treeX = 120 + i * 118;
      const topY = 170 + (i % 3) * 16;
      const bottomY = 560 - (i % 3) * 16;
      this.add.circle(treeX, topY, 14, 0x16a34a, 0.32).setDepth(2);
      this.add.circle(treeX + 40, bottomY, 14, 0x15803d, 0.28).setDepth(2);
    }
  }

  private spawnSupplies() {
    const data: Array<Omit<SupplyNode, 'collected' | 'icon'>> = [
      { x: 280, y: this.laneY - 108, lane: 'outbound', kind: 'food' },
      { x: 520, y: this.laneY - 118, lane: 'outbound', kind: 'water' },
      { x: 760, y: this.laneY - 102, lane: 'outbound', kind: 'materials' },
      { x: 1010, y: this.laneY - 116, lane: 'outbound', kind: 'food' },
      { x: 1220, y: this.laneY - 96, lane: 'outbound', kind: 'materials' },
      { x: 1160, y: this.laneY + 108, lane: 'return', kind: 'water' },
      { x: 900, y: this.laneY + 112, lane: 'return', kind: 'food' },
      { x: 700, y: this.laneY + 102, lane: 'return', kind: 'materials' },
      { x: 470, y: this.laneY + 116, lane: 'return', kind: 'food' },
      { x: 300, y: this.laneY + 106, lane: 'return', kind: 'water' }
    ];

    for (const item of data) {
      const color = item.kind === 'food' ? 0xf59e0b : item.kind === 'water' ? 0x38bdf8 : 0x86efac;
      const icon = this.add.circle(item.x, item.y, 10, color, 0.95).setDepth(6);
      this.tweens.add({
        targets: icon,
        alpha: { from: 0.65, to: 1 },
        scale: { from: 0.92, to: 1.12 },
        yoyo: true,
        repeat: -1,
        duration: 680
      });
      this.supplies.push({ ...item, collected: false, icon });
    }
  }

  private spawnEnemies() {
    // Outbound: 3 crawlers, spaced far apart, low pressure.
    // They teach awareness — not a combat gauntlet.
    this.spawnEnemy({
      x: 480, y: this.laneY + 8,
      type: 'crawler', leg: 'outbound',
      hp: 2, range: 70, patrolSpeed: 30, agroRange: 155
    });
    this.spawnEnemy({
      x: 875, y: this.laneY - 10,
      type: 'crawler', leg: 'outbound',
      hp: 2, range: 80, patrolSpeed: 26, agroRange: 165
    });
    this.spawnEnemy({
      x: 1240, y: this.laneY + 6,
      type: 'crawler', leg: 'outbound',
      hp: 2, range: 60, patrolSpeed: 32, agroRange: 145
    });
  }

  private spawnReturnEnemies() {
    // Return: more pressure. You're carrying something important now.
    // 1 crawler, 1 brute (stronger), 1 flyer (fast + aerial, just before egg zone)
    this.spawnEnemy({
      x: 1140, y: this.laneY - 14,
      type: 'crawler', leg: 'return',
      hp: 2, range: 80, patrolSpeed: 36, agroRange: 170
    });
    this.spawnEnemy({
      x: 820, y: this.laneY + 12,
      type: 'brute', leg: 'return',
      hp: 4, range: 50, patrolSpeed: 20, agroRange: 190
    });
    // Flyer hovers above the lane at ~Y=laneY-55 — visible, unsettling, fast.
    this.spawnEnemy({
      x: 540, y: this.laneY - 55,
      type: 'flyer', leg: 'return',
      hp: 2, range: 90, patrolSpeed: 50, agroRange: 210
    });
    this.returnEnemiesSpawned = true;
  }

  private spawnEnemy(opts: {
    x: number; y: number;
    type: EnemyType; leg: EnemyLeg;
    hp: number; range: number; patrolSpeed: number; agroRange: number;
  }) {
    const colorMap: Record<EnemyType, number> = {
      crawler: 0xef4444,
      brute:   0x991b1b,
      flyer:   0xf97316
    };
    const sizeMap: Record<EnemyType, number> = { crawler: 10, brute: 14, flyer: 9 };
    const sprite = this.add
      .circle(opts.x, opts.y, sizeMap[opts.type], colorMap[opts.type], 0.92)
      .setDepth(7);

    this.enemies.push({
      sprite,
      hp: opts.hp,
      maxHp: opts.hp,
      alive: true,
      type: opts.type,
      leg: opts.leg,
      patrolCenterX: opts.x,
      patrolCenterY: opts.y,
      patrolRange: opts.range,
      patrolDir: 1,
      patrolSpeed: opts.patrolSpeed,
      agroRange: opts.agroRange
    });
  }

  private createHud(width: number, _height: number) {
    const panel = this.add.rectangle(12, 12, 456, 122, 0x020617, 0.86)
      .setOrigin(0, 0)
      .setDepth(30)
      .setScrollFactor(0);
    panel.setStrokeStyle(1, 0x334155, 1);

    this.add.text(22, 20, 'Sanctuary Trail (Outbound + Return)', {
      color: '#f8fafc',
      fontSize: '18px',
      fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(31);

    this.add.text(22, 42, 'Move: WASD/Arrows  Space: Light Attack  E: Return Portal  M: Map  I: Inventory  Shift: Chat', {
      color: '#cbd5e1',
      fontSize: '11px'
    }).setScrollFactor(0).setDepth(31);

    this.add.text(22, 54, 'Camera: 1 Wide  2 Gameplay  3 Close', {
      color: '#94a3b8',
      fontSize: '10px'
    }).setScrollFactor(0).setDepth(31);

    this.statsText = this.add.text(22, 62, '', {
      color: '#e2e8f0',
      fontSize: '11px'
    }).setScrollFactor(0).setDepth(31);

    this.objectiveText = this.add.text(width - 10, 16, '', {
      color: '#bfdbfe',
      fontSize: '11px',
      backgroundColor: '#111827'
    }).setOrigin(1, 0).setPadding(8, 4).setScrollFactor(0).setDepth(31);

    this.statusText = this.add.text(width / 2, 16, '', {
      color: '#a7f3d0',
      fontSize: '12px',
      backgroundColor: '#052e16'
    }).setOrigin(0.5, 0).setPadding(8, 4).setScrollFactor(0).setDepth(31);

    this.refreshHud();
  }

  private refreshHud() {
    this.statsText.setText(
      `Supplies F/W/M: ${this.foods}/${this.waters}/${this.materials}   Light foes cleared: ${this.enemiesCleared}   Egg: ${this.eggFound ? 'Found' : 'Not found'}`
    );

    if (!this.returning) {
      this.objectiveText.setText('Objective: Reach midpoint and scout upper pockets.');
    } else if (!this.eggFound) {
      this.objectiveText.setText('Objective: Return via lower pockets. Egg can appear on final stretch.');
    } else {
      this.objectiveText.setText('Objective: Reach trailhead portal and return to Sanctuary.');
    }
  }

  private tryCollectSupplies() {
    for (const node of this.supplies) {
      if (node.collected) continue;
      if (node.lane === 'outbound' && this.returning) continue;
      if (node.lane === 'return' && !this.returning) continue;

      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, node.x, node.y) <= 22) {
        node.collected = true;
        node.icon.destroy();
        AudioManager.playPickup('material');

        if (node.kind === 'food') this.foods += 1;
        if (node.kind === 'water') this.waters += 1;
        if (node.kind === 'materials') this.materials += 1;

        this.showStatus(`Collected ${node.kind}.`, '#bbf7d0');
      }
    }
  }

  private updateEnemyMovement(time: number, dt: number) {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      const dx = this.hero.x - enemy.sprite.x;
      const dy = this.hero.y - enemy.sprite.y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));

      const agro = dist < enemy.agroRange;

      if (agro) {
        // Chase the player at type-based speed
        const chaseSpeed: Record<EnemyType, number> = { crawler: 46, brute: 34, flyer: 68 };
        const spd = chaseSpeed[enemy.type];
        enemy.sprite.x += (dx / dist) * spd * dt;
        enemy.sprite.y += (dy / dist) * spd * dt;

        // Danger alert — throttle to once per 3 s
        if (dist < 90 && (time - this.lastDangerAlert) > 3000) {
          this.lastDangerAlert = time;
          const label = enemy.type === 'flyer' ? 'aerial threat' : enemy.type === 'brute' ? 'heavy foe' : 'creature';
          this.showStatus(`A ${label} is closing in! Space to fight.`, '#fca5a5');
        }
      } else {
        // Patrol: flyer bobs vertically, others wander horizontally
        if (enemy.type === 'flyer') {
          const bobY = enemy.patrolCenterY + Math.sin(time / 420 + enemy.patrolCenterX) * enemy.patrolRange * 0.4;
          enemy.sprite.x += enemy.patrolDir * enemy.patrolSpeed * dt;
          enemy.sprite.y += (bobY - enemy.sprite.y) * 4 * dt;
          const distFromCenter = enemy.sprite.x - enemy.patrolCenterX;
          if (Math.abs(distFromCenter) > enemy.patrolRange) enemy.patrolDir *= -1;
        } else {
          enemy.sprite.x += enemy.patrolDir * enemy.patrolSpeed * dt;
          const distFromCenter = enemy.sprite.x - enemy.patrolCenterX;
          if (Math.abs(distFromCenter) > enemy.patrolRange) {
            enemy.patrolDir *= -1;
          }
        }
      }
    }
  }

  private tryAttack() {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const attackRange = enemy.type === 'flyer' ? 62 : 52;
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y) > attackRange) continue;

      enemy.hp -= 1;
      // Visual damage flash: lighten fill as HP drops
      const dmgColors: Record<EnemyType, [number, number]> = {
        crawler: [0xfca5a5, 0xef4444],
        brute:   [0xf87171, 0x991b1b],
        flyer:   [0xfed7aa, 0xf97316]
      };
      const [woundColor, fullColor] = dmgColors[enemy.type];
      const remainRatio = enemy.hp / enemy.maxHp;
      enemy.sprite.setFillStyle(remainRatio < 0.5 ? woundColor : fullColor, 0.95);

      if (enemy.hp <= 0) {
        enemy.alive = false;
        enemy.sprite.destroy();
        this.enemiesCleared += 1;
        const label: Record<EnemyType, string> = { crawler: 'Crawler driven off.', brute: 'Heavy foe driven off!', flyer: 'Flyer grounded!' };
        this.showStatus(label[enemy.type], '#fecaca');
      } else {
        const hitLabel: Record<EnemyType, string> = { crawler: 'Hit!', brute: 'Hit — brute still standing.', flyer: 'Wing hit!' };
        this.showStatus(hitLabel[enemy.type], '#fee2e2');
      }
      return;
    }
    this.showStatus('No enemy in range.', '#cbd5e1');
  }

  private tryTriggerMidpointTurn() {
    if (this.midpointReached) return;
    if (this.hero.x < this.midpointX) return;

    this.midpointReached = true;
    this.returning = true;
    this.spawnReturnEnemies();
    this.showStatus('Midpoint reached. Return leg active — lower pockets open. Danger has increased.', '#fef3c7');
  }

  private trySpawnEgg() {
    if (!this.returning || this.eggFound || this.eggIcon) return;
    if (this.hero.x > this.homeStretchX) return;

    const x = this.homeStretchX - 24;
    const y = this.laneY + 92;
    this.eggIcon = this.add.circle(x, y, 10, 0xa855f7, 0.92).setDepth(8);
    this.add.circle(x, y, 24, 0xc084fc, 0.2).setDepth(7);
    this.showStatus('Creat Egg signal detected on final return stretch.', '#ddd6fe');
  }

  private tryCollectEgg() {
    if (!this.eggIcon || this.eggFound) return;
    if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.eggIcon.x, this.eggIcon.y) > 26) return;

    this.eggFound = true;
    this.eggIcon.destroy();
    this.eggIcon = undefined;

    gameRegistry.hasCreatEgg = true;
    gameRegistry.creatStage = 'egg';
    this.registry.set('hasCreatEgg', true);
    this.registry.set('creatStage', 'egg');

    this.showStatus('Creat Egg secured. Return to Sanctuary portal.', '#e9d5ff');
  }

  private tryReturnToSanctuary() {
    if (!this.returning) return;
    const atPortal = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, 96, this.laneY) < 40;
    if (!atPortal) return;

    this.add.circle(96, this.laneY, 26, 0x22d3ee, 0.18).setDepth(4);

    if (!this.keys.e?.isDown) return;

    const goldGain = this.materials * 2 + this.foods + this.waters;
    gameRegistry.setGold(gameRegistry.gold + goldGain);
    gameRegistry.setEmberFruit(gameRegistry.emberFruit + this.foods);

    if ((gameRegistry.homeBaseRestDays || 0) === 0 && (this.foods + this.waters + this.materials) > 0) {
      gameRegistry.setHomeBaseDay1SuppliesGathered(true);
    }

    this.registry.set('gold', gameRegistry.gold);
    this.registry.set('emberFruit', gameRegistry.emberFruit);

    this.scene.start('SanctuaryHomeBase');
  }

  private openInventory() {
    const container = document.getElementById('game');
    if (!container) return;

    const existing = container.querySelector('.inventory-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const items: InventoryItem[] = (this.registry.get('inventory') as InventoryItem[]) || [
      { id: 'travel-ration', name: 'Travel Ration', equipped: false },
      { id: 'field-bandage', name: 'Field Bandage', equipped: false },
    ];
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
    title.innerText = `${SANCTUARY_NAMESETS.regionCasual} Trail Routes`;
    Object.assign(title.style, { color: '#bfdbfe', fontWeight: 'bold', marginBottom: '10px' });
    root.appendChild(title);

    const spots: Array<{ label: string; scene: string }> = [
      { label: `${SANCTUARY_NAMESETS.regionCasual} Trail`, scene: 'SanctuaryTrail' },
      { label: `${SANCTUARY_NAMESETS.regionCasual} Overworld Walk`, scene: 'SanctuaryIsleOverworld' },
      { label: SANCTUARY_NAMESETS.townCasual, scene: 'SanctuaryTown' },
      { label: `${SANCTUARY_NAMESETS.regionCasual} Home Base`, scene: 'SanctuaryHomeBase' },
      { label: 'Haven Grounds', scene: 'HavenGrounds' }
    ];

    for (const spot of spots) {
      const btn = document.createElement('button');
      btn.innerText = spot.label;
      Object.assign(btn.style, {
        display: 'block',
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
      sceneLabel: 'Sanctuary Trail',
      scopeKey: 'sanctuary-trail',
      registry: this.registry,
    });
  }

  private showStatus(message: string, colorHex: string) {
    this.statusText.setText(message);
    this.statusText.setColor(colorHex);
  }
}
