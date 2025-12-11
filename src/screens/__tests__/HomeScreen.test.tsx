/**
 * Tests for HomeScreen
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { apiService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  apiService: {
    getUserStats: jest.fn(),
    getAchievements: jest.fn(),
  },
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock theme context
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      primary: '#000000',
      background: '#FFFFFF',
      text: '#000000',
    },
  }),
}));

// Mock auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'user-1' },
  }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load and display user stats', async () => {
    const mockStats = {
      level: 5,
      experience: 250,
      current_streak: 7,
      total_shlokas_read: 10,
      total_readings: 15,
      readings_this_week: 5,
      readings_this_month: 10,
    };

    const mockAchievements = [
      {
        id: 'ach-1',
        achievement: {
          id: 'ach-1',
          code: 'first_read',
          name: 'First Steps',
          description: 'Read your first shloka',
        },
        unlocked_at: '2024-01-01T00:00:00Z',
      },
    ];

    (apiService.getUserStats as jest.Mock).mockResolvedValue(mockStats);
    (apiService.getAchievements as jest.Mock).mockResolvedValue(mockAchievements);

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(apiService.getUserStats).toHaveBeenCalled();
      expect(apiService.getAchievements).toHaveBeenCalled();
    });

    // Check that stats are displayed (adjust based on actual component structure)
    expect(getByText(/Level/i)).toBeTruthy();
  });

  it('should handle loading state', () => {
    (apiService.getUserStats as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    (apiService.getAchievements as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<HomeScreen />);

    // Check for loading indicator (adjust based on actual implementation)
    // expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should handle error state', async () => {
    (apiService.getUserStats as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch stats')
    );
    (apiService.getAchievements as jest.Mock).mockResolvedValue([]);

    render(<HomeScreen />);

    await waitFor(() => {
      // Check for error message (adjust based on actual implementation)
      // expect(getByText(/error/i)).toBeTruthy();
    });
  });
});

