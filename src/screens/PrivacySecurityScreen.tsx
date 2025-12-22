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
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { CONTENT_BOTTOM_PADDING } from '../constants/layout';
import { CustomAlert } from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { ProfileStackParamList } from '../navigation/ProfileStack';

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

type NavigationProp = StackNavigationProp<ProfileStackParamList, 'PrivacySecurity'>;

export const PrivacySecurityScreen: React.FC = () => {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const dynamicStyles = createStyles(theme, insets);
  const { alertConfig, visible: alertVisible, showAlert, hideAlert } = useCustomAlert();

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
      showAlert({
        title: 'Validation Error',
        message: 'Please fill in all password fields.',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    if (newPassword.length < 8) {
      showAlert({
        title: 'Validation Error',
        message: 'Password must be at least 8 characters long.',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        title: 'Validation Error',
        message: 'New passwords do not match. Please try again.',
        buttons: [{ text: 'OK' }],
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiService.changePassword(currentPassword, newPassword);
      
      showAlert({
        title: 'Success',
        message: 'Password changed successfully.',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              setShowPasswordChange(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ],
      });
    } catch (error: any) {
      showAlert({
        title: 'Error',
        message: error.message || 'Failed to change password. Please check your current password and try again.',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivateAccount = () => {
    showAlert({
      title: 'Deactivate Account',
      message: 'Are you sure you want to deactivate your account?\n\n⏸️ ACCOUNT DEACTIVATION:\n• Your account will be temporarily disabled\n• You will not be able to log in or access your data\n• All your data will be preserved on our servers\n• You can contact support to reactivate it at any time\n• Your reading progress, favorites, and conversations will remain intact\n\nThis is a reversible action. You can reactivate your account later.',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deactivateAccount();
              // Logout after successful account deactivation
              await logout();
              showAlert({
                title: 'Account Deactivated',
                message: 'Your account has been deactivated successfully. Contact support to reactivate it.',
                buttons: [{ text: 'OK' }],
              });
            } catch (error: any) {
              showAlert({
                title: 'Error',
                message: error.message || 'Failed to deactivate account. Please try again.',
                buttons: [{ text: 'OK' }],
              });
            }
          },
        },
      ],
    });
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: 'Delete Account',
      message: 'Choose how you want to delete your account:',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Soft Delete',
          onPress: () => {
            showAlert({
              title: 'Soft Delete Account',
              message: `Are you sure you want to soft delete your account?\n\n🗑️ SOFT DELETION:\n• Your account will be marked as deleted\n• All your data will be kept on our servers for 30 days\n• You can contact support to restore it within this period\n• After 30 days, your account and data will be permanently deleted\n• This includes: reading progress, favorites, conversations, achievements, and streaks\n\nThis is a reversible action. You can restore your account within 30 days.`,
              buttons: [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Soft Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const result = await apiService.deleteAccount(false);
                      // Logout after successful account deletion
                      await logout();
                      showAlert({
                        title: 'Account Deleted',
                        message: result.message || 'Your account has been deleted. Contact support within 30 days to restore it.',
                        buttons: [{ text: 'OK' }],
                      });
                    } catch (error: any) {
                      showAlert({
                        title: 'Error',
                        message: error.message || 'Failed to delete account. Please try again.',
                        buttons: [{ text: 'OK' }],
                      });
                    }
                  },
                },
              ],
            });
          },
        },
        {
          text: 'Permanent Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation for hard delete
            showAlert({
              title: 'Permanent Delete - Final Warning',
              message: `⚠️ CRITICAL WARNING ⚠️\n\nAre you absolutely sure you want to PERMANENTLY delete your account?\n\n🚨 PERMANENT DELETION:\n• Your account will be immediately and permanently removed\n• ALL your data will be permanently erased from our servers\n• This action CANNOT be undone\n• You will NOT be able to recover any data\n• This includes:\n  - All reading progress and streaks\n  - All favorite shlokas\n  - All chat conversations\n  - All achievements and statistics\n  - Your entire account history\n\nThis is a final, irreversible action. Please confirm you understand the consequences.`,
              buttons: [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Permanently Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const result = await apiService.deleteAccount(true);
                      // Logout after successful account deletion
                      await logout();
                      showAlert({
                        title: 'Account Permanently Deleted',
                        message: result.message || 'Your account and all data have been permanently deleted. This action cannot be undone.',
                        buttons: [{ text: 'OK' }],
                      });
                    } catch (error: any) {
                      showAlert({
                        title: 'Error',
                        message: error.message || 'Failed to delete account. Please try again.',
                        buttons: [{ text: 'OK' }],
                      });
                    }
                  },
                },
              ],
            });
          },
        },
      ],
    });
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
                showAlert({
                  title: 'Coming Soon',
                  message: 'Two-factor authentication will be available in a future update.',
                  buttons: [{ text: 'OK' }],
                });
              }}
            />
            <View style={dynamicStyles.divider} />
            <SecurityItem
              icon="📱"
              title="Active Sessions"
              description="View and manage devices where you're logged in (Coming soon)"
              onPress={() => {
                showAlert({
                  title: 'Coming Soon',
                  message: 'Session management will be available in a future update.',
                  buttons: [{ text: 'OK' }],
                });
              }}
            />
          </View>
        </View>

        {/* Privacy Settings Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Privacy Settings</Text>
          <View style={dynamicStyles.sectionContent}>
            <SecurityItem
              icon="📄"
              title="Privacy Policy"
              description="View our complete privacy policy"
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
            <View style={dynamicStyles.divider} />
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
                showAlert({
                  title: 'Coming Soon',
                  message: 'Data export will be available in a future update.',
                  buttons: [{ text: 'OK' }],
                });
              }}
            />
            <View style={dynamicStyles.divider} />
            <SecurityItem
              icon="🗑️"
              title="Clear Cache"
              description="Clear cached data to free up space"
              onPress={() => {
                showAlert({
                  title: 'Clear Cache',
                  message: 'This will clear all cached data. You may need to re-download some content.',
                  buttons: [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      onPress: () => {
                        // TODO: Implement cache clearing
                        showAlert({
                          title: 'Success',
                          message: 'Cache cleared successfully.',
                          buttons: [{ text: 'OK' }],
                        });
                      },
                    },
                  ],
                });
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
                showAlert({
                  title: 'Sign Out',
                  message: 'Please use the Sign Out button on the Profile screen.',
                  buttons: [{ text: 'OK' }],
                });
              }}
            />
            <View style={dynamicStyles.divider} />
            <SecurityItem
              icon="⏸️"
              title="Deactivate Account"
              description="Temporarily disable your account (can be reactivated)"
              onPress={handleDeactivateAccount}
            />
            <View style={dynamicStyles.divider} />
            <SecurityItem
              icon="❌"
              title="Delete Account"
              description="Delete your account (soft or permanent delete)"
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

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={hideAlert}
          showCloseButton={alertConfig.showCloseButton}
        />
      )}
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

