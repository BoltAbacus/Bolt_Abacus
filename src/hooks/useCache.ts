import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache, userCache, sessionCache, CacheManager } from '@helpers/cacheManager';

interface UseCacheOptions {
  ttl?: number;
  cache?: CacheManager;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

interface CacheState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fromCache: boolean;
}

/**
 * Hook for managing cached data with automatic fetching and cache management
 */
export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const {
    ttl,
    cache = apiCache,
    enabled = true,
    onError,
  } = options;

  const [state, setState] = useState<CacheState<T>>({
    data: null,
    loading: false,
    error: null,
    fromCache: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = cache.get<T>(key);
      if (cachedData) {
        setState({
          data: cachedData,
          loading: false,
          error: null,
          fromCache: true,
        });
        return cachedData;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      fromCache: false,
    }));

    try {
      const data = await fetchFn();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      // Cache the data
      cache.set(key, data, ttl);

      setState({
        data,
        loading: false,
        error: null,
        fromCache: false,
      });

      return data;
    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const err = error as Error;
      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
        fromCache: false,
      }));

      onError?.(err);
      return null;
    }
  }, [key, fetchFn, cache, ttl, enabled, onError]);

  const invalidate = useCallback(() => {
    cache.delete(key);
    setState(prev => ({
      ...prev,
      data: null,
      fromCache: false,
    }));
  }, [key, cache]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    fetch: fetchData,
    invalidate,
    refresh,
  };
}

/**
 * Hook for simple cache operations
 */
export function useCacheOperations<T>(cache: CacheManager = apiCache) {
  const set = useCallback((key: string, data: T, ttl?: number) => {
    cache.set(key, data, ttl);
  }, [cache]);

  const get = useCallback((key: string): T | null => {
    return cache.get<T>(key);
  }, [cache]);

  const remove = useCallback((key: string) => {
    cache.delete(key);
  }, [cache]);

  const clear = useCallback(() => {
    cache.clear();
  }, [cache]);

  const has = useCallback((key: string): boolean => {
    return cache.has(key);
  }, [cache]);

  const getStats = useCallback(() => {
    return cache.getStats();
  }, [cache]);

  return {
    set,
    get,
    remove,
    clear,
    has,
    getStats,
  };
}

export default useCache;
