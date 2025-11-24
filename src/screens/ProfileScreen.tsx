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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    style={styles.profileItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.profileIcon}>{icon}</Text>
    <View style={styles.profileItemContent}>
      <Text style={styles.profileItemTitle}>{title}</Text>
      {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
    </View>
    {onPress && <Text style={styles.profileItemArrow}>›</Text>}
  </TouchableOpacity>
);

export const ProfileScreen: React.FC = () => {
  // Mock user data - replace with actual user data
  const user = {
    name: 'Seeker of Wisdom',
    email: 'seeker@example.com',
    joinedDate: 'January 2024',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>ॐ</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.profileJoined}>Member since {user.joinedDate}</Text>
        </View>

        {/* Profile Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon="👤"
              title="Edit Profile"
              subtitle="Update your personal information"
            />
            <ProfileItem
              icon="🔔"
              title="Notifications"
              subtitle="Manage notification preferences"
            />
            <ProfileItem
              icon="🔒"
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon="📊"
              title="Learning Stats"
              subtitle="View detailed statistics"
            />
            <ProfileItem
              icon="🏆"
              title="Achievements"
              subtitle="View all your achievements"
            />
            <ProfileItem
              icon="⭐"
              title="Favorites"
              subtitle="Your saved shlokas"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon="🌙"
              title="Appearance"
              subtitle="Light / Dark mode"
            />
            <ProfileItem
              icon="ℹ️"
              title="About"
              subtitle="App version and information"
            />
            <ProfileItem
              icon="📧"
              title="Support"
              subtitle="Get help and contact us"
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for floating tab bar (70px height + 16px margin + 14px extra)
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
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8B2E3D',
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
    color: '#2A1F1A',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B5B4F',
    marginBottom: 4,
  },
  profileJoined: {
    fontSize: 14,
    color: '#9B8A7F',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A1F1A',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B2E3D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E6D3',
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
    color: '#2A1F1A',
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#9B8A7F',
  },
  profileItemArrow: {
    fontSize: 24,
    color: '#9B8A7F',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#8B2E3D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B2E3D',
  },
});

