import AsyncStorage from '@react-native-async-storage/async-storage';
import { BuyResult, PurchaseService } from './service';

export const DEV_PURCHASES_KEY = 'maketen.dev.purchases';
const DEV_PRICE = '$2.99';

interface Options {
  /** Asks the player to confirm. In the app this is a placeholder dialog. */
  confirm: (price: string) => Promise<boolean>;
}

/**
 * Stand-in for the app store while developing. Like a real store, it remembers what was bought
 * even when the game's own progress is erased, so Restore purchases can be tried out.
 */
export function createDevPurchaseService({ confirm }: Options): PurchaseService {
  const owned = async (): Promise<boolean> => {
    try {
      return (await AsyncStorage.getItem(DEV_PURCHASES_KEY)) === 'removeAds';
    } catch {
      return false;
    }
  };
  return {
    priceOfRemoveAds: async () => DEV_PRICE,
    async buyRemoveAds(): Promise<BuyResult> {
      if (!(await confirm(DEV_PRICE))) return 'cancelled';
      try {
        await AsyncStorage.setItem(DEV_PURCHASES_KEY, 'removeAds');
        return 'purchased';
      } catch {
        return 'failed';
      }
    },
    restore: async () => ({ removeAds: await owned() }),
  };
}
