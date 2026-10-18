import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { createStyles, radius } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { DIFFICULTIES, LEVELS_PER_DIFFICULTY } from '@/features/game/difficulty';
import { useAppSelector } from '@/store/hooks';
import { selectDifficulty, selectProgress } from '@/store/selectors';

const LEVELS = Array.from({ length: LEVELS_PER_DIFFICULTY }, (_, i) => i + 1);

const useStyles = createStyles((t) => ({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chip: { backgroundColor: t.colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 12 },
  cell: { width: '22%', aspectRatio: 1, borderRadius: radius.md, backgroundColor: t.colors.surface, alignItems: 'center', justifyContent: 'center' },
  current: { backgroundColor: t.colors.primary },
  locked: { opacity: 0.4 },
  num: { fontSize: 18, fontWeight: '800' },
  numCurrent: { color: t.colors.onPrimary },
  stars: { color: t.colors.accent, fontSize: 9 },
  scroll: { flex: 1 },
}));

export function LevelsScreen() {
  const styles = useStyles();
  const router = useRouter();
  const difficulty = useAppSelector(selectDifficulty);
  const progress = useAppSelector(selectProgress);

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">Levels</Text>
        <Pressable onPress={() => router.push('/difficulty')} style={styles.chip} accessibilityRole="button">
          <Text style={{ fontWeight: '700' }}>{DIFFICULTIES[difficulty].label} ▾</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.grid}>
        {LEVELS.map((n) => {
          const locked = n > progress.unlocked;
          const isCurrent = n === progress.unlocked;
          const stars = progress.stars[n] ?? 0;
          return (
            <Pressable
              key={n}
              disabled={locked}
              onPress={() => router.push({ pathname: '/game/[level]', params: { level: String(n) } })}
              accessibilityLabel={`Level ${n}${locked ? ', locked' : ''}`}
              style={[styles.cell, isCurrent && styles.current, locked && styles.locked]}
            >
              <Text style={[styles.num, isCurrent && styles.numCurrent]}>{locked ? '🔒' : n}</Text>
              {stars > 0 ? <Text style={styles.stars}>{'★'.repeat(stars)}</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <Button label="Back" onPress={() => router.back()} />
    </Screen>
  );
}
