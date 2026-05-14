export interface JoinMessage {
  type: 'join';
  name: string;
}

export interface LeaveMessage {
  type: 'leave';
}

export interface InputMessage {
  type: 'input';
  payload: { x: number; y: number; action?: string };
}

export interface HitMessage {
  type: 'hit';
  targetId: string;
  damage: number;
}

export interface DamageMessage {
  type: 'damage';
  sourceId: string;
  amount: number;
}

export interface LootMessage {
  type: 'loot';
  itemId: string;
}

export interface ObjectiveMessage {
  type: 'objective';
  objectiveId: string;
  progress: number;
}

export interface CrownUpdateMessage {
  type: 'crown';
  fragmentId: string;
}

export interface ChatMessage {
  type: 'chat';
  name: string;
  text: string;
}

export type ClientMessage =
  | JoinMessage
  | LeaveMessage
  | InputMessage
  | HitMessage
  | LootMessage
  | ChatMessage;

export type ServerMessage =
  | DamageMessage
  | ObjectiveMessage
  | CrownUpdateMessage
  | ChatMessage;
