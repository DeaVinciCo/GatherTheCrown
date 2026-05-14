import Phaser from 'phaser';

interface LessonOverlayPayload {
  title: string;
  shortText: string;
  hintText: string;
}

export class ProgressiveSkillLessonOverlay {
  static show(scene: Phaser.Scene, payload: LessonOverlayPayload, duration: number = 4200) {
    const { width } = scene.scale;

    const container = scene.add.container(width - 14, 88).setDepth(60).setAlpha(0);
    const panel = scene.add.rectangle(0, 0, 344, 108, 0x0f172a, 0.9)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0x38bdf8, 0.55);
    const glow = scene.add.rectangle(0, 0, 344, 108, 0x38bdf8, 0.08).setOrigin(1, 0);

    const tag = scene.add.text(-330, 8, 'New Skill Insight', {
      color: '#7dd3fc',
      fontSize: '11px',
      fontStyle: 'bold'
    }).setOrigin(0, 0);

    const title = scene.add.text(-330, 26, payload.title, {
      color: '#f8fafc',
      fontSize: '20px',
      fontStyle: 'bold'
    }).setOrigin(0, 0);

    const body = scene.add.text(-330, 52, payload.shortText, {
      color: '#cbd5e1',
      fontSize: '11px',
      wordWrap: { width: 318 }
    }).setOrigin(0, 0);

    const hint = scene.add.text(-330, 86, payload.hintText, {
      color: '#94a3b8',
      fontSize: '10px',
      wordWrap: { width: 318 }
    }).setOrigin(0, 0);

    container.add([glow, panel, tag, title, body, hint]);
    container.setInteractive(new Phaser.Geom.Rectangle(-344, 0, 344, 108), Phaser.Geom.Rectangle.Contains);

    const dismiss = () => {
      scene.tweens.add({
        targets: container,
        x: width + 360,
        alpha: 0,
        duration: 260,
        onComplete: () => container.destroy(true)
      });
    };

    container.on('pointerdown', dismiss);

    scene.tweens.add({
      targets: container,
      x: width - 14,
      alpha: 1,
      duration: 260,
      ease: 'Cubic.Out'
    });

    scene.time.delayedCall(duration, dismiss);
  }
}
