/**
 * Auth Context - Manages user authentication state and tokens
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = '@sanatan_app_tokens';
const USER_STORAGE_KEY = '@sanatan_app_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [storedTokens, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(USER_STORAGE_KEY),
        ]);

        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens);
          const parsedUser = JSON.parse(storedUser);
          setTokens(parsedTokens);
          setUser(parsedUser);
          // Update API service with access token
          apiService.setAccessToken(parsedTokens.access);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear corrupted data
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
          AsyncStorage.removeItem(USER_STORAGE_KEY),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const saveAuthState = async (userData: User, tokenData: AuthTokens) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData)),
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData)),
      ]);
      setUser(userData);
      setTokens(tokenData);
      apiService.setAccessToken(tokenData.access);
    } catch (error) {
      console.error('Error saving auth state:', error);
      throw error;
    }
  };

  const clearAuthState = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
        AsyncStorage.removeItem(USER_STORAGE_KEY),
      ]);
      setUser(null);
      setTokens(null);
      apiService.setAccessToken(null);
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      await saveAuthState(response.user, response.tokens);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, passwordConfirm: string) => {
    try {
      const response = await apiService.signup(name, email, password, passwordConfirm);
      await saveAuthState(response.user, response.tokens);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await clearAuthState();
  };

  const refreshAccessToken = async () => {
    if (!tokens?.refresh) {
      throw new Error('No refresh token available');
    }

    try {
      const newAccessToken = await apiService.refreshToken(tokens.refresh);
      const updatedTokens = {
        ...tokens,
        access: newAccessToken,
      };
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(updatedTokens));
      setTokens(updatedTokens);
      apiService.setAccessToken(newAccessToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await clearAuthState();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    signup,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

