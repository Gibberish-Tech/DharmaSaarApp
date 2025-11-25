/**
 * Chatbot Screen - AI assistant for Sanatan Dharma questions
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export const ChatbotScreen: React.FC = () => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <View style={dynamicStyles.content}>
        <Text style={dynamicStyles.icon}>💬</Text>
        <Text style={dynamicStyles.title}>Chatbot</Text>
        <Text style={dynamicStyles.subtitle}>
          Your AI assistant for questions about Sanatan Dharma
        </Text>
        <Text style={dynamicStyles.comingSoon}>Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  comingSoon: {
    fontSize: 14,
    color: theme.textTertiary,
    fontStyle: 'italic',
  },
});

