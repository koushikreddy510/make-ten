import { Redirect } from 'expo-router';
import React from 'react';
import { HomeScreen } from '@/features/home/HomeScreen';
import { useAppSelector } from '@/store/hooks';
import { selectNeedsOnboarding } from '@/store/selectors';

/** New players are sent through onboarding first. Everyone else lands on the home screen. */
export default function Index() {
  const needsOnboarding = useAppSelector(selectNeedsOnboarding);
  if (needsOnboarding) return <Redirect href={{ pathname: '/difficulty', params: { first: '1' } }} />;
  return <HomeScreen />;
}
