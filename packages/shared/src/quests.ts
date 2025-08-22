export interface QuestObjective {
  id: string;
  description: string;
  target: number;
  progress: number;
}

export interface Quest {
  id: string;
  name: string;
  area: string;
  level: number;
  objectives: QuestObjective[];
}

