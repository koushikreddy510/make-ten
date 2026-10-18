import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { createStyles, fontSize } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { DIFFICULTIES, LEVELS_PER_DIFFICULTY } from '@/features/game/difficulty';
import { streakOn } from '@/features/daily/dailySlice';
import { todayKey } from '@/features/daily/dateKey';
import { useAppSelector } from '@/store/hooks';
import { selectContinueLevel, selectDifficulty } from '@/store/selectors';

const useStyles = createStyles((t) => ({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  ten: { color: t.colors.primary, fontSize: fontSize.display, fontWeight: '900', textShadowColor: t.colors.primaryDeep, textShadowOffset: { width: 0, height: 6 }, textShadowRadius: 0 },
  name: { letterSpacing: 6, fontWeight: '700' },
  meta: { marginTop: 10 },
  actions: { gap: 12 },
}));

export function HomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const difficulty = useAppSelector(selectDifficulty);
  const level = useAppSelector(selectContinueLevel);
  const coins = useAppSelector((s) => s.player.coins);
  const daily = useAppSelector((s) => s.daily);
  const today = todayKey();
  const streak = streakOn(daily, today);
  const doneToday = !!daily.results[today];
  const finished = level > LEVELS_PER_DIFFICULTY;
  const label = level === 1 ? 'Play · Level 1' : `Continue · Level ${Math.min(level, LEVELS_PER_DIFFICULTY)}`;

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.ten}>10</Text>
        <Text variant="muted" style={styles.name}>MAKE TEN</Text>
        <Text style={styles.meta}>{DIFFICULTIES[difficulty].label} · 🪙 {coins}</Text>
        {finished ? <Text variant="muted">All levels done on this difficulty!</Text> : null}
      </View>
      <View style={styles.actions}>
        <Button
          label={label}
          variant="primary"
          size="big"
          onPress={() => router.push({ pathname: '/game/[level]', params: { level: String(Math.min(level, LEVELS_PER_DIFFICULTY)) } })}
        />
        <Button label={`Daily challenge${streak > 0 ? ` · 🔥 ${streak}` : ''}${doneToday ? ' ✓' : ''}`} onPress={() => router.push('/daily')} />
        <Button label="Levels" onPress={() => router.push('/levels')} />
        <Button label="Settings" onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}
