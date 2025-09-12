import { lazy, ComponentType } from 'react';

/**
 * Higher-order component for lazy loading with error boundary
 * @param importFunc - Function that returns a dynamic import
 * @returns Lazy-loaded component
 */
export const withLazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return lazy(() => 
    importFunc().catch((error) => {
      console.error('Failed to load module:', error);
      // Return a fallback component or rethrow the error
      throw error;
    })
  );
};
