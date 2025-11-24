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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => (
  <View style={styles.statCard}>
    {icon && <Text style={styles.statIcon}>{icon}</Text>}
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, max, color = '#FF8C42' }) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressText}>{current} / {max}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

export const HomeScreen: React.FC = () => {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>नमस्ते</Text>
          <Text style={styles.subGreeting}>Welcome back, seeker of wisdom</Text>
        </View>

        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelLabel}>Level {stats.level}</Text>
            <Text style={styles.levelIcon}>📖</Text>
          </View>
          <ProgressBar
            label="Experience"
            current={stats.experience}
            max={stats.experienceToNextLevel}
            color="#FF8C42"
          />
          <Text style={styles.levelSubtext}>
            {stats.experienceToNextLevel - stats.experience} XP to next level
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {recentAchievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Growth Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Journey</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartIcon}>📈</Text>
            <Text style={styles.chartText}>Your learning progress over time</Text>
            <Text style={styles.chartSubtext}>Chart coming soon</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
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
    color: '#2A1F1A',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#6B5B4F',
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#8B2E3D',
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
    color: '#2A1F1A',
  },
  levelIcon: {
    fontSize: 32,
  },
  levelSubtext: {
    fontSize: 12,
    color: '#9B8A7F',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#8B2E3D',
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
    color: '#FF8C42',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B5B4F',
    textAlign: 'center',
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#9B8A7F',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2A1F1A',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#8B2E3D',
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
    color: '#2A1F1A',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B5B4F',
  },
  chartPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#8B2E3D',
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
    color: '#2A1F1A',
    fontWeight: '500',
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#9B8A7F',
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
    color: '#6B5B4F',
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: '#6B5B4F',
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F5E6D3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

