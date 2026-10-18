import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { createStyles } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { DIFFICULTIES, DIFFICULTY_ORDER } from '@/features/game/difficulty';
import { difficultyChosen } from '@/features/player/playerSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const useStyles = createStyles((t) => ({
  list: { flex: 1, gap: 12, marginTop: 20 },
  card: { backgroundColor: t.colors.surface, borderRadius: 18, padding: 18, gap: 4, borderWidth: 2, borderColor: 'transparent' },
  active: { borderColor: t.colors.primary },
  name: { fontSize: 22, fontWeight: '800' },
  spec: { fontSize: 12, color: t.colors.textMuted, marginTop: 4 },
  title: { marginTop: 8 },
  sub: { marginTop: 6 },
}));

/** Pick a difficulty. On first launch this leads into the tutorial. */
export function DifficultyScreen() {
  const styles = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { first } = useLocalSearchParams<{ first?: string }>();
  const current = useAppSelector((s) => s.player.difficulty);
  const tutorialSeen = useAppSelector((s) => s.player.tutorialSeen);
  const firstRun = first === '1';

  const choose = (id: (typeof DIFFICULTY_ORDER)[number]) => {
    dispatch(difficultyChosen(id));
    if (firstRun && !tutorialSeen) router.replace({ pathname: '/tutorial', params: { first: '1' } });
    else router.back();
  };

  return (
    <Screen>
      <Text variant="title" style={styles.title}>{firstRun ? 'Choose your difficulty' : 'Difficulty'}</Text>
      <Text variant="muted" style={styles.sub}>
        You can change this any time. Each difficulty keeps its own progress, so nothing is lost by switching.
      </Text>
      <View style={styles.list}>
        {DIFFICULTY_ORDER.map((id) => {
          const d = DIFFICULTIES[id];
          return (
            <Pressable key={id} onPress={() => choose(id)} style={[styles.card, current === id && styles.active]} accessibilityRole="button">
              <Text style={styles.name}>{d.label}</Text>
              <Text>{d.blurb}</Text>
              <Text style={styles.spec}>{d.cols}×{d.rows} board · {d.moves[0]} moves{d.timeLimit ? ` · ${d.timeLimit[0]}s` : ''}</Text>
            </Pressable>
          );
        })}
      </View>
      {!firstRun ? <Button label="Back" onPress={() => router.back()} /> : null}
    </Screen>
  );
}
