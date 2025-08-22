import { Boss } from '@game/shared';

export const BOSSES: Boss[] = [
  {
    id: 'ember-reignlord',
    name: 'Ember Reignlord',
    element: 'Fire',
    stats: { hp: 500, stamina: 100, mana: 200 },
    phases: 2,
    rageThreshold: 0.25
  }
];
