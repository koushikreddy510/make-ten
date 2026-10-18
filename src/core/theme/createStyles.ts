import { useMemo } from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';
import { Theme } from './tokens';

type Style = ViewStyle | TextStyle | ImageStyle;

/**
 * Styles that depend on the theme. Declare them once outside the component and call the
 * returned hook inside it:
 *
 *   const useStyles = createStyles((t) => ({ box: { backgroundColor: t.colors.surface } }));
 *   const styles = useStyles();
 */
export function createStyles<T extends Record<string, Style>>(factory: (theme: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    // StyleSheet.create returns its input; the cast only keeps our exact key names.
    return useMemo(() => StyleSheet.create(factory(theme) as never) as unknown as T, [theme]);
  };
}
