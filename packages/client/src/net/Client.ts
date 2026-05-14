import * as Colyseus from 'colyseus.js';
import { ClientMessage, ChatMessage } from '@game/shared';
import { gameRegistry } from '../registry/GameRegistry';

class GameClient {
  private client = new Colyseus.Client(
    `${location.protocol.replace('http', 'ws')}//${location.hostname}:2567`
  );
  private room?: Colyseus.Room;
  private chatOverlay: HTMLDivElement;

  constructor() {
    this.chatOverlay = document.createElement('div');
    this.chatOverlay.style.position = 'absolute';
    this.chatOverlay.style.bottom = '0';
    this.chatOverlay.style.left = '0';
    this.chatOverlay.style.width = '100%';
    this.chatOverlay.style.maxHeight = '150px';
    this.chatOverlay.style.overflowY = 'auto';
    this.chatOverlay.style.background = 'rgba(0, 0, 0, 0.5)';
    this.chatOverlay.style.color = '#fff';
    this.chatOverlay.style.fontFamily = 'sans-serif';
    this.chatOverlay.style.padding = '4px';
    document.body.appendChild(this.chatOverlay);
  }

  private getJoinOptions() {
    if (!gameRegistry.accessToken) {
      throw new Error('Not authenticated. Sign in before joining multiplayer rooms.');
    }

    return {
      accessToken: gameRegistry.accessToken
    };
  }

  async joinLobby() {
    this.room = await this.client.joinOrCreate('lobby', this.getJoinOptions());
    this.onChat((message) => this.displayChat(message));
  }

  async joinStory() {
    this.room = await this.client.joinOrCreate('story', this.getJoinOptions());
  }

  async joinBattle() {
    this.room = await this.client.joinOrCreate('battle', this.getJoinOptions());
    this.onChat((message) => this.displayChat(message));
  }

  send(message: ClientMessage) {
    this.room?.send(message.type, message);
  }

  sendChat(name: string, text: string) {
    this.send({ type: 'chat', name, text });
  }

  onChat(handler: (message: ChatMessage) => void) {
    this.room?.onMessage('chat', handler);
  }

  private displayChat(message: ChatMessage) {
    const line = document.createElement('div');
    line.textContent = `${message.name}: ${message.text}`;
    this.chatOverlay.appendChild(line);
  }
}

export const gameClient = new GameClient();
