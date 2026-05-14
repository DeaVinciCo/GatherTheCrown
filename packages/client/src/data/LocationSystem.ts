/**
 * LOCATION SYSTEM INDEX
 * 
 * Central hub for all location references, dock routing, and coordinate mapping.
 * This is the single source of truth for where heroes can travel and how to get there.
 */

import {
  ALL_KINGDOMS,
  getKingdomLocations,
  getLocationById,
  getKingdomDock,
  getKingdomMainTown,
  getAllDocks,
  DOCK_ENTRY_ROUTES,
  getMainlandJourneyRoute,
  type MainlandJourneyRoute
} from './WorldLocationReference';
import { MAINLAND_KINGDOMS, type MainlandKingdomId } from './KingdomNamingSystem';

import {
  SANCTUARY_LOCATIONS,
  getLocationByIdSanctuary,
  SANCTUARY_NAMESETS
} from './SanctuaryLocationReference';

import {
  ALDERMARCH_LOCATIONS,
  getAldermarchLocationName
} from './AldermarchiLocationReference';

import {
  STORMRAGE_LOCATIONS,
  getStormrageLocationName
} from './StormargeLocationReference';

import {
  VASTMALAISE_LOCATIONS,
  getVastmalaiseLocationName
} from './VastmalaieeLocationReference';

import {
  SUNWARD_LOCATIONS,
  getSunwardLocationName
} from './SunwardLocationReference';

/**
 * ═══════════════════════════════════════════════════════════════════
 * DOCK TRAVEL SYSTEM
 * ═══════════════════════════════════════════════════════════════════
 */

export interface DockTravelOption {
  destinationKingdomId: string;
  dockId: string;
  dockName: string;
  townId: string;
  townName: string;
  description: string;
  sceneToLoad: string; // Scene file to transition to
  travelTime: number; // In seconds
  requiresQuestCompletion?: string;
}

export interface MainlandTravelUiOption {
  kingdomId: MainlandKingdomId;
  kingdomName: string;
  routeId: string;
  mode: MainlandJourneyRoute['mode'];
  modeLabel: 'Land Crossing' | 'Boat Passage';
  standardDays: number;
  fastTravelDays?: number;
  weatherRiskDays?: number;
  summary: string;
}

/**
 * Available dock travel destinations from Haven
 */
export const DOCK_TRAVEL_OPTIONS: DockTravelOption[] = [
  {
    destinationKingdomId: 'sanctuary_isle',
    dockId: 'southferry_dock',
    dockName: 'SouthFerry Dock',
    townId: 'sanctuary_towne',
    townName: 'Sanctuary Towne',
    description: 'Protected island community - your safe home base',
    sceneToLoad: 'SanctuaryIsleOverworld',
    travelTime: 120,
    requiresQuestCompletion: undefined
  },
  {
    destinationKingdomId: 'aldermarch',
    dockId: 'merchant_harbour',
    dockName: 'Merchant Harbour',
    townId: 'aldermarch_towne',
    townName: 'Aldermarch Towne',
    description: 'Eastern trade hub governed by merchant councils',
    sceneToLoad: 'AldermarchiTowne',
    travelTime: 180,
    requiresQuestCompletion: 'chapter_1'
  },
  {
    destinationKingdomId: 'stormrage',
    dockId: 'thunderstrike_harbour',
    dockName: 'Thunderstrike Harbour',
    townId: 'stormrage_citadel',
    townName: 'Stormrage Citadel',
    description: 'Northern mountain stronghold of warriors and storm masters',
    sceneToLoad: 'StormrageCitadel',
    travelTime: 180,
    requiresQuestCompletion: 'chapter_1'
  },
  {
    destinationKingdomId: 'vastmalaise',
    dockId: 'misthaven_pier',
    dockName: 'Misthaven Pier',
    townId: 'vastmalaise_enclave',
    townName: 'Vastmalaise Enclave',
    description: 'Southern mystical realm of ancient magic and druidic councils',
    sceneToLoad: 'VastmalaiseEnclave',
    travelTime: 180,
    requiresQuestCompletion: 'chapter_1'
  },
  {
    destinationKingdomId: 'sunward',
    dockId: 'golden_cove',
    dockName: 'Golden Cove',
    townId: 'sunward_oasis',
    townName: 'Sunward Oasis',
    description: 'Western golden desert with sun-touched rulers and nomadic peoples',
    sceneToLoad: 'SunwardOasis',
    travelTime: 180,
    requiresQuestCompletion: 'chapter_1'
  }
];

/**
 * ═══════════════════════════════════════════════════════════════════
 * LOCATION NAMING UTILITIES
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Get the official name of any location in the game world
 */
export function getLocationName(locationId: string, kingdom?: string): string {
  // Try sanctuary first (most detailed)
  if (locationId in SANCTUARY_LOCATIONS) {
    const sanctuary = SANCTUARY_LOCATIONS[locationId as keyof typeof SANCTUARY_LOCATIONS];
    return sanctuary?.officialName || locationId;
  }

  // Then try specific kingdom
  if (kingdom === 'aldermarch' && locationId in ALDERMARCH_LOCATIONS) {
    const loc = ALDERMARCH_LOCATIONS[locationId as keyof typeof ALDERMARCH_LOCATIONS];
    return loc?.officialName || locationId;
  }
  if (kingdom === 'stormrage' && locationId in STORMRAGE_LOCATIONS) {
    const loc = STORMRAGE_LOCATIONS[locationId as keyof typeof STORMRAGE_LOCATIONS];
    return loc?.officialName || locationId;
  }
  if (kingdom === 'vastmalaise' && locationId in VASTMALAISE_LOCATIONS) {
    const loc = VASTMALAISE_LOCATIONS[locationId as keyof typeof VASTMALAISE_LOCATIONS];
    return loc?.officialName || locationId;
  }
  if (kingdom === 'sunward' && locationId in SUNWARD_LOCATIONS) {
    const loc = SUNWARD_LOCATIONS[locationId as keyof typeof SUNWARD_LOCATIONS];
    return loc?.officialName || locationId;
  }

  // Fall back to world reference
  const worldLoc = getLocationById(locationId);
  return worldLoc?.officialName || locationId;
}

/**
 * Get travel option by destination kingdom
 */
export function getDockTravelOption(
  kingdomId: string
): DockTravelOption | undefined {
  return DOCK_TRAVEL_OPTIONS.find(opt => opt.destinationKingdomId === kingdomId);
}

/**
 * Get all available travel destinations (for UI menus)
 */
export function getAvailableTravelDestinations(): DockTravelOption[] {
  return DOCK_TRAVEL_OPTIONS;
}

/**
 * Check if hero has completed quest required for travel
 */
export function canTravelToKingdom(
  kingdomId: string,
  completedQuests: string[]
): boolean {
  const option = getDockTravelOption(kingdomId);
  if (!option?.requiresQuestCompletion) return true;
  return completedQuests.includes(option.requiresQuestCompletion);
}

/**
 * Mainland travel options enriched with canonical route mode data.
 * Use this for UI when presenting kingdom destination selection.
 */
export function getMainlandTravelUiOptions(): MainlandTravelUiOption[] {
  const order: MainlandKingdomId[] = ['aldermarch', 'stormrage', 'vastmalaise', 'sunward'];

  return order.map((kingdomId) => {
    const route = getMainlandJourneyRoute(kingdomId);
    const nameSet = MAINLAND_KINGDOMS[kingdomId];
    const isLand = route?.mode === 'land_crossing';
    const modeLabel: MainlandTravelUiOption['modeLabel'] = isLand ? 'Land Crossing' : 'Boat Passage';

    return {
      kingdomId,
      kingdomName: nameSet.casualName,
      routeId: route?.id ?? `unknown_${kingdomId}_route`,
      mode: route?.mode ?? 'boat_passage',
      modeLabel,
      standardDays: route?.standardDays ?? 2,
      fastTravelDays: route?.fastTravelDays,
      weatherRiskDays: route?.weatherRiskDays,
      summary: route?.cadenceNote ?? (isLand
        ? 'Mainland route using overland crossing lanes.'
        : 'Mainland route using scheduled dock passage.')
    };
  });
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * DOCK COORDINATES & POSITIONING
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Maps game world dock positions for navigation and scene transitions
 */

export const DOCK_WORLD_POSITIONS: Record<string, { x: number; y: number }> = {
  // Sanctuary Isle docks
  'southferry_dock': { x: 800, y: 600 },
  'tidewater_pier': { x: 750, y: 620 },
  'driftwood_wharf': { x: 850, y: 580 },

  // Aldermarch docks
  'merchant_harbour': { x: 1200, y: 400 },

  // Stormrage docks
  'thunderstrike_harbour': { x: 1000, y: 200 },

  // Vastmalaise docks
  'misthaven_pier': { x: 1100, y: 800 },

  // Sunward docks
  'golden_cove': { x: 500, y: 700 }
};

export const KINGDOM_TOWN_CENTERS: Record<string, { x: number; y: number }> = {
  'sanctuary_towne': { x: 800, y: 500 },
  'aldermarch_towne': { x: 1200, y: 300 },
  'stormrage_citadel': { x: 1000, y: 100 },
  'vastmalaise_enclave': { x: 1100, y: 700 },
  'sunward_oasis': { x: 500, y: 600 }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * RE-EXPORTS FOR CONVENIENCE
 * ═══════════════════════════════════════════════════════════════════
 */

export {
  ALL_KINGDOMS,
  getKingdomLocations,
  getLocationById,
  getKingdomDock,
  getKingdomMainTown,
  getAllDocks,
  DOCK_ENTRY_ROUTES
} from './WorldLocationReference';

export {
  SANCTUARY_LOCATIONS,
  SANCTUARY_NAMESETS
} from './SanctuaryLocationReference';

export {
  ALDERMARCH_LOCATIONS,
  ALDERMARCH_DISTRICT_EMPHASIS
} from './AldermarchiLocationReference';

export {
  STORMRAGE_LOCATIONS,
  STORMRAGE_DISTRICT_EMPHASIS
} from './StormargeLocationReference';

export {
  VASTMALAISE_LOCATIONS,
  VASTMALAISE_DISTRICT_EMPHASIS
} from './VastmalaieeLocationReference';

export {
  SUNWARD_LOCATIONS,
  SUNWARD_DISTRICT_EMPHASIS
} from './SunwardLocationReference';
