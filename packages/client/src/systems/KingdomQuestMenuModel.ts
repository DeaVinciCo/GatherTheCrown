import {
  FOUR_KINGDOM_QUEST_CHAINS,
  type FourKingdomId,
  type KingdomQuestStage,
} from '@game/shared';
import type { InventoryItem } from '../ui/InventoryMenu';
import { canOpenKingdomDoor, canOpenKingdomPortal } from './KingdomAccessControl';

export interface KingdomQuestMenuStage {
  stageId: string;
  title: string;
  objectives: string[];
  requiredKeyName: string;
  progressionType: KingdomQuestStage['progressionType'];
}

export interface KingdomQuestMenuEntry {
  kingdomId: FourKingdomId;
  kingdomName: string;
  activeStage: KingdomQuestMenuStage;
  hasDoorAccess: boolean;
  hasPortalAccess: boolean;
  missingDoorKeys: string[];
  missingPortalKeys: string[];
}

function getCurrentStageIndex(registry: { get: (key: string) => unknown }, kingdomId: FourKingdomId): number {
  const key = `kingdomStageIndex_${kingdomId}`;
  const value = Number(registry.get(key) ?? 0);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export function buildKingdomQuestMenuEntries(
  registry: { get: (key: string) => unknown },
  inventory: InventoryItem[]
): KingdomQuestMenuEntry[] {
  return (Object.values(FOUR_KINGDOM_QUEST_CHAINS)).map((chain) => {
    const currentIndex = Math.min(chain.stages.length - 1, getCurrentStageIndex(registry, chain.kingdomId));
    const currentStage = chain.stages[currentIndex];

    const doorAccess = canOpenKingdomDoor(inventory, chain.kingdomId);
    const portalAccess = canOpenKingdomPortal(inventory, chain.kingdomId);

    return {
      kingdomId: chain.kingdomId,
      kingdomName: chain.kingdomName,
      activeStage: {
        stageId: currentStage.id,
        title: currentStage.title,
        objectives: currentStage.objectives,
        requiredKeyName: currentStage.requiredKeyName,
        progressionType: currentStage.progressionType
      },
      hasDoorAccess: doorAccess.granted,
      hasPortalAccess: portalAccess.granted,
      missingDoorKeys: doorAccess.missingItemIds,
      missingPortalKeys: portalAccess.missingItemIds
    };
  });
}
