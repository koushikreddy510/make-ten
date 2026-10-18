import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, spacing } from '../theme';

const useStyles = createStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.background, paddingHorizontal: spacing.lg },
}));

/** Full-screen container with the theme background and safe-area padding. */
export function Screen({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return <View style={[styles.root, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>{children}</View>;
}
