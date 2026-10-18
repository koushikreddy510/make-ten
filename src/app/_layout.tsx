import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/core/theme';
import { DevAdsProvider } from '@/features/ads/AdsProvider';
import { DevPurchasesProvider } from '@/features/purchases/PurchasesProvider';
import { StoreProvider } from '@/store/StoreProvider';
import { useAppSelector } from '@/store/hooks';

function ThemedStack() {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
    </>
  );
}

function Providers() {
  const themeId = useAppSelector((s) => s.settings.themeId);
  return (
    <ThemeProvider themeId={themeId}>
      <DevAdsProvider>
        <DevPurchasesProvider>
          <ThemedStack />
        </DevPurchasesProvider>
      </DevAdsProvider>
    </ThemeProvider>
  );
}

/** Providers wrap the whole app. Each screen lives in its own file in this folder. */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Providers />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
