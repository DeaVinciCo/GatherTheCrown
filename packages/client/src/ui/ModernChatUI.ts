/**
 * Redesigned Chat System with Modern Styling
 * - Scrollable message history
 * - Timestamps
 * - Color-coded message types
 * - Typing indicators
 */

import { UITheme } from './UITheme';

export interface ChatMessage {
  id?: string;
  player: string;
  text: string;
  timestamp?: Date;
  type?: 'player' | 'system' | 'error' | 'success';
  playerId?: string;
}

export class ModernChatUI {
  private container: HTMLDivElement;
  private messageList: HTMLDivElement;
  private inputField: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private messages: ChatMessage[] = [];
  private maxMessages: number = 100;
  private onSendMessage?: (text: string) => void;

  constructor(parent: HTMLElement, options?: { maxMessages?: number }) {
    this.maxMessages = options?.maxMessages || 100;
    this.container = this.createChatContainer(parent);
    this.messageList = this.container.querySelector('.chat-messages') as HTMLDivElement;
    this.inputField = this.container.querySelector('.chat-input') as HTMLInputElement;
    this.sendButton = this.container.querySelector('.chat-send') as HTMLButtonElement;

    this.setupEventListeners();
  }

  private createChatContainer(parent: HTMLElement): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      background: ${UITheme.colors.bg.darker};
      border-radius: ${UITheme.borderRadius.lg};
      border: 1px solid ${UITheme.colors.borderLight};
      overflow: hidden;
      font-family: ${UITheme.typography.fontFamily};
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: ${UITheme.spacing.md} ${UITheme.spacing.lg};
      border-bottom: 1px solid ${UITheme.colors.border};
      background: rgba(108, 92, 231, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const title = document.createElement('h3');
    title.textContent = '💬 Chat';
    title.style.cssText = `
      margin: 0;
      color: ${UITheme.colors.text.primary};
      font-size: ${UITheme.typography.sizes.lg};
      font-weight: ${UITheme.typography.weights.semibold};
    `;

    const onlineCount = document.createElement('span');
    onlineCount.className = 'chat-online-count';
    onlineCount.textContent = '0 online';
    onlineCount.style.cssText = `
      color: ${UITheme.colors.text.secondary};
      font-size: ${UITheme.typography.sizes.sm};
      display: flex;
      align-items: center;
      gap: ${UITheme.spacing.xs};
    `;

    const dot = document.createElement('span');
    dot.textContent = '●';
    dot.style.color = UITheme.colors.text.success;
    onlineCount.prepend(dot);

    header.appendChild(title);
    header.appendChild(onlineCount);
    container.appendChild(header);

    // Messages list
    const messageList = document.createElement('div');
    messageList.className = 'chat-messages';
    messageList.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: ${UITheme.spacing.lg};
      display: flex;
      flex-direction: column;
      gap: ${UITheme.spacing.md};
    `;

    // Custom scrollbar styling
    const scrollStyle = document.createElement('style');
    scrollStyle.textContent = `
      .chat-messages::-webkit-scrollbar {
        width: 8px;
      }
      .chat-messages::-webkit-scrollbar-track {
        background: ${UITheme.colors.bg.darker};
      }
      .chat-messages::-webkit-scrollbar-thumb {
        background: ${UITheme.colors.border};
        border-radius: ${UITheme.borderRadius.full};
      }
      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: ${UITheme.colors.borderLight};
      }
    `;
    document.head.appendChild(scrollStyle);

    container.appendChild(messageList);

    // Input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: ${UITheme.spacing.lg};
      border-top: 1px solid ${UITheme.colors.border};
      background: rgba(10, 13, 18, 0.5);
      display: flex;
      gap: ${UITheme.spacing.md};
    `;

    const inputField = document.createElement('input');
    inputField.className = 'chat-input';
    inputField.placeholder = 'Type a message...';
    inputField.maxLength = 200;
    inputField.style.cssText = `
      flex: 1;
      padding: ${UITheme.spacing.md} ${UITheme.spacing.lg};
      background: ${UITheme.colors.bg.surface};
      border: 1px solid ${UITheme.colors.border};
      border-radius: ${UITheme.borderRadius.md};
      color: ${UITheme.colors.text.primary};
      font-family: ${UITheme.typography.fontFamily};
      font-size: ${UITheme.typography.sizes.base};
      transition: ${UITheme.transitions.fast};
      box-sizing: border-box;
    `;

    inputField.addEventListener('focus', () => {
      inputField.style.borderColor = UITheme.colors.primary;
      inputField.style.boxShadow = `0 0 8px ${UITheme.colors.primary}40`;
    });

    inputField.addEventListener('blur', () => {
      inputField.style.borderColor = UITheme.colors.border;
      inputField.style.boxShadow = 'none';
    });

    const sendButton = document.createElement('button');
    sendButton.className = 'chat-send';
    sendButton.textContent = '📤 Send';
    sendButton.style.cssText = `
      padding: ${UITheme.spacing.md} ${UITheme.spacing.lg};
      background: ${UITheme.colors.primary};
      color: #fff;
      border: none;
      border-radius: ${UITheme.borderRadius.md};
      cursor: pointer;
      font-family: ${UITheme.typography.fontFamily};
      font-weight: ${UITheme.typography.weights.medium};
      font-size: ${UITheme.typography.sizes.base};
      transition: ${UITheme.transitions.fast};
      white-space: nowrap;
    `;

    sendButton.addEventListener('mouseenter', () => {
      sendButton.style.backgroundColor = UITheme.colors.primaryDark;
      sendButton.style.boxShadow = UITheme.shadows.md;
    });

    sendButton.addEventListener('mouseleave', () => {
      sendButton.style.backgroundColor = UITheme.colors.primary;
      sendButton.style.boxShadow = 'none';
    });

    inputArea.appendChild(inputField);
    inputArea.appendChild(sendButton);
    container.appendChild(inputArea);

    parent.appendChild(container);
    return container;
  }

  private setupEventListeners(): void {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  private sendMessage(): void {
    const text = this.inputField.value.trim();
    if (text.length === 0) return;

    this.onSendMessage?.(text);
    this.inputField.value = '';
    this.inputField.focus();
  }

  /**
   * Add a message to the chat
   */
  public addMessage(message: ChatMessage): void {
    // Add to messages array
    this.messages.push(message);

    // Limit message history
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
      const firstChild = this.messageList.firstChild;
      if (firstChild) firstChild.remove();
    }

    // Create message element
    const messageEl = this.createMessageElement(message);
    this.messageList.appendChild(messageEl);

    // Auto-scroll to bottom
    setTimeout(() => {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }, 0);
  }

  private createMessageElement(message: ChatMessage): HTMLDivElement {
    const messageEl = document.createElement('div');
    const type = message.type || 'player';
    const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();

    messageEl.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: ${UITheme.spacing.xs};
      padding: ${UITheme.spacing.md};
      background: rgba(255, 255, 255, 0.02);
      border-left: 3px solid ${this.getTypeColor(type)};
      border-radius: ${UITheme.borderRadius.sm};
      animation: slideIn 200ms ease-out;
    `;

    // Add animation
    const animStyle = document.createElement('style');
    animStyle.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-8px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    if (!document.querySelector('style[data-chat-anim]')) {
      animStyle.setAttribute('data-chat-anim', 'true');
      document.head.appendChild(animStyle);
    }

    // Header: Player name + Timestamp
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: ${UITheme.typography.sizes.sm};
    `;

    const playerName = document.createElement('span');
    playerName.textContent = message.player;
    playerName.style.cssText = `
      color: ${this.getTypeColor(type)};
      font-weight: ${UITheme.typography.weights.semibold};
    `;

    const timeEl = document.createElement('span');
    timeEl.textContent = this.formatTime(timestamp);
    timeEl.style.cssText = `
      color: ${UITheme.colors.text.muted};
      font-size: ${UITheme.typography.sizes.xs};
    `;

    header.appendChild(playerName);
    header.appendChild(timeEl);
    messageEl.appendChild(header);

    // Message text
    const textEl = document.createElement('p');
    textEl.textContent = message.text;
    textEl.style.cssText = `
      margin: 0;
      color: ${UITheme.colors.text.primary};
      font-size: ${UITheme.typography.sizes.base};
      line-height: 1.4;
      word-wrap: break-word;
    `;
    messageEl.appendChild(textEl);

    return messageEl;
  }

  private getTypeColor(type: string): string {
    switch (type) {
      case 'system':
        return UITheme.colors.chat.systemMessage;
      case 'error':
        return UITheme.colors.chat.errorMessage;
      case 'success':
        return UITheme.colors.chat.successMessage;
      case 'player':
      default:
        return UITheme.colors.chat.playerMessage;
    }
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Clear all messages
   */
  public clear(): void {
    this.messages = [];
    this.messageList.innerHTML = '';
  }

  /**
   * Set callback for when message is sent
   */
  public onSend(callback: (text: string) => void): void {
    this.onSendMessage = callback;
  }

  /**
   * Update online count
   */
  public setOnlineCount(count: number): void {
    const onlineEl = this.container.querySelector('.chat-online-count');
    if (onlineEl) {
      onlineEl.textContent = `${count} online`;
      const dot = onlineEl.querySelector('span');
      if (dot) onlineEl.insertBefore(dot, onlineEl.firstChild);
    }
  }

  /**
   * Get the container element
   */
  public getElement(): HTMLDivElement {
    return this.container;
  }
}
