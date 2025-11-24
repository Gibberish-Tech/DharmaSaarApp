/**
 * Sanatan App - Hindu Mythology Knowledge
 * @format
 */

import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor="#FFF8F0"
          translucent={false}
        />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
