import { useState, useRef, useCallback, useEffect } from 'react';
import { useDebouncedCallback } from './useDebounce';
import { useErrorHandler } from './useErrorHandler';

interface ApiRequestOptions {
  debounceMs?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for debounced API requests
 * @param apiFunction - The API function to call
 * @param options - Configuration options
 * @returns Object with debounced function and state
 */
export function useApiDebounce<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiRequestOptions = {}
) {
  const {
    debounceMs = 300,
    onSuccess,
    onError,
    enabled = true,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { handleError } = useErrorHandler();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const executeRequest = useCallback(async (...args: any[]) => {
    if (!enabled) return;

    // Cancel previous request
    cleanup();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(...args);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setState({
        data: result,
        loading: false,
        error: null,
      });

      onSuccess?.(result);
    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const err = error as Error;
      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
      }));

      handleError(err, 'API Request');
      onError?.(err);
    }
  }, [apiFunction, enabled, onSuccess, onError, handleError, cleanup]);

  const debouncedExecute = useDebouncedCallback(
    executeRequest,
    debounceMs,
    [executeRequest, debounceMs]
  );

  const reset = useCallback(() => {
    cleanup();
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, [cleanup]);

  return {
    ...state,
    execute: debouncedExecute,
    reset,
    isEnabled: enabled,
  };
}

export default useApiDebounce;
