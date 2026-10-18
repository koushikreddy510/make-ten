import React from 'react';
import { View } from 'react-native';
import { createStyles, radius } from '@/core/theme';
import { Text } from '@/core/ui';

const useStyles = createStyles((t) => ({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, backgroundColor: t.colors.background, borderRadius: radius.lg, borderWidth: 2, borderColor: t.colors.border, padding: 22, gap: 12 },
  title: { textAlign: 'center', fontSize: 24 },
}));

/** A card over a dimmed screen, for pause, win and lose. */
export function Overlay({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text variant="title" style={styles.title}>{title}</Text>
        {children}
      </View>
    </View>
  );
}
