import * as Colyseus from 'colyseus.js';
import { getRealtimeServerUrl } from './serverUrl';
// Using local message types

class GameClient {
  private client = new Colyseus.Client(getRealtimeServerUrl());
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

  async joinLobby() {
    this.room = await this.client.joinOrCreate('lobby');
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
