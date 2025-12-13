import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { KnowledgeCard } from './KnowledgeCard';
import { KnowledgeItem } from '../data/mockKnowledge';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { hasSeenSwipeHint, markSwipeHintAsSeen } from '../utils/onboardingStorage';
import { ErrorDisplay } from './ErrorDisplay';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

// Haptic feedback helper
const triggerHaptic = () => {
  try {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    ReactNativeHapticFeedback.trigger('impactMedium', options);
  } catch (error) {
    // Silently fail - haptics are optional
    console.warn('Haptic feedback not available:', error);
  }
};

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
  const { isAuthenticated } = useAuth();
  const dynamicStyles = createStyles(theme);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.9)).current;
  const topCardOpacity = useRef(new Animated.Value(1)).current;
  const isTransitioning = useRef(false);
  const swipeHintOpacity = useRef(new Animated.Value(0)).current;
  const swipeHintScale = useRef(new Animated.Value(0.9)).current;
  
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

  // Animation for "Read" text (swipe right)
  const readTextOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, SCREEN_WIDTH * 0.5],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  
  const readTextScale = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, SCREEN_WIDTH * 0.5],
    outputRange: [0.8, 0.9, 1],
    extrapolate: 'clamp',
  });

  // Animation for "Saving to Favorites" text (swipe left)
  const savingToFavoritesTextOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.5, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  
  const savingToFavoritesTextScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.5, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.9, 0.8],
    extrapolate: 'clamp',
  });

  // Check if user has seen swipe hint on mount
  useEffect(() => {
    const checkSwipeHint = async () => {
      const hasSeen = await hasSeenSwipeHint();
      if (!hasSeen && data.length > 0 && currentIndex === 0) {
        // Show hint after a short delay
        setTimeout(() => {
          setShowSwipeHint(true);
          Animated.parallel([
            Animated.timing(swipeHintOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease),
            }),
            Animated.spring(swipeHintScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }),
          ]).start();
        }, 1000);
      }
    };
    checkSwipeHint();
  }, [data.length, currentIndex, swipeHintOpacity, swipeHintScale]);

  // Hide hint when user starts swiping
  useEffect(() => {
    const listener = position.x.addListener(({ value }) => {
      if (showSwipeHint && Math.abs(value) > 10) {
        // User started swiping, hide hint
        Animated.parallel([
          Animated.timing(swipeHintOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(swipeHintScale, {
            toValue: 0.9,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSwipeHint(false);
          markSwipeHintAsSeen();
        });
      }
    });

    return () => {
      position.x.removeListener(listener);
    };
  }, [showSwipeHint, position.x, swipeHintOpacity, swipeHintScale]);

  const resetPosition = useCallback(() => {
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
  }, [position, topCardOpacity]);

  const nextCard = useCallback(async () => {
    // Log the reading of the current card before moving to next
    if (isAuthenticated && data[currentIndex]) {
      const currentShloka = data[currentIndex];
      // Log as 'summary' by default (we can enhance this later to detect if user viewed detailed)
      if (currentShloka.id) {
        apiService.logReading(currentShloka.id, 'summary').catch((err) => {
          // Silently fail - don't interrupt user experience
          console.warn('Failed to log reading:', err);
        });
      }
    }
    
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
  }, [data, currentIndex, onFetchNext, isFetchingNext, isAuthenticated, position, nextCardScale, nextCardOpacity, topCardOpacity]);

  const swipeCard = useCallback((direction: 'left' | 'right', velocity?: number) => {
    // Early return if no data or invalid index
    if (!data || data.length === 0 || currentIndex < 0 || currentIndex >= data.length) {
      console.warn('[SwipeableCardStack] ⚠️ Cannot swipe - no valid data:', {
        dataLength: data?.length || 0,
        currentIndex,
      });
      resetPosition();
      return;
    }

    // Hide swipe hint if visible
    if (showSwipeHint) {
      Animated.parallel([
        Animated.timing(swipeHintOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(swipeHintScale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSwipeHint(false);
        markSwipeHintAsSeen();
      });
    }

    // Haptic feedback (optional enhancement)
    triggerHaptic();
    
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    
    // Get current shloka - we know it exists because of the check above
    const currentShloka = data[currentIndex];
    const shlokaId = currentShloka?.id;
    
    // Handle swipe actions based on direction
    if (shlokaId) {
      if (direction === 'right') {
        // Swipe right = mark as read
        if (isAuthenticated) {
          apiService.markShlokaAsRead(shlokaId, true)
            .then((result) => {
              console.log('[SwipeableCardStack] ✅ Successfully marked shloka as read:', result);
            })
            .catch((err) => {
              // Log error but don't interrupt user experience
              console.error('[SwipeableCardStack] ❌ Failed to mark shloka as read:', err);
            });
        }
      } else {
        // Swipe left = add to favorites
        if (isAuthenticated) {
          apiService.addFavorite(shlokaId)
            .then((result) => {
              console.log('[SwipeableCardStack] ✅ Successfully added shloka to favorites:', result);
              // Show success feedback (non-intrusive - just log, user can see the "Saving to Favorites" indicator)
            })
            .catch((err) => {
              // Show error alert if favorite addition fails
              console.error('[SwipeableCardStack] ❌ Failed to add shloka to favorites:', err);
              const errorMessage = err instanceof Error ? err.message : 'Failed to add to favorites';
              Alert.alert(
                'Unable to Save Favorite',
                errorMessage + '. Please try again later.',
                [{ text: 'OK' }]
              );
            });
        } else {
          // User is not authenticated - show message
          Alert.alert(
            'Sign In Required',
            'Please sign in to save shlokas to your favorites.',
            [{ text: 'OK' }]
          );
        }
      }
    }
    
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
  }, [data, currentIndex, resetPosition, position, topCardOpacity, nextCardScale, nextCardOpacity, isAuthenticated, nextCard, showSwipeHint, swipeHintOpacity, swipeHintScale]);

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

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Don't respond if no data
        if (!data || data.length === 0 || currentIndex < 0 || currentIndex >= data.length) {
          return false;
        }
        // Only respond to clearly horizontal gestures
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;
        const hasHorizontalMovement = Math.abs(gestureState.dx) > 8;
        return isHorizontal && hasHorizontalMovement;
      },
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Don't respond if no data
        if (!data || data.length === 0 || currentIndex < 0 || currentIndex >= data.length) {
          return false;
        }
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
        // Don't process swipe if no valid data
        if (!data || data.length === 0 || currentIndex < 0 || currentIndex >= data.length) {
          resetPosition();
          return;
        }
        
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
          // Swipe right - mark as read and go to next card
          swipeCard('right', velocity);
        } else if (dx < -SWIPE_THRESHOLD) {
          // Swipe left - add to favorites and go to next card
          swipeCard('left', Math.abs(velocity));
        } else {
          // Return to center
          resetPosition();
        }
      },
    }),
    [data, currentIndex, position, resetPosition, swipeCard]
  );

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
          <ErrorDisplay
            error={error}
            onRetry={onRefresh}
            showRetry={!!onRefresh}
          />
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
      {reversedCards.map(({ item, index: actualIndex }) => {
        const isTopCard = actualIndex === currentIndex;
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
      
      {/* Swipe indicators - centered on screen, only show when top card exists */}
      {data.length > 0 && (
        <>
          {/* "Read" indicator - appears when swiping right */}
          <Animated.View
            style={[
              dynamicStyles.swipeIndicator,
              dynamicStyles.readIndicator,
              {
                opacity: readTextOpacity,
                transform: [
                  { translateX: -80 }, // Center horizontally (half of minWidth)
                  { scale: readTextScale },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Text style={dynamicStyles.swipeIndicatorText}>Read</Text>
          </Animated.View>
          
          {/* "Saving to Favorites" indicator - appears when swiping left */}
          <Animated.View
            style={[
              dynamicStyles.swipeIndicator,
              dynamicStyles.stillReadingIndicator,
              {
                opacity: savingToFavoritesTextOpacity,
                transform: [
                  { translateX: -100 }, // Center horizontally (accounting for longer text)
                  { scale: savingToFavoritesTextScale },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <Text style={dynamicStyles.swipeIndicatorText}>Saving to Favorites</Text>
          </Animated.View>
        </>
      )}
      
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

      {/* Swipe Hint - Shows on first card for first-time users */}
      {showSwipeHint && currentIndex === 0 && (
        <Animated.View
          style={[
            dynamicStyles.swipeHintContainer,
            {
              opacity: swipeHintOpacity,
              transform: [{ scale: swipeHintScale }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={dynamicStyles.swipeHintContent}>
            <View style={dynamicStyles.swipeHintRow}>
              <View style={dynamicStyles.swipeHintDirection}>
                <Text style={dynamicStyles.swipeHintArrow}>←</Text>
                <Text style={dynamicStyles.swipeHintText}>Favorite</Text>
              </View>
              <View style={dynamicStyles.swipeHintDivider} />
              <View style={dynamicStyles.swipeHintDirection}>
                <Text style={dynamicStyles.swipeHintText}>Read</Text>
                <Text style={dynamicStyles.swipeHintArrow}>→</Text>
              </View>
            </View>
            <Text style={dynamicStyles.swipeHintSubtext}>Swipe to interact</Text>
          </View>
        </Animated.View>
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
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
    maxWidth: 200,
  },
  readIndicator: {
    backgroundColor: '#10B981' + 'E6', // Green with opacity
    borderColor: '#10B981',
  },
  stillReadingIndicator: {
    backgroundColor: '#F59E0B' + 'E6', // Amber/Orange with opacity
    borderColor: '#F59E0B',
  },
  swipeIndicatorText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  swipeHintContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    zIndex: 1002,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeHintContent: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: theme.primary + '40',
  },
  swipeHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  swipeHintDirection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swipeHintArrow: {
    fontSize: 24,
    color: theme.primary,
    fontWeight: '700',
  },
  swipeHintText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  swipeHintDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.border,
  },
  swipeHintSubtext: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

