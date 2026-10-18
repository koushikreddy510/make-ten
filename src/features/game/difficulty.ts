import { DifficultyConfig, DifficultyId } from './types';

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: 'easy', label: 'Easy', blurb: 'Pick any tiles that add up to 10',
    rows: 6, cols: 5, link: 'any',
    hints: 3, shuffles: 2, undos: 3, comboWindowMs: 4000,
    maxDigit: [7, 9], moves: [20, 15], timeLimit: null, filler: [0.05, 0.3], target: [120, 240],
  },
  medium: {
    id: 'medium', label: 'Medium', blurb: 'Tiles must see each other in a straight line',
    rows: 7, cols: 6, link: 'line',
    hints: 1, shuffles: 1, undos: 2, comboWindowMs: 2500,
    maxDigit: [8, 9], moves: [22, 16], timeLimit: null, filler: [0.1, 0.35], target: [200, 360],
  },
  hard: {
    id: 'hard', label: 'Hard', blurb: 'Tiles must touch, with a ticking clock',
    rows: 8, cols: 7, link: 'touch4',
    hints: 0, shuffles: 1, undos: 1, comboWindowMs: 1500,
    maxDigit: [9, 9], moves: [24, 17], timeLimit: [90, 70], filler: [0.15, 0.4], target: [320, 480],
  },
};

export const DIFFICULTY_ORDER: readonly DifficultyId[] = ['easy', 'medium', 'hard'];
export const LEVELS_PER_DIFFICULTY = 30;
