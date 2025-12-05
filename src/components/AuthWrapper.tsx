/**
 * AuthWrapper - Middleware component that conditionally renders children
 * based on authentication state. Token validation is handled by AuthContext.
 */
import React, { ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface AuthWrapperProps {
  children: ReactNode;
  /**
   * If true, only renders children when user is authenticated
   * If false, only renders children when user is NOT authenticated
   */
  requireAuth?: boolean;
}

/**
 * AuthWrapper component that:
 * 1. Checks if user is logged in (token validation is handled by AuthContext)
 * 2. Shows appropriate screens based on auth state
 */
export const AuthWrapper: React.FC<AuthWrapperProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  // Show loading screen while initial auth state is being loaded
  if (isLoading) {
    return <LoadingScreen theme={theme} />;
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If auth is NOT required but user IS authenticated, don't render children
  // (e.g., for login/signup screens)
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Render children if auth state matches requirements
  return <>{children}</>;
};

/**
 * Loading screen component
 */
const LoadingScreen: React.FC<{ theme: any }> = ({ theme }) => {
  const dynamicStyles = createStyles(theme);

  return (
    <View style={dynamicStyles.loadingContainer}>
      <Text style={dynamicStyles.loadingText}>🕉️</Text>
      <ActivityIndicator size="large" color={theme.primary} style={dynamicStyles.spinner} />
    </View>
  );
};

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

