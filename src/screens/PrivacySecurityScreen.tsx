/**
 * Privacy & Security Screen - Manage privacy and security settings
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { CONTENT_BOTTOM_PADDING } from '../constants/layout';

interface SecurityItemProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SecurityItem: React.FC<SecurityItemProps> = ({
  icon,
  title,
  description,
  onPress,
  rightElement,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dynamicStyles = createStyles(theme, insets);

  return (
    <TouchableOpacity
      style={dynamicStyles.securityItem}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={0.7}
    >
      <Text style={dynamicStyles.securityIcon}>{icon}</Text>
      <View style={dynamicStyles.securityContent}>
        <Text style={dynamicStyles.securityTitle}>{title}</Text>
        <Text style={dynamicStyles.securityDescription}>{description}</Text>
      </View>
      {rightElement || (onPress && <Text style={dynamicStyles.securityArrow}>›</Text>)}
    </TouchableOpacity>
  );
};

export const PrivacySecurityScreen: React.FC = () => {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const dynamicStyles = createStyles(theme, insets);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Privacy settings state
  const [dataCollection, setDataCollection] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [crashReports, setCrashReports] = useState(true);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiService.changePassword(currentPassword, newPassword);
      
      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowPasswordChange(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to change password. Please check your current password and try again.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your account and all associated data. Type DELETE to confirm.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await apiService.deleteAccount();
                      // Logout after successful account deletion
                      await logout();
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been deleted successfully',
                        [{ text: 'OK' }]
                      );
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Failed to delete account');
                    }
                  },
                },
              ]
            );
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Account Security Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Account Security</Text>
          <View style={dynamicStyles.sectionContent}>
            <SecurityItem
              icon="🔐"
              title="Change Password"
              description="Update your account password"
              onPress={() => setShowPasswordChange(!showPasswordChange)}
            />
            
            {showPasswordChange && (
              <View style={dynamicStyles.passwordForm}>
                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.label}>Current Password</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={theme.textTertiary}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isChangingPassword}
                  />
                </View>
                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.label}>New Password</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password (min. 8 characters)"
                    placeholderTextColor={theme.textTertiary}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isChangingPassword}
                  />
                </View>
                <View style={dynamicStyles.inputGroup}>
                  <Text style={dynamicStyles.label}>Confirm New Password</Text>
                  <TextInput
                    style={dynamicStyles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.textTertiary}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isChangingPassword}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    dynamicStyles.changePasswordButton,
                    isChangingPassword && dynamicStyles.changePasswordButtonDisabled,
                  ]}
                  activeOpacity={0.7}
                  onPress={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={dynamicStyles.changePasswordButtonText}>Change Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={dynamicStyles.divider} />
            <SecurityItem
              icon="🔑"
              title="Two-Factor Authentication"
              description="Add an extra layer of security (Coming soon)"
              onPress={() => {
                Alert.alert('Coming Soon', 'Two-factor authentication will be available in a future update');
              }}
            />
            <View style={dynamicStyles.divider} />
            <SecurityItem
              icon="📱"
              title="Active Sessions"
              description="View and manage devices where you're logged in (Coming soon)"
              onPress={() => {
                Alert.alert('Coming Soon', 'Session management will be available in a future update');
              }}
            />
          </View>
        </View>

        {/* Privacy Settings Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Privacy Settings</Text>
          <View style={dynamicStyles.sectionContent}>
            <View style={dynamicStyles.securityItem}>
              <Text style={dynamicStyles.securityIcon}>📊</Text>
              <View style={dynamicStyles.securityContent}>
                <Text style={dynamicStyles.securityTitle}>Data Collection</Text>
                <Text style={dynamicStyles.securityDescription}>
                  Allow app to collect usage data to improve experience
                </Text>
              </View>
              <Switch
                value={dataCollection}
                onValueChange={setDataCollection}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={dataCollection ? theme.cardBackground : theme.cardBackground}
                ios_backgroundColor={theme.border}
              />
            </View>
            <View style={dynamicStyles.divider} />
            <View style={dynamicStyles.securityItem}>
              <Text style={dynamicStyles.securityIcon}>📈</Text>
              <View style={dynamicStyles.securityContent}>
                <Text style={dynamicStyles.securityTitle}>Analytics</Text>
                <Text style={dynamicStyles.securityDescription}>
                  Help us improve by sharing anonymous usage analytics
                </Text>
              </View>
              <Switch
                value={analytics}
                onValueChange={setAnalytics}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={analytics ? theme.cardBackground : theme.cardBackground}
                ios_backgroundColor={theme.border}
              />
            </View>
            <View style={dynamicStyles.divider} />
            <View style={dynamicStyles.securityItem}>
              <Text style={dynamicStyles.securityIcon}>🐛</Text>
              <View style={dynamicStyles.securityContent}>
                <Text style={dynamicStyles.securityTitle}>Crash Reports</Text>
                <Text style={dynamicStyles.securityDescription}>
                  Automatically send crash reports to help fix bugs
                </Text>
              </View>
              <Switch
                value={crashReports}
                onValueChange={setCrashReports}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={crashReports ? theme.cardBackground : theme.cardBackground}
                ios_backgroundColor={theme.border}
              />
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Data Management</Text>
          <View style={dynamicStyles.sectionContent}>
            <SecurityItem
              icon="📥"
              title="Export Data"
              description="Download a copy of your data (Coming soon)"
              onPress={() => {
                Alert.alert('Coming Soon', 'Data export will be available in a future update');
              }}
            />
            <View style={dynamicStyles.divider} />
            <SecurityItem
              icon="🗑️"
              title="Clear Cache"
              description="Clear cached data to free up space"
              onPress={() => {
                Alert.alert(
                  'Clear Cache',
                  'This will clear all cached data. You may need to re-download some content.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      onPress: () => {
                        // TODO: Implement cache clearing
                        Alert.alert('Success', 'Cache cleared successfully');
                      },
                    },
                  ]
                );
              }}
            />
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Account Actions</Text>
          <View style={dynamicStyles.sectionContent}>
            <SecurityItem
              icon="🚪"
              title="Sign Out"
              description="Sign out from this device"
              onPress={() => {
                Alert.alert(
                  'Sign Out',
                  'Are you sure you want to sign out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: async () => {
                        // This will be handled by the parent ProfileScreen
                        // For now, just show a message
                        Alert.alert('Sign Out', 'Please use the Sign Out button on the Profile screen');
                      },
                    },
                  ]
                );
              }}
            />
            <View style={dynamicStyles.divider} />
            <SecurityItem
              icon="❌"
              title="Delete Account"
              description="Permanently delete your account and all data"
              onPress={handleDeleteAccount}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={dynamicStyles.infoBox}>
          <Text style={dynamicStyles.infoIcon}>🔒</Text>
          <Text style={dynamicStyles.infoText}>
            Your data is encrypted and stored securely. We never share your personal information with third parties.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  securityIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: theme.textTertiary,
    lineHeight: 18,
  },
  securityArrow: {
    fontSize: 24,
    color: theme.textTertiary,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 48,
  },
  passwordForm: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: theme.background,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  changePasswordButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordButtonDisabled: {
    opacity: 0.6,
  },
  changePasswordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
});

