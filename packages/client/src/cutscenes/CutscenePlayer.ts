import Phaser from 'phaser';

export type CutsceneStep = {
  type: 'text';
  text: string;
  duration?: number;
};

export default class CutscenePlayer {
  constructor(private scene: Phaser.Scene) {}

  async play(steps: CutsceneStep[]): Promise<void> {
    for (const step of steps) {
      switch (step.type) {
        case 'text': {
          const text = this.scene.add
            .text(
              this.scene.cameras.main.centerX,
              this.scene.cameras.main.centerY,
              step.text,
              { color: '#fff' }
            )
            .setOrigin(0.5);

          await new Promise<void>((resolve) =>
            this.scene.time.delayedCall(step.duration ?? 2000, () => {
              text.destroy();
              resolve();
            })
          );
          break;
        }
      }
    }
  }
}
