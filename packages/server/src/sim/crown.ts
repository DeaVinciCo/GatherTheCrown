export type CrownMode = 'story' | 'melee' | 'racing' | 'mini_game' | 'pve_dungeon' | 'pvp_competitive' | 'side_quest' | 'meta';

export interface CrownSlot {
  slotId: string;
  type: 'metal' | 'gem' | 'core';
  required: string;
  inserted?: string;
}

export interface CrownPuzzleState {
  id: string;
  mode: CrownMode;
  slots: CrownSlot[];
  completed: boolean;
  durability: number;
  maxDurability: number;
  shattered: boolean;
}

export interface CrownShatterResult {
  shattered: boolean;
  pulseSeconds?: number;
  fragmentsDropped?: number;
}

function createBaseSlots(mode: CrownMode): CrownSlot[] {
  const modeMap: Record<CrownMode, [string, string, string]> = {
    story: ['Starforged', 'Painite', 'Core'],
    melee: ['Gold', 'Topaz', 'Core'],
    racing: ['Aethersteel', 'Quartz', 'Core'],
    mini_game: ['Silver', 'Quartz', 'Core'],
    pve_dungeon: ['Bixbite', 'Alexandrite', 'Core'],
    pvp_competitive: ['Osmium', 'Jeremejevite', 'Core'],
    side_quest: ['Bronze', 'Spinel', 'Core'],
    meta: ['Starforged', 'Jeremejevite', 'Core']
  };

  const [metal, gem, core] = modeMap[mode];

  return [
    { slotId: 'metal-slot', type: 'metal', required: metal },
    { slotId: 'gem-slot', type: 'gem', required: gem },
    { slotId: 'core-slot', type: 'core', required: core }
  ];
}

export function createCrownPuzzle(id: string, mode: CrownMode, maxDurability = 100): CrownPuzzleState {
  return {
    id,
    mode,
    slots: createBaseSlots(mode),
    completed: false,
    durability: maxDurability,
    maxDurability,
    shattered: false
  };
}

export function insertCrownPiece(state: CrownPuzzleState, slotId: string, piece: string): boolean {
  const slot = state.slots.find((s) => s.slotId === slotId);
  if (!slot || state.shattered) {
    return false;
  }

  if (slot.required !== piece) {
    return false;
  }

  slot.inserted = piece;
  state.completed = state.slots.every((s) => !!s.inserted);
  return true;
}

export function applyCrownDurabilityLoss(state: CrownPuzzleState, amount: number): CrownShatterResult {
  if (state.shattered) {
    return { shattered: true, pulseSeconds: 8, fragmentsDropped: 0 };
  }

  state.durability = Math.max(0, state.durability - Math.max(0, amount));
  if (state.durability > 0) {
    return { shattered: false };
  }

  state.shattered = true;
  state.completed = false;
  for (const slot of state.slots) {
    slot.inserted = undefined;
  }

  return {
    shattered: true,
    pulseSeconds: 8,
    fragmentsDropped: 0
  };
}

export function repairCrown(state: CrownPuzzleState, amount: number): number {
  if (state.shattered) {
    return state.durability;
  }
  state.durability = Math.min(state.maxDurability, state.durability + Math.max(0, amount));
  return state.durability;
}
