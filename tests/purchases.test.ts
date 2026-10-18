import { beforeEach, describe, expect, it } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createDevPurchaseService, DEV_PURCHASES_KEY } from '@/features/purchases/devService';
import { adsRemovedSet, playerReducer, initialPlayerState } from '@/features/player/playerSlice';
import { progressReset } from '@/features/progress/progressSlice';
import { shouldShowInterstitial } from '@/features/ads/policy';

const ctx = { nextLevel: 9, levelsSinceInterstitial: 5, lastInterstitialAt: null, adsRemoved: false, now: 1_000_000 };

describe('remove ads purchase', () => {
  beforeEach(async () => {
    await AsyncStorage.setItem(DEV_PURCHASES_KEY, '');
  });

  it('completes when the player confirms, and can be restored afterwards', async () => {
    const service = createDevPurchaseService({ confirm: async () => true });
    expect(await service.restore()).toEqual({ removeAds: false });
    expect(await service.buyRemoveAds()).toBe('purchased');
    expect(await service.restore()).toEqual({ removeAds: true });
  });
  it('charges nothing when the player cancels', async () => {
    const service = createDevPurchaseService({ confirm: async () => false });
    expect(await service.buyRemoveAds()).toBe('cancelled');
    expect(await service.restore()).toEqual({ removeAds: false });
  });
  it('shows a price', async () => {
    expect(await createDevPurchaseService({ confirm: async () => true }).priceOfRemoveAds()).toBe('$2.99');
  });
  it('stops interstitials once owned, and survives a progress reset', () => {
    expect(shouldShowInterstitial(ctx)).toBe(true);
    let player = playerReducer(initialPlayerState, adsRemovedSet(true));
    player = playerReducer({ ...player, coins: 40 }, progressReset());
    expect(player.adsRemoved).toBe(true);
    expect(player.coins).toBe(0);
    expect(shouldShowInterstitial({ ...ctx, adsRemoved: player.adsRemoved })).toBe(false);
  });
});
