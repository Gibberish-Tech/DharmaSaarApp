/**
 * Learning Stats Screen - Detailed statistics about user's learning progress
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { ActivityCalendar } from '../components/ActivityCalendar';
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

export const LearningStatsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const dynamicStyles = createStyles(theme);
  
  const [stats, setStats] = useState({
    totalShlokasRead: 0,
    totalBooksRead: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStreakDays: 0,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    readingsThisWeek: 0,
    readingsThisMonth: 0,
    totalReadings: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    date: string;
    count: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const statsData = await apiService.getUserStats();
      setStats({
        totalShlokasRead: statsData.total_shlokas_read,
        totalBooksRead: statsData.total_books_read || 0,
        currentStreak: statsData.current_streak,
        longestStreak: statsData.longest_streak || 0,
        totalStreakDays: statsData.total_streak_days || 0,
        level: statsData.level,
        experience: statsData.experience,
        experienceToNextLevel: statsData.xp_for_next_level,
        readingsThisWeek: statsData.readings_this_week || 0,
        readingsThisMonth: statsData.readings_this_month || 0,
        totalReadings: statsData.total_readings || 0,
      });

      // Load recent activity for calendar
      try {
        const streakHistory = await apiService.getStreakHistory();
        setRecentActivity(streakHistory.recent_activity || []);
      } catch (err) {
        console.error('Error loading streak history:', err);
        setRecentActivity([]);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

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
            <Skeleton width={100} height={100} borderRadius={50} style={dynamicStyles.skeletonMargin} />
            <Skeleton width={200} height={24} style={dynamicStyles.skeletonMargin} />
            <Skeleton width={180} height={14} />
          </View>

          {/* Overview Stats Skeleton */}
          <View style={dynamicStyles.section}>
            <Skeleton width={100} height={20} style={dynamicStyles.skeletonMargin} />
            <View style={dynamicStyles.statsGrid}>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </View>
          </View>

          {/* Streak Stats Skeleton */}
          <View style={dynamicStyles.section}>
            <Skeleton width={80} height={20} style={dynamicStyles.skeletonMargin} />
            <View style={dynamicStyles.statsGrid}>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </View>
          </View>

          {/* Recent Activity Skeleton */}
          <View style={dynamicStyles.section}>
            <Skeleton width={140} height={20} style={dynamicStyles.skeletonMargin} />
            <View style={dynamicStyles.statsGrid}>
              <SkeletonStatCard />
              <SkeletonStatCard />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Check if user is new (all stats are 0)
  const isNewUser = stats.totalShlokasRead === 0 && 
                    stats.totalBooksRead === 0 && 
                    stats.currentStreak === 0 && 
                    stats.totalReadings === 0;

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
        {/* Header with Logo */}
        <View style={dynamicStyles.header}>
          <Image 
            source={require('../assets/logo.png')} 
            style={dynamicStyles.logo}
            resizeMode="contain"
          />
          <Text style={dynamicStyles.headerTitle}>Learning Statistics</Text>
          <Text style={dynamicStyles.headerSubtitle}>Track your spiritual journey</Text>
        </View>

        {/* Encouraging Empty State for New Users */}
        {isNewUser && (
          <View style={dynamicStyles.emptyStateContainer}>
            <Text style={dynamicStyles.emptyStateIcon}>📊</Text>
            <Text style={dynamicStyles.emptyStateTitle}>Your Journey Begins Here</Text>
            <Text style={dynamicStyles.emptyStateText}>
              Start reading shlokas to see your progress, track your streaks, and unlock achievements. Every reading counts!
            </Text>
            <TouchableOpacity
              style={dynamicStyles.emptyStateButton}
              onPress={() => {
                // Navigate to Shlokas tab
                navigation.getParent()?.navigate('Shlokas');
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Start reading shlokas"
              accessibilityHint="Double tap to navigate to the shlokas screen and start reading"
            >
              <Text style={dynamicStyles.emptyStateButtonText}>Start Reading</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Overview Stats - Only show if user has activity */}
        {!isNewUser && (
          <>
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Overview</Text>
          <View style={dynamicStyles.statsGrid}>
            <StatCard
              title="Level"
              value={stats.level}
              subtitle="Current level"
              icon="📖"
            />
            <StatCard
              title="Experience"
              value={stats.experience}
              subtitle="Total XP"
              icon="⭐"
            />
            <StatCard
              title="Shlokas Read"
              value={stats.totalShlokasRead}
              subtitle="Unique shlokas"
              icon="📜"
            />
            <StatCard
              title="Books Read"
              value={stats.totalBooksRead}
              subtitle="Different books"
              icon="📚"
            />
          </View>
        </View>

        {/* Streak Stats */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Streak</Text>
          <View style={dynamicStyles.statsGrid}>
            <StatCard
              title="Current Streak"
              value={stats.currentStreak}
              subtitle="days"
              icon="🔥"
            />
            <StatCard
              title="Longest Streak"
              value={stats.longestStreak}
              subtitle="days"
              icon="🏆"
            />
            <StatCard
              title="Total Streak Days"
              value={stats.totalStreakDays}
              subtitle="all time"
              icon="📅"
            />
            <StatCard
              title="Total Readings"
              value={stats.totalReadings}
              subtitle="including repeats"
              icon="📖"
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Recent Activity</Text>
          <View style={dynamicStyles.statsGrid}>
            <StatCard
              title="This Week"
              value={stats.readingsThisWeek}
              subtitle="readings"
              icon="📊"
            />
            <StatCard
              title="This Month"
              value={stats.readingsThisMonth}
              subtitle="readings"
              icon="📈"
            />
          </View>
        </View>

        {/* Journey Timeline */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Your Journey</Text>
          <JourneyTimeline
            currentStreak={stats.currentStreak}
            totalShlokasRead={stats.totalShlokasRead}
            level={stats.level}
          />
        </View>

        {/* Activity Calendar */}
        <View style={dynamicStyles.section}>
          <ActivityCalendar
            readingsThisWeek={stats.readingsThisWeek}
            readingsThisMonth={stats.readingsThisMonth}
            currentStreak={stats.currentStreak}
            recentActivity={recentActivity}
          />
        </View>
          </>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.heading,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
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
    fontSize: 28,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 12,
    color: theme.textTertiary,
    marginTop: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginBottom: 32,
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyStateButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minHeight: 44, // Minimum touch target size
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skeletonMargin: {
    marginBottom: 16,
  },
});

