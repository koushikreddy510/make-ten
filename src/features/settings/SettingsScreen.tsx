import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { createStyles, radius, THEMES, useTheme } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { DIFFICULTIES } from '@/features/game/difficulty';
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

  return (
    <Screen>
      <Text variant="title">Settings</Text>
      <View style={styles.list}>
        <Button label={`Difficulty: ${DIFFICULTIES[difficulty].label}`} onPress={() => router.push('/difficulty')} />
        <Button label={`Theme: ${THEMES[settings.themeId].name}`} onPress={() => router.push('/themes')} />
        <ToggleRow label="Sound" value={settings.sound} onChange={(v) => dispatch(soundSet(v))} />
        <ToggleRow label="Haptics" value={settings.haptics} onChange={(v) => dispatch(hapticsSet(v))} />
        <Button label="How to play" onPress={() => router.push('/tutorial')} />
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
