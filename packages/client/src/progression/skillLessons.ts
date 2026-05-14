export type SkillId =
  | 'campfire'
  | 'fishing'
  | 'shed-trap'
  | 'forestry'
  | 'crafting'
  | 'protective-cloaks'
  | 'protective-wards'
  | 'creat-feeding'
  | 'creat-healing'
  | 'creat-gear'
  | 'home-portal';

export interface SkillLesson {
  id: SkillId;
  title: string;
  shortText: string;
  hintText: string;
}

export const SKILL_LESSONS: Record<SkillId, SkillLesson> = {
  'campfire': {
    id: 'campfire',
    title: 'Campfire',
    shortText: 'You can build campfires at prepared spots to recover and regroup.',
    hintText: 'Use this often during longer routes and rough weather.'
  },
  'fishing': {
    id: 'fishing',
    title: 'Fishing',
    shortText: 'Calm waters can be fished for food, clean water, and rare side materials.',
    hintText: 'Watch for ripples and return after a short reset.'
  },
  'shed-trap': {
    id: 'shed-trap',
    title: 'Shed Trap',
    shortText: 'Lure stations gather wildlife traces without harming animals.',
    hintText: 'Set and revisit for fibers, fur tufts, scales, or feathers.'
  },
  'forestry': {
    id: 'forestry',
    title: 'Forestry',
    shortText: 'Harvestable trees provide timber, bark, and sap-resin stock.',
    hintText: 'Intentional nodes are more valuable than random chopping.'
  },
  'crafting': {
    id: 'crafting',
    title: 'Crafting',
    shortText: 'Crafting combines travel resources into practical supplies and upgrades.',
    hintText: 'Start with simple consumables and support tools.'
  },
  'protective-cloaks': {
    id: 'protective-cloaks',
    title: 'Protective Cloaks',
    shortText: 'Protective coverings help resist climate and environmental strain.',
    hintText: 'Prepare before entering volatile regions.'
  },
  'protective-wards': {
    id: 'protective-wards',
    title: 'Protective Wards',
    shortText: 'Wards and forcefields provide temporary defensive control zones.',
    hintText: 'Use them to secure objectives under pressure.'
  },
  'creat-feeding': {
    id: 'creat-feeding',
    title: 'Creat Feeding',
    shortText: 'Feed your creat regularly to maintain trust and readiness.',
    hintText: 'Well-fed creats perform better in long outings.'
  },
  'creat-healing': {
    id: 'creat-healing',
    title: 'Creat Healing',
    shortText: 'Treat injuries quickly to keep your creat stable and loyal.',
    hintText: 'Healing items and safe rests reduce risk of setbacks.'
  },
  'creat-gear': {
    id: 'creat-gear',
    title: 'Creat Gear',
    shortText: 'Creat gear unlocks utility roles and better performance.',
    hintText: 'Outfit by role, not just rarity.'
  },
  'home-portal': {
    id: 'home-portal',
    title: 'Home Portal',
    shortText: 'Safe marker travel lets you return to trusted ground quickly.',
    hintText: 'Activate markers as you expand into new kingdoms.'
  }
};
