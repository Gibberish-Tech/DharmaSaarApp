/**
 * Home Screen - Gamified learning progress and upgrades
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Journey } from '../components/Journey';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Skeleton, SkeletonStatCard } from '../components/Skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);
  
  return (
    <View style={dynamicStyles.statCard}>
      {icon && <Text style={dynamicStyles.statIcon}>{icon}</Text>}
      <Text style={dynamicStyles.statValue}>{value}</Text>
      <Text style={dynamicStyles.statTitle}>{title}</Text>
      {subtitle && <Text style={dynamicStyles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
};

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, max, color }) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);
  const percentage = Math.min((current / max) * 100, 100);
  const barColor = color || theme.primary;
  
  return (
    <View style={dynamicStyles.progressContainer}>
      <View style={dynamicStyles.progressHeader}>
        <Text style={dynamicStyles.progressLabel}>{label}</Text>
        <Text style={dynamicStyles.progressText}>{current} / {max}</Text>
      </View>
      <View style={dynamicStyles.progressBarBackground}>
        <View style={[dynamicStyles.progressBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
};

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const dynamicStyles = createStyles(theme);
  
  const [stats, setStats] = useState({
    totalShlokasRead: 0,
    totalBooksRead: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStreakDays: 0,
    streakFreezeAvailable: false,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    readingsThisWeek: 0,
    readingsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freezeLoading, setFreezeLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const statsData = await apiService.getUserStats();

      setStats({
        totalShlokasRead: statsData.total_shlokas_read,
        totalBooksRead: statsData.total_books_read || 0,
        currentStreak: statsData.current_streak,
        longestStreak: statsData.longest_streak || 0,
        totalStreakDays: statsData.total_streak_days || 0,
        streakFreezeAvailable: statsData.streak_freeze_available || false,
        level: statsData.level,
        experience: statsData.experience,
        experienceToNextLevel: statsData.xp_for_next_level,
        readingsThisWeek: statsData.readings_this_week || 0,
        readingsThisMonth: statsData.readings_this_month || 0,
      });
    } catch (err) {
      console.error('Error loading home data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  const loadDataCallback = useCallback(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  // Refresh stats when screen comes into focus (e.g., after marking shlokas as read)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        // Small delay to ensure backend has processed the mark-as-read request
        const timer = setTimeout(() => {
          loadData();
        }, 500);
        return () => clearTimeout(timer);
      }
      // Always return a cleanup function (no-op if not authenticated)
      return () => {};
    }, [isAuthenticated, loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  const handleUseFreeze = async () => {
    if (!stats.streakFreezeAvailable) {
      Alert.alert(
        'Freeze Not Available',
        'You have already used your streak freeze this month. It will reset at the beginning of next month.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Use Streak Freeze?',
      'This will protect your current streak from breaking if you miss a day. You can use this once per month.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Freeze',
          onPress: async () => {
            try {
              setFreezeLoading(true);
              const result = await apiService.useStreakFreeze();
              Alert.alert('Success', result.message || 'Your streak is now protected!', [
                { text: 'OK' },
              ]);
              // Reload stats to reflect the change
              await loadData();
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to use streak freeze',
                [{ text: 'OK' }]
              );
            } finally {
              setFreezeLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={dynamicStyles.container} edges={['top']}>
        <ScrollView
          style={dynamicStyles.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Skeleton */}
          <View style={dynamicStyles.header}>
            <Skeleton width={120} height={24} style={dynamicStyles.skeletonMargin} />
            <Skeleton width={200} height={16} style={dynamicStyles.skeletonMargin} />
          </View>

          {/* Level Card Skeleton */}
          <View style={dynamicStyles.levelCard}>
            <View style={dynamicStyles.levelHeader}>
              <Skeleton width={100} height={20} />
              <Skeleton width={32} height={32} borderRadius={16} />
            </View>
            <Skeleton width="100%" height={8} borderRadius={4} style={dynamicStyles.skeletonMargin} />
            <Skeleton width={150} height={12} />
          </View>

          {/* Stats Grid Skeleton */}
          <View style={dynamicStyles.statsGrid}>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </View>

          {/* Streak Card Skeleton */}
          <View style={dynamicStyles.streakCard}>
            <Skeleton width={150} height={20} style={dynamicStyles.skeletonMargin} />
            <View style={dynamicStyles.streakDetails}>
              <View style={dynamicStyles.streakDetailItem}>
                <Skeleton width={80} height={12} style={dynamicStyles.skeletonMargin} />
                <Skeleton width={60} height={18} />
              </View>
              <View style={dynamicStyles.streakDetailItem}>
                <Skeleton width={80} height={12} style={dynamicStyles.skeletonMargin} />
                <Skeleton width={60} height={18} />
              </View>
              <View style={dynamicStyles.streakDetailItem}>
                <Skeleton width={80} height={12} style={dynamicStyles.skeletonMargin} />
                <Skeleton width={60} height={18} />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      {error && (
        <View style={dynamicStyles.errorContainer}>
          <ErrorDisplay
            error={error}
            onRetry={loadData}
            compact={true}
          />
        </View>
      )}
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
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.greeting}>नमस्ते</Text>
          <Text style={dynamicStyles.subGreeting}>Welcome back, seeker of wisdom</Text>
        </View>

        {/* Level Card */}
        <View style={dynamicStyles.levelCard}>
          <View style={dynamicStyles.levelHeader}>
            <Text style={dynamicStyles.levelLabel}>Level {stats.level}</Text>
            <Text style={dynamicStyles.levelIcon}>📖</Text>
          </View>
          <ProgressBar
            label="Experience"
            current={stats.experience % stats.experienceToNextLevel}
            max={stats.experienceToNextLevel}
          />
          <Text style={dynamicStyles.levelSubtext}>
            {Math.max(0, stats.experienceToNextLevel - (stats.experience % stats.experienceToNextLevel))} XP to next level
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={dynamicStyles.statsGrid}>
          <StatCard
            title="Shlokas Read"
            value={stats.totalShlokasRead}
            subtitle="Total"
            icon="📜"
          />
          <StatCard
            title="Books Read"
            value={stats.totalBooksRead}
            subtitle="Total"
            icon="📚"
          />
          <StatCard
            title="Day Streak"
            value={stats.currentStreak}
            subtitle="days"
            icon="🔥"
          />
        </View>

        {/* Streak Details Card */}
        {stats.currentStreak > 0 && (
          <View style={dynamicStyles.streakCard}>
            <View style={dynamicStyles.streakHeader}>
              <Text style={dynamicStyles.streakTitle}>🔥 Streak Details</Text>
              {stats.streakFreezeAvailable && (
                <TouchableOpacity
                  style={dynamicStyles.freezeButton}
                  onPress={handleUseFreeze}
                  disabled={freezeLoading}
                >
                  {freezeLoading ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Text style={dynamicStyles.freezeButtonText}>❄️ Freeze</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            <View style={dynamicStyles.streakDetails}>
              <View style={dynamicStyles.streakDetailItem}>
                <Text style={dynamicStyles.streakDetailLabel}>Current Streak</Text>
                <Text style={dynamicStyles.streakDetailValue}>{stats.currentStreak} days</Text>
              </View>
              <View style={dynamicStyles.streakDetailItem}>
                <Text style={dynamicStyles.streakDetailLabel}>Longest Streak</Text>
                <Text style={dynamicStyles.streakDetailValue}>{stats.longestStreak} days</Text>
              </View>
              <View style={dynamicStyles.streakDetailItem}>
                <Text style={dynamicStyles.streakDetailLabel}>Total Streak Days</Text>
                <Text style={dynamicStyles.streakDetailValue}>{stats.totalStreakDays} days</Text>
              </View>
            </View>
            {stats.streakFreezeAvailable && (
              <Text style={dynamicStyles.freezeHint}>
                💡 You have a streak freeze available! Use it to protect your streak if you miss a day.
              </Text>
            )}
            {!stats.streakFreezeAvailable && stats.currentStreak > 0 && (
              <Text style={dynamicStyles.freezeHint}>
                ❄️ Streak freeze used this month. It will reset next month.
              </Text>
            )}
          </View>
        )}

        {/* Journey Component */}
        <Journey stats={stats} />
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
    paddingBottom: 100, // Space for floating tab bar (70px height + 16px margin + 14px extra)
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.heading,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  levelCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.heading,
  },
  levelIcon: {
    fontSize: 32,
  },
  levelSubtext: {
    fontSize: 12,
    color: theme.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
    flexWrap: 'wrap', // Allow wrapping on very small screens
  },
  statCard: {
    flex: 1,
    minWidth: 100, // Minimum width to prevent too small cards
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    color: theme.textTertiary,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.heading,
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  chartPlaceholder: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chartIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  chartText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 14,
    color: theme.textTertiary,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
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
  emptyAchievements: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyAchievementsText: {
    color: theme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },
  freezeButton: {
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freezeButtonText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  streakDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  streakDetailItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakDetailLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  streakDetailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
  },
  freezeHint: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  skeletonMargin: {
    marginBottom: 8,
  },
});

