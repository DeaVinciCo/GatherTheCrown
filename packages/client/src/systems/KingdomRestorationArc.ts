import { gainPrepXp, getPrepProgress, type RegistryLike } from './PrepProgression';
import type { MainlandKingdomId } from '../data/KingdomNamingSystem';

export interface KingdomRestorationReward {
  prepXp: number;
  gold: number;
  bonusPotions: number;
  bonusAid: number;
}

export interface KingdomRestorationStep {
  order: 1 | 2 | 3 | 4;
  kingdomId: MainlandKingdomId;
  label: string;
  suggestedHeroLevelRange: [number, number];
  suggestedPrepLevelFloor: number;
  reward: KingdomRestorationReward;
}

export interface KingdomRestorationGrantResult {
  granted: boolean;
  kingdomId: MainlandKingdomId;
  prepXpGained: number;
  goldGained: number;
  leveledUp: boolean;
  prepLevelAfter: number;
  message: string;
}

const ARC_STEPS: KingdomRestorationStep[] = [
  {
    order: 1,
    kingdomId: 'aldermarch',
    label: 'Aldermarch Restoration',
    suggestedHeroLevelRange: [8, 11],
    suggestedPrepLevelFloor: 4,
    reward: { prepXp: 90, gold: 140, bonusPotions: 1, bonusAid: 0 }
  },
  {
    order: 2,
    kingdomId: 'stormrage',
    label: 'Stormrage Restoration',
    suggestedHeroLevelRange: [11, 15],
    suggestedPrepLevelFloor: 7,
    reward: { prepXp: 120, gold: 180, bonusPotions: 1, bonusAid: 1 }
  },
  {
    order: 3,
    kingdomId: 'vastmalaise',
    label: 'Vastmalaise Restoration',
    suggestedHeroLevelRange: [15, 19],
    suggestedPrepLevelFloor: 10,
    reward: { prepXp: 150, gold: 220, bonusPotions: 2, bonusAid: 1 }
  },
  {
    order: 4,
    kingdomId: 'sunward',
    label: 'Sunward Restoration',
    suggestedHeroLevelRange: [19, 24],
    suggestedPrepLevelFloor: 13,
    reward: { prepXp: 180, gold: 280, bonusPotions: 2, bonusAid: 2 }
  }
];

const ARC_COMPLETION_BONUS: KingdomRestorationReward = {
  prepXp: 140,
  gold: 350,
  bonusPotions: 2,
  bonusAid: 2
};

export function getFourKingdomRestorationArc() {
  return ARC_STEPS;
}

export function getKingdomArcStep(kingdomId: MainlandKingdomId) {
  return ARC_STEPS.find((step) => step.kingdomId === kingdomId);
}

export function claimKingdomRestorationReward(
  registry: RegistryLike,
  kingdomId: MainlandKingdomId
): KingdomRestorationGrantResult {
  const step = getKingdomArcStep(kingdomId);
  if (!step) {
    return {
      granted: false,
      kingdomId,
      prepXpGained: 0,
      goldGained: 0,
      leveledUp: false,
      prepLevelAfter: getPrepProgress(registry).level,
      message: `No restoration arc step found for ${kingdomId}.`
    };
  }

  const claimKey = `kingdom_restoration_reward_claimed_${kingdomId}`;
  if (registry.get(claimKey)) {
    return {
      granted: false,
      kingdomId,
      prepXpGained: 0,
      goldGained: 0,
      leveledUp: false,
      prepLevelAfter: getPrepProgress(registry).level,
      message: `${step.label} reward already claimed.`
    };
  }

  const xpResult = gainPrepXp(registry, step.reward.prepXp, `kingdom_restore:${kingdomId}`);
  const goldBefore = Math.max(0, Number(registry.get('gold') || 0));
  registry.set('gold', goldBefore + step.reward.gold);

  const potionBefore = Math.max(0, Number(registry.get('potionCount') || 0));
  const aidBefore = Math.max(0, Number(registry.get('aidCount') || 0));
  registry.set('potionCount', potionBefore + step.reward.bonusPotions);
  registry.set('aidCount', aidBefore + step.reward.bonusAid);

  registry.set(claimKey, true);
  registry.set(`kingdom_restored_${kingdomId}`, true);

  const allClaimed = ARC_STEPS.every((arcStep) => registry.get(`kingdom_restoration_reward_claimed_${arcStep.kingdomId}`));
  if (allClaimed && !registry.get('kingdom_restoration_arc_completion_claimed')) {
    const completionXp = gainPrepXp(registry, ARC_COMPLETION_BONUS.prepXp, 'kingdom_restore:arc_completion');
    const goldAfterStep = Math.max(0, Number(registry.get('gold') || 0));
    registry.set('gold', goldAfterStep + ARC_COMPLETION_BONUS.gold);

    const potionsAfterStep = Math.max(0, Number(registry.get('potionCount') || 0));
    const aidAfterStep = Math.max(0, Number(registry.get('aidCount') || 0));
    registry.set('potionCount', potionsAfterStep + ARC_COMPLETION_BONUS.bonusPotions);
    registry.set('aidCount', aidAfterStep + ARC_COMPLETION_BONUS.bonusAid);
    registry.set('kingdom_restoration_arc_completion_claimed', true);

    return {
      granted: true,
      kingdomId,
      prepXpGained: step.reward.prepXp + ARC_COMPLETION_BONUS.prepXp,
      goldGained: step.reward.gold + ARC_COMPLETION_BONUS.gold,
      leveledUp: xpResult.leveledUp || completionXp.leveledUp,
      prepLevelAfter: completionXp.level,
      message: `${step.label} complete. Arc bonus granted.`
    };
  }

  return {
    granted: true,
    kingdomId,
    prepXpGained: step.reward.prepXp,
    goldGained: step.reward.gold,
    leveledUp: xpResult.leveledUp,
    prepLevelAfter: xpResult.level,
    message: `${step.label} rewards granted.`
  };
}
