/**
 * API Configuration
 * 
 * For React Native development:
 * - iOS Simulator: Use 'http://localhost:8000'
 * - Android Emulator: Use 'http://10.0.2.2:8000' (Android emulator's special alias for host machine)
 * - Physical Device: Use your computer's IP address (e.g., 'http://192.168.1.100:8000')
 * 
 * To find your IP address:
 * - macOS/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
 * - Windows: `ipconfig` (look for IPv4 Address)
 */

import { Platform } from 'react-native';

// Get the appropriate development URL based on platform
const getDevelopmentUrl = (): string => {
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    return 'http://10.0.2.2:8000';
  }
  // iOS Simulator and others can use localhost
  return 'http://localhost:8000';
};

// Default API configuration
const API_CONFIG = {
  // Development API URL - automatically detects platform
  // - iOS Simulator: 'http://localhost:8000'
  // - Android Emulator: 'http://10.0.2.2:8000' (automatically set)
  // - Physical Device: You may need to manually set your computer's IP address
  //   Find your IP: macOS/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
  //                 Windows: `ipconfig` (look for IPv4 Address)
  development: __DEV__ ? getDevelopmentUrl() : 'http://localhost:8000',
  
  // Production API URL - update this when deploying
  production: 'https://your-production-api.com',
  
  // Timeout for API requests (in milliseconds)
  timeout: 30000, // 30 seconds
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 1000, // 1 second
  },
};

// Get the appropriate API URL based on environment
export const getApiBaseUrl = (): string => {
  if (__DEV__) {
    return API_CONFIG.development;
  }
  return API_CONFIG.production;
};

// Export configuration
export const apiConfig = {
  baseUrl: getApiBaseUrl(),
  timeout: API_CONFIG.timeout,
  retry: API_CONFIG.retry,
};

// Helper to check if we're in development mode
export const isDevelopment = __DEV__;

