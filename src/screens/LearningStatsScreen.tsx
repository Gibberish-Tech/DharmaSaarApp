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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { ActivityCalendar } from '../components/ActivityCalendar';

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
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={dynamicStyles.loadingText}>Loading statistics...</Text>
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
        {/* Overview Stats */}
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
});

