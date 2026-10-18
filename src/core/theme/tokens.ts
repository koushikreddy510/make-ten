export type ThemeId = 'dusk' | 'daylight' | 'neon' | 'forest' | 'candy';

export interface ThemeColors {
  background: string;
  surface: string;
  /** Pressed edges, tracks and other recessed areas. */
  surfaceDeep: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryDeep: string;
  /** Text and icons drawn on top of `primary`. */
  onPrimary: string;
  /** Stars, coins and highlights. */
  accent: string;
  success: string;
  /** Text on `success`. */
  onSuccess: string;
  overlay: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  /** Nine tile colors, for digits 1 to 9. */
  tiles: readonly string[];
  /** Text color on a tile. */
  tileInk: string;
}

/** Sizes shared by every theme, so layouts do not change when the theme does. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 10, md: 14, lg: 24, pill: 999 } as const;
export const fontSize = { caption: 11, body: 15, button: 16, title: 30, display: 120 } as const;

/** Color of the tile showing `digit` (1 to 9). */
export const tileColor = (theme: Theme, digit: number): string => theme.tiles[(digit - 1) % theme.tiles.length];
