import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { sameCell } from '../rules';
import { Board, Cell } from '../types';
import { Tile } from './Tile';

interface Props {
  board: Board;
  selected: Cell[];
  /** Cells to point out, for hints and the tutorial. */
  highlighted?: Cell[] | null;
  onTap: (cell: Cell) => void;
}

const GAP = 4;
const MAX_TILE = 54;
const SCREEN_PADDING = 32;
const RIPPLE_MS = 12;

export function BoardView({ board, selected, highlighted, onTap }: Props) {
  const { width } = useWindowDimensions();
  const cols = board[0].length;
  const size = Math.min(MAX_TILE, Math.floor((width - SCREEN_PADDING - GAP * (cols - 1)) / cols));
  const includes = (cells: Cell[] | null | undefined, cell: Cell) => !!cells?.some((c) => sameCell(c, cell));

  return (
    <View style={{ gap: GAP, alignSelf: 'center' }}>
      {board.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: GAP }}>
          {row.map((value, c) => {
            const cell = { r, c };
            if (value === null) return <View key={c} style={{ width: size, height: size }} />;
            return (
              <Tile
                key={c}
                value={value}
                size={size}
                selected={includes(selected, cell)}
                highlighted={includes(highlighted, cell)}
                delay={(r + c) * RIPPLE_MS}
                onPress={() => onTap(cell)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
