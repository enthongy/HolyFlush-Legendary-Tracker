import { PooType, PooTypeConfig } from './types';

export const POO_TYPES: PooTypeConfig[] = [
  {
    id: PooType.IDEAL,
    label: 'Ideal',
    subLabel: 'Type 1',
    icon: '🐍',
    color: 'bg-emerald-600',
    description: 'The gold standard',
  },
  {
    id: PooType.ROCK_SOLID,
    label: 'Rock Solid',
    subLabel: 'Type 2',
    icon: '🪨',
    color: 'bg-stone-600',
    description: 'Constipation',
  },
  {
    id: PooType.DRY,
    label: 'Dry',
    subLabel: 'Type 3',
    icon: '🌵',
    color: 'bg-amber-700',
    description: 'Low hydration',
  },
  {
    id: PooType.WATERY,
    label: 'Watery',
    subLabel: 'Type 4',
    icon: '💧',
    color: 'bg-blue-500',
    description: 'Diarrhea',
  },
  {
    id: PooType.UNKNOWN,
    label: 'Unknown',
    subLabel: 'Type ?',
    icon: '🔮',
    color: 'bg-slate-400',
    description: "Didn't look",
  },
  {
    id: PooType.RAINBOW,
    label: 'Rainbow',
    subLabel: 'Legendary',
    icon: '🌈',
    color: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400',
    description: 'Special day',
  },
];

export const SOUNDS = {
  SPLASH: 'https://image2url.com/r2/default/audio/1771998715800-79455c88-33e7-4d96-a4ea-657c316e8854.mp3',
  FLUSH: 'https://image2url.com/r2/default/audio/1771995663220-a770ed66-a2d2-4085-8dcc-fffe477e2c39.mp3',
  RAINBOW: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  HOLY: 'https://image2url.com/r2/default/audio/1771997563766-fbda3064-caf8-45c0-aa65-4bad81edb495.mp3', // More intense heavenly shimmer
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Subtle click for the handle
};
