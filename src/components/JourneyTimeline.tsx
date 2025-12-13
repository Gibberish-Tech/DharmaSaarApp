/**
 * Journey Timeline Component
 * Shows user's progress through different phases of their learning journey
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface JourneyTimelineProps {
  currentStreak: number;
  totalShlokasRead: number;
  level: number;
}

interface Phase {
  name: string;
  description: string;
  icon: string;
  minStreak: number;
  minShlokas: number;
  minLevel: number;
}

const PHASES: Phase[] = [
  {
    name: 'Onboarding',
    description: 'Getting started',
    icon: '🌱',
    minStreak: 0,
    minShlokas: 0,
    minLevel: 1,
  },
  {
    name: 'Early Engagement',
    description: 'Building habits',
    icon: '🌿',
    minStreak: 3,
    minShlokas: 10,
    minLevel: 2,
  },
  {
    name: 'Habit Formation',
    description: 'Consistent learning',
    icon: '🌳',
    minStreak: 7,
    minShlokas: 50,
    minLevel: 3,
  },
  {
    name: 'Long-Term',
    description: 'Mastery journey',
    icon: '🏔️',
    minStreak: 30,
    minShlokas: 100,
    minLevel: 5,
  },
];

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  currentStreak,
  totalShlokasRead,
  level,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  // Determine current phase
  const getCurrentPhase = (): { phase: Phase; index: number; progress: number } => {
    for (let i = PHASES.length - 1; i >= 0; i--) {
      const phase = PHASES[i];
      if (
        currentStreak >= phase.minStreak &&
        totalShlokasRead >= phase.minShlokas &&
        level >= phase.minLevel
      ) {
        // Calculate progress to next phase
        const nextPhase = PHASES[i + 1];
        let progress = 100;
        
        if (nextPhase) {
          const streakDiff = nextPhase.minStreak - phase.minStreak;
          const shlokasDiff = nextPhase.minShlokas - phase.minShlokas;
          const levelDiff = nextPhase.minLevel - phase.minLevel;
          
          const streakProgress = streakDiff > 0
            ? Math.min(((currentStreak - phase.minStreak) / streakDiff) * 100, 100)
            : 100;
          const shlokasProgress = shlokasDiff > 0
            ? Math.min(((totalShlokasRead - phase.minShlokas) / shlokasDiff) * 100, 100)
            : 100;
          const levelProgress = levelDiff > 0
            ? Math.min(((level - phase.minLevel) / levelDiff) * 100, 100)
            : 100;
          
          progress = Math.max(0, Math.min((streakProgress + shlokasProgress + levelProgress) / 3, 100));
        }
        
        return { phase, index: i, progress };
      }
    }
    return { phase: PHASES[0], index: 0, progress: 0 };
  };

  const { phase: currentPhase, index: currentIndex, progress } = getCurrentPhase();
  const nextPhase = PHASES[currentIndex + 1];

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Your Journey</Text>
        <Text style={dynamicStyles.currentPhase}>
          {currentPhase.icon} {currentPhase.name}
        </Text>
      </View>

      {/* Timeline Path */}
      <View style={dynamicStyles.timelineContainer}>
        {PHASES.map((phase, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <View key={index} style={dynamicStyles.phaseContainer}>
              <View style={dynamicStyles.phaseContent}>
                <View
                  style={[
                    dynamicStyles.phaseIcon,
                    isCompleted && dynamicStyles.phaseIconCompleted,
                    isCurrent && dynamicStyles.phaseIconCurrent,
                    isUpcoming && dynamicStyles.phaseIconUpcoming,
                  ]}
                >
                  <Text style={dynamicStyles.phaseIconText}>{phase.icon}</Text>
                </View>
                <Text
                  style={[
                    dynamicStyles.phaseName,
                    isCompleted && dynamicStyles.phaseNameCompleted,
                    isCurrent && dynamicStyles.phaseNameCurrent,
                    isUpcoming && dynamicStyles.phaseNameUpcoming,
                  ]}
                >
                  {phase.name}
                </Text>
              </View>
              {index < PHASES.length - 1 && (
                <View
                  style={[
                    dynamicStyles.connector,
                    isCompleted && dynamicStyles.connectorCompleted,
                    isCurrent && dynamicStyles.connectorCurrent,
                    isUpcoming && dynamicStyles.connectorUpcoming,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Progress to Next Phase */}
      {nextPhase && (
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressHeader}>
            <Text style={dynamicStyles.progressLabel}>
              Progress to {nextPhase.name}
            </Text>
            <Text style={dynamicStyles.progressPercent}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={dynamicStyles.progressBarBackground}>
            <View
              style={[
                dynamicStyles.progressBarFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={dynamicStyles.progressHint}>
            {currentPhase.description} → {nextPhase.description}
          </Text>
        </View>
      )}

      {!nextPhase && (
        <View style={dynamicStyles.completedContainer}>
          <Text style={dynamicStyles.completedText}>
            🎉 You've reached the highest phase! Keep learning and growing.
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
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.heading,
      marginBottom: 8,
    },
    currentPhase: {
      fontSize: 16,
      color: theme.primary,
      fontWeight: '500',
    },
    timelineContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 8,
    },
    phaseContainer: {
      flex: 1,
      alignItems: 'center',
      position: 'relative',
    },
    phaseContent: {
      alignItems: 'center',
    },
    phaseIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 2,
      borderColor: theme.border,
    },
    phaseIconCompleted: {
      backgroundColor: theme.primary + '20',
      borderColor: theme.primary,
    },
    phaseIconCurrent: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      transform: [{ scale: 1.1 }],
    },
    phaseIconUpcoming: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.border,
      opacity: 0.5,
    },
    phaseIconText: {
      fontSize: 24,
    },
    phaseName: {
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    phaseNameCompleted: {
      color: theme.primary,
    },
    phaseNameCurrent: {
      color: theme.primary,
      fontWeight: '600',
    },
    phaseNameUpcoming: {
      color: theme.textTertiary,
      opacity: 0.5,
    },
    connector: {
      position: 'absolute',
      top: 24,
      left: '60%',
      right: '-40%',
      height: 2,
      backgroundColor: theme.border,
      zIndex: -1,
    },
    connectorCompleted: {
      backgroundColor: theme.primary,
    },
    connectorCurrent: {
      backgroundColor: theme.primary,
      opacity: 0.5,
    },
    connectorUpcoming: {
      backgroundColor: theme.border,
      opacity: 0.3,
    },
    progressContainer: {
      marginTop: 8,
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
    progressPercent: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: '600',
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: theme.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    progressHint: {
      fontSize: 12,
      color: theme.textTertiary,
      textAlign: 'center',
    },
    completedContainer: {
      marginTop: 8,
      padding: 12,
      backgroundColor: theme.primary + '10',
      borderRadius: 8,
    },
    completedText: {
      fontSize: 14,
      color: theme.text,
      textAlign: 'center',
    },
  });

