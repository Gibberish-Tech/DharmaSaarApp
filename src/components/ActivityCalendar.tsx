/**
 * Activity Calendar Component
 * Shows reading activity in a heatmap-style calendar view
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ActivityCalendarProps {
  readingsThisWeek: number;
  readingsThisMonth: number;
  currentStreak: number;
  recentActivity?: Array<{
    date: string; // YYYY-MM-DD format
    count: number;
  }>;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  readingsThisWeek,
  readingsThisMonth: _readingsThisMonth,
  currentStreak,
  recentActivity = [],
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  // Generate last 7 days with real activity data
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    // Create a map of date -> count from recentActivity
    const activityMap = new Map<string, number>();
    recentActivity.forEach((item) => {
      // Ensure date is in YYYY-MM-DD format
      // Handle various date formats: ISO datetime, date string, etc.
      let dateStr = item.date;
      if (typeof dateStr === 'string') {
        // Remove time portion if present (handles ISO datetime strings)
        dateStr = dateStr.split('T')[0].split(' ')[0];
      } else {
        // If it's not a string, convert to string first
        dateStr = String(dateStr).split('T')[0].split(' ')[0];
      }
      activityMap.set(dateStr, item.count);
    });
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Format date as YYYY-MM-DD for comparison
      const dateStr = date.toISOString().split('T')[0];
      const count = activityMap.get(dateStr) || 0;
      
      // Determine activity level based on count
      // 0 = no activity, 1-2 = light, 3-5 = moderate, 6+ = high
      let activityLevel = 0;
      if (count > 0) {
        if (count <= 2) {
          activityLevel = 1; // Light
        } else if (count <= 5) {
          activityLevel = 2; // Moderate
        } else {
          activityLevel = 3; // High
        }
      }
      
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        activity: activityLevel,
        count: count, // Store actual count for display
      });
    }
    
    return days;
  };

  const days = getLast7Days();

  const getActivityColor = (activity: number): string => {
    if (activity === 0) return theme.border;
    if (activity === 1) return theme.primary + '40'; // Light
    if (activity === 2) return theme.primary + '70'; // Moderate
    return theme.primary; // High (activity === 3)
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>This Week's Activity</Text>
        <View style={dynamicStyles.statsRow}>
          <Text style={dynamicStyles.statText}>
            {readingsThisWeek} readings this week
          </Text>
        </View>
      </View>

      <View style={dynamicStyles.calendarContainer}>
        {days.map((day, index) => {
          const isToday = index === days.length - 1;
          const isStreakDay = index >= days.length - currentStreak && currentStreak > 0;
          
          return (
            <TouchableOpacity
              key={index}
              style={dynamicStyles.dayContainer}
              activeOpacity={0.7}
            >
              <View
                style={[
                  dynamicStyles.dayBox,
                  {
                    backgroundColor: getActivityColor(day.activity),
                    borderColor: isToday
                      ? theme.primary
                      : isStreakDay
                      ? theme.primary + '50'
                      : 'transparent',
                  },
                  (isToday || isStreakDay) && dynamicStyles.dayBoxBordered,
                ]}
              >
                <Text
                  style={[
                    dynamicStyles.dayLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  {day.day}
                </Text>
                <Text
                  style={[
                    dynamicStyles.dayDate,
                    { color: theme.text },
                  ]}
                >
                  {day.date}
                </Text>
                {day.count > 0 && (
                  <View style={dynamicStyles.activityIndicator}>
                    <Text style={dynamicStyles.activityCount}>{day.count}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={dynamicStyles.legend}>
        <View style={dynamicStyles.legendItem}>
          <View
            style={[
              dynamicStyles.legendBox,
              { backgroundColor: theme.border },
            ]}
          />
          <Text style={dynamicStyles.legendText}>None</Text>
        </View>
        <View style={dynamicStyles.legendItem}>
          <View
            style={[
              dynamicStyles.legendBox,
              { backgroundColor: theme.primary + '40' },
            ]}
          />
          <Text style={dynamicStyles.legendText}>Light</Text>
        </View>
        <View style={dynamicStyles.legendItem}>
          <View
            style={[
              dynamicStyles.legendBox,
              { backgroundColor: theme.primary + '70' },
            ]}
          />
          <Text style={dynamicStyles.legendText}>Moderate</Text>
        </View>
        <View style={dynamicStyles.legendItem}>
          <View
            style={[
              dynamicStyles.legendBox,
              { backgroundColor: theme.primary },
            ]}
          />
          <Text style={dynamicStyles.legendText}>High</Text>
        </View>
      </View>

      {currentStreak > 0 && (
        <View style={dynamicStyles.streakIndicator}>
          <Text style={dynamicStyles.streakText}>
            🔥 {currentStreak} day streak active!
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    calendarContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    dayContainer: {
      flex: 1,
      alignItems: 'center',
    },
    dayBox: {
      width: 44,
      height: 60,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
      position: 'relative',
      borderWidth: 0,
    },
    dayBoxBordered: {
      borderWidth: 2,
    },
    dayLabel: {
      fontSize: 10,
      fontWeight: '500',
      marginBottom: 2,
    },
    dayDate: {
      fontSize: 14,
      fontWeight: '600',
    },
    activityIndicator: {
      position: 'absolute',
      bottom: 4,
    },
    activityCount: {
      fontSize: 9,
      color: theme.primary,
      fontWeight: '600',
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendBox: {
      width: 12,
      height: 12,
      borderRadius: 2,
    },
    legendText: {
      fontSize: 10,
      color: theme.textSecondary,
    },
    streakIndicator: {
      marginTop: 12,
      padding: 8,
      backgroundColor: theme.primary + '10',
      borderRadius: 8,
      alignItems: 'center',
    },
    streakText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '500',
    },
  });

