import { useEffect, useRef, useCallback } from 'react';

type CleanupFunction = () => void;
type CleanupItem = CleanupFunction | { cleanup: CleanupFunction };

/**
 * Hook for managing cleanup functions in useEffect
 */
export function useCleanup() {
  const cleanupRef = useRef<CleanupItem[]>([]);

  const addCleanup = useCallback((cleanup: CleanupFunction | CleanupItem) => {
    cleanupRef.current.push(cleanup);
  }, []);

  const removeCleanup = useCallback((cleanup: CleanupFunction | CleanupItem) => {
    const index = cleanupRef.current.indexOf(cleanup);
    if (index > -1) {
      cleanupRef.current.splice(index, 1);
    }
  }, []);

  const executeCleanup = useCallback(() => {
    cleanupRef.current.forEach(item => {
      try {
        if (typeof item === 'function') {
          item();
        } else if (item && typeof item.cleanup === 'function') {
          item.cleanup();
        }
      } catch (error) {
        console.error('Cleanup function error:', error);
      }
    });
    cleanupRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return executeCleanup;
  }, [executeCleanup]);

  return {
    addCleanup,
    removeCleanup,
    executeCleanup,
  };
}

/**
 * Hook for managing timeouts with automatic cleanup
 */
export function useTimeout() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const setTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeoutId = global.setTimeout(() => {
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);
    
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  const clearTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    global.clearTimeout(timeoutId);
    timeoutsRef.current.delete(timeoutId);
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeoutId => {
      global.clearTimeout(timeoutId);
    });
    timeoutsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearAllTimeouts;
  }, [clearAllTimeouts]);

  return {
    setTimeout,
    clearTimeout,
    clearAllTimeouts,
  };
}

/**
 * Hook for managing intervals with automatic cleanup
 */
export function useInterval() {
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const setInterval = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const intervalId = global.setInterval(callback, delay);
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  const clearInterval = useCallback((intervalId: NodeJS.Timeout) => {
    global.clearInterval(intervalId);
    intervalsRef.current.delete(intervalId);
  }, []);

  const clearAllIntervals = useCallback(() => {
    intervalsRef.current.forEach(intervalId => {
      global.clearInterval(intervalId);
    });
    intervalsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearAllIntervals;
  }, [clearAllIntervals]);

  return {
    setInterval,
    clearInterval,
    clearAllIntervals,
  };
}

/**
 * Hook for managing event listeners with automatic cleanup
 */
export function useEventListener() {
  const listenersRef = useRef<Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }>>([]);

  const addEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    listenersRef.current.push({ element, event, handler, options });
  }, []);

  const removeEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.removeEventListener(event, handler, options);
    const index = listenersRef.current.findIndex(
      listener => 
        listener.element === element && 
        listener.event === event && 
        listener.handler === handler
    );
    if (index > -1) {
      listenersRef.current.splice(index, 1);
    }
  }, []);

  const removeAllEventListeners = useCallback(() => {
    listenersRef.current.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    listenersRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return removeAllEventListeners;
  }, [removeAllEventListeners]);

  return {
    addEventListener,
    removeEventListener,
    removeAllEventListeners,
  };
}

/**
 * Hook for managing AbortController with automatic cleanup
 */
export function useAbortController() {
  const controllersRef = useRef<Set<AbortController>>(new Set());

  const createController = useCallback((): AbortController => {
    const controller = new AbortController();
    controllersRef.current.add(controller);
    return controller;
  }, []);

  const abortController = useCallback((controller: AbortController) => {
    controller.abort();
    controllersRef.current.delete(controller);
  }, []);

  const abortAllControllers = useCallback(() => {
    controllersRef.current.forEach(controller => {
      controller.abort();
    });
    controllersRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return abortAllControllers;
  }, [abortAllControllers]);

  return {
    createController,
    abortController,
    abortAllControllers,
  };
}

/**
 * Hook for managing subscriptions with automatic cleanup
 */
export function useSubscription() {
  const subscriptionsRef = useRef<Set<{ unsubscribe: () => void }>>(new Set());

  const addSubscription = useCallback((subscription: { unsubscribe: () => void }) => {
    subscriptionsRef.current.add(subscription);
    return subscription;
  }, []);

  const removeSubscription = useCallback((subscription: { unsubscribe: () => void }) => {
    subscription.unsubscribe();
    subscriptionsRef.current.delete(subscription);
  }, []);

  const removeAllSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach(subscription => {
      subscription.unsubscribe();
    });
    subscriptionsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return removeAllSubscriptions;
  }, [removeAllSubscriptions]);

  return {
    addSubscription,
    removeSubscription,
    removeAllSubscriptions,
  };
}

/**
 * Comprehensive cleanup hook that combines all cleanup utilities
 */
export function useComprehensiveCleanup() {
  const cleanup = useCleanup();
  const timeout = useTimeout();
  const interval = useInterval();
  const eventListener = useEventListener();
  const abortController = useAbortController();
  const subscription = useSubscription();

  const cleanupAll = useCallback(() => {
    cleanup.executeCleanup();
    timeout.clearAllTimeouts();
    interval.clearAllIntervals();
    eventListener.removeAllEventListeners();
    abortController.abortAllControllers();
    subscription.removeAllSubscriptions();
  }, [cleanup, timeout, interval, eventListener, abortController, subscription]);

  return {
    ...cleanup,
    ...timeout,
    ...interval,
    ...eventListener,
    ...abortController,
    ...subscription,
    cleanupAll,
  };
}

export default useCleanup;
