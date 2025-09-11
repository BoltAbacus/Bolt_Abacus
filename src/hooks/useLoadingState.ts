import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  progress?: number;
  message?: string;
}

interface LoadingOptions {
  initialLoading?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  onComplete?: () => void;
}

/**
 * Hook for managing loading states with progress tracking
 * @param options - Configuration options
 * @returns Loading state and control functions
 */
export function useLoadingState(options: LoadingOptions = {}) {
  const { initialLoading = false, onError, onSuccess, onComplete } = options;
  
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    progress: undefined,
    message: undefined,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const setLoading = useCallback((loading: boolean, message?: string) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      message,
      error: loading ? null : prev.error, // Clear error when starting to load
    }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      progress: undefined,
    }));

    if (error) {
      onError?.(error);
    }
  }, [onError]);

  const setSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: null,
      progress: 100,
    }));
    onSuccess?.();
  }, [onSuccess]);

  const reset = useCallback(() => {
    cleanup();
    setState({
      isLoading: false,
      error: null,
      progress: undefined,
      message: undefined,
    });
  }, [cleanup]);

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      message?: string;
      timeout?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<T | null> => {
    const { message, timeout = 30000, onProgress } = options;

    // Cancel previous request
    cleanup();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true, message);

    // Set timeout
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setError(new Error('Request timeout'));
        }
      }, timeout);
    }

    try {
      const result = await asyncFn();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      setSuccess();
      onComplete?.();
      return result;
    } catch (error) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const err = error as Error;
      setError(err);
      return null;
    }
  }, [cleanup, setLoading, setSuccess, setError, onComplete]);

  const withLoading = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: {
      message?: string;
      timeout?: number;
    } = {}
  ): T => {
    return (async (...args: Parameters<T>) => {
      return executeAsync(() => fn(...args), options);
    }) as T;
  }, [executeAsync]);

  return {
    ...state,
    setLoading,
    setProgress,
    setError,
    setSuccess,
    reset,
    executeAsync,
    withLoading,
    isAborted: abortControllerRef.current?.signal.aborted || false,
  };
}

export default useLoadingState;
