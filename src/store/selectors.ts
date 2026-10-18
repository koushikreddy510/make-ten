import { DIFFICULTIES } from '@/features/game/difficulty';
import type { RootState } from './index';

/** The difficulty in use, falling back to Easy before the player has chosen one. */
export const selectDifficulty = (s: RootState) => s.player.difficulty ?? 'easy';
export const selectDifficultyConfig = (s: RootState) => DIFFICULTIES[selectDifficulty(s)];
export const selectProgress = (s: RootState) => s.progress[selectDifficulty(s)];
/** Where "Continue" should take the player: the highest level they have unlocked. */
export const selectContinueLevel = (s: RootState) => selectProgress(s).unlocked;
/** True until the player has chosen a difficulty and seen the tutorial. */
export const selectNeedsOnboarding = (s: RootState) => s.player.difficulty === null || !s.player.tutorialSeen;
