import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { KnowledgeCard } from './KnowledgeCard';
import { KnowledgeItem } from '../data/mockKnowledge';
import { useTheme } from '../context/ThemeContext';

interface SwipeableCardStackProps {
  data: KnowledgeItem[];
  loading?: boolean;
  error?: string | null;
  onFetchNext?: () => Promise<void>;
  onRefresh?: () => Promise<void>;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 300;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export const SwipeableCardStack: React.FC<SwipeableCardStackProps> = ({
  data,
  loading = false,
  error = null,
  onFetchNext,
  onRefresh,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.9)).current;
  const topCardOpacity = useRef(new Animated.Value(1)).current;
  const isTransitioning = useRef(false);
  
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-25deg', '0deg', '25deg'],
    extrapolate: 'clamp',
  });

  // Opacity based on swipe distance for smoother fade
  const swipeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
    outputRange: [0.3, 1, 0.3],
    extrapolate: 'clamp',
  });

  const nextCard = async () => {
    // Mark that we're transitioning to prevent glitches
    isTransitioning.current = true;
    
    // Reset animation values synchronously BEFORE state update
    // This ensures the new top card starts with correct initial values
    position.setValue({ x: 0, y: 0 });
    nextCardScale.setValue(0.95);
    nextCardOpacity.setValue(0.9);
    topCardOpacity.setValue(1);
    
    // Update state immediately after resetting values
    // The values are set synchronously, so they'll be correct when React renders
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      
      // If we're near the end and have onFetchNext, fetch more
      if (newIndex >= data.length - 2 && onFetchNext && !isFetchingNext) {
        setIsFetchingNext(true);
        onFetchNext()
          .catch((err) => {
            console.error('Error fetching next shloka:', err);
          })
          .finally(() => {
            setIsFetchingNext(false);
          });
      }
      
      // Reset transition flag after state update completes
      setTimeout(() => {
        isTransitioning.current = false;
      }, 0);
      
      return newIndex;
    });
  };

  const swipeCard = (direction: 'left' | 'right', velocity?: number) => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    
    // Calculate duration based on velocity for smoother feel
    const baseDuration = SWIPE_OUT_DURATION;
    const velocityMultiplier = velocity ? Math.min(Math.abs(velocity) / 1000, 1) : 1;
    const duration = baseDuration * (1 - velocityMultiplier * 0.3);
    
    // Animate top card out and next card in simultaneously with smooth easing
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: Math.max(duration, 200),
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(topCardOpacity, {
        toValue: 0,
        duration: Math.max(duration, 200),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(nextCardScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
          velocity: 0,
        }),
        Animated.timing(nextCardOpacity, {
          toValue: 1,
          duration: Math.max(duration, 200),
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]),
    ]).start(() => {
      nextCard();
    });
  };

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(topCardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Memoize visible cards to prevent unnecessary recalculations
  // MUST be called before any early returns to follow Rules of Hooks
  const visibleCards = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    const cards = [];
    // Only get top card and next card to prevent glitches
    for (let i = 0; i < 2; i++) {
      const index = (currentIndex + i) % data.length;
      cards.push({ item: data[index], index });
    }
    return cards;
  }, [currentIndex, data]);
  
  // Reverse the array so top card renders last (appears on top)
  const reversedCards = useMemo(() => [...visibleCards].reverse(), [visibleCards]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to clearly horizontal gestures
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;
        const hasHorizontalMovement = Math.abs(gestureState.dx) > 8;
        return isHorizontal && hasHorizontalMovement;
      },
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Aggressively capture horizontal gestures early to prevent child from interfering
        // Use lower threshold to catch horizontal gestures sooner
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;
        const hasHorizontalMovement = Math.abs(gestureState.dx) > 8;
        return isHorizontal && hasHorizontalMovement;
      },
      onPanResponderTerminationRequest: () => {
        // Don't allow termination - we own horizontal gestures
        return false;
      },
      onPanResponderMove: (
        _event: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        // Only track horizontal movement
        position.setValue({ x: gestureState.dx, y: 0 });
      },
      onPanResponderRelease: (
        _event: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        const { dx, dy, vx } = gestureState;
        
        // Only process if gesture was clearly horizontal (matching capture threshold)
        const isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.2;
        if (!isHorizontal) {
          resetPosition();
          return;
        }
        
        const velocity = vx || 0;
        
        // Check velocity first for more responsive feel
        if (Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD) {
          if (velocity > 0) {
            swipeCard('right', velocity);
          } else {
            swipeCard('left', Math.abs(velocity));
          }
        } else if (dx > SWIPE_THRESHOLD) {
          // Swipe right - next card
          swipeCard('right', velocity);
        } else if (dx < -SWIPE_THRESHOLD) {
          // Swipe left - next card
          swipeCard('left', Math.abs(velocity));
        } else {
          // Return to center
          resetPosition();
        }
      },
    }),
  ).current;

  const getCardStyle = (index: number) => {
    const isTopCard = index === currentIndex;
    const isNextCard = index === (currentIndex + 1) % data.length;

    if (isTopCard) {
      return {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate },
        ],
        opacity: Animated.multiply(topCardOpacity, swipeOpacity),
      };
    }

    if (isNextCard) {
      return {
        transform: [{ scale: nextCardScale }],
        opacity: nextCardOpacity,
      };
    }

    // This shouldn't be reached since we only render top and next cards
    return {
      transform: [{ scale: 0.9 }],
      opacity: 0,
      pointerEvents: 'none' as const,
    };
  };

  // Loading state
  if (loading && data.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={dynamicStyles.loadingText}>Loading divine wisdom...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && data.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.errorContainer}>
          <Text style={dynamicStyles.omSymbol}>ॐ</Text>
          <Text style={dynamicStyles.errorTitle}>Unable to load shlokas</Text>
          <Text style={dynamicStyles.errorText}>{error}</Text>
          {onRefresh && (
            <TouchableOpacity style={dynamicStyles.retryButton} onPress={onRefresh}>
              <Text style={dynamicStyles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.cardWrapper}>
          <View style={dynamicStyles.emptyCard}>
            <Text style={dynamicStyles.omSymbol}>ॐ</Text>
            <Text style={dynamicStyles.emptyText}>No shlokas available</Text>
            <Text style={dynamicStyles.emptySubtext}>Pull to refresh</Text>
            {onRefresh && (
              <TouchableOpacity style={dynamicStyles.retryButton} onPress={onRefresh}>
                <Text style={dynamicStyles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      {reversedCards.map(({ item, index: actualIndex }, reverseIndex) => {
        const isTopCard = actualIndex === currentIndex;
        const isNextCard = actualIndex === (currentIndex + 1) % data.length;
        const cardStyle = getCardStyle(actualIndex);

        return (
          <Animated.View
            key={`${item.id}-${actualIndex}`}
            style={[
              dynamicStyles.cardWrapper,
              cardStyle,
            ]}
            {...(isTopCard ? panResponder.panHandlers : {})}
          >
            <KnowledgeCard item={item} />
          </Animated.View>
        );
      })}
      {/* Progress indicator */}
      {data.length > 0 && (
        <View style={dynamicStyles.progressContainer}>
          {data.slice(0, Math.min(data.length, 10)).map((_, index) => (
            <View
              key={index}
              style={[
                dynamicStyles.progressDot,
                index === currentIndex && dynamicStyles.progressDotActive,
              ]}
            />
          ))}
          {data.length > 10 && (
            <Text style={dynamicStyles.progressText}>+{data.length - 10}</Text>
          )}
        </View>
      )}
      
      {/* Loading indicator when fetching next */}
      {isFetchingNext && (
        <View style={dynamicStyles.fetchingIndicator}>
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.secondary + '33', // Secondary color with opacity
  },
  progressDotActive: {
    backgroundColor: theme.secondary,
    width: 24,
  },
  emptyCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    padding: 24,
    borderRadius: 16,
  },
  omSymbol: {
    fontSize: 48,
    color: theme.primary,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textTertiary,
    textAlign: 'center',
    marginBottom: 24,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  errorText: {
    color: theme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressText: {
    color: theme.textTertiary,
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
  fetchingIndicator: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1001,
  },
});

