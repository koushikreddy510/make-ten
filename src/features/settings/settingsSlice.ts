import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_THEME_ID } from '@/core/theme/themes';
import type { ThemeId } from '@/core/theme/tokens';

export interface SettingsState {
  sound: boolean;
  haptics: boolean;
  themeId: ThemeId;
}

export const initialSettingsState: SettingsState = { sound: true, haptics: true, themeId: DEFAULT_THEME_ID };

const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettingsState,
  reducers: {
    soundSet(state, action: PayloadAction<boolean>) {
      state.sound = action.payload;
    },
    hapticsSet(state, action: PayloadAction<boolean>) {
      state.haptics = action.payload;
    },
    themeSet(state, action: PayloadAction<ThemeId>) {
      state.themeId = action.payload;
    },
  },
});

export const { soundSet, hapticsSet, themeSet } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
