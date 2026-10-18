import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import { createStyles, radius, THEMES, useTheme } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { DIFFICULTIES } from '@/features/game/difficulty';
import { adsRemovedSet } from '@/features/player/playerSlice';
import { usePurchases } from '@/features/purchases/PurchasesProvider';
import { progressReset } from '@/features/progress/progressSlice';
import { hapticsSet, soundSet } from '@/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDifficulty } from '@/store/selectors';

const useStyles = createStyles((t) => ({
  list: { flex: 1, gap: 12, marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: t.colors.surface, borderRadius: radius.md, paddingHorizontal: 16, height: 52 },
  rowLabel: { fontSize: 16, fontWeight: '700' },
  warn: { marginBottom: 4 },
  confirm: { gap: 8 },
}));

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.colors.primary, false: theme.colors.surfaceDeep }} />
    </View>
  );
}

export function SettingsScreen() {
  const styles = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.settings);
  const difficulty = useAppSelector(selectDifficulty);
  const [confirming, setConfirming] = useState(false);
  const purchases = usePurchases();
  const adsRemoved = useAppSelector((s) => s.player.adsRemoved);
  const [price, setPrice] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    purchases.priceOfRemoveAds().then(setPrice);
  }, [purchases]);

  const buy = async () => {
    const result = await purchases.buyRemoveAds();
    if (result === 'purchased') {
      dispatch(adsRemovedSet(true));
      setNotice(null);
    } else if (result === 'failed') setNotice('The purchase did not go through. You were not charged.');
  };
  const restore = async () => {
    const owned = await purchases.restore();
    if (owned.removeAds) {
      dispatch(adsRemovedSet(true));
      setNotice('Purchase restored. Ads are removed.');
    } else setNotice('No earlier purchase was found for this account.');
  };

  return (
    <Screen>
      <Text variant="title">Settings</Text>
      <View style={styles.list}>
        <Button label={`Difficulty: ${DIFFICULTIES[difficulty].label}`} onPress={() => router.push('/difficulty')} />
        <Button label={`Theme: ${THEMES[settings.themeId].name}`} onPress={() => router.push('/themes')} />
        <ToggleRow label="Sound" value={settings.sound} onChange={(v) => dispatch(soundSet(v))} />
        <ToggleRow label="Haptics" value={settings.haptics} onChange={(v) => dispatch(hapticsSet(v))} />
        <Button label="How to play" onPress={() => router.push('/tutorial')} />
        {adsRemoved ? (
          <Text variant="muted">Ads between levels are removed. Thank you!</Text>
        ) : (
          <Button label={price ? `Remove ads · ${price}` : 'Remove ads'} onPress={buy} />
        )}
        <Button label="Restore purchases" onPress={restore} />
        {notice ? <Text variant="muted">{notice}</Text> : null}
        {confirming ? (
          <View style={styles.confirm}>
            <Text variant="muted" style={styles.warn}>This erases all levels, stars and coins on this device.</Text>
            <Button label="Yes, erase my progress" onPress={() => { dispatch(progressReset()); setConfirming(false); }} />
            <Button label="Cancel" onPress={() => setConfirming(false)} />
          </View>
        ) : (
          <Button label="Reset progress" onPress={() => setConfirming(true)} />
        )}
      </View>
      <Button label="Back" variant="primary" onPress={() => router.back()} />
    </Screen>
  );
}
