export type SanctuaryFamilyShift = 'morning' | 'afternoon' | 'evening';
export type SanctuarySchoolLevel = 'littleLantern' | 'fieldYears' | 'hearthway'; // ages 5-10 | 11-12 | 13-17

export interface SanctuaryFamilyKid {
  name?: string;
  age: number; // 4-17 range
  schoolLevel?: SanctuarySchoolLevel; // 5+ have school assignment
  hairStyle?: string;
}

export interface SanctuaryFamilyProfile {
  id: string;
  householdName: string;
  householdType: 'two-parent' | 'single-parent' | 'grandparent-led' | 'adoptive' | 'multi-generational' | 'blended';
  guardians: string[];
  kids: SanctuaryFamilyKid[];
  homeDistrict: string;
  vibe: string;
}

export interface SanctuaryYoungAdult {
  id: string;
  name: string;
  age: 18 | 19 | 20;
  role: string;
  affiliation?: string; // school staff, apprentice post, etc.
  shift: SanctuaryFamilyShift[];
}

export interface FamilyPresencePlan {
  familyId: string;
  shift: SanctuaryFamilyShift;
  anchor: 'market' | 'fishersWalk' | 'quietPier' | 'hatchlingHallow' | 'openRing' | 'tavern';
}

export const SANCTUARY_FAMILIES: SanctuaryFamilyProfile[] = [
  {
    id: 'fenward',
    householdName: 'Fenward Household',
    householdType: 'two-parent',
    guardians: ['Calder', 'Ressa'],
    kids: [
      { name: 'Ilo', age: 6, schoolLevel: 'littleLantern' },
      { name: 'Mira', age: 10, schoolLevel: 'littleLantern' }
    ],
    homeDistrict: 'docks',
    vibe: 'Dock family that starts early and tells storm stories after supper.'
  },
  {
    id: 'mara-daughters',
    householdName: 'Mara and Daughters House',
    householdType: 'single-parent',
    guardians: ['Mara'],
    kids: [
      { name: 'Lavender', age: 5, schoolLevel: 'littleLantern', hairStyle: 'long locs' },
      { name: 'Primrose', age: 4, hairStyle: 'short locs' }
    ],
    homeDistrict: 'market',
    vibe: 'Market-side mother-and-daughters home where Lavender is just starting Little Lantern House in longer locs and Primrose stays close to Mara in shorter locs.'
  },
  {
    id: 'renbrook',
    householdName: 'Renbrook Home',
    householdType: 'grandparent-led',
    guardians: ['Old Ren', 'Edda'],
    kids: [
      { name: 'Pellin', age: 8, schoolLevel: 'littleLantern' }
    ],
    homeDistrict: 'docks',
    vibe: 'Fishing family with patient routines and tide lore.'
  },
  {
    id: 'juniper-lark',
    householdName: 'Juniper-Lark House',
    householdType: 'multi-generational',
    guardians: ['Juniper', 'Mireya', 'Wren'],
    kids: [
      { name: 'Sori', age: 5, schoolLevel: 'littleLantern' },
      { name: 'Nell', age: 11, schoolLevel: 'fieldYears' }
    ],
    homeDistrict: 'tavern',
    vibe: 'Hearth-adjacent household known for feeding travelers and strays.'
  },
  {
    id: 'linna-pipp',
    householdName: 'Linna & Pipp Nest',
    householdType: 'adoptive',
    guardians: ['Linna', 'Pipp'],
    kids: [
      { name: 'Tali', age: 4 },
      { name: 'Venn', age: 9, schoolLevel: 'littleLantern' }
    ],
    homeDistrict: 'hallow',
    vibe: 'Gentle apothecary home where hatchling care and kid care overlap.'
  },
  {
    id: 'harbor-jae',
    householdName: 'Jae Stayover House',
    householdType: 'single-parent',
    guardians: ['Harbor Jae'],
    kids: [
      { name: 'Kio', age: 7, schoolLevel: 'littleLantern' }
    ],
    homeDistrict: 'docks',
    vibe: 'Traveler-turned-local household with endless pier stories.'
  },
  {
    id: 'rowan-corwin',
    householdName: 'Ringwatch Family',
    householdType: 'blended',
    guardians: ['Rowan', 'Corwin'],
    kids: [
      { name: 'Ariq', age: 12, schoolLevel: 'fieldYears' },
      { name: 'Lio', age: 15, schoolLevel: 'hearthway' }
    ],
    homeDistrict: 'training',
    vibe: 'Open Ring family where kids mimic drills and dream of being riders.'
  },
  {
    id: 'kaelis-seren',
    householdName: 'Awakening Yard House',
    householdType: 'two-parent',
    guardians: ['Kaelis', 'Seren'],
    kids: [
      { name: 'Nia', age: 6, schoolLevel: 'littleLantern' },
      { name: 'Pax', age: 13, schoolLevel: 'hearthway' }
    ],
    homeDistrict: 'training',
    vibe: 'Awakened-friendly household focused on calm training and community support.'
  },
  {
    id: 'saph-maelin',
    householdName: 'Spellwell Home',
    householdType: 'two-parent',
    guardians: ['Saph', 'Maelin'],
    kids: [
      { name: 'Rumi', age: 9, schoolLevel: 'littleLantern' },
      { name: 'Ryl', age: 16, schoolLevel: 'hearthway' }
    ],
    homeDistrict: 'training',
    vibe: 'Spellgrounds household where study, discipline, and magic understanding mix.'
  },
  {
    id: 'talli-vessa',
    householdName: 'Poste Ledger House',
    householdType: 'blended',
    guardians: ['Talli', 'Vessa'],
    kids: [
      { name: 'Mio', age: 5, schoolLevel: 'littleLantern' },
      { name: 'Caro', age: 11, schoolLevel: 'fieldYears' }
    ],
    homeDistrict: 'market',
    vibe: 'Trading-poste household with market laps and package errands.'
  },
  {
    id: 'jolet-luma',
    householdName: 'Creatreat Cottage',
    householdType: 'adoptive',
    guardians: ['Jolet', 'Luma'],
    kids: [
      { name: 'Bri', age: 8, schoolLevel: 'littleLantern' },
      { name: 'Tans', age: 10, schoolLevel: 'littleLantern' }
    ],
    homeDistrict: 'hallow',
    vibe: 'Playful care household tied to Creatreat and Hatchling Hallow.'
  },
  {
    id: 'merrin-cas',
    householdName: 'Merrin Harbor Home',
    householdType: 'two-parent',
    guardians: ['Merrin', 'Caspian'],
    kids: [
      { name: 'Mere', age: 5, schoolLevel: 'littleLantern' },
      { name: 'Cas', age: 10, schoolLevel: 'littleLantern' }
    ],
    homeDistrict: 'docks',
    vibe: 'Harbor pair raising kids on fishing tales and wharf rhythms.'
  },
  {
    id: 'briar-tansy',
    householdName: 'Briar & Tansy Keep',
    householdType: 'blended',
    guardians: ['Briar', 'Tansy'],
    kids: [
      { name: 'Bria', age: 9, schoolLevel: 'littleLantern' },
      { name: 'Sylv', age: 14, schoolLevel: 'hearthway' }
    ],
    homeDistrict: 'market',
    vibe: 'Market-embedded household known for kindness to island visitors.'
  },
  {
    id: 'dorr-linn',
    householdName: 'Dorr Foundry Home',
    householdType: 'two-parent',
    guardians: ['Dorr', 'Linn'],
    kids: [
      { name: 'Dor', age: 5, schoolLevel: 'littleLantern' },
      { name: 'Lin', age: 10, schoolLevel: 'littleLantern' }
    ],
    homeDistrict: 'training',
    vibe: 'Foundry-adjacent household where kids learn tools and craft respect.'
  },
  {
    id: 'orik-nylo',
    householdName: 'Orik Trial Home',
    householdType: 'two-parent',
    guardians: ['Orik', 'Nylo'],
    kids: [
      { name: 'Ori', age: 14, schoolLevel: 'hearthway' },
      { name: 'Ory', age: 17, schoolLevel: 'hearthway' }
    ],
    homeDistrict: 'training',
    vibe: 'Trial Circle family raising future riders with discipline and hope.'
  },
  {
    id: 'mirel-fen',
    householdName: 'Mirel Apothecary Nest',
    householdType: 'single-parent',
    guardians: ['Mirel', 'Fen'],
    kids: [
      { name: 'Mira', age: 7, schoolLevel: 'littleLantern' },
      { name: 'Fen Jr.', age: 12, schoolLevel: 'fieldYears' }
    ],
    homeDistrict: 'market',
    vibe: 'Apothecary home where plant knowledge and care flow through meals.'
  },
  {
    id: 'thalen-kess',
    householdName: 'Thalen Spellgrounds House',
    householdType: 'blended',
    guardians: ['Thalen', 'Kess'],
    kids: [
      { name: 'Tha', age: 11, schoolLevel: 'fieldYears' },
      { name: 'Kes', age: 15, schoolLevel: 'hearthway' }
    ],
    homeDistrict: 'training',
    vibe: 'Spellgrounds family where kids learn magic respect and spellcraft discipline.'
  }
];

export const SANCTUARY_YOUNG_ADULTS: SanctuaryYoungAdult[] = [
  // Little Lantern House Staff
  {
    id: 'ya_gentry_teacher',
    name: 'Gentry',
    age: 20,
    role: 'Little Lantern House Teacher',
    affiliation: 'littleLantern',
    shift: ['morning', 'afternoon']
  },
  {
    id: 'ya_mace_groundskeeper',
    name: 'Mace',
    age: 20,
    role: 'School Groundskeeper',
    affiliation: 'littleLantern',
    shift: ['morning']
  },
  // Hearthway Academy Staff
  {
    id: 'ya_lorn_instructor',
    name: 'Lorn',
    age: 18,
    role: 'Hearthway Academy Instructor',
    affiliation: 'hearthway',
    shift: ['morning', 'afternoon']
  },
  {
    id: 'ya_venn_mentor',
    name: 'Venn',
    age: 19,
    role: 'Hearthway Mentor (Survival & Prep)',
    affiliation: 'hearthway',
    shift: ['afternoon']
  },
  // Apprentices & Shop Assistants
  {
    id: 'ya_corren_smith',
    name: 'Corren',
    age: 18,
    role: 'Isle Iron Smithy Apprentice',
    shift: ['morning', 'afternoon']
  },
  {
    id: 'ya_dellen_trader',
    name: 'Dellen',
    age: 19,
    role: 'Trading Poste Assistant',
    shift: ['morning', 'afternoon']
  },
  {
    id: 'ya_palla_runner',
    name: 'Palla',
    age: 20,
    role: 'Trading Poste Delivery Runner',
    shift: ['morning']
  },
  {
    id: 'ya_nerin_vendor',
    name: 'Nerin',
    age: 18,
    role: 'Market Vendor Helper',
    shift: ['morning', 'afternoon']
  },
  // Training Aides
  {
    id: 'ya_vey_aide',
    name: 'Vey',
    age: 19,
    role: 'Open Ring Training Aide',
    shift: ['afternoon']
  },
  {
    id: 'ya_thalen_jr_aide',
    name: 'Thalen Jr.',
    age: 18,
    role: 'Trial Circle Assistant',
    shift: ['afternoon']
  },
  {
    id: 'ya_kirra_hybrid',
    name: 'Kirra',
    age: 19,
    role: 'Awakening Yard Assistant',
    shift: ['afternoon']
  },
  // Support Roles
  {
    id: 'ya_jolet_jr_shopkeep',
    name: 'Jolet Jr.',
    age: 20,
    role: 'Creatreat Shop Staff',
    shift: ['morning', 'afternoon']
  },
  {
    id: 'ya_rhen_caretaker',
    name: 'Rhen',
    age: 19,
    role: 'Hatchling Hallow Caretaker',
    shift: ['morning', 'afternoon']
  }
];

export const SANCTUARY_FAMILY_PRESENCE: FamilyPresencePlan[] = [
  // Morning: setup, school-age movement, docks + market + training basics
  { familyId: 'fenward', shift: 'morning', anchor: 'market' },
  { familyId: 'mara-daughters', shift: 'morning', anchor: 'market' },
  { familyId: 'renbrook', shift: 'morning', anchor: 'fishersWalk' },
  { familyId: 'rowan-corwin', shift: 'morning', anchor: 'openRing' },
  { familyId: 'talli-vessa', shift: 'morning', anchor: 'market' },

  // Afternoon: busiest town flow
  { familyId: 'juniper-lark', shift: 'afternoon', anchor: 'market' },
  { familyId: 'mara-daughters', shift: 'afternoon', anchor: 'market' },
  { familyId: 'harbor-jae', shift: 'afternoon', anchor: 'fishersWalk' },
  { familyId: 'kaelis-seren', shift: 'afternoon', anchor: 'openRing' },
  { familyId: 'saph-maelin', shift: 'afternoon', anchor: 'openRing' },
  { familyId: 'jolet-luma', shift: 'afternoon', anchor: 'hatchlingHallow' },

  // Evening: hearth and quiet zones
  { familyId: 'juniper-lark', shift: 'evening', anchor: 'tavern' },
  { familyId: 'renbrook', shift: 'evening', anchor: 'quietPier' },
  { familyId: 'linna-pipp', shift: 'evening', anchor: 'hatchlingHallow' },
  { familyId: 'jolet-luma', shift: 'evening', anchor: 'tavern' }
];

export function getFamiliesForShift(shift: SanctuaryFamilyShift): Array<{
  family: SanctuaryFamilyProfile;
  anchor: FamilyPresencePlan['anchor'];
}> {
  return SANCTUARY_FAMILY_PRESENCE
    .filter(item => item.shift === shift)
    .map(item => ({
      family: SANCTUARY_FAMILIES.find(f => f.id === item.familyId)!,
      anchor: item.anchor,
    }))
    .filter(entry => !!entry.family);
}

export function getKidsForSchool(schoolLevel: SanctuarySchoolLevel): SanctuaryFamilyKid[] {
  const kids: SanctuaryFamilyKid[] = [];
  SANCTUARY_FAMILIES.forEach(family => {
    family.kids.forEach(kid => {
      if (kid.schoolLevel === schoolLevel) {
        kids.push(kid);
      }
    });
  });
  return kids;
}

export function getYoungAdultsForShift(shift: SanctuaryFamilyShift): SanctuaryYoungAdult[] {
  return SANCTUARY_YOUNG_ADULTS.filter(ya => ya.shift.includes(shift));
}
