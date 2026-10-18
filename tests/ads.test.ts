import { describe, expect, it } from 'vitest';
import { AD_POLICY, shouldShowInterstitial } from '@/features/ads/policy';
import { applyContinue, newGame, tickTimer } from '@/features/game/engine';
import { adsReducer, interstitialShown, levelFinished } from '@/features/ads/adsSlice';

const base = { nextLevel: 6, levelsSinceInterstitial: 3, lastInterstitialAt: null, adsRemoved: false, now: 1_000_000 };

describe('interstitial policy', () => {
  it('shows after enough levels', () => {
    expect(shouldShowInterstitial(base)).toBe(true);
  });
  it('never shows to players who removed ads', () => {
    expect(shouldShowInterstitial({ ...base, adsRemoved: true })).toBe(false);
  });
  it('leaves the first levels ad-free', () => {
    expect(shouldShowInterstitial({ ...base, nextLevel: AD_POLICY.firstInterstitialLevel - 1 })).toBe(false);
  });
  it('waits for enough finished levels', () => {
    expect(shouldShowInterstitial({ ...base, levelsSinceInterstitial: AD_POLICY.everyNLevels - 1 })).toBe(false);
  });
  it('keeps a minimum gap between ads', () => {
    expect(shouldShowInterstitial({ ...base, lastInterstitialAt: base.now - AD_POLICY.minGapMs + 1 })).toBe(false);
    expect(shouldShowInterstitial({ ...base, lastInterstitialAt: base.now - AD_POLICY.minGapMs })).toBe(true);
  });
});

describe('ads state', () => {
  it('counts levels and resets after an ad', () => {
    let s = adsReducer(undefined, levelFinished());
    s = adsReducer(s, levelFinished());
    expect(s.levelsSinceInterstitial).toBe(2);
    s = adsReducer(s, interstitialShown(555));
    expect(s).toEqual({ levelsSinceInterstitial: 0, lastInterstitialAt: 555 });
  });
});

describe('continue after losing', () => {
  const extra = { moves: 5, seconds: 20 };
  it('adds moves when the player ran out of moves', () => {
    const lost = { ...newGame('easy', 1), status: 'lost' as const, movesLeft: 0 };
    const next = applyContinue(lost, extra);
    expect(next.status).toBe('playing');
    expect(next.movesLeft).toBe(5);
    expect(next.continued).toBe(true);
  });
  it('adds time when the clock ran out', () => {
    let s = newGame('hard', 1);
    for (let i = 0; i < s.settings.timeLimit!; i++) s = tickTimer(s);
    const next = applyContinue(s, extra);
    expect(next.status).toBe('playing');
    expect(next.timeLeft).toBe(20);
  });
  it('only works once, and only on a lost level', () => {
    const playing = newGame('easy', 1);
    expect(applyContinue(playing, extra)).toBe(playing);
    const used = { ...playing, status: 'lost' as const, continued: true };
    expect(applyContinue(used, extra)).toBe(used);
  });
});
