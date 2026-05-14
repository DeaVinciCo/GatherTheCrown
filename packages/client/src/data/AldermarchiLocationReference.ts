/**
 * ALDERMARCH KINGDOM - Location Reference
 * Trade hub with merchant houses, guilds, and political councils
 */

export interface AldermarchLocationEntry {
  id: string;
  officialName: string;
  casualName?: string;
  district: string;
  purpose: string;
  signageText: string;
}

export const ALDERMARCH_LOCATIONS: Record<string, AldermarchLocationEntry> = {
  kingdom: {
    id: 'kingdom',
    officialName: 'The Kingdom of Aldermarch',
    casualName: 'Aldermarch',
    district: 'kingdom',
    purpose: 'Eastern trade hub with merchant councils and established houses',
    signageText: 'The Kingdom of Aldermarch'
  },
  dock: {
    id: 'dock',
    officialName: 'Merchant Harbour',
    casualName: 'the harbour',
    district: 'harbour',
    purpose: 'Primary trade dock connecting to distant kingdoms',
    signageText: 'Merchant Harbour'
  },
  town: {
    id: 'town',
    officialName: 'Towne of Aldermarch',
    casualName: 'Aldermarch Towne',
    district: 'towne',
    purpose: 'Central merchant city with trading houses and market centers',
    signageText: 'Towne of Aldermarch'
  },
  lordChamber: {
    id: 'lord_chamber',
    officialName: 'Lord Chamber District',
    casualName: 'Lord Chamber',
    district: 'lord_chamber',
    purpose: 'Wealthy merchant houses and council meeting halls',
    signageText: 'Lord Chamber District'
  },
  guildQuarter: {
    id: 'guild_quarter',
    officialName: 'Guild Quarter',
    casualName: 'the quarter',
    district: 'guild_quarter',
    purpose: 'Crafter guilds and skilled tradespersons',
    signageText: 'Guild Quarter'
  },
  vaultRow: {
    id: 'vault_row',
    officialName: 'Vault Row',
    casualName: 'the vaults',
    district: 'vault_row',
    purpose: 'Banking houses and secure trading exchanges',
    signageText: 'Vault Row'
  },
  caravanSquare: {
    id: 'caravan_square',
    officialName: 'Caravan Square',
    casualName: 'the square',
    district: 'caravan_square',
    purpose: 'Arrival and departure for merchant caravans',
    signageText: 'Caravan Square'
  },
  tradersRest: {
    id: 'traders_rest',
    officialName: "Trader's Rest",
    casualName: "trader's",
    district: 'traders_rest',
    purpose: 'Inns and hospitality for traveling merchants',
    signageText: "Trader's Rest"
  },
  grandExchange: {
    id: 'grand_exchange',
    officialName: 'The Grand Exchange',
    casualName: 'the exchange',
    district: 'towne',
    purpose: 'Central marketplace for all major trades',
    signageText: 'The Grand Exchange'
  },
  merchantLodge: {
    id: 'merchant_lodge',
    officialName: 'Merchant Lodge',
    casualName: 'the lodge',
    district: 'lord_chamber',
    purpose: 'Guild hall for traders and craftspeople',
    signageText: 'Merchant Lodge'
  }
};

/**
 * District emphasis rotations
 * Determines which districts are busier at different times
 */
export const ALDERMARCH_DISTRICT_EMPHASIS = {
  morning: ['lord_chamber', 'caravan_square'], // Council activity, arriving caravans
  afternoon: ['guild_quarter', 'vault_row'], // Crafting and banking
  evening: ['traders_rest', 'grand_exchange'] // Merchants gathering, trading
};

export function getAldermarchLocationName(locationId: string): string {
  const loc = ALDERMARCH_LOCATIONS[locationId];
  return loc?.officialName || locationId;
}

export function getAldermarchiCasualName(locationId: string): string {
  const loc = ALDERMARCH_LOCATIONS[locationId];
  return loc?.casualName || loc?.officialName || locationId;
}

// Backward compatibility aliases while downstream imports migrate.
export type AldermarchiLocationEntry = AldermarchLocationEntry;
export const getAldermarchiLocationName = getAldermarchLocationName;
