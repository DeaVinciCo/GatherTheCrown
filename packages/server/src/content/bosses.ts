import { Boss } from '@game/shared';

export const BOSSES: Boss[] = [
  {
    id: 'ember-reignlord',
    name: 'Ember Reignlord',
    element: 'Fire',
    stats: { hp: 500, stamina: 100, mana: 200 },
    phases: 2,
    rageThreshold: 0.25
  },
  {
    id: 'frost-seraph',
    name: 'Frost Seraph',
    element: 'Frost',
    stats: { hp: 450, stamina: 120, mana: 250 },
    phases: 3,
    rageThreshold: 0.3
  },
  {
    id: 'terra-titan',
    name: 'Terra Titan',
    element: 'Earth',
    stats: { hp: 600, stamina: 150, mana: 100 },
    phases: 1,
    rageThreshold: 0.2
  }
];
