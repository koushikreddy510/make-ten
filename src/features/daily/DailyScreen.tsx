import { useRouter } from 'expo-router';
import React from 'react';
import { Share, View } from 'react-native';
import { createStyles, radius } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { dailyRule } from '@/features/game/daily';
import { RULE_NAME, RULE_TEXT } from '@/features/game/rules';
import { useAppSelector } from '@/store/hooks';
import { streakOn } from './dailySlice';
import { formatDateKey, todayKey } from './dateKey';
import { buildShareText } from './share';

const useStyles = createStyles((t) => ({
  body: { flex: 1, gap: 14, marginTop: 16 },
  card: { backgroundColor: t.colors.surface, borderRadius: radius.lg, padding: 18, gap: 6 },
  rule: { fontSize: 24, fontWeight: '800' },
  streakRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: t.colors.surface, borderRadius: radius.md, padding: 14, gap: 2 },
  statValue: { fontSize: 26, fontWeight: '800' },
  stars: { color: t.colors.accent, fontSize: 28 },
  actions: { gap: 10 },
}));

/** Today's shared board: the rule of the day, the streak, and how today went. */
export function DailyScreen() {
  const styles = useStyles();
  const router = useRouter();
  const daily = useAppSelector((s) => s.daily);
  const today = todayKey();
  const rule = dailyRule(today);
  const streak = streakOn(daily, today);
  const result = daily.results[today];

  const share = () =>
    result &&
    Share.share({ message: buildShareText({ dateKey: today, rule, stars: result.stars, score: result.score, movesLeft: 0, streak: Math.max(1, streak) }).replace(' · 0 moves left', '') });

  return (
    <Screen>
      <Text variant="caption">{formatDateKey(today).toUpperCase()}</Text>
      <Text variant="title">Daily challenge</Text>
      <View style={styles.body}>
        <View style={styles.card}>
          <Text variant="caption">RULE OF THE DAY</Text>
          <Text style={styles.rule}>{RULE_NAME[rule]}</Text>
          <Text variant="muted">{RULE_TEXT[rule]}</Text>
        </View>
        <View style={styles.streakRow}>
          <View style={styles.stat}>
            <Text variant="caption">STREAK</Text>
            <Text style={styles.statValue}>🔥 {streak}</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="caption">BEST STREAK</Text>
            <Text style={styles.statValue}>{daily.bestStreak}</Text>
          </View>
        </View>
        {result ? (
          <View style={styles.card}>
            <Text variant="caption">TODAY</Text>
            <Text style={styles.stars}>{'★'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</Text>
            <Text>{result.score} points. Play again to beat it. A new board arrives at midnight.</Text>
          </View>
        ) : (
          <Text variant="muted">Everyone gets the same board today. Finish it to keep your streak going.</Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button label={result ? 'Play again' : "Play today's board"} variant="primary" size="big" onPress={() => router.push('/daily/play')} />
        {result ? <Button label="Share result" onPress={share} /> : null}
        <Button label="Back" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
