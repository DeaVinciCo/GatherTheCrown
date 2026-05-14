export interface SanctuaryLocationEntry {
  id: string;
  officialName: string;
  casualName?: string;
  nicknames: string[];
  districtPurpose: string;
  signageText: string;
  mapLabelText: string;
  npcShorthandReferences: string[];
}

export const SANCTUARY_LOCATIONS: Record<string, SanctuaryLocationEntry> = {
  region: {
    id: 'region',
    officialName: 'The Isle of Sanctuary',
    casualName: 'Sanctuary Isle',
    nicknames: ['The Isle', 'Sanctuary'],
    districtPurpose: 'Primary safe-home region for early progression and social systems.',
    signageText: 'The Isle of Sanctuary',
    mapLabelText: 'Sanctuary Isle',
    npcShorthandReferences: ['the isle', 'Sanctuary Isle']
  },
  town: {
    id: 'town',
    officialName: 'Towne of Sanctuary Isle',
    casualName: 'Sanctuary Towne',
    nicknames: ['Towne', 'Sanctuary Towne'],
    districtPurpose: 'Main social and service hub for requests, rest, trade, and training.',
    signageText: 'Towne of Sanctuary Isle',
    mapLabelText: 'Sanctuary Towne',
    npcShorthandReferences: ['towne', 'towne center', 'Sanctuary Towne']
  },
  tavern: {
    id: 'tavern',
    officialName: 'Ye Wandering Hearth',
    nicknames: ['the hearth', 'Wandering Hearth'],
    districtPurpose: 'Traveler gathering, rumor exchange, and social anchor point.',
    signageText: 'Ye Wandering Hearth',
    mapLabelText: 'Ye Wandering Hearth',
    npcShorthandReferences: ['the tavern', 'the hearth']
  },
  inn: {
    id: 'inn',
    officialName: 'Sleep Inne Sacntuary',
    nicknames: ['Sleep Inne'],
    districtPurpose: 'Rest hub and overnight prep point for outbound runs.',
    signageText: 'Sleep Inne Sacntuary',
    mapLabelText: 'Sleep Inne Sacntuary',
    npcShorthandReferences: ['the inne', 'Sleep Inne']
  },
  tradingPoste: {
    id: 'tradingPoste',
    officialName: 'Sanctuary Trading Poste',
    nicknames: ['Trading Poste', 'Poste'],
    districtPurpose: 'Core exchange point for goods, requests, and route supplies.',
    signageText: 'Sanctuary Trading Poste',
    mapLabelText: 'Sanctuary Trading Poste',
    npcShorthandReferences: ['trading poste', 'poste']
  },
  market: {
    id: 'market',
    officialName: 'Market on Sanctuary',
    nicknames: ['the market'],
    districtPurpose: 'Open-air stalls for rotating goods and gatherer sales.',
    signageText: 'Market on Sanctuary',
    mapLabelText: 'Market on Sanctuary',
    npcShorthandReferences: ['market', 'stalls']
  },
  smithy: {
    id: 'smithy',
    officialName: 'Isle Iron Smitty',
    nicknames: ['Isle Iron', 'Smitty'],
    districtPurpose: 'Weapons, armor service, and forge-side upgrade guidance.',
    signageText: 'Isle Iron Smitty',
    mapLabelText: 'Isle Iron Smitty',
    npcShorthandReferences: ['Isle Iron', 'Smitty']
  },
  apothecary: {
    id: 'apothecary',
    officialName: 'Herb & Brew Isle',
    nicknames: ['Herb & Brew'],
    districtPurpose: 'Potion prep, herb work, and gentle starter alchemy.',
    signageText: 'Herb & Brew Isle',
    mapLabelText: 'Herb & Brew Isle',
    npcShorthandReferences: ['Herb & Brew', 'brew shop']
  },
  tidewaterPier: {
    id: 'tidewaterPier',
    officialName: 'Tidewater Pier',
    nicknames: ['main pier'],
    districtPurpose: 'Primary dock lane for arrivals and active fishing.',
    signageText: 'Tidewater Pier',
    mapLabelText: 'Tidewater Pier',
    npcShorthandReferences: ['Tidewater', 'main pier']
  },
  driftwoodWharf: {
    id: 'driftwoodWharf',
    officialName: 'Driftwood Wharf',
    nicknames: ['the wharf'],
    districtPurpose: 'Rough work dock for cargo and heavier fishing gear.',
    signageText: 'Driftwood Wharf',
    mapLabelText: 'Driftwood Wharf',
    npcShorthandReferences: ['wharf', 'driftwood']
  },
  fishersWalk: {
    id: 'fishersWalk',
    officialName: "Fisher's Walk",
    nicknames: ['walk lane'],
    districtPurpose: 'Social fishing strip with local chatter and foot traffic.',
    signageText: "Fisher's Walk",
    mapLabelText: "Fisher's Walk",
    npcShorthandReferences: ["Fisher's Walk", 'walk']
  },
  quietPier: {
    id: 'quietPier',
    officialName: 'The Quiet Pier',
    nicknames: ['quiet side'],
    districtPurpose: 'Low-traffic dock for calmer fishing and reflective moments.',
    signageText: 'The Quiet Pier',
    mapLabelText: 'The Quiet Pier',
    npcShorthandReferences: ['quiet pier', 'quiet side']
  },
  northwatchCliffs: {
    id: 'northwatchCliffs',
    officialName: 'Northwatch Cliffs',
    nicknames: ['the cliffs', 'north cliffs'],
    districtPurpose: 'Wind-swept northern bluff above the sea where riders can see storms first.',
    signageText: 'Northwatch Cliffs',
    mapLabelText: 'Northwatch Cliffs',
    npcShorthandReferences: ['northwatch cliffs', 'the cliffs', 'north cliffs']
  },
  oldOverlook: {
    id: 'oldOverlook',
    officialName: 'The Old Overlook',
    nicknames: ['the overlook'],
    districtPurpose: 'Quiet remembrance place above the northern trees, tied to old riders and island history.',
    signageText: 'The Old Overlook',
    mapLabelText: 'The Old Overlook',
    npcShorthandReferences: ['the old overlook', 'the overlook']
  },
  greenwoodTrail: {
    id: 'greenwoodTrail',
    officialName: 'Greenwood Trail',
    nicknames: ['lantern path', 'home trail'],
    districtPurpose: 'Winding wooded trail leading from Sanctuary Towne into the private rider clearings.',
    signageText: 'Greenwood Trail',
    mapLabelText: 'Greenwood Trail',
    npcShorthandReferences: ['greenwood trail', 'lantern path', 'home trail']
  },
  greenwoodClearing: {
    id: 'greenwoodClearing',
    officialName: 'Greenwood Clearing',
    nicknames: ['home clearing', 'rider clearing'],
    districtPurpose: 'Private home-base clearing for the hero, set off the northern cliff trail and kept quiet from towne traffic.',
    signageText: 'Greenwood Clearing',
    mapLabelText: 'Greenwood Clearing',
    npcShorthandReferences: ['greenwood clearing', 'home clearing', 'rider clearing']
  },
  openRing: {
    id: 'openRing',
    officialName: 'Open Ring',
    nicknames: ['the ring'],
    districtPurpose: 'Beginner sparring, combat basics, and safe duels.',
    signageText: 'Open Ring',
    mapLabelText: 'Open Ring',
    npcShorthandReferences: ['ring', 'sparring ring']
  },
  hybridYard: {
    id: 'hybridYard',
    officialName: 'Awakening Yard',
    nicknames: ['awakening lane'],
    districtPurpose: 'Awakened human style blending, practical control, and confidence drills.',
    signageText: 'Awakening Yard',
    mapLabelText: 'Awakening Yard',
    npcShorthandReferences: ['awakening yard', 'awakening lane']
  },
  spellgrounds: {
    id: 'spellgrounds',
    officialName: 'Spellgrounds',
    nicknames: ['spell field'],
    districtPurpose: 'Elemental range tests, spell control, and casting cadence practice.',
    signageText: 'Spellgrounds',
    mapLabelText: 'Spellgrounds',
    npcShorthandReferences: ['Spellgrounds', 'spell field']
  },
  trialCircle: {
    id: 'trialCircle',
    officialName: 'Trial Circle',
    nicknames: ['trials'],
    districtPurpose: 'Official evaluations, challenge checks, and progression tests.',
    signageText: 'Trial Circle',
    mapLabelText: 'Trial Circle',
    npcShorthandReferences: ['trial circle', 'trials']
  },
  emberCircle: {
    id: 'emberCircle',
    officialName: 'Ember Circle',
    nicknames: ['ember lane'],
    districtPurpose: 'Advanced combat pressure and high-intensity elemental drills.',
    signageText: 'Ember Circle',
    mapLabelText: 'Ember Circle',
    npcShorthandReferences: ['ember circle', 'ember lane']
  },
  hatchlingHallow: {
    id: 'hatchlingHallow',
    officialName: 'Hatchling Hallow',
    nicknames: ['hallow'],
    districtPurpose: 'Early hatchling care, feeding, bonding, and growth before battle prep.',
    signageText: 'Hatchling Hallow',
    mapLabelText: 'Hatchling Hallow',
    npcShorthandReferences: ['hallow', 'hatchling grounds']
  },
  creatreat: {
    id: 'creatreat',
    officialName: 'Creatreat',
    nicknames: ['treat shop'],
    districtPurpose: 'Creat treats, toys, comfort goods, and bonding support items.',
    signageText: 'Creatreat',
    mapLabelText: 'Creatreat',
    npcShorthandReferences: ['Creatreat', 'treat shop']
  },
  littleLantern: {
    id: 'littleLantern',
    officialName: 'Little Lantern House',
    nicknames: ['schoolhouse', 'primary school'],
    districtPurpose: 'Warm, cozy community learning for children ages 5-10. Reading, writing, island safety, hatchling respect, and foundational skills before field rotations.',
    signageText: 'Little Lantern House',
    mapLabelText: 'Little Lantern House',
    npcShorthandReferences: ['Little Lantern', 'primary school', 'schoolhouse']
  },
  hearthway: {
    id: 'hearthway',
    officialName: 'Hearthway Academy',
    nicknames: ['academy', 'upper school'],
    districtPurpose: 'Formal apprentice-rider education for youth ages 13-17. Combat discipline, elemental control, creat partnership, survival prep, and advanced fieldcraft.',
    signageText: 'Hearthway Academy',
    mapLabelText: 'Hearthway Academy',
    npcShorthandReferences: ['Hearthway', 'academy', 'upper school']
  }
};

export const SANCTUARY_NAMESETS = {
  regionOfficial: SANCTUARY_LOCATIONS.region.officialName,
  regionCasual: SANCTUARY_LOCATIONS.region.casualName as string,
  townOfficial: SANCTUARY_LOCATIONS.town.officialName,
  townCasual: SANCTUARY_LOCATIONS.town.casualName as string,
  tavern: SANCTUARY_LOCATIONS.tavern.officialName,
  inn: SANCTUARY_LOCATIONS.inn.officialName,
  tradingPoste: SANCTUARY_LOCATIONS.tradingPoste.officialName,
  market: SANCTUARY_LOCATIONS.market.officialName,
  smithy: SANCTUARY_LOCATIONS.smithy.officialName,
  apothecary: SANCTUARY_LOCATIONS.apothecary.officialName,
  littleLantern: SANCTUARY_LOCATIONS.littleLantern.officialName,
  hearthway: SANCTUARY_LOCATIONS.hearthway.officialName,
  northwatchCliffs: SANCTUARY_LOCATIONS.northwatchCliffs.officialName,
  oldOverlook: SANCTUARY_LOCATIONS.oldOverlook.officialName,
  greenwoodTrail: SANCTUARY_LOCATIONS.greenwoodTrail.officialName,
  greenwoodClearing: SANCTUARY_LOCATIONS.greenwoodClearing.officialName,
  docks: [
    SANCTUARY_LOCATIONS.tidewaterPier.officialName,
    SANCTUARY_LOCATIONS.driftwoodWharf.officialName,
    SANCTUARY_LOCATIONS.fishersWalk.officialName,
    SANCTUARY_LOCATIONS.quietPier.officialName
  ]
} as const;
