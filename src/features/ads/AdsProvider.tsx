import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, Text } from '@/core/ui';

/** What the game needs from an ad network. A real AdMob service implements the same interface. */
export interface AdService {
  /** Shows a full-screen ad. Resolves when it is closed. */
  showInterstitial(): Promise<void>;
  /** Shows an ad the player chose to watch. Resolves true if they earned the reward. */
  showRewarded(): Promise<boolean>;
}

const AdsContext = createContext<AdService>({
  showInterstitial: async () => {},
  showRewarded: async () => false,
});

export const useAds = (): AdService => useContext(AdsContext);

type Pending = { kind: 'interstitial' | 'rewarded'; resolve: (earned: boolean) => void };
const AD_SECONDS = 3;

/**
 * Stand-in for a real ad network during development: shows a placeholder ad with a countdown.
 * Replace this with an AdMob-backed provider when the app gets a development build.
 */
export function DevAdsProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [seconds, setSeconds] = useState(AD_SECONDS);

  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [pending]);

  const close = () => {
    pending?.resolve(seconds === 0);
    setPending(null);
  };

  const service = useMemo<AdService>(() => {
    const open = (kind: Pending['kind']) =>
      new Promise<boolean>((resolve) => {
        setSeconds(AD_SECONDS);
        setPending({ kind, resolve });
      });
    return {
      showInterstitial: async () => void (await open('interstitial')),
      showRewarded: () => open('rewarded'),
    };
  }, []);

  return (
    <AdsContext.Provider value={service}>
      {children}
      <Modal visible={pending !== null} animationType="fade" transparent={false}>
        <View style={styles.ad}>
          <Text style={styles.label}>{pending?.kind === 'rewarded' ? 'REWARDED AD (PLACEHOLDER)' : 'FULL-SCREEN AD (PLACEHOLDER)'}</Text>
          <Text style={styles.note}>A real ad from AdMob will play here.</Text>
          <Button
            label={seconds > 0 ? `Closes in ${seconds}s` : pending?.kind === 'rewarded' ? 'Claim reward' : 'Close'}
            variant="primary"
            disabled={seconds > 0 && pending?.kind === 'rewarded'}
            onPress={close}
          />
          {pending?.kind === 'rewarded' && seconds > 0 ? <Button label="Skip, no reward" onPress={close} /> : null}
        </View>
      </Modal>
    </AdsContext.Provider>
  );
}

const styles = StyleSheet.create({
  ad: { flex: 1, backgroundColor: '#ececec', alignItems: 'stretch', justifyContent: 'center', padding: 32, gap: 12 },
  label: { color: '#333', textAlign: 'center', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  note: { color: '#666', textAlign: 'center', marginBottom: 16 },
});
