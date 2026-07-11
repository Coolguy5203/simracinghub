// Per-game visual identity used across game cards, headers, and badges.
export interface GameTheme {
  monogram: string
  gradient: string      // tailwind gradient stops for card/header backgrounds
  text: string          // accent text color
  solid: string         // solid bg for monogram tiles / bars
  glow: string          // shadow color for header glow
}

export const GAME_THEMES: Record<string, GameTheme> = {
  iracing: {
    monogram: 'iR',
    gradient: 'from-blue-600/25 via-blue-900/15 to-transparent',
    text: 'text-blue-400',
    solid: 'bg-blue-500',
    glow: 'shadow-blue-500/20',
  },
  acc: {
    monogram: 'ACC',
    gradient: 'from-orange-600/25 via-orange-900/15 to-transparent',
    text: 'text-orange-400',
    solid: 'bg-orange-500',
    glow: 'shadow-orange-500/20',
  },
  rfactor2: {
    monogram: 'rF2',
    gradient: 'from-emerald-600/25 via-emerald-900/15 to-transparent',
    text: 'text-emerald-400',
    solid: 'bg-emerald-500',
    glow: 'shadow-emerald-500/20',
  },
  automobilista2: {
    monogram: 'AMS2',
    gradient: 'from-yellow-500/25 via-yellow-900/15 to-transparent',
    text: 'text-yellow-400',
    solid: 'bg-yellow-500',
    glow: 'shadow-yellow-500/20',
  },
  'f1-26': {
    monogram: 'F1',
    gradient: 'from-red-600/25 via-red-900/15 to-transparent',
    text: 'text-red-400',
    solid: 'bg-red-500',
    glow: 'shadow-red-500/20',
  },
  'gran-turismo-7': {
    monogram: 'GT7',
    gradient: 'from-purple-600/25 via-purple-900/15 to-transparent',
    text: 'text-purple-400',
    solid: 'bg-purple-500',
    glow: 'shadow-purple-500/20',
  },
  raceroom: {
    monogram: 'R3E',
    gradient: 'from-sky-600/25 via-sky-900/15 to-transparent',
    text: 'text-sky-400',
    solid: 'bg-sky-500',
    glow: 'shadow-sky-500/20',
  },
  'ac-evo': {
    monogram: 'EVO',
    gradient: 'from-rose-600/25 via-rose-900/15 to-transparent',
    text: 'text-rose-400',
    solid: 'bg-rose-500',
    glow: 'shadow-rose-500/20',
  },
  'lemans-ultimate': {
    monogram: 'LMU',
    gradient: 'from-indigo-600/25 via-indigo-900/15 to-transparent',
    text: 'text-indigo-400',
    solid: 'bg-indigo-500',
    glow: 'shadow-indigo-500/20',
  },
  'forza-motorsport': {
    monogram: 'FM',
    gradient: 'from-lime-600/25 via-lime-900/15 to-transparent',
    text: 'text-lime-400',
    solid: 'bg-lime-500',
    glow: 'shadow-lime-500/20',
  },
  'ea-wrc': {
    monogram: 'WRC',
    gradient: 'from-teal-600/25 via-teal-900/15 to-transparent',
    text: 'text-teal-400',
    solid: 'bg-teal-500',
    glow: 'shadow-teal-500/20',
  },
  // Legacy titles — muted variants so they read as older games
  'f1-24': {
    monogram: 'F1',
    gradient: 'from-red-900/25 via-red-950/15 to-transparent',
    text: 'text-red-500/80',
    solid: 'bg-red-800',
    glow: 'shadow-red-800/20',
  },
  'f1-25': {
    monogram: 'F1',
    gradient: 'from-red-800/25 via-red-950/15 to-transparent',
    text: 'text-red-500/90',
    solid: 'bg-red-700',
    glow: 'shadow-red-700/20',
  },
}

export const DEFAULT_THEME: GameTheme = {
  monogram: '??',
  gradient: 'from-slate-600/25 via-slate-900/15 to-transparent',
  text: 'text-slate-400',
  solid: 'bg-slate-500',
  glow: 'shadow-slate-500/20',
}

export function gameTheme(slug?: string | null): GameTheme {
  return (slug && GAME_THEMES[slug]) || DEFAULT_THEME
}
