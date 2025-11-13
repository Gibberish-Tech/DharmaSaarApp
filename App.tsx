/**
 * Sanatan App - Hindu Mythology Knowledge
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SwipeableCardStack } from './src/components/SwipeableCardStack';
import { useShlokas } from './src/hooks/useShlokas';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { shlokas, loading, error, fetchNextShloka, refresh } = useShlokas(5);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SwipeableCardStack
        data={shlokas}
        loading={loading}
        error={error}
        onFetchNext={fetchNextShloka}
        onRefresh={refresh}
      />
    </SafeAreaProvider>
  );
}

export default App;
