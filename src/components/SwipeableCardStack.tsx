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
} from 'react-native';
import { KnowledgeCard } from './KnowledgeCard';
import { KnowledgeItem } from '../data/mockKnowledge';

interface SwipeableCardStackProps {
  data: KnowledgeItem[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 300;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export const SwipeableCardStack: React.FC<SwipeableCardStackProps> = ({
  data,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const nextCard = () => {
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
      // Infinite scrolling: loop back to 0 when reaching the end
      const newIndex = (prevIndex + 1) % data.length;
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

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.cardWrapper}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No knowledge items available</Text>
          </View>
        </View>
      </View>
    );
  }

  // Memoize visible cards to prevent unnecessary recalculations
  const visibleCards = useMemo(() => {
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

  return (
    <View style={styles.container}>
      {reversedCards.map(({ item, index: actualIndex }, reverseIndex) => {
        const isTopCard = actualIndex === currentIndex;
        const isNextCard = actualIndex === (currentIndex + 1) % data.length;
        const cardStyle = getCardStyle(actualIndex);

        return (
          <Animated.View
            key={`${item.id}-${actualIndex}`}
            style={[
              styles.cardWrapper,
              cardStyle,
            ]}
            {...(isTopCard ? panResponder.panHandlers : {})}
          >
            <KnowledgeCard item={item} />
          </Animated.View>
        );
      })}
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#E8E8E8',
    width: 24,
  },
  emptyCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
});

