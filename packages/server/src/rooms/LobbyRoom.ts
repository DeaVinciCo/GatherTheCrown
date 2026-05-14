import { Room, Client } from 'colyseus';
import { ClientMessage, ServerMessage, ChatMessage } from '@game/shared';
import { verifyRoomAccess, type RoomJoinOptions, type AuthenticatedRoomUser } from '../utils/roomAuth';

interface LobbyState {
  clients: string[];
}

export class LobbyRoom extends Room<LobbyState> {
  maxClients = 16;
  private usersBySession = new Map<string, AuthenticatedRoomUser>();

  onCreate() {
    this.setState({ clients: [] });

    this.onMessage('*', (client, message: ClientMessage) => {
      if (message.type === 'join') {
        this.broadcast('server', { type: 'crown', fragmentId: 'welcome' } as ServerMessage);
      }
      if (message.type === 'chat') {
        this.broadcast('chat', message as ChatMessage);
      }
    });
  }

  async onAuth(_client: Client, options: RoomJoinOptions) {
    return verifyRoomAccess(options);
  }

  onJoin(client: Client, _options: RoomJoinOptions, auth?: AuthenticatedRoomUser) {
    if (auth) {
      this.usersBySession.set(client.sessionId, auth);
    }
    this.state.clients.push(client.sessionId);
  }

  onLeave(client: Client) {
    this.usersBySession.delete(client.sessionId);
    this.state.clients = this.state.clients.filter((c) => c !== client.sessionId);
  }
}
