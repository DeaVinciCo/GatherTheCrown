/**
 * STORMRAGE KINGDOM - Location Reference
 * Mountain stronghold with warrior traditions and storm mastery
 */

export interface StormrageLocationEntry {
  id: string;
  officialName: string;
  casualName?: string;
  district: string;
  purpose: string;
  signageText: string;
}

export const STORMRAGE_LOCATIONS: Record<string, StormrageLocationEntry> = {
  kingdom: {
    id: 'kingdom',
    officialName: 'The Stormrage Kingdom',
    casualName: 'Stormrage',
    district: 'kingdom',
    purpose: 'Northern mountain stronghold with warrior traditions and storm mastery',
    signageText: 'The Stormrage Kingdom'
  },
  dock: {
    id: 'dock',
    officialName: 'Thunderstrike Harbour',
    casualName: 'the harbour',
    district: 'harbour',
    purpose: 'Cliff-carved harbor weathering fierce mountain storms',
    signageText: 'Thunderstrike Harbour'
  },
  town: {
    id: 'town',
    officialName: 'Citadel of Stormrage',
    casualName: 'Stormrage Citadel',
    district: 'citadel',
    purpose: 'Mountain-built stronghold with warrior training and war chambers',
    signageText: 'Citadel of Stormrage'
  },
  warriorsRow: {
    id: 'warriors_row',
    officialName: "Warrior's Row",
    casualName: "warrior's row",
    district: 'warriors_row',
    purpose: 'Combat training grounds and battle halls',
    signageText: "Warrior's Row"
  },
  forgeHalls: {
    id: 'forge_halls',
    officialName: 'Forge Halls',
    casualName: 'the forges',
    district: 'forge_halls',
    purpose: 'Master blacksmiths and weapon smiths at the heart of equipment',
    signageText: 'Forge Halls'
  },
  clanQuarters: {
    id: 'clan_quarters',
    officialName: 'Clan Quarters',
    casualName: 'the quarters',
    district: 'clan_quarters',
    purpose: 'Family halls and clan meeting chambers',
    signageText: 'Clan Quarters'
  },
  stormWatch: {
    id: 'storm_watch',
    officialName: 'Storm Watch',
    casualName: 'the watch',
    district: 'storm_watch',
    purpose: 'Weather observation and storm tracking chambers',
    signageText: 'Storm Watch'
  },
  victoryHall: {
    id: 'victory_hall',
    officialName: 'Victory Hall',
    casualName: 'the hall',
    district: 'citadel',
    purpose: 'Great hall for feasts, celebrations, and war announcements',
    signageText: 'Victory Hall'
  },
  thunderpeakAnvil: {
    id: 'thunderpeak_anvil',
    officialName: 'Thunderpeak Anvil',
    casualName: 'thunderpeak',
    district: 'forge_halls',
    purpose: 'The master forge where legendary weapons are crafted',
    signageText: 'Thunderpeak Anvil'
  },
  warCouncilChamber: {
    id: 'war_council_chamber',
    officialName: 'War Council Chamber',
    casualName: 'war council',
    district: 'clan_quarters',
    purpose: 'Strategic planning hall where clan leaders gather',
    signageText: 'War Council Chamber'
  }
};

/**
 * District emphasis rotations
 * Warrior culture drives different activity by time of day
 */
export const STORMRAGE_DISTRICT_EMPHASIS = {
  morning: ['warriors_row', 'storm_watch'], // Training grounds active, storm watches shift
  afternoon: ['forge_halls', 'thunderpeak_anvil'], // Forges working peak hours
  evening: ['victory_hall', 'clan_quarters'] // Gatherings and clan meetings
};

export function getStormrageLocationName(locationId: string): string {
  const loc = STORMRAGE_LOCATIONS[locationId];
  return loc?.officialName || locationId;
}

export function getStormrageCasualName(locationId: string): string {
  const loc = STORMRAGE_LOCATIONS[locationId];
  return loc?.casualName || loc?.officialName || locationId;
}

// Backward compatibility aliases while downstream imports migrate.
export type StormargeLocationEntry = StormrageLocationEntry;
export const getStormagLocationName = getStormrageLocationName;
