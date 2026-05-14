/**
 * SanctuaryIsleNotes — optional Codex / Isle Notes entries.
 *
 * These are discoverable lore fragments, not forced exposition.
 * Surface them through NPC conversation unlocks, or show a random
 * one in a future "Isle Notes" Codex scene.
 *
 * Tone: earned, not explained. The player should feel like they're
 * finding a piece of something rather than being told a backstory.
 */

export interface IsleNote {
  id: string;
  title: string;
  body: string;
  /** Optional NPC who surfaces this note through dialogue. */
  sourceNpc?: string;
  /** Category tag for a future Codex filter. */
  tag: 'history' | 'hybrid' | 'awakening' | 'people' | 'place' | 'observation';
}

export const SANCTUARY_ISLE_NOTES: IsleNote[] = [
  {
    id: 'isle_note_01',
    title: 'The Leaner Stretch',
    body: 'There was a period — nobody names the years exactly — when fewer ships ran the Sanctuary route. The roads that led here were longer in feeling than in miles. Some families who arrived during that time never left. The island became the place they chose because nowhere else offered what it quietly offered: room to exist without explaining yourself.',
    sourceNpc: 'Wren',
    tag: 'history',
  },
  {
    id: 'isle_note_02',
    title: 'Why Awakened Families Stayed',
    body: 'On the mainland, awakened families often faced gate questions at every crossing. Not because they were another species, but because resonance records, kingdom ancestry, and creat-bond histories did not always fit one district ledger. Here, fewer people asked for perfect paperwork. Some say that was the point.',
    sourceNpc: 'Harbor Jae',
    tag: 'awakening',
  },
  {
    id: 'isle_note_03',
    title: 'The Gap in the Roster',
    body: 'The youngest generation grew up here after the routes reopened. The oldest generation arrived before things settled. In between, there is a quiet gap — the years when fewer children were born, fewer families came, fewer names were added to the towne record. The gap is not a wound. It is just a mark of a harder decade that the island moved through.',
    tag: 'observation',
  },
  {
    id: 'isle_note_04',
    title: 'Elemental Convergence',
    body: 'People who lived near a kingdom\'s elemental source long enough began carrying traces of it in their blood - not powers, exactly, but resonance. Some never awaken. Some awaken mildly. Some awaken fully. Sanctuary Isle sits where several current-lines overlap, which is why every elemental leaning can appear here without changing what people are: human.',
    tag: 'awakening',
  },
  {
    id: 'isle_note_05',
    title: 'Old Ren on the Morning Catch',
    body: '"I fished alone most mornings back then. Not because I wanted to. The docks were quiet. The whole island was quieter than it should have been. Now I have to arrive early to get a good spot. I do not complain."',
    sourceNpc: 'Old Ren',
    tag: 'people',
  },
  {
    id: 'isle_note_06',
    title: 'Tide\'s Account',
    body: '"The awakened kids running the Open Ring - they train like it is just training. And it is, now. We spent years arguing whether resonance alone made someone a fighter. It does not. Here we treat awakening as potential, and Hero work as a choice people train into."',
    sourceNpc: 'Tide',
    tag: 'awakening',
  },
  {
    id: 'isle_note_07',
    title: 'The Two Schools',
    body: 'Little Lantern House opened first - a warm room near the market where younger children could learn and be looked after while parents worked. As the island grew, mentors added Field Years (ages 11-12): supervised rotations through docks, gardens, hallow care, map routes, and training yards. Hearthway Academy came later for ages 13-17, when those students were ready for formal rider preparation. None of it came from kingdom charter; the towne built it for itself.',
    tag: 'place',
  },
];

/** Return a random note from a given tag category, or any note if no tag given. */
export function getRandomIsleNote(tag?: IsleNote['tag']): IsleNote {
  const pool = tag
    ? SANCTUARY_ISLE_NOTES.filter((n) => n.tag === tag)
    : SANCTUARY_ISLE_NOTES;
  const src = pool.length > 0 ? pool : SANCTUARY_ISLE_NOTES;
  return src[Math.floor(Math.random() * src.length)];
}

/** Return a note by id, or undefined if not found. */
export function getIsleNoteById(id: string): IsleNote | undefined {
  return SANCTUARY_ISLE_NOTES.find((n) => n.id === id);
}
