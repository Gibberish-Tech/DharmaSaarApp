/**
 * Edit Profile Screen - Update user profile information
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { CONTENT_BOTTOM_PADDING } from '../constants/layout';

type EditProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const dynamicStyles = createStyles(theme, insets);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await apiService.updateProfile({ name: name.trim(), email: email.trim() });
      
      // Update user in AsyncStorage and context
      try {
        await AsyncStorage.setItem('@sanatan_app_user', JSON.stringify(updatedUser));
        await refreshUser();
      } catch (storageError) {
        console.error('Error updating user in storage:', storageError);
      }
      
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Picture Section */}
        <View style={dynamicStyles.avatarSection}>
          <View style={dynamicStyles.avatar}>
            <Text style={dynamicStyles.avatarText}>ॐ</Text>
          </View>
          <TouchableOpacity
            style={dynamicStyles.changePhotoButton}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                'Change Photo',
                'Profile picture upload will be available soon',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={dynamicStyles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View style={dynamicStyles.formSection}>
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Full Name</Text>
            <TextInput
              style={dynamicStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>Email Address</Text>
            <TextInput
              style={dynamicStyles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={dynamicStyles.infoBox}>
            <Text style={dynamicStyles.infoIcon}>ℹ️</Text>
            <Text style={dynamicStyles.infoText}>
              Changing your email will require verification. You'll receive an email to confirm your new address.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            dynamicStyles.saveButton,
            isLoading && dynamicStyles.saveButtonDisabled,
          ]}
          activeOpacity={0.7}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={dynamicStyles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    fontSize: 56,
    color: '#FFFFFF',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.primary,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
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
    marginTop: 8,
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

