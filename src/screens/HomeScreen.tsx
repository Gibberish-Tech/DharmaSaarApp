/**
 * Home Screen - Gamified learning progress and upgrades
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const dynamicStyles = createStyles(theme);

  // Mock data - replace with actual data from backend/state management
  const stats = {
    totalShlokasRead: 42,
    currentStreak: 7,
    level: 5,
    experience: 1250,
    experienceToNextLevel: 2000,
    achievements: 8,
  };

  const recentAchievements = [
    { id: '1', title: 'First Steps', description: 'Read your first shloka', icon: '🌟' },
    { id: '2', title: 'Week Warrior', description: '7 day reading streak', icon: '🔥' },
    { id: '3', title: 'Scholar', description: 'Read 25 shlokas', icon: '📚' },
  ];

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top']}>
      <ScrollView 
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
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
            current={stats.experience}
            max={stats.experienceToNextLevel}
          />
          <Text style={dynamicStyles.levelSubtext}>
            {stats.experienceToNextLevel - stats.experience} XP to next level
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
            title="Day Streak"
            value={stats.currentStreak}
            subtitle="days"
            icon="🔥"
          />
          <StatCard
            title="Achievements"
            value={stats.achievements}
            subtitle="unlocked"
            icon="🏆"
          />
        </View>

        {/* Recent Achievements */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Recent Achievements</Text>
          {recentAchievements.map((achievement) => (
            <View key={achievement.id} style={dynamicStyles.achievementCard}>
              <Text style={dynamicStyles.achievementIcon}>{achievement.icon}</Text>
              <View style={dynamicStyles.achievementContent}>
                <Text style={dynamicStyles.achievementTitle}>{achievement.title}</Text>
                <Text style={dynamicStyles.achievementDescription}>{achievement.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Growth Chart Placeholder */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Your Journey</Text>
          <View style={dynamicStyles.chartPlaceholder}>
            <Text style={dynamicStyles.chartIcon}>📈</Text>
            <Text style={dynamicStyles.chartText}>Your learning progress over time</Text>
            <Text style={dynamicStyles.chartSubtext}>Chart coming soon</Text>
          </View>
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
    paddingBottom: 100, // Space for floating tab bar (70px height + 16px margin + 14px extra)
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.text,
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
    color: theme.text,
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
  },
  statCard: {
    flex: 1,
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
    color: theme.text,
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
});

