/**
 * Tests for API service
 */
import { apiService, ShlokaWithExplanation, Explanation } from '../api';

// Mock fetch globally
declare const global: any;
global.fetch = jest.fn();

describe('ApiService', () => {
  const mockBaseUrl = 'http://localhost:8000';

  beforeEach(() => {
    apiService.setBaseUrl(mockBaseUrl);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Authentication', () => {
    it('should set and get access token', () => {
      const token = 'test-token';
      apiService.setAccessToken(token);
      expect(apiService.getAccessToken()).toBe(token);
    });

    it('should handle null access token', () => {
      apiService.setAccessToken(null);
      expect(apiService.getAccessToken()).toBeNull();
    });

    it('should set refresh token callback', () => {
      const callback = jest.fn();
      apiService.setRefreshTokenCallback(callback);
      // Callback is stored internally, we can't directly test it
      // but we can verify it doesn't throw
      expect(() => apiService.setRefreshTokenCallback(callback)).not.toThrow();
    });
  });

  describe('testConnection', () => {
    it('should return true on successful connection', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: 'API is healthy' }),
      });

      const result = await apiService.testConnection();
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/health`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return false on failed connection', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('signup', () => {
    it('should successfully signup a user', async () => {
      const mockResponse = {
        message: 'User created successfully',
        data: {
          user: {
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
          },
          tokens: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
        },
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await apiService.signup(
        'Test User',
        'test@example.com',
        'password123',
        'password123'
      );

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.access).toBe('access-token');
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/auth/signup`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            password_confirm: 'password123',
          }),
        })
      );
    });

    it('should throw error on signup failure', async () => {
      const mockResponse = {
        message: 'Validation error',
        data: null,
        errors: { email: ['Email already exists'] },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockResponse,
      });

      await expect(
        apiService.signup('Test', 'test@example.com', 'pass', 'pass')
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const mockResponse = {
        message: 'Login successful',
        data: {
          user: {
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
          },
          tokens: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
        },
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiService.login('test@example.com', 'password123');

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.access).toBe('access-token');
    });

    it('should throw error on login failure', async () => {
      const mockResponse = {
        message: 'Invalid credentials',
        data: null,
        errors: { detail: 'Invalid email or password' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockResponse,
      });

      await expect(
        apiService.login('test@example.com', 'wrongpass')
      ).rejects.toThrow();
    });
  });

  describe('getRandomShloka', () => {
    it('should fetch a random shloka', async () => {
      const mockShloka: ShlokaWithExplanation = {
        shloka: {
          id: 'shloka-id',
          book_name: 'Bhagavad Gita',
          chapter_number: 1,
          verse_number: 1,
          sanskrit_text: 'Test text',
          transliteration: 'test',
        },
        explanation: {
          id: 'explanation-id',
          shloka_id: 'shloka-id',
          explanation_type: 'summary',
          explanation_text: 'Summary explanation',
        } as Explanation,
      };

      const mockResponse = {
        message: 'Random shloka retrieved successfully',
        data: mockShloka,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      const result = await apiService.getRandomShloka();

      expect(result.shloka.id).toBe('shloka-id');
      expect(result.shloka.book_name).toBe('Bhagavad Gita');
      expect(result.explanation?.explanation_text).toBe('Summary explanation');
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/shlokas/random`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('getShlokaById', () => {
    it('should fetch a shloka by ID', async () => {
      const shlokaId = 'shloka-id-123';
      const mockShloka: ShlokaWithExplanation = {
        shloka: {
          id: shlokaId,
          book_name: 'Bhagavad Gita',
          chapter_number: 1,
          verse_number: 1,
          sanskrit_text: 'Test text',
        },
      };

      const mockResponse = {
        message: 'Shloka retrieved successfully',
        data: mockShloka,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      const result = await apiService.getShlokaById(shlokaId);

      expect(result.shloka.id).toBe(shlokaId);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/shlokas/${shlokaId}`,
        expect.any(Object)
      );
    });
  });

  describe('getUserStats', () => {
    it('should fetch user stats', async () => {
      const mockStats = {
        level: 5,
        experience: 250,
        current_streak: 7,
        total_shlokas_read: 10,
        total_readings: 15,
      };

      const mockResponse = {
        message: 'User statistics retrieved successfully',
        data: mockStats,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      const result = await apiService.getUserStats();

      expect(result.level).toBe(5);
      expect(result.experience).toBe(250);
      expect(result.current_streak).toBe(7);
    });
  });

  describe('Favorites', () => {
    it('should get favorites list', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          shloka: {
            id: 'shloka-1',
            book_name: 'Bhagavad Gita',
            chapter_number: 1,
            verse_number: 1,
            sanskrit_text: 'Test',
          },
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        message: 'Favorites retrieved successfully',
        data: mockFavorites,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      const result = await apiService.getFavorites();

      expect(result).toHaveLength(1);
      expect(result[0].shloka.book_name).toBe('Bhagavad Gita');
    });

    it('should add a favorite', async () => {
      const shlokaId = 'shloka-id';
      const mockFavorite = {
        id: 'fav-1',
        shloka: {
          id: shlokaId,
          book_name: 'Bhagavad Gita',
          chapter_number: 1,
          verse_number: 1,
          sanskrit_text: 'Test',
        },
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        message: 'Favorite added successfully',
        data: mockFavorite,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      const result = await apiService.addFavorite(shlokaId);

      expect(result.shloka.id).toBe(shlokaId);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/favorites`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ shloka_id: shlokaId }),
        })
      );
    });

    it('should remove a favorite', async () => {
      const shlokaId = 'shloka-id';

      const mockResponse = {
        message: 'Favorite removed successfully',
        data: null,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      await apiService.removeFavorite(shlokaId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/favorites?shloka_id=${shlokaId}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Achievements', () => {
    it('should get achievements list', async () => {
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

      const mockResponse = {
        message: 'Achievements retrieved successfully',
        data: mockAchievements,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      const result = await apiService.getAchievements();

      expect(result).toHaveLength(1);
      expect(result[0].achievement.name).toBe('First Steps');
    });
  });

  describe('Chat', () => {
    it('should get conversations list', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          title: 'Test Conversation',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        message: 'Conversations retrieved successfully',
        data: mockConversations,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      const result = await apiService.getConversations();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Conversation');
    });

    it('should send a chat message', async () => {
      const mockResponse = {
        message: 'Message sent successfully',
        data: {
          conversation: {
            id: 'conv-1',
            title: 'Test',
            messages: [
              { role: 'user', content: 'Hello' },
              { role: 'assistant', content: 'Hi there!' },
            ],
          },
          response: 'Hi there!',
        },
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      const result = await apiService.sendChatMessage('Hello');

      expect(result.response).toBe('Hi there!');
      expect(result.conversation.messages).toHaveLength(2);
    });
  });

  describe('createReadingLog', () => {
    it('should create a reading log', async () => {
      const shlokaId = 'shloka-id';
      const mockLog = {
        id: 'log-1',
        shloka: shlokaId,
        reading_type: 'summary',
        read_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        message: 'Reading log created successfully',
        data: mockLog,
        errors: null,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
        headers: new Headers(),
      });

      apiService.setAccessToken('test-token');
      await apiService.logReading(shlokaId, 'summary');

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/reading-logs`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            shloka_id: shlokaId,
            reading_type: 'summary',
          }),
        })
      );
    });
  });
});

