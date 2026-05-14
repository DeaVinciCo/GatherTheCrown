export interface QuestObjective {
  id: string;
  description: string;
  target: number;
  progress: number;
}

export interface Quest {
  id: string;
  name: string;
  area: string;
  level: number;
  objectives: QuestObjective[];
}

export type FourKingdomId = 'aldermarch' | 'stormrage' | 'vastmalaise' | 'sunward';

export interface KingdomKeyholder {
  name: string;
  title: string;
  royalKeyName: string;
}

export interface KingdomLostItemQuest {
  id: string;
  npcName: string;
  missingItem: string;
  likelyLocation: string;
}

export interface KingdomStructureRecoveryQuest {
  id: string;
  ownerName: string;
  structureName: string;
  takeoverState: string;
  unlockKeyName: string;
}

export interface KingdomBossTargets {
  districtMiniBoss: string;
  questBoss: string;
  castleBoss: string;
}

export interface KingdomQuestChain {
  kingdomId: FourKingdomId;
  kingdomName: string;
  keyholder: KingdomKeyholder;
  unlockOrder: string[];
  townsfolkFindQuests: KingdomLostItemQuest[];
  structureRecoveryQuests: KingdomStructureRecoveryQuest[];
  bossTargets: KingdomBossTargets;
}

export const FOUR_KINGDOM_QUEST_CHAINS: Record<FourKingdomId, KingdomQuestChain> = {
  aldermarch: {
    kingdomId: 'aldermarch',
    kingdomName: 'Aldermarch',
    keyholder: {
      name: 'Warden-Matriarch Elsin Thorne',
      title: 'Royal Key Steward',
      royalKeyName: 'Root-Crown Key'
    },
    unlockOrder: [
      'Clear 2 structure recoveries in Aldermarch districts',
      'Complete 1 lost-item townsfolk quest',
      'Defeat The Milljaw Gnawlord in Old Mill Ward',
      'Receive Gate Sigil of Greenbell',
      'Defeat Briar Regent Caldrake',
      'Receive Root-Crown Key to unlock the inner portal'
    ],
    townsfolkFindQuests: [
      {
        id: 'aldermarch-find-bittermint-vials',
        npcName: 'Nella Brook',
        missingItem: 'Satchel of Bittermint Vials',
        likelyLocation: 'Flooded storeroom under Old Mill Ward'
      },
      {
        id: 'aldermarch-find-brass-compass',
        npcName: 'Tovin Pike',
        missingItem: 'Brass Tide Compass',
        likelyLocation: 'Broken dock office in Merchant Harbour'
      }
    ],
    structureRecoveryQuests: [
      {
        id: 'aldermarch-recover-smithy',
        ownerName: 'Garrick Soot',
        structureName: 'Soot and Stitch Smithy',
        takeoverState: 'Taken over by Broken Wardens',
        unlockKeyName: 'Smithfloor Trade Key'
      },
      {
        id: 'aldermarch-recover-boarding-house',
        ownerName: 'Maera Willow',
        structureName: 'Willowwake Boarding House',
        takeoverState: 'Collapsed hallways and rat nests',
        unlockKeyName: 'Boarding House House Key'
      }
    ],
    bossTargets: {
      districtMiniBoss: 'The Milljaw Gnawlord',
      questBoss: 'Rootmaw Hart-Tyrant',
      castleBoss: 'Briar Regent Caldrake'
    }
  },
  stormrage: {
    kingdomId: 'stormrage',
    kingdomName: 'Stormrage',
    keyholder: {
      name: 'Master Castellan Roarke Flint',
      title: 'Royal Key Steward',
      royalKeyName: 'Skybolt Crown Key'
    },
    unlockOrder: [
      'Clear 2 structure recoveries in Stormrage districts',
      'Complete 1 lost-item townsfolk quest',
      'Defeat Belltower Arclash Warden in High Bell Bastion',
      'Receive Gate Sigil of Raincut',
      'Defeat Tempest Marshal Graive',
      'Receive Skybolt Crown Key to unlock the inner gate'
    ],
    townsfolkFindQuests: [
      {
        id: 'stormrage-find-relay-core',
        npcName: 'Jessa Coil',
        missingItem: 'Storm Beacon Relay Core',
        likelyLocation: 'Wrecked bastion signal room'
      },
      {
        id: 'stormrage-find-talisman-ring',
        npcName: 'Bram Oath',
        missingItem: 'Saddle Talisman Ring',
        likelyLocation: 'Overrun stables in Raincut Terrace'
      }
    ],
    structureRecoveryQuests: [
      {
        id: 'stormrage-recover-forge',
        ownerName: 'Hadrik Forgeborn',
        structureName: 'Forgeborn Anvils',
        takeoverState: 'Occupied by Gate Leeches and cultists',
        unlockKeyName: 'Master Forge Trade Key'
      },
      {
        id: 'stormrage-recover-inn',
        ownerName: 'Mira Gale',
        structureName: 'Galewind Inn',
        takeoverState: 'Roof collapse and bat infestation',
        unlockKeyName: 'Cellar House Key'
      }
    ],
    bossTargets: {
      districtMiniBoss: 'Belltower Arclash Warden',
      questBoss: 'Ironcloud Roc Sovereign',
      castleBoss: 'Tempest Marshal Graive'
    }
  },
  vastmalaise: {
    kingdomId: 'vastmalaise',
    kingdomName: 'Vastmalaise',
    keyholder: {
      name: 'Archivist-Marshal Ithra Vonn',
      title: 'Royal Key Steward',
      royalKeyName: 'Mireglass Crown Key'
    },
    unlockOrder: [
      'Clear 2 structure recoveries in Vastmalaise districts',
      'Complete 1 lost-item townsfolk quest',
      'Defeat Rotfen Plague Herald in Rotfen Ward',
      'Receive Gate Sigil of Duskgate',
      'Defeat Sable Echo, the Uncrowned Queen',
      'Receive Mireglass Crown Key to unlock the palace portal'
    ],
    townsfolkFindQuests: [
      {
        id: 'vastmalaise-find-antitoxin-satchel',
        npcName: 'Pella Mire',
        missingItem: 'Antitoxin Satchel',
        likelyLocation: 'Collapsed infirmary annex'
      },
      {
        id: 'vastmalaise-find-lamp-core',
        npcName: 'Corin Voss',
        missingItem: 'Sunsalt Lamp Core',
        likelyLocation: 'Flooded lamp cellar under Veil Market'
      }
    ],
    structureRecoveryQuests: [
      {
        id: 'vastmalaise-recover-remedy-house',
        ownerName: 'Vexa Thorn',
        structureName: 'Thorn Remedy House',
        takeoverState: 'Taken by Ash Witches',
        unlockKeyName: 'Remedy House Key'
      },
      {
        id: 'vastmalaise-recover-depot',
        ownerName: 'Jorik Fen',
        structureName: 'Fenbarge Supply Depot',
        takeoverState: 'Seized by smugglers and hounds',
        unlockKeyName: 'Depot Gate Key'
      }
    ],
    bossTargets: {
      districtMiniBoss: 'Rotfen Plague Herald',
      questBoss: 'Mire Apostle Thren',
      castleBoss: 'Sable Echo, the Uncrowned Queen'
    }
  },
  sunward: {
    kingdomId: 'sunward',
    kingdomName: 'Sunward',
    keyholder: {
      name: 'Captain-Keys Ammon Rheel',
      title: 'Royal Key Steward',
      royalKeyName: 'Dawnfire Crown Key'
    },
    unlockOrder: [
      'Clear 2 structure recoveries in Sunward districts',
      'Complete 1 lost-item townsfolk quest',
      'Defeat Dunebrand Pillager-King in Brass Bazaar lanes',
      'Receive Gate Sigil of Duneward',
      'Defeat Regent of Cinders, Azrakel',
      'Receive Dawnfire Crown Key to unlock the royal portal'
    ],
    townsfolkFindQuests: [
      {
        id: 'sunward-find-aquifer-wheel',
        npcName: 'Imani Sef',
        missingItem: 'Aquifer Dial Wheel',
        likelyLocation: 'Sand-choked pumping vault'
      },
      {
        id: 'sunward-find-dispatch-tube',
        npcName: 'Rook Halem',
        missingItem: 'Sealed Dispatch Tube',
        likelyLocation: 'Raider camp near Duneward Gate'
      }
    ],
    structureRecoveryQuests: [
      {
        id: 'sunward-recover-spicehouse',
        ownerName: 'Daro Kesh',
        structureName: 'Kesh Spicehouse',
        takeoverState: 'Taken by slingers and desert raiders',
        unlockKeyName: 'Spicehouse Trade Key'
      },
      {
        id: 'sunward-recover-glasskiln',
        ownerName: 'Selene Marr',
        structureName: 'Marr Glasskiln',
        takeoverState: 'Unstable heat vents and leech nests',
        unlockKeyName: 'Kiln House Key'
      }
    ],
    bossTargets: {
      districtMiniBoss: 'Dunebrand Pillager-King',
      questBoss: 'Glass Seraph Kheled',
      castleBoss: 'Regent of Cinders, Azrakel'
    }
  }
};

export type KingdomAccessLockKind = 'door' | 'portal';

export interface KingdomAccessRequirement {
  kingdomId: FourKingdomId;
  lockKind: KingdomAccessLockKind;
  lockId: string;
  lockLabel: string;
  requiredItemIds: string[];
}

export const KINGDOM_KEY_ITEM_IDS: Record<FourKingdomId, { folkKeyItemId: string; royalKeyItemId: string; sigilItemId: string }> = {
  aldermarch: {
    folkKeyItemId: 'key-folk-aldermarch',
    royalKeyItemId: 'key-royal-root-crown',
    sigilItemId: 'quest-sigil-greenbell'
  },
  stormrage: {
    folkKeyItemId: 'key-folk-stormrage',
    royalKeyItemId: 'key-royal-skybolt-crown',
    sigilItemId: 'quest-sigil-raincut'
  },
  vastmalaise: {
    folkKeyItemId: 'key-folk-vastmalaise',
    royalKeyItemId: 'key-royal-mireglass-crown',
    sigilItemId: 'quest-sigil-duskgate'
  },
  sunward: {
    folkKeyItemId: 'key-folk-sunward',
    royalKeyItemId: 'key-royal-dawnfire-crown',
    sigilItemId: 'quest-sigil-duneward'
  }
};

export const KINGDOM_ACCESS_REQUIREMENTS: KingdomAccessRequirement[] = [
  {
    kingdomId: 'aldermarch',
    lockKind: 'door',
    lockId: 'aldermarch_structure_doors',
    lockLabel: 'Aldermarch Structure Doors',
    requiredItemIds: [KINGDOM_KEY_ITEM_IDS.aldermarch.folkKeyItemId]
  },
  {
    kingdomId: 'stormrage',
    lockKind: 'door',
    lockId: 'stormrage_structure_doors',
    lockLabel: 'Stormrage Structure Doors',
    requiredItemIds: [KINGDOM_KEY_ITEM_IDS.stormrage.folkKeyItemId]
  },
  {
    kingdomId: 'vastmalaise',
    lockKind: 'door',
    lockId: 'vastmalaise_structure_doors',
    lockLabel: 'Vastmalaise Structure Doors',
    requiredItemIds: [KINGDOM_KEY_ITEM_IDS.vastmalaise.folkKeyItemId]
  },
  {
    kingdomId: 'sunward',
    lockKind: 'door',
    lockId: 'sunward_structure_doors',
    lockLabel: 'Sunward Structure Doors',
    requiredItemIds: [KINGDOM_KEY_ITEM_IDS.sunward.folkKeyItemId]
  },
  {
    kingdomId: 'aldermarch',
    lockKind: 'portal',
    lockId: 'aldermarch_castle_portal',
    lockLabel: 'Aldermarch Castle Portal',
    requiredItemIds: [KINGDOM_KEY_ITEM_IDS.aldermarch.royalKeyItemId, KINGDOM_KEY_ITEM_IDS.aldermarch.sigilItemId]
  },
  {
    kingdomId: 'stormrage',
    lockKind: 'portal',
    lockId: 'stormrage_castle_portal',
    lockLabel: 'Stormrage Castle Portal',
    requiredItemIds: [KINGDOM_KEY_ITEM_IDS.stormrage.royalKeyItemId, KINGDOM_KEY_ITEM_IDS.stormrage.sigilItemId]
  },
  {
    kingdomId: 'vastmalaise',
    lockKind: 'portal',
    lockId: 'vastmalaise_castle_portal',
    lockLabel: 'Vastmalaise Castle Portal',
    requiredItemIds: [KINGDOM_KEY_ITEM_IDS.vastmalaise.royalKeyItemId, KINGDOM_KEY_ITEM_IDS.vastmalaise.sigilItemId]
  },
  {
    kingdomId: 'sunward',
    lockKind: 'portal',
    lockId: 'sunward_castle_portal',
    lockLabel: 'Sunward Castle Portal',
    requiredItemIds: [KINGDOM_KEY_ITEM_IDS.sunward.royalKeyItemId, KINGDOM_KEY_ITEM_IDS.sunward.sigilItemId]
  }
];

export interface KingdomBossArchetype {
  doorBoss: {
    role: 'structure_guardian';
    size: 'small' | 'medium';
    strengthRating: number;
    defaultBattleFormat: 'short_skirmish' | 'elite_duel';
    preferredElement: string;
  };
  portalBoss: {
    role: 'castle_lord';
    size: 'large' | 'huge';
    strengthRating: number;
    defaultBattleFormat: 'multi_phase_arena' | 'siege_style';
    preferredElement: string;
  };
}

export const KINGDOM_BOSS_ARCHETYPES: Record<FourKingdomId, KingdomBossArchetype> = {
  aldermarch: {
    doorBoss: {
      role: 'structure_guardian',
      size: 'medium',
      strengthRating: 54,
      defaultBattleFormat: 'elite_duel',
      preferredElement: 'Earth'
    },
    portalBoss: {
      role: 'castle_lord',
      size: 'large',
      strengthRating: 82,
      defaultBattleFormat: 'multi_phase_arena',
      preferredElement: 'Earth'
    }
  },
  stormrage: {
    doorBoss: {
      role: 'structure_guardian',
      size: 'medium',
      strengthRating: 58,
      defaultBattleFormat: 'elite_duel',
      preferredElement: 'Storm'
    },
    portalBoss: {
      role: 'castle_lord',
      size: 'large',
      strengthRating: 85,
      defaultBattleFormat: 'multi_phase_arena',
      preferredElement: 'Storm'
    }
  },
  vastmalaise: {
    doorBoss: {
      role: 'structure_guardian',
      size: 'medium',
      strengthRating: 60,
      defaultBattleFormat: 'elite_duel',
      preferredElement: 'Shadow'
    },
    portalBoss: {
      role: 'castle_lord',
      size: 'large',
      strengthRating: 88,
      defaultBattleFormat: 'multi_phase_arena',
      preferredElement: 'Shadow'
    }
  },
  sunward: {
    doorBoss: {
      role: 'structure_guardian',
      size: 'medium',
      strengthRating: 62,
      defaultBattleFormat: 'elite_duel',
      preferredElement: 'Light'
    },
    portalBoss: {
      role: 'castle_lord',
      size: 'huge',
      strengthRating: 92,
      defaultBattleFormat: 'siege_style',
      preferredElement: 'Fire'
    }
  }
};
