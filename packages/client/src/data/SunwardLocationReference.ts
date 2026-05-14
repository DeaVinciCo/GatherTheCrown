/**
 * SUNWARD KINGDOM - Location Reference
 * Golden desert with sun-based magic and nomadic traditions
 */

export interface SunwardLocationEntry {
  id: string;
  officialName: string;
  casualName?: string;
  district: string;
  purpose: string;
  signageText: string;
}

export const SUNWARD_LOCATIONS: Record<string, SunwardLocationEntry> = {
  kingdom: {
    id: 'kingdom',
    officialName: 'The Sunward Kingdom',
    casualName: 'Sunward',
    district: 'kingdom',
    purpose: 'Western desert realm with sun magic and nomadic traditions',
    signageText: 'The Sunward Kingdom'
  },
  dock: {
    id: 'dock',
    officialName: 'Golden Cove',
    casualName: 'the cove',
    district: 'harbour',
    purpose: 'Coastal harbor where desert meets sea',
    signageText: 'Golden Cove'
  },
  town: {
    id: 'town',
    officialName: 'Oasis of Sunward',
    casualName: 'Sunward Oasis',
    district: 'oasis',
    purpose: 'Central settlement built around life-giving oasis with sun temples',
    signageText: 'Oasis of Sunward'
  },
  sunTempleSquare: {
    id: 'sun_temple_square',
    officialName: 'Sun Temple Square',
    casualName: 'temple square',
    district: 'sun_temple_square',
    purpose: 'Sacred spaces for sun worship and pharaonic ceremonies',
    signageText: 'Sun Temple Square'
  },
  nomadQuarters: {
    id: 'nomad_quarters',
    officialName: 'Nomad Quarters',
    casualName: 'nomad quarters',
    district: 'nomad_quarters',
    purpose: 'Gathering place for desert travelers and nomadic tribes',
    signageText: 'Nomad Quarters'
  },
  spiceBazaar: {
    id: 'spice_bazaar',
    officialName: 'Spice Bazaar',
    casualName: 'the bazaar',
    district: 'spice_bazaar',
    purpose: 'Market for exotic desert goods, spices, and silks',
    signageText: 'Spice Bazaar'
  },
  oasisGardens: {
    id: 'oasis_gardens',
    officialName: 'Oasis Gardens',
    casualName: 'the gardens',
    district: 'oasis_gardens',
    purpose: 'Lush date palms and water gardens powered by sun magic',
    signageText: 'Oasis Gardens'
  },
  solarWorkshops: {
    id: 'solar_workshops',
    officialName: 'Solar Workshops',
    casualName: 'workshops',
    district: 'solar_workshops',
    purpose: 'Crafting centers harnessing sun energy for alchemy and forging',
    signageText: 'Solar Workshops'
  },
  pharaonicPalace: {
    id: 'pharaonic_palace',
    officialName: 'Pharaonic Palace',
    casualName: 'the palace',
    district: 'sun_temple_square',
    purpose: 'Grand palace where sun-touched rulers hold council and court',
    signageText: 'Pharaonic Palace'
  },
  sunObservatory: {
    id: 'sun_observatory',
    officialName: 'Sun Observatory',
    casualName: 'the observatory',
    district: 'solar_workshops',
    purpose: 'Tower for tracking sun cycles and channeling solar magic',
    signageText: 'Sun Observatory'
  }
};

/**
 * District emphasis rotations
 * Sun cycles determine activity and energy flow
 */
export const SUNWARD_DISTRICT_EMPHASIS = {
  morning: ['sun_temple_square', 'solar_workshops'], // Sun worship at dawn, crafters begin
  afternoon: ['spice_bazaar', 'oasis_gardens'], // Markets and gardens peak with sun energy
  evening: ['nomad_quarters', 'pharaonic_palace'] // Gatherings and ceremonies as sun sets
};

export function getSunwardLocationName(locationId: string): string {
  const loc = SUNWARD_LOCATIONS[locationId];
  return loc?.officialName || locationId;
}

export function getSunwardCasualName(locationId: string): string {
  const loc = SUNWARD_LOCATIONS[locationId];
  return loc?.casualName || loc?.officialName || locationId;
}
