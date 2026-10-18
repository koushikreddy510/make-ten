import { describe, expect, it } from 'vitest';
import { applyGravity, countTiles } from '@/features/game/board';
import { DIFFICULTIES, DIFFICULTY_ORDER, LEVELS_PER_DIFFICULTY } from '@/features/game/difficulty';
import { applyHint, applyShuffle, applyUndo, newGame, tapCell, tickTimer } from '@/features/game/engine';
import { findGroup } from '@/features/game/solver';
import { clearOne } from './helpers';

describe('board generation', () => {
  it.each(DIFFICULTY_ORDER)('%s boards are full, in range and have a clear', (id) => {
    const cfg = DIFFICULTIES[id];
    for (let level = 1; level <= LEVELS_PER_DIFFICULTY; level++) {
      const s = newGame(id, level);
      expect(countTiles(s.board)).toBe(cfg.rows * cfg.cols);
      for (const row of s.board) for (const v of row) expect(v! >= 1 && v! <= s.settings.maxDigit).toBe(true);
      expect(findGroup(s.board, cfg.link)).not.toBeNull();
    }
  });
  it.each(DIFFICULTY_ORDER)('%s boards use a good mix of digits, not just one', (id) => {
    for (let level = 1; level <= LEVELS_PER_DIFFICULTY; level++) {
      const tiles = newGame(id, level).board.flat() as number[];
      const counts = new Map<number, number>();
      tiles.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
      expect(counts.size).toBeGreaterThanOrEqual(6);
      expect(Math.max(...counts.values()) / tiles.length).toBeLessThan(0.35);
    }
  });
  it('is the same every time for one level, and differs between levels', () => {
    expect(newGame('medium', 7).board).toEqual(newGame('medium', 7).board);
    expect(newGame('medium', 7).board).not.toEqual(newGame('medium', 8).board);
  });
});

describe('gameplay', () => {
  it('clears a group summing to 10, scores, and spends a move', () => {
    const s = newGame('easy', 1);
    const before = countTiles(s.board);
    const after = clearOne(s, 1000);
    expect(countTiles(after.board)).toBeLessThan(before);
    expect(after.score).toBeGreaterThan(0);
    expect(after.movesLeft).toBe(s.settings.moves - 1);
  });
  it('builds combos only inside the window', () => {
    const cfg = DIFFICULTIES.easy;
    const start = newGame('easy', 2);
    // A huge target keeps the level from ending before the third clear.
    let s = clearOne({ ...start, settings: { ...start.settings, target: 1e9 } }, 1000);
    expect(s.combo).toBe(1);
    s = clearOne(s, 2000);
    expect(s.combo).toBe(2);
    s = clearOne(s, 2000 + cfg.comboWindowMs + 1);
    expect(s.combo).toBe(1);
  });
  it('restarts the selection when the sum goes over 10', () => {
    let s = newGame('easy', 3);
    s = { ...s, board: s.board.map((r) => r.map(() => 6)) };
    s = tapCell(s, { r: 0, c: 0 }, 0);
    s = tapCell(s, { r: 0, c: 1 }, 0);
    expect(s.selected).toEqual([{ r: 0, c: 1 }]);
  });
  it('drops the last selected tile when it is tapped again', () => {
    let s = newGame('easy', 3);
    s = tapCell(s, { r: 0, c: 0 }, 0);
    s = tapCell(s, { r: 0, c: 0 }, 0);
    expect(s.selected).toEqual([]);
  });
  it('on hard, a tile that is not touching starts a new selection', () => {
    let s = newGame('hard', 1);
    s = { ...s, board: s.board.map((r) => r.map(() => 1)) };
    s = tapCell(s, { r: 0, c: 0 }, 0);
    s = tapCell(s, { r: 0, c: 3 }, 0);
    expect(s.selected).toEqual([{ r: 0, c: 3 }]);
  });
  it('drops tiles and closes empty columns', () => {
    expect(applyGravity([[1, null, 2], [null, null, 3], [4, null, null]])).toEqual([
      [null, null, null],
      [1, 2, null],
      [4, 3, null],
    ]);
  });
  it('spends helpers and refuses when none are left', () => {
    let s = newGame('medium', 1);
    s = applyHint(s);
    expect(s.hint).not.toBeNull();
    expect(s.hintsLeft).toBe(0);
    expect(applyHint(s)).toBe(s);
    expect(applyShuffle(newGame('hard', 1)).shufflesLeft).toBe(0);
    expect(applyUndo(newGame('easy', 1))).toEqual(newGame('easy', 1));
  });
  it('undo restores the board and score', () => {
    const start = newGame('easy', 4);
    const undone = applyUndo(clearOne(start, 1000));
    expect(undone.board).toEqual(start.board);
    expect(undone.score).toBe(0);
    expect(undone.undosLeft).toBe(DIFFICULTIES.easy.undos - 1);
  });
  it('loses when the timer runs out', () => {
    let s = newGame('hard', 1);
    for (let i = 0; i < s.settings.timeLimit!; i++) s = tickTimer(s);
    expect(s.status).toBe('lost');
  });
});
