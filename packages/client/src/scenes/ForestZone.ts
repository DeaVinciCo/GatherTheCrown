import Phaser from 'phaser';
import HeroSprite from '../actors/HeroSprite';
import { InventoryMenu, InventoryItem } from '../ui/InventoryMenu';
import { updateAchievementRegistryFlags } from '../progression/achievements';
import { getCreatSpecies, getCreatSpeciesByName } from '../systems/CreatSpecies';
import { routeToCreatInventory } from '../systems/CreatInventoryRouting';
import { getLootPool } from '../systems/GameplayDataTables';
import AudioManager from '../audio/AudioManager';
import { gainPrepXp } from '../systems/PrepProgression';
import { applyNeedsRewards, assessHeroCreatNeeds, type NeedsAssessment } from '../systems/HeroCreatNeedsTracker';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';
import { CircleGemQuadrantHUD } from '../ui/CircleGemQuadrantHUD';

type EnemyKind = 'venom-spider' | 'root-beast' | 'stone-sentinel' | 'sky-stinger';
type PickupKind = 'green-gem' | 'soulshard' | 'ember-fruit' | 'gold-cache';
type EncounterRole = 'crawling' | 'walking' | 'flying';

interface Enemy {
  kind: EnemyKind;
  label: string;
  role: EncounterRole;
  sprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Arc;
  hp: number;
  maxHp: number;
  hpBg: Phaser.GameObjects.Image;
  hpBar: Phaser.GameObjects.Image;
  speed: number;
  touchDamage: number;
  rewardGold: number;
  patrolPoints: Array<{ x: number; y: number }>;
  patrolIndex: number;
  isFinalSkirmisher?: boolean;
}

interface Pickup {
  kind: PickupKind;
  label: string;
  sprite: Phaser.GameObjects.Sprite;
  glow: Phaser.GameObjects.Arc;
  guideRing?: Phaser.GameObjects.Arc;
  amount: number;
}

interface HealingTree {
  sprite: Phaser.GameObjects.Sprite;
}

interface TraversalPocket {
  x: number;
  y: number;
  radius: number;
}

type TrialRouteId = 'gentle' | 'rider' | 'sovereign';

interface TrialRouteProfile {
  id: TrialRouteId;
  title: string;
  expectedMinutes: number;
  enemyPlan: Array<{ kind: EnemyKind; role: EncounterRole; x: number; y: number; patrolPoints: Array<{ x: number; y: number }>; isFinalSkirmisher?: boolean }>;
  pickupPlan: Array<{ kind: PickupKind; x: number; y: number; amount: number }>;
  ambience: string;
  rewardNote: string;
  pathWidth: 'wide' | 'standard' | 'tight';
  ambientHook: string;
  skyTint: number;
  skyAlpha: number;
  fogColor: number;
  fogCount: number;
  treeDensity: 'open' | 'balanced' | 'dense';
  enemySpacing: 'spread' | 'balanced' | 'packed';
}

export default class ForestZone extends Phaser.Scene {
  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'ForestZone', {
    onMap: () => this.openMapMenu(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu()
  });

  private hero!: HeroSprite;
  private travelPockets: TraversalPocket[] = [];
  private cameraZoom = 1.28;
  private readonly cameraZoomMin = 1.18;
  private readonly cameraZoomMax = 1.58;
  private readonly cameraOffsetX = -16;
  private readonly cameraOffsetY = 82;
  private creatSprite?: Phaser.GameObjects.Sprite;
  private creatBondText!: Phaser.GameObjects.Text;
  private bondGemRing!: Phaser.GameObjects.Graphics;
  private bondGemPercentText!: Phaser.GameObjects.Text;
  private bondGemLabelText!: Phaser.GameObjects.Text;
  private creatAttackCooldown = 0;
  private enemies: Enemy[] = [];
  private pickups: Pickup[] = [];
  private healingTrees: HealingTree[] = [];
  private healingGroveCenters: Array<{ x: number; y: number }> = [];
  private kills = 0;
  private runGold = 0;
  private soulshards = 0;
  private greenGems = 0;
  private heroHp = 100;
  private heroMaxHp = 100;
  private heroHpBar!: Phaser.GameObjects.Image;
  private killText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private heroHpText!: Phaser.GameObjects.Text;
  private shardText!: Phaser.GameObjects.Text;
  private gemText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private attackCooldown = 0;
  private attackEffect!: Phaser.GameObjects.Sprite;
  private trialGate!: Phaser.GameObjects.Sprite;
  private trialGateText!: Phaser.GameObjects.Text;
  private homeGate!: Phaser.GameObjects.Sprite;
  private homeGateText!: Phaser.GameObjects.Text;
  private hurtFlashTimer = 0;
  private groveHealTick = 0;
  private isTransitioning = false;
  private routeProfile!: TrialRouteProfile;
  private routeCleared = false;
  private mergeUnlocked = false;
  private fishCaughtThisRun = 0;
  private prepXpGained = 0;
  private runElapsedMs = 0;
  private prevHeroX = 0;
  private prevHeroY = 0;
  private runClockText!: Phaser.GameObjects.Text;
  private skyStateText!: Phaser.GameObjects.Text;
  private ambientText!: Phaser.GameObjects.Text;
  private prepSummaryText!: Phaser.GameObjects.Text;
  private circleGemHud?: CircleGemQuadrantHUD;
  private marqueeText?: Phaser.GameObjects.Text;
  private marqueeTween?: Phaser.Tweens.Tween;
  private hudFrameGraphics?: Phaser.GameObjects.Graphics;
  private skyOverlay!: Phaser.GameObjects.Rectangle;
  private fogParticles: Phaser.GameObjects.Arc[] = [];
  private waterSpots: Array<{ x: number; y: number; radius: number; label: Phaser.GameObjects.Text }> = [];
  private campSpots: Array<{ x: number; y: number; radius: number; used: boolean; label: Phaser.GameObjects.Text }> = [];
  private readonly forestLootPool = getLootPool('forest');
  private starterPrepAssessment?: NeedsAssessment;
  private starterPrepBonusClaimed = false;

  private isRouteTestHarnessMode() {
    return !!this.registry.get('routeTestHarnessMode');
  }

  // Forest Trials is an egg-discovery journey; companion presence starts after this route flow.
  private canUseCreatCompanionInTrials() {
    return false;
  }

  private ensureGameplayInputFocus() {
    const canvas = this.game.canvas as HTMLCanvasElement | null;
    if (canvas) {
      canvas.setAttribute('tabindex', '0');
      canvas.focus();
    }
    if (this.input.keyboard) {
      this.input.keyboard.enabled = true;
      this.input.keyboard.enableGlobalCapture();
      this.input.keyboard.resetKeys();
    }
  }

  constructor() {
    super();
  }

  private getRouteLaneY() {
    if (this.routeProfile.id === 'sovereign') return 312;
    if (this.routeProfile.id === 'rider') return 248;
    return 184;
  }

  private getRoutePathHalfWidth() {
    return this.routeProfile.pathWidth === 'wide'
      ? 118
      : this.routeProfile.pathWidth === 'tight'
        ? 86
        : 102;
  }

  private setCameraZoom(nextZoom: number) {
    const zoom = Phaser.Math.Clamp(nextZoom, this.cameraZoomMin, this.cameraZoomMax);
    this.cameraZoom = zoom;
    this.cameras.main.setZoom(zoom);
  }

  private setupTraversalPockets() {
    const laneY = this.getRouteLaneY();
    this.travelPockets = [
      { x: 214, y: 456, radius: 94 },
      { x: 90, y: 360, radius: 84 },
      { x: 700, y: 330, radius: 88 },
      { x: 332, y: laneY + 136, radius: 58 },
      { x: 540, y: laneY - 124, radius: 58 }
    ];
  }

  private clampHeroToTraversalLanes() {
    const width = this.scale.width;
    const height = this.scale.height;
    const laneY = this.getRouteLaneY();
    const laneHalfWidth = this.getRoutePathHalfWidth();
    const leftBound = 20;
    const rightBound = width - 20;
    const topBound = 40;
    const bottomBound = height - 40;

    const x = Phaser.Math.Clamp(this.hero.x, leftBound, rightBound);
    const y = Phaser.Math.Clamp(this.hero.y, topBound, bottomBound);

    const inMainPath = Math.abs(y - laneY) <= laneHalfWidth;
    let inPocket = false;
    let nearestPocket: TraversalPocket | null = null;
    let nearestPocketDist = Number.POSITIVE_INFINITY;

    for (const pocket of this.travelPockets) {
      const dist = Phaser.Math.Distance.Between(x, y, pocket.x, pocket.y);
      if (dist <= pocket.radius) {
        inPocket = true;
        break;
      }
      if (dist < nearestPocketDist) {
        nearestPocketDist = dist;
        nearestPocket = pocket;
      }
    }

    if (inMainPath || inPocket) {
      this.hero.x = x;
      this.hero.y = y;
      return;
    }

    const clampToMain = () => {
      this.hero.x = x;
      this.hero.y = Phaser.Math.Clamp(y, laneY - laneHalfWidth, laneY + laneHalfWidth);
    };

    if (!nearestPocket) {
      clampToMain();
      return;
    }

    const nearestMainY = Phaser.Math.Clamp(y, laneY - laneHalfWidth, laneY + laneHalfWidth);
    const distToMain = Math.abs(y - nearestMainY);
    const distToPocketEdge = Math.max(0, nearestPocketDist - nearestPocket.radius);

    if (distToMain <= distToPocketEdge) {
      clampToMain();
      return;
    }

    const angle = Phaser.Math.Angle.Between(nearestPocket.x, nearestPocket.y, x, y);
    this.hero.x = nearestPocket.x + Math.cos(angle) * nearestPocket.radius;
    this.hero.y = nearestPocket.y + Math.sin(angle) * nearestPocket.radius;
    this.hero.x = Phaser.Math.Clamp(this.hero.x, leftBound, rightBound);
    this.hero.y = Phaser.Math.Clamp(this.hero.y, topBound, bottomBound);
  }

  private updateCameraFraming(delta: number) {
    const camera = this.cameras.main;
    const nearEnemies = this.enemies.some((enemy) =>
      enemy.sprite.active && Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y) < 176
    );

    const nearPocket = this.travelPockets.some((pocket) =>
      Phaser.Math.Distance.Between(this.hero.x, this.hero.y, pocket.x, pocket.y) <= pocket.radius + 8
    );

    let targetZoom = this.cameraZoom;
    if (nearEnemies) {
      targetZoom = Math.min(this.cameraZoomMax, this.cameraZoom + 0.08);
    } else if (nearPocket) {
      targetZoom = Math.min(this.cameraZoomMax, this.cameraZoom + 0.03);
    }

    const lerpFactor = Math.min(1, delta / 220);
    camera.setZoom(Phaser.Math.Linear(camera.zoom, targetZoom, lerpFactor));
  }

  create() {
    this.ensureGameplayInputFocus();

    this.resetRunState();
    this.routeProfile = this.getTrialRouteProfile();
    this.starterPrepAssessment = assessHeroCreatNeeds(
      this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
      'starter'
    );
    AudioManager.attachScene(this);
    AudioManager.playAmbientLoop(this.routeProfile.id === 'sovereign' ? 'night' : 'day');

    const width = this.scale.width;
    const height = this.scale.height;

    this.skyOverlay = this.add.rectangle(width / 2, height / 2, width, height, this.routeProfile.skyTint, this.routeProfile.skyAlpha)
      .setDepth(0.5)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    for (let tileX = 0; tileX < width; tileX += 32) {
      for (let tileY = 32; tileY < height; tileY += 32) {
        this.add.image(tileX + 16, tileY + 16, 'grass').setDepth(0);
      }
    }

    this.paintRoads(width, height);
    this.decorateForest();
    this.applyRouteAtmosphere(width, height);
    this.spawnWaterBodies();
    this.spawnCampgrounds();
    this.setupTraversalPockets();

    const laneY = this.getRouteLaneY();

    this.trialGate = this.add.sprite(712, laneY, 'portal').setDepth(3).setVisible(true).setScale(1.6);
    this.tweens.add({ targets: this.trialGate, angle: 360, duration: 3000, repeat: -1 });
    this.trialGateText = this.add.text(712, laneY + 36, 'Fork Marker: Trial Routes', {
      color: '#fbbf24',
      fontSize: '11px'
    }).setOrigin(0.5).setDepth(4).setVisible(true);

    this.homeGate = this.add.sprite(96, laneY, 'portal').setDepth(3).setVisible(true).setScale(1.35).setTint(0x93c5fd);
    this.tweens.add({ targets: this.homeGate, angle: -360, duration: 3600, repeat: -1 });
    this.homeGateText = this.add.text(96, laneY + 46, 'Merged Trail: Sanctuary Isle', {
      color: '#93c5fd',
      fontSize: '11px'
    }).setOrigin(0.5).setDepth(4).setVisible(true);

    // Spawn multiple healing grove clusters
    this.spawnHealingGrove(214, 456);  // Center grove
    this.spawnHealingGrove(90, 360);   // Left grove
    this.spawnHealingGrove(700, 330);  // Right grove

    for (const enemy of this.routeProfile.enemyPlan) {
      this.spawnEnemy(enemy.kind, enemy.x, enemy.y, enemy.patrolPoints, enemy.isFinalSkirmisher);
    }

    for (const pickup of this.routeProfile.pickupPlan) {
      this.spawnPickup(pickup.kind, pickup.x, pickup.y, pickup.amount);
    }

    this.drawRouteForkSignage();

    this.hero = new HeroSprite(this, 112, laneY + 6);
    this.hero.setDepth(6).setScale(1.42);
    this.prevHeroX = this.hero.x;
    this.prevHeroY = this.hero.y;

    const camera = this.cameras.main;
    camera.setBounds(0, 0, width, height);
    this.setCameraZoom(1.28);
    camera.startFollow(this.hero, true, 0.12, 0.12, this.cameraOffsetX, this.cameraOffsetY);
    camera.roundPixels = true;

    // ── CREAT COMPANION (only after hatch) ───────────────────────────────
    const hasHatchedCreat = !!this.registry.get('hasHatchedCreat') && this.canUseCreatCompanionInTrials();
    if (hasHatchedCreat) {
      const element = ((this.registry.get('creatElement') as string) || (this.registry.get('heroElement') as string) || 'Fire') as string;
      const creatKey = `creat-${element.toLowerCase()}`;
      this.creatSprite = this.add.sprite(this.hero.x - 44, this.hero.y + 20, creatKey).setDepth(6).setScale(1.56);
      this.tweens.add({ targets: this.creatSprite, y: this.creatSprite.y - 4, yoyo: true, repeat: -1, duration: 760 });
      const selectedSpecies = (this.registry.get('creatSpecies') as string) || '';
      const creatSpecies = selectedSpecies ? getCreatSpeciesByName(element, selectedSpecies) : getCreatSpecies(element);
      const creatLabel = this.add.text(this.creatSprite.x, this.creatSprite.y - 28, creatSpecies.species, {
        color: '#f0abfc', fontSize: '11px', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(7);
      // store ref so update() can move it
      (this as any)._creatLabel = creatLabel;
      (this as any)._creatName = creatSpecies.species;
    }

    this.attackEffect = this.add.sprite(0, 0, 'slash').setDepth(8).setVisible(false).setScale(1.2);

    this.buildHud(width, height);
    this.drawStarterPrepBanner();
    this.add.text(width / 2, height - 8, 'M=Map  I=Inventory  Shift=Chat  Wheel=Zoom  [ ]=Cam +/-', {
      color: '#64748b',
      fontSize: '10px'
    }).setOrigin(0.5, 1).setDepth(14).setScrollFactor(0);

    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    this.input.keyboard?.on('keydown-SPACE', () => this.doAttack());
    this.input.keyboard?.on('keydown-F', () => this.tryFishing());
    this.input.keyboard?.on('keydown-E', () => this.tryCampInteraction());
    this.input.keyboard?.on('keydown-OPEN_BRACKET', () => this.setCameraZoom(this.cameraZoom - 0.05));
    this.input.keyboard?.on('keydown-CLOSED_BRACKET', () => this.setCameraZoom(this.cameraZoom + 0.05));
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.isRouteTestHarnessMode()) {
        this.scene.start('RouteTestHarness');
      }
    });
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
      const step = deltaY > 0 ? -0.035 : 0.035;
      this.setCameraZoom(this.cameraZoom + step);
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.ensureGameplayInputFocus();

      const worldX = pointer.worldX;
      const worldY = pointer.worldY;

      if (Phaser.Math.Distance.Between(worldX, worldY, this.homeGate.x, this.homeGate.y) < 44) {
        if (this.mergeUnlocked) {
          this.exitToHomeBase();
        }
        return;
      }
      for (const water of this.waterSpots) {
        if (Phaser.Math.Distance.Between(worldX, worldY, water.x, water.y) <= water.radius + 18) {
          this.tryFishing();
          return;
        }
      }
      this.doAttack();
    });

    this.showMessage('Camera V2 active: closer view + side-pocket exploration enabled.', '#7dd3fc');
  }

  private resetRunState() {
    for (const fog of this.fogParticles) fog.destroy();
    this.fogParticles = [];
    this.enemies = [];
    this.pickups = [];
    this.healingTrees = [];
    this.kills = 0;
    this.runGold = 0;
    this.fishCaughtThisRun = 0;
    this.prepXpGained = 0;
    this.soulshards = 0;
    this.greenGems = 0;
    this.heroHp = this.heroMaxHp;
    this.attackCooldown = 0;
    this.creatAttackCooldown = 0;
    this.hurtFlashTimer = 0;
    this.groveHealTick = 0;
    this.isTransitioning = false;
    this.mergeUnlocked = false;
  }

  private paintRoads(width: number, height: number) {
    const laneRadius = this.routeProfile.pathWidth === 'wide'
      ? 2
      : this.routeProfile.pathWidth === 'tight'
        ? 1
        : 1.5;

    const drawHorizontalRoad = (y: number, startX: number, endX: number) => {
      for (let tileX = startX; tileX < endX; tileX += 32) {
        for (let lane = -Math.floor(laneRadius); lane <= Math.floor(laneRadius); lane += 1) {
          this.add.image(tileX + 16, y + lane * 32, 'road').setDepth(1);
        }
        if (laneRadius >= 1.5) {
          this.add.image(tileX + 16, y - (Math.floor(laneRadius) + 1) * 32, 'road').setDepth(1).setAlpha(0.45);
          this.add.image(tileX + 16, y + (Math.floor(laneRadius) + 1) * 32, 'road').setDepth(1).setAlpha(0.45);
        }
      }
    };

    const drawVerticalRoad = (x: number, startY: number, endY: number) => {
      for (let tileY = startY; tileY < endY; tileY += 32) {
        for (let lane = -Math.floor(laneRadius); lane <= Math.floor(laneRadius); lane += 1) {
          this.add.image(x + lane * 32, tileY + 16, 'road').setDepth(1);
        }
        if (laneRadius >= 1.5) {
          this.add.image(x - (Math.floor(laneRadius) + 1) * 32, tileY + 16, 'road').setDepth(1).setAlpha(0.45);
          this.add.image(x + (Math.floor(laneRadius) + 1) * 32, tileY + 16, 'road').setDepth(1).setAlpha(0.45);
        }
      }
    };

    const laneY = this.getRouteLaneY();
    drawHorizontalRoad(laneY, 64, width - 32);
    drawVerticalRoad(704, Math.min(120, laneY), Math.max(120, laneY));
    drawVerticalRoad(96, Math.min(120, laneY), Math.max(120, laneY));

    for (let dustX = 84; dustX < width - 60; dustX += 56) {
      const northOffset = Phaser.Math.Between(54, 76);
      const southOffset = Phaser.Math.Between(54, 76);
      this.add.circle(dustX, laneY - northOffset, Phaser.Math.Between(4, 7), 0x1f2937, 0.18).setDepth(1.35);
      this.add.circle(dustX + Phaser.Math.Between(-12, 12), laneY + southOffset, Phaser.Math.Between(4, 7), 0x374151, 0.16).setDepth(1.35);
    }

    this.add.text(714, laneY - 30, 'Fork of Trials', { color: '#fde68a', fontSize: '10px' }).setOrigin(0.5).setDepth(4);
    this.add.text(96, laneY - 30, 'Merged Exit', { color: '#93c5fd', fontSize: '10px' }).setOrigin(0.5).setDepth(4);
  }

  private applyRouteAtmosphere(width: number, height: number) {
    this.registry.set('forestRouteAmbientHook', this.routeProfile.ambientHook);

    const fogDrift = this.routeProfile.id === 'sovereign' ? 20 : this.routeProfile.id === 'rider' ? 16 : 10;
    for (let i = 0; i < this.routeProfile.fogCount; i += 1) {
      const fog = this.add.circle(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(64, height - 20),
        Phaser.Math.Between(24, 54),
        this.routeProfile.fogColor,
        this.routeProfile.id === 'sovereign' ? 0.068 : this.routeProfile.id === 'rider' ? 0.065 : 0.04
      ).setDepth(2);
      this.tweens.add({
        targets: fog,
        x: fog.x + Phaser.Math.Between(-fogDrift, fogDrift),
        y: fog.y + Phaser.Math.Between(-fogDrift, fogDrift),
        alpha: Phaser.Math.FloatBetween(0.02, 0.14),
        duration: Phaser.Math.Between(3200, 7600),
        yoyo: true,
        repeat: -1
      });
      this.fogParticles.push(fog);
    }
  }

  private drawRouteForkSignage() {
    const markers: Array<{ x: number; y: number; id: TrialRouteId; label: string; color: string }> = [
      { x: 620, y: 188, id: 'gentle', label: 'Gentle', color: '#86efac' },
      { x: 704, y: 220, id: 'rider', label: 'Rider', color: '#93c5fd' },
      { x: 620, y: 256, id: 'sovereign', label: 'Sovereign', color: '#d8b4fe' }
    ];

    this.add.text(700, 164, 'Fork Ahead', {
      color: '#fde68a',
      fontSize: '10px',
      fontStyle: 'bold'
    }).setDepth(4).setOrigin(0.5);

    for (const marker of markers) {
      const isSelected = marker.id === this.routeProfile.id;
      this.add.text(marker.x, marker.y, `${isSelected ? '▶' : '•'} ${marker.label} Route`, {
        color: marker.color,
        fontSize: isSelected ? '10px' : '9px',
        fontStyle: isSelected ? 'bold' : 'normal'
      }).setDepth(4).setAlpha(isSelected ? 1 : 0.6);
    }

    this.add.text(132, 184, 'Merged Trail -> Sanctuary Isle', {
      color: '#93c5fd',
      fontSize: '9px',
      fontStyle: 'bold'
    }).setDepth(4).setOrigin(0, 0.5);

    this.add.text(136, 204, 'Quick Stop: use the healing groves, then pick a first path.', {
      color: '#bbf7d0',
      fontSize: '9px'
    }).setDepth(4).setOrigin(0, 0.5);
  }

  private drawStarterPrepBanner() {
    if (!this.starterPrepAssessment) return;

    const missing = this.starterPrepAssessment.missingCritical;
    const prepColor = missing.length === 0 ? '#86efac' : '#fde68a';
    const prepText = missing.length === 0
      ? `Quick Prep: ready (${this.starterPrepAssessment.readinessScore}%). Use the healing grove, then enter a route.`
      : `Quick Prep: ${this.starterPrepAssessment.readinessScore}% ready. Small stop recommended: ${missing.map((item) => item.label).join(', ')}.`;

    this.prepSummaryText = this.add.text(this.scale.width / 2, 54, prepText, {
      color: prepColor,
      fontSize: '11px',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 680 }
    }).setOrigin(0.5).setDepth(12).setScrollFactor(0);
  }

  private getTrialRouteProfile(): TrialRouteProfile {
    const selected = ((this.registry.get('forestTrialRouteId') as string)
      || (this.registry.get('forestTrialDifficulty') as string)
      || 'gentle').toLowerCase();

    if (selected.includes('sovereign')) {
      return {
        id: 'sovereign',
        title: 'Sovereign Thicket',
        expectedMinutes: 20,
        ambience: 'Dense and enclosed with higher pressure, still readable.',
        rewardNote: 'Dangerous route: tighter enemy pressure, rarer high-value rewards.',
        pathWidth: 'tight',
        ambientHook: 'forest.sovereign.tension',
        skyTint: 0x312e81,
        skyAlpha: 0.09,
        fogColor: 0x312e81,
        fogCount: 12,
        treeDensity: 'dense',
        enemySpacing: 'packed',
        enemyPlan: [
          { kind: 'venom-spider', role: 'crawling', x: 650, y: 308, patrolPoints: [{ x: 622, y: 292 }, { x: 682, y: 324 }] },
          { kind: 'venom-spider', role: 'crawling', x: 582, y: 312, patrolPoints: [{ x: 552, y: 294 }, { x: 614, y: 326 }] },
          { kind: 'root-beast', role: 'walking', x: 520, y: 316, patrolPoints: [{ x: 486, y: 298 }, { x: 556, y: 334 }] },
          { kind: 'root-beast', role: 'walking', x: 450, y: 308, patrolPoints: [{ x: 420, y: 292 }, { x: 482, y: 326 }] },
          { kind: 'sky-stinger', role: 'flying', x: 392, y: 286, patrolPoints: [{ x: 360, y: 266 }, { x: 430, y: 304 }] },
          { kind: 'sky-stinger', role: 'flying', x: 328, y: 338, patrolPoints: [{ x: 298, y: 318 }, { x: 364, y: 354 }] },
          { kind: 'stone-sentinel', role: 'walking', x: 266, y: 312, patrolPoints: [{ x: 236, y: 292 }, { x: 298, y: 328 }], isFinalSkirmisher: true },
          { kind: 'stone-sentinel', role: 'walking', x: 206, y: 306, patrolPoints: [{ x: 176, y: 288 }, { x: 238, y: 324 }] }
        ],
        pickupPlan: [
          { kind: 'green-gem', x: 618, y: 278, amount: 2 },
          { kind: 'soulshard', x: 548, y: 348, amount: 3 },
          { kind: 'ember-fruit', x: 470, y: 274, amount: 1 },
          { kind: 'ember-fruit', x: 358, y: 350, amount: 1 },
          { kind: 'gold-cache', x: 286, y: 278, amount: 12 },
          { kind: 'gold-cache', x: 220, y: 346, amount: 10 }
        ]
      };
    }

    if (selected.includes('rider')) {
      return {
        id: 'rider',
        title: 'Rider\'s Path',
        expectedMinutes: 14,
        ambience: 'Balanced terrain, moderate pressure, steady adventure rhythm.',
        rewardNote: 'Standard route: balanced combat, gathering, and rewards.',
        pathWidth: 'standard',
        ambientHook: 'forest.rider.adventure',
        skyTint: 0x1d4ed8,
        skyAlpha: 0.06,
        fogColor: 0x0f766e,
        fogCount: 7,
        treeDensity: 'balanced',
        enemySpacing: 'balanced',
        enemyPlan: [
          { kind: 'venom-spider', role: 'crawling', x: 640, y: 246, patrolPoints: [{ x: 610, y: 232 }, { x: 670, y: 264 }] },
          { kind: 'venom-spider', role: 'crawling', x: 548, y: 250, patrolPoints: [{ x: 518, y: 234 }, { x: 580, y: 266 }] },
          { kind: 'root-beast', role: 'walking', x: 452, y: 252, patrolPoints: [{ x: 420, y: 236 }, { x: 486, y: 268 }] },
          { kind: 'root-beast', role: 'walking', x: 358, y: 246, patrolPoints: [{ x: 328, y: 228 }, { x: 392, y: 264 }] },
          { kind: 'sky-stinger', role: 'flying', x: 286, y: 226, patrolPoints: [{ x: 256, y: 208 }, { x: 320, y: 246 }] },
          { kind: 'stone-sentinel', role: 'walking', x: 212, y: 250, patrolPoints: [{ x: 182, y: 232 }, { x: 246, y: 266 }], isFinalSkirmisher: true }
        ],
        pickupPlan: [
          { kind: 'green-gem', x: 610, y: 216, amount: 1 },
          { kind: 'soulshard', x: 520, y: 284, amount: 2 },
          { kind: 'ember-fruit', x: 430, y: 214, amount: 2 },
          { kind: 'ember-fruit', x: 320, y: 286, amount: 1 },
          { kind: 'gold-cache', x: 256, y: 214, amount: 10 },
          { kind: 'gold-cache', x: 188, y: 286, amount: 8 }
        ]
      };
    }

    return {
      id: 'gentle',
      title: 'Gentle Trail',
      expectedMinutes: 9,
      ambience: 'Open trail, calmer pacing, low-pressure combat rhythm.',
      rewardNote: 'Safer route: more food/support pickups, fewer enemy spikes.',
      pathWidth: 'wide',
      ambientHook: 'forest.gentle.calm',
      skyTint: 0x0f766e,
      skyAlpha: 0.045,
      fogColor: 0x6ee7b7,
      fogCount: 4,
      treeDensity: 'open',
      enemySpacing: 'spread',
      enemyPlan: [
        { kind: 'venom-spider', role: 'crawling', x: 614, y: 182, patrolPoints: [{ x: 586, y: 166 }, { x: 646, y: 198 }] },
        { kind: 'venom-spider', role: 'crawling', x: 486, y: 186, patrolPoints: [{ x: 456, y: 168 }, { x: 520, y: 204 }] },
        { kind: 'root-beast', role: 'walking', x: 364, y: 180, patrolPoints: [{ x: 332, y: 164 }, { x: 398, y: 198 }] },
        { kind: 'sky-stinger', role: 'flying', x: 276, y: 162, patrolPoints: [{ x: 246, y: 144 }, { x: 312, y: 182 }] },
        { kind: 'stone-sentinel', role: 'walking', x: 194, y: 184, patrolPoints: [{ x: 166, y: 168 }, { x: 228, y: 200 }], isFinalSkirmisher: true }
      ],
      pickupPlan: [
        { kind: 'green-gem', x: 584, y: 154, amount: 1 },
        { kind: 'soulshard', x: 452, y: 216, amount: 1 },
        { kind: 'ember-fruit', x: 332, y: 150, amount: 2 },
        { kind: 'ember-fruit', x: 242, y: 222, amount: 2 },
        { kind: 'gold-cache', x: 286, y: 218, amount: 8 },
        { kind: 'gold-cache', x: 194, y: 150, amount: 6 }
      ]
    };
  }

  private formatTrialClock(minutes: number): string {
    const safe = Math.max(0, Math.min(23 * 60 + 59, Math.floor(minutes)));
    const hour24 = Math.floor(safe / 60);
    const minute = safe % 60;
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
  }

  private getSkyLabel(minutes: number): string {
    if (minutes < 6 * 60) return 'Pre-Dawn';
    if (minutes < 10 * 60) return 'Morning';
    if (minutes < 15 * 60) return 'Daylight';
    if (minutes < 18 * 60 + 30) return 'Late Day';
    if (minutes < 20 * 60 + 30) return 'Dusk';
    return 'Nightfall';
  }

  private updateTrialTimeAndSky(delta: number) {
    this.runElapsedMs += delta;

    const durationMs = this.routeProfile.expectedMinutes * 60 * 1000;
    const progress = Math.min(1, this.runElapsedMs / Math.max(1, durationMs));

    // Keep trial time progression subtle: at most +2.5h during the full route.
    const trialMinutes = 14 * 60 + progress * 150;
    const skyLabel = this.getSkyLabel(trialMinutes);

    this.runClockText.setText(`Route Clock: ${this.formatTrialClock(trialMinutes)}  (${this.routeProfile.expectedMinutes}m route)`);
    this.skyStateText.setText(`Sky: ${skyLabel} · steady progression (no rapid day/night flips)`);
    this.ambientText.setText(`Ambient Hook: ${this.routeProfile.ambientHook}`);

    // Gentle tint shift as route progresses.
    const duskFactor = Phaser.Math.Clamp((trialMinutes - 16 * 60) / 240, 0, 1);
    this.skyOverlay.setFillStyle(this.routeProfile.skyTint, this.routeProfile.skyAlpha + duskFactor * 0.08);
  }

  private decorateForest() {
    const baseTreePositions = [
      [44, 78], [104, 88], [182, 78], [276, 86], [344, 82], [472, 84], [552, 74], [640, 72], [744, 92],
      [42, 238], [740, 238], [50, 334], [744, 348], [60, 490], [172, 548], [500, 546], [716, 528]
    ];

    const routeExtras = this.routeProfile.treeDensity === 'dense'
      ? [[130, 140], [220, 124], [300, 136], [520, 152], [604, 144], [688, 160], [254, 502], [362, 520], [608, 508], [700, 468]]
      : this.routeProfile.treeDensity === 'balanced'
        ? [[220, 124], [520, 152], [362, 520], [608, 508]]
        : [[130, 140], [688, 160]];

    const combined = [...baseTreePositions, ...routeExtras] as Array<[number, number]>;
    const filtered = this.routeProfile.treeDensity === 'open'
      ? combined.filter((_, idx) => idx % 3 !== 0)
      : combined;

    for (const [treeX, treeY] of filtered) {
      this.add.image(treeX, treeY, 'tree').setDepth(2);
    }

    const trailColor = this.routeProfile.id === 'sovereign' ? '#c4b5fd' : this.routeProfile.id === 'rider' ? '#93c5fd' : '#a7f3d0';
    this.add.text(88, 150, 'Old Trail', { color: trailColor, fontSize: '10px' }).setDepth(3);
    this.add.text(430, 404, 'Moss Road', { color: trailColor, fontSize: '10px' }).setDepth(3);
  }

  private spawnWaterBodies() {
    const laneY = this.getRouteLaneY();
    const bodySpecs = [
      { x: 590, y: laneY + 52, radius: 34 },
      { x: 392, y: laneY - 54, radius: 30 },
      { x: 214, y: laneY + 48, radius: 34 }
    ];

    for (const spec of bodySpecs) {
      this.add.circle(spec.x, spec.y, spec.radius + 8, 0x0f172a, 0.28).setDepth(1.4);
      this.add.circle(spec.x, spec.y, spec.radius, 0x0ea5e9, 0.2).setDepth(1.5);
      const label = this.add.text(spec.x, spec.y + spec.radius + 10, 'Water Edge • F to Fish', {
        color: '#7dd3fc',
        fontSize: '9px'
      }).setOrigin(0.5).setDepth(4).setAlpha(0.55);
      this.waterSpots.push({ x: spec.x, y: spec.y, radius: spec.radius, label });
    }
  }

  private spawnCampgrounds() {
    const laneY = this.getRouteLaneY();
    const camps = [
      { x: 488, y: laneY + 72, radius: 32, name: 'Trailside Camp' },
      { x: 286, y: laneY - 68, radius: 30, name: 'Watch Camp' }
    ];

    for (const camp of camps) {
      this.add.circle(camp.x, camp.y, camp.radius + 5, 0x1f2937, 0.45).setDepth(2.2);
      this.add.circle(camp.x, camp.y, 7, 0xf97316, 0.55).setDepth(3.4);
      const spark = this.add.circle(camp.x, camp.y - 10, 4, 0xfb923c, 0.45).setDepth(3.4);
      this.tweens.add({ targets: spark, y: spark.y - 6, alpha: 0.12, yoyo: true, repeat: -1, duration: 1200 });
      const label = this.add.text(camp.x, camp.y + camp.radius + 8, `${camp.name} • E to Prepare`, {
        color: '#fcd34d',
        fontSize: '9px'
      }).setOrigin(0.5).setDepth(4).setAlpha(0.62);
      this.campSpots.push({ x: camp.x, y: camp.y, radius: camp.radius, used: false, label });
    }
  }

  private getRouteBalance() {
    if (this.routeProfile.id === 'sovereign') {
      return {
        hpMult: 1.12,
        damageMult: 1.06,
        dropQtyMult: 1.36,
        finalSkirmisherHpMult: 1.34,
        finalSkirmisherRewardMult: 1.58,
        campHeal: 12,
        fishGoldPerFish: 4,
        fishPrepXp: 7,
        campPrepXp: 11
      };
    }

    if (this.routeProfile.id === 'rider') {
      return {
        hpMult: 1,
        damageMult: 0.94,
        dropQtyMult: 1.16,
        finalSkirmisherHpMult: 1.28,
        finalSkirmisherRewardMult: 1.34,
        campHeal: 14,
        fishGoldPerFish: 3,
        fishPrepXp: 6,
        campPrepXp: 10
      };
    }

    return {
      hpMult: 0.95,
      damageMult: 0.92,
      dropQtyMult: 1,
      finalSkirmisherHpMult: 1.18,
      finalSkirmisherRewardMult: 1.2,
      campHeal: 16,
      fishGoldPerFish: 2,
      fishPrepXp: 5,
      campPrepXp: 8
    };
  }

  private tryFishing() {
    const nearWater = this.waterSpots.find((spot) => Phaser.Math.Distance.Between(this.hero.x, this.hero.y, spot.x, spot.y) <= spot.radius + 20);
    if (!nearWater) {
      AudioManager.playFishing('cast');
      this.promptText.setText('No water nearby. Find a river, pool, or lakeside edge to fish.');
      return;
    }

    const balance = this.getRouteBalance();
    const fishQty = Phaser.Math.Between(1, this.routeProfile.id === 'gentle' ? 3 : 2);
    const waterQty = Phaser.Math.Between(1, 2);
    this.fishCaughtThisRun += fishQty;
    this.prepXpGained += balance.fishPrepXp;
    const prep = gainPrepXp(this.registry, balance.fishPrepXp, `forest:${this.routeProfile.id}:fish`);
    this.registry.set('gold', (this.registry.get('gold') as number || 0) + fishQty * balance.fishGoldPerFish);
    this.runGold += fishQty * balance.fishGoldPerFish;
    this.goldText.setText(`Gold: ${this.runGold}`);
    AudioManager.playFishing('catch');
    this.promptText.setText(`Fishing success: +${fishQty} River Fish, +${waterQty} Clean Water, +${balance.fishPrepXp} Prep XP (Prep Lv.${prep.level}).`);
    this.showMessage(`Caught fish and fresh water at the trail edge.`, '#7dd3fc');
  }

  private tryCampInteraction() {
    const nearCamp = this.campSpots.find((spot) => Phaser.Math.Distance.Between(this.hero.x, this.hero.y, spot.x, spot.y) <= spot.radius + 18);
    if (!nearCamp) {
      this.promptText.setText('No campsite nearby. Look for flat ground or cave-mouth camp pockets.');
      return;
    }
    if (nearCamp.used) {
      this.promptText.setText('This campsite was already prepared. Continue your trek toward the merge trail.');
      return;
    }

    nearCamp.used = true;
    nearCamp.label.setText('Camp Prepared ✓').setColor('#86efac').setAlpha(0.9);
    const balance = this.getRouteBalance();
    this.heroHp = Math.min(this.heroMaxHp, this.heroHp + balance.campHeal);
    this.updateHeroHp();
    this.prepXpGained += balance.campPrepXp;
    const prep = gainPrepXp(this.registry, balance.campPrepXp, `forest:${this.routeProfile.id}:camp`);

    if (!this.starterPrepBonusClaimed && this.starterPrepAssessment) {
      const reward = applyNeedsRewards(
        this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
        this.starterPrepAssessment,
        `forest_starter_${this.routeProfile.id}`
      );
      if (reward.granted) {
        this.starterPrepBonusClaimed = true;
        this.showMessage(`Quick Prep bonus: +${reward.prepXpGained} Prep XP, +${reward.goldGained} Gold.`, '#a7f3d0');
      }
    }

    this.promptText.setText(`Camp prepared: gear checked, fire tended, +${balance.campPrepXp} Prep XP (Prep Lv.${prep.level}).`);
    this.showMessage('Camp actions complete: rest, prep, and route notes updated.', '#fcd34d');
  }

  private buildHud(width: number, height: number) {
    this.add.rectangle(width / 2, 18, width, 36, 0x000000, 0.68).setDepth(10).setScrollFactor(0);
    this.add.text(10, 6, `${this.routeProfile.title} | ${this.routeProfile.ambience}`, {
      color: '#86efac',
      fontSize: '12px'
    }).setDepth(11).setScrollFactor(0);

    this.add.text(10, 22, this.routeProfile.rewardNote, {
      color: '#93c5fd',
      fontSize: '10px'
    }).setDepth(11).setScrollFactor(0);

    this.runClockText = this.add.text(width - 10, 6, '', {
      color: '#f8fafc',
      fontSize: '10px'
    }).setOrigin(1, 0).setDepth(11).setScrollFactor(0);

    this.skyStateText = this.add.text(width - 10, 20, '', {
      color: '#cbd5e1',
      fontSize: '10px'
    }).setOrigin(1, 0).setDepth(11).setScrollFactor(0);

    this.ambientText = this.add.text(width - 10, 34, `Ambient Hook: ${this.routeProfile.ambientHook}`, {
      color: '#94a3b8',
      fontSize: '9px'
    }).setOrigin(1, 0).setDepth(11).setScrollFactor(0);

    this.prepSummaryText = this.add.text(width / 2, 54, '', {
      color: '#bbf7d0',
      fontSize: '11px',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(11).setScrollFactor(0);

    this.add.image(width - 165, 18, 'hpbg').setDepth(10).setDisplaySize(100, 10).setScrollFactor(0);
    this.heroHpBar = this.add.image(width - 215, 18, 'hpfill').setDepth(11).setDisplaySize(100, 10).setOrigin(0, 0.5).setScrollFactor(0);
    this.heroHpText = this.add.text(width - 215, 6, 'HP 100/100', { color: '#f87171', fontSize: '12px' }).setDepth(11).setScrollFactor(0);

    this.killText = this.add.text(10, height - 56, `Foes Cleared: 0 / ${this.enemies.length}`, { color: '#fde68a', fontSize: '13px' }).setDepth(11).setScrollFactor(0);
    this.goldText = this.add.text(10, height - 40, 'Gold: 0', { color: '#fbbf24', fontSize: '13px' }).setDepth(11).setScrollFactor(0);
    this.shardText = this.add.text(134, height - 40, 'Soulshards: 0', { color: '#d8b4fe', fontSize: '13px' }).setDepth(11).setScrollFactor(0);
    this.gemText = this.add.text(300, height - 40, 'Green Gems: 0', { color: '#86efac', fontSize: '13px' }).setDepth(11).setScrollFactor(0);
    const hasHatchedCreat = !!this.registry.get('hasHatchedCreat') && this.canUseCreatCompanionInTrials();
    const bond = this.registry.get('creatBond') || 0;
    const creatEl = (this.registry.get('creatElement') as string) || '';
    const selectedSpecies = (this.registry.get('creatSpecies') as string) || '';
    const creatSpeciesLabel = creatEl
      ? (selectedSpecies ? getCreatSpeciesByName(creatEl, selectedSpecies).species : getCreatSpecies(creatEl).species)
      : 'Creat';
    const bondText = hasHatchedCreat ? `${creatSpeciesLabel} Bond: ${bond}%` : 'Creat Bond: -- (egg not hatched)';
    this.creatBondText = this.add.text(10, height - 24, bondText, { color: '#f0abfc', fontSize: '13px' }).setDepth(11).setScrollFactor(0);
    this.promptText = this.add.text(width - 10, height - 24, 'Hold your route rhythm: gather, fight, then merge toward Sanctuary Isle.', { color: '#93c5fd', fontSize: '11px' }).setOrigin(1, 0).setDepth(11).setScrollFactor(0);

    // Circular bond tracker gem near top HUD (requested alongside bars/menu hints)
    const gemX = width - 46;
    const gemY = 18;
    this.add.circle(gemX, gemY, 15, 0x2e1065, 0.92).setDepth(12).setStrokeStyle(2, 0xa855f7, 0.95).setScrollFactor(0);
    this.bondGemRing = this.add.graphics().setDepth(13).setScrollFactor(0);
    this.bondGemPercentText = this.add.text(gemX, gemY - 1, '--', {
      color: '#f5d0fe', fontSize: '9px', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(14).setScrollFactor(0);
    this.bondGemLabelText = this.add.text(gemX, gemY + 16, 'BOND', {
      color: '#c084fc', fontSize: '8px', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(14).setScrollFactor(0);
    this.updateBondGemHud((this.registry.get('creatBond') as number) || 0, hasHatchedCreat);

    // CircleGem 4-quadrant HUD: curved labels + ring bars + values in each quadrant.
    this.circleGemHud = new CircleGemQuadrantHUD(this, 120, height - 108);
    this.refreshCircleGemHud();

    this.hudFrameGraphics = this.add.graphics().setDepth(41).setScrollFactor(0);
    this.hudFrameGraphics.lineStyle(2, 0xd4af37, 0.95);
    this.hudFrameGraphics.strokeRect(4, 4, width - 8, height - 8);

    this.marqueeText = this.add.text(width * 0.52, height - 18,
      'ANNOUNCEMENT: CROWN FORGE STABILIZED | RANK UPDATE PENDING | ACHIEVEMENT FEED ACTIVE', {
      color: '#fef3c7',
      fontSize: '11px',
      backgroundColor: '#111827'
    }).setScrollFactor(0).setDepth(42).setPadding(8, 3);

    this.startAnnouncementMarquee();
  }

  private startAnnouncementMarquee() {
    if (!this.marqueeText) return;
    this.marqueeTween?.stop();
    const startX = this.scale.width + 260;
    const endX = this.scale.width * 0.52;
    this.marqueeText.x = startX;
    this.marqueeTween = this.tweens.add({
      targets: this.marqueeText,
      x: endX,
      duration: 12000,
      ease: 'Linear',
      repeat: -1,
      yoyo: false,
      onRepeat: () => {
        if (!this.marqueeText) return;
        this.marqueeText.x = startX;
      }
    });
  }

  private refreshCircleGemHud() {
    if (!this.circleGemHud) return;

    const stamina = Phaser.Math.Clamp(Number(this.registry.get('heroEnergy') || 100), 0, 100);
    const heroBoost = Phaser.Math.Clamp(100 - (this.attackCooldown / 1200) * 100, 0, 100);
    const heroPct = Phaser.Math.Clamp(this.heroHp / Math.max(1, this.heroMaxHp), 0, 1);

    const mana = Phaser.Math.Clamp(Number(this.registry.get('mana') || this.registry.get('heroMana') || 100), 0, 100);
    const potions = Math.max(0, Number(this.registry.get('potionCount') || 0));
    const potionsCap = 5;
    const manaPct = mana / 100;

    const hasHatchedCreat = !!this.registry.get('hasHatchedCreat') && this.canUseCreatCompanionInTrials();
    const creatBond = Phaser.Math.Clamp(Number(this.registry.get('creatBond') || 0), 0, 100);
    const creatHp = hasHatchedCreat ? Phaser.Math.Clamp(Number(this.registry.get('creatHp') || 100), 0, 100) : 0;
    const creatStam = hasHatchedCreat ? Phaser.Math.Clamp(Number(this.registry.get('creatStamina') || 100), 0, 100) : 0;
    const creatFood = hasHatchedCreat ? Phaser.Math.Clamp(Number(this.registry.get('creatHunger') || 100), 0, 100) : 0;
    const creatHappy = hasHatchedCreat ? Phaser.Math.Clamp(Number(this.registry.get('creatHappiness') || creatFood), 0, 100) : 0;
    const creatMix = hasHatchedCreat ? (creatHp + creatStam + creatHappy) / 300 : 0;

    const aliveCount = this.enemies.filter((enemy) => enemy.sprite.active).length;
    const totalEncounters = Math.max(1, this.kills + aliveCount);
    const cooldownReady = Phaser.Math.Clamp(100 - (this.attackCooldown / 1200) * 100, 0, 100);
    const combatPct = cooldownReady / 100;

    this.circleGemHud.setStats({
      heroPct,
      heroLabel: `HP ${this.heroHp}\nST ${Math.round(stamina)} B ${Math.round(heroBoost)}`,
      resourcesPct: manaPct,
      resourcesLabel: `MN ${Math.round(mana)}\nPOT ${potions}/${potionsCap}`,
      creatPct: creatMix,
      creatLabel: hasHatchedCreat
        ? `HP ${Math.round(creatHp)} ST ${Math.round(creatStam)}\nFD ${Math.round(creatFood)} H ${Math.round(creatHappy)} B ${Math.round(creatBond)}`
        : 'CREAT LOCKED\nHATCH TO UNLOCK',
      combatPct,
      combatLabel: `#1 STATIC\n#2-5 CD ${Math.round(cooldownReady)}%`,
    });
  }

  private updateBondGemHud(bond: number, hasHatchedCreat: boolean) {
    const safeBond = Math.max(0, Math.min(100, Math.round(bond)));
    const progress = safeBond / 100;
    const ringRadius = 12;

    this.bondGemRing.clear();
    this.bondGemRing.lineStyle(2, 0x312e81, 0.95);
    this.bondGemRing.strokeCircle(this.scale.width - 46, 18, ringRadius);

    if (hasHatchedCreat && safeBond > 0) {
      this.bondGemRing.lineStyle(3, 0xd946ef, 1);
      this.bondGemRing.beginPath();
      this.bondGemRing.arc(this.scale.width - 46, 18, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress, false);
      this.bondGemRing.strokePath();
    }

    this.bondGemPercentText.setText(hasHatchedCreat ? `${safeBond}%` : '--');
    this.bondGemLabelText.setColor(hasHatchedCreat ? '#c084fc' : '#64748b');
  }

  private spawnHealingTree(x: number, y: number) {
    const sprite = this.add.sprite(x, y, 'heal-tree').setDepth(4);
    this.tweens.add({ targets: sprite, y: y - 4, yoyo: true, repeat: -1, duration: 1800 });
    this.healingTrees.push({ sprite });
  }

  private spawnHealingGrove(cx: number, cy: number) {
    const points: Array<[number, number]> = [
      [cx - 36, cy - 18],
      [cx + 0, cy - 30],
      [cx + 36, cy - 18],
      [cx - 44, cy + 20],
      [cx + 0, cy + 28],
      [cx + 44, cy + 20]
    ];
    for (const [x, y] of points) this.spawnHealingTree(x, y);
    this.add.circle(cx, cy, 54, 0x86efac, 0.08).setDepth(2);
    this.add.text(cx, cy + 58, 'Healing Grove', { color: '#bbf7d0', fontSize: '10px' }).setOrigin(0.5).setDepth(5);
    this.healingGroveCenters.push({ x: cx, y: cy });
  }

  private spawnEnemy(kind: EnemyKind, x: number, y: number, patrolPoints: Array<{ x: number; y: number }>, isFinalSkirmisher = false) {
    const balance = this.getRouteBalance();
    const config = kind === 'venom-spider'
      ? { texture: 'spider', label: 'Burrow Spider', hp: 24, speed: 70, touchDamage: 5, rewardGold: 7, role: 'crawling' as EncounterRole }
      : kind === 'root-beast'
        ? { texture: 'root-beast', label: 'Root Beast', hp: 40, speed: 46, touchDamage: 9, rewardGold: 11, role: 'walking' as EncounterRole }
        : kind === 'sky-stinger'
          ? { texture: 'spider', label: 'Sky Stinger', hp: 22, speed: 82, touchDamage: 6, rewardGold: 9, role: 'flying' as EncounterRole }
          : { texture: 'sentinel', label: 'Stone Sentinel', hp: 58, speed: 34, touchDamage: 12, rewardGold: 16, role: 'walking' as EncounterRole };

    const hp = Math.round(config.hp * balance.hpMult * (isFinalSkirmisher ? balance.finalSkirmisherHpMult : 1));
    const touchDamage = Math.max(1, Math.round(config.touchDamage * balance.damageMult));
    const rewardGold = Math.max(1, Math.round(config.rewardGold * (isFinalSkirmisher ? balance.finalSkirmisherRewardMult : 1)));

    const spacingJitter = this.routeProfile.enemySpacing === 'spread'
      ? 34
      : this.routeProfile.enemySpacing === 'packed'
        ? 13
        : 20;
    const offsetX = Phaser.Math.Between(-spacingJitter, spacingJitter);
    const offsetY = Phaser.Math.Between(-spacingJitter, spacingJitter);
    const spawnX = x + offsetX;
    const spawnY = y + offsetY;
    const adjustedPatrol = patrolPoints.map((point) => ({
      x: point.x + Phaser.Math.Between(-Math.floor(spacingJitter / 2), Math.floor(spacingJitter / 2)),
      y: point.y + Phaser.Math.Between(-Math.floor(spacingJitter / 2), Math.floor(spacingJitter / 2))
    }));

    const creatureScale = kind === 'stone-sentinel'
      ? 1.5
      : kind === 'root-beast'
        ? 1.36
        : kind === 'venom-spider'
          ? 1.24
          : 1.12;

    const shadow = this.add.circle(spawnX, spawnY + 14, kind === 'stone-sentinel' ? 24 : kind === 'root-beast' ? 21 : 18, 0x020617, 0.26).setDepth(4.6);
    const sprite = this.add.sprite(spawnX, spawnY, config.texture).setDepth(5).setScale(creatureScale);
    if (kind === 'sky-stinger') {
      sprite.setTint(0x7dd3fc);
      this.tweens.add({ targets: sprite, y: spawnY - 8, yoyo: true, repeat: -1, duration: 620 });
    }
    const hpBg = this.add.image(spawnX, spawnY - 30, 'hpbg').setDepth(5).setDisplaySize(56, 8);
    const hpBar = this.add.image(spawnX - 28, spawnY - 30, 'hpfill').setDepth(6).setDisplaySize(56, 8).setOrigin(0, 0.5);

    this.enemies.push({
      kind,
      label: config.label,
      role: config.role,
      sprite,
      shadow,
      hp,
      maxHp: hp,
      hpBg,
      hpBar,
      speed: config.speed,
      touchDamage,
      rewardGold,
      patrolPoints: adjustedPatrol,
      patrolIndex: 0,
      isFinalSkirmisher
    });
  }

  private spawnPickup(kind: PickupKind, x: number, y: number, amount: number) {
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
    const spread = this.routeProfile.id === 'sovereign' ? 15 : this.routeProfile.id === 'rider' ? 16 : 20;
    const spawnX = x + Phaser.Math.Between(-spread, spread);
    const spawnY = y + Phaser.Math.Between(-spread, spread);
    const scale = kind === 'gold-cache'
      ? 1.12
      : kind === 'ember-fruit'
        ? 1.2
        : 1.18;
    const glowColor = kind === 'green-gem'
      ? 0x86efac
      : kind === 'soulshard'
        ? 0xd8b4fe
        : kind === 'gold-cache'
          ? 0xfbbf24
          : 0xfb923c;
    const glow = this.add.circle(spawnX, spawnY, 14, glowColor, 0.2).setDepth(4.7);
    const guideRing = this.add.circle(spawnX, spawnY, 22, glowColor, 0.07).setDepth(4.66);
    const sprite = this.add.sprite(spawnX, spawnY, texture).setDepth(5).setScale(scale);
    this.tweens.add({ targets: [sprite, glow], y: spawnY - 6, yoyo: true, repeat: -1, duration: 900 });
    this.tweens.add({
      targets: [glow, guideRing],
      alpha: { from: 0.18, to: 0.5 },
      yoyo: true,
      repeat: -1,
      duration: 760
    });
    this.pickups.push({ kind, label, sprite, glow, guideRing, amount });
  }

  private doAttack() {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 420;
    let hitAny = false;

    this.attackEffect.setPosition(this.hero.x + 24, this.hero.y - 8).setVisible(true).setAlpha(1).setScale(1);
    this.tweens.add({
      targets: this.attackEffect,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 280,
      onComplete: () => this.attackEffect.setVisible(false)
    });

    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;

      const distance = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      if (distance >= 86) continue;

      const baseDamage = enemy.kind === 'stone-sentinel' ? 10 : enemy.kind === 'root-beast' ? 14 : enemy.kind === 'sky-stinger' ? 16 : 18;
      enemy.hp = Math.max(0, enemy.hp - baseDamage);
      hitAny = true;
      this.showDamageNumber(enemy.sprite.x, enemy.sprite.y - 24, baseDamage, '#fcd34d');
      this.updateEnemyHp(enemy);

      const angle = Phaser.Math.Angle.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      enemy.sprite.x += Math.cos(angle) * 18;
      enemy.sprite.y += Math.sin(angle) * 18;

      if (enemy.hp <= 0) {
        this.killEnemy(enemy);
      }
    }

    if (hitAny) {
      AudioManager.playCombatHit('light');
    }
  }

  private updateEnemyHp(enemy: Enemy) {
    const percentage = enemy.hp / enemy.maxHp;
    enemy.hpBar.setDisplaySize(Math.max(1, 56 * percentage), 8);
    enemy.hpBar.setTint(percentage > 0.5 ? 0x22c55e : percentage > 0.25 ? 0xfbbf24 : 0xef4444);
  }

  private killEnemy(enemy: Enemy) {
    AudioManager.playCombatHit('heavy');
    this.kills += 1;
    this.runGold += enemy.rewardGold;
    this.registry.set('gold', (this.registry.get('gold') || 0) + enemy.rewardGold);

    this.spawnLootFromDataTable(enemy.sprite.x, enemy.sprite.y);

    for (let index = 0; index < 4; index += 1) {
      const coin = this.add.image(enemy.sprite.x, enemy.sprite.y, 'coin').setDepth(7);
      this.tweens.add({
        targets: coin,
        x: enemy.sprite.x + Phaser.Math.Between(-28, 28),
        y: enemy.sprite.y + Phaser.Math.Between(-30, 10),
        alpha: 0,
        duration: 500,
        delay: index * 70,
        onComplete: () => coin.destroy()
      });
    }

    const label = enemy.label;
    const deathX = enemy.sprite.x;
    const deathY = enemy.sprite.y;
    enemy.sprite.destroy();
    enemy.shadow.destroy();
    enemy.hpBg.destroy();
    enemy.hpBar.destroy();

    // Bond only grows after the egg has hatched.
    if (this.registry.get('hasHatchedCreat') && this.canUseCreatCompanionInTrials()) {
      const newBond = Math.min(100, (this.registry.get('creatBond') || 0) + 2);
      this.registry.set('creatBond', newBond);
      const el = (this.registry.get('creatElement') as string) || '';
      const selectedSpecies = (this.registry.get('creatSpecies') as string) || '';
      const sp = el ? (selectedSpecies ? getCreatSpeciesByName(el, selectedSpecies).species : getCreatSpecies(el).species) : 'Creat';
      if (this.creatBondText) this.creatBondText.setText(`${sp} Bond: ${newBond}%`);
      this.updateBondGemHud(newBond, true);
      if (newBond === 25) this.showMessage('Bond Milestone: Your Creat learned your name!', '#f0abfc');
      if (newBond === 50) this.showMessage('Bond Milestone: Combo attacks unlocked!', '#f0abfc');
      if (newBond === 75) this.showMessage('Bond Milestone: Creat will protect you (auto-block)!', '#f0abfc');
      if (newBond === 100) this.showMessage('Perfect Bond! Maximum power achieved!', '#fde68a');
    }

    this.killText.setText(`Foes Cleared: ${this.kills} / ${this.enemies.length}`);
    this.goldText.setText(`Gold: ${this.runGold}`);
    this.showMessage(`${label} defeated. Loot scattered on the path.`, '#fde68a');

    if (enemy.isFinalSkirmisher && !this.mergeUnlocked) {
      this.mergeUnlocked = true;
      if (!this.registry.get('hasCreatEgg')) {
        this.registry.set('hasCreatEgg', true);
        this.registry.set('creatStage', 'egg');
        const heroEl = (this.registry.get('heroElement') as string) || 'Fire';
        const possibleSp = getCreatSpecies(heroEl);
        this.showMessage(`🥚 Final skirmisher down. You earned a Creat Egg near the route merge. (${possibleSp.species} affinity hint)`, '#c4b5fd');
      }
      this.homeGate.setTint(0x7dd3fc);
      this.homeGateText.setText('Merge Trail Open: Sanctuary Isle');
      this.promptText.setText('Egg secured. Merge trail is open. Continue or finish remaining encounters for extra loot.');
    }

    const aliveCount = this.enemies.filter((entry) => entry.sprite.active).length;
    if (aliveCount === 0) {
      this.routeCleared = true;
      this.registry.set('forestTrialsCleared', (this.registry.get('forestTrialsCleared') || 0) + 1);
      this.spawnLootFromDataTable(deathX + 10, deathY - 10);
      if (!this.mergeUnlocked) this.mergeUnlocked = true;
      updateAchievementRegistryFlags(this.registry);
      this.homeGate.setTint(0x7dd3fc);
      this.homeGateText.setText('Merged Trail Open: Go to Sanctuary Isle');
      this.showMessage('Route complete. Trails merge ahead. Travel to Sanctuary Isle.', '#22c55e');
    }
  }

  private pickForestLootEntry() {
    if (!this.forestLootPool.length) return null;

    const totalWeight = this.forestLootPool.reduce((sum, entry) => sum + entry.weight, 0);
    if (totalWeight <= 0) return this.forestLootPool[0];

    let roll = Phaser.Math.Between(1, totalWeight);
    for (const entry of this.forestLootPool) {
      roll -= entry.weight;
      if (roll <= 0) return entry;
    }
    return this.forestLootPool[0];
  }

  private spawnLootFromDataTable(x: number, y: number) {
    const entry = this.pickForestLootEntry();
    if (!entry) return;

    const qty = Math.max(1, Math.round(Phaser.Math.Between(entry.minQty, entry.maxQty) * this.getRouteBalance().dropQtyMult));
    const mapByItemId: Record<string, PickupKind> = {
      'food-ember-fruit': 'ember-fruit',
      'mat-fiber-bundle': 'soulshard',
      'mat-essence-earth': 'green-gem'
    };

    const kind = mapByItemId[entry.itemId] ?? 'gold-cache';
    this.spawnPickup(kind, x, y, Math.max(1, qty));
  }

  private collectPickup(pickup: Pickup) {
    if (!pickup.sprite.active) return;

    if (pickup.kind === 'green-gem') {
      AudioManager.playPickup('material');
      this.greenGems += pickup.amount;
      this.gemText.setText(`Green Gems: ${this.greenGems}`);
      this.registry.set('greenGems', (this.registry.get('greenGems') || 0) + pickup.amount);
      this.showMessage(`${pickup.label} gathered. Earth energy stored.`, '#86efac');
    } else if (pickup.kind === 'gold-cache') {
      AudioManager.playPickup('coin');
      this.runGold += pickup.amount;
      this.goldText.setText(`Gold: ${this.runGold}`);
      this.registry.set('gold', (this.registry.get('gold') || 0) + pickup.amount);
      this.showMessage(`Recovered ${pickup.amount} gold from the trail.`, '#fbbf24');
    } else if (pickup.kind === 'soulshard') {
      AudioManager.playPickup('material');
      this.soulshards += pickup.amount;
      this.shardText.setText(`Soulshards: ${this.soulshards}`);
      this.registry.set('soulshards', (this.registry.get('soulshards') || 0) + pickup.amount);
      this.showMessage(`${pickup.label} gathered from fallen foes.`, '#d8b4fe');
    } else {
      AudioManager.playPickup('item');
      // Auto-route creat-care items into creat inventory once a creat is hatched.
      const routed = routeToCreatInventory(this.registry, {
        id: `ember-fruit-${Date.now()}`,
        name: 'Ember Fruit',
        quantity: 1,
        type: 'food'
      });

      if (routed) {
        this.showMessage(`Ember Fruit routed to creat inventory. Prompt: ${routed.prompt.label}.`, '#f0abfc');
        this.promptText.setText(`Creat action available: ${routed.prompt.message}`);
      } else {
        const healAmount = 18;
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + healAmount);
        this.updateHeroHp();
        const inventory = [...((this.registry.get('inventory') || []) as Array<{ id: string; name: string; equipped: boolean }>)];
        inventory.push({ id: `ember-fruit-${Date.now()}`, name: 'Ember Fruit', equipped: false });
        this.registry.set('inventory', inventory);
        this.showMessage('Ember Fruit gathered. Vitality restored.', '#f97316');
      }
    }

    pickup.glow.destroy();
    pickup.guideRing?.destroy();
    pickup.sprite.destroy();
  }

  private showDamageNumber(x: number, y: number, value: number, color: string) {
    const text = this.add.text(x, y, `-${value}`, { color, fontSize: '16px', fontStyle: 'bold' }).setDepth(12);
    this.tweens.add({ targets: text, y: y - 34, alpha: 0, delay: 220, duration: 1300, onComplete: () => text.destroy() });
  }

  private showMessage(message: string, color: string) {
    const width = this.scale.width;
    const height = this.scale.height;
    const text = this.add.text(width / 2, height / 2 - 72, message, {
      color,
      fontSize: '18px',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(20).setScrollFactor(0);

    this.tweens.add({ targets: text, y: height / 2 - 96, alpha: 0, delay: 650, duration: 3200, onComplete: () => text.destroy() });
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
    title.innerText = 'Forest Route Map';
    Object.assign(title.style, { color: '#86efac', fontWeight: 'bold', marginBottom: '10px' });
    root.appendChild(title);

    const spots: Array<{ label: string; scene: string }> = [
      { label: 'Continue Forest Route', scene: 'ForestZone' },
      { label: 'Sanctuary SouthFerry Dock', scene: 'SanctuaryIsleOverworld' },
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

    const existing = container.querySelector('.chat-menu') as HTMLElement | null;
    if (existing) {
      existing.remove();
      return;
    }

    const root = document.createElement('div');
    root.className = 'chat-menu';
    Object.assign(root.style, {
      position: 'absolute',
      left: '16px',
      bottom: '16px',
      width: '300px',
      maxHeight: '260px',
      background: 'rgba(2, 6, 23, 0.68)',
      backdropFilter: 'blur(4px)',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#e2e8f0',
      padding: '10px',
      zIndex: '99',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
    });

    const title = document.createElement('div');
    title.innerText = 'Forest Chat';
    Object.assign(title.style, { color: '#a5f3fc', fontWeight: 'bold', marginBottom: '6px' });
    root.appendChild(title);

    const log = document.createElement('div');
    Object.assign(log.style, {
      height: '150px',
      overflowY: 'auto',
      fontSize: '12px',
      marginBottom: '8px',
      border: '1px solid #1e293b',
      borderRadius: '6px',
      padding: '6px',
      background: '#020617'
    });
    log.innerHTML = '<div style="color:#93c5fd">[System] Forest channel active.</div>';
    root.appendChild(log);

    const input = document.createElement('input');
    input.placeholder = 'Type a message...';
    Object.assign(input.style, {
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: '6px',
      padding: '7px',
      borderRadius: '6px',
      border: '1px solid #334155',
      background: '#0f172a',
      color: '#e2e8f0'
    });
    root.appendChild(input);

    const send = document.createElement('button');
    send.innerText = 'Send';
    Object.assign(send.style, {
      width: '100%',
      padding: '7px',
      borderRadius: '6px',
      border: '1px solid #0e7490',
      background: '#155e75',
      color: '#ecfeff',
      cursor: 'pointer'
    });

    const post = () => {
      const msg = input.value.trim();
      if (!msg) return;
      const row = document.createElement('div');
      row.style.color = '#e5e7eb';
      row.textContent = `[You] ${msg}`;
      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
      input.value = '';
    };

    send.onclick = post;
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') post();
    });

    const close = document.createElement('button');
    close.innerText = 'Close [C]';
    Object.assign(close.style, {
      width: '100%',
      marginTop: '6px',
      padding: '7px',
      borderRadius: '6px',
      border: '1px solid #334155',
      background: '#111827',
      color: '#cbd5e1',
      cursor: 'pointer'
    });
    close.onclick = () => root.remove();

    root.appendChild(send);
    root.appendChild(close);
    container.appendChild(root);
  }

  private exitToHomeBase() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    if (this.isRouteTestHarnessMode()) {
      this.scene.start('RouteTestHarness');
      return;
    }
    this.scene.start('SanctuaryIsleOverworld');
  }

  update(time: number, delta: number) {
    this.updateTrialTimeAndSky(delta);

    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.creatAttackCooldown > 0) this.creatAttackCooldown -= delta;

    this.hero.update(time, delta);
    this.clampHeroToTraversalLanes();
    this.updateCameraFraming(delta);

    const movedDist = Phaser.Math.Distance.Between(this.prevHeroX, this.prevHeroY, this.hero.x, this.hero.y);
    if (movedDist > 1.5) {
      AudioManager.playFootstep('path');
    }
    this.prevHeroX = this.hero.x;
    this.prevHeroY = this.hero.y;

    // ── CREAT COMPANION follows hero + auto-attacks ──────────────────────
    if (this.creatSprite && this.creatSprite.active) {
      const targetX = this.hero.x - 44;
      const targetY = this.hero.y + 20;
      this.creatSprite.x += (targetX - this.creatSprite.x) * 0.12;
      this.creatSprite.y += (targetY - this.creatSprite.y) * 0.12;
      // y is animated by tween, only snap the base
      const creatLabel: Phaser.GameObjects.Text = (this as any)._creatLabel;
      if (creatLabel) { creatLabel.x = this.creatSprite.x; creatLabel.y = this.creatSprite.y - 28; }

      // Creat auto-attack: target nearest enemy every 1.8s
      if (this.creatAttackCooldown <= 0 && this.enemies.length > 0) {
        let nearest: Enemy | null = null;
        let nearDist = Infinity;
        for (const e of this.enemies) {
          if (!e.sprite.active) continue;
          const d = Phaser.Math.Distance.Between(this.creatSprite.x, this.creatSprite.y, e.sprite.x, e.sprite.y);
          if (d < nearDist) { nearDist = d; nearest = e; }
        }
        if (nearest && nearDist < 220) {
          this.creatAttackCooldown = 1800;
          const creatDmg = 8;
          nearest.hp = Math.max(0, nearest.hp - creatDmg);
          this.showDamageNumber(nearest.sprite.x, nearest.sprite.y - 34, creatDmg, '#f0abfc');
          this.updateEnemyHp(nearest);
          // Flash creat
          this.creatSprite.setTint(0xf0abfc);
          this.time.delayedCall(200, () => this.creatSprite?.clearTint());
          if (nearest.hp <= 0) this.killEnemy(nearest);
        }
      }
    }

    const width = this.scale.width;
    const height = this.scale.height;

    for (const pickup of this.pickups) {
      if (!pickup.sprite.active) continue;
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, pickup.sprite.x, pickup.sprite.y) < 22) {
        this.collectPickup(pickup);
      }
    }
    this.pickups = this.pickups.filter((pickup) => pickup.sprite.active);

    let inHealingGrove = false;
    for (const grove of this.healingGroveCenters) {
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, grove.x, grove.y) < 80) {
        inHealingGrove = true;
        break;
      }
    }

    if (inHealingGrove && this.heroHp < this.heroMaxHp) {
      this.groveHealTick += delta;
      if (this.groveHealTick >= 220) {
        this.groveHealTick = 0;
        this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 1);
        this.updateHeroHp();
      }
      this.promptText.setText('Healing Grove active: health restoring over time.');
    } else {
      this.groveHealTick = 0;
    }

    const nearTrialGate = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.trialGate.x, this.trialGate.y) < 34;
    const nearHomeGate = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.homeGate.x, this.homeGate.y) < 34;
    if (nearTrialGate) {
      this.promptText.setText(`Fork marker: ${this.routeProfile.title} selected. Push forward until routes merge.`);
    } else if (nearHomeGate) {
      if (this.mergeUnlocked) {
        this.promptText.setText('Merged trail reached. Traveling to Sanctuary Isle...');
        this.exitToHomeBase();
      } else {
        this.promptText.setText('Defeat the final skirmisher to secure the egg and open the merge trail.');
      }
    } else if (!inHealingGrove) {
      this.promptText.setText(`Stay on ${this.routeProfile.title}: fight, gather, and move toward the merged Sanctuary trail.`);
    }

    for (const enemy of this.enemies) {
      if (!enemy.sprite.active) continue;

      const distanceToHero = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, enemy.sprite.x, enemy.sprite.y);
      if (distanceToHero < 190) {
        const chaseAngle = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, this.hero.x, this.hero.y);
        enemy.sprite.x += Math.cos(chaseAngle) * enemy.speed * delta / 1000;
        enemy.sprite.y += Math.sin(chaseAngle) * enemy.speed * delta / 1000;
        enemy.sprite.setTint(
          enemy.kind === 'venom-spider'
            ? 0xef4444
            : enemy.kind === 'root-beast'
              ? 0x65a30d
              : enemy.kind === 'sky-stinger'
                ? 0x7dd3fc
                : 0x67e8f9
        );

        if (distanceToHero < 28 && this.hurtFlashTimer <= 0) {
          this.heroHp -= enemy.touchDamage;
          this.hurtFlashTimer = 520;
          this.showDamageNumber(this.hero.x, this.hero.y - 30, enemy.touchDamage, '#f87171');
          this.cameras.main.shake(120, 0.008);
          if (this.heroHp > 0 && this.heroHp <= this.heroMaxHp * 0.3) {
            AudioManager.playDangerCue('low');
          }
          if (this.heroHp <= 0) {
            this.heroHp = 0;
            this.updateHeroHp();
            this.showMessage('You were overwhelmed. Your discernment will guide you better next time. Returning to Haven.', '#f59e0b');
            this.time.delayedCall(1800, () => {
              if (this.isRouteTestHarnessMode()) {
                this.scene.start('RouteTestHarness');
              } else {
                this.scene.start('HavenGrounds');
              }
            });
          } else {
            this.updateHeroHp();
          }
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

      enemy.sprite.x = Phaser.Math.Clamp(enemy.sprite.x, 30, width - 30);
      enemy.sprite.y = Phaser.Math.Clamp(enemy.sprite.y, enemy.kind === 'sky-stinger' ? 72 : 54, height - 50);
      enemy.shadow.setPosition(enemy.sprite.x, enemy.sprite.y + 14);
      enemy.hpBg.setPosition(enemy.sprite.x, enemy.sprite.y - 30);
      enemy.hpBar.setPosition(enemy.sprite.x - 28, enemy.sprite.y - 30);
    }

    this.enemies = this.enemies.filter((enemy) => enemy.sprite.active);

    if (this.hurtFlashTimer > 0) {
      this.hurtFlashTimer -= delta;
      this.hero.setTint(0xff4444);
    } else {
      this.hero.clearTint();
    }

    this.clampHeroToTraversalLanes();
    this.refreshCircleGemHud();
  }

  private updateHeroHp() {
    const percentage = this.heroHp / this.heroMaxHp;
    this.heroHpBar.setDisplaySize(100 * percentage, 10);
    this.heroHpBar.setTint(percentage > 0.5 ? 0x22c55e : percentage > 0.25 ? 0xfbbf24 : 0xef4444);
    this.heroHpText.setText(`HP ${this.heroHp}/${this.heroMaxHp}`);
    this.refreshCircleGemHud();
  }
}
