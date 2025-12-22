/**
 * Onboarding Flow - Welcome screens for first-time users
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { markOnboardingAsCompleted } from '../utils/onboardingStorage';
import { SCREEN_WIDTH, isSmallDevice, getResponsiveCardWidth } from '../utils/responsive';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface OnboardingScreenProps {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  onNext: () => void;
  onSkip?: () => void;
  isLast?: boolean;
  showSkip?: boolean;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  title,
  subtitle,
  content,
  onNext,
  onSkip,
  isLast = false,
  showSkip = true,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Skip button */}
        {showSkip && onSkip && (
          <View style={dynamicStyles.skipContainer}>
            <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
              <Text style={dynamicStyles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <View style={dynamicStyles.content}>
          <Text style={dynamicStyles.title}>{title}</Text>
          {subtitle && <Text style={dynamicStyles.subtitle}>{subtitle}</Text>}
          <View style={dynamicStyles.contentArea}>{content}</View>
        </View>

        {/* Navigation */}
        <View style={dynamicStyles.navigation}>
          <TouchableOpacity
            style={dynamicStyles.nextButton}
            onPress={onNext}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.nextButtonText}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [currentScreen, setCurrentScreen] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = async () => {
    if (currentScreen < screens.length - 1) {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen(currentScreen + 1);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Complete onboarding
      try {
        await markOnboardingAsCompleted();
        onComplete();
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Still call onComplete to prevent getting stuck
        onComplete();
      }
    }
  };

  const handleSkip = async () => {
    try {
      await markOnboardingAsCompleted();
      onComplete();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      // Still call onComplete to prevent getting stuck
      onComplete();
    }
  };

  const screens = [
    {
      title: 'Welcome to DharmaSaar',
      subtitle: 'Your journey to ancient wisdom begins here',
      content: (
        <WelcomeContent theme={theme} />
      ),
    },
    {
      title: 'How to Use',
      subtitle: 'Swipe through shlokas with simple gestures',
      content: (
        <SwipeTutorialContent theme={theme} />
      ),
    },
    {
      title: 'Track Your Progress',
      subtitle: 'Earn XP, build streaks, and unlock achievements',
      content: (
        <GamificationContent theme={theme} />
      ),
    },
  ];

  const currentScreenData = screens[currentScreen];
  const dynamicStyles = createStyles(theme);

  return (
    <Animated.View style={[dynamicStyles.animatedContainer, { opacity: fadeAnim }]}>
      <OnboardingScreen
        title={currentScreenData.title}
        subtitle={currentScreenData.subtitle}
        content={currentScreenData.content}
        onNext={handleNext}
        onSkip={handleSkip}
        isLast={currentScreen === screens.length - 1}
        showSkip={currentScreen < screens.length - 1}
      />
    </Animated.View>
  );
};

// Welcome Screen Content
const WelcomeContent: React.FC<{ theme: any }> = ({ theme }) => {
  const styles = createContentStyles(theme);

  return (
    <View style={styles.contentContainer}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📜</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Sacred Shlokas</Text>
            <Text style={styles.featureDescription}>
              Explore timeless wisdom from the Bhagavad Gita, Ramayana, and more
            </Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🕉️</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Daily Learning</Text>
            <Text style={styles.featureDescription}>
              Build a daily practice of reading and reflection
            </Text>
          </View>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💬</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>AI Guidance</Text>
            <Text style={styles.featureDescription}>
              Ask questions and get insights from our AI assistant
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Swipe Tutorial Content
const SwipeTutorialContent: React.FC<{ theme: any }> = ({ theme }) => {
  const styles = createContentStyles(theme);

  return (
    <View style={styles.contentContainer}>
      <View style={styles.swipeDemo}>
        <View style={styles.cardDemo}>
          <Text style={styles.cardDemoText}>📜</Text>
          <Text style={styles.cardDemoLabel}>Shloka Card</Text>
        </View>
        <View style={styles.arrowsContainer}>
          <View style={styles.arrowGroup}>
            <Text style={styles.arrowIcon}>←</Text>
            <Text style={styles.arrowLabel}>Swipe Left</Text>
            <Text style={styles.arrowDescription}>Save to Favorites</Text>
          </View>
          <View style={styles.arrowGroup}>
            <Text style={styles.arrowIcon}>→</Text>
            <Text style={styles.arrowLabel}>Swipe Right</Text>
            <Text style={styles.arrowDescription}>Mark as Read</Text>
          </View>
        </View>
      </View>
      <View style={styles.tipContainer}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>
          Tap on any section to expand and read detailed explanations, word-by-word meanings, and more!
        </Text>
      </View>
    </View>
  );
};

// Gamification Content
const GamificationContent: React.FC<{ theme: any }> = ({ theme }) => {
  const styles = createContentStyles(theme);

  return (
    <View style={styles.contentContainer}>
      <View style={styles.gamificationGrid}>
        <View style={styles.gamificationCard}>
          <Text style={styles.gamificationIcon}>⭐</Text>
          <Text style={styles.gamificationTitle}>Earn XP</Text>
          <Text style={styles.gamificationDescription}>
            Gain experience points for every shloka you read
          </Text>
        </View>
        <View style={styles.gamificationCard}>
          <Text style={styles.gamificationIcon}>🔥</Text>
          <Text style={styles.gamificationTitle}>Build Streaks</Text>
          <Text style={styles.gamificationDescription}>
            Read daily to maintain your streak and unlock bonuses
          </Text>
        </View>
        <View style={styles.gamificationCard}>
          <Text style={styles.gamificationIcon}>📖</Text>
          <Text style={styles.gamificationTitle}>Level Up</Text>
          <Text style={styles.gamificationDescription}>
            Progress through levels as you learn and grow
          </Text>
        </View>
        <View style={styles.gamificationCard}>
          <Text style={styles.gamificationIcon}>🏆</Text>
          <Text style={styles.gamificationTitle}>Achievements</Text>
          <Text style={styles.gamificationDescription}>
            Unlock achievements for milestones and special accomplishments
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  animatedContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingTop: 16,
    paddingBottom: 8,
  },
  skipText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.heading,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  navigation: {
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

const createContentStyles = (theme: any) => StyleSheet.create({
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  featureList: {
    width: '100%',
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  swipeDemo: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  cardDemo: {
    width: SCREEN_WIDTH * 0.7,
    height: 200,
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: theme.primary + '30',
  },
  cardDemoText: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardDemoLabel: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  arrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  arrowGroup: {
    alignItems: 'center',
    flex: 1,
  },
  arrowIcon: {
    fontSize: 48,
    color: theme.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  arrowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  arrowDescription: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: theme.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: theme.primary + '30',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
  },
  gamificationGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: isSmallDevice ? 'center' : 'space-between',
    gap: 16,
  },
  gamificationCard: {
    width: isSmallDevice 
      ? getResponsiveCardWidth(1, 24, 16) // Single column on small devices
      : getResponsiveCardWidth(2, 24, 16), // Two columns on larger devices
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: isSmallDevice ? 16 : 20,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  gamificationIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  gamificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  gamificationDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

