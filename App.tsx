/**
 * InShorts-style Knowledge App
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SwipeableCardStack } from './src/components/SwipeableCardStack';
import { mockKnowledgeData } from './src/data/mockKnowledge';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SwipeableCardStack data={mockKnowledgeData} />
    </SafeAreaProvider>
  );
}

export default App;
