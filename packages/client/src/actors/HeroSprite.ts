import Phaser from 'phaser';

const SPEED = 200;

export default class HeroSprite extends Phaser.GameObjects.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'hero');
    scene.add.existing(this);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D') as { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

    if (!scene.anims.exists('hero-walk')) {
      scene.anims.create({
        key: 'hero-walk',
        frames: [
          { key: 'hero' },
          { key: 'green' }
        ],
        frameRate: 8,
        repeat: -1
      });
    }
  }

  private setIdleState() {
    this.anims.stop();
    this.setTexture('hero');
  }

  update(_time: number, delta: number) {
    const step = (SPEED * delta) / 1000;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal movement
      const len = Math.sqrt(dx * dx + dy * dy);
      this.x += (dx / len) * step;
      this.y += (dy / len) * step;

      if (dx !== 0) {
        this.setFlipX(dx < 0);
      }

      this.anims.play('hero-walk', true);
    } else {
      this.setIdleState();
    }
  }
}

