export enum PooType {
  ROCK_SOLID = 'ROCK_SOLID',
  DRY = 'DRY',
  IDEAL = 'IDEAL',
  WATERY = 'WATERY',
  UNKNOWN = 'UNKNOWN',
  RAINBOW = 'RAINBOW',
}

export enum FlushRank {
  NORMAL = 'NORMAL',
  BLESSED = 'BLESSED',
  HOLY = 'HOLY',
  DIVINE = 'DIVINE',
  LEGENDARY = 'LEGENDARY',
}

export interface PooLogEntry {
  id: string;
  timestamp: number;
  type: PooType;
  rank?: FlushRank;
}

export interface PooTypeConfig {
  id: PooType;
  label: string;
  subLabel: string;
  icon: string;
  color: string;
  description: string;
}
