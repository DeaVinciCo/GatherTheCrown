import { Weapon } from '@game/shared';

export const WEAPONS: Weapon[] = [
  { id: 'sword1', name: 'Odyssey Sword', type: 'weapon', element: 'Light', damage: 10, durability: 100 },
  { id: 'kukri1', name: 'Kukri', type: 'weapon', element: 'Shadow', damage: 8, durability: 80 },
  { id: 'bow1', name: 'Bow', type: 'tool', element: 'Air', damage: 5, durability: 60 },
  { id: 'multitool1', name: 'Multitool', type: 'tool', element: 'Frost', damage: 2, durability: 50 },
  { id: 'frost-dagger1', name: 'Frost Dagger', type: 'weapon', element: 'Frost', damage: 7, durability: 70 },
  { id: 'ice-rod1', name: 'Ice Rod', type: 'tool', element: 'Frost', damage: 4, durability: 60 },
  { id: 'earth-hammer1', name: 'Earth Hammer', type: 'weapon', element: 'Earth', damage: 12, durability: 110 },
  { id: 'shovel1', name: 'Shovel', type: 'tool', element: 'Earth', damage: 3, durability: 80 }
];
