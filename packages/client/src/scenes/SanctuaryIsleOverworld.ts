import Phaser from 'phaser';
import { SANCTUARY_NAMESETS } from '../data/SanctuaryLocationReference';
import { InventoryMenu, type InventoryItem } from '../ui/InventoryMenu';
import { openGameChatOverlay } from '../ui/GameChatOverlay';
import AudioManager from '../audio/AudioManager';
import { createLocationShortcutHandler } from '../utils/locationShortcuts';
import { DockWelcomeSign } from '../ui/DockWelcomeSign';

interface RoutePoint {
  id: string;
  x: number;
  y: number;
  title: string;
  subtitle: string;
  connectScene?: string;
}

interface AmbientResident {
  sprite: Phaser.GameObjects.Arc;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  speed: number;
  targetX: number;
  targetY: number;
}

interface IslePickup {
  id: string;
  x: number;
  y: number;
  kind: 'forage' | 'water' | 'material';
  collected: boolean;
  icon: Phaser.GameObjects.Arc;
  ring: Phaser.GameObjects.Arc;
}

export default class SanctuaryIsleOverworld extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key };
  private helpText!: Phaser.GameObjects.Text;
  private noticeText!: Phaser.GameObjects.Text;
  private districtText!: Phaser.GameObjects.Text;
  private routePoints: Array<RoutePoint & { marker: Phaser.GameObjects.Arc }> = [];
  private activePointIndex = -1;
  private residents: AmbientResident[] = [];
  private pickups: IslePickup[] = [];
  private pickupSummaryText!: Phaser.GameObjects.Text;
  private compassContainer?: Phaser.GameObjects.Container;
  private compassNeedle?: Phaser.GameObjects.Triangle;
  private guideArrow?: Phaser.GameObjects.Triangle;
  private guideText?: Phaser.GameObjects.Text;
  private mapModeText?: Phaser.GameObjects.Text;
  private mapView = false;
  private objectivePointId = 'greenwood_clearing';
  private selectedMainlandMode: 'land_crossing' | 'boat_passage' | null = null;
  private selectedMainlandKingdom = '';
  private collectedPickups = 0;
  private prevHeroX = 2140;
  private prevHeroY = 980;
  private cameraZoom = 1.26;
  private readonly cameraZoomMin = 1.14;
  private readonly cameraZoomMax = 1.4;
  private welcomeSign?: DockWelcomeSign;
  private onWindowShortcutKeyDown = createLocationShortcutHandler(this, 'SanctuaryIsleOverworld', {
    onMap: () => this.toggleMapView(),
    onInventory: () => this.openInventory(),
    onChat: () => this.openChatMenu()
  });

  constructor() {
    super('SanctuaryIsleOverworld');
  }

  private setCameraZoom(nextZoom: number) {
    this.cameraZoom = Phaser.Math.Clamp(nextZoom, this.cameraZoomMin, this.cameraZoomMax);
    this.cameras.main.setZoom(this.cameraZoom);
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBounds(0, 0, 2600, 1700);
    this.drawIsleLayout();
    AudioManager.attachScene(this);
    AudioManager.playAmbientLoop('day');

    const selectedKingdom = String(this.registry.get('activeMainlandKingdom') ?? '').toLowerCase();
    const selectedModeRaw = String(this.registry.get('selectedMainlandTravelMode') ?? '').toLowerCase();
    this.selectedMainlandKingdom = selectedKingdom;
    this.selectedMainlandMode = selectedModeRaw === 'land_crossing' || selectedModeRaw === 'boat_passage'
      ? selectedModeRaw
      : null;

    const spawn = this.selectedMainlandMode === 'land_crossing'
      ? { x: 2330, y: 910 }
      : { x: 2140, y: 980 };

    this.objectivePointId = this.selectedMainlandMode === 'land_crossing'
      ? 'saltroot_landgate'
      : this.selectedMainlandMode === 'boat_passage'
        ? 'southferry_manifest'
        : 'greenwood_clearing';

    this.hero = this.add.circle(spawn.x, spawn.y, 15, 0xf8fafc, 1).setDepth(30);
    this.add.circle(spawn.x, spawn.y + 14, 20, 0x000000, 0.2).setDepth(4);
    this.prevHeroX = this.hero.x;
    this.prevHeroY = this.hero.y;

    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.keys = this.input.keyboard?.addKeys('W,A,S,D,E') as { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key };

    this.cameras.main.startFollow(this.hero, true, 0.1, 0.1, -8, 58);
    this.setCameraZoom(this.cameraZoom);

    this.spawnResidentialLife();
    this.spawnExplorationPickups();
    this.createRoutePoints();
    this.createHud(width, height);
    this.updateNavigationIndicator();
    this.initializeDockWelcomeSign();

    this.input.keyboard?.on('keydown-E', () => this.tryRouteInteraction());
    this.input.keyboard?.on('keydown-ONE', () => this.setCameraZoom(1.14));
    this.input.keyboard?.on('keydown-TWO', () => this.setCameraZoom(1.26));
    this.input.keyboard?.on('keydown-THREE', () => this.setCameraZoom(1.36));
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _over: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      const step = dy > 0 ? -0.03 : 0.03;
      this.setCameraZoom(this.cameraZoom + step);
    });
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('SanctuaryHomeBase'));

    window.addEventListener('keydown', this.onWindowShortcutKeyDown);
    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this.onWindowShortcutKeyDown);
    });

    const selectedDays = Number(this.registry.get('selectedMainlandTravelDays') ?? 0);
    if (selectedKingdom && this.selectedMainlandMode) {
      const modeLabel = this.selectedMainlandMode === 'land_crossing' ? 'Land Crossing' : 'Boat Passage';
      const travelDays = Number.isFinite(selectedDays) && selectedDays > 0 ? `${selectedDays}d` : 'standard pacing';
      const objectiveLabel = this.selectedMainlandMode === 'land_crossing'
        ? 'Proceed to Saltroot Landgate'
        : 'Check SouthFerry departure manifest';
      this.showNotice(`Route selected: ${selectedKingdom} - ${modeLabel} (${travelDays}). ${objectiveLabel}.`, '#93c5fd');
    } else {
      this.showNotice(`Dock arrival complete. Follow island roads from SouthFerry Dock to ${SANCTUARY_NAMESETS.greenwoodClearing}.`, '#93c5fd');
    }
  }

  update(_time: number, delta: number) {
    const speed = 190;
    const dt = delta / 1000;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || this.keys.a?.isDown) vx -= speed;
    if (this.cursors.right?.isDown || this.keys.d?.isDown) vx += speed;
    if (this.cursors.up?.isDown || this.keys.w?.isDown) vy -= speed;
    
    // Update dock welcome sign visibility based on proximity
    this.updateDockSignVisibility();
    if (this.cursors.down?.isDown || this.keys.s?.isDown) vy += speed;

    const x = Phaser.Math.Clamp(this.hero.x + vx * dt, 40, 2560);
    const y = Phaser.Math.Clamp(this.hero.y + vy * dt, 40, 1660);

    if (this.mapView) {
      this.updateNavigationIndicator();
      return;
    }

    this.hero.setPosition(x, y);

    const movedDist = Phaser.Math.Distance.Between(this.prevHeroX, this.prevHeroY, x, y);
    if (movedDist > 1.5 && (vx !== 0 || vy !== 0)) {
      const surface = y > 1080 ? 'path' : y < 500 ? 'stone' : 'debris';
      AudioManager.playFootstep(surface);
    }
    this.prevHeroX = x;
    this.prevHeroY = y;

    this.updateResidents(dt);
    this.tryCollectPickups();
    this.updateRoutePrompt();
    this.updateDistrictLabel();
    this.updateNavigationIndicator();
  }

  private drawIsleLayout() {
    const g = this.add.graphics();
    g.fillStyle(0x0b1326, 1);
    g.fillRect(0, 0, 2600, 1700);

    g.fillStyle(0x123b2a, 0.45);
    g.fillRoundedRect(60, 760, 760, 620, 24);
    this.add.text(140, 790, 'Greenwood Residential Belt', { color: '#bbf7d0', fontSize: '16px', fontStyle: 'bold' }).setDepth(3);

    g.fillStyle(0x0f3a4f, 0.36);
    g.fillRoundedRect(880, 720, 820, 660, 24);
    this.add.text(980, 750, 'Towne Mixed Core', { color: '#bae6fd', fontSize: '16px', fontStyle: 'bold' }).setDepth(3);

    g.fillStyle(0x3a2a12, 0.34);
    g.fillRoundedRect(1780, 760, 720, 620, 24);
    this.add.text(1880, 790, 'Dock and Fishers District', { color: '#fde68a', fontSize: '16px', fontStyle: 'bold' }).setDepth(3);

    g.fillStyle(0x334155, 0.35);
    g.fillRoundedRect(1200, 220, 1040, 420, 24);
    this.add.text(1310, 248, 'Northwatch Cliffs and Overlook Ridge', { color: '#e2e8f0', fontSize: '15px', fontStyle: 'bold' }).setDepth(3);

    g.fillStyle(0x1f2937, 0.95);
    g.fillRoundedRect(140, 960, 2280, 96, 16);
    g.fillRoundedRect(520, 860, 360, 96, 16);
    g.fillRoundedRect(980, 860, 380, 96, 16);
    g.fillRoundedRect(1380, 860, 360, 96, 16);
    g.fillRoundedRect(1780, 860, 460, 96, 16);
    g.fillRoundedRect(1500, 520, 120, 360, 16);

    this.add.text(620, 1004, 'Greenwood Trail', { color: '#c4b5fd', fontSize: '12px', fontStyle: 'bold' }).setDepth(4);
    this.add.text(1040, 1004, 'Towne Lane', { color: '#93c5fd', fontSize: '12px', fontStyle: 'bold' }).setDepth(4);
    this.add.text(1450, 1004, 'Market Stretch', { color: '#bfdbfe', fontSize: '12px', fontStyle: 'bold' }).setDepth(4);
    this.add.text(1950, 1004, 'Fishers Walk Route', { color: '#fcd34d', fontSize: '12px', fontStyle: 'bold' }).setDepth(4);
    this.add.text(1542, 650, 'Cliff Ladder Path', { color: '#e2e8f0', fontSize: '11px' }).setDepth(4).setOrigin(0.5);
    this.add.text(2070, 930, 'Visiting / Travel Dock', { color: '#fde68a', fontSize: '12px', fontStyle: 'bold' }).setDepth(4).setOrigin(0.5);

    this.drawCurvedCrossingApproach();
    this.drawCrossingMicroTerrain();

    this.add.text(180, 1110, 'Path Writing (Island Circulation):\n• SouthFerry Dock -> Fishers Walk -> Market Stretch -> Towne Lane\n• Towne Lane -> Greenwood Trail -> Greenwood Clearing (Home Base)\n• Market Stretch -> Cliff Ladder Path -> Northwatch/Overlook\n• Fishers Walk -> Towne Lane -> Greenwood return loop', {
      color: '#cbd5e1',
      fontSize: '11px',
      wordWrap: { width: 620 }
    }).setDepth(4);

    this.add.text(1660, 1120, 'Crossing Trek Pattern:\n• Curved inner lane with green cover pockets\n• Semi-detached branch for item search and stealth reposition\n• Hidden safe camps used by monthly travel parties', {
      color: '#bbf7d0',
      fontSize: '10px',
      wordWrap: { width: 420 }
    }).setDepth(4);

    for (let i = 0; i < 110; i += 1) {
      const gx = Phaser.Math.Between(80, 2520);
      const gy = Phaser.Math.Between(120, 1600);
      const r = Phaser.Math.Between(4, 10);
      const color = gy > 700 ? 0x16a34a : 0x15803d;
      this.add.circle(gx, gy, r, color, 0.12).setDepth(1);
    }
  }

  private drawCurvedCrossingApproach() {
    const mainCurve = new Phaser.Curves.Spline([
      2100, 980,
      2210, 930,
      2310, 860,
      2410, 790,
      2500, 740
    ]);

    const detachedCurve = new Phaser.Curves.Spline([
      2180, 960,
      2260, 1020,
      2360, 1010,
      2460, 930
    ]);

    const mainPts = mainCurve.getPoints(30);
    const detachedPts = detachedCurve.getPoints(20);

    for (let i = 0; i < mainPts.length - 1; i += 1) {
      this.add.line(0, 0, mainPts[i].x, mainPts[i].y, mainPts[i + 1].x, mainPts[i + 1].y, 0x374151)
        .setLineWidth(30, 30)
        .setAlpha(0.95)
        .setDepth(4);
    }

    for (let i = 0; i < detachedPts.length - 1; i += 1) {
      this.add.line(0, 0, detachedPts[i].x, detachedPts[i].y, detachedPts[i + 1].x, detachedPts[i + 1].y, 0x1f2937)
        .setLineWidth(20, 20)
        .setAlpha(0.78)
        .setDepth(4);
    }

    this.add.text(2405, 770, 'Saltroot Crossing Lane', {
      color: '#d1fae5',
      fontSize: '10px',
      fontStyle: 'bold'
    }).setDepth(5).setRotation(-0.22);

    this.add.text(2370, 1010, 'Semi-detached Search Branch', {
      color: '#a7f3d0',
      fontSize: '9px'
    }).setDepth(5);
  }

  private drawCrossingMicroTerrain() {
    const greenPockets: Array<{ x: number; y: number; r: number }> = [
      { x: 2240, y: 935, r: 42 },
      { x: 2340, y: 870, r: 38 },
      { x: 2425, y: 810, r: 36 },
      { x: 2320, y: 1010, r: 34 },
      { x: 2465, y: 915, r: 32 }
    ];

    for (const pocket of greenPockets) {
      this.add.circle(pocket.x, pocket.y, pocket.r, 0x14532d, 0.34).setDepth(3);
      this.add.circle(pocket.x, pocket.y, pocket.r - 10, 0x166534, 0.22).setDepth(3);
    }

    const miniForests: Array<{ x: number; y: number }> = [
      { x: 2228, y: 920 },
      { x: 2308, y: 852 },
      { x: 2416, y: 798 },
      { x: 2338, y: 990 }
    ];

    for (const tree of miniForests) {
      this.add.circle(tree.x, tree.y, 10, 0x166534, 0.86).setDepth(5);
      this.add.circle(tree.x + 10, tree.y + 6, 8, 0x15803d, 0.84).setDepth(5);
      this.add.circle(tree.x - 8, tree.y + 8, 7, 0x14532d, 0.8).setDepth(5);
    }

    const shrubBands: Array<{ x: number; y: number }> = [
      { x: 2260, y: 945 },
      { x: 2358, y: 887 },
      { x: 2442, y: 830 },
      { x: 2385, y: 970 },
      { x: 2478, y: 905 }
    ];

    for (const shrub of shrubBands) {
      this.add.ellipse(shrub.x, shrub.y, 20, 12, 0x4d7c0f, 0.72).setDepth(5);
    }

    const rockShelves: Array<{ x: number; y: number; w: number; h: number }> = [
      { x: 2288, y: 904, w: 24, h: 14 },
      { x: 2378, y: 842, w: 30, h: 16 },
      { x: 2468, y: 786, w: 26, h: 15 },
      { x: 2435, y: 944, w: 28, h: 14 }
    ];

    for (const rock of rockShelves) {
      this.add.ellipse(rock.x, rock.y, rock.w, rock.h, 0x64748b, 0.72).setDepth(5);
      this.add.ellipse(rock.x + 4, rock.y - 2, rock.w - 8, rock.h - 6, 0x94a3b8, 0.38).setDepth(5);
    }

    const campNodes: Array<{ x: number; y: number; name: string }> = [
      { x: 2310, y: 980, name: 'Hidden Camp Hollow' },
      { x: 2448, y: 900, name: 'Nightwatch Shrub Camp' }
    ];

    for (const camp of campNodes) {
      this.add.circle(camp.x, camp.y, 16, 0x1f2937, 0.42).setDepth(5);
      this.add.circle(camp.x, camp.y, 4, 0xf59e0b, 0.78).setDepth(6);
      this.add.text(camp.x, camp.y + 20, camp.name, {
        color: '#fcd34d',
        fontSize: '9px'
      }).setOrigin(0.5).setDepth(6).setAlpha(0.82);
    }
  }

  private createRoutePoints() {
    const points: RoutePoint[] = [
      {
        id: 'visiting_dock',
        x: 2140,
        y: 980,
        title: 'SouthFerry Dock',
        subtitle: 'Boat arrivals from Haven and Forest Trials'
      },
      {
        id: 'southferry_manifest',
        x: 2200,
        y: 930,
        title: 'Departure Manifest Board',
        subtitle: 'Confirm boat passage departure with dock stewards'
      },
      {
        id: 'greenwood_clearing',
        x: 220,
        y: 980,
        title: SANCTUARY_NAMESETS.greenwoodClearing,
        subtitle: 'Private rider home base on northern approach',
        connectScene: 'SanctuaryHomeBase'
      },
      {
        id: 'sanctuary_towne',
        x: 1120,
        y: 980,
        title: SANCTUARY_NAMESETS.townCasual,
        subtitle: 'Social and service core district',
        connectScene: 'SanctuaryTown'
      },
      {
        id: 'trail_run',
        x: 720,
        y: 980,
        title: SANCTUARY_NAMESETS.greenwoodTrail,
        subtitle: 'Outbound scout lane and return stretch',
        connectScene: 'SanctuaryTrail'
      },
      {
        id: 'fishers_walk',
        x: 1990,
        y: 980,
        title: 'Fishers Walk',
        subtitle: 'Dock families, fish stalls, and working routes'
      },
      {
        id: 'saltroot_landgate',
        x: 2420,
        y: 820,
        title: 'Saltroot Landgate',
        subtitle: 'Curved crossing trailhead used by monthly mainland trek parties'
      },
      {
        id: 'northwatch',
        x: 1540,
        y: 420,
        title: SANCTUARY_NAMESETS.northwatchCliffs,
        subtitle: 'Wind lane and horizon watch point'
      },
      {
        id: 'old_overlook',
        x: 1840,
        y: 420,
        title: SANCTUARY_NAMESETS.oldOverlook,
        subtitle: 'Memory ridge above the treeline'
      }
    ];

    for (const p of points) {
      const marker = this.add.circle(p.x, p.y, 11, 0x22d3ee, 0.92).setDepth(12);
      this.add.circle(p.x, p.y, 24, 0x67e8f9, 0.16).setDepth(11);
      this.add.text(p.x, p.y - 22, p.title, {
        color: '#e2e8f0',
        fontSize: '11px',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(13);
      this.routePoints.push({ ...p, marker });
    }
  }

  private spawnResidentialLife() {
    const blocks = [
      { minX: 120, maxX: 760, minY: 800, maxY: 1320, count: 14, color: 0xfcd34d },
      { minX: 920, maxX: 1660, minY: 780, maxY: 1320, count: 18, color: 0x93c5fd },
      { minX: 1820, maxX: 2460, minY: 800, maxY: 1320, count: 14, color: 0xfbbf24 }
    ];

    for (const block of blocks) {
      for (let i = 0; i < block.count; i += 1) {
        const x = Phaser.Math.Between(block.minX, block.maxX);
        const y = Phaser.Math.Between(block.minY, block.maxY);
        const sprite = this.add.circle(x, y, Phaser.Math.Between(4, 6), block.color, 0.9).setDepth(8);
        this.residents.push({
          sprite,
          minX: block.minX,
          maxX: block.maxX,
          minY: block.minY,
          maxY: block.maxY,
          speed: Phaser.Math.Between(16, 36),
          targetX: Phaser.Math.Between(block.minX, block.maxX),
          targetY: Phaser.Math.Between(block.minY, block.maxY)
        });
      }
    }
  }

  private spawnExplorationPickups() {
    const nodes: Array<Omit<IslePickup, 'collected' | 'icon' | 'ring'>> = [
      { id: 'g1', x: 320, y: 940, kind: 'forage' },
      { id: 'g2', x: 530, y: 1160, kind: 'material' },
      { id: 'g3', x: 760, y: 980, kind: 'water' },
      { id: 't1', x: 1040, y: 920, kind: 'forage' },
      { id: 't2', x: 1300, y: 1180, kind: 'material' },
      { id: 't3', x: 1510, y: 970, kind: 'water' },
      { id: 'd1', x: 1860, y: 920, kind: 'forage' },
      { id: 'd2', x: 2040, y: 1120, kind: 'material' },
      { id: 'd3', x: 2280, y: 980, kind: 'water' },
      { id: 'c1', x: 2315, y: 970, kind: 'forage' },
      { id: 'c2', x: 2395, y: 905, kind: 'material' },
      { id: 'c3', x: 2460, y: 835, kind: 'water' }
    ];

    for (const n of nodes) {
      const color = n.kind === 'forage' ? 0xfbbf24 : n.kind === 'water' ? 0x38bdf8 : 0x86efac;
      const ring = this.add.circle(n.x, n.y, 20, color, 0.12).setDepth(9);
      const icon = this.add.circle(n.x, n.y, 8, color, 0.95).setDepth(10);
      this.tweens.add({
        targets: ring,
        alpha: { from: 0.1, to: 0.34 },
        scale: { from: 0.9, to: 1.2 },
        yoyo: true,
        repeat: -1,
        duration: 780
      });
      this.pickups.push({ ...n, collected: false, icon, ring });
    }
  }

  private tryCollectPickups() {
    for (const p of this.pickups) {
      if (p.collected) continue;
      if (Phaser.Math.Distance.Between(this.hero.x, this.hero.y, p.x, p.y) > 28) continue;

      p.collected = true;
      p.icon.destroy();
      p.ring.destroy();
      this.collectedPickups += 1;
      AudioManager.playPickup(p.kind === 'material' ? 'material' : 'item');
      this.showNotice(`Collected ${p.kind} node (${this.collectedPickups}/${this.pickups.length}).`, '#a7f3d0');
      this.pickupSummaryText.setText(`Exploration pickups: ${this.collectedPickups}/${this.pickups.length}`);
    }
  }

  private updateResidents(dt: number) {
    for (const npc of this.residents) {
      const dx = npc.targetX - npc.sprite.x;
      const dy = npc.targetY - npc.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 8) {
        npc.targetX = Phaser.Math.Between(npc.minX, npc.maxX);
        npc.targetY = Phaser.Math.Between(npc.minY, npc.maxY);
        continue;
      }

      npc.sprite.x += (dx / dist) * npc.speed * dt;
      npc.sprite.y += (dy / dist) * npc.speed * dt;
    }
  }

  private createHud(width: number, _height: number) {
    const panel = this.add.rectangle(12, 12, 560, 126, 0x020617, 0.88)
      .setOrigin(0, 0)
      .setDepth(40)
      .setScrollFactor(0);
    panel.setStrokeStyle(1, 0x334155, 1);

    this.add.text(24, 20, `${SANCTUARY_NAMESETS.regionCasual} Overworld`, {
      color: '#f8fafc',
      fontSize: '20px',
      fontStyle: 'bold'
    }).setDepth(41).setScrollFactor(0);

    this.helpText = this.add.text(24, 46, 'Move: WASD/Arrows  E: Interact/Travel  M: Map View  I: Inventory  Shift: Chat  1/2/3: Camera', {
      color: '#cbd5e1',
      fontSize: '11px'
    }).setDepth(41).setScrollFactor(0);

    this.districtText = this.add.text(24, 64, '', {
      color: '#93c5fd',
      fontSize: '11px'
    }).setDepth(41).setScrollFactor(0);

    this.pickupSummaryText = this.add.text(24, 82, `Exploration pickups: ${this.collectedPickups}/${this.pickups.length}`, {
      color: '#a7f3d0',
      fontSize: '11px'
    }).setDepth(41).setScrollFactor(0);

    this.noticeText = this.add.text(width / 2, 16, '', {
      color: '#a7f3d0',
      fontSize: '12px',
      backgroundColor: '#052e16'
    }).setOrigin(0.5, 0).setPadding(8, 4).setDepth(41).setScrollFactor(0);

    this.compassContainer = this.add.container(width - 128, 72).setDepth(42).setScrollFactor(0);
    const compassBg = this.add.circle(0, 0, 34, 0x0b1326, 0.9).setStrokeStyle(1, 0x475569, 1);
    this.compassNeedle = this.add.triangle(0, 0, 0, -20, 6, 6, -6, 6, 0xf87171, 1);
    const nText = this.add.text(-5, -29, 'N', { color: '#f8fafc', fontSize: '10px', fontStyle: 'bold' });
    const eText = this.add.text(23, -5, 'E', { color: '#94a3b8', fontSize: '10px' });
    const sText = this.add.text(-4, 19, 'S', { color: '#94a3b8', fontSize: '10px' });
    const wText = this.add.text(-31, -5, 'W', { color: '#94a3b8', fontSize: '10px' });
    this.compassContainer.add([compassBg, this.compassNeedle, nText, eText, sText, wText]);

    this.guideArrow = this.add.triangle(width / 2, 86, 0, -10, 8, 8, -8, 8, 0x22d3ee, 1)
      .setDepth(42)
      .setScrollFactor(0);
    this.guideText = this.add.text(width / 2, 98, '', {
      color: '#67e8f9',
      fontSize: '11px',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(42).setScrollFactor(0);

    this.mapModeText = this.add.text(width / 2, 40, 'MAP VIEW', {
      color: '#fef08a',
      fontSize: '12px',
      fontStyle: 'bold',
      backgroundColor: '#1f2937'
    }).setOrigin(0.5, 0).setPadding(7, 3).setDepth(43).setScrollFactor(0).setVisible(false);

    this.updateDistrictLabel();
  }

  private updateRoutePrompt() {
    this.activePointIndex = -1;
    for (let i = 0; i < this.routePoints.length; i += 1) {
      const p = this.routePoints[i];
      const near = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, p.x, p.y) < 46;
      p.marker.setFillStyle(near ? 0xfbbf24 : 0x22d3ee, 0.92);
      if (near) this.activePointIndex = i;
    }

    if (this.activePointIndex >= 0) {
      const p = this.routePoints[this.activePointIndex];
      this.helpText.setText(`Near ${p.title}. Press E to ${p.connectScene ? 'travel' : 'inspect route'}.`);
    } else {
      this.helpText.setText('Move: WASD/Arrows  E: Interact/Travel  M: Map View  I: Inventory  Shift: Chat  1/2/3: Camera');
    }
  }

  private updateDistrictLabel() {
    const x = this.hero?.x ?? 0;
    const y = this.hero?.y ?? 0;

    let district = 'Greenwood Approach';
    if (x > 860 && x < 1720 && y > 720 && y < 1400) district = 'Towne Mixed Core';
    if (x >= 1720 && y > 700) district = 'Dock and Fishers District';
    if (y < 650 && x > 1150) district = 'Northwatch and Overlook Ridge';
    this.districtText.setText(`District: ${district}`);
  }

  private tryRouteInteraction() {
    if (this.activePointIndex < 0) {
      this.showNotice('No route marker nearby.', '#cbd5e1');
      return;
    }

    const p = this.routePoints[this.activePointIndex];
    AudioManager.playPickup('item');

    if (p.id === 'saltroot_landgate' && this.selectedMainlandMode === 'land_crossing') {
      this.registry.set('selectedMainlandRouteCheckpoint', 'landgate_confirmed');
      this.showNotice(`Land crossing ready: ${this.selectedMainlandKingdom || 'aldermarch'} route staged at Saltroot Landgate.`, '#a7f3d0');
      return;
    }

    if (p.id === 'southferry_manifest' && this.selectedMainlandMode === 'boat_passage') {
      this.registry.set('selectedMainlandRouteCheckpoint', 'manifest_confirmed');
      this.showNotice(`Boat passage confirmed: ${this.selectedMainlandKingdom || 'mainland'} departure manifest signed.`, '#a7f3d0');
      return;
    }

    if (p.connectScene) {
      this.showNotice(`Traveling: ${p.title}`, '#93c5fd');
      this.time.delayedCall(180, () => this.scene.start(p.connectScene as string));
      return;
    }

    this.showNotice(`${p.title}: ${p.subtitle}`, '#bfdbfe');
  }

  private showNotice(text: string, color: string) {
    this.noticeText.setText(text);
    this.noticeText.setColor(color);
  }

  private toggleMapView() {
    this.mapView = !this.mapView;
    const cam = this.cameras.main;

    if (this.mapView) {
      cam.stopFollow();
      cam.centerOn(1300, 850);
      cam.setZoom(0.44);
      this.mapModeText?.setVisible(true);
      this.compassContainer?.setVisible(false);
      this.guideArrow?.setVisible(false);
      this.guideText?.setVisible(false);
      this.showNotice('Map view open. Press M to return to travel view.', '#fde68a');
      return;
    }

    cam.startFollow(this.hero, true, 0.1, 0.1, -8, 58);
    this.setCameraZoom(this.cameraZoom);
    this.mapModeText?.setVisible(false);
    this.compassContainer?.setVisible(true);
    this.guideArrow?.setVisible(true);
    this.guideText?.setVisible(true);
    const objective = this.routePoints.find((point) => point.id === this.objectivePointId);
    const objectiveLabel = objective?.title ?? SANCTUARY_NAMESETS.greenwoodClearing;
    this.showNotice(`Travel view restored. Route objective: ${objectiveLabel}.`, '#93c5fd');
  }

  private updateNavigationIndicator() {
    const objective = this.routePoints.find((p) => p.id === this.objectivePointId);
    if (!objective) return;

    const dx = objective.x - this.hero.x;
    const dy = objective.y - this.hero.y;
    const distance = Math.round(Math.sqrt(dx * dx + dy * dy));
    const angle = Math.atan2(dy, dx);

    if (this.compassNeedle) {
      this.compassNeedle.rotation = angle + Math.PI / 2;
    }
    if (this.guideArrow) {
      this.guideArrow.rotation = angle + Math.PI / 2;
    }
    if (this.guideText) {
      this.guideText.setText(`Guide: ${objective.title} (${distance}m)`);
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

    const items: InventoryItem[] = (this.registry.get('inventory') as InventoryItem[]) || [
      { id: 'travel-ration', name: 'Travel Ration', equipped: false },
      { id: 'field-bandage', name: 'Field Bandage', equipped: false },
    ];
    const playerLevel = Number(this.registry.get('currentCrownLevel') || this.registry.get('playerLevel') || this.registry.get('level') || 1);
    new InventoryMenu(items, (updated) => this.registry.set('inventory', updated), { playerLevel }).attach(container);
  }

  private openChatMenu() {
    const container = document.getElementById('game');
    if (!container) return;
    openGameChatOverlay({
      container,
      sceneLabel: 'Sanctuary Isle',
      scopeKey: 'sanctuary-isle-overworld',
      registry: this.registry,
    });
  }

  private initializeDockWelcomeSign() {
    /**
     * Create the dock welcome sign at SouthFerry Dock.
     * The sign appears above the dock, pointing to major locations.
     */
    this.welcomeSign = new DockWelcomeSign(this);
    
    // Position sign above the dock (screen coordinates, not world)
    // Using camera-relative positioning to appear on-screen
    const dockWorldX = 2140;
    const dockWorldY = 980;
    
    // Create sign in world space above dock
    this.welcomeSign.create(dockWorldX, dockWorldY - 180);
    
    // Add gentle sway animation
    this.welcomeSign.addSwayAnimation(4000);
    
    // Show welcome message on first visit
    if (!this.registry.get('dockSignSeen')) {
      this.time.delayedCall(800, () => {
        this.welcomeSign?.showWelcomeMessage();
      });
      this.registry.set('dockSignSeen', true);
    }
  }

  private updateDockSignVisibility() {
    /**
     * Toggle welcome sign visibility based on hero proximity to dock.
     * Sign appears when hero is within 300 units of the dock.
     */
    if (!this.welcomeSign) return;

    const dockX = 2140;
    const dockY = 980;
    const proximityRadius = 300;
    const distanceToDock = Phaser.Math.Distance.Between(
      this.hero.x,
      this.hero.y,
      dockX,
      dockY
    );

    // Show sign when nearby dock
    const shouldShow = distanceToDock < proximityRadius;
    if (shouldShow !== this.welcomeSign.isVisible()) {
      this.welcomeSign.setVisible(shouldShow);
    }
  }
}