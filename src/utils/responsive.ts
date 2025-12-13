/**
 * Responsive design utilities
 */
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
export const BREAKPOINTS = {
  small: 375,   // iPhone SE, small Android phones
  medium: 414,  // iPhone 11 Pro Max, larger Android phones
  large: 768,   // Tablets
};

// Check if device is small
export const isSmallDevice = SCREEN_WIDTH < BREAKPOINTS.small;

// Check if device is tablet
export const isTablet = SCREEN_WIDTH >= BREAKPOINTS.large;

// Responsive width percentage
export const responsiveWidth = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

// Responsive font size (scales with screen width)
export const responsiveFontSize = (size: number): number => {
  const scale = SCREEN_WIDTH / 375; // Base width is iPhone 8/SE
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive padding
export const responsivePadding = (base: number): number => {
  if (isSmallDevice) {
    return base * 0.8; // Reduce padding on small devices
  }
  if (isTablet) {
    return base * 1.2; // Increase padding on tablets
  }
  return base;
};

// Get responsive card width (for grids)
export const getResponsiveCardWidth = (
  columns: number,
  padding: number = 20,
  gap: number = 12
): number => {
  const totalPadding = padding * 2;
  const totalGap = gap * (columns - 1);
  return (SCREEN_WIDTH - totalPadding - totalGap) / columns;
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };

