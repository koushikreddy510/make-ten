import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clockTicked, sessionStarted } from '../sessionSlice';
import { DifficultyId } from '../types';

/** Starts the level when the screen opens and runs the clock for timed levels. */
export function useGameSession(difficulty: DifficultyId, level: number) {
  const dispatch = useAppDispatch();
  const timed = useAppSelector((s) => s.session.game?.timeLeft !== null && s.session.game?.timeLeft !== undefined);
  const playing = useAppSelector((s) => s.session.game?.status === 'playing' && !s.session.paused);

  useEffect(() => {
    dispatch(sessionStarted({ difficulty, level }));
  }, [dispatch, difficulty, level]);

  useEffect(() => {
    if (!timed || !playing) return;
    const id = setInterval(() => dispatch(clockTicked()), 1000);
    return () => clearInterval(id);
  }, [dispatch, timed, playing]);
}
