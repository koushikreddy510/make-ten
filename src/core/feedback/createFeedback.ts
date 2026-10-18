import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export interface CueDefinition {
  /** A `require()`d sound file. */
  sound: number;
  /** Vibration to play with it. */
  haptic: () => Promise<void>;
}

export interface FeedbackSettings {
  sound: boolean;
  haptics: boolean;
}

/**
 * Sound and haptics for a set of named cues. Failures are swallowed, since feedback is a
 * nice-to-have and must never break the app.
 */
export function createFeedback<C extends string>(cues: Record<C, CueDefinition>) {
  const players: Partial<Record<C, AudioPlayer>> = {};
  let settings: FeedbackSettings = { sound: true, haptics: true };
  let audioReady = false;

  const playerFor = (cue: C): AudioPlayer | null => {
    try {
      if (!audioReady) {
        audioReady = true;
        setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
      }
      return (players[cue] ??= createAudioPlayer(cues[cue].sound));
    } catch {
      return null;
    }
  };

  return {
    configure(next: FeedbackSettings) {
      settings = next;
    },
    play(cue: C) {
      if (settings.sound) {
        try {
          const player = playerFor(cue);
          player?.seekTo(0);
          player?.play();
        } catch {
          // ignore
        }
      }
      if (settings.haptics) cues[cue].haptic().catch(() => {});
    },
  };
}
