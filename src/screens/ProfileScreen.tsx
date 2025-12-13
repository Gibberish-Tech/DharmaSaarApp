/**
 * Profile Screen - User profile and settings
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { CONTENT_BOTTOM_PADDING } from '../constants/layout';

interface ProfileItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress,
  rightElement 
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createProfileItemStyles(theme);

  return (
    <TouchableOpacity
      style={dynamicStyles.profileItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
    >
      <Text style={dynamicStyles.profileIcon}>{icon}</Text>
      <View style={dynamicStyles.profileItemContent}>
        <Text style={dynamicStyles.profileItemTitle}>{title}</Text>
        {subtitle && <Text style={dynamicStyles.profileItemSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Text style={dynamicStyles.profileItemArrow}>›</Text>)}
    </TouchableOpacity>
  );
};

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export const ProfileScreen: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const dynamicStyles = createStyles(theme, insets);

  // Format joined date from user.created_at
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={dynamicStyles.profileHeader}>
          <View style={dynamicStyles.avatar}>
            <Text style={dynamicStyles.avatarText}>ॐ</Text>
          </View>
          <Text style={dynamicStyles.profileName}>{user?.name || 'User'}</Text>
          <Text style={dynamicStyles.profileEmail}>{user?.email || ''}</Text>
          <Text style={dynamicStyles.profileJoined}>Member since {joinedDate}</Text>
        </View>

        {/* Profile Sections */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Account</Text>
          <View style={dynamicStyles.sectionContent}>
            <ProfileItem
              icon="👤"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <View style={dynamicStyles.divider} />
            <ProfileItem
              icon="🔔"
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => navigation.navigate('Notifications')}
            />
            <View style={dynamicStyles.divider} />
            <ProfileItem
              icon="🔒"
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => navigation.navigate('PrivacySecurity')}
            />
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Learning</Text>
          <View style={dynamicStyles.sectionContent}>
            <ProfileItem
              icon="📊"
              title="Learning Stats"
              subtitle="View detailed statistics"
              onPress={() => navigation.navigate('LearningStats')}
            />
            <View style={dynamicStyles.divider} />
            <ProfileItem
              icon="🏆"
              title="Achievements"
              subtitle="View all your achievements"
              onPress={() => navigation.navigate('Achievements')}
            />
            <View style={dynamicStyles.divider} />
            <ProfileItem
              icon="⭐"
              title="Favorites"
              subtitle="Your saved shlokas"
              onPress={() => navigation.navigate('Favorites')}
            />
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>App</Text>
          <View style={dynamicStyles.sectionContent}>
            <ProfileItem
              icon={themeMode === 'dark' ? '🌙' : '☀️'}
              title="Appearance"
              subtitle={themeMode === 'dark' ? 'Dark mode' : 'Light mode'}
              rightElement={
                <Switch
                  value={themeMode === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={themeMode === 'dark' ? theme.cardBackground : theme.cardBackground}
                  ios_backgroundColor={theme.border}
                />
              }
            />
            <View style={dynamicStyles.divider} />
            <ProfileItem
              icon="ℹ️"
              title="About"
              subtitle="App version and information"
              onPress={() => {
                Alert.alert(
                  'About DharmaSaar',
                  'Version 0.0.1\n\nA modern app for learning and understanding Hindu scriptures and shlokas.',
                  [{ text: 'OK' }]
                );
              }}
            />
            <View style={dynamicStyles.divider} />
            <ProfileItem
              icon="📧"
              title="Support"
              subtitle="Get help and contact us"
              onPress={() => {
                Alert.alert(
                  'Support',
                  'For support, please contact us at support@dharmasaar.com',
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={dynamicStyles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Text style={dynamicStyles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for ProfileItem component (doesn't need insets)
const createProfileItemStyles = (theme: any) => StyleSheet.create({
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  profileIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: theme.textTertiary,
  },
  profileItemArrow: {
    fontSize: 24,
    color: theme.textTertiary,
    marginLeft: 8,
  },
});

// Styles for ProfileScreen component (needs insets for bottom padding)
const createStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Math.max(insets.bottom, 20) + CONTENT_BOTTOM_PADDING,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  profileJoined: {
    fontSize: 14,
    color: theme.textTertiary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 48,
  },
  logoutButton: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.secondary,
  },
});

