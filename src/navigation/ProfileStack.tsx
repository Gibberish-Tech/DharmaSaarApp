/**
 * Profile Stack Navigator - Handles navigation for profile-related screens
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { PrivacySecurityScreen } from '../screens/PrivacySecurityScreen';
import { LearningStatsScreen } from '../screens/LearningStatsScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ShlokaDetailScreen } from '../screens/ShlokaDetailScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  PrivacySecurity: undefined;
  LearningStats: undefined;
  Achievements: undefined;
  Favorites: undefined;
  ShlokaDetail: { shlokaId: string };
};

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
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
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{
          title: 'Privacy & Security',
        }}
      />
      <Stack.Screen
        name="LearningStats"
        component={LearningStatsScreen}
        options={{
          title: 'Learning Stats',
        }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          title: 'Achievements',
        }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
        }}
      />
      <Stack.Screen
        name="ShlokaDetail"
        component={ShlokaDetailScreen}
        options={{
          title: 'Shloka Details',
        }}
      />
    </Stack.Navigator>
  );
};

