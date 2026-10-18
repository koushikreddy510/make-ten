import React, { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { createStyles, radius } from '@/core/theme';
import { Text } from '@/core/ui';
import { GameState } from '../engine';
import { RULE_TEXT } from '../rules';
import { DIFFICULTIES } from '../difficulty';

const MAX_COMBO_SHOWN = 5;

const useStyles = createStyles((t) => ({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center' },
  pause: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.colors.surface, alignItems: 'center', justifyContent: 'center' },
  pill: { backgroundColor: t.colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  score: { color: t.colors.text, fontSize: 26, fontWeight: '800' },
  track: { height: 8, borderRadius: 8, backgroundColor: t.colors.surfaceDeep, marginTop: 12, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: t.colors.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  combo: { color: t.colors.accent },
  rule: { marginTop: 4 },
}));

export function GameHeader({ game, onPause }: { game: GameState; onPause: () => void }) {
  const styles = useStyles();
  const [bump] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (game.score === 0) return;
    bump.setValue(1.35);
    Animated.spring(bump, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [game.score, bump]);

  const cfg = DIFFICULTIES[game.difficulty];
  const progress = Math.min(1, game.score / game.settings.target);
  const clock = game.timeLeft !== null ? `${game.timeLeft}s · ` : '';

  return (
    <View>
      <View style={styles.top}>
        <Pressable style={styles.pause} onPress={onPause} accessibilityLabel="Pause">
          <Text>❚❚</Text>
        </Pressable>
        <View style={styles.center}>
          <Text variant="caption">{cfg.label.toUpperCase()} · LEVEL {game.level}</Text>
          <Animated.Text style={[styles.score, { transform: [{ scale: bump }] }]}>{game.score}</Animated.Text>
        </View>
        <View style={styles.pill}>
          <Text style={{ fontWeight: '700' }}>{clock}{game.movesLeft} moves</Text>
        </View>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View>
      <View style={styles.row}>
        <Text variant="caption">GOAL {game.settings.target}</Text>
        {game.combo > 1 ? <Text variant="caption" style={styles.combo}>COMBO ×{Math.min(game.combo, MAX_COMBO_SHOWN)}</Text> : null}
      </View>
      <Text variant="small" style={styles.rule}>{RULE_TEXT[cfg.link]}</Text>
    </View>
  );
}
