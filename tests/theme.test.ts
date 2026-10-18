import { describe, expect, it } from 'vitest';
import { THEME_IDS, THEMES } from '@/core/theme/themes';
import { tileColor } from '@/core/theme/tokens';

describe('themes', () => {
  it.each(THEME_IDS)('%s defines every color and nine tile colors', (id) => {
    const theme = THEMES[id];
    expect(theme.id).toBe(id);
    expect(theme.tiles).toHaveLength(9);
    expect(new Set(theme.tiles).size).toBe(9);
    for (const value of Object.values(theme.colors)) expect(value).toBeTruthy();
  });
  it('all themes expose the same color keys', () => {
    const keys = Object.keys(THEMES.dusk.colors).sort();
    for (const id of THEME_IDS) expect(Object.keys(THEMES[id].colors).sort()).toEqual(keys);
  });
  it('maps digits 1 to 9 onto tile colors', () => {
    expect(tileColor(THEMES.dusk, 1)).toBe(THEMES.dusk.tiles[0]);
    expect(tileColor(THEMES.dusk, 9)).toBe(THEMES.dusk.tiles[8]);
  });
});
