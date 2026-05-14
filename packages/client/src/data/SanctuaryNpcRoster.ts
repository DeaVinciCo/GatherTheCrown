export type SanctuaryShift = 'morning' | 'afternoon' | 'evening';

export type SanctuaryDistrictId =
  | 'tavern'
  | 'inn'
  | 'tradingPoste'
  | 'market'
  | 'smithy'
  | 'apothecary'
  | 'tidewaterPier'
  | 'driftwoodWharf'
  | 'fishersWalk'
  | 'quietPier'
  | 'openRing'
  | 'hybridYard'
  | 'spellgrounds'
  | 'trialCircle'
  | 'emberCircle'
  | 'hatchlingHallow'
  | 'creatreat';

export interface SanctuaryDistrictStaff {
  owner?: string;
  runner?: string;
  employees: string[];
  regulars?: string[];
  apprentices?: string[];
}

export interface ScheduledNpcPresence {
  name: string;
  districtId: SanctuaryDistrictId;
  roleHint: string;
}

export const SANCTUARY_RECURRING_ANCHORS = [
  'Old Ren', 'Juniper', 'Talli', 'Smitty', 'Linna',
  'Calder', 'Rowan', 'Kaelis', 'Saph', 'Thalen',
  'Brakka', 'Mirel', 'Jolet', 'Harbor Jae', 'Wren'
] as const;

export const SANCTUARY_TRAVELERS_WHO_STAYED = [
  'Harbor Jae', 'Tide', 'Luma', 'Renn', 'Vessa', 'Milo', 'Kirra'
] as const;

export const SANCTUARY_DISTRICT_STAFF: Record<SanctuaryDistrictId, SanctuaryDistrictStaff> = {
  tavern: {
    owner: 'Juniper',
    employees: ['Sella', 'Oren', 'Mireya', 'Tavik'],
    regulars: ['Wren', 'Harbor Jae', 'Tide', 'Renn', 'Old Ren']
  },
  inn: {
    owner: 'Elric',
    employees: ['Noma', 'Luma', 'Jolet'],
    regulars: ['Milo', 'Vessa', 'Fenni', 'Briar']
  },
  tradingPoste: {
    owner: 'Talli',
    runner: 'Fen',
    employees: ['Kessa', 'Berrik', 'Dellen', 'Marlo', 'Palla']
  },
  market: {
    owner: 'Ysra',
    employees: ['Cora', 'Nerin', 'Vessa', 'Milo', 'Merrin', 'Caspian', 'Edda']
  },
  smithy: {
    owner: 'Smitty',
    employees: ['Dorr', 'Halv', 'Brakka'],
    apprentices: ['Corren']
  },
  apothecary: {
    owner: 'Linna',
    employees: ['Pipp', 'Tansy', 'Mirel', 'Fenni']
  },
  tidewaterPier: {
    owner: 'Calder',
    employees: ['Brin', 'Pell', 'Marrow', 'Halden', 'Harbor Jae']
  },
  driftwoodWharf: {
    employees: ['Tide', 'Varo', 'Fiske', 'Caspian', 'Lior']
  },
  fishersWalk: {
    employees: ['Old Ren', 'Nessa', 'Merrin', 'Edda', 'Tide', 'Harbor Jae']
  },
  quietPier: {
    employees: ['Old Ren', 'Luma', 'Wren', 'Briar']
  },
  openRing: {
    owner: 'Rowan',
    employees: ['Corwin', 'Kirra', 'Nylo']
  },
  hybridYard: {
    owner: 'Kaelis',
    employees: ['Seren', 'Ivara', 'Veyna']
  },
  spellgrounds: {
    owner: 'Saph',
    employees: ['Maelin', 'Orik', 'Nylo']
  },
  trialCircle: {
    owner: 'Thalen',
    employees: ['Corwin', 'Rowan']
  },
  emberCircle: {
    owner: 'Brakka',
    employees: ['Rowan', 'Kaelis', 'Seren']
  },
  hatchlingHallow: {
    owner: 'Mirel',
    employees: ['Linna', 'Tansy', 'Pipp', 'Briar']
  },
  creatreat: {
    owner: 'Jolet',
    employees: ['Fenni', 'Luma']
  }
};

export const SANCTUARY_WEEKLY_SHIFT_MATRIX: Record<SanctuaryShift, ScheduledNpcPresence[]> = {
  morning: [
    { name: 'Juniper', districtId: 'tavern', roleHint: 'Keeper opening the hearth' },
    { name: 'Elric', districtId: 'inn', roleHint: 'Innkeeper handling early check-outs' },
    { name: 'Talli', districtId: 'tradingPoste', roleHint: 'Poste Master sorting deliveries' },
    { name: 'Smitty', districtId: 'smithy', roleHint: 'Forge owner warming the coals' },
    { name: 'Linna', districtId: 'apothecary', roleHint: 'Apothecary owner brewing morning tonics' },
    { name: 'Calder', districtId: 'tidewaterPier', roleHint: 'Dockmaster assigning cargo crews' },
    { name: 'Old Ren', districtId: 'fishersWalk', roleHint: 'Early fisher reading tide signs' },
    { name: 'Rowan', districtId: 'openRing', roleHint: 'Open Ring trainer running basics' },
    { name: 'Kaelis', districtId: 'hybridYard', roleHint: 'Awakening lead setting drills' },
    { name: 'Saph', districtId: 'spellgrounds', roleHint: 'Spell instructor calibrating targets' },
    { name: 'Mirel', districtId: 'hatchlingHallow', roleHint: 'Caretaker on hatchling feed rounds' },
    { name: 'Jolet', districtId: 'creatreat', roleHint: 'Shop runner stocking treats' }
  ],
  afternoon: [
    { name: 'Sella', districtId: 'tavern', roleHint: 'Hearth staff on lunch crowd duty' },
    { name: 'Noma', districtId: 'inn', roleHint: 'Inne staff rotating rooms' },
    { name: 'Kessa', districtId: 'tradingPoste', roleHint: 'Counter clerk managing pickups' },
    { name: 'Ysra', districtId: 'market', roleHint: 'Lead vendor managing market flow' },
    { name: 'Corren', districtId: 'smithy', roleHint: 'Forge apprentice covering repairs' },
    { name: 'Pipp', districtId: 'apothecary', roleHint: 'Assistant blending herb packs' },
    { name: 'Harbor Jae', districtId: 'tidewaterPier', roleHint: 'Cargo runner on dock calls' },
    { name: 'Tide', districtId: 'driftwoodWharf', roleHint: 'Wharf hand moving heavy loads' },
    { name: 'Nessa', districtId: 'fishersWalk', roleHint: 'Regular fisher trading fresh catch' },
    { name: 'Kirra', districtId: 'openRing', roleHint: 'Trainee running spar loops' },
    { name: 'Ivara', districtId: 'hybridYard', roleHint: 'Awakened regular on control drills' },
    { name: 'Orik', districtId: 'spellgrounds', roleHint: 'Spell student in range lanes' },
    { name: 'Thalen', districtId: 'trialCircle', roleHint: 'Evaluator checking challenge forms' }
  ],
  evening: [
    { name: 'Wren', districtId: 'tavern', roleHint: 'Regular trading stories at the hearth' },
    { name: 'Luma', districtId: 'quietPier', roleHint: 'Inne hand unwinding near the water' },
    { name: 'Talli', districtId: 'tradingPoste', roleHint: 'Poste Master closing ledgers' },
    { name: 'Vessa', districtId: 'market', roleHint: 'Stallkeeper packing down goods' },
    { name: 'Brakka', districtId: 'emberCircle', roleHint: 'Advanced trainer running hard sets' },
    { name: 'Rowan', districtId: 'emberCircle', roleHint: 'Trainer rotating into evening bouts' },
    { name: 'Kaelis', districtId: 'emberCircle', roleHint: 'Awakening lead cross-training in ember drills' },
    { name: 'Old Ren', districtId: 'quietPier', roleHint: 'Old local telling dusk tide stories' },
    { name: 'Harbor Jae', districtId: 'tavern', roleHint: 'Dock runner settling in as tavern regular' },
    { name: 'Jolet', districtId: 'creatreat', roleHint: 'Runner closing treat shelves' },
    { name: 'Mirel', districtId: 'hatchlingHallow', roleHint: 'Caretaker doing final hatchling checks' },
    { name: 'Saph', districtId: 'spellgrounds', roleHint: 'Instructor finishing focused evening drills' }
  ]
};

export const SANCTUARY_QUICK_CONVOS: Record<SanctuaryDistrictId, string[]> = {
  tavern: [
    'Hey hero, hearth stew is warm and the stories are warmer.',
    'Ye Wandering Hearth fills up fast after dusk.',
    'Travelers say your name came up at two tables already.'
  ],
  inn: [
    'Sleep Inne Sacntuary is calm tonight if you need real rest.',
    'Rain sounds better from the inne balcony than the docks.',
    'Need a quiet cot before your next trail run?'
  ],
  tradingPoste: [
    'Sanctuary Trading Poste is taking delivery notes all afternoon.',
    'If you are carrying bundles, Poste counter is fastest at noon.',
    'We can route light packages while you run towne errands.'
  ],
  market: [
    'Market on Sanctuary rotates stock by shift, check back later.',
    'Fresh fish and woven cloth arrived from the docks this hour.',
    'You can usually trade small gatherables here without hassle.'
  ],
  smithy: [
    'Isle Iron Smitty can patch a chipped edge in minutes.',
    'Forge is loud today, means gear is moving.',
    'Open Ring trainees queue here before dusk.'
  ],
  apothecary: [
    'Herb and Brew Isle has hatchling-safe mixes ready.',
    'Spellgrounds sends students here for focus tonics.',
    'If your creat is restless, calming tea works better than force.'
  ],
  tidewaterPier: [
    'Tidewater Pier sees the first arrivals every morning.',
    'Dock shifts turn over fast when weather changes.',
    'Cargo lane is clear if you hug the left planks.'
  ],
  driftwoodWharf: [
    'Driftwood Wharf is rougher, but work gets done quick.',
    'Watch your footing near the stacked crates.',
    'This side carries heavier loads than the main pier.'
  ],
  fishersWalk: [
    'Fishers Walk is best just before the light shifts.',
    'Old Ren says the water talks if you listen long enough.',
    'Most locals come here for quiet trade, not noise.'
  ],
  quietPier: [
    'Quiet Pier clears out by sunset, good place to think.',
    'You can hear the whole island settle from here.',
    'Some riders reset here before hard training.'
  ],
  openRing: [
    'Open Ring is for basics: guard, spacing, and timing.',
    'If your footing slips, slow down before adding power.',
    'Open Ring chatter says your form is getting cleaner.'
  ],
  hybridYard: [
    'Awakening Yard is where styles blend without judgment.',
    'Most folks here train control first, output second.',
    'You can run mixed drills here even on light days.'
  ],
  spellgrounds: [
    'Spellgrounds lane three is open for range practice.',
    'Control beats power on this field.',
    'If your cast rhythm drifts, reset and breathe.'
  ],
  trialCircle: [
    'Trial Circle checks consistency, not just flashy hits.',
    'Evaluators watch recovery as much as impact.',
    'Most riders warm up in Open Ring before official trials.'
  ],
  emberCircle: [
    'Ember Circle is intense after dark. Pace yourself.',
    'Advanced lanes run hot; rotate out before burnout.',
    'The crowd gets louder when timing gets clean.'
  ],
  hatchlingHallow: [
    'Hatchling Hallow stays gentle, even on busy days.',
    'Early bonding matters more than perfect commands.',
    'Most hatchlings settle once they know your voice.'
  ],
  creatreat: [
    'Creatreat just stocked new comfort wraps and soft toys.',
    'Treats help, but routine helps more.',
    'Pick one reward and stay consistent; hatchlings learn fast.'
  ]
};

export const SANCTUARY_NPC_FLAVOR_LINES: Record<string, string[]> = {
  'Old Ren': [
    'The waters whisper before a storm, hero. They always do.',
    'Caught nothing today but patience.',
    'By the tides, that fish smells like sorrow.',
    'There were quiet years here. Fewer boats. Fewer arrivals. I fished alone most mornings.',
    'The island feels different now. Fuller. It took time for people to trust the roads again.',
    'Seen enough seasons to know this: the isle stays whole when hall stays honest.'
  ],
  Juniper: [
    'Sit, eat, rest. Wanderers were not made to carry every burden awake.',
    'Blessings upon ye, and soup before speeches.',
    'Ye look one skipped meal away from speaking in riddles.',
    'This tavern has seen quieter days. Years when the rooms were half empty and the road in was longer than it felt.',
    'The young ones do not know about the leaner stretch. They grew up after. That is how it should be.',
    'Sanctuary works because people are heard before they are judged.',
    'If a rule protects order but breaks belonging, it comes back to hall.'
  ],
  Tide: [
    'The sea humbled me once. Been respectful ever since.',
    'Storm rolled in last night like judgment itself.',
    'By morning, every rope had a testimony.',
    'The sea takes. The sea gives. Mostly takes.',
    'A wet boot at sunrise foretells inconvenience.',
    'Ye ever stare at the tide long enough to reconsider your decisions?',
    'Storm is brewing. My knees declared it an hour ago.',
    'Fish can sense fear. So can tax collectors.',
    'I came when the isle was still deciding what it was. Not many ships ran this route then.',
    'Awakened kids running the ring like it is nothing. We spent years just figuring out what to call them.',
    'The island had fewer names when I arrived. Fewer faces. Now look at it.',
  ],
  Smitty: [
    'A blade speaks truth about the one carrying it.',
    'Metal remembers poor treatment and forgives slow.',
    'Bring me patience and steel. I can work with both.'
  ],
  Linna: [
    'Most troubles can be softened with tea and quiet.',
    'Hatchlings bite less when they trust ye.',
    'Peace first, potion second.'
  ],
  'Harbor Jae': [
    'Planned on staying three nights. That was six years ago.',
    'Some islands ask ye to remain.',
    'By the ledger, I owe this towne more than coin now.',
    'When I arrived, half these families were not here yet. The island was still finding its footing.',
    'Awakened families were harder to place back on the mainland. Here nobody asks twice. That is why people stayed.',
    'I carry our voice to the mainland, not mainland orders back to us.',
    'When I speak out there, I speak what Towne Hall already settled in here.'
  ],
  Rowan: [
    'Footwork first. Glory follows later if it must.',
    'Open Ring remembers every lazy step.',
    'Train clean and ye will not fear the Trial Circle.'
  ],
  Kaelis: [
    'In Awakening Yard, we do not mock mixed paths. We refine them.',
    'Control is mercy. Power is responsibility.',
    'If your breath is wild, your form will preach chaos.'
  ],
  Saph: [
    'Spellgrounds rewards calm hearts more than loud hands.',
    'A steady cast is worth ten flashy misses.',
    'Mind your rhythm and the elements mind you.'
  ],
  Thalen: [
    'Trial Circle sees what crowds miss.',
    'We test consistency, not theatrics.',
    'Stand true, and the record stands with ye.'
  ],
  Brakka: [
    'Ember Circle is for those who finished pretending.',
    'Heat reveals shortcuts. Usually painfully.',
    'If your guard breaks, your pride goes first.'
  ],
  Talli: [
    'Sanctuary Trading Poste runs on timing, trust, and tea.',
    'By sunset, every parcel finds either a home or a lesson.',
    'If it is tied right, it arrives right.',
    'Towne Hall is not theater. If we vote, we log it, post it, and live by it.',
    'You want a major change? Bring it to hall with numbers, not just noise.'
  ],
  Elric: [
    'Sleep Inne Sacntuary keeps a lamp lit for late wanderers.',
    'Rest is not weakness, hero. It is maintenance.',
    'Even champions snore eventually.'
  ],
  Mirel: [
    'Hatchling Hallow teaches gentleness before commands.',
    'Small hearts learn trust one calm moment at a time.',
    'Feed first, train later. Always.'
  ],
  Jolet: [
    'Creatreat stocks joy in small packages.',
    'A good toy can prevent a dramatic evening.',
    'Comfort items are cheaper than regret.'
  ],
  Wren: [
    'By the hearth, rumors grow legs after midnight.',
    'I came for one meal and stayed for three stories.',
    'If ye listen long enough, this towne introduces itself.',
    'The older folk carry something the younger ones do not. Not sadness exactly. Just memory of when things were less settled.',
    'There are years in between the kids and the elders here. Nobody mentions it. Everybody knows.',
    'Big calls come from four voices now: Talli, Juniper, Calder, and the Harbor Speaker.'
  ],
    Calder: [
      'No route opens on pride. We open when crews, weather, and stores align.',
      'Security is not fear. It is preparation done early.',
      'Council votes are not for show. If we disagree, we do it in the open, not in the shadows.'
    ],
  Luma: [
    'Quiet Pier at dusk can untangle a heavy mind.',
    'Some days the best plan is to breathe and begin again.',
    'I trust tides more than hurry.',
    'I came from the mainland when the routes opened back up. This was one of the first places an awakened person could just... exist without explaining.',
    'The pier was built during the leaner years. Not many docked then. It held steady anyway.',
  ]
};

export function getSanctuaryShiftByHour(hour24: number): SanctuaryShift {
  if (hour24 < 12) return 'morning';
  if (hour24 < 18) return 'afternoon';
  return 'evening';
}

export function getScheduledPresence(shift: SanctuaryShift): ScheduledNpcPresence[] {
  return SANCTUARY_WEEKLY_SHIFT_MATRIX[shift];
}

export function getQuickConvo(districtId: SanctuaryDistrictId, seed: number): string {
  const lines = SANCTUARY_QUICK_CONVOS[districtId];
  if (!lines?.length) return 'Good to see you around towne.';
  return lines[Math.abs(seed) % lines.length];
}

export function getNpcFlavorLine(name: string, seed: number): string {
  const lines = SANCTUARY_NPC_FLAVOR_LINES[name];
  if (!lines?.length) return 'Peace on your road today.';
  return lines[Math.abs(seed) % lines.length];
}

const TIDE_JAE_DUO_BANTER: string[] = [
  'Tide says the storm is a sermon; Harbor Jae says it is overtime.',
  'Harbor Jae swears he is leaving next month. Tide has heard this for years.',
  'Tide watches the horizon. Harbor Jae watches the invoice.'
];

export function getTideJaeDuoBanter(seed: number): string {
  return TIDE_JAE_DUO_BANTER[Math.abs(seed) % TIDE_JAE_DUO_BANTER.length];
}
