/**
 * WORLD LOCATION REFERENCE
 * 
 * Unified system for all named locations across the game world.
 * Each kingdom, town, and location is defined once and referenced throughout.
 * 
 * Naming Convention:
 * - Archaic English terms: towne, inne, poste, etc.
 * - Descriptive and purposeful names
 * - Consistent across all scenes and systems
 */

export interface LocationEntry {
  id: string;
  officialName: string;
  casualName?: string;
  description: string;
  category: 'region' | 'kingdom' | 'town' | 'district' | 'landmark' | 'dock';
  theme?: string;
  parentLocationId?: string; // Links to parent region/kingdom
}

export interface KingdomLocationSet {
  kingdom: {
    id: string;
    officialName: string;
    casualName: string;
    theme: string;
    description: string;
  };
  primaryDock: LocationEntry;
  mainTown: LocationEntry;
  districts: LocationEntry[];
  landmarks: LocationEntry[];
  notableLocations: LocationEntry[];
}

export interface JourneyActivityStop {
  id: string;
  mileMarker: number;
  name: string;
  activity: 'camp' | 'forage' | 'fishing' | 'creat_watering_hole' | 'landmark';
  note: string;
  concealmentLevel?: 'low' | 'medium' | 'high';
  traversalUse?: 'hide_from_enemy' | 'search_for_items' | 'safe_overnight_camp' | 'scouting';
  terrainFeatures?: Array<'mini_forest' | 'shrubbery' | 'rock_outcrop' | 'reedbank' | 'detached_ridge'>;
}

export interface MainlandRouteSegment {
  id: string;
  startMile: number;
  endMile: number;
  shape: 'curve' | 'switchback' | 'narrow_straight';
  branchType: 'mainline' | 'semi_detached';
  cover: 'open' | 'green_cover' | 'rock_cover' | 'mixed';
  travelNote: string;
}

export interface MainlandJourneyRoute {
  id: string;
  fromKingdomId: 'sanctuary_isle';
  toKingdomId: 'aldermarch' | 'stormrage' | 'vastmalaise' | 'sunward';
  mode: 'land_crossing' | 'boat_passage';
  distanceMiles?: number;
  routeWidthMiles?: number;
  standardDays: number;
  fastTravelDays?: number;
  weatherRiskDays?: number;
  activityStops: JourneyActivityStop[];
  pathSegments?: MainlandRouteSegment[];
  cadenceNote?: string;
  enemyRoster: string[];
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * SANCTUARY ISLE - Primary Safe-Home Region
 * ═══════════════════════════════════════════════════════════════════
 */

export const SANCTUARY_ISLE_REGION: KingdomLocationSet = {
  kingdom: {
    id: 'sanctuary_isle',
    officialName: 'The Isle of Sanctuary',
    casualName: 'Sanctuary Isle',
    theme: 'Protected island community with harbor traditions',
    description: 'A protected island community and home to riders, caretakers, families, and travelers.'
  },
  primaryDock: {
    id: 'southferry_dock',
    officialName: 'SouthFerry Dock',
    description: 'Main travel dock connecting Sanctuary Isle to the mainland kingdoms and beyond.',
    category: 'dock',
    parentLocationId: 'sanctuary_isle'
  },
  mainTown: {
    id: 'sanctuary_towne',
    officialName: 'Towne of Sanctuary Isle',
    casualName: 'Sanctuary Towne',
    description: 'Main social and service hub with streets, inns, trades, and training grounds.',
    category: 'town',
    parentLocationId: 'sanctuary_isle'
  },
  districts: [
    {
      id: 'hearth_row',
      officialName: 'Hearth Row',
      description: 'Warm gathering place with taverns and community centers. Morning emphasis.',
      category: 'district',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'inne_lane',
      officialName: 'Inne Lane',
      description: 'Rest hubs and overnight prep points. Afternoon emphasis.',
      category: 'district',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'market_cross',
      officialName: 'Market Cross',
      description: 'Open-air stalls and rotating goods from gatherers and traders.',
      category: 'district',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'forge_turn',
      officialName: 'Forge Turn',
      description: 'Weapons, armor, and forge-side upgrade services. Evening emphasis.',
      category: 'district',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'poste_walk',
      officialName: 'Poste Walk',
      description: 'Core exchange point for goods, requests, and route supplies.',
      category: 'district',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'fishers_walk',
      officialName: "Fisher's Walk",
      description: 'Social fishing strip with local chatter and foot traffic along the piers.',
      category: 'district',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'ring_path',
      officialName: 'Ring Path',
      description: 'Circular training and sparring grounds for combat practice.',
      category: 'district',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'hallow_bend',
      officialName: 'Hallow Bend',
      description: 'Quiet reflection area with herb shops and healing services.',
      category: 'district',
      parentLocationId: 'sanctuary_towne'
    }
  ],
  landmarks: [
    {
      id: 'ye_wandering_hearth',
      officialName: 'Ye Wandering Hearth',
      description: 'Traveler gathering, rumor exchange, and social anchor point.',
      category: 'landmark',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'sleep_inne',
      officialName: 'Sleep Inne Sanctuary',
      description: 'Rest hub and overnight prep point for outbound runs.',
      category: 'landmark',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'isle_iron_smitty',
      officialName: 'Isle Iron Smitty',
      description: 'Weapons, armor service, and forge-side upgrade guidance.',
      category: 'landmark',
      parentLocationId: 'sanctuary_towne'
    },
    {
      id: 'herb_brew_isle',
      officialName: 'Herb & Brew Isle',
      description: 'Potion prep, herb work, and gentle starter alchemy.',
      category: 'landmark',
      parentLocationId: 'sanctuary_towne'
    }
  ],
  notableLocations: [
    {
      id: 'tidewater_pier',
      officialName: 'Tidewater Pier',
      description: 'Primary dock lane for arrivals and active fishing.',
      category: 'landmark',
      parentLocationId: 'sanctuary_isle'
    },
    {
      id: 'northwatch_cliffs',
      officialName: 'Northwatch Cliffs',
      description: 'Wind-swept northern bluff where riders can see storms and ships first.',
      category: 'landmark',
      parentLocationId: 'sanctuary_isle'
    },
    {
      id: 'greenwood_trail',
      officialName: 'Greenwood Trail',
      description: 'Winding wooded trail into private rider clearings and training grounds.',
      category: 'landmark',
      parentLocationId: 'sanctuary_isle'
    },
    {
      id: 'saltroot_landgate',
      officialName: 'Saltroot Landgate',
      description: 'Only sanctioned overland departure from Sanctuary Isle toward the mainland crossing route.',
      category: 'landmark',
      parentLocationId: 'sanctuary_isle'
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * ALDERMARCH KINGDOM - Eastern Trade Hub
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Theme: Merchant city with old family trading houses
 * Politics: Council of Merchant Lords
 * Accent: Prosperous, established, dignified
 */

export const ALDERMARCH_KINGDOM: KingdomLocationSet = {
  kingdom: {
    id: 'aldermarch',
    officialName: 'The Kingdom of Aldermarch',
    casualName: 'Aldermarch',
    theme: 'Merchant city with established trading houses and political councils',
    description: 'An eastern trade hub governed by merchant lords and family councils. Known for commerce, negotiations, and merchant traditions.'
  },
  primaryDock: {
    id: 'merchant_harbour',
    officialName: 'Merchant Harbour',
    description: 'Primary trade dock connecting to Sanctuary Isle and beyond. Center of commerce.',
    category: 'dock',
    parentLocationId: 'aldermarch'
  },
  mainTown: {
    id: 'aldermarch_towne',
    officialName: 'Towne of Aldermarch',
    casualName: 'Aldermarch Towne',
    description: 'Bustling merchant city with trading houses, guild halls, and market centers.',
    category: 'town',
    parentLocationId: 'aldermarch'
  },
  districts: [
    {
      id: 'lord_chamber',
      officialName: 'Lord Chamber District',
      description: 'Wealthy merchant houses and council meeting halls. Political center.',
      category: 'district',
      parentLocationId: 'aldermarch_towne'
    },
    {
      id: 'guild_quarter',
      officialName: 'Guild Quarter',
      description: 'Crafter guilds, artificers, and skilled tradespersons.',
      category: 'district',
      parentLocationId: 'aldermarch_towne'
    },
    {
      id: 'vault_row',
      officialName: 'Vault Row',
      description: 'Banking houses, treasuries, and secure trading exchanges.',
      category: 'district',
      parentLocationId: 'aldermarch_towne'
    },
    {
      id: 'caravan_square',
      officialName: 'Caravan Square',
      description: 'Arrival and departure point for merchant caravans and supply routes.',
      category: 'district',
      parentLocationId: 'aldermarch_towne'
    },
    {
      id: 'traders_rest',
      officialName: "Trader's Rest",
      description: 'Inns and hospitality establishments for traveling merchants.',
      category: 'district',
      parentLocationId: 'aldermarch_towne'
    }
  ],
  landmarks: [
    {
      id: 'grand_exchange',
      officialName: 'The Grand Exchange',
      description: 'Central marketplace where all major trades and negotiations occur.',
      category: 'landmark',
      parentLocationId: 'aldermarch_towne'
    },
    {
      id: 'merchant_lodge',
      officialName: 'Merchant Lodge',
      description: 'Guild hall and gathering place for traders and craftspeople.',
      category: 'landmark',
      parentLocationId: 'aldermarch_towne'
    }
  ],
  notableLocations: [
    {
      id: 'trade_road',
      officialName: 'The Trade Road',
      description: 'Main thoroughfare connecting harbor to city center.',
      category: 'landmark',
      parentLocationId: 'aldermarch'
    },
    {
      id: 'westward_causeway_gate',
      officialName: 'Westward Causeway Gate',
      description: 'Landfall gate where the Sanctuary crossing route enters Aldermarch territory.',
      category: 'landmark',
      parentLocationId: 'aldermarch'
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * STORMRAGE KINGDOM - Northern Warrior Stronghold
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Theme: Mountain stronghold with warrior traditions and storm mastery
 * Politics: War Council and Clan Leaders
 * Accent: Bold, honorable, weather-touched
 */

export const STORMRAGE_KINGDOM: KingdomLocationSet = {
  kingdom: {
    id: 'stormrage',
    officialName: 'The Stormrage Kingdom',
    casualName: 'Stormrage',
    theme: 'Mountain stronghold with warrior traditions and storm mastery',
    description: 'A northern stronghold built into mountainous terrain, where warriors train and storms gather. Governed by clan leaders and war councils.'
  },
  primaryDock: {
    id: 'thunderstrike_harbour',
    officialName: 'Thunderstrike Harbour',
    description: 'Northern harbor carved into cliff face, weathering fierce storms. Entry point to Stormrage.',
    category: 'dock',
    parentLocationId: 'stormrage'
  },
  mainTown: {
    id: 'stormrage_citadel',
    officialName: 'Citadel of Stormrage',
    casualName: 'Stormrage Citadel',
    description: 'Mountain-built stronghold with warrior training halls, forges, and war chambers.',
    category: 'town',
    parentLocationId: 'stormrage'
  },
  districts: [
    {
      id: 'warriors_row',
      officialName: "Warrior's Row",
      description: 'Combat training grounds and battle halls. Center of martial discipline.',
      category: 'district',
      parentLocationId: 'stormrage_citadel'
    },
    {
      id: 'forge_halls',
      officialName: 'Forge Halls',
      description: 'Master blacksmiths and weapon smiths. Equipment heart.',
      category: 'district',
      parentLocationId: 'stormrage_citadel'
    },
    {
      id: 'clan_quarters',
      officialName: 'Clan Quarters',
      description: 'Family halls and clan meeting chambers.',
      category: 'district',
      parentLocationId: 'stormrage_citadel'
    },
    {
      id: 'storm_watch',
      officialName: 'Storm Watch',
      description: 'Weather observation tower and storm tracking chambers.',
      category: 'district',
      parentLocationId: 'stormrage_citadel'
    },
    {
      id: 'victory_hall',
      officialName: 'Victory Hall',
      description: 'Great hall for feasts, celebrations, and war announcements.',
      category: 'district',
      parentLocationId: 'stormrage_citadel'
    }
  ],
  landmarks: [
    {
      id: 'thunderpeak_anvil',
      officialName: 'Thunderpeak Anvil',
      description: 'The master forge where legendary weapons are crafted.',
      category: 'landmark',
      parentLocationId: 'stormrage_citadel'
    },
    {
      id: 'war_council_chamber',
      officialName: 'War Council Chamber',
      description: 'Strategic planning hall where clan leaders gather.',
      category: 'landmark',
      parentLocationId: 'stormrage_citadel'
    }
  ],
  notableLocations: [
    {
      id: 'mountain_pass',
      officialName: 'Mountain Pass',
      description: 'Gateway path up to the citadel from the harbor.',
      category: 'landmark',
      parentLocationId: 'stormrage'
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * VASTMALAISE KINGDOM - Southern Mystical Reaches
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Theme: Swamp and forest with ancient magic and mystery
 * Politics: Circle of Elders (Mages and Druids)
 * Accent: Mysterious, ancient, magical
 */

export const VASTMALAISE_KINGDOM: KingdomLocationSet = {
  kingdom: {
    id: 'vastmalaise',
    officialName: 'The Vastmalaise Kingdom',
    casualName: 'Vastmalaise',
    theme: 'Swamp and forest with ancient magic and druidic traditions',
    description: 'A southern mystical realm where swamps and ancient forests hold magic. Governed by circles of elders and druids.'
  },
  primaryDock: {
    id: 'misthaven_pier',
    officialName: 'Misthaven Pier',
    description: 'Fog-shrouded pier extending into the marshlands. Gateway to Vastmalaise mystique.',
    category: 'dock',
    parentLocationId: 'vastmalaise'
  },
  mainTown: {
    id: 'vastmalaise_enclave',
    officialName: 'Enclave of Vastmalaise',
    casualName: 'Vastmalaise Enclave',
    description: 'Settlement built among ancient trees and within marshland groves. Heart of magic.',
    category: 'town',
    parentLocationId: 'vastmalaise'
  },
  districts: [
    {
      id: 'circle_grove',
      officialName: 'Circle Grove',
      description: 'Meeting place for elder councils and magical ceremonies.',
      category: 'district',
      parentLocationId: 'vastmalaise_enclave'
    },
    {
      id: 'herb_gardens',
      officialName: 'Herb Gardens',
      description: 'Vast gardens of rare herbs, alchemical plants, and potion ingredients.',
      category: 'district',
      parentLocationId: 'vastmalaise_enclave'
    },
    {
      id: 'tree_halls',
      officialName: 'Tree Halls',
      description: 'Dwellings carved within massive ancient trees.',
      category: 'district',
      parentLocationId: 'vastmalaise_enclave'
    },
    {
      id: 'bog_watch',
      officialName: 'Bog Watch',
      description: 'Observation and protective barriers for swampland dangers.',
      category: 'district',
      parentLocationId: 'vastmalaise_enclave'
    },
    {
      id: 'mystical_workshops',
      officialName: 'Mystical Workshops',
      description: 'Locations for spell work, enchanting, and magical crafting.',
      category: 'district',
      parentLocationId: 'vastmalaise_enclave'
    }
  ],
  landmarks: [
    {
      id: 'ancient_rootspire',
      officialName: 'The Ancient Rootspire',
      description: 'Massive primordial tree at the heart of Vastmalaise magic.',
      category: 'landmark',
      parentLocationId: 'vastmalaise_enclave'
    },
    {
      id: 'mage_sanctum',
      officialName: 'Mage Sanctum',
      description: 'Protected chamber for the highest magical studies and artifacts.',
      category: 'landmark',
      parentLocationId: 'vastmalaise_enclave'
    }
  ],
  notableLocations: [
    {
      id: 'marsh_trails',
      officialName: 'Marsh Trails',
      description: 'Guided paths through dangerous marshlands to the enclave.',
      category: 'landmark',
      parentLocationId: 'vastmalaise'
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * SUNWARD KINGDOM - Western Golden Desert
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Theme: Desert civilization with sun-based magic and nomadic traditions
 * Politics: Pharaonic Council (Sun-touched Leaders)
 * Accent: Prosperous, sun-blessed, nomadic
 */

export const SUNWARD_KINGDOM: KingdomLocationSet = {
  kingdom: {
    id: 'sunward',
    officialName: 'The Sunward Kingdom',
    casualName: 'Sunward',
    theme: 'Golden desert with sun magic and nomadic traditions',
    description: 'A western desert realm where sun magic reigns and nomadic peoples thrive. Ruled by sun-touched pharaonic councils.'
  },
  primaryDock: {
    id: 'golden_cove',
    officialName: 'Golden Cove',
    description: 'Coastal harbor where desert meets sea. Gateway to Sunward prosperity.',
    category: 'dock',
    parentLocationId: 'sunward'
  },
  mainTown: {
    id: 'sunward_oasis',
    officialName: 'Oasis of Sunward',
    casualName: 'Sunward Oasis',
    description: 'Central settlement built around life-giving oasis with sun temples and trading centers.',
    category: 'town',
    parentLocationId: 'sunward'
  },
  districts: [
    {
      id: 'sun_temple_square',
      officialName: 'Sun Temple Square',
      description: 'Sacred spaces for sun worship and pharaonic ceremonies.',
      category: 'district',
      parentLocationId: 'sunward_oasis'
    },
    {
      id: 'nomad_quarters',
      officialName: 'Nomad Quarters',
      description: 'Gathering place for desert travelers and nomadic tribes.',
      category: 'district',
      parentLocationId: 'sunward_oasis'
    },
    {
      id: 'spice_bazaar',
      officialName: 'Spice Bazaar',
      description: 'Market for exotic desert goods, spices, and silks.',
      category: 'district',
      parentLocationId: 'sunward_oasis'
    },
    {
      id: 'oasis_gardens',
      officialName: 'Oasis Gardens',
      description: 'Lush date palms and water gardens powered by sun magic.',
      category: 'district',
      parentLocationId: 'sunward_oasis'
    },
    {
      id: 'solar_workshops',
      officialName: 'Solar Workshops',
      description: 'Crafting centers harnessing sun energy for alchemy and forging.',
      category: 'district',
      parentLocationId: 'sunward_oasis'
    }
  ],
  landmarks: [
    {
      id: 'pharaonic_palace',
      officialName: 'Pharaonic Palace',
      description: 'Grand palace where sun-touched rulers hold council and court.',
      category: 'landmark',
      parentLocationId: 'sunward_oasis'
    },
    {
      id: 'sun_observatory',
      officialName: 'Sun Observatory',
      description: 'Tower for tracking sun cycles and channeling solar magic.',
      category: 'landmark',
      parentLocationId: 'sunward_oasis'
    }
  ],
  notableLocations: [
    {
      id: 'desert_caravan_route',
      officialName: 'Desert Caravan Route',
      description: 'Main trade path connecting coast to oasis through dunes.',
      category: 'landmark',
      parentLocationId: 'sunward'
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * MASTER LOCATION INDEX
 * ═══════════════════════════════════════════════════════════════════
 */

export const ALL_KINGDOMS = [
  SANCTUARY_ISLE_REGION,
  ALDERMARCH_KINGDOM,
  STORMRAGE_KINGDOM,
  VASTMALAISE_KINGDOM,
  SUNWARD_KINGDOM
];

/**
 * Get all locations for a specific kingdom
 */
export function getKingdomLocations(kingdomId: string): KingdomLocationSet | undefined {
  return ALL_KINGDOMS.find(k => k.kingdom.id === kingdomId);
}

/**
 * Get a location by ID across all kingdoms
 */
export function getLocationById(locationId: string): LocationEntry | undefined {
  for (const kingdom of ALL_KINGDOMS) {
    const allLocs = [
      kingdom.primaryDock,
      kingdom.mainTown,
      ...kingdom.districts,
      ...kingdom.landmarks,
      ...kingdom.notableLocations
    ];
    const found = allLocs.find(loc => loc.id === locationId);
    if (found) return found;
  }
  return undefined;
}

/**
 * Get dock information for a kingdom
 */
export function getKingdomDock(kingdomId: string) {
  const kingdom = getKingdomLocations(kingdomId);
  return kingdom?.primaryDock;
}

/**
 * Get main town for a kingdom
 */
export function getKingdomMainTown(kingdomId: string) {
  const kingdom = getKingdomLocations(kingdomId);
  return kingdom?.mainTown;
}

/**
 * List all docks in the game world
 */
export function getAllDocks(): LocationEntry[] {
  return ALL_KINGDOMS.map(k => k.primaryDock);
}

/**
 * Get dock entry point routes
 * Maps which scene a hero should arrive at from which origin
 */
export const DOCK_ENTRY_ROUTES = {
  'haven_to_sanctuary': 'southferry_dock',
  'haven_to_aldermarch': 'saltroot_landgate',
  'haven_to_stormrage': 'thunderstrike_harbour',
  'haven_to_vastmalaise': 'misthaven_pier',
  'haven_to_sunward': 'golden_cove',
  'forest_trials_to_sanctuary': 'southferry_dock',
  'forest_trials_to_aldermarch': 'saltroot_landgate',
  'forest_trials_to_stormrage': 'thunderstrike_harbour',
  'forest_trials_to_vastmalaise': 'misthaven_pier',
  'forest_trials_to_sunward': 'golden_cove'
} as const;

/**
 * Mainland journey canon for the four-kingdom starter arc:
 * - Only Kingdom 1 (Aldermarch) connects by land.
 * - Stormrage, Vastmalaise, and Sunward remain water passage routes.
 */
export const MAINLAND_JOURNEY_ROUTES: MainlandJourneyRoute[] = [
  {
    id: 'sanctuary_to_aldermarch_land_crossing',
    fromKingdomId: 'sanctuary_isle',
    toKingdomId: 'aldermarch',
    mode: 'land_crossing',
    distanceMiles: 10,
    routeWidthMiles: 0.5,
    standardDays: 3,
    fastTravelDays: 2,
    weatherRiskDays: 4,
    cadenceNote: 'The crossing follows an older curved foot-lane usually traveled about once a month by couriers, fishers, and small supply parties.',
    pathSegments: [
      {
        id: 'saltroot_s_bend',
        startMile: 0,
        endMile: 1.9,
        shape: 'curve',
        branchType: 'mainline',
        cover: 'green_cover',
        travelNote: 'Soft S-bend through low shrubs and root cover. Good lane to break line-of-sight from pursuing packs.'
      },
      {
        id: 'reedwake_detached_loop',
        startMile: 1.9,
        endMile: 4.2,
        shape: 'curve',
        branchType: 'semi_detached',
        cover: 'mixed',
        travelNote: 'Semi-detached side loop with mini-forest pockets and rock shelves used for quiet search runs and night watch.'
      },
      {
        id: 'briarhook_switchback',
        startMile: 4.2,
        endMile: 7.4,
        shape: 'switchback',
        branchType: 'mainline',
        cover: 'rock_cover',
        travelNote: 'Short switchbacks around briarstone ridges; shrub clusters create ambush and counter-ambush opportunities.'
      },
      {
        id: 'causeway_green_approach',
        startMile: 7.4,
        endMile: 10,
        shape: 'curve',
        branchType: 'semi_detached',
        cover: 'green_cover',
        travelNote: 'Curved approach with brush screens and mini-tree breaks before rejoining the causeway marker into Aldermarch.'
      }
    ],
    activityStops: [
      {
        id: 'crossing_stop_tidecamp',
        mileMarker: 2.2,
        name: 'Tidecamp Hollow',
        activity: 'camp',
        note: 'First hidden overnight camp ring tucked into a mini-forest dip with screened fire pits.',
        concealmentLevel: 'high',
        traversalUse: 'safe_overnight_camp',
        terrainFeatures: ['mini_forest', 'shrubbery', 'rock_outcrop']
      },
      {
        id: 'crossing_stop_reedveil_green',
        mileMarker: 3.1,
        name: 'Reedveil Green Pocket',
        activity: 'landmark',
        note: 'Dense green pocket used to hide from patrols, scout enemy movement, and recover route control.',
        concealmentLevel: 'high',
        traversalUse: 'hide_from_enemy',
        terrainFeatures: ['shrubbery', 'reedbank', 'detached_ridge']
      },
      {
        id: 'crossing_stop_saltline_pool',
        mileMarker: 3.9,
        name: 'Saltline Pool',
        activity: 'creat_watering_hole',
        note: 'Brackish-to-fresh water basin where creats can drink and recover stamina under brush and tree fringe.',
        concealmentLevel: 'medium',
        traversalUse: 'scouting',
        terrainFeatures: ['mini_forest', 'shrubbery', 'reedbank']
      },
      {
        id: 'crossing_stop_reedhook_bank',
        mileMarker: 5.1,
        name: 'Reedhook Bank',
        activity: 'fishing',
        note: 'Reliable fish lane for rations and bait crafting with low rock shelves for quick concealment.',
        concealmentLevel: 'medium',
        traversalUse: 'search_for_items',
        terrainFeatures: ['reedbank', 'rock_outcrop']
      },
      {
        id: 'crossing_stop_shrubloop_scrape',
        mileMarker: 5.8,
        name: 'Shrubloop Scrape',
        activity: 'forage',
        note: 'Semi-detached shrub loop where travelers search for fibers, bark, and hidden salvage caches.',
        concealmentLevel: 'high',
        traversalUse: 'search_for_items',
        terrainFeatures: ['shrubbery', 'mini_forest', 'detached_ridge']
      },
      {
        id: 'crossing_stop_briarwatch_camp',
        mileMarker: 6.6,
        name: 'Briarwatch Camp',
        activity: 'camp',
        note: 'Second major overnight camp with old watchstones, shrub windbreaks, and split escape lanes.',
        concealmentLevel: 'high',
        traversalUse: 'safe_overnight_camp',
        terrainFeatures: ['rock_outcrop', 'shrubbery', 'detached_ridge']
      },
      {
        id: 'crossing_stop_mossglass_patch',
        mileMarker: 8.1,
        name: 'Mossglass Patch',
        activity: 'forage',
        note: 'Herb and fiber gather patch inside a narrow green bend; known for hidden item searches after rain.',
        concealmentLevel: 'medium',
        traversalUse: 'search_for_items',
        terrainFeatures: ['mini_forest', 'shrubbery']
      },
      {
        id: 'crossing_stop_causeway_marker',
        mileMarker: 10,
        name: 'Westward Causeway Marker',
        activity: 'landmark',
        note: 'Boundary stones marking entry into Aldermarch jurisdiction and the end of the curved crossing trek.',
        concealmentLevel: 'low',
        traversalUse: 'scouting',
        terrainFeatures: ['rock_outcrop']
      }
    ],
    enemyRoster: [
      'Gloom Rats',
      'Rift Bats',
      'Hollow Hounds',
      'Broken Wardens',
      'Ash Witches',
      'Vinebound Revenants',
      'Shard Slingers',
      'Gate Leeches'
    ]
  },
  {
    id: 'sanctuary_to_stormrage_sea_lane',
    fromKingdomId: 'sanctuary_isle',
    toKingdomId: 'stormrage',
    mode: 'boat_passage',
    standardDays: 2,
    fastTravelDays: 1,
    weatherRiskDays: 3,
    activityStops: [
      {
        id: 'stormrage_sea_stop_midwatch',
        mileMarker: 0,
        name: 'Midwatch Buoy Ring',
        activity: 'fishing',
        note: 'Mid-lane drift fishing point during calm waters.'
      }
    ],
    enemyRoster: ['Rift Bats', 'Shard Slingers', 'Gate Leeches']
  },
  {
    id: 'sanctuary_to_vastmalaise_sea_lane',
    fromKingdomId: 'sanctuary_isle',
    toKingdomId: 'vastmalaise',
    mode: 'boat_passage',
    standardDays: 2,
    fastTravelDays: 1,
    weatherRiskDays: 3,
    activityStops: [
      {
        id: 'vastmalaise_sea_stop_mirefloat',
        mileMarker: 0,
        name: 'Mirefloat Channel',
        activity: 'fishing',
        note: 'Fog-channel fish and reed gather lane before dock approach.'
      }
    ],
    enemyRoster: ['Gate Leeches', 'Ash Witches', 'Rift Bats']
  },
  {
    id: 'sanctuary_to_sunward_sea_lane',
    fromKingdomId: 'sanctuary_isle',
    toKingdomId: 'sunward',
    mode: 'boat_passage',
    standardDays: 2,
    fastTravelDays: 1,
    weatherRiskDays: 3,
    activityStops: [
      {
        id: 'sunward_sea_stop_glasswater',
        mileMarker: 0,
        name: 'Glasswater Drift',
        activity: 'fishing',
        note: 'Warm-current drift zone with reliable fish schools.'
      }
    ],
    enemyRoster: ['Shard Slingers', 'Rift Bats', 'Gate Leeches']
  }
];

export function getMainlandJourneyRoute(
  toKingdomId: MainlandJourneyRoute['toKingdomId']
): MainlandJourneyRoute | undefined {
  return MAINLAND_JOURNEY_ROUTES.find((route) => route.toKingdomId === toKingdomId);
}
