import Phaser from 'phaser';
import { updateAchievementRegistryFlags } from '../progression/achievements';
import { getRelationshipEffects } from '../systems/CreatBondSystem';
import { getCreatSpecies, getCreatSpeciesByName } from '../systems/CreatSpecies';

const RACE_DURATION = 60;        // seconds
const TRACK_LENGTH  = 3000;      // world units

export default class RaceCircuit extends Phaser.Scene {
  private heroX = 0;             // world position along track
  private speed = 300;           // pixels/sec
  private boostTimer = 0;
  private timeLeft = RACE_DURATION;
  private finished = false;
  private finishTime = 0;

  // Sprites
  private heroSprite!: Phaser.GameObjects.Sprite;
  private creatSprite?: Phaser.GameObjects.Sprite;
  private heroBobY = 0;
  private bobDir = 1;

  // Obstacles
  private obstacles: Array<{ x: number; sprite: Phaser.GameObjects.Rectangle }> = [];

  // Boost pickups
  private boosts: Array<{ worldX: number; sprite: Phaser.GameObjects.Sprite; collected: boolean }> = [];

  // HUD
  private timerText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Image;
  private medalText!: Phaser.GameObjects.Text;

  // Keyboard
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private shiftKey!: Phaser.Input.Keyboard.Key;

  constructor() { super('RaceCircuit'); }

  create() {
    const { width, height } = this.scale;
    const hasHatchedCreat = !!this.registry.get('hasHatchedCreat');
    const creatRunaway = !!this.registry.get('creatRunaway');
    const offensePoints = (this.registry.get('creatOffensePoints') as number) ?? 0;
    const relationship = getRelationshipEffects(offensePoints, creatRunaway);

    if (!hasHatchedCreat || !relationship.raceAllowed) {
      this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(20);
      this.add.text(width / 2, height / 2 - 24, 'Race Locked', {
        color: '#fca5a5', fontSize: '26px', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(21);
      this.add.text(width / 2, height / 2 + 6, creatRunaway
        ? 'Your creat has run off. Track it and rebuild trust before racing.'
        : 'You need a hatched creat to race.', {
        color: '#cbd5e1', fontSize: '13px', wordWrap: { width: 500 }, align: 'center'
      }).setOrigin(0.5).setDepth(21);
      const backBtn = this.add.text(width / 2, height / 2 + 46, '← Return to Haven', {
        color: '#fef9c3', fontSize: '14px', backgroundColor: '#3f2a14'
      }).setOrigin(0.5).setPadding(8, 4).setDepth(22).setInteractive({ useHandCursor: true });
      backBtn.on('pointerdown', () => this.scene.start('HavenGrounds'));
      return;
    }

    this.heroX = 0; this.speed = 300; this.boostTimer = 0;
    this.timeLeft = RACE_DURATION; this.finished = false; this.finishTime = 0;
    this.obstacles = []; this.boosts = [];

    // ── Background: stylised race track ─────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a192f, 0x0a192f, 0x131c29, 0x131c29, 1);
    bg.fillRect(0, 0, width, height);

    // Ground lane
    bg.fillStyle(0x374151, 1);
    bg.fillRect(0, height / 2 - 50, width, 100);
    bg.fillStyle(0x4b5563, 1);
    bg.fillRect(0, height / 2 + 42, width, 8);
    bg.fillRect(0, height / 2 - 50, width, 8);

    // Lane markers (scrolling handled in update)
    this.createLaneMarkers();

    // Crowds
    for (let i = 0; i < 18; i++) {
      const cx = Phaser.Math.Between(20, width - 20);
      const cy = Phaser.Math.Between(height / 2 - 90, height / 2 - 62);
      this.add.rectangle(cx, cy, 8, 14, 0x6d28d9, 0.7).setDepth(2);
    }
    for (let i = 0; i < 18; i++) {
      const cx = Phaser.Math.Between(20, width - 20);
      const cy = Phaser.Math.Between(height / 2 + 60, height / 2 + 90);
      this.add.rectangle(cx, cy, 8, 14, 0x1d4ed8, 0.7).setDepth(2);
    }

    // Title
    this.add.text(width / 2, 14, '⚡  CROWN RIDE CIRCUIT  ⚡', {
      color: '#fbbf24', fontSize: '18px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
    this.add.text(width / 2, 34, 'SPACE = jump/dodge  |  SHIFT = speed burst', {
      color: '#6b7280', fontSize: '11px'
    }).setOrigin(0.5).setDepth(10);

    // Hero sprite
    this.heroSprite = this.add.sprite(90, height / 2, 'hero').setDepth(6).setScale(1.4);
    // Creat companion appears only after hatch.
    if (this.registry.get('hasHatchedCreat')) {
      const element = (this.registry.get('creatElement') as string) || (this.registry.get('heroElement') as string) || 'Fire';
      this.creatSprite = this.add.sprite(58, height / 2, `creat-${element.toLowerCase()}`).setDepth(5).setScale(1.1);
    }

    // Relationship penalties from offense tiers reduce race effectiveness.
    this.speed = Math.floor(this.speed * relationship.travelSpeedMultiplier);

    // Obstacles placed at world x positions
    const obstacleWorldXs = [600, 900, 1100, 1400, 1650, 1900, 2200, 2500, 2700];
    for (const wx of obstacleWorldXs) {
      const oy = height / 2 + Phaser.Math.Between(-20, 20);
      const obs = this.add.rectangle(0, oy, 28, 44, 0xb45309, 1).setDepth(5);
      this.obstacles.push({ x: wx, sprite: obs });
    }

    // Boost pickups at world x positions
    const boostWorldXs = [400, 750, 1250, 1750, 2300];
    for (const wx of boostWorldXs) {
      const by = height / 2 + Phaser.Math.Between(-24, 24);
      const bs = this.add.sprite(0, by, 'gem-red').setDepth(5).setTint(0xfbbf24).setScale(0.9);
      this.boosts.push({ worldX: wx, sprite: bs, collected: false });
    }

    // Progress bar
    this.add.rectangle(width / 2, height - 22, 600, 12, 0x1f2937, 0.9).setDepth(10);
    this.add.text(width / 2 - 302, height - 22, '🏁 Start', { color: '#6b7280', fontSize: '10px' }).setOrigin(0, 0.5).setDepth(10);
    this.add.text(width / 2 + 300, height - 22, 'Finish 🏁', { color: '#6b7280', fontSize: '10px' }).setOrigin(1, 0.5).setDepth(10);
    this.progressBar = this.add.image(width / 2 - 297, height - 22, 'hpfill')
      .setDisplaySize(1, 12).setOrigin(0, 0.5).setDepth(11).setTint(0xfbbf24);

    // Hero progress dot
    this.add.circle = this.add.circle ?? (() => {}) as any;
    const heroDot = this.add.graphics().setDepth(12);
    (this as any)._heroDot = heroDot;

    // HUD
    this.timerText = this.add.text(10, height - 36, `Time: ${RACE_DURATION}s`, { color: '#fbbf24', fontSize: '15px', fontStyle: 'bold' }).setDepth(11);
    this.speedText = this.add.text(200, height - 36, 'Speed: Normal', { color: '#93c5fd', fontSize: '14px' }).setDepth(11);
    if (relationship.travelSpeedMultiplier < 1) {
      this.add.text(width / 2, 52, `Creat trust penalty active (${Math.round(relationship.travelSpeedMultiplier * 100)}% travel speed)`, {
        color: '#fca5a5', fontSize: '11px'
      }).setOrigin(0.5).setDepth(10);
    }
    this.medalText = this.add.text(width / 2, height - 36, 'Medal: --', { color: '#94a3b8', fontSize: '14px' }).setOrigin(0.5, 0).setDepth(11);

    // ── Circular Bond Gem (Race HUD) ────────────────────────────────────
    if (hasHatchedCreat && !creatRunaway) {
      const liveBond = (this.registry.get('creatBond') as number) ?? 0;
      const bondColors = [
        { min: 90, color: 0xfbbf24 }, { min: 75, color: 0x22c55e }, { min: 55, color: 0x3b82f6 },
        { min: 35, color: 0xa855f7 }, { min: 15, color: 0xf97316 }, { min: 0, color: 0xef4444 }
      ];
      const bondCol = (bondColors.find(b => liveBond >= b.min) ?? bondColors[bondColors.length - 1]).color;
      const gX = width - 42, gY = height - 42;
      const gR = 18;
      this.add.circle(gX, gY, gR + 3, 0x0a0f1e).setDepth(10);
      this.add.circle(gX, gY, gR, 0x0f172a).setDepth(10);
      const bondArc = this.add.graphics().setDepth(11);
      bondArc.lineStyle(4, bondCol, 0.9);
      bondArc.beginPath();
      bondArc.arc(gX, gY, gR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * liveBond / 100), false);
      bondArc.strokePath();
      this.add.circle(gX, gY, 6, bondCol, 0.8).setDepth(12);
      this.add.text(gX, gY, `${liveBond.toFixed(0)}`, { fontSize: '8px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(13);
      this.add.text(gX, gY + gR + 5, 'BOND', { fontSize: '7px', color: '#64748b' }).setOrigin(0.5).setDepth(10);
    }

    // Keyboard
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shiftKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Space dodge (upward jump)
    this.input.keyboard!.on('keydown-SPACE', () => this.doJump());
    this.input.on('pointerdown', () => this.doJump());

    // Back button
    const backBtn = this.add.text(8, height - 58, '← Haven', {
      color: '#d1d5db', fontSize: '13px', backgroundColor: '#1f2937', stroke: '#000', strokeThickness: 2
    }).setPadding(6, 3).setDepth(15).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('Haven'));
  }

  private laneMarkerGroup!: Phaser.GameObjects.Rectangle[];

  private createLaneMarkers() {
    const { width, height } = this.scale;
    this.laneMarkerGroup = [];
    for (let i = 0; i < 12; i++) {
      const m = this.add.rectangle(i * 80, height / 2, 48, 4, 0xfbbf24, 0.5).setDepth(3);
      this.laneMarkerGroup.push(m);
    }
  }

  private heroJumpY = 0;
  private jumping = false;

  private doJump() {
    if (this.jumping || this.finished) return;
    this.jumping = true;
    this.tweens.add({
      targets: this.heroSprite,
      y: this.heroSprite.y - 42,
      duration: 180,
      yoyo: true,
      onComplete: () => { this.jumping = false; }
    });
    if (this.creatSprite) {
      this.tweens.add({
        targets: this.creatSprite,
        y: this.creatSprite.y - 38,
        duration: 180,
        yoyo: true
      });
    }
  }

  update(time: number, delta: number) {
    if (this.finished) return;
    const dt = delta / 1000;
    const { width, height } = this.scale;

    // Timer
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.timerText.setText(`Time: ${this.timeLeft.toFixed(1)}s`);
    if (this.timeLeft <= 10) this.timerText.setColor('#ef4444');

    // SHIFT = speed burst
    if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.boostTimer <= 0) {
      this.boostTimer = 3; // 3 seconds
      this.speed = 520;
      this.showBoostFx();
    }
    if (this.boostTimer > 0) {
      this.boostTimer -= dt;
      if (this.boostTimer <= 0) { this.speed = 300; this.speedText.setText('Speed: Normal').setColor('#93c5fd'); }
      else this.speedText.setText('BOOST ACTIVE!').setColor('#fbbf24');
    }

    // Move hero forward
    this.heroX += this.speed * dt;

    // Lane markers scroll
    for (const m of this.laneMarkerGroup) {
      m.x -= this.speed * dt * 0.8;
      if (m.x < -48) m.x += 12 * 80;
    }

    // Obstacles — show at screen x based on world distance from hero
    for (const obs of this.obstacles) {
      const screenX = obs.x - this.heroX + 90;
      obs.sprite.setX(screenX);
      obs.sprite.setVisible(screenX > -40 && screenX < width + 40);

      // Collision (hero at screen x=90, not jumping)
      if (!this.jumping && Math.abs(screenX - 90) < 22 && Math.abs(obs.sprite.y - height / 2) < 28) {
        this.speed = Math.max(160, this.speed - 60);
        obs.sprite.setVisible(false); // remove obstacle
        this.cameras.main.shake(120, 0.012);
        this.showMessage('Hit an obstacle! Slow!', '#ef4444');
      }
    }

    // Boost pickups
    for (const b of this.boosts) {
      if (b.collected) continue;
      const screenX = b.worldX - this.heroX + 90;
      b.sprite.setX(screenX);
      b.sprite.setVisible(screenX > -40 && screenX < width + 40);
      if (Math.abs(screenX - 90) < 28 && Math.abs(b.sprite.y - height / 2) < 34) {
        b.collected = true; b.sprite.setVisible(false);
        this.boostTimer = 3; this.speed = 520;
        this.showMessage('Speed Gem! BOOST!', '#fbbf24');
      }
    }

    // Progress bar
    const progress = Math.min(1, this.heroX / TRACK_LENGTH);
    this.progressBar.setDisplaySize(Math.max(2, 594 * progress), 12);
    this.medalText.setText(progress >= 0.5 ? (this.timeLeft >= 20 ? 'Medal: 🥇 Rhodium pace' : this.timeLeft >= 10 ? 'Medal: 🥈 Nickel pace' : 'Medal: 🥉 Copper pace') : '');

    // Creat bobs
    if (this.creatSprite) this.creatSprite.x = this.heroSprite.x - 32;

    // Check finish
    if (this.heroX >= TRACK_LENGTH) {
      this.finishTime = RACE_DURATION - this.timeLeft;
      this.doFinish();
    }
    if (this.timeLeft <= 0) {
      this.finishTime = RACE_DURATION;
      this.doFinish();
    }
  }

  private showBoostFx() {
    const { width, height } = this.scale;
    const t = this.add.text(170, height / 2 - 50, '⚡ BOOST!', {
      color: '#fbbf24', fontSize: '24px', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
    }).setOrigin(0, 0.5).setDepth(20);
    this.tweens.add({ targets: t, alpha: 0, y: height / 2 - 80, duration: 900, onComplete: () => t.destroy() });
  }

  private showMessage(msg: string, color: string) {
    const t = this.add.text(this.scale.width / 2, this.scale.height / 2 - 60, msg, {
      color, fontSize: '17px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);
    this.tweens.add({ targets: t, y: this.scale.height / 2 - 90, alpha: 0, duration: 1500, onComplete: () => t.destroy() });
  }

  private doFinish() {
    if (this.finished) return;
    this.finished = true;
    const { width, height } = this.scale;

    const elapsed = this.finishTime;
    let medal = '🥉 Copper'; let goldReward = 15;
    if (elapsed <= 30) { medal = '🥇 Rhodium'; goldReward = 50; }
    else if (elapsed <= 45) { medal = '🥈 Nickel'; goldReward = 30; }

    this.registry.set('gold', (this.registry.get('gold') as number || 0) + goldReward);
    this.registry.set('racesWon', (this.registry.get('racesWon') as number || 0) + 1);
    updateAchievementRegistryFlags(this.registry);

    this.cameras.main.flash(600, 255, 220, 50);
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0).setDepth(22);
    this.tweens.add({ targets: overlay, alpha: 0.8, duration: 400, onComplete: () => {
      this.add.text(width / 2, height / 2 - 70, '🏁  RACE COMPLETE!  🏁', {
        color: '#fde68a', fontSize: '26px', fontStyle: 'bold', stroke: '#000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(23);
      this.add.text(width / 2, height / 2 - 30, `Medal: ${medal}`, {
        color: '#fbbf24', fontSize: '22px', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(23);
      this.add.text(width / 2, height / 2 + 8, `Time: ${elapsed.toFixed(1)}s   |   Reward: +${goldReward} Gold`, {
        color: '#94a3b8', fontSize: '15px'
      }).setOrigin(0.5).setDepth(23);

      if (this.registry.get('hasHatchedCreat')) {
          const element = ((this.registry.get('creatElement') as string) || (this.registry.get('heroElement') as string) || 'Fire');
          const selectedSpecies = (this.registry.get('creatSpecies') as string) || '';
          const cn = selectedSpecies ? getCreatSpeciesByName(element, selectedSpecies).species : getCreatSpecies(element).species;
        this.add.text(width / 2, height / 2 + 42, `"${cn} ran like the wind today."`, {
          color: '#c4b5fd', fontSize: '13px', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(23);
      } else {
        this.add.text(width / 2, height / 2 + 42, 'Find a Creat Egg in the Forest Trial and hatch it in Haven.', {
          color: '#93c5fd', fontSize: '13px', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(23);
      }

      const cont = this.add.text(width / 2, height / 2 + 82, '[ Click to return to Haven ]', {
        color: '#475569', fontSize: '14px'
      }).setOrigin(0.5).setDepth(23);
      this.tweens.add({ targets: cont, alpha: 0.3, yoyo: true, repeat: -1, duration: 700 });
      this.input.once('pointerdown', () => this.scene.start('HavenGrounds'));
    }});
  }
}
