/**
 * Shloka Detail Screen - Display full shloka details
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { convertShlokaToKnowledgeItem } from '../utils/shlokaConverter';
import { ProfileStackParamList } from '../navigation/ProfileStack';

type ShlokaDetailScreenRouteProp = RouteProp<ProfileStackParamList, 'ShlokaDetail'>;
type ShlokaDetailScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ShlokaDetail'>;

export const ShlokaDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const route = useRoute<ShlokaDetailScreenRouteProp>();
  const navigation = useNavigation<ShlokaDetailScreenNavigationProp>();
  const dynamicStyles = createStyles(theme);

  const { shlokaId } = route.params;
  const [loading, setLoading] = useState(true);
  const [knowledgeItem, setKnowledgeItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShloka();
  }, [shlokaId]);

  const loadShloka = async () => {
    if (!isAuthenticated || !shlokaId) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const shlokaData = await apiService.getShlokaById(shlokaId);
      const converted = convertShlokaToKnowledgeItem(shlokaData);
      setKnowledgeItem(converted);
    } catch (err) {
      console.error('Error loading shloka:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load shloka';
      setError(errorMessage);
      Alert.alert('Error', errorMessage, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !knowledgeItem) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={[]}>
      <KnowledgeCard item={knowledgeItem} />
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

