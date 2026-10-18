import React from 'react';
import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import { createStyles, fontSize, radius } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'regular' | 'big';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const useStyles = createStyles((t) => ({
  base: { height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, borderBottomWidth: 4 },
  primary: { backgroundColor: t.colors.primary, borderBottomColor: t.colors.primaryDeep },
  secondary: { backgroundColor: t.colors.surface, borderBottomColor: t.colors.surfaceDeep },
  big: { height: 56 },
  pressed: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  disabled: { opacity: 0.4 },
  label: { color: t.colors.text, fontSize: fontSize.button, fontWeight: '700' },
  labelPrimary: { color: t.colors.onPrimary },
  labelBig: { fontSize: 20 },
}));

export function Button({ label, onPress, variant = 'secondary', size = 'regular', disabled, style }: Props) {
  const styles = useStyles();
  const primary = variant === 'primary';
  const big = size === 'big';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        big && styles.big,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, primary && styles.labelPrimary, big && styles.labelBig]}>{label}</Text>
    </Pressable>
  );
}
