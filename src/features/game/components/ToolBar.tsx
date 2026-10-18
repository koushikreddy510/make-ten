import React from 'react';
import { Pressable, View } from 'react-native';
import { createStyles, radius } from '@/core/theme';
import { Text } from '@/core/ui';

interface ToolProps { label: string; count: number; disabled?: boolean; onPress: () => void }

const useStyles = createStyles((t) => ({
  bar: { flexDirection: 'row', gap: 10 },
  tool: { flex: 1, height: 56, borderRadius: radius.md, backgroundColor: t.colors.surface, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.4 },
  label: { fontWeight: '700', fontSize: 14 },
  count: { color: t.colors.accent, fontWeight: '800', fontSize: 12 },
}));

function Tool({ label, count, disabled, onPress }: ToolProps) {
  const styles = useStyles();
  const off = disabled || count <= 0;
  return (
    <Pressable style={[styles.tool, off && styles.off]} onPress={onPress} disabled={off} accessibilityRole="button">
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.count}>{count}</Text>
    </Pressable>
  );
}

interface Props {
  undos: number;
  hints: number;
  shuffles: number;
  canUndo: boolean;
  onUndo: () => void;
  onHint: () => void;
  onShuffle: () => void;
}

export function ToolBar({ undos, hints, shuffles, canUndo, onUndo, onHint, onShuffle }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.bar}>
      <Tool label="Undo" count={undos} disabled={!canUndo} onPress={onUndo} />
      <Tool label="Hint" count={hints} onPress={onHint} />
      <Tool label="Shuffle" count={shuffles} onPress={onShuffle} />
    </View>
  );
}
