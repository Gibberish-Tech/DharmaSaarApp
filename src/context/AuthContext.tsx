/**
 * Auth Context - Manages user authentication state and tokens
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = '@dharmasaar_tokens';
const USER_STORAGE_KEY = '@dharmasaar_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear auth state function - defined early so it can be used in useEffect
  const clearAuthState = useCallback(async () => {
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
  }, []);

  // Load auth state from storage on mount and validate/refresh tokens
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
          
          // Set tokens and user temporarily
          setTokens(parsedTokens);
          setUser(parsedUser);
          apiService.setAccessToken(parsedTokens.access);
          
          // Validate and refresh token if refresh token exists
          if (parsedTokens.refresh) {
            try {
              // Attempt to refresh the access token to validate it's still valid
              const tokenResponse = await apiService.refreshToken(parsedTokens.refresh);
              const updatedTokens: AuthTokens = {
                access: tokenResponse.access,
                refresh: tokenResponse.refresh || parsedTokens.refresh,
              };
              await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(updatedTokens));
              setTokens(updatedTokens);
              apiService.setAccessToken(tokenResponse.access);
            } catch {
              // If refresh fails, clear auth state (token expired or invalid)
              console.log('Token refresh failed on app start, clearing auth state');
              await clearAuthState();
            }
          } else {
            // No refresh token, clear auth state
            await clearAuthState();
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear corrupted data
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
          AsyncStorage.removeItem(USER_STORAGE_KEY),
        ]);
        setUser(null);
        setTokens(null);
        apiService.setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, [clearAuthState]);

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

  const refreshAccessToken = useCallback(async () => {
    // Get the latest tokens from storage to ensure we have the most up-to-date refresh token
    try {
      const storedTokens = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedTokens) {
        throw new Error('No refresh token available');
      }
      
      const parsedTokens: AuthTokens = JSON.parse(storedTokens);
      if (!parsedTokens.refresh) {
        throw new Error('No refresh token available');
      }

      const tokenResponse = await apiService.refreshToken(parsedTokens.refresh);
      // Update tokens - use new refresh token if provided (when rotation is enabled), otherwise keep the old one
      const updatedTokens: AuthTokens = {
        access: tokenResponse.access,
        refresh: tokenResponse.refresh || parsedTokens.refresh, // Use new refresh token if provided, otherwise keep existing
      };
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(updatedTokens));
      setTokens(updatedTokens);
      apiService.setAccessToken(tokenResponse.access);
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await clearAuthState();
      throw error;
    }
  }, [clearAuthState]); // Include clearAuthState in deps

  const refreshUser = useCallback(async () => {
    // Refresh user data from storage (after profile update, etc.)
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  // Set up token refresh callback for automatic token refresh on 401 errors
  useEffect(() => {
    // Register the refresh callback with the API service
    apiService.setRefreshTokenCallback(refreshAccessToken);
    
    // Cleanup: remove callback on unmount
    return () => {
      apiService.setRefreshTokenCallback(null);
    };
  }, [refreshAccessToken]);

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens,
    isLoading,
    login,
    signup,
    logout,
    refreshAccessToken,
    refreshUser,
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

