/**
 * Floating Tab Bar with Animations
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 70;
const FLOATING_MARGIN = 16;

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const dynamicStyles = createStyles(theme);
  
  const scaleAnimations = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  const tabBarOpacity = useRef(new Animated.Value(0)).current;
  const tabBarScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in and scale up animation on mount
    Animated.parallel([
      Animated.timing(tabBarOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(tabBarScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, []);

  const handleTabPress = (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      // Animate the pressed tab
      Animated.sequence([
        Animated.spring(scaleAnimations[index], {
          toValue: 0.85,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(scaleAnimations[index], {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start();

      navigation.navigate(route.name);
    }
  };

  return (
    <Animated.View
      style={[
        dynamicStyles.tabBarContainer,
        {
          opacity: tabBarOpacity,
          transform: [
            {
              translateY: tabBarOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
            {
              scale: tabBarScale,
            },
          ],
        },
      ]}
    >
      <View style={dynamicStyles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const labelValue =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          
          // Handle label - it can be a string or a function
          const label = typeof labelValue === 'function'
            ? labelValue({ focused: state.index === index, color: state.index === index ? theme.primary : theme.textTertiary, position: 'below-icon' as any, children: route.name })
            : labelValue;

          const isFocused = state.index === index;

          const icon = options.tabBarIcon
            ? options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? theme.primary : theme.textTertiary,
                size: 24,
              })
            : null;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => handleTabPress(route, index)}
              style={dynamicStyles.tab}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  dynamicStyles.tabContent,
                  {
                    transform: [{ scale: scaleAnimations[index] }],
                  },
                ]}
              >
                <Animated.View
                  style={[
                    dynamicStyles.iconContainer,
                    isFocused && dynamicStyles.iconContainerActive,
                    {
                      transform: [
                        {
                          scale: isFocused
                            ? scaleAnimations[index].interpolate({
                                inputRange: [0.85, 1],
                                outputRange: [1.05, 1.1],
                              })
                            : 1,
                        },
                      ],
                    },
                  ]}
                >
                  {icon}
                </Animated.View>
                <Text
                  style={[
                    dynamicStyles.label,
                    isFocused && dynamicStyles.labelActive,
                  ]}
                >
                  {label}
                </Text>
                {isFocused && (
                  <Animated.View
                    style={[
                      dynamicStyles.activeIndicator,
                      {
                        opacity: scaleAnimations[index].interpolate({
                          inputRange: [0.85, 1],
                          outputRange: [0.7, 1],
                        }),
                      },
                    ]}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: FLOATING_MARGIN,
    left: FLOATING_MARGIN,
    right: FLOATING_MARGIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.cardBackground,
    borderRadius: 24,
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: theme.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: theme.activeTabBackground,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.textTertiary,
    marginTop: 2,
  },
  labelActive: {
    color: theme.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.primary,
  },
});

