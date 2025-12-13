/**
 * Skeleton loading component for better perceived performance
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        createStyles(theme).skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  showIcon?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showIcon = false,
  showTitle = true,
  showSubtitle = true,
  lines = 2,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  return (
    <View style={dynamicStyles.card}>
      {showIcon && (
        <Skeleton width={40} height={40} borderRadius={20} style={dynamicStyles.icon} />
      )}
      <View style={dynamicStyles.content}>
        {showTitle && <Skeleton width="60%" height={16} style={dynamicStyles.title} />}
        {showSubtitle && <Skeleton width="40%" height={12} style={dynamicStyles.subtitle} />}
        {lines > 0 && (
          <View style={dynamicStyles.lines}>
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                width={index === lines - 1 ? '80%' : '100%'}
                height={12}
                style={dynamicStyles.line}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export const SkeletonStatCard: React.FC = () => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);

  return (
    <View style={dynamicStyles.statCard}>
      <Skeleton width={24} height={24} borderRadius={12} style={dynamicStyles.statIcon} />
      <Skeleton width="60%" height={28} style={dynamicStyles.statValue} />
      <Skeleton width="80%" height={14} style={dynamicStyles.statTitle} />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  skeleton: {
    backgroundColor: theme.border,
  },
  card: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 12,
  },
  lines: {
    gap: 8,
  },
  line: {
    marginBottom: 4,
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
    marginBottom: 8,
  },
  statValue: {
    marginBottom: 8,
  },
  statTitle: {
    marginTop: 4,
  },
});

