/**
 * Favorites Screen - Display user's favorite/saved shlokas
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService, Shloka } from '../services/api';

interface Favorite {
  id: string;
  shloka: Shloka;
  created_at: string;
}

import { ProfileStackParamList } from '../navigation/ProfileStack';

type FavoritesScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'Favorites'>;

interface FavoriteCardProps {
  favorite: Favorite;
  onRemove: (favoriteId: string) => void;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ favorite, onRemove }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const dynamicStyles = createStyles(theme);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePress = () => {
    // Navigate to shloka detail screen
    navigation.navigate('ShlokaDetail', { shlokaId: favorite.shloka.id });
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this shloka from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(favorite.id),
        },
      ]
    );
  };

  return (
    <View style={dynamicStyles.favoriteCard}>
      <TouchableOpacity
        style={dynamicStyles.favoriteContent}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={dynamicStyles.favoriteHeader}>
          <View style={dynamicStyles.favoriteInfo}>
            <Text style={dynamicStyles.favoriteBook}>{favorite.shloka.book_name}</Text>
            <Text style={dynamicStyles.favoriteReference}>
              Chapter {favorite.shloka.chapter_number}, Verse {favorite.shloka.verse_number}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRemove}
            style={dynamicStyles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={dynamicStyles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={dynamicStyles.favoriteSanskrit} numberOfLines={2}>
          {favorite.shloka.sanskrit_text}
        </Text>
        {favorite.shloka.transliteration && (
          <Text style={dynamicStyles.favoriteTransliteration} numberOfLines={1}>
            {favorite.shloka.transliteration}
          </Text>
        )}
        <Text style={dynamicStyles.favoriteDate}>
          Saved on {formatDate(favorite.created_at)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const FavoritesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const dynamicStyles = createStyles(theme);
  
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiService.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
  }, [loadFavorites]);

  const handleRemove = async (favoriteId: string) => {
    try {
      setRemovingId(favoriteId);
      const favorite = favorites.find((f) => f.id === favoriteId);
      if (favorite) {
        await apiService.removeFavorite(favorite.shloka.id);
        setFavorites(favorites.filter((f) => f.id !== favoriteId));
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to remove favorite. Please try again.');
      console.error('Error removing favorite:', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={dynamicStyles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Header Stats */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerStat}>
            <Text style={dynamicStyles.headerStatValue}>{favorites.length}</Text>
            <Text style={dynamicStyles.headerStatLabel}>
              {favorites.length === 1 ? 'Favorite Shloka' : 'Favorite Shlokas'}
            </Text>
          </View>
        </View>

        {/* Favorites List */}
        {favorites.length > 0 ? (
          <View style={dynamicStyles.favoritesList}>
            {favorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                onRemove={handleRemove}
              />
            ))}
          </View>
        ) : (
          <View style={dynamicStyles.emptyContainer}>
            <Text style={dynamicStyles.emptyIcon}>⭐</Text>
            <Text style={dynamicStyles.emptyTitle}>No Favorites Yet</Text>
            <Text style={dynamicStyles.emptyText}>
              Tap the star icon on any shloka to save it to your favorites!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.primary,
    marginBottom: 8,
  },
  headerStatLabel: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  favoritesList: {
    gap: 12,
  },
  favoriteCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteBook: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  favoriteReference: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  favoriteSanskrit: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 8,
    lineHeight: 24,
    fontFamily: 'System', // Use system font for Sanskrit
  },
  favoriteTransliteration: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  favoriteDate: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

