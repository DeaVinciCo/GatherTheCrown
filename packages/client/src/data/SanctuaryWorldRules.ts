export interface SanctuaryDistrictRule {
  district: string;
  layoutRule: string;
  mixedResidents: string[];
}

export interface SanctuaryTransportRule {
  tier: number;
  mode: string;
  primaryUse: string;
  distanceBand: string;
  cargoCapacity: string;
}

export interface SanctuaryScaleRule {
  islandName: string;
  walkableMilesNorthSouth: number;
  walkableMilesEastWest: number;
  targetAreaSqMiles: number;
  lockReason: string;
}

export const SANCTUARY_MIXED_NEIGHBORHOOD_LAYOUT: SanctuaryDistrictRule[] = [
  {
    district: 'Market and Inne Belt',
    layoutRule: 'Blend service workers, rider households, and school families in the same blocks.',
    mixedResidents: ['vendors', 'dock runners', 'single-parent homes', 'travelers', 'apprentices']
  },
  {
    district: 'Open Ring and Awakening Yard Edge',
    layoutRule: 'Mix student-age locals with instructors and nearby family homes instead of isolating training households.',
    mixedResidents: ['field-years trainees', 'hearthway students', 'mentors', 'caretakers']
  },
  {
    district: 'Fishers Walk and Quiet Pier',
    layoutRule: 'Keep dock labor, fishers, and home life interwoven so coastal routines feel lived-in.',
    mixedResidents: ['fishers', 'boat crews', 'market families', 'retired riders']
  },
  {
    district: 'Hatchling Hallow Corridor',
    layoutRule: 'Combine hatchling care roles with nearby households and school overflow routes.',
    mixedResidents: ['hallow keepers', 'younger children', 'guardians', 'visiting trainees']
  }
];

export const SANCTUARY_TRANSPORT_HIERARCHY: SanctuaryTransportRule[] = [
  {
    tier: 1,
    mode: 'Walking',
    primaryUse: 'Default local movement',
    distanceBand: '0-1.2 miles',
    cargoCapacity: 'Personal carry only'
  },
  {
    tier: 2,
    mode: 'Handcart and wheelbarrow',
    primaryUse: 'Short-haul district supply movement',
    distanceBand: '0.3-1.5 miles',
    cargoCapacity: 'Light market and workshop goods'
  },
  {
    tier: 3,
    mode: 'Horse and pack pony',
    primaryUse: 'Cross-isle travel and field cargo',
    distanceBand: '1-3.5 miles',
    cargoCapacity: 'Medium loads and travel gear'
  },
  {
    tier: 4,
    mode: 'Buggy and cargo cart',
    primaryUse: 'Bulk district deliveries and school provisioning',
    distanceBand: '1-3.5 miles',
    cargoCapacity: 'Heavy goods and shared transport'
  },
  {
    tier: 5,
    mode: 'Skiff and small boat',
    primaryUse: 'Coastal and dock-to-dock transfer',
    distanceBand: 'Coastline routes only',
    cargoCapacity: 'Variable, weather dependent'
  }
];

export const SANCTUARY_LOCKED_SCALE: SanctuaryScaleRule = {
  islandName: 'Sanctuary Isle',
  walkableMilesNorthSouth: 2.0,
  walkableMilesEastWest: 1.75,
  targetAreaSqMiles: 3.5,
  lockReason: 'Keeps route planning readable, travel times meaningful, and community density emotionally coherent.'
};