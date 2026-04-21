import Phaser from 'phaser';
import * as Colyseus from 'colyseus.js';
import { getRealtimeServerUrl } from '../net/serverUrl';

interface BattleState {
  round: number;
  timer: number;
  status: string;
  winner?: string;
}

export default class BattleArena extends Phaser.Scene {
  private room?: Colyseus.Room<BattleState>;
  private demoTimer?: Phaser.Time.TimerEvent;
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

    this.events.once(Phaser.Core.Events.SHUTDOWN, () => {
      this.room?.leave();
      this.demoTimer?.remove(false);
    });
  }

  private async connect() {
    const realtimeServerUrl = getRealtimeServerUrl();

    if (!realtimeServerUrl) {
      this.startOfflineTraining('Offline training mode (no realtime server configured).');
      return;
    }

    try {
      const client = new Colyseus.Client(realtimeServerUrl);
      this.room = await client.joinOrCreate<BattleState>('battle');
      this.room.onStateChange((state) => this.updateHUD(state));
    } catch (_error) {
      this.startOfflineTraining('Offline training mode (realtime connection unavailable).');
    }
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

  private startOfflineTraining(reason: string) {
    const offlineState: BattleState = {
      round: 1,
      timer: 20,
      status: 'training'
    };

    this.resultText.setText(reason);
    this.updateHUD(offlineState);

    this.demoTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (offlineState.timer > 0) {
          offlineState.timer -= 1;
        } else {
          offlineState.status = 'finished';
          offlineState.winner = 'You';
          this.demoTimer?.remove(false);
        }

        this.updateHUD(offlineState);
      }
    });
  }
}

