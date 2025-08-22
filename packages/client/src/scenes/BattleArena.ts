import Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';

interface BattleState {
  round: number;
  timer: number;
  status: string;
  winner?: string;
}

export default class BattleArena extends Phaser.Scene {
  private room?: Colyseus.Room<BattleState>;
  private roundText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private resultText!: Phaser.GameObjects.Text;

  constructor() {
    super('BattleArena');
  }

  create() {
    this.roundText = this.add.text(10, 10, 'Round: 0', { color: '#fff' });
    this.timerText = this.add.text(10, 30, 'Time: 0', { color: '#fff' });
    this.statusText = this.add.text(10, 50, 'Status: waiting', { color: '#fff' });
    this.resultText = this.add.text(400, 300, '', { color: '#fff' }).setOrigin(0.5);

    this.connect();
  }

  private async connect() {
    const client = new Colyseus.Client(`${location.protocol.replace('http', 'ws')}//${location.hostname}:2567`);
    this.room = await client.joinOrCreate<BattleState>('battle');
    this.room.onStateChange((state) => this.updateHUD(state));
  }

  private updateHUD(state: BattleState) {
    this.roundText.setText(`Round: ${state.round}`);
    this.timerText.setText(`Time: ${state.timer}`);
    this.statusText.setText(`Status: ${state.status}`);
    if (state.status === 'finished') {
      const text = state.winner ? `Winner: ${state.winner}` : 'Draw!';
      this.resultText.setText(text);
    }
  }
}

