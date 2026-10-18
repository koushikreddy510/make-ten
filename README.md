# Make Ten

A number puzzle game built with Expo (React Native) and TypeScript. Select tiles that add up to 10 to clear them, chain clears for combos, and reach each level's target score before the moves or the clock run out.

## Run it

```bash
npm install
npx expo start        # then press i (iOS simulator), a (Android emulator) or scan the QR code with Expo Go
```

## Checks

```bash
npm run check         # typecheck + lint + tests
npm test              # tests only (fast, no simulator needed)
```

## How the code is organised

```
src/
  app/            Routes only (Expo Router). One short file per screen, no logic.
  core/           Reusable across apps. Knows nothing about this game.
    theme/        Tokens, 5 themes, ThemeProvider, createStyles
    ui/           Button, Text, Screen
    feedback/     Sound + haptics factory
  features/
    game/         Rules and engine (plain TypeScript, no React), game screen and components
    player/       Redux slice: difficulty, tutorial seen, coins, ads removed
    progress/     Redux slice: unlocked level, stars and best score per difficulty
    settings/     Redux slice: sound, haptics, theme. Settings and theme screens
    ads/          Ad policy (when ads show), ad service interface, dev placeholder
    home/ levels/ onboarding/ tutorial/   Screens
  store/          Redux store, saving to the device, side effects (listeners)
tests/            Unit tests for the engine, store, saved data, themes, ads
```

### Layers, and which may import which

1. **Engine** (`features/game/*.ts` except components, screens, slices): pure functions. State in, new state out. No React, no Redux, no device APIs. This is what makes it easy to test.
2. **Store** (`src/store`, `*Slice.ts`): holds the state and calls the engine. It never imports a React component. Saving, win recording and sound all happen in `store/listeners.ts`.
3. **Screens and components**: read state with `useAppSelector`, change it with `dispatch`. They hold no game rules.

### Rules of thumb

- A new rule or mechanic: change the engine, add a test, then show it in the UI.
- Something the player should keep between launches: add it to a slice, then to `store/persistence.ts` (and bump `SAVE_VERSION` if the shape changes).
- A new color: add the token to `ThemeColors` and to every theme. The `themes` test fails if one is missed.
- Styles that depend on the theme use `createStyles((theme) => ({...}))`. Do not hard-code colors.
- Numbers that tune the game live in `features/game/difficulty.ts` and `features/ads/policy.ts`, not inside logic.

## Difficulty and levels

Each difficulty (`difficulty.ts`) sets the board size, how tiles may be linked, and how each value changes from level 1 to level 30. `levels.ts` turns "difficulty + level number" into concrete settings.

| | Easy | Medium | Hard |
|---|---|---|---|
| Linking | Any tiles | Straight line, nothing between | Side by side only |
| Board | 5×6 | 6×7 | 7×8 |
| Moves (level 1 → 30) | 20 → 15 | 22 → 16 | 24 → 17 |
| Clock | none | none | 90s → 70s |
| Tiles in no group | 5% → 30% | 10% → 35% | 15% → 40% |

Boards are generated from a seed made of the difficulty and level number, so a level is identical every time. The tests play every level with a simple bot to make sure each one can be won.

## What a returning player sees

Progress (unlocked level, stars, best score, coins, difficulty, theme, settings) is saved on the device after every change. On the next launch:

- Home shows **Continue · Level N**, the highest level they unlocked on their difficulty.
- They land on Home, not onboarding. The tutorial is shown once.
- Changing difficulty never loses progress. Each difficulty keeps its own.
- A level in progress is not saved. Levels are short, so leaving one means starting it again.

Clearing the app's storage or uninstalling it erases progress. Cloud backup (Game Center, Play Games, or an account) is a later step, and the saved shape is already a small plain object for that.

## Ads

Ads sit behind an interface (`features/ads/AdsProvider.tsx`) so the game never talks to an ad network directly.

- **Today:** `DevAdsProvider` shows a placeholder full-screen ad with a countdown.
- **Rules** are in `ads/policy.ts` and are tested: no interstitials before level 4, one after every 3 finished levels, never twice within 2 minutes, never for players who removed ads.
- **Rewarded ads** are always optional: +5 moves or +20 seconds after losing (once per level), double coins after winning.
- **Going live:** install `react-native-google-mobile-ads`, which needs a development build (it does not run in Expo Go). Write an `AdService` that calls it, swap it in for `DevAdsProvider` in `src/app/_layout.tsx`, use Google's test ad IDs until release, and add the consent form (UMP) for the EU and UK and the tracking prompt for iOS.

## AI

The game does not call an AI model while you play. A server-side model would add cost, delay and privacy questions for little gain here. Where AI helps is around the game: generating store text and screenshots, designing sound and art, and reviewing the level curve. The greedy bot in `tests/helpers.ts` is the real tool for checking that levels are fair.
