import Phaser from 'phaser';

export interface CircleGemQuadrantStats {
  heroPct: number;
  heroLabel: string;
  resourcesPct: number;
  resourcesLabel: string;
  creatPct: number;
  creatLabel: string;
  combatPct: number;
  combatLabel: string;
}

interface QuadrantConfig {
  key: 'hero' | 'resources' | 'creat' | 'combat';
  title: string;
  color: number;
  titleColor: string;
  valueColor: string;
  titleFontFamily: string;
  valueFontFamily: string;
  titleFontSize: number;
  valueFontSize: number;
  titleFontStyle: string;
  valueFontStyle: string;
  titleRadius: number;
  valueRadius: number;
  start: number;
  end: number;
  titleStart: number;
  titleEnd: number;
  valueStart: number;
  valueEnd: number;
}

export class CircleGemQuadrantHUD extends Phaser.GameObjects.Container {
  private readonly radiusOuter = 84;
  private readonly radiusInner = 54;
  private readonly ringWidth = 14;
  private readonly coreRadius = 44;

  private readonly ringGraphics: Phaser.GameObjects.Graphics;
  private readonly separatorGraphics: Phaser.GameObjects.Graphics;
  private readonly coreDisc: Phaser.GameObjects.Arc;
  private readonly titleChars: Phaser.GameObjects.Text[] = [];
  private readonly valueChars: Record<'hero' | 'resources' | 'creat' | 'combat', Phaser.GameObjects.Text[]> = {
    hero: [],
    resources: [],
    creat: [],
    combat: [],
  };

  private readonly latestStats: CircleGemQuadrantStats = {
    heroPct: 0,
    heroLabel: '--',
    resourcesPct: 0,
    resourcesLabel: '--',
    creatPct: 0,
    creatLabel: '--',
    combatPct: 0,
    combatLabel: '--',
  };

  private readonly slidePanel: Phaser.GameObjects.Container;
  private readonly slideBg: Phaser.GameObjects.Rectangle;
  private readonly slideTitle: Phaser.GameObjects.Text;
  private readonly slideBody: Phaser.GameObjects.Text;
  private slideTween?: Phaser.Tweens.Tween;
  private hoveredQuadrant: QuadrantConfig['key'] | null = null;

  private readonly quads: QuadrantConfig[] = [
    {
      key: 'hero',
      title: 'HERO',
      color: 0xe11d48,
      titleColor: '#ffe4e6',
      valueColor: '#fecdd3',
      titleFontFamily: 'Trebuchet MS',
      valueFontFamily: 'Tahoma',
      titleFontSize: 10,
      valueFontSize: 9,
      titleFontStyle: 'bold',
      valueFontStyle: 'bold',
      titleRadius: 97,
      valueRadius: 52,
      start: Phaser.Math.DegToRad(180),
      end: Phaser.Math.DegToRad(270),
      titleStart: Phaser.Math.DegToRad(192),
      titleEnd: Phaser.Math.DegToRad(258),
      valueStart: Phaser.Math.DegToRad(208),
      valueEnd: Phaser.Math.DegToRad(242),
    },
    {
      key: 'resources',
      title: 'RESOURCES',
      color: 0x3b82f6,
      titleColor: '#dbeafe',
      valueColor: '#bfdbfe',
      titleFontFamily: 'Trebuchet MS',
      valueFontFamily: 'Tahoma',
      titleFontSize: 8,
      valueFontSize: 7,
      titleFontStyle: 'bold',
      valueFontStyle: 'bold',
      titleRadius: 95,
      valueRadius: 50,
      start: Phaser.Math.DegToRad(270),
      end: Phaser.Math.DegToRad(360),
      titleStart: Phaser.Math.DegToRad(282),
      titleEnd: Phaser.Math.DegToRad(348),
      valueStart: Phaser.Math.DegToRad(298),
      valueEnd: Phaser.Math.DegToRad(332),
    },
    {
      key: 'creat',
      title: 'CREAT',
      color: 0x8b5cf6,
      titleColor: '#ede9fe',
      valueColor: '#ddd6fe',
      titleFontFamily: 'Trebuchet MS',
      valueFontFamily: 'Tahoma',
      titleFontSize: 7,
      valueFontSize: 6,
      titleFontStyle: 'bold',
      valueFontStyle: 'bold',
      titleRadius: 93,
      valueRadius: 49,
      start: Phaser.Math.DegToRad(0),
      end: Phaser.Math.DegToRad(90),
      titleStart: Phaser.Math.DegToRad(14),
      titleEnd: Phaser.Math.DegToRad(76),
      valueStart: Phaser.Math.DegToRad(28),
      valueEnd: Phaser.Math.DegToRad(62),
    },
    {
      key: 'combat',
      title: 'COMBAT',
      color: 0xf59e0b,
      titleColor: '#fef3c7',
      valueColor: '#fde68a',
      titleFontFamily: 'Trebuchet MS',
      valueFontFamily: 'Tahoma',
      titleFontSize: 9,
      valueFontSize: 7,
      titleFontStyle: 'bold',
      valueFontStyle: 'bold',
      titleRadius: 96,
      valueRadius: 51,
      start: Phaser.Math.DegToRad(90),
      end: Phaser.Math.DegToRad(180),
      titleStart: Phaser.Math.DegToRad(102),
      titleEnd: Phaser.Math.DegToRad(168),
      valueStart: Phaser.Math.DegToRad(118),
      valueEnd: Phaser.Math.DegToRad(152),
    },
  ];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.setScrollFactor(0);
    this.setDepth(42);

    const outerFrame = scene.add.circle(0, 0, this.radiusOuter + 6, 0x0b1120, 0.95)
      .setStrokeStyle(4, 0xd4af37, 0.95);

    const innerFrame = scene.add.circle(0, 0, this.radiusOuter + 1, 0x14213d, 0.92)
      .setStrokeStyle(2, 0x9f7a1f, 0.85);

    this.ringGraphics = scene.add.graphics();
    this.separatorGraphics = scene.add.graphics();

    this.coreDisc = scene.add.circle(0, 0, this.coreRadius, 0x17233f, 0.96)
      .setStrokeStyle(2, 0xd4af37, 0.9);

    const coreLabel = scene.add.text(0, -6, 'CIRCLE\nGEM', {
      color: '#fef3c7',
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    const coreHint = scene.add.text(0, 20, 'GAUGE HUB', {
      color: '#cbd5e1',
      fontFamily: 'Trebuchet MS',
      fontSize: '8px',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    this.slideBg = scene.add.rectangle(0, 0, 184, 72, 0x111b2f, 0.92)
      .setStrokeStyle(2, 0xd4af37, 0.85)
      .setOrigin(0.5);

    this.slideTitle = scene.add.text(-82, -20, '', {
      color: '#f8fafc',
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.slideBody = scene.add.text(-82, 6, '', {
      color: '#e2e8f0',
      fontFamily: 'Trebuchet MS',
      fontSize: '10px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.slidePanel = scene.add.container(-(this.radiusOuter + 246), 0, [this.slideBg, this.slideTitle, this.slideBody]);
    this.slidePanel.setAlpha(0);

    this.add([
      outerFrame,
      innerFrame,
      this.ringGraphics,
      this.separatorGraphics,
      this.coreDisc,
      coreLabel,
      coreHint,
      this.slidePanel,
    ]);

    for (const quad of this.quads) {
      this.createCurvedText(quad.title, quad.titleStart, quad.titleEnd, quad.titleRadius, {
        color: quad.titleColor,
        fontFamily: quad.titleFontFamily,
        fontSize: `${quad.titleFontSize}px`,
        fontStyle: quad.titleFontStyle,
        stroke: '#0f172a',
        strokeThickness: 2,
      }, this.titleChars);
    }

    this.drawStaticSeparators();
    this.setStats(this.latestStats);

    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('gameout', this.hideSlidePanel, this);
    this.once(Phaser.GameObjects.Events.DESTROY, this.handleDestroy, this);

    scene.add.existing(this);
  }

  setStats(stats: CircleGemQuadrantStats) {
    this.latestStats.heroPct = stats.heroPct;
    this.latestStats.heroLabel = stats.heroLabel;
    this.latestStats.resourcesPct = stats.resourcesPct;
    this.latestStats.resourcesLabel = stats.resourcesLabel;
    this.latestStats.creatPct = stats.creatPct;
    this.latestStats.creatLabel = stats.creatLabel;
    this.latestStats.combatPct = stats.combatPct;
    this.latestStats.combatLabel = stats.combatLabel;

    const map = {
      hero: { pct: stats.heroPct, label: stats.heroLabel },
      resources: { pct: stats.resourcesPct, label: stats.resourcesLabel },
      creat: { pct: stats.creatPct, label: stats.creatLabel },
      combat: { pct: stats.combatPct, label: stats.combatLabel },
    } as const;

    this.ringGraphics.clear();

    for (const quad of this.quads) {
      const entry = map[quad.key];
      const pct = Phaser.Math.Clamp(entry.pct, 0, 1);

      this.ringGraphics.lineStyle(this.ringWidth, 0x233454, 0.95);
      this.ringGraphics.beginPath();
      this.ringGraphics.arc(0, 0, (this.radiusOuter + this.radiusInner) / 2, quad.start, quad.end, false);
      this.ringGraphics.strokePath();

      if (pct > 0) {
        const seg = quad.end - quad.start;
        this.ringGraphics.lineStyle(this.ringWidth, quad.color, 1);
        this.ringGraphics.beginPath();
        this.ringGraphics.arc(0, 0, (this.radiusOuter + this.radiusInner) / 2, quad.start, quad.start + seg * pct, false);
        this.ringGraphics.strokePath();
      }

      this.drawTicks(quad.start, quad.end, quad.color);

      this.valueChars[quad.key].forEach((ch) => ch.destroy());
      this.valueChars[quad.key] = [];

      const compactLabel = this.compactLabel(entry.label);
      const gaugeText = `${Math.round(pct * 100)}% ${compactLabel}`;
      this.createCurvedText(gaugeText, quad.valueStart, quad.valueEnd, quad.valueRadius, {
        color: quad.valueColor,
        fontFamily: quad.valueFontFamily,
        fontSize: `${quad.valueFontSize}px`,
        fontStyle: quad.valueFontStyle,
        stroke: '#0b1120',
        strokeThickness: 2,
      }, this.valueChars[quad.key]);
    }
  }

  private drawStaticSeparators() {
    this.separatorGraphics.clear();
    this.separatorGraphics.lineStyle(2, 0xd4af37, 0.9);

    for (const deg of [45, 135, 225, 315]) {
      const angle = Phaser.Math.DegToRad(deg);
      const x1 = Math.cos(angle) * (this.radiusInner - 2);
      const y1 = Math.sin(angle) * (this.radiusInner - 2);
      const x2 = Math.cos(angle) * (this.radiusOuter + 2);
      const y2 = Math.sin(angle) * (this.radiusOuter + 2);
      this.separatorGraphics.lineBetween(x1, y1, x2, y2);
    }
  }

  private drawTicks(start: number, end: number, color: number) {
    const stepCount = 6;
    const ringMid = (this.radiusOuter + this.radiusInner) / 2;
    for (let i = 1; i < stepCount; i += 1) {
      const t = i / stepCount;
      const angle = Phaser.Math.Linear(start, end, t);
      const x1 = Math.cos(angle) * (ringMid - 6);
      const y1 = Math.sin(angle) * (ringMid - 6);
      const x2 = Math.cos(angle) * (ringMid + 6);
      const y2 = Math.sin(angle) * (ringMid + 6);
      this.ringGraphics.lineStyle(1, color, 0.45);
      this.ringGraphics.lineBetween(x1, y1, x2, y2);
    }
  }

  private createCurvedText(
    text: string,
    startAngle: number,
    endAngle: number,
    radius: number,
    style: Phaser.Types.GameObjects.Text.TextStyle,
    sink: Phaser.GameObjects.Text[],
  ) {
    const chars = text.split('');

    for (let i = 0; i < chars.length; i += 1) {
      const t = chars.length <= 1 ? 0 : i / (chars.length - 1);
      const angle = Phaser.Math.Linear(startAngle, endAngle, t);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const charText = this.scene.add.text(x, y, chars[i], style).setOrigin(0.5);
      charText.setShadow(0, 1, '#020617', 2, true, true);

      // Keep each character tangent to the ring for a gauge-style arc readout.
      charText.setRotation(angle + Math.PI / 2);
      sink.push(charText);
      this.add(charText);
    }
  }

  private compactLabel(label: string) {
    const trimmed = (label ?? '').trim();
    if (trimmed.length <= 12) return trimmed.toUpperCase();
    return `${trimmed.slice(0, 11).toUpperCase()}…`;
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    const localX = pointer.worldX - this.x;
    const localY = pointer.worldY - this.y;
    const radius = Math.sqrt((localX * localX) + (localY * localY));

    if (radius < this.radiusInner - 12 || radius > this.radiusOuter + 18) {
      this.hideSlidePanel();
      return;
    }

    const angle = Phaser.Math.Angle.Normalize(Math.atan2(localY, localX));
    const quad = this.quads.find((q) => this.isAngleInArc(angle, q.start, q.end));

    if (!quad) {
      this.hideSlidePanel();
      return;
    }

    if (this.hoveredQuadrant !== quad.key) {
      this.hoveredQuadrant = quad.key;
      const current = this.getQuadSnapshot(quad.key);
      this.showSlidePanel(quad, current.label, current.pct);
    }
  }

  private isAngleInArc(angle: number, start: number, end: number) {
    if (start <= end) return angle >= start && angle <= end;
    return angle >= start || angle <= end;
  }

  private getQuadSnapshot(key: QuadrantConfig['key']) {
    if (key === 'hero') return { pct: this.latestStats.heroPct, label: this.latestStats.heroLabel };
    if (key === 'resources') return { pct: this.latestStats.resourcesPct, label: this.latestStats.resourcesLabel };
    if (key === 'creat') return { pct: this.latestStats.creatPct, label: this.latestStats.creatLabel };
    return { pct: this.latestStats.combatPct, label: this.latestStats.combatLabel };
  }

  private showSlidePanel(quad: QuadrantConfig, label: string, pct: number) {
    this.slideTitle.setText(quad.title);
    this.slideTitle.setColor(quad.titleColor);
    this.slideBody.setText(`${Math.round(Phaser.Math.Clamp(pct, 0, 1) * 100)}%  ${label}`);
    this.slideBody.setColor(quad.valueColor);
    this.slideBg
      .setStrokeStyle(2, quad.color, 0.95)
      .setFillStyle(0x111b2f, 0.94);

    this.slideTween?.stop();
    this.slideTween = this.scene.tweens.add({
      targets: this.slidePanel,
      x: -(this.radiusOuter + 152),
      alpha: 1,
      ease: 'Back.Out',
      duration: 210,
    });
  }

  private hideSlidePanel() {
    this.hoveredQuadrant = null;
    this.slideTween?.stop();
    this.slideTween = this.scene.tweens.add({
      targets: this.slidePanel,
      x: -(this.radiusOuter + 246),
      alpha: 0,
      ease: 'Cubic.In',
      duration: 150,
    });
  }

  private handleDestroy() {
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('gameout', this.hideSlidePanel, this);
    this.titleChars.forEach((ch) => ch.destroy());
    (Object.values(this.valueChars) as Phaser.GameObjects.Text[][]).forEach((list) => {
      list.forEach((ch) => ch.destroy());
    });
  }
}
