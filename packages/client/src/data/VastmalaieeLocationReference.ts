/**
 * VASTMALAISE KINGDOM - Location Reference
 * Swamp and forest with ancient magic and druidic traditions
 */

export interface VastmalaiseLocationEntry {
  id: string;
  officialName: string;
  casualName?: string;
  district: string;
  purpose: string;
  signageText: string;
}

export const VASTMALAISE_LOCATIONS: Record<string, VastmalaiseLocationEntry> = {
  kingdom: {
    id: 'kingdom',
    officialName: 'The Vastmalaise Kingdom',
    casualName: 'Vastmalaise',
    district: 'kingdom',
    purpose: 'Southern mystical realm with swamps, forests, and ancient magic',
    signageText: 'The Vastmalaise Kingdom'
  },
  dock: {
    id: 'dock',
    officialName: 'Misthaven Pier',
    casualName: 'the pier',
    district: 'harbour',
    purpose: 'Fog-shrouded pier extending into the mystical marshlands',
    signageText: 'Misthaven Pier'
  },
  town: {
    id: 'town',
    officialName: 'Enclave of Vastmalaise',
    casualName: 'Vastmalaise Enclave',
    district: 'enclave',
    purpose: 'Settlement built among ancient trees and within marshland groves',
    signageText: 'Enclave of Vastmalaise'
  },
  circleGrove: {
    id: 'circle_grove',
    officialName: 'Circle Grove',
    casualName: 'the circle',
    district: 'circle_grove',
    purpose: 'Meeting place for elder councils and magical ceremonies',
    signageText: 'Circle Grove'
  },
  herbGardens: {
    id: 'herb_gardens',
    officialName: 'Herb Gardens',
    casualName: 'the gardens',
    district: 'herb_gardens',
    purpose: 'Rare herbs, alchemical plants, and potion ingredients',
    signageText: 'Herb Gardens'
  },
  treeHalls: {
    id: 'tree_halls',
    officialName: 'Tree Halls',
    casualName: 'the halls',
    district: 'tree_halls',
    purpose: 'Dwellings carved within massive ancient trees',
    signageText: 'Tree Halls'
  },
  bogWatch: {
    id: 'bog_watch',
    officialName: 'Bog Watch',
    casualName: 'the watch',
    district: 'bog_watch',
    purpose: 'Observation and protective barriers for swampland dangers',
    signageText: 'Bog Watch'
  },
  mysticalWorkshops: {
    id: 'mystical_workshops',
    officialName: 'Mystical Workshops',
    casualName: 'the workshops',
    district: 'mystical_workshops',
    purpose: 'Locations for spell work, enchanting, and magical crafting',
    signageText: 'Mystical Workshops'
  },
  ancientRootspire: {
    id: 'ancient_rootspire',
    officialName: 'The Ancient Rootspire',
    casualName: 'rootspire',
    district: 'enclave',
    purpose: 'Massive primordial tree at the heart of Vastmalaise magic',
    signageText: 'The Ancient Rootspire'
  },
  mageSanctum: {
    id: 'mage_sanctum',
    officialName: 'Mage Sanctum',
    casualName: 'sanctum',
    district: 'circle_grove',
    purpose: 'Protected chamber for highest magical studies and artifacts',
    signageText: 'Mage Sanctum'
  }
};

/**
 * District emphasis rotations
 * Mystical rhythms guide activity cycles
 */
export const VASTMALAISE_DISTRICT_EMPHASIS = {
  morning: ['herb_gardens', 'tree_halls'], // Herb gathering at dawn, residents waking
  afternoon: ['circle_grove', 'mystical_workshops'], // Councils and magical work
  evening: ['bog_watch', 'ancient_rootspire'] // Night watch, mystical energies peak
};

export function getVastmalaiseLocationName(locationId: string): string {
  const loc = VASTMALAISE_LOCATIONS[locationId];
  return loc?.officialName || locationId;
}

export function getVastmalaiseCasualName(locationId: string): string {
  const loc = VASTMALAISE_LOCATIONS[locationId];
  return loc?.casualName || loc?.officialName || locationId;
}

// Backward compatibility aliases while downstream imports migrate.
export type VastmalaieeLocationEntry = VastmalaiseLocationEntry;
export const getVastmalaieeLocationName = getVastmalaiseLocationName;
export const getVastmalaieeCasualName = getVastmalaiseCasualName;
