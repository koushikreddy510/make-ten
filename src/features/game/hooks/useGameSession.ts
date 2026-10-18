import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clockTicked, dailyStarted, sessionStarted } from '../sessionSlice';
import { DifficultyId } from '../types';

export type SessionStart =
  | { kind: 'level'; difficulty: DifficultyId; level: number }
  | { kind: 'daily'; dateKey: string };

/** Starts the game when the screen opens and runs the clock for timed levels. */
export function useGameSession(start: SessionStart) {
  const dispatch = useAppDispatch();
  const timed = useAppSelector((s) => s.session.game?.timeLeft !== null && s.session.game?.timeLeft !== undefined);
  const playing = useAppSelector((s) => s.session.game?.status === 'playing' && !s.session.paused);
  const id = start.kind === 'daily' ? `daily-${start.dateKey}` : `${start.difficulty}-${start.level}`;

  useEffect(() => {
    dispatch(start.kind === 'daily' ? dailyStarted({ dateKey: start.dateKey }) : sessionStarted({ difficulty: start.difficulty, level: start.level }));
    // `id` identifies the game being started, so the effect reruns only when that changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id]);

  useEffect(() => {
    if (!timed || !playing) return;
    const timer = setInterval(() => dispatch(clockTicked()), 1000);
    return () => clearInterval(timer);
  }, [dispatch, timed, playing]);
}
