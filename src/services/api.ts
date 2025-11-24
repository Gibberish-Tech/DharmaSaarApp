/**
 * API service for communicating with the backend
 */
import { apiConfig } from '../config/api';

export interface Shloka {
  id: string; // UUID as string from JSON
  book_name: string;
  chapter_number: number;
  verse_number: number;
  sanskrit_text: string;
  transliteration?: string | null;
  created_at?: string | null; // ISO 8601 datetime string, optional
  updated_at?: string | null; // ISO 8601 datetime string, optional
}

export interface Explanation {
  id: string; // UUID as string from JSON
  shloka_id: string; // UUID as string from JSON
  explanation_type: 'summary' | 'detailed';
  explanation_text: string;
  ai_model_used?: string | null;
  generation_prompt?: string | null;
  created_at?: string | null; // ISO 8601 datetime string, optional
  updated_at?: string | null; // ISO 8601 datetime string, optional
}

export interface ShlokaWithExplanation {
  shloka: Shloka;
  summary?: Explanation;
  detailed?: Explanation;
}

export interface ApiError {
  error: string;
  detail?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = apiConfig.baseUrl;
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
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
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
        
        // Retry on server errors (5xx) or network errors
        const shouldRetry = 
          (response.status >= 500 || response.status === 0) &&
          retryCount < apiConfig.retry.maxAttempts;
        
        if (shouldRetry) {
          await new Promise<void>(resolve => setTimeout(() => resolve(), apiConfig.retry.delay));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: The server took too long to respond');
      }
      
      // Retry on network errors
      if (retryCount < apiConfig.retry.maxAttempts) {
        await new Promise<void>(resolve => setTimeout(() => resolve(), apiConfig.retry.delay));
        return this.request<T>(endpoint, options, retryCount + 1);
      }
      
      if (error instanceof Error) {
        // Provide more helpful error messages
        if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
          throw new Error(
            `Cannot connect to server at ${this.baseUrl}. ` +
            `Please ensure the backend is running and the URL is correct.`
          );
        }
        throw error;
      }
      throw new Error('Network error: Unable to connect to server');
    }
  }

  /**
   * Get a random shloka with both summary and detailed explanations
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
   * Get a specific shloka by ID with both summary and detailed explanations
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
}

export const apiService = new ApiService();

