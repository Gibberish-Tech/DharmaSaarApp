/**
 * Shlokas Screen - Swipeable card stack for learning shlokas
 */
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeableCardStack } from '../components/SwipeableCardStack';
import { useShlokas } from '../hooks/useShlokas';

export const ShlokasScreen: React.FC = () => {
  const { shlokas, loading, error, fetchNextShloka, refresh } = useShlokas(5);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <SwipeableCardStack
        data={shlokas}
        loading={loading}
        error={error}
        onFetchNext={fetchNextShloka}
        onRefresh={refresh}
      />
    </SafeAreaView>
  );
};

