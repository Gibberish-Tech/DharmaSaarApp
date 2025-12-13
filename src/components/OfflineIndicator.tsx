/**
 * Offline indicator component - shows when device is offline
 */
import React, { useState, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../context/ThemeContext';

export const OfflineIndicator: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);

      // Animate in/out
      Animated.spring(slideAnim, {
        toValue: offline ? 0 : -100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    });

    // Check initial state
    NetInfo.fetch().then(state => {
      setIsOffline(!state.isConnected);
      if (!state.isConnected) {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        createStyles(theme, insets).container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={createStyles(theme, insets).icon}>📡</Text>
      <Text style={createStyles(theme, insets).text}>No Internet Connection</Text>
    </Animated.View>
  );
};

const createStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? insets.top : 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

