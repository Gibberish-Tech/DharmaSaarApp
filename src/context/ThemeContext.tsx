/**
 * Theme Context - Manages light and dark theme for the app
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  cardBackground: string;
  surface: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  sanskritText: string;
  
  // Accent colors
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  
  // UI elements
  border: string;
  divider: string;
  shadow: string;
  
  // Special
  avatarBackground: string;
  activeTabBackground: string;
}

const lightTheme: ThemeColors = {
  background: '#FFF8F0',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#2A1F1A',
  textSecondary: '#6B5B4F',
  textTertiary: '#9B8A7F',
  sanskritText: '#8B2E3D',
  primary: '#FF8C42',
  primaryLight: '#FFB366',
  secondary: '#8B2E3D',
  secondaryLight: '#A64D5C',
  border: '#F5E6D3',
  divider: '#E8E0D6',
  shadow: '#8B2E3D',
  avatarBackground: '#FF8C42',
  activeTabBackground: '#FFF5E6',
};

const darkTheme: ThemeColors = {
  background: '#1A1512',
  cardBackground: '#2A1F1A',
  surface: '#2A1F1A',
  text: '#F5E6D3',
  textSecondary: '#D4C4B0',
  textTertiary: '#9B8A7F',
  sanskritText: '#FF8C42',
  primary: '#FF8C42',
  primaryLight: '#FFB366',
  secondary: '#A64D5C',
  secondaryLight: '#C46B7A',
  border: '#3A2F2A',
  divider: '#3A2F2A',
  shadow: '#000000',
  avatarBackground: '#FF8C42',
  activeTabBackground: '#3A2F2A',
};

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@sanatan_app_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  // Don't render children until theme is loaded to avoid flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

