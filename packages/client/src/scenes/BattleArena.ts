import Phaser from 'phaser';
import { calculateReadinessBonus, loadReadinessState } from '../systems/PreBattleReadiness';
import { applyNeedsRewards, assessHeroCreatNeeds, type NeedsAssessment } from '../systems/HeroCreatNeedsTracker';

export default class BattleArena extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Sprite;
  private opponent!: Phaser.GameObjects.Sprite;
  private heroHp = 100;
  private oppHp = 100;
  private heroMaxHp = 100;
  private oppMaxHp = 100;
  private heroHpBar!: Phaser.GameObjects.Image;
  private oppHpBar!: Phaser.GameObjects.Image;
  private heroHpText!: Phaser.GameObjects.Text;
  private oppHpText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private attackCooldown = 0;
  private oppAttackTimer = 1200;
  private round = 1;
  private timer = 60;
  private done = false;
  private firstAidPack?: Phaser.GameObjects.Sprite;
  private firstAidLabel?: Phaser.GameObjects.Text;
  private firstAidTimer = 9000;
  private damageMultiplier = 1;
  private incomingDamageMultiplier = 1;
  private prepAssessment?: NeedsAssessment;

  constructor() {
    super('BattleArena');
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.applyArenaPrep();

    // Arena floor
    for (let tx = 0; tx < W; tx += 32)
      for (let ty = 0; ty < H; ty += 32)
        this.add.image(tx + 16, ty + 16, 'stone').setDepth(0);
    this.add.rectangle(W / 2, H / 2, W, H, 0x1e1b4b, 0.5).setDepth(1);

    // Arena divider
    this.add.rectangle(W / 2, H / 2, 4, H * 0.6, 0x6366f1, 0.4).setDepth(2);
    this.add.circle(W / 2, H / 2, 80, 0x312e81, 0.35).setDepth(2);

    // Heroes
    this.hero = this.add.sprite(W * 0.25, H / 2, 'hero').setDepth(3).setScale(2);
    this.opponent = this.add.sprite(W * 0.75, H / 2, 'enemy').setDepth(3).setScale(2).setFlipX(true);

    // HUD - top area
    this.add.rectangle(W / 2, 30, W, 60, 0x0f172a, 0.9).setDepth(9);

    // Hero HP bar (left)
    const heroName = this.registry.get('heroName') || 'Hero';
    this.add.image(W * 0.25 - 50, 24, 'hpbg').setDepth(9).setDisplaySize(200, 14).setOrigin(0, 0.5);
    this.heroHpBar = this.add.image(W * 0.25 - 50, 24, 'hpfill').setDepth(10).setDisplaySize(200, 14).setOrigin(0, 0.5).setTint(0x22c55e);
    this.heroHpText = this.add.text(W * 0.25, 24, `${heroName} ${this.heroHp}/${this.heroMaxHp}`, {
      color: '#86efac', fontSize: '13px'
    }).setOrigin(0.5).setDepth(11);

    // Opponent HP bar (right)
    this.add.image(W * 0.75 - 50, 24, 'hpbg').setDepth(9).setDisplaySize(200, 14).setOrigin(0, 0.5);
    this.oppHpBar = this.add.image(W * 0.75 - 50, 24, 'hpfill').setDepth(10).setDisplaySize(200, 14).setOrigin(0, 0.5).setTint(0xef4444);
    this.oppHpText = this.add.text(W * 0.75, 24, `CPU Rival  ${this.oppHp}/${this.oppMaxHp}`, {
      color: '#fca5a5', fontSize: '13px'
    }).setOrigin(0.5).setDepth(11);

    // Round / Timer
    this.roundText = this.add.text(W / 2, 14, `Round ${this.round}`, {
      color: '#fbbf24', fontSize: '15px', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);
    this.timerText = this.add.text(W / 2, 34, `⏱ ${Math.ceil(this.timer)}`, {
      color: '#d1d5db', fontSize: '13px'
    }).setOrigin(0.5).setDepth(11);

    const prepLine = this.prepAssessment
      ? `Prep ${this.prepAssessment.readinessScore}% · Critical ${this.prepAssessment.criticalMetCount}/${this.prepAssessment.criticalTotal}`
      : 'Prep unavailable';
    this.add.text(W / 2, 52, prepLine, {
      color: this.prepAssessment && this.prepAssessment.missingCritical.length === 0 ? '#86efac' : '#fde68a',
      fontSize: '10px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    // Controls
    this.add.text(W / 2, H - 20, 'SPACE/Click to ATTACK  •  Click first-aid to heal', { color: '#6b7280', fontSize: '12px' }).setOrigin(0.5).setDepth(10);
    const backBtn = this.add.text(10, H - 26, '← Haven', { color: '#93c5fd', fontSize: '13px' })
      .setDepth(10).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('HavenGrounds'));

    // Input
    this.input.keyboard?.on('keydown-SPACE', () => this.heroAttack());
    this.input.on('pointerdown', () => this.heroAttack());

    // Timer countdown
    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.done) return;
      this.timer -= 1;
      this.timerText.setText(`⏱ ${Math.ceil(this.timer)}`);
      if (this.timer <= 0) this.endRound();
    }});
  }

  private spawnFirstAidPack() {
    if (this.done || this.heroHp >= this.heroMaxHp || this.firstAidPack?.active) return;
    const W = this.scale.width;
    const H = this.scale.height;
    const x = Phaser.Math.Between(Math.floor(W * 0.15), Math.floor(W * 0.35));
    const y = H * 0.65;
    this.firstAidPack = this.add.sprite(x, y, 'ember-fruit').setDepth(12).setScale(1.05).setInteractive({ useHandCursor: true });
    this.firstAidLabel = this.add.text(x, y - 18, 'First Aid +18', { color: '#bbf7d0', fontSize: '10px' }).setOrigin(0.5).setDepth(12);
    this.tweens.add({ targets: this.firstAidPack, y: y - 4, yoyo: true, repeat: -1, duration: 700 });
    this.firstAidPack.on('pointerdown', () => this.consumeFirstAidPack());
  }

  private consumeFirstAidPack() {
    if (!this.firstAidPack?.active || this.done) return;
    this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 18);
    const pct = this.heroHp / this.heroMaxHp;
    this.heroHpBar.setDisplaySize(Math.max(1, 200 * pct), 14);
    const tint = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xfbbf24 : 0xef4444;
    this.heroHpBar.setTint(tint);
    this.heroHpText.setText(`${this.registry.get('heroName') || 'Hero'}  ${this.heroHp}/${this.heroMaxHp}`);
    this.showFloat(this.firstAidPack.x, this.firstAidPack.y - 20, '+18', '#86efac');
    this.firstAidPack.destroy();
    this.firstAidLabel?.destroy();
    this.firstAidPack = undefined;
    this.firstAidLabel = undefined;
    this.firstAidTimer = 11000;
  }

  private heroAttack() {
    if (this.done || this.attackCooldown > 0) return;
    this.attackCooldown = 700;
    const baseDmg = 12 + Math.floor(Math.random() * 10);
    const dmg = Math.max(1, Math.round(baseDmg * this.damageMultiplier));
    this.oppHp = Math.max(0, this.oppHp - dmg);
    this.showFloat(this.opponent.x, this.opponent.y - 40, `-${dmg}`, '#fcd34d');
    this.cameras.main.shake(60, 0.005);

    this.opponent.setTint(0xff8888);
    this.time.delayedCall(100, () => this.opponent.clearTint());

    const pct = this.oppHp / this.oppMaxHp;
    this.oppHpBar.setDisplaySize(Math.max(1, 200 * pct), 14);
    const tint = pct > 0.5 ? 0xef4444 : pct > 0.25 ? 0xfbbf24 : 0x22c55e;
    this.oppHpBar.setTint(tint);
    this.oppHpText.setText(`CPU Rival  ${this.oppHp}/${this.oppMaxHp}`);

    if (this.oppHp <= 0) this.winRound();
  }

  private oppAttack() {
    if (this.done) return;
    const baseDmg = 8 + Math.floor(Math.random() * 8);
    const dmg = Math.max(1, Math.round(baseDmg * this.incomingDamageMultiplier));
    this.heroHp = Math.max(0, this.heroHp - dmg);
    this.showFloat(this.hero.x, this.hero.y - 40, `-${dmg}`, '#f87171');

    this.hero.setTint(0xff4444);
    this.time.delayedCall(100, () => this.hero.clearTint());

    const pct = this.heroHp / this.heroMaxHp;
    this.heroHpBar.setDisplaySize(Math.max(1, 200 * pct), 14);
    const tint = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xfbbf24 : 0xef4444;
    this.heroHpBar.setTint(tint);
    this.heroHpText.setText(`${this.registry.get('heroName') || 'Hero'}  ${this.heroHp}/${this.heroMaxHp}`);

    if (this.heroHp <= 0) this.loseRound();
  }

  private winRound() {
    this.done = true;
    const W = this.scale.width, H = this.scale.height;
    this.cameras.main.flash(400, 255, 215, 0);
    this.showBig(W / 2, H / 2, '⚔ VICTORY! ⚔', '#fbbf24');
    this.registry.set('gold', (this.registry.get('gold') || 0) + 30);

    if (this.prepAssessment) {
      const reward = applyNeedsRewards(this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; }, this.prepAssessment, 'battle_arena');
      if (reward.granted) {
        this.add.text(W / 2, H / 2 + 46, `Prep Reward +${reward.prepXpGained} XP +${reward.goldGained} Gold`, {
          color: '#a7f3d0',
          fontSize: '13px',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);
      }
    }

    this.time.delayedCall(2500, () => this.scene.start('Haven'));
  }

  private loseRound() {
    this.done = true;
    const W = this.scale.width, H = this.scale.height;
    this.cameras.main.shake(400, 0.02);
    this.showBig(W / 2, H / 2, 'DEFEATED', '#ef4444');
    this.time.delayedCall(2500, () => this.scene.start('Haven'));
  }

  private endRound() {
    this.done = true;
    const W = this.scale.width, H = this.scale.height;
    const msg = this.heroHp > this.oppHp ? 'TIME UP — YOU WIN!' : this.oppHp > this.heroHp ? 'TIME UP — CPU WINS' : 'TIME UP — DRAW!';
    const color = this.heroHp > this.oppHp ? '#fbbf24' : '#9ca3af';
    this.showBig(W / 2, H / 2, msg, color);
    if (this.heroHp > this.oppHp) this.registry.set('gold', (this.registry.get('gold') || 0) + 15);
    this.time.delayedCall(2500, () => this.scene.start('Haven'));
  }

  private showFloat(x: number, y: number, text: string, color: string) {
    const t = this.add.text(x, y, text, { color, fontSize: '18px', fontStyle: 'bold', stroke: '#000', strokeThickness: 3 })
      .setOrigin(0.5).setDepth(12);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  private showBig(x: number, y: number, text: string, color: string) {
    this.add.text(x, y, text, {
      color, fontSize: '28px', fontStyle: 'bold', stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(20);
  }

  update(_t: number, delta: number) {
    if (this.done) return;
    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    if (!this.firstAidPack?.active && this.heroHp < this.heroMaxHp) {
      this.firstAidTimer -= delta;
      if (this.firstAidTimer <= 0) {
        this.firstAidTimer = 11000;
        this.spawnFirstAidPack();
      }
    }

    // CPU attacks on timer
    this.oppAttackTimer -= delta;
    if (this.oppAttackTimer <= 0) {
      this.oppAttackTimer = 1500 + Math.random() * 800;
      this.oppAttack();

      // CPU bobbing animation
      this.tweens.add({
        targets: this.opponent, x: this.opponent.x - 20,
        yoyo: true, duration: 80, ease: 'Power2'
      });
    }
  }

  private applyArenaPrep() {
    const readinessState = loadReadinessState(
      this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
      'battle_arena'
    );
    this.prepAssessment = assessHeroCreatNeeds(
      this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
      'arena'
    );

    const combinedReadiness = Math.max(readinessState?.readinessScore || 0, this.prepAssessment.readinessScore);
    const bonus = calculateReadinessBonus(combinedReadiness);
    this.damageMultiplier = bonus.damageMultiplier;
    this.incomingDamageMultiplier = Math.max(0.65, 1 - bonus.defenseBonus);

    if (this.prepAssessment.missingCritical.length > 0) {
      const missing = this.prepAssessment.missingCritical.length;
      this.heroHp = Math.max(40, Math.round(this.heroHp * (1 - missing * 0.04)));
      this.damageMultiplier = Math.max(0.8, this.damageMultiplier - 0.03 * missing);
      this.incomingDamageMultiplier = Math.min(1.25, this.incomingDamageMultiplier + 0.04 * missing);
    }
  }
}
