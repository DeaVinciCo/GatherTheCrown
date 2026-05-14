import Phaser from 'phaser';

/**
 * RouteTestHarness: Quick-boot scene for playtesting individual routes.
 * 
 * Skips: intro, account creation, forge, Haven setup.
 * Boots directly into chosen route for rapid feel tuning.
 * 
 * Activated via 'D' key from MainMenu (dev-only mode).
 */
export default class RouteTestHarness extends Phaser.Scene {
  constructor() {
    super('RouteTestHarness');
  }

  private ensureMenuInputFocus() {
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

  create() {
    this.ensureMenuInputFocus();
    this.registry.set('routeTestHarnessMode', true);

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0b1020, 0x111827, 0x1f2937, 0x0f172a, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(centerX, 60, 'Route Test Harness', {
      color: '#fbbf24',
      fontSize: '32px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, 100, 'Dev Mode: Boot directly into each route', {
      color: '#93c5fd',
      fontSize: '14px'
    }).setOrigin(0.5).setAlpha(0.8);

    // Route buttons
    const routes: Array<{ id: 'gentle' | 'rider' | 'sovereign'; label: string; color: string; y: number }> = [
      { id: 'gentle', label: 'Gentle Trail', color: '#86efac', y: 200 },
      { id: 'rider', label: "Rider's Path", color: '#93c5fd', y: 280 },
      { id: 'sovereign', label: 'Sovereign Thicket', color: '#d8b4fe', y: 360 }
    ];

    for (const route of routes) {
      this.createRouteButton(centerX, route.y, route.id, route.label, route.color);
    }

    this.createCameraShowcaseButton(centerX, 430);

    // Return button
    this.createReturnButton(centerX, 500);

    // Footer hint
    this.add.text(centerX, height - 40, 'ESC to exit route and return here', {
      color: '#64748b',
      fontSize: '10px'
    }).setOrigin(0.5);

    // ESC key handler: return to harness from ForestZone, or main menu from harness
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MainMenu');
    });
  }

  private createRouteButton(
    x: number,
    y: number,
    routeId: 'gentle' | 'rider' | 'sovereign',
    label: string,
    color: string
  ) {
    const box = this.add.rectangle(x, y, 280, 56, 0x1f2937, 0.8)
      .setStrokeStyle(2, color, 0.9)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y - 4, label, {
      color,
      fontSize: '20px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const infoText = this.add.text(x, y + 12, this.getRouteInfo(routeId), {
      color: '#cbd5e1',
      fontSize: '9px'
    }).setOrigin(0.5);

    const bootRoute = () => {
      this.bootIntoRoute(routeId);
    };

    box.on('pointerdown', bootRoute);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', bootRoute);

    box.on('pointerover', () => box.setFillStyle(0x1f2937, 1));
    box.on('pointerout', () => box.setFillStyle(0x1f2937, 0.8));
  }

  private createReturnButton(x: number, y: number) {
    const box = this.add.rectangle(x, y, 200, 48, 0x334155, 0.7)
      .setStrokeStyle(2, 0x94a3b8, 0.7)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, 'Return to Main Menu', {
      color: '#e2e8f0',
      fontSize: '16px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const doReturn = () => {
      this.registry.set('routeTestHarnessMode', false);
      this.scene.start('MainMenu');
    };

    box.on('pointerdown', doReturn);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', doReturn);

    box.on('pointerover', () => box.setFillStyle(0x334155, 0.9));
    box.on('pointerout', () => box.setFillStyle(0x334155, 0.7));
  }

  private createCameraShowcaseButton(x: number, y: number) {
    const box = this.add.rectangle(x, y, 320, 48, 0x0f3b2f, 0.84)
      .setStrokeStyle(2, 0x34d399, 0.9)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y - 6, 'Open Camera Showcase', {
      color: '#86efac',
      fontSize: '18px',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const info = this.add.text(x, y + 11, 'Compare wide, default, close, and cinematic views', {
      color: '#d1fae5',
      fontSize: '9px'
    }).setOrigin(0.5);

    const openScene = () => this.scene.start('CameraShowcase');

    box.on('pointerdown', openScene);
    text.setInteractive({ useHandCursor: true }).on('pointerdown', openScene);
    info.setInteractive({ useHandCursor: true }).on('pointerdown', openScene);

    box.on('pointerover', () => box.setFillStyle(0x14532d, 0.95));
    box.on('pointerout', () => box.setFillStyle(0x0f3b2f, 0.84));
  }

  private getRouteInfo(routeId: 'gentle' | 'rider' | 'sovereign'): string {
    const info: Record<string, string> = {
      gentle: '~9m · low pressure · forgiving',
      rider: '~14m · balanced · default',
      sovereign: '~20m · tight pressure · rewarding'
    };
    return info[routeId] || '';
  }

  private bootIntoRoute(routeId: 'gentle' | 'rider' | 'sovereign') {
    this.ensureMenuInputFocus();

    // Seed minimal progression state for quick route testing.
    this.registry.merge({
      hasStartedGame: true,
      dayOneTasksComplete: true,
      dayTwoTasksComplete: true,
      homeBaseReadinessGate: true,
      storyIntroComplete: true,
      currentCrownLevel: 1,
      gold: 150,
      currentXp: 0,
      prepXP: 20,
      isCrownCarrier: false,
      hasHatchedCreat: false,
      hasCreatEgg: false,
      creatElement: 'Fire',
      creatSpecies: 'Ember Fox',
      creatBond: 0
    });

    this.registry.set('routeTestHarnessMode', true);

    // Set the route ID and boot into ForestZone
    this.registry.set('forestTrialRouteId', routeId);
    this.scene.start('ForestZone');
  }
}
