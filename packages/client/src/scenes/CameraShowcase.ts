import Phaser from 'phaser';

type CameraPresetId = 'wide' | 'adventure' | 'close' | 'cinematic';

interface CameraPreset {
  id: CameraPresetId;
  label: string;
  zoom: number;
  lerpX: number;
  lerpY: number;
  offsetX: number;
  offsetY: number;
  tint: number;
}

export default class CameraShowcase extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key };
  private cameraInfoText!: Phaser.GameObjects.Text;
  private activePreset: CameraPresetId = 'adventure';

  private readonly presets: CameraPreset[] = [
    { id: 'wide', label: '1) Wide Explorer', zoom: 0.92, lerpX: 0.08, lerpY: 0.08, offsetX: 0, offsetY: 36, tint: 0x7dd3fc },
    { id: 'adventure', label: '2) Adventure Default', zoom: 1.14, lerpX: 0.12, lerpY: 0.12, offsetX: -8, offsetY: 54, tint: 0x86efac },
    { id: 'close', label: '3) Close Combat', zoom: 1.34, lerpX: 0.16, lerpY: 0.16, offsetX: -12, offsetY: 72, tint: 0xfca5a5 },
    { id: 'cinematic', label: '4) Cinematic Offset', zoom: 1.2, lerpX: 0.06, lerpY: 0.06, offsetX: 80, offsetY: -12, tint: 0xc4b5fd }
  ];

  constructor() {
    super('CameraShowcase');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBounds(0, 0, 2200, 1400);

    this.drawWorldGrid();
    this.drawPointsOfInterest();

    this.hero = this.add.circle(360, 360, 14, 0xf8fafc, 1).setDepth(8);
    this.add.circle(360, 368, 18, 0x000000, 0.22).setDepth(4);

    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.keys = this.input.keyboard?.addKeys('W,A,S,D') as { w: Phaser.Input.Keyboard.Key; a: Phaser.Input.Keyboard.Key; s: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key };

    this.cameras.main.startFollow(this.hero, true, 0.12, 0.12, -8, 54);
    this.applyPreset('adventure');

    this.createUi(width, height);

    this.input.keyboard?.on('keydown-ONE', () => this.applyPreset('wide'));
    this.input.keyboard?.on('keydown-TWO', () => this.applyPreset('adventure'));
    this.input.keyboard?.on('keydown-THREE', () => this.applyPreset('close'));
    this.input.keyboard?.on('keydown-FOUR', () => this.applyPreset('cinematic'));
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('RouteTestHarness'));

    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      const delta = dy > 0 ? -0.03 : 0.03;
      const nextZoom = Phaser.Math.Clamp(this.cameras.main.zoom + delta, 0.82, 1.5);
      this.cameras.main.setZoom(nextZoom);
      this.refreshCameraReadout();
    });

    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => this.refreshCameraReadout()
    });
  }

  update(_time: number, delta: number) {
    const speed = 210;
    const dt = delta / 1000;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || this.keys.a?.isDown) vx -= speed;
    if (this.cursors.right?.isDown || this.keys.d?.isDown) vx += speed;
    if (this.cursors.up?.isDown || this.keys.w?.isDown) vy -= speed;
    if (this.cursors.down?.isDown || this.keys.s?.isDown) vy += speed;

    const x = Phaser.Math.Clamp(this.hero.x + vx * dt, 20, 2180);
    const y = Phaser.Math.Clamp(this.hero.y + vy * dt, 20, 1380);
    this.hero.setPosition(x, y);
  }

  private drawWorldGrid() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRect(0, 0, 2200, 1400);

    for (let x = 0; x <= 2200; x += 100) {
      graphics.lineStyle(1, 0x1e293b, 0.9);
      graphics.lineBetween(x, 0, x, 1400);
    }
    for (let y = 0; y <= 1400; y += 100) {
      graphics.lineStyle(1, 0x1e293b, 0.9);
      graphics.lineBetween(0, y, 2200, y);
    }

    for (let i = 0; i < 38; i += 1) {
      const x = 70 + i * 55;
      const y = 160 + Math.sin(i * 0.7) * 120;
      this.add.circle(x, y, 12, 0x22c55e, 0.28).setDepth(2);
    }
  }

  private drawPointsOfInterest() {
    const points = [
      { x: 220, y: 180, label: 'Start Camp', color: '#86efac' },
      { x: 690, y: 240, label: 'Fishing Bend', color: '#7dd3fc' },
      { x: 1080, y: 420, label: 'Combat Pocket', color: '#fca5a5' },
      { x: 1480, y: 620, label: 'Gathering Grove', color: '#fcd34d' },
      { x: 1760, y: 360, label: 'Shrine Marker', color: '#c4b5fd' },
      { x: 1960, y: 980, label: 'Return Portal', color: '#93c5fd' },
      { x: 420, y: 1120, label: 'Sanctuary Side', color: '#34d399' },
      { x: 1320, y: 1120, label: 'Egg Hint Zone', color: '#f59e0b' }
    ];

    for (const point of points) {
      const ringColor = Phaser.Display.Color.HexStringToColor(point.color).color;
      this.add.circle(point.x, point.y, 24, ringColor, 0.15).setDepth(3);
      this.add.circle(point.x, point.y, 9, ringColor, 0.95).setDepth(4);
      this.add.text(point.x, point.y - 30, point.label, {
        color: point.color,
        fontSize: '12px',
        fontStyle: 'bold'
      }).setDepth(5).setOrigin(0.5);
    }
  }

  private createUi(width: number, _height: number) {
    const panel = this.add.rectangle(16, 16, 376, 178, 0x020617, 0.84)
      .setOrigin(0, 0)
      .setDepth(30)
      .setScrollFactor(0);
    panel.setStrokeStyle(2, 0x334155, 1);

    this.add.text(28, 28, 'Camera Showcase Lab', {
      color: '#f8fafc',
      fontSize: '22px',
      fontStyle: 'bold'
    }).setDepth(31).setScrollFactor(0);

    this.add.text(28, 56, 'Compare view sizes and offsets on one scrolling scene.', {
      color: '#93c5fd',
      fontSize: '12px'
    }).setDepth(31).setScrollFactor(0);

    this.add.text(28, 80, 'Move: WASD/Arrows   Presets: 1 2 3 4   Wheel: fine zoom   ESC: back', {
      color: '#cbd5e1',
      fontSize: '11px'
    }).setDepth(31).setScrollFactor(0);

    this.cameraInfoText = this.add.text(28, 108, '', {
      color: '#f1f5f9',
      fontSize: '12px',
      lineSpacing: 4
    }).setDepth(31).setScrollFactor(0);

    const rightTip = this.add.text(width - 14, 16, 'Try preset 1 then 3 while walking into Combat Pocket.', {
      color: '#e2e8f0',
      fontSize: '11px',
      backgroundColor: '#111827'
    }).setOrigin(1, 0).setDepth(31).setScrollFactor(0).setPadding(8, 5);
    rightTip.setAlpha(0.9);
  }

  private applyPreset(id: CameraPresetId) {
    const preset = this.presets.find((entry) => entry.id === id);
    if (!preset) return;

    this.activePreset = id;
    const camera = this.cameras.main;

    camera.setLerp(preset.lerpX, preset.lerpY);
    camera.setZoom(preset.zoom);
    camera.startFollow(this.hero, true, preset.lerpX, preset.lerpY, preset.offsetX, preset.offsetY);
    camera.setBackgroundColor(preset.tint);

    this.refreshCameraReadout();
  }

  private refreshCameraReadout() {
    const camera = this.cameras.main;
    const preset = this.presets.find((entry) => entry.id === this.activePreset);
    if (!preset || !this.cameraInfoText) return;

    this.cameraInfoText.setText([
      `Preset: ${preset.label}`,
      `Zoom: ${camera.zoom.toFixed(2)}   Lerp: ${preset.lerpX.toFixed(2)}, ${preset.lerpY.toFixed(2)}`,
      `Offset: ${preset.offsetX}, ${preset.offsetY}   Hero: ${Math.round(this.hero.x)}, ${Math.round(this.hero.y)}`
    ]);
  }
}
