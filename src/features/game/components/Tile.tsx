import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';
import { createStyles, tileColor, useTheme } from '@/core/theme';
import { Text } from '@/core/ui';

interface Props {
  value: number;
  size: number;
  selected: boolean;
  highlighted: boolean;
  /** Delay before the pop-in animation, so a board appears as a ripple. */
  delay: number;
  onPress: () => void;
}

const useStyles = createStyles((t) => ({
  tile: { borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.2)' },
  digit: { color: t.tileInk, fontWeight: '800' },
  // Dark ink always contrasts with the tile, and the glow keeps the ring visible on the background.
  selected: { borderWidth: 3, borderColor: t.tileInk, shadowColor: t.colors.accent, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  highlighted: { borderWidth: 3, borderColor: t.colors.accent },
}));

/** One tile. It pops in when it appears or changes, and springs up while selected. */
export function Tile({ value, size, selected, highlighted, delay, onPress }: Props) {
  const theme = useTheme();
  const styles = useStyles();
  const [pop] = useState(() => new Animated.Value(0.5));
  const [lift] = useState(() => new Animated.Value(1));
  const shown = useRef<number | null>(null);

  useEffect(() => {
    if (shown.current === value) return;
    shown.current = value;
    pop.setValue(0.5);
    Animated.spring(pop, { toValue: 1, delay, friction: 5, tension: 160, useNativeDriver: true }).start();
  }, [value, delay, pop]);

  useEffect(() => {
    Animated.spring(lift, { toValue: selected ? 1.1 : 1, friction: 6, tension: 220, useNativeDriver: true }).start();
  }, [selected, lift]);

  const opacity = pop.interpolate({ inputRange: [0.5, 1], outputRange: [0.2, 1], extrapolate: 'clamp' });
  return (
    <Animated.View style={{ opacity, transform: [{ scale: Animated.multiply(pop, lift) }] }}>
      <Pressable
        accessibilityLabel={`Tile ${value}`}
        onPress={onPress}
        style={[
          styles.tile,
          { width: size, height: size, backgroundColor: tileColor(theme, value) },
          selected && styles.selected,
          highlighted && !selected && styles.highlighted,
        ]}
      >
        <Text style={[styles.digit, { fontSize: size * 0.42 }]}>{value}</Text>
      </Pressable>
    </Animated.View>
  );
}
