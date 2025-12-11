/**
 * Journey Component
 * Main component that combines timeline, activity calendar, and milestones
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { JourneyTimeline } from './JourneyTimeline';
import { ActivityCalendar } from './ActivityCalendar';
import { MilestoneShowcase } from './MilestoneShowcase';

interface JourneyProps {
  stats: {
    totalShlokasRead: number;
    totalBooksRead: number;
    currentStreak: number;
    longestStreak: number;
    totalStreakDays: number;
    level: number;
    experience: number;
    readingsThisWeek: number;
    readingsThisMonth: number;
  };
}

export const Journey: React.FC<JourneyProps> = ({ stats }) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);
  
  const [streakData, setStreakData] = useState<{
    awardedMilestones: number[];
    recentActivity: Array<{
      date: string;
      count: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStreakData = useCallback(async () => {
    try {
      const streakHistory = await apiService.getStreakHistory();
      setStreakData({
        awardedMilestones: streakHistory.milestones_reached?.map((m) => m.days) || [],
        recentActivity: streakHistory.recent_activity || [],
      });
    } catch (error) {
      console.error('Error loading streak data:', error);
      // Fallback to empty milestones if API fails
      // Try to get milestones from streak endpoint as fallback
      try {
        const streakInfo = await apiService.getUserStreak();
        setStreakData({
          awardedMilestones: streakInfo.awarded_milestones || [],
          recentActivity: [], // No recent activity available from fallback endpoint
        });
      } catch (fallbackError) {
        console.error('Error loading streak fallback data:', fallbackError);
        setStreakData({ 
          awardedMilestones: [],
          recentActivity: [],
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  if (loading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={dynamicStyles.loadingText}>Loading journey...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <JourneyTimeline
        currentStreak={stats.currentStreak}
        totalShlokasRead={stats.totalShlokasRead}
        level={stats.level}
      />

      <ActivityCalendar
        readingsThisWeek={stats.readingsThisWeek}
        readingsThisMonth={stats.readingsThisMonth}
        currentStreak={stats.currentStreak}
        recentActivity={streakData?.recentActivity || []}
      />

      <MilestoneShowcase
        currentStreak={stats.currentStreak}
        longestStreak={stats.longestStreak}
        awardedMilestones={streakData?.awardedMilestones || []}
      />
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: theme.textSecondary,
    },
  });

