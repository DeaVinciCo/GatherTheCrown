import Phaser from 'phaser';

export type CutsceneTextStep = {
  type: 'text';
  text: string;
  duration?: number;
};

export type CutsceneWaitStep = {
  type: 'wait';
  duration: number;
};

export type CutsceneActionStep = {
  type: 'action';
  run: () => void | Promise<void>;
};

export type CutsceneStep = CutsceneTextStep | CutsceneWaitStep | CutsceneActionStep;

function assertNever(x: never): never {
  throw new Error(`Unhandled cutscene step type: ${(x as { type: string }).type}`);
}

export default class CutscenePlayer {
  constructor(private scene: Phaser.Scene) {}

  private wait(ms: number): Promise<void> {
    return new Promise<void>((resolve) =>
      this.scene.time.delayedCall(ms, () => resolve())
    );
  }

  private async runStep(step: CutsceneStep): Promise<void> {
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

        await this.wait(step.duration ?? 2000);
        text.destroy();
        break;
      }
      case 'wait': {
        await this.wait(step.duration);
        break;
      }
      case 'action': {
        await step.run();
        break;
      }
      default:
        assertNever(step);
    }
  }

  async play(steps: CutsceneStep[]): Promise<void> {
    for (const step of steps) {
      await this.runStep(step);
    }
  }
}
