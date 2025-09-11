import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
}

interface OfflineOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  onReconnect?: () => void;
}

/**
 * Hook for managing offline state and connectivity
 * @param options - Configuration options
 * @returns Offline state and utilities
 */
export function useOffline(options: OfflineOptions = {}) {
  const { onOnline, onOffline, onReconnect } = options;
  
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    wasOffline: false,
  });

  const handleOnline = useCallback(() => {
    setState(prev => ({
      isOnline: true,
      isOffline: false,
      wasOffline: prev.isOffline,
    }));
    
    onOnline?.();
    
    if (state.wasOffline) {
      onReconnect?.();
    }
  }, [onOnline, onReconnect, state.wasOffline]);

  const handleOffline = useCallback(() => {
    setState(prev => ({
      isOnline: false,
      isOffline: true,
      wasOffline: prev.wasOffline,
    }));
    
    onOffline?.();
  }, [onOffline]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    ...state,
    checkConnectivity,
  };
}

export default useOffline;
