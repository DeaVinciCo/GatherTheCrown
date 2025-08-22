import { Room, Client } from 'colyseus';
import { ClientMessage } from '@game/shared';
import { resolveCombat } from '../sim/combat';

interface PlayerState {
  hp: number;
  wins: number;
}

interface BattleState {
  players: Record<string, PlayerState>;
  round: number;
  timer: number;
  status: 'waiting' | 'countdown' | 'fighting' | 'finished';
  winner?: string;
}

export class BattleRoom extends Room<BattleState> {
  maxClients = 2;

  private interval?: NodeJS.Timer;
  private readonly maxRounds = 3;
  private readonly roundDuration = 60; // seconds
  private readonly countdownDuration = 3; // seconds

  onCreate() {
    this.setState({ players: {}, round: 0, timer: 0, status: 'waiting' });

    this.onMessage('hit', (client, message: ClientMessage) => {
      if (message.type !== 'hit') return;
      const opponentId = Object.keys(this.state.players).find((id) => id !== client.sessionId);
      if (!opponentId) return;
      const dmg = resolveCombat(message.damage);
      const opponent = this.state.players[opponentId];
      opponent.hp -= dmg;
      if (opponent.hp <= 0) {
        this.endRound(client.sessionId);
      }
    });
  }

  onJoin(client: Client) {
    this.state.players[client.sessionId] = { hp: 100, wins: 0 };
    if (this.clients.length === this.maxClients) {
      this.startRound();
    }
  }

  onLeave(client: Client) {
    delete this.state.players[client.sessionId];
    if (Object.keys(this.state.players).length === 0) {
      clearInterval(this.interval);
    }
  }

  private startRound() {
    this.state.round += 1;
    this.state.status = 'countdown';
    this.state.timer = this.countdownDuration;
    Object.values(this.state.players).forEach((p) => (p.hp = 100));

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.state.timer -= 1;
      if (this.state.timer <= 0) {
        if (this.state.status === 'countdown') {
          this.state.status = 'fighting';
          this.state.timer = this.roundDuration;
        } else if (this.state.status === 'fighting') {
          const leader = this.getLeadingPlayer();
          this.endRound(leader);
        }
      }
    }, 1000);
  }

  private getLeadingPlayer(): string | undefined {
    const ids = Object.keys(this.state.players);
    if (ids.length < 2) return ids[0];
    const [a, b] = ids;
    const diff = this.state.players[a].hp - this.state.players[b].hp;
    if (diff === 0) return undefined;
    return diff > 0 ? a : b;
  }

  private endRound(winnerId?: string) {
    if (winnerId) {
      this.state.players[winnerId].wins += 1;
    }

    const players = Object.keys(this.state.players);
    const maxWins = Math.max(...players.map((id) => this.state.players[id].wins));
    const matchOver = this.state.round >= this.maxRounds || maxWins >= Math.ceil(this.maxRounds / 2);

    if (matchOver) {
      const sorted = players.sort((a, b) => this.state.players[b].wins - this.state.players[a].wins);
      const topWins = this.state.players[sorted[0]].wins;
      const secondWins = players.length > 1 ? this.state.players[sorted[1]].wins : 0;
      this.state.status = 'finished';
      this.state.winner = topWins === secondWins ? undefined : sorted[0];
      clearInterval(this.interval);
      return;
    }

    this.startRound();
  }
}

