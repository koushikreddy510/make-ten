import { describe, expect, it } from 'vitest';
import { canLink } from '@/features/game/rules';
import { Board } from '@/features/game/types';

const full: Board = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 1, 2, 3],
];

describe('link rules', () => {
  it('any links every pair', () => {
    expect(canLink('any', full, { r: 0, c: 0 }, { r: 2, c: 3 })).toBe(true);
  });
  it('touch4 rejects diagonals, touch8 accepts them', () => {
    expect(canLink('touch4', full, { r: 0, c: 0 }, { r: 1, c: 1 })).toBe(false);
    expect(canLink('touch8', full, { r: 0, c: 0 }, { r: 1, c: 1 })).toBe(true);
    expect(canLink('touch4', full, { r: 0, c: 0 }, { r: 0, c: 1 })).toBe(true);
  });
  it('line needs a straight, clear path', () => {
    expect(canLink('line', full, { r: 0, c: 0 }, { r: 0, c: 3 })).toBe(false);
    const gap: Board = [[1, null, null, 9]];
    expect(canLink('line', gap, { r: 0, c: 0 }, { r: 0, c: 3 })).toBe(true);
    expect(canLink('line', full, { r: 0, c: 0 }, { r: 1, c: 2 })).toBe(false);
    const diagonal: Board = [[1, null, null], [null, null, null], [null, null, 9]];
    expect(canLink('line', diagonal, { r: 0, c: 0 }, { r: 2, c: 2 })).toBe(true);
  });
  it('never links a tile to itself', () => {
    expect(canLink('any', full, { r: 0, c: 0 }, { r: 0, c: 0 })).toBe(false);
  });
});
