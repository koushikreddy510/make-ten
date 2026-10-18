import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { createStyles, radius } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { interstitialShown } from '@/features/ads/adsSlice';
import { useAds } from '@/features/ads/AdsProvider';
import { REWARDS, shouldShowInterstitial } from '@/features/ads/policy';
import { coinsEarned } from '@/features/player/playerSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectDifficulty } from '@/store/selectors';
import { BoardView } from '../components/BoardView';
import { GameHeader } from '../components/GameHeader';
import { Overlay } from '../components/Overlay';
import { ToolBar } from '../components/ToolBar';
import { LEVELS_PER_DIFFICULTY } from '../difficulty';
import { coinsFor, selectionSum, starsFor } from '../engine';
import { useGameSession } from '../hooks/useGameSession';
import {
  bonusClaimed, cellTapped, continueGranted, hintUsed, paused, resumed, sessionStarted, shuffleUsed, undoUsed,
} from '../sessionSlice';

const useStyles = createStyles((t) => ({
  chipRow: { height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  chipText: { fontWeight: '700', fontSize: 16 },
  chip: { backgroundColor: t.colors.surface, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 6 },
  chipOk: { backgroundColor: t.colors.success },
  chipOkText: { color: t.colors.onSuccess },
  board: { flex: 1, justifyContent: 'center' },
  stars: { color: t.colors.accent, fontSize: 38, textAlign: 'center' },
  starOff: { color: t.colors.surfaceDeep },
  big: { fontSize: 40, fontWeight: '800', textAlign: 'center' },
  center: { textAlign: 'center' },
}));

export function GameScreen({ level }: { level: number }) {
  const styles = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const ads = useAds();
  const difficulty = useAppSelector(selectDifficulty);
  const game = useAppSelector((s) => s.session.game);
  const isPaused = useAppSelector((s) => s.session.paused);
  const bonusTaken = useAppSelector((s) => s.session.bonusClaimed);
  const adState = useAppSelector((s) => s.ads);
  const adsRemoved = useAppSelector((s) => s.player.adsRemoved);
  useGameSession(difficulty, level);

  if (!game || game.level !== level || game.difficulty !== difficulty) return null;

  const stars = starsFor(game);
  const coins = coinsFor(stars);
  const sum = selectionSum(game);
  const exit = () => router.replace('/levels');
  const restart = () => dispatch(sessionStarted({ difficulty, level }));

  const goNext = async () => {
    const next = level + 1;
    const now = Date.now();
    if (shouldShowInterstitial({ nextLevel: next, ...adState, adsRemoved, now })) {
      await ads.showInterstitial();
      dispatch(interstitialShown(Date.now()));
    }
    router.replace({ pathname: '/game/[level]', params: { level: String(next) } });
  };
  const doubleCoins = async () => {
    if (await ads.showRewarded()) {
      dispatch(coinsEarned(coins));
      dispatch(bonusClaimed());
    }
  };
  const continueLevel = async () => {
    if (await ads.showRewarded()) dispatch(continueGranted({ moves: REWARDS.extraMoves, seconds: REWARDS.extraSeconds }));
  };

  const loseTitle = game.timeLeft === 0 ? "Time's up" : game.movesLeft <= 0 ? 'Out of moves' : 'No moves left';
  const hasNext = level < LEVELS_PER_DIFFICULTY;

  return (
    <Screen>
      <GameHeader game={game} onPause={() => dispatch(paused())} />
      <View style={styles.chipRow}>
        {game.selected.length > 1 ? (
          <View style={[styles.chip, sum === 10 && styles.chipOk]}>
            <Text style={[styles.chipText, sum === 10 && styles.chipOkText]}>
              {game.selected.map((p) => game.board[p.r][p.c]).join(' + ')} = {sum}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.board}>
        <BoardView
          board={game.board}
          selected={game.selected}
          highlighted={game.hint}
          onTap={(cell) => dispatch(cellTapped({ cell, now: Date.now() }))}
        />
      </View>
      <ToolBar
        undos={game.undosLeft}
        hints={game.hintsLeft}
        shuffles={game.shufflesLeft}
        canUndo={game.history.length > 0}
        onUndo={() => dispatch(undoUsed())}
        onHint={() => dispatch(hintUsed())}
        onShuffle={() => dispatch(shuffleUsed())}
      />

      {isPaused && game.status === 'playing' ? (
        <Overlay title="Paused">
          <Button label="Resume" variant="primary" size="big" onPress={() => dispatch(resumed())} />
          <Button label="Restart level" onPress={restart} />
          <Button label="Levels" onPress={exit} />
        </Overlay>
      ) : null}

      {game.status === 'won' ? (
        <Overlay title={`Level ${level} clear!`}>
          <Text style={styles.stars}>
            {'★'.repeat(stars)}
            <Text style={[styles.stars, styles.starOff]}>{'★'.repeat(3 - stars)}</Text>
          </Text>
          <Text style={styles.big}>{game.score}</Text>
          <Text variant="muted" style={styles.center}>+{coins} coins</Text>
          {hasNext ? <Button label="Next level" variant="primary" size="big" onPress={goNext} /> : <Text variant="muted" style={styles.center}>You finished every level here. Try a harder difficulty!</Text>}
          {!bonusTaken ? <Button label={`Watch ad · double coins (+${coins})`} onPress={doubleCoins} /> : null}
          <Button label="Replay" onPress={restart} />
          <Button label="Levels" onPress={exit} />
        </Overlay>
      ) : null}

      {game.status === 'lost' ? (
        <Overlay title={loseTitle}>
          <Text variant="muted" style={styles.center}>You needed {Math.max(0, game.settings.target - game.score)} more points.</Text>
          {!game.continued ? (
            <Button label={game.timeLeft === 0 ? `Watch ad · +${REWARDS.extraSeconds}s` : `Watch ad · +${REWARDS.extraMoves} moves`} variant="primary" size="big" onPress={continueLevel} />
          ) : null}
          <Button label="Try again" variant={game.continued ? 'primary' : 'secondary'} size={game.continued ? 'big' : 'regular'} onPress={restart} />
          <Button label="Levels" onPress={exit} />
        </Overlay>
      ) : null}
    </Screen>
  );
}
