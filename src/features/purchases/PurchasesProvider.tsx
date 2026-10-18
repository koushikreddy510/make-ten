import React, { createContext, useContext, useMemo, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, Text } from '@/core/ui';
import { createDevPurchaseService } from './devService';
import { PurchaseService } from './service';

const unavailable: PurchaseService = {
  priceOfRemoveAds: async () => null,
  buyRemoveAds: async () => 'failed',
  restore: async () => ({ removeAds: false }),
};

const PurchasesContext = createContext<PurchaseService>(unavailable);
export const usePurchases = (): PurchaseService => useContext(PurchasesContext);

/**
 * Provides the purchase service. Today it is the development stand-in, with a placeholder
 * confirmation dialog. Swap in a store-backed service here when the app has a development build.
 */
export function DevPurchasesProvider({ children }: { children: React.ReactNode }) {
  const [ask, setAsk] = useState<{ price: string; resolve: (ok: boolean) => void } | null>(null);

  const service = useMemo(
    () => createDevPurchaseService({ confirm: (price) => new Promise<boolean>((resolve) => setAsk({ price, resolve })) }),
    [],
  );
  const answer = (ok: boolean) => {
    ask?.resolve(ok);
    setAsk(null);
  };

  return (
    <PurchasesContext.Provider value={service}>
      {children}
      <Modal visible={ask !== null} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text variant="caption">DEVELOPMENT PURCHASE (PLACEHOLDER)</Text>
            <Text variant="title" style={styles.title}>Remove ads</Text>
            <Text variant="muted">A real store sheet will appear here. Price: {ask?.price}</Text>
            <Button label={`Buy for ${ask?.price ?? ''}`} variant="primary" onPress={() => answer(true)} />
            <Button label="Cancel" onPress={() => answer(false)} />
          </View>
        </View>
      </Modal>
    </PurchasesContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, backgroundColor: '#ffffff', borderRadius: 20, padding: 20, gap: 12 },
  title: { color: '#111111' },
});
