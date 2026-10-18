import { describe, expect, it } from 'vitest';
import { contrast } from '@/core/theme/color';
import { THEME_IDS, THEMES } from '@/core/theme/themes';

describe('every theme is readable', () => {
  describe.each(THEME_IDS)('%s', (id) => {
    const t = THEMES[id];
    const c = t.colors;
    it('body text', () => {
      expect(contrast(c.text, c.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.text, c.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.textMuted, c.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.textMuted, c.surface)).toBeGreaterThanOrEqual(4.5);
    });
    it('text on buttons and chips', () => {
      expect(contrast(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.onSuccess, c.success)).toBeGreaterThanOrEqual(4.5);
    });
    it('digits on every tile', () => {
      for (const tile of t.tiles) expect(contrast(t.tileInk, tile)).toBeGreaterThanOrEqual(4.5);
    });
    it('tiles stand out from the background', () => {
      for (const tile of t.tiles) expect(contrast(tile, c.background)).toBeGreaterThanOrEqual(1.8);
    });
    it('highlights are visible', () => {
      expect(contrast(c.accent, c.background)).toBeGreaterThanOrEqual(3);
      expect(contrast(c.primary, c.background)).toBeGreaterThanOrEqual(3);
      expect(contrast(c.accent, c.surface)).toBeGreaterThanOrEqual(2.5);
    });
    it('the selection ring (dark ink) is visible on every tile', () => {
      for (const tile of t.tiles) expect(contrast(t.tileInk, tile)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
