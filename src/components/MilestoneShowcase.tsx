/**
 * Milestone Showcase Component
 * Displays streak milestones (7, 30, 100, 365 days) with unlock status
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MilestoneShowcaseProps {
  currentStreak: number;
  longestStreak: number;
  awardedMilestones: number[];
}

interface Milestone {
  days: number;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
}

const MILESTONES: Milestone[] = [
  {
    days: 7,
    name: 'Week Warrior',
    description: '7 days of dedication',
    icon: '🔥',
    xpBonus: 50,
  },
  {
    days: 30,
    name: 'Monthly Devotee',
    description: '30 days of consistency',
    icon: '⭐',
    xpBonus: 200,
  },
  {
    days: 100,
    name: 'Centurion',
    description: '100 days of wisdom',
    icon: '👑',
    xpBonus: 500,
  },
  {
    days: 365,
    name: 'Year of Wisdom',
    description: '365 days of learning',
    icon: '🏆',
    xpBonus: 2000,
  },
];

export const MilestoneShowcase: React.FC<MilestoneShowcaseProps> = ({
  currentStreak,
  longestStreak,
  awardedMilestones,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  const isUnlocked = (days: number): boolean => {
    return longestStreak >= days || awardedMilestones.includes(days);
  };

  const isCurrentMilestone = (days: number): boolean => {
    return currentStreak >= days && !isUnlocked(days);
  };

  const getProgressToMilestone = (days: number): number => {
    if (isUnlocked(days)) return 100;
    if (currentStreak >= days) return 100;
    return Math.min((currentStreak / days) * 100, 100);
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Streak Milestones</Text>
        <Text style={dynamicStyles.subtitle}>
          Unlock rewards as you build your streak
        </Text>
      </View>

      <View style={dynamicStyles.milestonesGrid}>
        {MILESTONES.map((milestone) => {
          const unlocked = isUnlocked(milestone.days);
          const isCurrent = isCurrentMilestone(milestone.days);
          const progress = getProgressToMilestone(milestone.days);

          return (
            <View
              key={milestone.days}
              style={[
                dynamicStyles.milestoneCard,
                unlocked && dynamicStyles.milestoneCardUnlocked,
                isCurrent && dynamicStyles.milestoneCardCurrent,
              ]}
            >
              <View style={dynamicStyles.milestoneHeader}>
                <Text
                  style={[
                    dynamicStyles.milestoneIcon,
                    !unlocked && !isCurrent && dynamicStyles.milestoneIconLocked,
                  ]}
                >
                  {unlocked ? milestone.icon : isCurrent ? '🔓' : '🔒'}
                </Text>
                <View style={dynamicStyles.milestoneInfo}>
                  <Text
                    style={[
                      dynamicStyles.milestoneName,
                      !unlocked && !isCurrent && dynamicStyles.milestoneNameLocked,
                    ]}
                  >
                    {milestone.name}
                  </Text>
                  <Text
                    style={[
                      dynamicStyles.milestoneDays,
                      !unlocked && !isCurrent && dynamicStyles.milestoneDaysLocked,
                    ]}
                  >
                    {milestone.days} days
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  dynamicStyles.milestoneDescription,
                  !unlocked && !isCurrent && dynamicStyles.milestoneDescriptionLocked,
                ]}
              >
                {milestone.description}
              </Text>

              {unlocked ? (
                <View style={dynamicStyles.xpBadge}>
                  <Text style={dynamicStyles.xpBadgeText}>
                    +{milestone.xpBonus} XP
                  </Text>
                </View>
              ) : (
                <View style={dynamicStyles.progressContainer}>
                  <View style={dynamicStyles.progressBarBackground}>
                    <View
                      style={[
                        dynamicStyles.progressBarFill,
                        { width: `${progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={dynamicStyles.progressText}>
                    {currentStreak}/{milestone.days} days
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
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
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    milestonesGrid: {
      gap: 12,
    },
    milestoneCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: theme.border,
    },
    milestoneCardUnlocked: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + '10',
    },
    milestoneCardCurrent: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + '05',
    },
    milestoneHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    milestoneIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    milestoneIconLocked: {
      opacity: 0.4,
    },
    milestoneInfo: {
      flex: 1,
    },
    milestoneName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    milestoneNameLocked: {
      color: theme.textSecondary,
    },
    milestoneDays: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '500',
    },
    milestoneDaysLocked: {
      color: theme.textTertiary,
    },
    milestoneDescription: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 12,
    },
    milestoneDescriptionLocked: {
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
    progressContainer: {
      marginTop: 4,
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 6,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });

