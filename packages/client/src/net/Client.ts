import * as Colyseus from 'colyseus.js';
import { ClientMessage } from '@game/shared';

class GameClient {
  private client = new Colyseus.Client(`${location.protocol.replace('http', 'ws')}//${location.hostname}:2567`);
  private room?: Colyseus.Room;

  async joinLobby() {
    this.room = await this.client.joinOrCreate('lobby');
  }

  send(message: ClientMessage) {
    this.room?.send(message.type, message);
  }
}

export const gameClient = new GameClient();
