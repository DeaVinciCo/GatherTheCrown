import { Room, Client } from 'colyseus';
import { ClientMessage, ServerMessage } from '@game/shared';

interface StoryState {
  players: Record<string, { x: number; y: number; hp: number }>;
}

export class StoryRoom extends Room<StoryState> {
  maxClients = 8;

  onCreate() {
    this.setState({ players: {} });
    this.onMessage('input', (client, message: ClientMessage) => {
      const player = this.state.players[client.sessionId];
      if (!player || message.type !== 'input') return;
      player.x += message.payload.x;
      player.y += message.payload.y;
    });
    this.onMessage('hit', (client, message: ClientMessage) => {
      if (message.type !== 'hit') return;
      this.broadcast({
        type: 'damage',
        sourceId: client.sessionId,
        amount: message.damage
      } as ServerMessage);
    });
  }

  onJoin(client: Client) {
    this.state.players[client.sessionId] = { x: 0, y: 0, hp: 100 };
  }

  onLeave(client: Client) {
    delete this.state.players[client.sessionId];
  }
}
