/**
 * Utility for tracking onboarding and first-time user states
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  HAS_SEEN_SWIPE_HINT: '@dharmasaar_has_seen_swipe_hint',
  HAS_COMPLETED_ONBOARDING: '@dharmasaar_has_completed_onboarding',
  HAS_SEEN_COLLAPSIBLE_HINT: '@dharmasaar_has_seen_collapsible_hint',
};

/**
 * Check if user has seen the swipe gesture hint
 */
export const hasSeenSwipeHint = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_SWIPE_HINT);
    return value === 'true';
  } catch (error) {
    console.error('Error checking swipe hint status:', error);
    return false;
  }
};

/**
 * Mark swipe hint as seen
 */
export const markSwipeHintAsSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_SWIPE_HINT, 'true');
  } catch (error) {
    console.error('Error marking swipe hint as seen:', error);
  }
};

/**
 * Check if user has completed onboarding
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const markOnboardingAsCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
  } catch (error) {
    console.error('Error marking onboarding as completed:', error);
  }
};

/**
 * Check if user has seen collapsible section hint
 */
export const hasSeenCollapsibleHint = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_COLLAPSIBLE_HINT);
    return value === 'true';
  } catch (error) {
    console.error('Error checking collapsible hint status:', error);
    return false;
  }
};

/**
 * Mark collapsible hint as seen
 */
export const markCollapsibleHintAsSeen = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_COLLAPSIBLE_HINT, 'true');
  } catch (error) {
    console.error('Error marking collapsible hint as seen:', error);
  }
};

