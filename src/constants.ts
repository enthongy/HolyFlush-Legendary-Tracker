import { PooType, PooTypeConfig } from './types';

export const POO_TYPES: PooTypeConfig[] = [
  {
    id: PooType.ROCK_SOLID,
    label: 'Rock Solid',
    subLabel: 'Type 1',
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
    id: PooType.IDEAL,
    label: 'Ideal',
    subLabel: 'Type 4',
    icon: '🐍',
    color: 'bg-emerald-600',
    description: 'The gold standard',
  },
  {
    id: PooType.WATERY,
    label: 'Watery',
    subLabel: 'Type 7',
    icon: '💧',
    color: 'bg-blue-500',
    description: 'Diarrhea',
  },
  {
    id: PooType.UNKNOWN,
    label: 'Unknown',
    subLabel: '?',
    icon: '❓',
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
  SPLASH: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  FLUSH: 'https://assets.mixkit.co/active_storage/sfx/1350/1350-preview.mp3',
  RAINBOW: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  HOLY: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3', // More intense heavenly shimmer
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Subtle click for the handle
};
