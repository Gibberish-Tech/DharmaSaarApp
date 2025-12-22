/**
 * API service for communicating with the backend
 */
import { apiConfig } from '../config/api';
import { getUserFriendlyError, calculateBackoffDelay, checkNetworkStatus, waitForNetwork } from '../utils/errorHandler';

export interface Shloka {
  id: string; // UUID as string from JSON
  book_name: string;
  chapter_number: number;
  verse_number: number;
  sanskrit_text: string;
  transliteration?: string | null;
  word_by_word?: WordByWordItem[] | null; // Word-by-word breakdown from shloka
  created_at?: string | null; // ISO 8601 datetime string, optional
  updated_at?: string | null; // ISO 8601 datetime string, optional
}

export interface WordByWordItem {
  sanskrit: string;
  transliteration: string;
  meaning: string;
}

export interface ModernExample {
  category: string;
  description: string;
}

export interface Explanation {
  id: string; // UUID as string from JSON
  shloka_id: string; // UUID as string from JSON
  // Structured fields
  summary?: string | null;
  detailed_meaning?: string | null;
  detailed_explanation?: string | null;
  context?: string | null;
  why_this_matters?: string | null;
  modern_examples?: ModernExample[] | null;
  themes?: string[] | null;
  reflection_prompt?: string | null;
  // Quality tracking
  quality_score?: number | null;
  quality_checked_at?: string | null;
  improvement_version?: number | null;
  // Metadata
  ai_model_used?: string | null;
  generation_prompt?: string | null;
  // Computed field (backward compatibility)
  explanation_text?: string | null;
  created_at?: string | null; // ISO 8601 datetime string, optional
  updated_at?: string | null; // ISO 8601 datetime string, optional
}

export interface ShlokaWithExplanation {
  shloka: Shloka;
  explanation?: Explanation;
}

export interface ApiError {
  error: string;
  detail?: string;
}

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshTokenCallback: (() => Promise<void>) | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.baseUrl = apiConfig.baseUrl;
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set a callback function to refresh the access token
   * This will be called automatically when a 401 error is encountered
   */
  setRefreshTokenCallback(callback: (() => Promise<void>) | null): void {
    this.refreshTokenCallback = callback;
  }

  /**
   * Get the current API base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Update the API base URL (useful for switching between environments)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Test connection to the API
   */
  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      // Check network status before making request
      const isOnline = await checkNetworkStatus();
      if (!isOnline && retryCount === 0) {
        // Wait for network connection with timeout
        const networkAvailable = await waitForNetwork(5000);
        if (!networkAvailable) {
          throw new Error('No internet connection. Please check your network settings.');
        }
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

      // Build headers with authentication if token is available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add authorization header if access token is available
      if (this.accessToken) {
        headers.Authorization = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token and retry
        if (response.status === 401 && this.accessToken && this.refreshTokenCallback && retryCount === 0) {
          // Check if we're already refreshing to avoid multiple simultaneous refresh attempts
          if (this.isRefreshing && this.refreshPromise) {
            // Wait for the ongoing refresh to complete
            await this.refreshPromise;
          } else if (!this.isRefreshing) {
            // Start token refresh
            this.isRefreshing = true;
            this.refreshPromise = this.refreshTokenCallback().catch((error) => {
              // If refresh fails, clear the promise so we can try again later
              this.isRefreshing = false;
              this.refreshPromise = null;
              throw error;
            });
            
            try {
              await this.refreshPromise;
              // Refresh successful, retry the original request
              this.isRefreshing = false;
              this.refreshPromise = null;
              return this.request<T>(endpoint, options, retryCount + 1);
            } catch {
              // Refresh failed, throw the original 401 error
              this.isRefreshing = false;
              this.refreshPromise = null;
              // Fall through to return 401 error
            }
          }
        }
        
        const errorData: any = await response.json().catch(() => ({
          error: 'Unknown error',
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        
        // Handle wrapped error response format: { message, data, errors }
        const errorMessage = 
          errorData.errors?.detail || 
          errorData.errors?.error || 
          errorData.detail || 
          errorData.error || 
          errorData.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        
        // Determine if we should retry based on status code
        const shouldRetry = 
          (response.status >= 500 || response.status === 0 || response.status === 429) &&
          retryCount < apiConfig.retry.maxAttempts;
        
        if (shouldRetry) {
          // Use exponential backoff
          const delay = calculateBackoffDelay(retryCount, apiConfig.retry.delay);
          await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        
        // Use user-friendly error message
        const errorInfo = getUserFriendlyError(new Error(errorMessage));
        throw new Error(errorInfo.userFriendlyMessage);
      }

      return await response.json();
    } catch (error) {
      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        const errorInfo = getUserFriendlyError(new Error('Request timeout'));
        throw new Error(errorInfo.userFriendlyMessage);
      }
      
      // If it's already a user-friendly error, re-throw it
      if (error instanceof Error && error.message.includes('No internet connection')) {
        throw error;
      }
      
      // Retry on network errors with exponential backoff
      if (retryCount < apiConfig.retry.maxAttempts) {
        const errorInfo = getUserFriendlyError(error);
        if (errorInfo.canRetry && errorInfo.isNetworkError) {
          const delay = calculateBackoffDelay(retryCount, apiConfig.retry.delay);
          await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
      }
      
      // Use user-friendly error message
      const errorInfo = getUserFriendlyError(error);
      throw new Error(errorInfo.userFriendlyMessage);
    }
  }

  /**
   * Get a random shloka with explanation
   */
  async getRandomShloka(): Promise<ShlokaWithExplanation> {
    const response = await this.request<{
      message: string;
      data: ShlokaWithExplanation;
      errors: any;
    }>('/api/shlokas/random');
    
    // Extract the data field from the wrapped response
    if (response.data) {
      return response.data;
    }
    
    // Fallback: if response is already in the expected format
    return response as unknown as ShlokaWithExplanation;
  }

  /**
   * Get a specific shloka by ID with explanation
   */
  async getShlokaById(shlokaId: string): Promise<ShlokaWithExplanation> {
    const response = await this.request<{
      message: string;
      data: ShlokaWithExplanation;
      errors: any;
    }>(`/api/shlokas/${shlokaId}`);
    
    // Extract the data field from the wrapped response
    if (response.data) {
      return response.data;
    }
    
    // Fallback: if response is already in the expected format
    return response as unknown as ShlokaWithExplanation;
  }

  /**
   * Get a specific shloka by book name, chapter number, and verse number
   */
  async getShlokaByChapterVerse(
    bookName: string,
    chapterNumber: number,
    verseNumber: number
  ): Promise<ShlokaWithExplanation> {
    const response = await this.request<{
      message: string;
      data: ShlokaWithExplanation;
      errors: any;
    }>(`/api/shlokas/by-chapter-verse?book_name=${encodeURIComponent(bookName)}&chapter=${chapterNumber}&verse=${verseNumber}`);
    
    // Extract the data field from the wrapped response
    if (response.data) {
      return response.data;
    }
    
    // Fallback: if response is already in the expected format
    return response as unknown as ShlokaWithExplanation;
  }

  /**
   * User signup
   */
  async signup(
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ): Promise<{ user: { id: string; name: string; email: string; created_at?: string }; tokens: { access: string; refresh: string } }> {
    const response = await this.request<{
      message: string;
      data: {
        user: { id: string; name: string; email: string; created_at?: string };
        tokens: { access: string; refresh: string };
      };
      errors: any;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirm: passwordConfirm,
      }),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Signup failed');
  }

  /**
   * User login
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: { id: string; name: string; email: string; created_at?: string }; tokens: { access: string; refresh: string } }> {
    try {
      const response = await this.request<{
        message: string;
        data: {
          user: { id: string; name: string; email: string; created_at?: string };
          tokens: { access: string; refresh: string };
        };
        errors: any;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.data) {
        return response.data;
      }

      // Extract error message from response
      const errorMessage = response.errors?.detail || 
                          response.errors?.non_field_errors?.[0] ||
                          response.message ||
                          'Invalid email or password. Please try again.';
      throw new Error(errorMessage);
    } catch (error: any) {
      // If it's already a user-friendly error, re-throw it
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, provide a default message
      throw new Error('Invalid email or password. Please try again.');
    }
  }

  /**
   * Refresh access token
   * Returns both access and refresh tokens (refresh token is included when rotation is enabled)
   */
  async refreshToken(refreshToken: string): Promise<{ access: string; refresh?: string }> {
    const response = await this.request<{
      message: string;
      data: {
        access: string;
        refresh?: string; // New refresh token when rotation is enabled
      };
      errors: any;
    }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (response.data?.access) {
      return {
        access: response.data.access,
        refresh: response.data.refresh, // May be undefined if rotation is disabled
      };
    }

    throw new Error(response.errors?.detail || 'Token refresh failed');
  }

  /**
   * Log a reading of a shloka
   */
  async logReading(shlokaId: string, readingType: 'summary' | 'detailed'): Promise<void> {
    const response = await this.request<{
      message: string;
      data: {
        id: string;
        shloka: string;
        reading_type: string;
        read_at: string;
      };
      errors: any;
    }>('/api/reading-logs', {
      method: 'POST',
      body: JSON.stringify({
        shloka_id: shlokaId,
        reading_type: readingType,
      }),
    });

    if (!response.data) {
      throw new Error(response.errors?.detail || 'Failed to log reading');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total_shlokas_read: number;
    total_books_read: number;
    total_readings: number;
    current_streak: number;
    longest_streak: number;
    total_streak_days: number;
    streak_freeze_available: boolean;
    level: number;
    experience: number;
    xp_in_current_level: number;
    xp_for_next_level: number;
    readings_this_week: number;
    readings_this_month: number;
  }> {
    const response = await this.request<{
      message: string;
      data: {
        total_shlokas_read: number;
        total_books_read: number;
        total_readings: number;
        current_streak: number;
        longest_streak: number;
        total_streak_days: number;
        streak_freeze_available: boolean;
        level: number;
        experience: number;
        xp_in_current_level: number;
        xp_for_next_level: number;
        readings_this_week: number;
        readings_this_month: number;
      };
      errors: any;
    }>('/api/user/stats');

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to get user stats');
  }

  /**
   * Get user streak details
   */
  async getUserStreak(): Promise<{
    id: string;
    current_streak: number;
    longest_streak: number;
    streak_freeze_used_this_month: boolean;
    last_streak_date: string | null;
    total_streak_days: number;
    streak_freeze_reset_date: string | null;
    awarded_milestones: number[];
    created_at: string;
    updated_at: string;
  }> {
    const response = await this.request<{
      message: string;
      data: {
        id: string;
        current_streak: number;
        longest_streak: number;
        streak_freeze_used_this_month: boolean;
        last_streak_date: string | null;
        total_streak_days: number;
        streak_freeze_reset_date: string | null;
        awarded_milestones: number[];
        created_at: string;
        updated_at: string;
      };
      errors: any;
    }>('/api/user/streak');

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to get user streak');
  }

  /**
   * Use streak freeze to protect streak from breaking
   */
  async useStreakFreeze(): Promise<{
    freeze_used: boolean;
    freeze_available: boolean;
    current_streak: number;
    message: string;
  }> {
    const response = await this.request<{
      message: string;
      data: {
        freeze_used: boolean;
        freeze_available: boolean;
        current_streak?: number;
      };
      errors: any;
    }>('/api/user/streak/freeze', {
      method: 'POST',
    });

    if (response.data) {
      return {
        ...response.data,
        message: response.message,
        current_streak: response.data.current_streak || 0,
      };
    }

    throw new Error(response.errors?.detail || 'Failed to use streak freeze');
  }

  /**
   * Get streak history and milestones
   */
  async getStreakHistory(): Promise<{
    current_streak: number;
    longest_streak: number;
    total_streak_days: number;
    last_streak_date: string | null;
    milestones_reached: Array<{
      days: number;
      bonus_xp: number;
      name: string;
      message: string;
    }>;
    recent_activity: Array<{
      date: string;
      count: number;
    }>;
  }> {
    const response = await this.request<{
      message: string;
      data: {
        current_streak: number;
        longest_streak: number;
        total_streak_days: number;
        last_streak_date: string | null;
        milestones_reached: Array<{
          days: number;
          bonus_xp: number;
          name: string;
          message: string;
        }>;
        recent_activity: Array<{
          date: string;
          count: number;
        }>;
      };
      errors: any;
    }>('/api/user/streak/history');

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to get streak history');
  }

  /**
   * Get user's favorite shlokas
   */
  async getFavorites(): Promise<Array<{
    id: string;
    shloka: Shloka;
    created_at: string;
  }>> {
    const response = await this.request<{
      message: string;
      data: Array<{
        id: string;
        shloka: Shloka;
        created_at: string;
      }>;
      errors: any;
    }>('/api/favorites');

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to get favorites');
  }

  /**
   * Add a shloka to favorites
   */
  async addFavorite(shlokaId: string): Promise<{
    id: string;
    shloka: Shloka;
    created_at: string;
  }> {
    const response = await this.request<{
      message: string;
      data: {
        id: string;
        shloka: Shloka;
        created_at: string;
      };
      errors: any;
    }>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({
        shloka_id: shlokaId,
      }),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to add favorite');
  }

  /**
   * Remove a shloka from favorites
   */
  async removeFavorite(shlokaId: string): Promise<void> {
    const response = await this.request<{
      message: string;
      data: any;
      errors: any;
    }>(`/api/favorites?shloka_id=${shlokaId}`, {
      method: 'DELETE',
    });

    if (response.errors) {
      throw new Error(response.errors?.detail || 'Failed to remove favorite');
    }
  }

  /**
   * Get user's achievements
   */
  async getAchievements(): Promise<Array<{
    id: string;
    achievement: {
      id: string;
      code: string;
      name: string;
      description: string;
      icon: string;
      condition_type: string;
      condition_value: number;
      xp_reward: number;
    };
    unlocked_at: string;
  }>> {
    const response = await this.request<{
      message: string;
      data: Array<{
        id: string;
        achievement: {
          id: string;
          code: string;
          name: string;
          description: string;
          icon: string;
          condition_type: string;
          condition_value: number;
          xp_reward: number;
        };
        unlocked_at: string;
      }>;
      errors: any;
    }>('/api/achievements');

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to get achievements');
  }

  /**
   * Mark a shloka as read or unmark it
   */
  async markShlokaAsRead(shlokaId: string, marked: boolean = true): Promise<{
    shloka_id: string;
    marked: boolean;
    marked_at?: string;
  }> {
    console.log('[ApiService] markShlokaAsRead called:', { shlokaId, marked, hasToken: !!this.accessToken });
    
    try {
      const response = await this.request<{
        message: string;
        data: {
          shloka_id: string;
          marked: boolean;
          marked_at?: string;
        };
        errors: any;
      }>('/api/shlokas/mark-read', {
        method: 'POST',
        body: JSON.stringify({
          shloka_id: shlokaId,
          marked: marked,
        }),
      });

      console.log('[ApiService] markShlokaAsRead response:', response);

      if (response.data) {
        return response.data;
      }

      throw new Error(response.errors?.detail || 'Failed to mark shloka as read');
    } catch (error) {
      console.error('[ApiService] markShlokaAsRead error:', error);
      throw error;
    }
  }

  /**
   * Get user's chat conversations
   */
  async getConversations(): Promise<Array<{
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
    messages: Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      created_at: string;
    }>;
  }>> {
    const response = await this.request<{
      message: string;
      data: Array<{
        id: string;
        title: string | null;
        created_at: string;
        updated_at: string;
        messages: Array<{
          id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        }>;
      }>;
      errors: any;
    }>('/api/chat/conversations');

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to get conversations');
  }

  /**
   * Send a chat message and get AI response
   */
  async sendChatMessage(
    message: string,
    conversationId?: string
  ): Promise<{
    conversation: {
      id: string;
      title: string | null;
      created_at: string;
      updated_at: string;
      messages: Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        created_at: string;
      }>;
    };
    response: string;
  }> {
    const response = await this.request<{
      message: string;
      data: {
        conversation: {
          id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
          messages: Array<{
            id: string;
            role: 'user' | 'assistant';
            content: string;
            created_at: string;
          }>;
        };
        response: string;
      };
      errors: any;
    }>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId || null,
      }),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to send message');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: { name?: string; email?: string }): Promise<{
    id: string;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
  }> {
    const response = await this.request<{
      message: string;
      data: {
        id: string;
        name: string;
        email: string;
        created_at?: string;
        updated_at?: string;
      };
      errors: any;
    }>('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (response.data) {
      return response.data;
    }

    throw new Error(response.errors?.detail || 'Failed to update profile');
  }

  /**
   * Change user password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await this.request<{
      message: string;
      data: any;
      errors: any;
    }>('/api/user/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (response.data || response.message) {
      return { message: response.message || 'Password changed successfully' };
    }

    throw new Error(response.errors?.detail || 'Failed to change password');
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(): Promise<{ message: string }> {
    const response = await this.request<{
      message: string;
      data: any;
      errors: any;
    }>('/api/user/deactivate-account', {
      method: 'POST',
    });

    if (response.errors) {
      throw new Error(response.errors?.detail || 'Failed to deactivate account');
    }

    return { message: response.message || 'Account deactivated successfully' };
  }

  /**
   * Delete user account (soft or hard delete)
   * @param hardDelete - If true, permanently delete account. If false, soft delete (default: false)
   */
  async deleteAccount(hardDelete: boolean = false): Promise<{ message: string; hard_delete: boolean }> {
    const url = hardDelete 
      ? '/api/user/delete-account?hard=true'
      : '/api/user/delete-account';
    
    const response = await this.request<{
      message: string;
      data: { hard_delete: boolean };
      errors: any;
    }>(url, {
      method: 'DELETE',
    });

    if (response.errors) {
      throw new Error(response.errors?.detail || 'Failed to delete account');
    }

    return {
      message: response.message || 'Account deleted successfully',
      hard_delete: response.data?.hard_delete || hardDelete,
    };
  }

  /**
   * Update a chat conversation (e.g., rename title)
   * @param conversationId - ID of the conversation to update
   * @param title - New title for the conversation
   */
  async updateConversation(
    conversationId: string,
    title: string | null
  ): Promise<{
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
    messages: Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      created_at: string;
    }>;
  }> {
    const response = await this.request<{
      message: string;
      data: {
        id: string;
        title: string | null;
        created_at: string;
        updated_at: string;
        messages: Array<{
          id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        }>;
      };
      errors: any;
    }>(`/api/chat/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });

    if (response.errors) {
      throw new Error(response.errors?.detail || 'Failed to update conversation');
    }

    return response.data;
  }

  /**
   * Delete a chat conversation (soft or hard delete)
   * @param conversationId - ID of the conversation to delete
   * @param hardDelete - If true, permanently delete conversation. If false, soft delete (default: false)
   */
  async deleteConversation(
    conversationId: string,
    hardDelete: boolean = false
  ): Promise<{ message: string; conversation_id: string; hard_delete: boolean }> {
    const url = hardDelete
      ? `/api/chat/conversations/${conversationId}/delete?hard=true`
      : `/api/chat/conversations/${conversationId}/delete`;
    
    const response = await this.request<{
      message: string;
      data: { conversation_id: string; hard_delete: boolean };
      errors: any;
    }>(url, {
      method: 'DELETE',
    });

    if (response.errors) {
      throw new Error(response.errors?.detail || 'Failed to delete conversation');
    }

    return {
      message: response.message || 'Conversation deleted successfully',
      conversation_id: response.data?.conversation_id || conversationId,
      hard_delete: response.data?.hard_delete || hardDelete,
    };
  }

  /**
   * Delete all chat conversations for the user (soft or hard delete)
   * @param hardDelete - If true, permanently delete all conversations. If false, soft delete (default: false)
   */
  async deleteAllConversations(hardDelete: boolean = false): Promise<{ message: string; count: number; hard_delete: boolean }> {
    const url = hardDelete
      ? '/api/chat/conversations/all?hard=true'
      : '/api/chat/conversations/all';
    
    const response = await this.request<{
      message: string;
      data: { count: number; hard_delete: boolean };
      errors: any;
    }>(url, {
      method: 'DELETE',
    });

    if (response.errors) {
      throw new Error(response.errors?.detail || 'Failed to delete conversations');
    }

    return {
      message: response.message || 'Conversations deleted successfully',
      count: response.data?.count || 0,
      hard_delete: response.data?.hard_delete || hardDelete,
    };
  }
}

export const apiService = new ApiService();

