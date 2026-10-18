/** When ads may appear. Tuned for a game that should never feel like an ad machine. */
export const AD_POLICY = {
  /** No interstitials before this level, so new players get a clean start. */
  firstInterstitialLevel: 4,
  /** Show one after this many finished levels. */
  everyNLevels: 3,
  /** Never two interstitials closer together than this. */
  minGapMs: 2 * 60 * 1000,
} as const;

export interface InterstitialContext {
  /** The level about to start. */
  nextLevel: number;
  levelsSinceInterstitial: number;
  lastInterstitialAt: number | null;
  adsRemoved: boolean;
  now: number;
}

/** Whether to show a full-screen ad before the next level. */
export function shouldShowInterstitial(ctx: InterstitialContext, policy = AD_POLICY): boolean {
  if (ctx.adsRemoved) return false;
  if (ctx.nextLevel < policy.firstInterstitialLevel) return false;
  if (ctx.levelsSinceInterstitial < policy.everyNLevels) return false;
  if (ctx.lastInterstitialAt !== null && ctx.now - ctx.lastInterstitialAt < policy.minGapMs) return false;
  return true;
}

/** What a player gets for watching a rewarded ad. */
export const REWARDS = {
  extraMoves: 5,
  extraSeconds: 20,
} as const;
