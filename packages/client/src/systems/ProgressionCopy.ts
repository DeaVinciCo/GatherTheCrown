import { gameRegistry } from '../registry/GameRegistry';

export type ProgressionCopyState =
  | 'first_time_guest'
  | 'account_created'
  | 'hero_forged'
  | 'haven_unlocked'
  | 'forest_trials_started'
  | 'creat_egg_found'
  | 'home_base_unlocked'
  | 'creat_hatched'
  | 'kingdom_arc_unlocked';

export interface ProgressionCopy {
  state: ProgressionCopyState;
  title: string;
  subtitle: string;
  primaryActionLabel: string;
  helperText: string;
  pathChooserTitle: string;
  forestPathLabel: string;
  forestPathDetail: string;
  sanctuaryPathLabel: string;
  sanctuaryPathDetail: string;
  homeTravelHint: string;
}

const COPY_BY_STATE: Record<ProgressionCopyState, Omit<ProgressionCopy, 'state'>> = {
  first_time_guest: {
    title: 'Begin in Haven',
    subtitle: 'Start your first visit, gather supplies, and learn the grounds before choosing your route.',
    primaryActionLabel: 'Play Haven Intro',
    helperText: 'No account needed for this intro run. Create your account when you are ready to continue.',
    pathChooserTitle: 'Choose Your Beginning',
    forestPathLabel: 'Forest Trials Path',
    forestPathDetail: 'Guided, combat-forward routes with stronger early rewards and clearer instruction.',
    sanctuaryPathLabel: 'Sanctuary Path',
    sanctuaryPathDetail: 'Safer, exploratory route focused on gathering, crafting, and survival-lite pacing.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  },
  account_created: {
    title: 'Account Created',
    subtitle: 'Forge your hero, then explore Haven and choose the path that fits your play style.',
    primaryActionLabel: 'Forge Your Hero',
    helperText: 'You can begin with guided Forest Trials or settle into the Sanctuary path first.',
    pathChooserTitle: 'Choose Your Beginning',
    forestPathLabel: 'Forest Trials Path',
    forestPathDetail: 'Structured route for players who want immediate action and clearer direction.',
    sanctuaryPathLabel: 'Sanctuary Path',
    sanctuaryPathDetail: 'Slower and safer route with supply gathering, prep, and discovery.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  },
  hero_forged: {
    title: 'Hero Forged',
    subtitle: 'Explore Haven, gather supplies, and decide between Forest Trials or Sanctuary first.',
    primaryActionLabel: 'Enter Haven Grounds',
    helperText: 'Both routes are valid beginner paths and converge into creat growth and larger quests later.',
    pathChooserTitle: 'Choose Your Beginning',
    forestPathLabel: 'Forest Trials Path',
    forestPathDetail: 'Guided elemental routes with stronger enemies and faster progression.',
    sanctuaryPathLabel: 'Sanctuary Path',
    sanctuaryPathDetail: 'Gathering, crafting, and exploration-first pace with lighter pressure.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  },
  haven_unlocked: {
    title: 'Haven Unlocked',
    subtitle: 'Your early game now branches into two routes: challenge-forward or sanctuary-first.',
    primaryActionLabel: 'Continue Adventure',
    helperText: 'Choose your beginning style now; both paths support combat, crafting, exploration, and egg progression.',
    pathChooserTitle: 'Choose Your Beginning',
    forestPathLabel: 'Forest Trials Path',
    forestPathDetail: 'Higher pressure route with clearer objective flow and faster leveling pace.',
    sanctuaryPathLabel: 'Sanctuary Path',
    sanctuaryPathDetail: 'Calmer route with survival-lite prep, materials, and atmospheric exploration.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  },
  forest_trials_started: {
    title: 'Forest Trials Started',
    subtitle: 'You are in the guided route. Push deeper for rewards or rotate to Sanctuary to regroup.',
    primaryActionLabel: 'Continue Adventure',
    helperText: 'Forest routes are structured and combat-focused. Sanctuary remains available as a safer prep path.',
    pathChooserTitle: 'Route Status',
    forestPathLabel: 'Forest Trials',
    forestPathDetail: 'Active: stronger enemies, clear direction, and rapid progress.',
    sanctuaryPathLabel: 'Sanctuary',
    sanctuaryPathDetail: 'Available: return to regroup, craft, and reset before the next push.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  },
  creat_egg_found: {
    title: 'Creat Egg Found',
    subtitle: 'Care for your egg, gather what it needs, and stabilize your route through Haven and Sanctuary.',
    primaryActionLabel: 'Continue Care Path',
    helperText: 'The next phase is preparation: supplies, safety, and consistent care actions.',
    pathChooserTitle: 'Care And Preparation',
    forestPathLabel: 'Forest Supply Runs',
    forestPathDetail: 'Hunt targeted materials and guarded drops for egg care and hatching prep.',
    sanctuaryPathLabel: 'Sanctuary Care Loop',
    sanctuaryPathDetail: 'Safer care rhythm with food, crafting, and lower-risk progression.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  },
  home_base_unlocked: {
    title: 'Home Base Unlocked',
    subtitle: 'Welcome to Sanctuary Isle. Each rider has a personal home-base instance in the same shared lore region.',
    primaryActionLabel: 'Return Home Base',
    helperText: 'Instant return is enabled only at safe markers, shrines, camp points, and Sanctuary portals.',
    pathChooserTitle: 'Home Base Rules',
    forestPathLabel: 'Travel Out',
    forestPathDetail: 'Take on routes, gather resources, and return at approved safe points.',
    sanctuaryPathLabel: 'Travel Home',
    sanctuaryPathDetail: 'Use Home Base return from safe markers only, not from anywhere.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  },
  creat_hatched: {
    title: 'Creat Hatched',
    subtitle: 'Bond, train, and prepare together before entering larger regional and faction objectives.',
    primaryActionLabel: 'Continue Adventure',
    helperText: 'You now have stronger route flexibility for crafting loops, travel prep, and combat growth.',
    pathChooserTitle: 'Growth Phase',
    forestPathLabel: 'Trial Challenges',
    forestPathDetail: 'Push combat and rewards with your bonded creat in tougher routes.',
    sanctuaryPathLabel: 'Base Development',
    sanctuaryPathDetail: 'Improve care systems, crafting, and home-base readiness.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  },
  kingdom_arc_unlocked: {
    title: 'Kingdom Arc Unlocked',
    subtitle: 'Kingdom requests, restoration systems, and royal progression are now active.',
    primaryActionLabel: 'Enter Kingdom Arc',
    helperText: 'You have completed early Haven/Sanctuary onboarding and can now pursue larger realm objectives.',
    pathChooserTitle: 'Advanced Routes',
    forestPathLabel: 'High-Risk Expeditions',
    forestPathDetail: 'Elite combat and high-reward routes tied to kingdom progression.',
    sanctuaryPathLabel: 'Restoration Logistics',
    sanctuaryPathDetail: 'Craft, supply, and deployment support for restoration missions.',
    homeTravelHint: 'Find a Sanctuary Portal or safe marker to return home instantly.'
  }
};

export function resolveProgressionCopyState(): ProgressionCopyState {
  const hasAccount = gameRegistry.isLoggedIn();
  const heroForged = gameRegistry.isHeroForged();

  if (gameRegistry.kingdomArcUnlocked || gameRegistry.storyModeCompleted) {
    return 'kingdom_arc_unlocked';
  }
  if (gameRegistry.hasHatchedCreat) {
    return 'creat_hatched';
  }
  if (gameRegistry.homeBaseUnlocked) {
    return 'home_base_unlocked';
  }
  if (gameRegistry.hasCreatEgg) {
    return 'creat_egg_found';
  }
  if (gameRegistry.forestTrialsStarted) {
    return 'forest_trials_started';
  }
  if (gameRegistry.havenUnlocked) {
    return 'haven_unlocked';
  }
  if (heroForged) {
    return 'hero_forged';
  }
  if (hasAccount) {
    return 'account_created';
  }
  return 'first_time_guest';
}

export function getProgressionCopy(): ProgressionCopy {
  const state = resolveProgressionCopyState();
  return {
    state,
    ...COPY_BY_STATE[state]
  };
}
