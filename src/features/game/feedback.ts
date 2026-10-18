import * as Haptics from 'expo-haptics';
import { createFeedback } from '@/core/feedback/createFeedback';
import { Cue } from './cues';

export const gameFeedback = createFeedback<Cue>({
  tap: { sound: require('../../../assets/sounds/tap.wav'), haptic: () => Haptics.selectionAsync() },
  clear: { sound: require('../../../assets/sounds/clear.wav'), haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) },
  combo: { sound: require('../../../assets/sounds/combo.wav'), haptic: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) },
  error: { sound: require('../../../assets/sounds/error.wav'), haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning) },
  win: { sound: require('../../../assets/sounds/win.wav'), haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
  lose: { sound: require('../../../assets/sounds/lose.wav'), haptic: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error) },
});
