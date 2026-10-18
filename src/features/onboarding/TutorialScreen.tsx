import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { createStyles } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { BoardView } from '@/features/game/components/BoardView';
import { cueForChange } from '@/features/game/cues';
import { tapCell } from '@/features/game/engine';
import { DIFFICULTIES } from '@/features/game/difficulty';
import { gameFeedback } from '@/features/game/feedback';
import { RULE_TEXT } from '@/features/game/rules';
import { tutorialCompleted } from '@/features/player/playerSlice';
import { buildTutorialGame, TUTORIAL_STEPS } from '@/features/tutorial/steps';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDifficulty } from '@/store/selectors';

const useStyles = createStyles((t) => ({
  step: { marginTop: 8 },
  title: { marginTop: 4 },
  text: { marginTop: 6 },
  board: { flex: 1, justifyContent: 'center' },
  rule: { backgroundColor: t.colors.surface, borderRadius: 14, padding: 12, marginBottom: 12 },
  actions: { gap: 10 },
  nice: { textAlign: 'center', color: t.colors.accent, fontSize: 20, fontWeight: '800' },
}));

/** A short guided practice. It is shown once, and again from Settings. */
export function TutorialScreen() {
  const styles = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { first } = useLocalSearchParams<{ first?: string }>();
  const difficulty = useAppSelector(selectDifficulty);
  const [index, setIndex] = useState(0);
  const step = TUTORIAL_STEPS[index];
  const [game, setGame] = useState(() => buildTutorialGame(TUTORIAL_STEPS[0]));
  const goToStep = (next: number) => {
    setIndex(next);
    setGame(buildTutorialGame(TUTORIAL_STEPS[next]));
  };

  const done = step.isDone(game);
  const isLast = index === TUTORIAL_STEPS.length - 1;
  const finish = () => {
    dispatch(tutorialCompleted());
    if (first === '1') router.replace('/');
    else router.back();
  };
  const tap = (cell: { r: number; c: number }) => {
    const next = tapCell(game, cell, Date.now());
    const cue = cueForChange(game, next);
    if (cue && cue !== 'win' && cue !== 'lose') gameFeedback.play(cue);
    setGame(next);
  };

  return (
    <Screen>
      <Text variant="caption" style={styles.step}>STEP {index + 1} OF {TUTORIAL_STEPS.length}</Text>
      <Text variant="title" style={styles.title}>{step.title}</Text>
      <Text variant="muted" style={styles.text}>{step.text}</Text>
      <View style={styles.board}>
        <BoardView board={game.board} selected={game.selected} highlighted={done ? null : step.highlight} onTap={tap} />
      </View>
      {isLast && done ? (
        <View style={styles.rule}>
          <Text variant="caption">YOUR RULE ON {DIFFICULTIES[difficulty].label.toUpperCase()}</Text>
          <Text>{RULE_TEXT[DIFFICULTIES[difficulty].link]}</Text>
        </View>
      ) : null}
      <View style={styles.actions}>
        {done ? <Text style={styles.nice}>Nice!</Text> : null}
        <Button label={isLast ? 'Start playing' : 'Next'} variant="primary" size="big" disabled={!done} onPress={isLast ? finish : () => goToStep(index + 1)} />
        <Button label="Skip tutorial" onPress={finish} />
      </View>
    </Screen>
  );
}
