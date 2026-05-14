/**
 * Dynamic street rotation system: different streets are emphasized based on time of day.
 * Morning: dock prep, school routes
 * Afternoon: market peak, training activity
 * Evening: tavern traffic, quiet pier activities
 */

import type { SanctuaryShift } from './SanctuaryNpcRoster';

export type SanctuaryStreetKey =
  | 'hearth_row'
  | 'inne_lane'
  | 'market_cross'
  | 'forge_turn'
  | 'poste_walk'
  | 'fishers_walk'
  | 'ring_path'
  | 'hallow_bend';

export interface StreetInfo {
  name: string;
  x: number;
  y: number;
  color: string;
  morningPurpose: string;
  afternoonPurpose: string;
  eveningPurpose: string;
}

export const SANCTUARY_STREETS: Record<SanctuaryStreetKey, StreetInfo> = {
  hearth_row: {
    name: 'Hearth Row',
    x: 380,
    y: 540,
    color: '#fde68a',
    morningPurpose: 'Innkeeper opens the hearth, early travelers.',
    afternoonPurpose: 'Visitor rotations and delivery staging.',
    eveningPurpose: 'Story hour and tavern overflow traffic.'
  },
  inne_lane: {
    name: 'Inne Lane',
    x: 640,
    y: 540,
    color: '#bfdbfe',
    morningPurpose: 'Inne staff prepares rooms, early check-outs.',
    afternoonPurpose: 'Guest arrivals and shift changes.',
    eveningPurpose: 'Late arrivals and rest preparations.'
  },
  market_cross: {
    name: 'Market Cross',
    x: 930,
    y: 540,
    color: '#bbf7d0',
    morningPurpose: 'Market opens, vendors setting up stalls.',
    afternoonPurpose: 'Peak market traffic, restocking between shifts.',
    eveningPurpose: 'Vendors closing and loading unsold goods.'
  },
  forge_turn: {
    name: 'Forge Turn',
    x: 1260,
    y: 540,
    color: '#fdba74',
    morningPurpose: 'Forge owner warming coals for the day.',
    afternoonPurpose: 'Apprentice repairs and maintenance work.',
    eveningPurpose: 'Final checks before evening close.'
  },
  poste_walk: {
    name: 'Poste Walk',
    x: 1550,
    y: 540,
    color: '#c4b5fd',
    morningPurpose: 'Poste Master sorting overnight deliveries.',
    afternoonPurpose: 'Counter rush, package pickups and routing.',
    eveningPurpose: 'Poste Master closing ledgers and routes.'
  },
  fishers_walk: {
    name: 'Fishers Walk',
    x: 930,
    y: 922,
    color: '#93c5fd',
    morningPurpose: 'Net prep, boat checks, tide planning.',
    afternoonPurpose: 'Catch sorting and dock relay shifts.',
    eveningPurpose: 'Quiet pier stories and gear drying.'
  },
  ring_path: {
    name: 'Ring Path',
    x: 300,
    y: 860,
    color: '#99f6e4',
    morningPurpose: 'Training prep and gear setup at Open Ring.',
    afternoonPurpose: 'Drill debrief and apprentice sparring.',
    eveningPurpose: 'Recovery meals and route planning.'
  },
  hallow_bend: {
    name: 'Hallow Bend',
    x: 1460,
    y: 860,
    color: '#f87171',
    morningPurpose: 'Hatchling feed rounds and calm starts.',
    afternoonPurpose: 'Care rotations and kid pickup loops.',
    eveningPurpose: 'Final hatchling checks and wind-down.'
  }
};

/**
 * Get the current purpose/description for a street based on shift.
 */
export function getStreetPurpose(streetKey: SanctuaryStreetKey, shift: SanctuaryShift): string {
  const street = SANCTUARY_STREETS[streetKey];
  if (!street) return 'Unknown street';
  
  if (shift === 'morning') return street.morningPurpose;
  if (shift === 'afternoon') return street.afternoonPurpose;
  return street.eveningPurpose;
}

/**
 * Get all streets sorted by emphasis for a given shift.
 * Morning: emphasizes dock (Fishers Walk), market opening, school routes (Ring Path)
 * Afternoon: emphasizes market peak, training, trading poste
 * Evening: emphasizes tavern (Hearth Row), quiet pier activities
 */
export function getStreetsForShift(shift: SanctuaryShift): SanctuaryStreetKey[] {
  if (shift === 'morning') {
    return ['fishers_walk', 'market_cross', 'ring_path', 'inne_lane', 'poste_walk', 'forge_turn', 'hearth_row', 'hallow_bend'];
  }
  if (shift === 'afternoon') {
    return ['market_cross', 'poste_walk', 'ring_path', 'forge_turn', 'fishers_walk', 'hallow_bend', 'inne_lane', 'hearth_row'];
  }
  // Evening
  return ['hearth_row', 'fishers_walk', 'inne_lane', 'poste_walk', 'ring_path', 'market_cross', 'hallow_bend', 'forge_turn'];
}

/**
 * Get the top emphasized streets for current shift (for request generation).
 * Preferences are rotated to vary errand routes throughout the day.
 */
export function getPrimaryStreetsForShift(shift: SanctuaryShift): SanctuaryStreetKey[] {
  if (shift === 'morning') {
    return ['fishers_walk', 'market_cross', 'ring_path']; // dock & training prep
  }
  if (shift === 'afternoon') {
    return ['market_cross', 'poste_walk', 'ring_path']; // market peak & training
  }
  // Evening
  return ['hearth_row', 'fishers_walk', 'inne_lane']; // tavern, dock, rest
}
