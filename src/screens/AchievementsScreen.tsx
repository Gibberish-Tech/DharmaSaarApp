/**
 * Achievements Screen - Display all user achievements
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Skeleton, SkeletonCard } from '../components/Skeleton';

interface Achievement {
  id: string;
  achievement: {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    condition_type: string;
    condition_value: number;
    xp_reward: number;
  };
  unlocked_at: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isUnlocked }) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View
      style={[
        dynamicStyles.achievementCard,
        isUnlocked && dynamicStyles.achievementCardUnlocked,
      ]}
    >
      <View style={dynamicStyles.achievementHeader}>
        <Text
          style={[
            dynamicStyles.achievementIcon,
            !isUnlocked && dynamicStyles.achievementIconLocked,
          ]}
        >
          {isUnlocked ? achievement.achievement.icon : '🔒'}
        </Text>
        <View style={dynamicStyles.achievementInfo}>
          <Text
            style={[
              dynamicStyles.achievementName,
              !isUnlocked && dynamicStyles.achievementNameLocked,
            ]}
          >
            {achievement.achievement.name}
          </Text>
          {isUnlocked && (
            <Text style={dynamicStyles.achievementDate}>
              Unlocked {formatDate(achievement.unlocked_at)}
            </Text>
          )}
        </View>
      </View>
      <Text
        style={[
          dynamicStyles.achievementDescription,
          !isUnlocked && dynamicStyles.achievementDescriptionLocked,
        ]}
      >
        {achievement.achievement.description}
      </Text>
      {isUnlocked && (
        <View style={dynamicStyles.xpBadge}>
          <Text style={dynamicStyles.xpBadgeText}>
            +{achievement.achievement.xp_reward} XP
          </Text>
        </View>
      )}
    </View>
  );
};

export const AchievementsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const dynamicStyles = createStyles(theme);
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAchievements = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiService.getAchievements();
      setAchievements(data);
    } catch (err) {
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAchievements();
  }, [loadAchievements]);

  const unlockedCount = achievements.length;

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <ScrollView
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Skeleton */}
          <View style={dynamicStyles.header}>
            <Skeleton width={48} height={48} borderRadius={24} style={dynamicStyles.skeletonMargin} />
            <Skeleton width={200} height={16} />
          </View>

          {/* Achievements List Skeleton */}
          <View style={dynamicStyles.achievementsList}>
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard
                key={index}
                showIcon={true}
                showTitle={true}
                showSubtitle={true}
                lines={1}
              />
            ))}
          </View>
        </ScrollView>
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
            <Text style={dynamicStyles.headerStatValue}>{unlockedCount}</Text>
            <Text style={dynamicStyles.headerStatLabel}>Achievements Unlocked</Text>
          </View>
        </View>

        {/* Achievements List */}
        {achievements.length > 0 ? (
          <View style={dynamicStyles.achievementsList}>
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={true}
              />
            ))}
          </View>
        ) : (
          <View style={dynamicStyles.emptyContainer}>
            <Text style={dynamicStyles.emptyIcon}>🏆</Text>
            <Text style={dynamicStyles.emptyTitle}>No Achievements Yet</Text>
            <Text style={dynamicStyles.emptyText}>
              Your journey to unlocking achievements starts now! Read shlokas daily, build your streak, and earn XP to unlock amazing achievements and rewards.
            </Text>
            <View style={dynamicStyles.emptyExamples}>
              <View style={dynamicStyles.emptyExampleItem}>
                <Text style={dynamicStyles.emptyExampleIcon}>📖</Text>
                <Text style={dynamicStyles.emptyExampleText}>Read your first shloka</Text>
              </View>
              <View style={dynamicStyles.emptyExampleItem}>
                <Text style={dynamicStyles.emptyExampleIcon}>🔥</Text>
                <Text style={dynamicStyles.emptyExampleText}>Build a 7-day streak</Text>
              </View>
              <View style={dynamicStyles.emptyExampleItem}>
                <Text style={dynamicStyles.emptyExampleIcon}>⭐</Text>
                <Text style={dynamicStyles.emptyExampleText}>Level up and earn XP</Text>
              </View>
            </View>
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
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementCardUnlocked: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + '10',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  achievementIconLocked: {
    opacity: 0.4,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: theme.textSecondary,
  },
  achievementDate: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  achievementDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  achievementDescriptionLocked: {
    color: theme.textTertiary,
  },
  xpBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  xpBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyExamples: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  emptyExampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyExampleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  emptyExampleText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  skeletonMargin: {
    marginBottom: 8,
  },
});

