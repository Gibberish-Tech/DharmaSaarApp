/**
 * App Navigator - Bottom Tab Navigation
 */
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ShlokasScreen } from '../screens/ShlokasScreen';
import { ChatbotScreen } from '../screens/ChatbotScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';

export type RootTabParamList = {
  Home: undefined;
  Shlokas: undefined;
  Chatbot: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator: React.FC = () => {
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

// Helper component for tab icons (using emoji for now)
interface TabIconProps {
  icon: string;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, size }) => {
  return <Text style={{ fontSize: size || 24 }}>{icon}</Text>;
};

