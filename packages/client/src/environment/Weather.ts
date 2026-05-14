import Phaser from 'phaser';

export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'lightning';

/**
 * Simple weather manager capable of rendering rain, snow and lightning
 * overlays as well as a day/night tint.
 */
export default class Weather {
  private scene: Phaser.Scene;
  private emitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private lightning?: Phaser.GameObjects.Rectangle;
  private dayNightOverlay: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createTextures();

    // overlay used to darken the screen for night time
    this.dayNightOverlay = scene.add
      .rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0)
      .setOrigin(0)
      .setDepth(1000);
  }

  /**
   * Generate the simple textures required for particle effects.
   */
  private createTextures() {
    const g = this.scene.add.graphics();

    // raindrop texture
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 2, 10);
    g.generateTexture('rain-drop', 2, 10);
    g.clear();

    // snowflake texture
    g.fillStyle(0xffffff, 1);
    g.fillCircle(2, 2, 2);
    g.generateTexture('snow-flake', 4, 4);

    g.destroy();
  }

  /**
   * Set the current weather condition. Existing effects are removed.
   */
  setCondition(condition: WeatherCondition) {
    if (this.emitter) {
      this.emitter.stop();
      this.emitter.destroy();
      this.emitter = undefined;
    }
    if (this.lightning) {
      this.lightning.destroy();
      this.lightning = undefined;
    }

    switch (condition) {
      case 'rain':
        this.emitter = this.scene.add.particles(0, 0, 'rain-drop', {
          x: { min: 0, max: this.scene.scale.width },
          y: 0,
          lifespan: 2000,
          speedY: { min: 300, max: 500 },
          quantity: 5,
          scale: { start: 1, end: 1 },
          blendMode: 'ADD'
        });
        break;

      case 'snow':
        this.emitter = this.scene.add.particles(0, 0, 'snow-flake', {
          x: { min: 0, max: this.scene.scale.width },
          y: 0,
          lifespan: 4000,
          speedY: { min: 20, max: 60 },
          scale: { start: 0.5, end: 0.5 },
          quantity: 2
        });
        break;

      case 'lightning':
        this.lightning = this.scene.add
          .rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0xffffff, 0)
          .setOrigin(0)
          .setDepth(999);

        this.scene.time.addEvent({
          delay: Phaser.Math.Between(2000, 5000),
          loop: true,
          callback: () => {
            if (!this.lightning) return;
            this.lightning.setAlpha(1);
            this.scene.tweens.add({
              targets: this.lightning,
              alpha: 0,
              duration: 200
            });
          }
        });
        break;

      case 'clear':
      default:
        break;
    }
  }

  /**
   * Set the progress of the day/night cycle. 0 is full day, 1 is night.
   */
  setTimeOfDay(progress: number) {
    const clamped = Phaser.Math.Clamp(progress, 0, 1);
    // night tint reaches 60% opacity at full night
    this.dayNightOverlay.setAlpha(0.6 * clamped);
  }
}
