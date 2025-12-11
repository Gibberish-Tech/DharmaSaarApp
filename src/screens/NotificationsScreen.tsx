/**
 * Notifications Screen - Manage notification preferences
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { CONTENT_BOTTOM_PADDING } from '../constants/layout';

interface NotificationSettingProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const NotificationSetting: React.FC<NotificationSettingProps> = ({
  icon,
  title,
  description,
  value,
  onValueChange,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createNotificationSettingStyles(theme);

  return (
    <View style={dynamicStyles.settingItem}>
      <Text style={dynamicStyles.settingIcon}>{icon}</Text>
      <View style={dynamicStyles.settingContent}>
        <Text style={dynamicStyles.settingTitle}>{title}</Text>
        <Text style={dynamicStyles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.border, true: theme.primary }}
        thumbColor={value ? theme.cardBackground : theme.cardBackground}
        ios_backgroundColor={theme.border}
      />
    </View>
  );
};

const NOTIFICATION_PREFS_KEY = '@sanatan_app_notification_prefs';

interface NotificationPreferences {
  pushNotifications: boolean;
  dailyReminders: boolean;
  streakReminders: boolean;
  achievementAlerts: boolean;
  newContentAlerts: boolean;
  weeklyDigest: boolean;
  emailNotifications: boolean;
}

const defaultPreferences: NotificationPreferences = {
  pushNotifications: true,
  dailyReminders: true,
  streakReminders: true,
  achievementAlerts: true,
  newContentAlerts: false,
  weeklyDigest: true,
  emailNotifications: false,
};

export const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dynamicStyles = createStyles(theme, insets);

  // Notification preferences state
  const [pushNotifications, setPushNotifications] = useState(defaultPreferences.pushNotifications);
  const [dailyReminders, setDailyReminders] = useState(defaultPreferences.dailyReminders);
  const [streakReminders, setStreakReminders] = useState(defaultPreferences.streakReminders);
  const [achievementAlerts, setAchievementAlerts] = useState(defaultPreferences.achievementAlerts);
  const [newContentAlerts, setNewContentAlerts] = useState(defaultPreferences.newContentAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(defaultPreferences.weeklyDigest);
  const [emailNotifications, setEmailNotifications] = useState(defaultPreferences.emailNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
        if (stored) {
          const prefs: NotificationPreferences = JSON.parse(stored);
          setPushNotifications(prefs.pushNotifications ?? defaultPreferences.pushNotifications);
          setDailyReminders(prefs.dailyReminders ?? defaultPreferences.dailyReminders);
          setStreakReminders(prefs.streakReminders ?? defaultPreferences.streakReminders);
          setAchievementAlerts(prefs.achievementAlerts ?? defaultPreferences.achievementAlerts);
          setNewContentAlerts(prefs.newContentAlerts ?? defaultPreferences.newContentAlerts);
          setWeeklyDigest(prefs.weeklyDigest ?? defaultPreferences.weeklyDigest);
          setEmailNotifications(prefs.emailNotifications ?? defaultPreferences.emailNotifications);
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Auto-save preferences when they change
  useEffect(() => {
    if (!isLoading) {
      const savePreferences = async () => {
        try {
          const prefs: NotificationPreferences = {
            pushNotifications,
            dailyReminders,
            streakReminders,
            achievementAlerts,
            newContentAlerts,
            weeklyDigest,
            emailNotifications,
          };
          await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
        } catch (error) {
          console.error('Error saving notification preferences:', error);
        }
      };

      savePreferences();
    }
  }, [
    pushNotifications,
    dailyReminders,
    streakReminders,
    achievementAlerts,
    newContentAlerts,
    weeklyDigest,
    emailNotifications,
    isLoading,
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const prefs: NotificationPreferences = {
        pushNotifications,
        dailyReminders,
        streakReminders,
        achievementAlerts,
        newContentAlerts,
        weeklyDigest,
        emailNotifications,
      };
      await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
      Alert.alert('Success', 'Notification preferences saved successfully');
    } catch {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={dynamicStyles.headerSection}>
          <Text style={dynamicStyles.headerTitle}>Notification Preferences</Text>
          <Text style={dynamicStyles.headerDescription}>
            Choose how you want to be notified about your learning progress and app updates.
          </Text>
        </View>

        {/* Push Notifications Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Push Notifications</Text>
          <View style={dynamicStyles.sectionContent}>
            <NotificationSetting
              icon="📱"
              title="Enable Push Notifications"
              description="Receive notifications on your device"
              value={pushNotifications}
              onValueChange={setPushNotifications}
            />
            <View style={dynamicStyles.divider} />
            <NotificationSetting
              icon="⏰"
              title="Daily Reminders"
              description="Get reminded to read shlokas daily"
              value={dailyReminders}
              onValueChange={setDailyReminders}
            />
            <View style={dynamicStyles.divider} />
            <NotificationSetting
              icon="🔥"
              title="Streak Reminders"
              description="Notifications to maintain your reading streak"
              value={streakReminders}
              onValueChange={setStreakReminders}
            />
            <View style={dynamicStyles.divider} />
            <NotificationSetting
              icon="🏆"
              title="Achievement Alerts"
              description="Get notified when you unlock achievements"
              value={achievementAlerts}
              onValueChange={setAchievementAlerts}
            />
            <View style={dynamicStyles.divider} />
            <NotificationSetting
              icon="📚"
              title="New Content Alerts"
              description="Notifications about new shlokas and features"
              value={newContentAlerts}
              onValueChange={setNewContentAlerts}
            />
          </View>
        </View>

        {/* Email Notifications Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Email Notifications</Text>
          <View style={dynamicStyles.sectionContent}>
            <NotificationSetting
              icon="📧"
              title="Email Notifications"
              description="Receive updates via email"
              value={emailNotifications}
              onValueChange={setEmailNotifications}
            />
            <View style={dynamicStyles.divider} />
            <NotificationSetting
              icon="📊"
              title="Weekly Digest"
              description="Weekly summary of your learning progress"
              value={weeklyDigest}
              onValueChange={setWeeklyDigest}
            />
          </View>
        </View>


        {/* Info Box */}
        <View style={dynamicStyles.infoBox}>
          <Text style={dynamicStyles.infoIcon}>💡</Text>
          <Text style={dynamicStyles.infoText}>
            Your notification preferences are saved automatically when you change them. You can also manually save using the button below.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[dynamicStyles.saveButton, isSaving && dynamicStyles.saveButtonDisabled]}
          activeOpacity={0.7}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={dynamicStyles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for NotificationSetting component (doesn't need insets)
const createNotificationSettingStyles = (theme: any) => StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.textTertiary,
    lineHeight: 18,
  },
});

// Styles for NotificationsScreen component (needs insets for bottom padding)
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
  headerSection: {
    marginBottom: 32,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: theme.textSecondary,
    lineHeight: 22,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

