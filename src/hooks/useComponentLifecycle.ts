import { useEffect, useRef, useCallback, useState } from 'react';
import { useComprehensiveCleanup } from './useCleanup';

interface ComponentLifecycleOptions {
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: () => void;
  dependencies?: React.DependencyList;
}

/**
 * Hook for managing component lifecycle with proper cleanup
 */
export function useComponentLifecycle(options: ComponentLifecycleOptions = {}) {
  const { onMount, onUnmount, onUpdate, dependencies = [] } = options;
  const isMountedRef = useRef(false);
  const cleanup = useComprehensiveCleanup();

  // Mount effect
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      onMount?.();
    }
  }, []);

  // Update effect
  useEffect(() => {
    if (isMountedRef.current) {
      onUpdate?.();
    }
  }, dependencies);

  // Unmount effect
  useEffect(() => {
    return () => {
      if (isMountedRef.current) {
        isMountedRef.current = false;
        onUnmount?.();
        cleanup.cleanupAll();
      }
    };
  }, [onUnmount, cleanup]);

  const isMounted = useCallback(() => isMountedRef.current, []);

  return {
    isMounted,
    ...cleanup,
  };
}

/**
 * Hook for managing async operations with proper cleanup
 */
export function useAsyncOperation<T>() {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const { createController, abortController } = useAbortController();
  const isMountedRef = useRef(true);

  const execute = useCallback(async (
    asyncFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    // Cancel previous operation
    if (state.loading) {
      return null;
    }

    const controller = createController();
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result = await asyncFn(controller.signal);
      
      if (isMountedRef.current) {
        setState({
          data: result,
          loading: false,
          error: null,
        });
      }
      
      return result;
    } catch (error) {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
      }
      return null;
    } finally {
      abortController(controller);
    }
  }, [state.loading, createController, abortController]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for managing component visibility with cleanup
 */
export function useVisibilityChange() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const { addEventListener, removeEventListener } = useEventListener();

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    addEventListener(document, 'visibilitychange', handleVisibilityChange);

    return () => {
      removeEventListener(document, 'visibilitychange', handleVisibilityChange);
    };
  }, [addEventListener, removeEventListener]);

  return isVisible;
}

/**
 * Hook for managing window focus with cleanup
 */
export function useWindowFocus() {
  const [isFocused, setIsFocused] = useState(document.hasFocus());
  const { addEventListener, removeEventListener } = useEventListener();

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    addEventListener(window, 'focus', handleFocus);
    addEventListener(window, 'blur', handleBlur);

    return () => {
      removeEventListener(window, 'focus', handleFocus);
      removeEventListener(window, 'blur', handleBlur);
    };
  }, [addEventListener, removeEventListener]);

  return isFocused;
}

/**
 * Hook for managing resize events with cleanup
 */
export function useWindowResize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const { addEventListener, removeEventListener } = useEventListener();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    addEventListener(window, 'resize', handleResize);

    return () => {
      removeEventListener(window, 'resize', handleResize);
    };
  }, [addEventListener, removeEventListener]);

  return windowSize;
}

export default useComponentLifecycle;
