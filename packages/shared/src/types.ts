export type Element =
  | 'Fire'
  | 'Water'
  | 'Earth'
  | 'Air'
  | 'Storm'
  | 'Frost'
  | 'Light'
  | 'Shadow';

export interface Stats {
  hp: number;
  stamina: number;
  mana: number;
}

export interface Hero {
  id: string;
  name: string;
  level: number;
  element: Element;
  stats: Stats;
  creatId: string;
  bond: number; // 0-1
}

export interface Creat {
  id: string;
  species: string;
  element: Element;
  stage: 'hatchling' | 'mount';
  stats: Stats;
}

export interface Enemy {
  id: string;
  name: string;
  element: Element;
  stats: Stats;
}

export interface Boss extends Enemy {
  phases: number;
  rageThreshold: number;
}

export interface CrownFragment {
  id: string;
  metal: Metal;
  gem?: Gem;
  shards: number;
}

export interface Item {
  id: string;
  name: string;
  type: string;
}

export interface Weapon extends Item {
  element: Element;
  damage: number;
  durability: number;
}

export interface Potion extends Item {
  effect: string;
  potency: number;
}

export interface Spell extends Item {
  element: Element;
  cost: number;
  cooldown: number;
}

export interface Resource {
  id: string;
  type: 'gold' | 'shard' | 'gem' | 'metal';
  amount: number;
}

export type Gem = 'Quartz' | 'Sapphire' | 'Topaz' | 'Bixbite';
export type Metal = 'Copper' | 'Silver' | 'Gold';
export type Shard = 'FireShard' | 'IceShard' | 'StormShard';

export interface DistrictObjective {
  id: string;
  description: string;
  progress: number;
  target: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface SkillNode {
  skill: Skill;
  requires: string[];
}
