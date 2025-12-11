/**
 * Custom hook for fetching and managing shlokas
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { KnowledgeItem } from '../data/mockKnowledge';
import { convertShlokaToKnowledgeItem } from '../utils/shlokaConverter';

interface UseShlokasReturn {
  shlokas: KnowledgeItem[];
  loading: boolean;
  error: string | null;
  fetchNextShloka: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useShlokas(initialCount: number = 5): UseShlokasReturn {
  const [shlokas, setShlokas] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Use ref instead of state to avoid circular dependencies in useCallback
  const loadedIdsRef = useRef<Set<string>>(new Set());

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await apiService.testConnection();
        if (!isConnected) {
          setError(
            `Cannot connect to API at ${apiService.getBaseUrl()}. ` +
            `Please ensure the backend server is running.`
          );
        }
      } catch (err) {
        console.warn('Connection test failed:', err);
        // Don't set error here, let the actual API call handle it
      }
    };
    testConnection();
  }, []);

  const fetchShloka = useCallback(async (): Promise<KnowledgeItem | null> => {
    try {
      const data = await apiService.getRandomShloka();
      
      // Check if we've already loaded this shloka
      if (loadedIdsRef.current.has(data.shloka.id)) {
        // Try again with a different random shloka
        return null;
      }

      const knowledgeItem = convertShlokaToKnowledgeItem(data);
      // Update ref instead of state to avoid triggering re-renders
      loadedIdsRef.current.add(data.shloka.id);
      return knowledgeItem;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch shloka';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const fetchNextShloka = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch a new shloka (retry if duplicate)
      let attempts = 0;
      let newShloka: KnowledgeItem | null = null;

      while (!newShloka && attempts < 5) {
        newShloka = await fetchShloka();
        attempts++;
      }

      if (newShloka) {
        setShlokas((prev) => [...prev, newShloka!]);
      } else {
        setError('Unable to fetch new shloka. Please try again.');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch shloka';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchShloka]);

  const loadInitialShlokas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Reset the ref instead of state
      loadedIdsRef.current = new Set();
      setShlokas([]);

      const promises = Array.from({ length: initialCount }, () => fetchShloka());
      const results = await Promise.allSettled(promises);

      const successfulShlokas = results
        .filter(
          (result): result is PromiseFulfilledResult<KnowledgeItem> =>
            result.status === 'fulfilled' && result.value !== null
        )
        .map((result) => result.value);

      if (successfulShlokas.length === 0) {
        setError('No shlokas could be loaded. Please check your connection.');
      } else {
        setShlokas(successfulShlokas);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load shlokas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initialCount, fetchShloka]);

  const refresh = useCallback(async () => {
    await loadInitialShlokas();
  }, [loadInitialShlokas]);

  useEffect(() => {
    loadInitialShlokas();
  }, [loadInitialShlokas]);

  return {
    shlokas,
    loading,
    error,
    fetchNextShloka,
    refresh,
  };
}

