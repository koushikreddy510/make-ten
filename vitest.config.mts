import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  oxc: { tsconfig: false } as never,
  resolve: {
    alias: {
      '@': path('./src'),
      '@react-native-async-storage/async-storage': path('./tests/mocks/async-storage.ts'),
      'expo-haptics': path('./tests/mocks/expo-haptics.ts'),
      'expo-audio': path('./tests/mocks/expo-audio.ts'),
    },
  },
  test: { include: ['tests/**/*.test.ts'] },
});
