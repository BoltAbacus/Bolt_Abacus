import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { useApiDebounce } from './useApiDebounce';

interface SearchOptions<T> {
  debounceMs?: number;
  minLength?: number;
  onResults?: (results: T[]) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface SearchState<T> {
  query: string;
  results: T[];
  loading: boolean;
  error: Error | null;
  hasSearched: boolean;
}

/**
 * Hook for debounced search functionality
 * @param searchFunction - The search API function
 * @param options - Configuration options
 * @returns Search state and controls
 */
export function useSearch<T = any>(
  searchFunction: (query: string) => Promise<T[]>,
  options: SearchOptions<T> = {}
) {
  const {
    debounceMs = 300,
    minLength = 2,
    onResults,
    onError,
    enabled = true,
  } = options;

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  const {
    data: results,
    loading,
    error,
    execute: executeSearch,
    reset: resetSearch,
  } = useApiDebounce(searchFunction, {
    debounceMs: 0, // We handle debouncing at the query level
    onSuccess: onResults,
    onError,
    enabled,
  });

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= minLength) {
      executeSearch(debouncedQuery);
    } else if (debouncedQuery.length === 0) {
      resetSearch();
    }
  }, [debouncedQuery, minLength, executeSearch, resetSearch]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    resetSearch();
  }, [resetSearch]);

  const hasSearched = query.length >= minLength;

  return {
    query,
    results: results || [],
    loading,
    error,
    hasSearched,
    updateQuery,
    clearSearch,
    isEnabled: enabled,
  };
}

export default useSearch;
