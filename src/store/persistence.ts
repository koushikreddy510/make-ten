import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME_ID, isThemeId } from '@/core/theme/themes';
import { DIFFICULTY_ORDER } from '@/features/game/difficulty';
import { DailyState, initialDailyState } from '@/features/daily/dailySlice';
import { isDateKey } from '@/features/daily/dateKey';
import { initialPlayerState, PlayerState } from '@/features/player/playerSlice';
import { initialProgressState, ProgressState } from '@/features/progress/progressSlice';
import { initialSettingsState, SettingsState } from '@/features/settings/settingsSlice';

export const SAVE_KEY = 'maketen.save';
/** Bump this when the saved shape changes, and teach `migrate` how to read the old one. */
export const SAVE_VERSION = 4;

/** The parts of the app state that survive closing the app. */
export interface PersistedState {
  version: number;
  player: PlayerState;
  settings: SettingsState;
  progress: ProgressState;
  daily: DailyState;
}

export const defaultPersisted = (): PersistedState => ({
  version: SAVE_VERSION,
  player: { ...initialPlayerState },
  settings: { ...initialSettingsState },
  progress: initialProgressState(),
  daily: { ...initialDailyState, results: {} },
});

const isObject = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null;

/**
 * Turns whatever is stored into a valid current save: junk becomes defaults, missing fields
 * are filled in, and the older flat layout (versions 1 and 2) is moved into the new slices.
 */
export function migrate(raw: unknown): PersistedState {
  const out = defaultPersisted();
  if (!isObject(raw)) return out;

  const player = isObject(raw.player) ? raw.player : raw; // v1 and v2 kept these at the top level
  if (DIFFICULTY_ORDER.includes(player.difficulty)) out.player.difficulty = player.difficulty;
  if (typeof player.tutorialSeen === 'boolean') out.player.tutorialSeen = player.tutorialSeen;
  if (typeof player.coins === 'number' && player.coins >= 0) out.player.coins = Math.floor(player.coins);
  if (typeof player.adsRemoved === 'boolean') out.player.adsRemoved = player.adsRemoved;

  const settings = isObject(raw.settings) ? raw.settings : {};
  if (typeof settings.sound === 'boolean') out.settings.sound = settings.sound;
  if (typeof settings.haptics === 'boolean') out.settings.haptics = settings.haptics;
  out.settings.themeId = isThemeId(settings.themeId) ? settings.themeId : DEFAULT_THEME_ID;

  if (isObject(raw.progress)) {
    for (const id of DIFFICULTY_ORDER) {
      const p = raw.progress[id];
      if (!isObject(p)) continue;
      if (typeof p.unlocked === 'number' && p.unlocked >= 1) out.progress[id].unlocked = Math.floor(p.unlocked);
      if (isObject(p.stars)) out.progress[id].stars = p.stars;
      if (isObject(p.best)) out.progress[id].best = p.best;
    }
  }
  if (isObject(raw.daily)) {
    const d = raw.daily;
    if (typeof d.streak === 'number' && d.streak >= 0) out.daily.streak = Math.floor(d.streak);
    if (typeof d.bestStreak === 'number' && d.bestStreak >= 0) out.daily.bestStreak = Math.floor(d.bestStreak);
    if (isDateKey(d.lastCompleted)) out.daily.lastCompleted = d.lastCompleted;
    if (isObject(d.results)) {
      for (const [key, r] of Object.entries(d.results)) {
        if (isDateKey(key) && isObject(r) && typeof r.stars === 'number' && typeof r.score === 'number') {
          out.daily.results[key] = { stars: r.stars, score: r.score };
        }
      }
    }
  }
  return out;
}

export async function loadPersisted(): Promise<PersistedState> {
  try {
    const text = await AsyncStorage.getItem(SAVE_KEY);
    return migrate(text ? JSON.parse(text) : null);
  } catch {
    return defaultPersisted();
  }
}

export async function writePersisted(state: PersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // A failed save should never crash the game. Progress just won't persist this time.
  }
}
