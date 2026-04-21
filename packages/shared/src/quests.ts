export type QuestObjectiveType = 'eliminate' | 'collect' | 'explore' | 'survive';

export type QuestDifficulty = 'normal' | 'veteran' | 'elite';

export interface QuestRewards {
  experience: number;
  gold: number;
}

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  target: number;
  progress: number;
}

export interface Quest {
  id: string;
  name: string;
  area: string;
  level: number;
  difficulty: QuestDifficulty;
  objectives: QuestObjective[];
  rewards: QuestRewards;
}

