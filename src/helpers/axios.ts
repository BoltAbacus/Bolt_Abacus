import axios from 'axios';
import { useAuthStore } from '@store/authStore';
import { apiCache } from './cacheManager';

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();
const CACHE_DURATION = 5000; // 5 seconds

const customAxios = axios.create({
  baseURL: (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://api2.boltabacus.com',
  // Credentials (cookies) are not needed; we authenticate via header tokens.
  // Keeping this false prevents CORS "Network Error" when the server doesn't allow credentials.
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  // Some hosts (e.g., Render) can cold-start; use a generous timeout
  timeout: 120000,
});

// Simple, safe stringify for logging arbitrary values (avoids circular errors)
function safeStringify(value: unknown): string {
  try {
    if (value instanceof Error) {
      return JSON.stringify({
        name: value.name,
        message: value.message,
        stack: value.stack,
      });
    }
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// Helper function to create cache key
function createCacheKey(config: any): string {
  const { method, url, params, data } = config;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
}

// Helper function to check if request should be deduplicated
function shouldDeduplicate(config: any): boolean {
  // Only deduplicate GET requests
  return config.method?.toLowerCase() === 'get';
}

// Helper function to check if request should be cached
function shouldCache(config: any): boolean {
  // Only cache GET requests
  return config.method?.toLowerCase() === 'get';
}

customAxios.interceptors.request.use(
  (config) => {
    try {
      console.log('📤 [Axios] Request →', config.method?.toUpperCase(), config.url, {
        headers: config.headers,
        params: config.params,
        hasData: !!config.data,
      });

      // Check cache for GET requests
      if (shouldCache(config)) {
        const cacheKey = createCacheKey(config);
        const cachedResponse = apiCache.get(cacheKey);
        
        if (cachedResponse) {
          console.log('💾 [Axios] Using cached response:', cacheKey);
          // Return a promise that resolves with cached data
          return Promise.resolve({
            ...config,
            cached: true,
            data: cachedResponse,
          });
        }
      }

      // Request deduplication for GET requests
      if (shouldDeduplicate(config)) {
        const cacheKey = createCacheKey(config);
        const cachedRequest = requestCache.get(cacheKey);
        
        if (cachedRequest) {
          console.log('🔄 [Axios] Deduplicating request:', cacheKey);
          return cachedRequest;
        }

        // Create new request and cache it
        const requestPromise = Promise.resolve(config);
        requestCache.set(cacheKey, requestPromise);
        
        // Remove from cache after duration
        setTimeout(() => {
          requestCache.delete(cacheKey);
        }, CACHE_DURATION);
      }
    } catch {}
    return config;
  },
  (error) => {
    console.error('❌ [Axios] Request Error →', safeStringify(error));
    return Promise.reject(error);
  }
);

customAxios.interceptors.response.use(
  (response) => {
    try {
      console.log('📥 [Axios] Response ←', response.status, response.config.url, {
        data: response.data,
        cached: response.config.cached,
      });

      // Cache successful GET responses
      if (shouldCache(response.config) && response.status === 200 && !response.config.cached) {
        const cacheKey = createCacheKey(response.config);
        apiCache.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes
        console.log('💾 [Axios] Cached response:', cacheKey);
      }
    } catch {}
    return response;
  },
  async (error) => {
    // Normalize common Axios error shape for easier debugging
    const status = error?.response?.status;
    const url = error?.config?.url;
    const method = error?.config?.method;
    const data = error?.response?.data;
    const code = error?.code;

    console.error('💥 [Axios] Response Error ←', { status, method, url, data, code });

    // Only force logout on explicit 401 (unauthorized) with token-not-valid.
    // Avoid logging out on 403 to prevent ejecting users due to endpoint-specific permissions.
    const isTokenNotValid =
      (status === 401) && (
        data?.code === 'token_not_valid' ||
        data?.detail?.toString()?.toLowerCase()?.includes('token')
      );

    if (isTokenNotValid) {
      try {
        console.warn('[Auth] Invalid or missing token. Logging out.');
        useAuthStore.getState().logout();
      } catch {}
      return Promise.reject(error);
    }

    // Retry on timeouts / network errors up to 3 times with exponential backoff
    const config = error.config || {};
    config.__retryCount = config.__retryCount || 0;
    const shouldRetry = (code === 'ECONNABORTED' || code === 'ERR_NETWORK' || typeof status === 'undefined') && config.__retryCount < 3;

    if (shouldRetry) {
      config.__retryCount += 1;
      const delayMs = Math.min(15000, 1000 * Math.pow(2, config.__retryCount));
      console.warn(`⏳ [Axios] Retry ${config.__retryCount}/3 in ${delayMs}ms →`, method?.toUpperCase(), url);
      await new Promise((r) => setTimeout(r, delayMs));
      return customAxios(config);
    }

    return Promise.reject(error);
  }
);

export default customAxios;
