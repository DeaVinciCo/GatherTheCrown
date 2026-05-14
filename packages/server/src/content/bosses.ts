import { Boss } from '@game/shared';

export interface BossAccessProfile {
  bossId: string;
  accessType: 'door' | 'portal';
  bossType: 'structure_guardian' | 'castle_lord';
  sizeClass: 'medium' | 'large' | 'huge';
  strengthClass: 'elite' | 'champion' | 'sovereign';
  battleStyle: 'elite_duel' | 'multi_phase_arena' | 'siege_style';
}

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
  },
  {
    id: 'briar-regent-caldrake',
    name: 'Briar Regent Caldrake',
    element: 'Earth',
    stats: { hp: 720, stamina: 180, mana: 140 },
    phases: 3,
    rageThreshold: 0.3
  },
  {
    id: 'tempest-marshal-graive',
    name: 'Tempest Marshal Graive',
    element: 'Storm',
    stats: { hp: 760, stamina: 170, mana: 180 },
    phases: 3,
    rageThreshold: 0.28
  },
  {
    id: 'sable-echo-uncrowned-queen',
    name: 'Sable Echo, the Uncrowned Queen',
    element: 'Shadow',
    stats: { hp: 790, stamina: 150, mana: 220 },
    phases: 3,
    rageThreshold: 0.27
  },
  {
    id: 'regent-of-cinders-azrakel',
    name: 'Regent of Cinders, Azrakel',
    element: 'Fire',
    stats: { hp: 840, stamina: 190, mana: 200 },
    phases: 4,
    rageThreshold: 0.25
  },
  {
    id: 'rootmaw-hart-tyrant',
    name: 'Rootmaw Hart-Tyrant',
    element: 'Earth',
    stats: { hp: 640, stamina: 170, mana: 110 },
    phases: 2,
    rageThreshold: 0.33
  },
  {
    id: 'ironcloud-roc-sovereign',
    name: 'Ironcloud Roc Sovereign',
    element: 'Air',
    stats: { hp: 670, stamina: 185, mana: 120 },
    phases: 2,
    rageThreshold: 0.32
  },
  {
    id: 'mire-apostle-thren',
    name: 'Mire Apostle Thren',
    element: 'Shadow',
    stats: { hp: 700, stamina: 160, mana: 175 },
    phases: 2,
    rageThreshold: 0.31
  },
  {
    id: 'glass-seraph-kheled',
    name: 'Glass Seraph Kheled',
    element: 'Light',
    stats: { hp: 730, stamina: 170, mana: 190 },
    phases: 2,
    rageThreshold: 0.29
  }
];

export const BOSS_ACCESS_PROFILES: BossAccessProfile[] = [
  {
    bossId: 'rootmaw-hart-tyrant',
    accessType: 'door',
    bossType: 'structure_guardian',
    sizeClass: 'medium',
    strengthClass: 'elite',
    battleStyle: 'elite_duel'
  },
  {
    bossId: 'ironcloud-roc-sovereign',
    accessType: 'door',
    bossType: 'structure_guardian',
    sizeClass: 'medium',
    strengthClass: 'elite',
    battleStyle: 'elite_duel'
  },
  {
    bossId: 'mire-apostle-thren',
    accessType: 'door',
    bossType: 'structure_guardian',
    sizeClass: 'medium',
    strengthClass: 'champion',
    battleStyle: 'elite_duel'
  },
  {
    bossId: 'glass-seraph-kheled',
    accessType: 'door',
    bossType: 'structure_guardian',
    sizeClass: 'medium',
    strengthClass: 'champion',
    battleStyle: 'elite_duel'
  },
  {
    bossId: 'briar-regent-caldrake',
    accessType: 'portal',
    bossType: 'castle_lord',
    sizeClass: 'large',
    strengthClass: 'champion',
    battleStyle: 'multi_phase_arena'
  },
  {
    bossId: 'tempest-marshal-graive',
    accessType: 'portal',
    bossType: 'castle_lord',
    sizeClass: 'large',
    strengthClass: 'champion',
    battleStyle: 'multi_phase_arena'
  },
  {
    bossId: 'sable-echo-uncrowned-queen',
    accessType: 'portal',
    bossType: 'castle_lord',
    sizeClass: 'large',
    strengthClass: 'sovereign',
    battleStyle: 'multi_phase_arena'
  },
  {
    bossId: 'regent-of-cinders-azrakel',
    accessType: 'portal',
    bossType: 'castle_lord',
    sizeClass: 'huge',
    strengthClass: 'sovereign',
    battleStyle: 'siege_style'
  }
];
