export enum PooType {
  ROCK_SOLID = 'ROCK_SOLID',
  DRY = 'DRY',
  IDEAL = 'IDEAL',
  WATERY = 'WATERY',
  UNKNOWN = 'UNKNOWN',
  RAINBOW = 'RAINBOW',
}

export interface PooLogEntry {
  id: string;
  timestamp: number;
  type: PooType;
}

export interface PooTypeConfig {
  id: PooType;
  label: string;
  subLabel: string;
  icon: string;
  color: string;
  description: string;
}
