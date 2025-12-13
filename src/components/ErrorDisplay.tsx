/**
 * Reusable error display component with retry functionality
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getUserFriendlyError } from '../utils/errorHandler';

interface ErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  style?: ViewStyle;
  showRetry?: boolean;
  compact?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  style,
  showRetry = true,
  compact = false,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);
  const errorInfo = getUserFriendlyError(error);

  if (compact) {
    return (
      <View style={[dynamicStyles.compactContainer, style]}>
        <Text style={dynamicStyles.compactText}>{errorInfo.userFriendlyMessage}</Text>
        {showRetry && onRetry && errorInfo.canRetry && (
          <TouchableOpacity
            style={dynamicStyles.compactRetryButton}
            onPress={onRetry}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Retry action"
            accessibilityHint="Retries the failed operation"
          >
            <Text style={dynamicStyles.compactRetryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[dynamicStyles.container, style]} accessibilityRole="alert">
      <Text style={dynamicStyles.icon} accessibilityLabel={errorInfo.isOffline ? 'No internet connection icon' : errorInfo.isNetworkError ? 'Connection error icon' : 'Error icon'}>
        {errorInfo.isOffline ? '📡' : errorInfo.isNetworkError ? '🌐' : '⚠️'}
      </Text>
      <Text style={dynamicStyles.title} accessibilityRole="header">
        {errorInfo.isOffline 
          ? 'No Internet Connection' 
          : errorInfo.isNetworkError 
          ? 'Connection Error' 
          : 'Something Went Wrong'}
      </Text>
      <Text style={dynamicStyles.message} accessibilityLabel={errorInfo.userFriendlyMessage}>{errorInfo.userFriendlyMessage}</Text>
      {showRetry && onRetry && errorInfo.canRetry && (
        <TouchableOpacity
          style={dynamicStyles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          accessibilityHint="Retries the failed operation"
        >
          <Text style={dynamicStyles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    margin: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  compactText: {
    flex: 1,
    fontSize: 13,
    color: theme.textSecondary,
    marginRight: 12,
  },
  compactRetryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactRetryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

