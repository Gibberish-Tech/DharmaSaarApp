/**
 * Error handling utilities for better user experience
 */
import NetInfo from '@react-native-community/netinfo';

export interface ErrorInfo {
  message: string;
  userFriendlyMessage: string;
  isNetworkError: boolean;
  isOffline: boolean;
  statusCode?: number;
  canRetry: boolean;
}

/**
 * Check if device is online
 */
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.warn('Failed to check network status:', error);
    return false; // Assume offline if check fails
  }
};

/**
 * Get user-friendly error message from error
 */
export const getUserFriendlyError = (error: any): ErrorInfo => {
  const errorMessage = error?.message || String(error) || 'An unknown error occurred';
  
  // Network errors
  if (
    errorMessage.includes('Network request failed') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('TypeError: Network request failed')
  ) {
    return {
      message: errorMessage,
      userFriendlyMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      isNetworkError: true,
      isOffline: false,
      canRetry: true,
    };
  }

  // Timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('Request timeout') ||
    errorMessage.includes('AbortError')
  ) {
    return {
      message: errorMessage,
      userFriendlyMessage: 'The request took too long. Please check your connection and try again.',
      isNetworkError: true,
      isOffline: false,
      canRetry: true,
    };
  }

  // HTTP status code errors
  const statusMatch = errorMessage.match(/HTTP (\d+)/);
  if (statusMatch) {
    const statusCode = parseInt(statusMatch[1], 10);
    
    switch (statusCode) {
      case 400:
        return {
          message: errorMessage,
          userFriendlyMessage: 'Invalid request. Please check your input and try again.',
          isNetworkError: false,
          isOffline: false,
          statusCode: 400,
          canRetry: false,
        };
      case 401:
        return {
          message: errorMessage,
          userFriendlyMessage: 'Your session has expired. Please sign in again.',
          isNetworkError: false,
          isOffline: false,
          statusCode: 401,
          canRetry: false,
        };
      case 403:
        return {
          message: errorMessage,
          userFriendlyMessage: 'You don\'t have permission to perform this action.',
          isNetworkError: false,
          isOffline: false,
          statusCode: 403,
          canRetry: false,
        };
      case 404:
        return {
          message: errorMessage,
          userFriendlyMessage: 'The requested resource was not found.',
          isNetworkError: false,
          isOffline: false,
          statusCode: 404,
          canRetry: false,
        };
      case 429:
        return {
          message: errorMessage,
          userFriendlyMessage: 'Too many requests. Please wait a moment and try again.',
          isNetworkError: false,
          isOffline: false,
          statusCode: 429,
          canRetry: true,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          message: errorMessage,
          userFriendlyMessage: 'The server is experiencing issues. Please try again in a moment.',
          isNetworkError: false,
          isOffline: false,
          statusCode,
          canRetry: true,
        };
      default:
        return {
          message: errorMessage,
          userFriendlyMessage: `An error occurred (${statusCode}). Please try again.`,
          isNetworkError: false,
          isOffline: false,
          statusCode,
          canRetry: statusCode >= 500,
        };
    }
  }

  // Generic error
  return {
    message: errorMessage,
    userFriendlyMessage: errorMessage.length > 100 
      ? 'Something went wrong. Please try again.' 
      : errorMessage,
    isNetworkError: false,
    isOffline: false,
    canRetry: true,
  };
};

/**
 * Calculate exponential backoff delay
 */
export const calculateBackoffDelay = (attempt: number, baseDelay: number = 1000): number => {
  // Exponential backoff: baseDelay * 2^attempt, with max of 10 seconds
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, 10000);
};

/**
 * Wait for network connection
 */
export const waitForNetwork = async (maxWaitTime: number = 10000): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const isConnected = await checkNetworkStatus();
    if (isConnected) {
      return true;
    }
    // Wait 500ms before checking again
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
  }
  
  return false;
};

