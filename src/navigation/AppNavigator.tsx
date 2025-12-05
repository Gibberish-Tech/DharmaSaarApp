/**
 * App Navigator - Handles authentication flow and main app navigation
 */
import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ShlokasScreen } from '../screens/ShlokasScreen';
import { ChatbotScreen } from '../screens/ChatbotScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { AuthWrapper } from '../components/AuthWrapper';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export type RootTabParamList = {
  Home: undefined;
  Shlokas: undefined;
  Chatbot: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

// Main Tab Navigator (shown when authenticated)
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF8C42', // Saffron Gold
        tabBarInactiveTintColor: '#9B8A7F', // Light brown
        tabBarStyle: {
          display: 'none', // Hide default tab bar, we'll use custom floating one
        },
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="🏠" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Shlokas"
        component={ShlokasScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="📜" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="💬" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="👤" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator (shown when not authenticated)
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// Loading screen
const LoadingScreen: React.FC = () => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  return (
    <View style={dynamicStyles.loadingContainer}>
      <Text style={dynamicStyles.loadingText}>🕉️</Text>
      <ActivityIndicator size="large" color={theme.primary} style={dynamicStyles.spinner} />
    </View>
  );
};

// Main App Navigator - switches between auth and main app
export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while initial auth state is being loaded
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Main app tabs - only shown when authenticated */}
      <AuthWrapper requireAuth={true}>
        <MainTabs />
      </AuthWrapper>

      {/* Auth screens - only shown when NOT authenticated */}
      <AuthWrapper requireAuth={false}>
        <AuthNavigator />
      </AuthWrapper>
    </>
  );
};

// Helper component for tab icons (using emoji for now)
interface TabIconProps {
  icon: string;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, size }) => {
  return <Text style={{ fontSize: size || 24 }}>{icon}</Text>;
};

// Loading screen styles
const createStyles = (theme: any) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      fontSize: 64,
      marginBottom: 24,
    },
    spinner: {
      marginTop: 16,
    },
  });

