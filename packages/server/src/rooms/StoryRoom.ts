import { Room, Client } from 'colyseus';
import { ClientMessage, ServerMessage } from '@game/shared';
import { basicEnemyAI, EnemyAIState } from '../sim/ai';
import { verifyRoomAccess, type RoomJoinOptions, type AuthenticatedRoomUser } from '../utils/roomAuth';

interface StoryState {
  players: Record<string, { x: number; y: number; hp: number }>;
  enemies: Record<string, { x: number; y: number; hp: number; state: EnemyAIState }>;
}

export class StoryRoom extends Room<StoryState> {
  maxClients = 8;
  private usersBySession = new Map<string, AuthenticatedRoomUser>();

  onCreate() {
    this.setState({
      players: {},
      enemies: {
        e1: { x: 0, y: 0, hp: 100, state: 'idle' }
      }
    });

    this.onMessage('input', (client, message: ClientMessage) => {
      const player = this.state.players[client.sessionId];
      if (!player || message.type !== 'input') return;
      player.x += message.payload.x;
      player.y += message.payload.y;
    });

    this.onMessage('hit', (client, message: ClientMessage) => {
      if (message.type !== 'hit') return;
      this.broadcast('server', {
        type: 'damage',
        sourceId: client.sessionId,
        amount: message.damage
      } as ServerMessage);
    });

    this.setSimulationInterval(() => this.updateEnemies());
  }

  async onAuth(_client: Client, options: RoomJoinOptions) {
    return verifyRoomAccess(options);
  }

  onJoin(client: Client, _options: RoomJoinOptions, auth?: AuthenticatedRoomUser) {
    if (auth) {
      this.usersBySession.set(client.sessionId, auth);
    }
    this.state.players[client.sessionId] = { x: 0, y: 0, hp: 100 };
  }

  onLeave(client: Client) {
    this.usersBySession.delete(client.sessionId);
    delete this.state.players[client.sessionId];
  }

  private updateEnemies() {
    for (const [id, enemy] of Object.entries(this.state.enemies)) {
      const players = Object.values(this.state.players);
      if (players.length === 0) {
        enemy.state = 'idle';
        continue;
      }

      let target = players[0];
      let dist = Math.hypot(target.x - enemy.x, target.y - enemy.y);
      for (const p of players.slice(1)) {
        const d = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (d < dist) {
          dist = d;
          target = p;
        }
      }

      enemy.state = basicEnemyAI({ hp: enemy.hp, distance: dist });

      switch (enemy.state) {
        case 'chase':
          enemy.x += Math.sign(target.x - enemy.x);
          enemy.y += Math.sign(target.y - enemy.y);
          break;
        case 'retreat':
          enemy.x -= Math.sign(target.x - enemy.x);
          enemy.y -= Math.sign(target.y - enemy.y);
          break;
        case 'attack':
          this.broadcast('server', {
            type: 'damage',
            sourceId: id,
            amount: 10
          } as ServerMessage);
          break;
      }
    }
  }
}
