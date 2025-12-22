/**
 * App Navigator - Handles authentication flow and main app navigation
 */
import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ShlokasScreen } from '../screens/ShlokasScreen';
import { ChatbotScreen } from '../screens/ChatbotScreen';
import { ProfileStack } from './ProfileStack';
import { ShlokaDetailScreen } from '../screens/ShlokaDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AuthWrapper } from '../components/AuthWrapper';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { hasCompletedOnboarding } from '../utils/onboardingStorage';

export type RootTabParamList = {
  Home: undefined;
  Shlokas: undefined;
  Chatbot: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ShlokaDetail: { shlokaId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

// Helper component for tab icons (using emoji for now)
interface TabIconProps {
  icon: string;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, size }) => {
  return <Text style={{ fontSize: size || 24 }}>{icon}</Text>;
};

// Individual tab icon components to avoid nested component warnings
const HomeIcon = ({ color, size }: { focused: boolean; color: string; size: number }) => (
  <TabIcon icon="🏠" color={color} size={size} />
);

const ShlokasIcon = ({ color, size }: { focused: boolean; color: string; size: number }) => (
  <TabIcon icon="📜" color={color} size={size} />
);

const ChatbotIcon = ({ color, size }: { focused: boolean; color: string; size: number }) => (
  <TabIcon icon="💬" color={color} size={size} />
);

const ProfileIcon = ({ color, size }: { focused: boolean; color: string; size: number }) => (
  <TabIcon icon="👤" color={color} size={size} />
);

// Wrapper component for FloatingTabBar to avoid nested component warning
const FloatingTabBarWrapper = (props: BottomTabBarProps) => (
  <FloatingTabBar {...props} />
);

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
      tabBar={FloatingTabBarWrapper}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Shlokas"
        component={ShlokasScreen}
        options={{
          tabBarIcon: ShlokasIcon,
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarIcon: ChatbotIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ProfileIcon,
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

// Root Stack Navigator - wraps tabs and includes ShlokaDetail
const RootStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card',
      }}
    >
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen
        name="ShlokaDetail"
        component={ShlokaDetailScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          },
          headerTitleStyle: {
            fontWeight: '600',
            color: theme.text,
            fontSize: 18,
          },
          headerTintColor: theme.primary,
          title: 'Shloka Details',
        }}
      />
    </RootStack.Navigator>
  );
};

// Main App Navigator - switches between auth and main app
export const AppNavigator: React.FC = () => {
  const { isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await hasCompletedOnboarding();
        setShowOnboarding(!completed);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to showing onboarding if there's an error
        setShowOnboarding(true);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show loading screen while initial auth state is being loaded or checking onboarding
  if (isLoading || isCheckingOnboarding) {
    return <LoadingScreen />;
  }

  // Show onboarding if not completed (regardless of auth state)
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // After onboarding, show auth or main app based on authentication state
  return (
    <>
      {/* Main app with root stack - only shown when authenticated */}
      <AuthWrapper requireAuth={true}>
        <RootStackNavigator />
      </AuthWrapper>

      {/* Auth screens - only shown when NOT authenticated */}
      <AuthWrapper requireAuth={false}>
        <AuthNavigator />
      </AuthWrapper>
    </>
  );
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

