import { FOUR_KINGDOM_QUEST_CHAINS, type FourKingdomId, Quest, QuestObjective } from '@game/shared';

export class QuestGenerator {
  static generate(playerLevel: number, area: string): Quest {
    const kingdomQuest = this.generateKingdomQuest(playerLevel, area);
    if (kingdomQuest) return kingdomQuest;

    const objectiveCount = Math.min(3, Math.max(1, Math.floor(playerLevel / 10) + 1));
    const objectives: QuestObjective[] = [];

    for (let i = 1; i <= objectiveCount; i++) {
      const target = playerLevel * i;
      objectives.push({
        id: `${area}-${i}`,
        description: `Defeat ${target} enemies in ${area}`,
        target,
        progress: 0
      });
    }

    return {
      id: `${area}-${playerLevel}-${Date.now()}`,
      name: `${area} Quest`,
      area,
      level: playerLevel,
      objectives
    };
  }

  private static generateKingdomQuest(playerLevel: number, area: string): Quest | null {
    const normalized = area.toLowerCase().trim();
    const kingdomId = this.parseKingdomId(normalized);
    if (!kingdomId) return null;

    const chain = FOUR_KINGDOM_QUEST_CHAINS[kingdomId];
    const objectiveSource = chain.unlockOrder;
    const objectiveCount = Math.min(3, objectiveSource.length);
    const stageIndex = Math.max(0, Math.min(objectiveSource.length - objectiveCount, Math.floor(playerLevel / 15)));
    const selectedObjectives = objectiveSource.slice(stageIndex, stageIndex + objectiveCount);

    const objectives: QuestObjective[] = selectedObjectives.map((description: string, index: number) => ({
      id: `${chain.kingdomId}-${stageIndex + 1}-${index + 1}`,
      description,
      target: 1,
      progress: 0
    }));

    return {
      id: `${chain.kingdomId}-${stageIndex + 1}-${Date.now()}`,
      name: `${chain.kingdomName} Questline`,
      area: chain.kingdomName,
      level: playerLevel,
      objectives
    };
  }

  private static parseKingdomId(area: string): FourKingdomId | null {
    const aliases: Record<string, FourKingdomId> = {
      aldermarch: 'aldermarch',
      stormrage: 'stormrage',
      vastmalaise: 'vastmalaise',
      sunward: 'sunward',
      kingdom_arc: 'aldermarch'
    };

    return aliases[area] ?? null;
  }
}
