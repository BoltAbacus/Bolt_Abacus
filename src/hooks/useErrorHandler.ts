import { useCallback } from 'react';
import { isAxiosError } from 'axios';

interface ErrorHandlerOptions {
  onError?: (error: Error) => void;
  logToConsole?: boolean;
  logToService?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { onError, logToConsole = true, logToService = true } = options;

  const handleError = useCallback((error: Error, context?: string) => {
    // Log to console if enabled
    if (logToConsole) {
      console.group(`🚨 Error Handler${context ? ` - ${context}` : ''}`);
      console.error('Error:', error);
      
      if (isAxiosError(error)) {
        console.error('Axios Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data,
        });
      }
      
      console.groupEnd();
    }

    // Log to external service if enabled
    if (logToService && process.env.NODE_ENV === 'production') {
      try {
        const errorData = {
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          isAxiosError: isAxiosError(error),
          axiosErrorData: isAxiosError(error) ? {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
          } : null,
        };

        // Example: Send to your error tracking service
        // errorTrackingService.captureException(error, { extra: errorData });
        
        console.error('Error logged to service:', errorData);
      } catch (loggingError) {
        console.error('Failed to log error to service:', loggingError);
      }
    }

    // Call custom error handler
    onError?.(error);
  }, [onError, logToConsole, logToService]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};

export default useErrorHandler;
