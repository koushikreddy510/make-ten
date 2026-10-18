import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { adsReducer } from '@/features/ads/adsSlice';
import { sessionReducer } from '@/features/game/sessionSlice';
import { playerReducer } from '@/features/player/playerSlice';
import { progressReducer } from '@/features/progress/progressSlice';
import { settingsReducer } from '@/features/settings/settingsSlice';
import { createListeners, ListenerDeps } from './listeners';
import { PersistedState } from './persistence';

const rootReducer = combineReducers({
  player: playerReducer,
  settings: settingsReducer,
  progress: progressReducer,
  session: sessionReducer,
  ads: adsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Builds the store. Tests pass in fakes for saving and feedback, and a starting state. */
export function makeStore(deps: ListenerDeps, preloaded?: PersistedState) {
  const listeners = createListeners(deps);
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloaded && {
      player: preloaded.player,
      settings: preloaded.settings,
      progress: preloaded.progress,
    },
    middleware: (getDefault) => getDefault().prepend(listeners.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
