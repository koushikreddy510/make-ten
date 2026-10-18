import { colorWithLuminance } from './color';
import { Theme, ThemeId } from './tokens';

/** Nine tile colors, one per digit, spread around the color wheel and equally bright. */
const tileRamp = (hue: (digit: number) => number, saturation: number, luminance: number): string[] =>
  Array.from({ length: 9 }, (_, i) => colorWithLuminance(((hue(i + 1) % 360) + 360) % 360, saturation, luminance));

const dusk: Theme = {
  id: 'dusk', name: 'Dusk', mode: 'dark',
  colors: {
    background: '#1b1d33', surface: '#25284a', surfaceDeep: '#14152a', border: '#34376a',
    text: '#f4efe6', textMuted: '#9a9cc0',
    primary: '#ff9f5a', primaryDeep: '#c46a24', onPrimary: '#2a1606',
    accent: '#ffd166', success: '#1f6b45', onSuccess: '#ffffff', overlay: 'rgba(10,10,24,0.72)',
  },
  tiles: tileRamp((d) => d * 37 + 10, 78, 0.45),
  tileInk: '#1d1b2e',
};

const daylight: Theme = {
  id: 'daylight', name: 'Daylight', mode: 'light',
  colors: {
    background: '#f2f4fa', surface: '#ffffff', surfaceDeep: '#d9deec', border: '#c9d0e4',
    text: '#161a2e', textMuted: '#5d6580',
    primary: '#3b5bfd', primaryDeep: '#2339b5', onPrimary: '#ffffff',
    accent: '#a85f00', success: '#0d7a4a', onSuccess: '#ffffff', overlay: 'rgba(20,24,46,0.5)',
  },
  tiles: tileRamp((d) => d * 40 + 200, 75, 0.3),
  tileInk: '#0b0e1f',
};

const neon: Theme = {
  id: 'neon', name: 'Neon', mode: 'dark',
  colors: {
    background: '#07080f', surface: '#121528', surfaceDeep: '#0b0d1a', border: '#26306b',
    text: '#eef4ff', textMuted: '#7d88b0',
    primary: '#00e5ff', primaryDeep: '#0097a7', onPrimary: '#001a1f',
    accent: '#ff2fa6', success: '#0a7a50', onSuccess: '#ffffff', overlay: 'rgba(0,0,8,0.8)',
  },
  tiles: tileRamp((d) => d * 40 + 170, 100, 0.5),
  tileInk: '#05060d',
};

const forest: Theme = {
  id: 'forest', name: 'Forest', mode: 'dark',
  colors: {
    background: '#12201a', surface: '#1c3027', surfaceDeep: '#0c1712', border: '#2f4d3f',
    text: '#eef3e6', textMuted: '#8fa896',
    primary: '#f2b84b', primaryDeep: '#b07f1f', onPrimary: '#2b1c00',
    accent: '#f2b84b', success: '#23704a', onSuccess: '#ffffff', overlay: 'rgba(4,12,8,0.75)',
  },
  tiles: tileRamp((d) => 25 + d * 17, 48, 0.4),
  tileInk: '#10201a',
};

const candy: Theme = {
  id: 'candy', name: 'Candy', mode: 'light',
  colors: {
    background: '#fff4f8', surface: '#ffffff', surfaceDeep: '#f4d6e3', border: '#efc3d6',
    text: '#3a1f3d', textMuted: '#74507a',
    primary: '#cc1f6a', primaryDeep: '#8f1048', onPrimary: '#ffffff',
    accent: '#a35c00', success: '#1c7a55', onSuccess: '#ffffff', overlay: 'rgba(58,31,61,0.55)',
  },
  tiles: tileRamp((d) => d * 43 + 300, 90, 0.32),
  tileInk: '#1f0f22',
};

export const THEMES: Record<ThemeId, Theme> = { dusk, daylight, neon, forest, candy };
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
export const DEFAULT_THEME_ID: ThemeId = 'dusk';
export const isThemeId = (value: unknown): value is ThemeId => typeof value === 'string' && value in THEMES;
