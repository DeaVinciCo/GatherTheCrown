import Phaser from 'phaser';
import { updateAchievementRegistryFlags } from '../progression/achievements';
import { calculateReadinessBonus, loadReadinessState } from '../systems/PreBattleReadiness';
import { applyNeedsRewards, assessHeroCreatNeeds, type NeedsAssessment } from '../systems/HeroCreatNeedsTracker';

export default class CrownTrial01 extends Phaser.Scene {
  private boss!: Phaser.GameObjects.Sprite;
  private bossHp = 150;
  private bossMaxHp = 150;
  private bossHpBar!: Phaser.GameObjects.Image;
  private bossHpText!: Phaser.GameObjects.Text;
  private phase = 1;
  private heroHp = 100;
  private heroMaxHp = 100;
  private heroHpBar!: Phaser.GameObjects.Image;
  private heroHpText!: Phaser.GameObjects.Text;
  private attackCooldown = 0;
  private bossAttackTimer = 0;
  private done = false;
  private phaseLabel!: Phaser.GameObjects.Text;
  private damageTexts: { obj: Phaser.GameObjects.Text; }[] = [];
  private bossFireball?: Phaser.GameObjects.Sprite;
  private fireballActive = false;
  private healPotion?: Phaser.GameObjects.Sprite;
  private healPotionLabel?: Phaser.GameObjects.Text;
  private healPotionTimer = 6000;
  private damageMultiplier = 1;
  private incomingDamageMultiplier = 1;
  private prepAssessment?: NeedsAssessment;
  private prepStatusText?: Phaser.GameObjects.Text;

  constructor() {
    super('CrownTrial01');
  }

  create() {
    this.resetState();
    this.applyPreBattlePrep();

    const W = this.scale.width, H = this.scale.height;

    // Stone arena floor
    for (let tx = 0; tx < W; tx += 32)
      for (let ty = 36; ty < H; ty += 32)
        this.add.image(tx + 16, ty + 16, 'stone').setDepth(0);

    // Dramatic intro overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(20);
    const title = this.add.text(W / 2, H / 2 - 30, 'CROWN TRIAL I', {
      color: '#fbbf24', fontSize: '32px', fontStyle: 'bold', stroke: '#78350f', strokeThickness: 6
    }).setOrigin(0.5).setDepth(21);
    const sub = this.add.text(W / 2, H / 2 + 20, '⚔ Ember Reignlord ⚔', {
      color: '#fca5a5', fontSize: '20px'
    }).setOrigin(0.5).setDepth(21);
    const hint = this.add.text(W / 2, H / 2 + 60, 'Click or SPACE to attack', {
      color: '#9ca3af', fontSize: '15px'
    }).setOrigin(0.5).setDepth(21);

    this.time.delayedCall(2200, () => {
      this.tweens.add({ targets: [overlay, title, sub, hint], alpha: 0, duration: 500, onComplete: () => {
        overlay.destroy(); title.destroy(); sub.destroy(); hint.destroy();
        this.startBattle();
      }});
    });
  }

  private resetState() {
    this.bossHp = this.bossMaxHp;
    this.phase = 1;
    this.heroHp = this.heroMaxHp;
    this.attackCooldown = 0;
    this.bossAttackTimer = 1200;
    this.done = false;
    this.fireballActive = false;
    this.bossFireball = undefined;
    this.healPotion = undefined;
    this.healPotionLabel = undefined;
    this.healPotionTimer = 6000;
  }

  private startBattle() {
    const W = this.scale.width, H = this.scale.height;

    // Boss sprite — centered, large
    this.boss = this.add.sprite(W / 2, H / 2 - 40, 'boss').setDepth(3).setScale(2);
    this.tweens.add({ targets: this.boss, y: this.boss.y - 8, yoyo: true, repeat: -1, duration: 900 });

    // Boss HP UI
    this.add.rectangle(W / 2, 28, 360, 22, 0x1f2937, 0.9).setDepth(9);
    this.add.image(W / 2 - 180, 28, 'hpbg').setDepth(9).setDisplaySize(360, 14).setOrigin(0, 0.5);
    this.bossHpBar = this.add.image(W / 2 - 180, 28, 'hpfill').setDepth(10).setDisplaySize(360, 14).setOrigin(0, 0.5).setTint(0xef4444);
    this.bossHpText = this.add.text(W / 2, 28, `Ember Reignlord  ${this.bossHp}/${this.bossMaxHp}`, {
      color: '#fca5a5', fontSize: '13px'
    }).setOrigin(0.5).setDepth(11);
    this.phaseLabel = this.add.text(W / 2, 50, 'PHASE 1', { color: '#f97316', fontSize: '12px' }).setOrigin(0.5).setDepth(11);

    // Hero HP UI (bottom bar)
    const heroName = this.registry.get('heroName') || 'Hero';
    this.add.rectangle(W / 2, H - 22, 360, 22, 0x1f2937, 0.9).setDepth(9);
    this.add.image(W / 2 - 180, H - 22, 'hpbg').setDepth(9).setDisplaySize(360, 14).setOrigin(0, 0.5);
    this.heroHpBar = this.add.image(W / 2 - 180, H - 22, 'hpfill').setDepth(10).setDisplaySize(360, 14).setOrigin(0, 0.5).setTint(0x22c55e);
    this.heroHpText = this.add.text(W / 2, H - 22, `${heroName}  ${this.heroHp}/${this.heroMaxHp}`, {
      color: '#86efac', fontSize: '13px'
    }).setOrigin(0.5).setDepth(11);

    if (this.prepStatusText) {
      this.prepStatusText.destroy();
    }
    const prepLine = this.prepAssessment
      ? `Prep ${this.prepAssessment.readinessScore}% · Critical ${this.prepAssessment.criticalMetCount}/${this.prepAssessment.criticalTotal}`
      : 'Prep data unavailable';
    this.prepStatusText = this.add.text(W / 2, H - 44, prepLine, {
      color: this.prepAssessment && this.prepAssessment.missingCritical.length === 0 ? '#86efac' : '#fde68a',
      fontSize: '11px',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(11);

    // Controls hint
    this.add.text(10, H - 38, 'SPACE/Click: Attack  •  Click potion to heal', { color: '#6b7280', fontSize: '11px' }).setDepth(10);
    const backBtn = this.add.text(W - 10, H - 38, '← Haven', { color: '#93c5fd', fontSize: '12px' })
      .setOrigin(1, 0).setDepth(10).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('HavenGrounds'));

    // Boss fireball projectile
    this.bossFireball = this.add.sprite(-100, -100, 'fireball').setDepth(5).setVisible(false).setScale(1.5);

    // Input
    this.input.keyboard?.on('keydown-SPACE', () => this.heroAttack());
    this.input.on('pointerdown', () => this.heroAttack());
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('HavenGrounds'));
  }

  private spawnHealPotion() {
    if (this.done || this.heroHp >= this.heroMaxHp || this.healPotion?.active) return;
    const W = this.scale.width;
    const H = this.scale.height;
    const x = Phaser.Math.Between(Math.floor(W * 0.35), Math.floor(W * 0.65));
    const y = H - 92;
    this.healPotion = this.add.sprite(x, y, 'ember-fruit').setDepth(12).setScale(1.15).setInteractive({ useHandCursor: true });
    this.healPotionLabel = this.add.text(x, y - 18, 'Potion +20', { color: '#bbf7d0', fontSize: '10px' }).setOrigin(0.5).setDepth(12);
    this.tweens.add({ targets: this.healPotion, y: y - 5, yoyo: true, repeat: -1, duration: 700 });
    this.healPotion.on('pointerdown', () => this.consumeHealPotion());
  }

  private consumeHealPotion() {
    if (!this.healPotion?.active || this.done) return;
    this.heroHp = Math.min(this.heroMaxHp, this.heroHp + 20);
    const pct = this.heroHp / this.heroMaxHp;
    this.heroHpBar.setDisplaySize(Math.max(1, 360 * pct), 14);
    const tint = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xfbbf24 : 0xef4444;
    this.heroHpBar.setTint(tint);
    this.heroHpText.setText(`${this.registry.get('heroName') || 'Hero'}  ${this.heroHp}/${this.heroMaxHp}`);
    this.showFloat(this.healPotion.x, this.healPotion.y - 22, '+20', '#86efac', '16px');
    this.healPotion.destroy();
    this.healPotionLabel?.destroy();
    this.healPotion = undefined;
    this.healPotionLabel = undefined;
    this.healPotionTimer = 9000;
  }

  private heroAttack() {
    if (this.done || this.attackCooldown > 0) return;
    this.attackCooldown = 600;

    const W = this.scale.width;
    const baseDmg = 15 + Math.floor(Math.random() * 10) + (this.phase === 2 ? 5 : 0);
    const dmg = Math.max(1, Math.round(baseDmg * this.damageMultiplier));
    this.bossHp = Math.max(0, this.bossHp - dmg);
    this.showFloat(this.boss.x + Phaser.Math.Between(-20, 20), this.boss.y - 50, `-${dmg}`, '#fcd34d');
    this.cameras.main.shake(80, 0.006);

    // Boss hit flash
    this.boss.setTint(0xff8888);
    this.time.delayedCall(120, () => this.boss.setTint(this.phase === 2 ? 0xff4400 : 0xffffff));

    // Update boss HP bar
    const pct = this.bossHp / this.bossMaxHp;
    this.bossHpBar.setDisplaySize(Math.max(1, 360 * pct), 14);
    this.bossHpText.setText(`Ember Reignlord  ${this.bossHp}/${this.bossMaxHp}`);

    // Phase 2 trigger
    if (this.phase === 1 && this.bossHp <= this.bossMaxHp * 0.5) {
      this.phase = 2;
      this.boss.setTint(0xff4400);
      this.boss.setScale(2.3);
      this.phaseLabel.setText('PHASE 2 — ENRAGED').setColor('#ef4444');
      this.showFloat(W / 2, 150, '⚠ ENRAGED!', '#ef4444', '24px');
      this.cameras.main.shake(300, 0.015);
    }

    if (this.bossHp <= 0) this.bossDead();
  }

  private bossDead() {
    if (this.done) return;

    this.done = true;
    const W = this.scale.width, H = this.scale.height;
    this.boss.destroy();
    this.bossFireball?.destroy();
    this.fireballActive = false;

    // Victory flash
    this.cameras.main.flash(600, 255, 215, 0);
    const victory = this.add.text(W / 2, H / 2, '⚜ CROWN TRIAL COMPLETE ⚜', {
      color: '#fbbf24', fontSize: '26px', fontStyle: 'bold', stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(20);
    this.add.text(W / 2, H / 2 + 50, 'Crown Fragment obtained!', {
      color: '#86efac', fontSize: '18px'
    }).setOrigin(0.5).setDepth(20);
    this.add.text(W / 2, H / 2 + 80, 'Returning to Haven...', { color: '#9ca3af', fontSize: '14px' })
      .setOrigin(0.5).setDepth(20);

    this.registry.set('crownFragments', (this.registry.get('crownFragments') || 0) + 1);
    this.registry.set('bossesDefeated', (this.registry.get('bossesDefeated') || 0) + 1);

    if (this.prepAssessment) {
      const reward = applyNeedsRewards(this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; }, this.prepAssessment, 'crown_trial_01');
      if (reward.granted) {
        this.add.text(W / 2, H / 2 + 110, `Prep Reward: +${reward.prepXpGained} Prep XP, +${reward.goldGained} Gold`, {
          color: '#a7f3d0',
          fontSize: '13px',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);
      }
    }

    updateAchievementRegistryFlags(this.registry);
    this.time.delayedCall(3500, () => this.scene.start('HavenGrounds'));
  }

  private showFloat(x: number, y: number, text: string, color: string, size = '18px') {
    const t = this.add.text(x, y, text, { color, fontSize: size, fontStyle: 'bold', stroke: '#000', strokeThickness: 3 })
      .setOrigin(0.5).setDepth(12);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  update(_t: number, delta: number) {
    if (this.done) return;

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    if (!this.healPotion?.active && this.heroHp < this.heroMaxHp) {
      this.healPotionTimer -= delta;
      if (this.healPotionTimer <= 0) {
        this.healPotionTimer = 9000;
        this.spawnHealPotion();
      }
    }

    // Boss attacks periodically
    this.bossAttackTimer -= delta;
    if (this.bossAttackTimer <= 0) {
      this.bossAttackTimer = this.phase === 2 ? 1800 : 2800;
      this.bossFireAttack();
    }

    // Move fireball
    if (this.fireballActive && this.bossFireball) {
      const W = this.scale.width, H = this.scale.height;
      const hero = { x: W / 2, y: H - 80 }; // player "stands" at bottom center
      const angle = Phaser.Math.Angle.Between(this.bossFireball.x, this.bossFireball.y, hero.x, hero.y);
      const speed = this.phase === 2 ? 280 : 200;
      this.bossFireball.x += Math.cos(angle) * speed * delta / 1000;
      this.bossFireball.y += Math.sin(angle) * speed * delta / 1000;
      this.bossFireball.angle += 8;

      // Hit player
      if (Phaser.Math.Distance.Between(this.bossFireball.x, this.bossFireball.y, hero.x, hero.y) < 30) {
        this.fireballActive = false;
        this.bossFireball.setVisible(false);
        const baseDmg = this.phase === 2 ? 18 : 10;
        const dmg = Math.max(1, Math.round(baseDmg * this.incomingDamageMultiplier));
        this.heroHp = Math.max(0, this.heroHp - dmg);
        this.showFloat(hero.x, hero.y - 30, `-${dmg}`, '#f87171');
        const pct = this.heroHp / this.heroMaxHp;
        this.heroHpBar.setDisplaySize(Math.max(1, 360 * pct), 14);
        const tint = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xfbbf24 : 0xef4444;
        this.heroHpBar.setTint(tint);
        this.heroHpText.setText(`${this.registry.get('heroName') || 'Hero'}  ${this.heroHp}/${this.heroMaxHp}`);
        if (this.heroHp <= 0) {
          this.done = true;
          this.fireballActive = false;
          this.bossFireball?.setVisible(false);
          this.showFloat(this.scale.width / 2, this.scale.height / 2, 'DEFEATED...', '#ef4444', '28px');
          this.time.delayedCall(2000, () => this.scene.start('HavenGrounds'));
        }
      }
    }
  }

  private bossFireAttack() {
    if (!this.bossFireball || this.done) return;
    this.bossFireball.setPosition(this.boss.x, this.boss.y + 40).setVisible(true);
    this.fireballActive = true;
  }

  private applyPreBattlePrep() {
    const readinessState = loadReadinessState(
      this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
      'crown_trial_01'
    );

    this.prepAssessment = assessHeroCreatNeeds(
      this.registry as unknown as { get: (key: string) => unknown; set: (key: string, value: unknown) => void; },
      'boss'
    );

    const combinedReadiness = Math.max(readinessState?.readinessScore || 0, this.prepAssessment.readinessScore);
    const bonus = calculateReadinessBonus(combinedReadiness);

    this.damageMultiplier = bonus.damageMultiplier;
    this.incomingDamageMultiplier = Math.max(0.55, 1 - bonus.defenseBonus);

    if (this.prepAssessment.missingCritical.length > 0) {
      // Missing critical prep reduces initial survivability.
      const missing = this.prepAssessment.missingCritical.length;
      this.heroHp = Math.max(35, Math.round(this.heroHp * (1 - missing * 0.05)));
      this.damageMultiplier = Math.max(0.75, this.damageMultiplier - 0.05 * missing);
      this.incomingDamageMultiplier = Math.min(1.35, this.incomingDamageMultiplier + 0.05 * missing);
    }
  }
}
