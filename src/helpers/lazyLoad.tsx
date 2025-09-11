import React, { Suspense, ComponentType, lazy } from 'react';
import LoadingSpinner from '@components/atoms/LoadingSpinner';
import ErrorBoundary from '@components/atoms/ErrorBoundary';

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Higher-order component for lazy loading with error boundary and loading fallback
 */
export function withLazyLoad<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: LazyLoadOptions = {}
) {
  const {
    fallback = <LoadingSpinner size="lg" message="Loading..." />,
    errorFallback,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const LazyComponent = lazy(importFunc);

  const LazyWrapper: React.FC<P> = (props) => {
    return (
      <ErrorBoundary
        fallback={errorFallback}
        onError={(error) => {
          console.error('Lazy load error:', error);
        }}
      >
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  LazyWrapper.displayName = `withLazyLoad(${LazyComponent.displayName || 'Component'})`;

  return LazyWrapper;
}

/**
 * Hook for lazy loading with retry functionality
 */
export function useLazyLoad<T>(
  importFunc: () => Promise<T>,
  options: { retryCount?: number; retryDelay?: number } = {}
) {
  const { retryCount = 3, retryDelay = 1000 } = options;
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const load = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const data = await importFunc();
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    setState(prev => ({ ...prev, loading: false, error: lastError }));
    throw lastError;
  }, [importFunc, retryCount, retryDelay]);

  return { ...state, load };
}

/**
 * Preload a module for faster subsequent loading
 */
export function preloadModule<T>(
  importFunc: () => Promise<T>,
  options: { timeout?: number } = {}
): Promise<T> {
  const { timeout = 5000 } = options;
  
  return Promise.race([
    importFunc(),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Preload timeout')), timeout)
    ),
  ]);
}

/**
 * Create a lazy component with preloading
 */
export function createLazyComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: LazyLoadOptions & { preload?: boolean } = {}
) {
  const { preload = false, ...lazyOptions } = options;
  
  const LazyComponent = withLazyLoad(importFunc, lazyOptions);
  
  if (preload) {
    // Preload the module
    preloadModule(importFunc).catch(console.warn);
  }
  
  return LazyComponent;
}

export default withLazyLoad;
