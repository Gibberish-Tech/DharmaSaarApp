/**
 * Signup Screen - User registration
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SignupScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      passwordConfirm?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!passwordConfirm) {
      newErrors.passwordConfirm = 'Please confirm your password';
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await signup(name.trim(), email.trim(), password, passwordConfirm);
      // Navigation will be handled by AppNavigator based on auth state
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.message || 'Unable to create account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: string) => {
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const dynamicStyles = createStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={dynamicStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={dynamicStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={dynamicStyles.content}>
            {/* Header */}
            <View style={dynamicStyles.header}>
              <Image 
                source={require('../assets/logo.png')} 
                style={dynamicStyles.logo}
                resizeMode="contain"
              />
              <Text style={dynamicStyles.title}>Join DharmaSaar</Text>
              <Text style={dynamicStyles.subtitle}>Start your spiritual journey</Text>
            </View>

            {/* Form */}
            <View style={dynamicStyles.form}>
              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Name</Text>
                <TextInput
                  style={[dynamicStyles.input, errors.name && dynamicStyles.inputError]}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textTertiary}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError('name');
                  }}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                {errors.name && (
                  <Text style={dynamicStyles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Email</Text>
                <TextInput
                  style={[dynamicStyles.input, errors.email && dynamicStyles.inputError]}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textTertiary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError('email');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {errors.email && (
                  <Text style={dynamicStyles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Password</Text>
                <TextInput
                  style={[dynamicStyles.input, errors.password && dynamicStyles.inputError]}
                  placeholder="At least 8 characters"
                  placeholderTextColor={theme.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {errors.password && (
                  <Text style={dynamicStyles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.label}>Confirm Password</Text>
                <TextInput
                  style={[
                    dynamicStyles.input,
                    errors.passwordConfirm && dynamicStyles.inputError,
                  ]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={theme.textTertiary}
                  value={passwordConfirm}
                  onChangeText={(text) => {
                    setPasswordConfirm(text);
                    clearError('passwordConfirm');
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {errors.passwordConfirm && (
                  <Text style={dynamicStyles.errorText}>{errors.passwordConfirm}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[dynamicStyles.button, isLoading && dynamicStyles.buttonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.cardBackground} />
                ) : (
                  <Text style={dynamicStyles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={dynamicStyles.footer}>
              <Text style={dynamicStyles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text style={dynamicStyles.footerLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 32,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.heading,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    form: {
      width: '100%',
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputError: {
      borderColor: '#FF4444',
    },
    errorText: {
      fontSize: 12,
      color: '#FF4444',
      marginTop: 4,
    },
    button: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.cardBackground,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 32,
    },
    footerText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    footerLink: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.primary,
    },
  });

