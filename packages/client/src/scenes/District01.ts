import Phaser from 'phaser';
import Weather, { WeatherCondition } from '../environment/Weather';

export default class District01 extends Phaser.Scene {
  private weather!: Weather;
  private conditions: WeatherCondition[] = ['clear', 'rain', 'snow', 'lightning'];
  private conditionIndex = 0;
  private dayDuration = 10000; // milliseconds for full cycle day -> night -> day
  private dayTime = 0;
  private goingToNight = true;
  private statusText!: Phaser.GameObjects.Text;
  private weatherText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private shrineUsed = false;
  private chestOpened = false;
  private vendorStock = 3;

  constructor() {
    super('District01');
  }

  create() {
    this.dayTime = 0;
    this.goingToNight = true;
    this.shrineUsed = false;
    this.chestOpened = false;
    this.vendorStock = 3;

    const { width, height } = this.scale;

    for (let tx = 0; tx < width; tx += 32) {
      for (let ty = 0; ty < height; ty += 32) {
        this.add.image(tx + 16, ty + 16, 'stone').setDepth(0);
      }
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0.35).setDepth(1);
    this.add.rectangle(width / 2, 28, width, 56, 0x111827, 0.92).setDepth(2);
    this.add.text(width / 2, 18, 'DISTRICT 01', {
      color: '#e5e7eb',
      fontSize: '24px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);

    this.weatherText = this.add.text(width / 2, 40, 'Weather: clear', {
      color: '#9ca3af',
      fontSize: '12px'
    }).setOrigin(0.5).setDepth(3);

    this.goldText = this.add.text(width - 14, 14, `Gold: ${this.registry.get('gold') || 0}`, {
      color: '#fbbf24',
      fontSize: '13px',
      fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(3);

    this.add.text(18, 70, 'Town Services', {
      color: '#93c5fd',
      fontSize: '14px',
      fontStyle: 'bold'
    }).setDepth(3);

    const vendorArea = this.add.rectangle(155, 205, 220, 170, 0x1f2937, 0.82)
      .setStrokeStyle(2, 0x38bdf8, 0.8)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    this.add.text(155, 152, 'Quartermaster', {
      color: '#7dd3fc',
      fontSize: '18px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);
    this.add.sprite(155, 215, 'hero').setScale(2.2).setTint(0x7dd3fc).setDepth(3);
    this.add.text(155, 268, 'Buy one healing ration\nfor 10 gold.', {
      color: '#cbd5e1',
      fontSize: '13px',
      align: 'center'
    }).setOrigin(0.5).setDepth(3);

    const shrineArea = this.add.rectangle(400, 205, 220, 170, 0x1e1b4b, 0.82)
      .setStrokeStyle(2, 0xa78bfa, 0.8)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    this.add.text(400, 152, 'Sky Shrine', {
      color: '#c4b5fd',
      fontSize: '18px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);
    const shrineCrystal = this.add.circle(400, 214, 32, 0xfde68a, 0.9).setDepth(3);
    this.tweens.add({ targets: shrineCrystal, y: 206, yoyo: true, repeat: -1, duration: 1200 });
    this.add.text(400, 268, 'Gain one free blessing\nworth 5 gold once per visit.', {
      color: '#ddd6fe',
      fontSize: '13px',
      align: 'center'
    }).setOrigin(0.5).setDepth(3);

    const chestArea = this.add.rectangle(645, 205, 220, 170, 0x3f1d2e, 0.82)
      .setStrokeStyle(2, 0xfb7185, 0.8)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    this.add.text(645, 152, 'Royal Cache', {
      color: '#fda4af',
      fontSize: '18px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);
    const chestBase = this.add.rectangle(645, 222, 72, 44, 0x78350f, 1).setDepth(3);
    const chestLid = this.add.rectangle(645, 198, 84, 20, 0x92400e, 1).setDepth(3);
    this.add.text(645, 268, 'Open once per visit for a\nsmall gold payout.', {
      color: '#fecdd3',
      fontSize: '13px',
      align: 'center'
    }).setOrigin(0.5).setDepth(3);

    const board = this.add.rectangle(width / 2, 405, 680, 130, 0x111827, 0.86)
      .setStrokeStyle(2, 0x4b5563, 0.8)
      .setDepth(2);
    this.add.text(width / 2, 360, 'Town Board', {
      color: '#f3f4f6',
      fontSize: '18px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);
    this.add.text(width / 2, 402, '1. Quartermaster buys and sells field rations.\n2. The Sky Shrine grants one blessing per district visit.\n3. The Royal Cache pays out once, then locks until you leave.', {
      color: '#cbd5e1',
      fontSize: '13px',
      align: 'center'
    }).setOrigin(0.5).setDepth(3);

    const havenBtn = this.add.text(width - 14, height - 24, 'Return to Haven', {
      color: '#93c5fd',
      fontSize: '14px',
      fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(3).setInteractive({ useHandCursor: true });
    havenBtn.on('pointerdown', () => this.scene.start('HavenGrounds'));

    this.statusText = this.add.text(18, height - 28, 'The district is open for business.', {
      color: '#9ca3af',
      fontSize: '12px'
    }).setDepth(3);

    vendorArea.on('pointerdown', () => {
      const gold = this.registry.get('gold') || 0;
      if (this.vendorStock <= 0) {
        this.setStatus('The quartermaster has sold out for now.', '#fca5a5');
        return;
      }
      if (gold < 10) {
        this.setStatus('Not enough gold for a ration.', '#fca5a5');
        return;
      }

      this.vendorStock -= 1;
      this.registry.set('gold', gold - 10);
      const inventory = [...((this.registry.get('inventory') || []) as Array<{ id: string; name: string; equipped: boolean }>)];
      inventory.push({
        id: `ration-${Date.now()}`,
        name: 'Healing Ration',
        equipped: false
      });
      this.registry.set('inventory', inventory);
      this.refreshGold();
      this.setStatus(`Bought a Healing Ration. Stock remaining: ${this.vendorStock}.`, '#86efac');
    });

    shrineArea.on('pointerdown', () => {
      if (this.shrineUsed) {
        this.setStatus('The shrine has already blessed you this visit.', '#c4b5fd');
        return;
      }

      this.shrineUsed = true;
      this.registry.set('gold', (this.registry.get('gold') || 0) + 5);
      this.registry.set('districtBlessing', 'Skyfire Ward');
      this.refreshGold();
      this.cameras.main.flash(220, 255, 244, 180);
      this.setStatus('Sky Shrine blessing gained: +5 gold and Skyfire Ward.', '#fde68a');
    });

    chestArea.on('pointerdown', () => {
      if (this.chestOpened) {
        this.setStatus('The Royal Cache is empty until the next visit.', '#fca5a5');
        return;
      }

      this.chestOpened = true;
      const payout = 8 + Phaser.Math.Between(0, 10);
      this.registry.set('gold', (this.registry.get('gold') || 0) + payout);
      this.refreshGold();
      this.tweens.add({ targets: chestLid, angle: -18, y: 188, duration: 220 });
      for (let index = 0; index < 5; index += 1) {
        const coin = this.add.image(645, 214, 'coin').setDepth(4);
        this.tweens.add({
          targets: coin,
          x: 645 + Phaser.Math.Between(-60, 60),
          y: 214 + Phaser.Math.Between(-50, 10),
          alpha: 0,
          duration: 650,
          delay: index * 80,
          onComplete: () => coin.destroy()
        });
      }
      this.setStatus(`Royal Cache opened: +${payout} gold.`, '#fbbf24');
    });

    this.weather = new Weather(this);
    this.cycleWeather();
  }

  private refreshGold() {
    this.goldText.setText(`Gold: ${this.registry.get('gold') || 0}`);
  }

  private setStatus(message: string, color: string) {
    this.statusText.setText(message);
    this.statusText.setColor(color);
  }

  private cycleWeather() {
    const current = this.conditions[this.conditionIndex];
    this.weather.setCondition(current);
    this.weatherText.setText(`Weather: ${current}`);
    this.conditionIndex = (this.conditionIndex + 1) % this.conditions.length;
    this.time.addEvent({ delay: 5000, callback: this.cycleWeather, callbackScope: this });
  }

  update(_time: number, delta: number) {
    // Update day/night progress
    this.dayTime += delta * (this.goingToNight ? 1 : -1);
    if (this.dayTime >= this.dayDuration) {
      this.dayTime = this.dayDuration;
      this.goingToNight = false;
    }
    if (this.dayTime <= 0) {
      this.dayTime = 0;
      this.goingToNight = true;
    }
    const progress = this.dayTime / this.dayDuration;
    this.weather.setTimeOfDay(progress);
  }
}
