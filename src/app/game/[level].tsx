import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { GameScreen } from '@/features/game/screens/GameScreen';

export default function GameRoute() {
  const { level } = useLocalSearchParams<{ level: string }>();
  return <GameScreen level={Number(level) || 1} />;
}
