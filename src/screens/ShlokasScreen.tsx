/**
 * Shlokas Screen - Swipeable card stack for learning shlokas
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SwipeableCardStack } from '../components/SwipeableCardStack';
import { useShlokas } from '../hooks/useShlokas';
import { useTheme } from '../context/ThemeContext';

export const ShlokasScreen: React.FC = () => {
  const { shlokas, loading, error, fetchNextShloka, refresh } = useShlokas(5);
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={[]}>
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

