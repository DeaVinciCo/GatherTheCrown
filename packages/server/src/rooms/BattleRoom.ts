import { Room, Client } from 'colyseus';
import { ClientMessage } from '@game/shared';
import { resolveCombat } from '../sim/combat';

interface BattleState {
  players: Record<string, { hp: number }>;
}

export class BattleRoom extends Room<BattleState> {
  maxClients = 2;

  onCreate() {
    this.setState({ players: {} });
    this.onMessage('hit', (client, message: ClientMessage) => {
      if (message.type !== 'hit') return;
      const opponent = Object.keys(this.state.players).find((id) => id !== client.sessionId);
      if (!opponent) return;
      const dmg = resolveCombat(message.damage);
      this.state.players[opponent].hp -= dmg;
      if (this.state.players[opponent].hp <= 0) {
        this.disconnect(client);
        this.disconnect(this.clients.find((c) => c.sessionId === opponent)!);
      }
    });
  }

  onJoin(client: Client) {
    this.state.players[client.sessionId] = { hp: 100 };
  }

  onLeave(client: Client) {
    delete this.state.players[client.sessionId];
  }
}
