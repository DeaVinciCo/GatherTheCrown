import Phaser from 'phaser';
import { POTION_CAP } from '@game/shared';

export class ArtifactFrameHUD extends Phaser.GameObjects.Container {
  private potionsText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.potionsText = scene.add.text(10, 560, `Potions: 0/${POTION_CAP}`, { color: '#fff' });
    this.goldText = scene.add.text(650, 560, `Gold: 0`, { color: '#fff' });
    this.add([this.potionsText, this.goldText]);
  }

  updatePotions(count: number) {
    this.potionsText.setText(`Potions: ${count}/${POTION_CAP}`);
  }

  updateGold(amount: number) {
    this.goldText.setText(`Gold: ${abbreviate(amount)}`);
  }
}

function abbreviate(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}
