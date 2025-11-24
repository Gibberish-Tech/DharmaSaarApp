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

export const ChatbotScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.title}>Chatbot</Text>
        <Text style={styles.subtitle}>
          Your AI assistant for questions about Sanatan Dharma
        </Text>
        <Text style={styles.comingSoon}>Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
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
    color: '#2A1F1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B5B4F',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  comingSoon: {
    fontSize: 14,
    color: '#9B8A7F',
    fontStyle: 'italic',
  },
});

