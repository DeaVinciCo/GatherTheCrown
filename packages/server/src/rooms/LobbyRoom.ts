import { Room, Client } from 'colyseus';
import { ClientMessage, ServerMessage } from '@game/shared';

interface LobbyState {
  clients: string[];
}

export class LobbyRoom extends Room<LobbyState> {
  maxClients = 16;

  onCreate() {
    this.setState({ clients: [] });
    this.onMessage('*', (client, message: ClientMessage) => {
      if (message.type === 'join') {
        this.broadcast({ type: 'crown', fragmentId: 'welcome' } as ServerMessage);
      }
    });
  }

  onJoin(client: Client) {
    this.state.clients.push(client.sessionId);
  }

  onLeave(client: Client) {
    this.state.clients = this.state.clients.filter((c) => c !== client.sessionId);
  }
}
