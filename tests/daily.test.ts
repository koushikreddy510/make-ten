import { describe, expect, it, vi } from 'vitest';
import { DAILY_RULES, dailyRule, dayNumber } from '@/features/game/daily';
import { dailyReducer, initialDailyState, nextStreak, streakOn, dailyCompleted } from '@/features/daily/dailySlice';
import { formatDateKey, previousDateKey, toDateKey } from '@/features/daily/dateKey';
import { buildShareText } from '@/features/daily/share';
import { newDailyGame, tapCell } from '@/features/game/engine';
import { cellTapped, dailyStarted } from '@/features/game/sessionSlice';
import { findGroup } from '@/features/game/solver';
import { makeStore } from '@/store';
import { defaultPersisted, migrate } from '@/store/persistence';
import { playGreedy } from './helpers';

describe('date keys', () => {
  it('formats the local calendar date', () => {
    expect(toDateKey(new Date(2026, 9, 18, 23, 59))).toBe('2026-10-18');
    expect(toDateKey(new Date(2026, 0, 5, 0, 1))).toBe('2026-01-05');
  });
  it('finds the previous day across months and years', () => {
    expect(previousDateKey('2026-10-18')).toBe('2026-10-17');
    expect(previousDateKey('2026-03-01')).toBe('2026-02-28');
    expect(previousDateKey('2028-03-01')).toBe('2028-02-29');
    expect(previousDateKey('2026-01-01')).toBe('2025-12-31');
  });
  it('writes a readable date', () => {
    expect(formatDateKey('2026-10-18')).toBe('18 Oct 2026');
  });
});

describe('daily board', () => {
  it('is the same for everyone on a date and different the next day', () => {
    expect(newDailyGame('2026-10-18').board).toEqual(newDailyGame('2026-10-18').board);
    expect(newDailyGame('2026-10-18').board).not.toEqual(newDailyGame('2026-10-19').board);
  });
  it('rotates through every rule, one per day', () => {
    const rules = Array.from({ length: DAILY_RULES.length }, (_, i) => dailyRule(`2026-10-${10 + i}`));
    expect(new Set(rules).size).toBe(DAILY_RULES.length);
    expect(dailyRule('2026-10-18')).toBe(dailyRule('2026-10-18'));
    expect(dayNumber('2026-10-19') - dayNumber('2026-10-18')).toBe(1);
  });
  it('plays by the rule of the day and always has a move', () => {
    for (let i = 0; i < 40; i++) {
      const key = toDateKey(new Date(2026, 9, 1 + i));
      const game = newDailyGame(key);
      expect(game.link).toBe(dailyRule(key));
      expect(game.mode).toBe('daily');
      expect(findGroup(game.board, game.link)).not.toBeNull();
    }
  });
  it('is winnable by a simple bot on most days', () => {
    let won = 0;
    for (let i = 0; i < 40; i++) {
      if (playGreedy(newDailyGame(toDateKey(new Date(2026, 9, 1 + i)))).status === 'won') won++;
    }
    expect(won).toBeGreaterThanOrEqual(34);
  });
  it('lets a tile that is out of line start a new selection on a straight-line day', () => {
    const key = ['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13'].find((k) => dailyRule(k) === 'touch4')!;
    let game = newDailyGame(key);
    game = { ...game, board: game.board.map((r) => r.map(() => 1)) };
    game = tapCell(game, { r: 0, c: 0 }, 0);
    game = tapCell(game, { r: 3, c: 3 }, 0);
    expect(game.selected).toEqual([{ r: 3, c: 3 }]);
  });
});

describe('streaks', () => {
  it('counts consecutive days and restarts after a gap', () => {
    expect(nextStreak(null, 0, '2026-10-18')).toBe(1);
    expect(nextStreak('2026-10-17', 4, '2026-10-18')).toBe(5);
    expect(nextStreak('2026-10-15', 4, '2026-10-18')).toBe(1);
    expect(nextStreak('2026-10-18', 4, '2026-10-18')).toBe(4);
  });
  it('shows a streak until a full day is missed', () => {
    const state = { ...initialDailyState, streak: 6, bestStreak: 6, lastCompleted: '2026-10-17' };
    expect(streakOn(state, '2026-10-17')).toBe(6);
    expect(streakOn(state, '2026-10-18')).toBe(6);
    expect(streakOn(state, '2026-10-19')).toBe(0);
  });
  it('keeps the best result when a board is replayed, without counting the day twice', () => {
    let s = dailyReducer(undefined, dailyCompleted({ dateKey: '2026-10-17', stars: 2, score: 300 }));
    s = dailyReducer(s, dailyCompleted({ dateKey: '2026-10-18', stars: 1, score: 270 }));
    s = dailyReducer(s, dailyCompleted({ dateKey: '2026-10-18', stars: 3, score: 400 }));
    expect(s.streak).toBe(2);
    expect(s.bestStreak).toBe(2);
    expect(s.results['2026-10-18']).toEqual({ stars: 3, score: 400 });
  });
  it('only keeps recent days', () => {
    let s = initialDailyState;
    for (let i = 0; i < 70; i++) s = dailyReducer(s, dailyCompleted({ dateKey: toDateKey(new Date(2026, 0, 1 + i)), stars: 1, score: 100 }));
    expect(Object.keys(s.results)).toHaveLength(60);
    expect(s.streak).toBe(70);
  });
});

describe('share message', () => {
  it('summarises the result', () => {
    const text = buildShareText({ dateKey: '2026-10-18', rule: 'line', stars: 2, score: 330, movesLeft: 7, streak: 5 });
    expect(text).toBe('Make Ten Daily · 18 Oct 2026\nRule: Straight lines\n★★☆ · 330 pts · 7 moves left\n🔥 5 day streak\nCan you beat it?');
  });
  it('leaves out a streak of one', () => {
    expect(buildShareText({ dateKey: '2026-10-18', rule: 'any', stars: 3, score: 400, movesLeft: 9, streak: 1 })).not.toContain('🔥');
  });
});

describe('daily in the store', () => {
  const setup = () => makeStore({ save: vi.fn(), playCue: vi.fn(), configureFeedback: vi.fn() });
  it('a win records the daily result and not a level', () => {
    const store = setup();
    store.dispatch(dailyStarted({ dateKey: '2026-10-18' }));
    for (let i = 0; i < 60 && store.getState().session.game!.status === 'playing'; i++) {
      const g = store.getState().session.game!;
      const group = findGroup(g.board, g.link);
      if (!group) break;
      group.forEach((cell) => store.dispatch(cellTapped({ cell, now: i * 10_000 })));
    }
    const state = store.getState();
    if (state.session.game!.status === 'won') {
      expect(state.daily.results['2026-10-18']).toBeDefined();
      expect(state.daily.streak).toBe(1);
      expect(state.progress.easy.unlocked).toBe(1);
      expect(state.progress.medium.unlocked).toBe(1);
      expect(state.ads.levelsSinceInterstitial).toBe(0);
    }
  });
  it('is saved and read back, and older saves without it still load', () => {
    const saved = defaultPersisted();
    saved.daily = { streak: 3, bestStreak: 5, lastCompleted: '2026-10-18', results: { '2026-10-18': { stars: 2, score: 300 } } };
    expect(migrate(JSON.parse(JSON.stringify(saved))).daily).toEqual(saved.daily);
    const { daily: _daily, ...old } = saved;
    expect(migrate(old).daily).toEqual(defaultPersisted().daily);
    expect(migrate({ daily: { streak: -4, results: { nope: 1 } } }).daily).toEqual(defaultPersisted().daily);
  });
});
