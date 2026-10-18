import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { gameFeedback } from '@/features/game/feedback';
import { AppStore, makeStore } from './index';
import { loadPersisted, writePersisted } from './persistence';

/** Loads the saved game, then builds the store. Renders nothing for the moment that takes. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore | null>(null);

  useEffect(() => {
    loadPersisted().then((saved) => {
      gameFeedback.configure(saved.settings);
      setStore(makeStore({ save: writePersisted, playCue: gameFeedback.play, configureFeedback: gameFeedback.configure }, saved));
    });
  }, []);

  return store ? <Provider store={store}>{children}</Provider> : null;
}
