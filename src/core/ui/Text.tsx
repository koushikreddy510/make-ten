import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { createStyles, fontSize } from '../theme';

type Variant = 'title' | 'body' | 'muted' | 'small' | 'caption';

const useStyles = createStyles((t) => ({
  title: { color: t.colors.text, fontSize: fontSize.title, fontWeight: '800' },
  body: { color: t.colors.text, fontSize: fontSize.body },
  muted: { color: t.colors.textMuted, fontSize: fontSize.body, lineHeight: 21 },
  small: { color: t.colors.textMuted, fontSize: 12, lineHeight: 16 },
  caption: { color: t.colors.textMuted, fontSize: fontSize.caption, fontWeight: '700', letterSpacing: 1 },
}));

/** Themed text. Pick a `variant` instead of setting colors and sizes by hand. */
export function Text({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  const styles = useStyles();
  return <RNText style={[styles[variant], style]} {...rest} />;
}
