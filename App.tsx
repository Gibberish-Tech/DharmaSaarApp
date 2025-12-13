/**
 * DharmaSaar - Hindu Mythology Knowledge
 * @format
 */

import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

// Suppress InteractionManager deprecation warning from dependencies
// This warning comes from react-native-reanimated/react-native-worklets
// and will be fixed in future library updates
LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
]);

function AppContent() {
  const { theme, themeMode } = useTheme();

  return (
    <>
      <StatusBar 
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
        translucent={false}
      />
      <AppNavigator />
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
