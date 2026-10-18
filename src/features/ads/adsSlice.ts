import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** What the app remembers about ads shown this run. Not saved between launches. */
export interface AdsState {
  levelsSinceInterstitial: number;
  lastInterstitialAt: number | null;
}

const adsSlice = createSlice({
  name: 'ads',
  initialState: { levelsSinceInterstitial: 0, lastInterstitialAt: null } as AdsState,
  reducers: {
    levelFinished(state) {
      state.levelsSinceInterstitial += 1;
    },
    interstitialShown(state, action: PayloadAction<number>) {
      state.levelsSinceInterstitial = 0;
      state.lastInterstitialAt = action.payload;
    },
  },
});

export const { levelFinished, interstitialShown } = adsSlice.actions;
export const adsReducer = adsSlice.reducer;
