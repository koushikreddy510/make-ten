/** Identifiers of what can be bought. They must match the products set up in App Store Connect and Play Console. */
export const PRODUCTS = {
  removeAds: 'maketen.removeads',
} as const;

export type BuyResult = 'purchased' | 'cancelled' | 'failed';

/** What the game needs from an app store. A store-backed service implements the same interface. */
export interface PurchaseService {
  /** The price to show, in the player's currency, or null if the store could not be reached. */
  priceOfRemoveAds(): Promise<string | null>;
  buyRemoveAds(): Promise<BuyResult>;
  /** Asks the store what this player already owns. Required by store rules, for new phones and reinstalls. */
  restore(): Promise<{ removeAds: boolean }>;
}
