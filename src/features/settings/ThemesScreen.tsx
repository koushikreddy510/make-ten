import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { createStyles, radius, THEME_IDS, THEMES, Theme } from '@/core/theme';
import { Button, Screen, Text } from '@/core/ui';
import { themeSet } from '@/features/settings/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const useStyles = createStyles((t) => ({
  list: { gap: 12, paddingVertical: 16 },
  card: { borderRadius: 18, padding: 14, borderWidth: 2, borderColor: 'transparent', gap: 10 },
  active: { borderColor: t.colors.primary },
  head: { flexDirection: 'row', justifyContent: 'space-between' },
  tiles: { flexDirection: 'row', gap: 6 },
  tile: { width: 28, height: 28, borderRadius: 8 },
  scroll: { flex: 1 },
}));

/** Each card is drawn in its own theme's colors, so the player sees what they will get. */
function ThemeCard({ theme, active, onPress }: { theme: Theme; active: boolean; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${theme.name} theme`}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.background }, active && styles.active, !active && { borderColor: theme.colors.border }]}
    >
      <View style={styles.head}>
        <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 18 }}>{theme.name}</Text>
        <View style={{ backgroundColor: theme.colors.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Text style={{ color: theme.colors.onPrimary, fontWeight: '700', fontSize: 12 }}>{active ? 'In use' : 'Play'}</Text>
        </View>
      </View>
      <View style={styles.tiles}>
        {theme.tiles.map((color, i) => (
          <View key={i} style={[styles.tile, { backgroundColor: color, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: theme.tileInk, fontWeight: '800', fontSize: 13 }}>{i + 1}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export function ThemesScreen() {
  const styles = useStyles();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.settings.themeId);

  return (
    <Screen>
      <Text variant="title">Theme</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
        {THEME_IDS.map((id) => (
          <ThemeCard key={id} theme={THEMES[id]} active={id === current} onPress={() => dispatch(themeSet(id))} />
        ))}
      </ScrollView>
      <Button label="Back" variant="primary" onPress={() => router.back()} />
    </Screen>
  );
}
