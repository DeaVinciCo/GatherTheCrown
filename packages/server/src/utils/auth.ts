import { PrismaClient } from '@prisma/client';
import { supabaseAdmin } from './supabaseAdmin';
import { MAX_HEROES } from '../constants/GameConstants';
import { normalizeDisplayName, validateDisplayName, validateUsername } from './nameValidation';

const prisma = new PrismaClient();

/** Convert a game username to the synthetic email used in Supabase Auth. */
function toAuthEmail(username: string): string {
  return `${username.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}@gtc.local`;
}

/**
 * Create a Supabase Auth user + our User record.
 * Returns { id, username } — no session; client calls Supabase signIn directly.
 */
export async function signupUser(username: string, password: string) {
  const normalizedUsername = username.trim();
  const usernameError = validateUsername(normalizedUsername);
  if (usernameError) throw new Error(usernameError);

  const existingUser = await prisma.user.findUnique({ where: { username: normalizedUsername } });
  if (existingUser) throw new Error('Username already exists');

  const email = toAuthEmail(normalizedUsername);

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: normalizedUsername }
  });

  if (authError) throw new Error(authError.message);

  // Store User row with id = Supabase Auth UUID so RLS auth.uid() matches our FK.
  const user = await prisma.user.create({
    data: {
      id: authData.user.id,
      username: normalizedUsername,
      email
    }
  });

  return { id: user.id, username: user.username };
}

/**
 * Verify a Supabase JWT (Bearer token) and return the underlying user record.
 * Used by the JWT middleware in index.ts.
 */
export async function verifyToken(accessToken: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) throw new Error('Invalid or expired token');
  return data.user;
}

/**
 * Return user record + hero list for an authenticated request.
 * `userId` is the Supabase Auth UUID already verified by middleware.
 */
export async function getUserWithHeroes(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const heroes = await prisma.hero.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      class: true,
      element: true,
      race: true,
      skinTone: true,
      hairStyle: true,
      hairColor: true,
      selectedWeapons: true,
      originTrait: true,
      combatDoctrine: true,
      level: true,
      currentScene: true,
      lastPlayedAt: true,
      gold: true,
      soulshards: true,
      greenGems: true,
      redGems: true,
      emberFruit: true,
      crownFragments: true,
      heroGender: true,
      heroTattoo: true,
      creatElement: true,
      creatName: true,
      creatSpecies: true,
      creatStage: true,
      creatBond: true,
      creatHunger: true,
      creatCompatibility: true,
      creatOffensePoints: true,
      creatRunaway: true,
      creatCorrupted: true,
      hasCreatEgg: true,
      hasHatchedCreat: true,
      creatInventory: true,
      creatTrackerTag: true,
      creatLastSeenKingdom: true,
      creatLastFedAt: true,
      creatLastCaredAt: true,
      storyModeCompleted: true,
      havenPathsUnlocked: true,
      havenUnlocked: true,
      forestTrialsStarted: true,
      homeBaseUnlocked: true,
      kingdomArcUnlocked: true,
      unlockedSkills: true,
      completedSkillLessons: true,
      homeBaseName: true,
      homeBaseRegionName: true,
      homeBaseNameChosen: true,
      homeBaseRestDays: true,
      homeBaseStoryReady: true,
      homeBaseDay1Inspected: true,
      homeBaseDay1SuppliesGathered: true,
      homeBaseDay2Crafted: true,
      homeBaseDay2EggCared: true
    }
  });

  return {
    user: { id: user.id, username: user.username, guestIntroCompleted: user.guestIntroCompleted },
    heroes
  };
}

export async function createHeroForUser(userId: string, heroData: any) {
  const existingCount = await prisma.hero.count({ where: { userId } });
  if (existingCount >= MAX_HEROES) {
    throw new Error(`Hero limit reached. A player may have at most ${MAX_HEROES} heroes.`);
  }

  const normalizedHeroName = normalizeDisplayName(String(heroData.name || ''));
  const heroNameError = validateDisplayName(normalizedHeroName, 'Hero name');
  if (heroNameError) throw new Error(heroNameError);

  const hero = await prisma.hero.create({
    data: {
      name: normalizedHeroName,
      class: heroData.class,
      element: heroData.element,
      race: heroData.race || 'Human',
      skinTone: heroData.skinTone || 'tan',
      hairStyle: heroData.hairStyle || 'short',
      hairColor: heroData.hairColor || 'brown',
      heroGender: heroData.gender || '',
      selectedWeapons: JSON.stringify(heroData.selectedWeapons || []),
      originTrait: heroData.originTrait || 'Realm-born',
      combatDoctrine: heroData.combatDoctrine || 'Balanced',
      heroTattoo: heroData.tattoo || '',
      currentScene: 'ForestZone',
      gold: 25,
      creatElement: heroData.creatElement || '',
      creatCompatibility: heroData.creatCompatibility || 'match',
      creatBond: heroData.startingBond || 0,
      creatName: '',
      creatSpecies: heroData.creatSpecies || '',
      creatHunger: 100,
      creatOffensePoints: 0,
      creatRunaway: false,
      creatCorrupted: false,
      creatStage: 'none',
      hasCreatEgg: false,
      hasHatchedCreat: false,
      creatInventory: '[]',
      storyModeCompleted: false,
      userId
    }
  });

  return hero;
}

export async function updateHeroScene(heroId: string, sceneName: string) {
  return prisma.hero.update({
    where: { id: heroId },
    data: { currentScene: sceneName, lastPlayedAt: new Date() }
  });
}

export async function getHeroById(heroId: string) {
  return prisma.hero.findUnique({ where: { id: heroId } });
}

/**
 * Persist the full runtime state for a hero.
 * Accepts all registry-mapped fields; unknown keys are ignored.
 */
export async function saveHeroState(heroId: string, state: {
  currentScene?: string;
  gold?: number;
  level?: number;
  soulshards?: number;
  greenGems?: number;
  redGems?: number;
  emberFruit?: number;
  crownFragments?: number;
  heroGender?: string;
  creatElement?: string;
  creatName?: string;
  creatSpecies?: string;
  creatCompatibility?: string;
  creatBond?: number;
  creatHunger?: number;
  creatOffensePoints?: number;
  creatRunaway?: boolean;
  creatCorrupted?: boolean;
  creatStage?: string;
  hasCreatEgg?: boolean;
  hasHatchedCreat?: boolean;
  creatInventory?: string;
  creatTrackerTag?: string;
  creatLastSeenKingdom?: string;
  creatLastFedAt?: string;
  creatLastCaredAt?: string;
  storyModeCompleted?: boolean;
  havenPathsUnlocked?: boolean;
  havenUnlocked?: boolean;
  forestTrialsStarted?: boolean;
  homeBaseUnlocked?: boolean;
  kingdomArcUnlocked?: boolean;
  unlockedSkills?: string;
  completedSkillLessons?: string;
  homeBaseName?: string;
  homeBaseRegionName?: string;
  homeBaseNameChosen?: boolean;
  homeBaseRestDays?: number;
  homeBaseStoryReady?: boolean;
  homeBaseDay1Inspected?: boolean;
  homeBaseDay1SuppliesGathered?: boolean;
  homeBaseDay2Crafted?: boolean;
  homeBaseDay2EggCared?: boolean;
}) {
  // Build the update payload — only include fields that were provided
  const data: Record<string, unknown> = { lastPlayedAt: new Date() };
  const allowed = [
    'currentScene','gold','level','soulshards','greenGems','redGems','emberFruit','crownFragments',
    'heroGender','creatElement','creatName','creatSpecies','creatCompatibility','creatBond',
    'creatHunger','creatOffensePoints','creatRunaway','creatCorrupted','creatStage',
    'hasCreatEgg','hasHatchedCreat','creatInventory','creatTrackerTag','creatLastSeenKingdom',
    'creatLastFedAt','creatLastCaredAt','storyModeCompleted','havenPathsUnlocked','havenUnlocked',
    'forestTrialsStarted','homeBaseUnlocked','kingdomArcUnlocked','unlockedSkills',
    'completedSkillLessons','homeBaseName','homeBaseRegionName','homeBaseNameChosen',
    'homeBaseRestDays','homeBaseStoryReady','homeBaseDay1Inspected','homeBaseDay1SuppliesGathered',
    'homeBaseDay2Crafted','homeBaseDay2EggCared'
  ] as const;

  for (const key of allowed) {
    if (state[key] !== undefined) {
      data[key] = key === 'creatLastFedAt' || key === 'creatLastCaredAt'
        ? new Date(state[key] as string)
        : state[key];
    }
  }

  return prisma.hero.update({ where: { id: heroId }, data });
}
