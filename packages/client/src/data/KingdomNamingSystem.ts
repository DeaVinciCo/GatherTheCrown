/**
 * Canonical naming system for connected mainland kingdoms.
 * Keep this file as the source of truth for kingdom IDs and display names.
 */

export type MainlandKingdomId = 'aldermarch' | 'stormrage' | 'vastmalaise' | 'sunward';

export interface MainlandKingdomNameSet {
  id: MainlandKingdomId;
  officialName: string;
  casualName: string;
  demonym?: string;
  capitalName: string;
  primaryDockName: string;
  sceneKey: string;
}

export const MAINLAND_KINGDOMS: Record<MainlandKingdomId, MainlandKingdomNameSet> = {
  aldermarch: {
    id: 'aldermarch',
    officialName: 'The Kingdom of Aldermarch',
    casualName: 'Aldermarch',
    demonym: 'Aldermarcher',
    capitalName: 'Towne of Aldermarch',
    primaryDockName: 'Merchant Harbour',
    sceneKey: 'AldermarchTowne'
  },
  stormrage: {
    id: 'stormrage',
    officialName: 'The Stormrage Kingdom',
    casualName: 'Stormrage',
    demonym: 'Stormrager',
    capitalName: 'Citadel of Stormrage',
    primaryDockName: 'Thunderstrike Harbour',
    sceneKey: 'StormrageCitadel'
  },
  vastmalaise: {
    id: 'vastmalaise',
    officialName: 'The Vastmalaise Kingdom',
    casualName: 'Vastmalaise',
    demonym: 'Vastmalaisean',
    capitalName: 'Enclave of Vastmalaise',
    primaryDockName: 'Misthaven Pier',
    sceneKey: 'VastmalaiseEnclave'
  },
  sunward: {
    id: 'sunward',
    officialName: 'The Sunward Kingdom',
    casualName: 'Sunward',
    demonym: 'Sunwarder',
    capitalName: 'Oasis of Sunward',
    primaryDockName: 'Golden Cove',
    sceneKey: 'SunwardOasis'
  }
};

export function getMainlandKingdomNameSet(kingdomId: MainlandKingdomId): MainlandKingdomNameSet {
  return MAINLAND_KINGDOMS[kingdomId];
}
