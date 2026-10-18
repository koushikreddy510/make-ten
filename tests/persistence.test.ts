import { describe, expect, it } from 'vitest';
import { defaultPersisted, migrate, SAVE_VERSION } from '@/store/persistence';

describe('saved data', () => {
  it('recovers from junk and fills defaults', () => {
    expect(migrate(null)).toEqual(defaultPersisted());
    expect(migrate('x')).toEqual(defaultPersisted());
    expect(migrate({ player: { coins: -5, difficulty: 'nope' }, settings: { themeId: 'nope' } })).toEqual(defaultPersisted());
  });
  it('keeps valid saved data', () => {
    const saved = defaultPersisted();
    saved.player = { difficulty: 'medium', tutorialSeen: true, coins: 120, adsRemoved: true };
    saved.settings = { sound: false, haptics: true, themeId: 'forest' };
    saved.progress.medium = { unlocked: 4, stars: { 1: 3, 2: 2, 3: 1 }, best: { 1: 300 } };
    expect(migrate(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
  });
  it('reads the older flat layout from versions 1 and 2', () => {
    const legacy = {
      version: 2, difficulty: 'hard', tutorialSeen: true, coins: 70,
      settings: { sound: false, haptics: false },
      progress: { hard: { unlocked: 5, stars: { 1: 2 }, best: { 1: 400 } } },
    };
    const migrated = migrate(legacy);
    expect(migrated.version).toBe(SAVE_VERSION);
    expect(migrated.player).toEqual({ difficulty: 'hard', tutorialSeen: true, coins: 70, adsRemoved: false });
    expect(migrated.settings).toEqual({ sound: false, haptics: false, themeId: 'dusk' });
    expect(migrated.progress.hard.unlocked).toBe(5);
    expect(migrated.progress.easy.unlocked).toBe(1);
  });
});
