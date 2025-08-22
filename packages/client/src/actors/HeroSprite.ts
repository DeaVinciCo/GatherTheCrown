import Phaser from 'phaser';

export default class HeroSprite extends Phaser.GameObjects.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private speed = 200;

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

  update(_time: number, delta: number) {
    const step = (this.speed * delta) / 1000;
    let moving = false;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.x -= step;
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.x += step;
      moving = true;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.y -= step;
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.y += step;
      moving = true;
    }

    if (moving) {
      this.anims.play('hero-walk', true);
    } else {
      this.anims.stop();
      this.setTexture('hero');
    }
  }
}

